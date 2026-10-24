from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Type
from pydantic import BaseModel


class LLMResult(BaseModel):
    text: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    model_name: str = "mock-vibha-ai"
    estimated_cost_usd: float = 0.0


class BaseLLMProvider(ABC):
    """Provider-independent LLM service interface."""

    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> LLMResult:
        """Generate a natural language text response."""
        pass

    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        response_model: Optional[Type[BaseModel]] = None,
    ) -> Dict[str, Any]:
        """Generate structured JSON conforming to a specific schema."""
        pass
