import json
from typing import Optional, Dict, Any, Type
from pydantic import BaseModel
from app.services.ai.base import BaseLLMProvider, LLMResult


class MockLLMProvider(BaseLLMProvider):
    """Robust, offline-capable deterministic provider adhering to VIBHA pedagogical standards."""

    def __init__(self, model_name: str = "vibha-ai-deterministic-v1"):
        self.model_name = model_name

    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> LLMResult:
        sys_str = (system_prompt or "").lower()
        prompt_str = prompt.lower()

        # Feature 1: AI Tutor Hint Mode
        if "hint" in sys_str or "hint mode" in prompt_str:
            reply = (
                "### 💡 VIBHA Tutor Guidance & Hints\n\n"
                "To solve this problem effectively, consider these guiding steps:\n\n"
                "1. **Identify the Core Invariant:** What data structure or state transition is changing across your loop or request lifecycle?\n"
                "2. **Check the Boundaries:** What happens if the input is empty or the network connection drops unexpectedly?\n"
                "3. **Decompose the Logic:** Try writing out the 3 primary steps in pseudo-code before writing implementation code.\n\n"
                "> *Self-Check Question:* If you trace your algorithm with `[1, 2, 3]`, what is the exact return value at step 2?"
            )
        # Feature 1: AI Tutor Code Example Mode
        elif "code_example" in sys_str or "example" in prompt_str:
            reply = (
                "### 💻 Practical Implementation Example\n\n"
                "Here is an idiomatic, clean example demonstrating this pattern:\n\n"
                "```python\n"
                "# Asynchronous task queue consumer pattern\n"
                "import asyncio\n\n"
                "async def process_task(task_id: int):\n"
                "    print(f'Starting processing for task {task_id}')\n"
                "    await asyncio.sleep(0.5)  # Simulate I/O work\n"
                "    return f'Task {task_id} completed successfully'\n\n"
                "async def main():\n"
                "    tasks = [process_task(i) for i in range(1, 4)]\n"
                "    results = await asyncio.gather(*tasks)\n"
                "    print(results)\n\n"
                "if __name__ == '__main__':\n"
                "    asyncio.run(main())\n"
                "```\n\n"
                "**Key Takeaways:**\n"
                "- `asyncio.gather` executes co-routines concurrently.\n"
                "- Always handle exceptions with `try...except` around asynchronous I/O calls."
            )
        # Feature 2: Document Assistant / RAG Mode
        elif "course document" in sys_str or "approved context" in sys_str:
            reply = (
                "Based on the approved VIBHA course materials provided:\n\n"
                "The curriculum emphasizes **Outcome-Based Engineering** with strict adherence to separation of concerns. "
                "Core business logic is encapsulated in service layers, while database persistence relies on SQLAlchemy ORM and Alembic migrations. "
                "All student projects require unit and integration tests with verified pass criteria before certification eligibility."
            )
        # General Tutor Explanation
        else:
            reply = (
                "### 📘 Technical Explanation\n\n"
                "In enterprise software architecture, maintaining clean layer boundaries is crucial for scalability and maintainability:\n\n"
                "- **Separation of Concerns:** Controllers handle HTTP routing and validation; Services handle business rules; Repositories handle database transactions.\n"
                "- **Idempotency:** Operations like `PUT` and `DELETE` must produce identical system states regardless of duplicate executions.\n"
                "- **Defensive Programming:** Validate all untrusted input at network boundaries using strongly-typed schemas (such as Pydantic).\n\n"
                "Would you like a code example, or should we trace through a specific debugging scenario?"
            )

        # Estimate tokens (approx 4 chars per token)
        prompt_tokens = max(1, len(prompt) // 4)
        completion_tokens = max(1, len(reply) // 4)
        total_tokens = prompt_tokens + completion_tokens

        return LLMResult(
            text=reply,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            model_name=self.model_name,
            estimated_cost_usd=round(total_tokens * 0.0000015, 6),
        )

    async def generate_structured(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        response_model: Optional[Type[BaseModel]] = None,
    ) -> Dict[str, Any]:
        """Generate draft multiple-choice questions for trainer review."""
        topic = "Software Engineering"
        for candidate in ["sql", "python", "docker", "react", "fastapi", "algorithms", "rest"]:
            if candidate in prompt.lower():
                topic = candidate.upper()
                break

        questions = [
            {
                "question_text": f"In {topic} architecture, which design principle ensures modules depend on abstractions rather than concrete implementations?",
                "question_type": "MCQ",
                "options": [
                    {"id": "A", "text": "Single Responsibility Principle (SRP)"},
                    {"id": "B", "text": "Open/Closed Principle (OCP)"},
                    {"id": "C", "text": "Dependency Inversion Principle (DIP)"},
                    {"id": "D", "text": "Interface Segregation Principle (ISP)"},
                ],
                "correct_answer": "C",
                "points": 10,
                "explanation": "Dependency Inversion states high-level modules should not depend on low-level modules; both should depend on abstractions (interfaces).",
                "order_index": 1,
            },
            {
                "question_text": f"When scaling {topic} applications, what is the primary risk of executing unindexed subqueries within iterative loops (N+1 query problem)?",
                "question_type": "MCQ",
                "options": [
                    {"id": "A", "text": "Data corruption in primary key columns"},
                    {"id": "B", "text": "Exponential connection pool exhaustion and excessive I/O latency"},
                    {"id": "C", "text": "Syntax errors during schema migrations"},
                    {"id": "D", "text": "Automatic revocation of student certificates"},
                ],
                "correct_answer": "B",
                "points": 10,
                "explanation": "N+1 queries make N independent roundtrips to the database engine instead of fetching related records in a single batched JOIN.",
                "order_index": 2,
            },
        ]

        return {"questions": questions}
