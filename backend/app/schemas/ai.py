from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class AITutorMessage(BaseModel):
    role: str  # user | assistant
    content: str


class AITutorRequest(BaseModel):
    prompt: str = Field(..., min_length=2, max_length=3000)
    course_id: Optional[int] = None
    mode: str = Field("EXPLAIN", description="HINT | EXPLAIN | CODE_EXAMPLE | DEBUG")
    difficulty: str = Field("INTERMEDIATE", description="BEGINNER | INTERMEDIATE | ADVANCED")
    history: Optional[List[AITutorMessage]] = None


class AITutorResponse(BaseModel):
    response: str
    mode: str
    difficulty: str
    tokens_used: int
    estimated_cost_usd: float
    model_name: str


class RAGQueryRequest(BaseModel):
    course_id: int
    query: str = Field(..., min_length=2, max_length=500)


class RAGCitation(BaseModel):
    document_id: int
    document_title: str
    source_filename: str
    chunk_index: int
    excerpt: str
    relevance_score: float


class RAGQueryResponse(BaseModel):
    answer: str
    course_id: int
    course_title: str
    citations: List[RAGCitation]
    is_grounded: bool
    tokens_used: int


class GeneratedQuestionItem(BaseModel):
    question_text: str
    question_type: str = "MCQ"
    options: List[Dict[str, Any]]
    correct_answer: str
    points: int = 10
    explanation: Optional[str] = None
    order_index: int = 1


class QuestionGeneratorRequest(BaseModel):
    course_id: int
    topic: str = Field(..., min_length=2, max_length=150)
    difficulty: str = Field("INTERMEDIATE", description="BEGINNER | INTERMEDIATE | ADVANCED")
    count: int = Field(2, ge=1, le=5)
    question_type: str = "MCQ"


class QuestionGeneratorResponse(BaseModel):
    course_id: int
    course_title: str
    topic: str
    difficulty: str
    draft_questions: List[GeneratedQuestionItem]
    review_required: bool = True
    tokens_used: int


class AIUsageStats(BaseModel):
    total_requests: int
    total_tokens_used_today: int
    daily_quota: int
    quota_remaining: int
    total_estimated_cost_usd: float
