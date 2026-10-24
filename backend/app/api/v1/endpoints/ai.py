import re
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.ai_usage import AIUsage
from app.services.ai.factory import get_llm_provider
from app.schemas.ai import (
    AITutorRequest,
    AITutorResponse,
    RAGQueryRequest,
    RAGCitation,
    RAGQueryResponse,
    QuestionGeneratorRequest,
    QuestionGeneratorResponse,
    GeneratedQuestionItem,
    AIUsageStats,
)

router = APIRouter()


def enforce_and_record_ai_quota(
    db: Session,
    user_id: int,
    feature: str,
    tokens: int,
    cost: float,
    model_name: str,
) -> None:
    """Enforce daily token quotas per user and log usage for cost auditing."""
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # Calculate tokens used today
    used_today = (
        db.query(func.coalesce(func.sum(AIUsage.total_tokens), 0))
        .filter(AIUsage.user_id == user_id, AIUsage.created_at >= today_start)
        .scalar()
    )

    if (used_today + tokens) > settings.AI_DAILY_TOKEN_QUOTA_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily AI usage quota of {settings.AI_DAILY_TOKEN_QUOTA_PER_USER:,} tokens exceeded. Quota resets at 00:00 UTC.",
        )

    # Log record
    usage_entry = AIUsage(
        user_id=user_id,
        feature=feature,
        model_name=model_name,
        prompt_tokens=max(1, tokens // 2),
        completion_tokens=max(1, tokens // 2),
        total_tokens=tokens,
        estimated_cost_usd=cost,
    )
    db.add(usage_entry)
    db.commit()


@router.post("/tutor", response_model=AITutorResponse)
async def ai_tutor_chat(
    payload: AITutorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """VIBHA AI Programming & Course Tutor.
    Provides pedagogical guidance, conceptual explanations, or guiding hints based on chosen mode.
    """
    if not settings.AI_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI features are currently disabled in this environment.",
        )

    mode_clean = payload.mode.upper().strip()
    diff_clean = payload.difficulty.upper().strip()

    # Build pedagogical system prompt based on mode
    if mode_clean == "HINT":
        system_prompt = (
            "You are VIBHA AI Tutor in Guiding Hints mode. "
            "Never reveal the full solution code outright. Instead, provide 2-3 conceptual hints, "
            "guiding questions, and step-by-step reasoning strategies to empower the student to solve it."
        )
    elif mode_clean == "CODE_EXAMPLE":
        system_prompt = (
            f"You are VIBHA AI Tutor in Code Example mode. "
            f"Calibrate explanation for a {diff_clean} developer. Provide clean, well-commented, "
            f"minimal production-grade code illustrating the pattern."
        )
    elif mode_clean == "DEBUG":
        system_prompt = (
            "You are VIBHA AI Tutor in Debugging mode. "
            "Help the student troubleshoot their issue by outlining likely failure points, "
            "common gotchas, and logging/inspection techniques."
        )
    else:  # EXPLAIN
        system_prompt = (
            f"You are VIBHA AI Tutor in Concept Explanation mode. "
            f"Provide an authoritative, clear explanation calibrated for a {diff_clean} learner. "
            f"Connect theoretical principles to real-world software engineering practice."
        )

    # Sanitize input against prompt injection
    sanitized_prompt = re.sub(r"(ignore all previous instructions|system override)", "[FILTERED]", payload.prompt, flags=re.I)

    provider = get_llm_provider()
    try:
        result = await provider.generate_response(
            prompt=sanitized_prompt,
            system_prompt=system_prompt,
            max_tokens=800,
            temperature=0.6,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Provider service error: {str(exc)}",
        )

    enforce_and_record_ai_quota(
        db=db,
        user_id=current_user.id,
        feature="AI_TUTOR",
        tokens=result.total_tokens,
        cost=result.estimated_cost_usd,
        model_name=result.model_name,
    )

    return AITutorResponse(
        response=result.text,
        mode=mode_clean,
        difficulty=diff_clean,
        tokens_used=result.total_tokens,
        estimated_cost_usd=result.estimated_cost_usd,
        model_name=result.model_name,
    )


@router.post("/rag", response_model=RAGQueryResponse)
async def course_document_assistant(
    payload: RAGQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Course Document Assistant (RAG).
    Retrieves approved course materials and synthesizes answers strictly grounded in retrieved passages.
    """
    if not settings.AI_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI features are currently disabled.",
        )

    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    # Retrieve approved documents for this course
    approved_docs = (
        db.query(Document)
        .filter(Document.course_id == payload.course_id, Document.is_approved == True)
        .all()
    )

    citations: List[RAGCitation] = []
    retrieved_passages: List[str] = []

    STOP_WORDS = {
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
        "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
        "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had",
        "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how",
        "i", "if", "in", "into", "is", "it", "its", "itself", "me", "more", "most", "my", "myself", "no",
        "nor", "not", "of", "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out",
        "over", "own", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their",
        "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through",
        "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where",
        "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself"
    }

    if approved_docs:
        doc_ids = [d.id for d in approved_docs]
        chunks = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.document_id.in_(doc_ids))
            .all()
        )

        raw_query_words = set(re.findall(r"\w+", payload.query.lower()))
        content_query_words = {w for w in raw_query_words if w not in STOP_WORDS and len(w) > 2}
        effective_query_words = content_query_words if content_query_words else raw_query_words

        # Score chunks by term frequency / keyword overlap
        scored_chunks = []
        for c in chunks:
            chunk_words = set(re.findall(r"\w+", c.content.lower()))
            overlap = len(effective_query_words.intersection(chunk_words))
            if overlap > 0:
                score = round(min(1.0, overlap / max(1, len(effective_query_words))), 2)
                scored_chunks.append((score, c))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_chunks = scored_chunks[:3]

        for score, chk in top_chunks:
            retrieved_passages.append(chk.content)
            doc_obj = next((d for d in approved_docs if d.id == chk.document_id), None)
            citations.append(
                RAGCitation(
                    document_id=chk.document_id,
                    document_title=doc_obj.title if doc_obj else "Course Document",
                    source_filename=doc_obj.source_filename if doc_obj else "reference.md",
                    chunk_index=chk.chunk_index,
                    excerpt=chk.content[:200] + ("..." if len(chk.content) > 200 else ""),
                    relevance_score=score,
                )
            )

    is_grounded = len(citations) > 0
    context_text = "\n---\n".join(retrieved_passages) if is_grounded else "No approved course documents found for this query."

    system_prompt = (
        "You are VIBHA Course Document Assistant. "
        "Answer the user query grounded strictly in the approved course materials provided below. "
        "If the approved material does not cover the query, explicitly state that."
    )
    user_prompt = f"Approved Course Material:\n{context_text}\n\nStudent Query: {payload.query}"

    provider = get_llm_provider()
    result = await provider.generate_response(
        prompt=user_prompt,
        system_prompt=system_prompt,
        max_tokens=600,
        temperature=0.3,
    )

    enforce_and_record_ai_quota(
        db=db,
        user_id=current_user.id,
        feature="DOCUMENT_ASSISTANT",
        tokens=result.total_tokens,
        cost=result.estimated_cost_usd,
        model_name=result.model_name,
    )

    return RAGQueryResponse(
        answer=result.text,
        course_id=course.id,
        course_title=course.title,
        citations=citations,
        is_grounded=is_grounded,
        tokens_used=result.total_tokens,
    )


@router.post("/generate-questions", response_model=QuestionGeneratorResponse)
async def generate_draft_questions(
    payload: QuestionGeneratorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.TRAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN])),
):
    """Question Generator for Faculty & Trainers.
    Generates draft MCQs with difficulty calibration. Drafts strictly require human review before publishing.
    """
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    prompt = (
        f"Generate {payload.count} multiple-choice questions for topic '{payload.topic}' "
        f"at difficulty level '{payload.difficulty}'. Include 4 options (A, B, C, D), the correct answer, "
        f"points (10), and a technical mentor explanation."
    )

    provider = get_llm_provider()
    structured = await provider.generate_structured(
        prompt=prompt,
        system_prompt="You are VIBHA Assessment Engine. Return JSON containing 'questions' list.",
    )

    raw_list = structured.get("questions", [])
    draft_questions: List[GeneratedQuestionItem] = []

    for idx, item in enumerate(raw_list[:payload.count], start=1):
        draft_questions.append(
            GeneratedQuestionItem(
                question_text=item.get("question_text", f"Question on {payload.topic}"),
                question_type="MCQ",
                options=item.get("options", [
                    {"id": "A", "text": "Option A"},
                    {"id": "B", "text": "Option B"},
                    {"id": "C", "text": "Option C"},
                    {"id": "D", "text": "Option D"},
                ]),
                correct_answer=item.get("correct_answer", "A"),
                points=item.get("points", 10),
                explanation=item.get("explanation", "Standard technical explanation."),
                order_index=idx,
            )
        )

    # Usage logging
    est_tokens = len(prompt) // 4 + 300
    enforce_and_record_ai_quota(
        db=db,
        user_id=current_user.id,
        feature="QUESTION_GENERATOR",
        tokens=est_tokens,
        cost=round(est_tokens * 0.0000015, 6),
        model_name="vibha-ai-deterministic-v1",
    )

    return QuestionGeneratorResponse(
        course_id=course.id,
        course_title=course.title,
        topic=payload.topic,
        difficulty=payload.difficulty,
        draft_questions=draft_questions,
        review_required=True,
        tokens_used=est_tokens,
    )


@router.get("/usage", response_model=AIUsageStats)
def get_user_ai_usage_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Query current user's daily token quota consumption and history."""
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    used_today = (
        db.query(func.coalesce(func.sum(AIUsage.total_tokens), 0))
        .filter(AIUsage.user_id == current_user.id, AIUsage.created_at >= today_start)
        .scalar()
    )

    total_requests = (
        db.query(AIUsage)
        .filter(AIUsage.user_id == current_user.id)
        .count()
    )

    total_cost = (
        db.query(func.coalesce(func.sum(AIUsage.estimated_cost_usd), 0.0))
        .filter(AIUsage.user_id == current_user.id)
        .scalar()
    )

    daily_quota = settings.AI_DAILY_TOKEN_QUOTA_PER_USER
    remaining = max(0, daily_quota - used_today)

    return AIUsageStats(
        total_requests=total_requests,
        total_tokens_used_today=used_today,
        daily_quota=daily_quota,
        quota_remaining=remaining,
        total_estimated_cost_usd=round(total_cost, 4),
    )
