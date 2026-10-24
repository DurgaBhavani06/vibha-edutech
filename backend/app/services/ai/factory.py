from app.core.config import settings
from app.services.ai.base import BaseLLMProvider
from app.services.ai.mock_provider import MockLLMProvider
from app.services.ai.openai_provider import OpenAILLMProvider
from app.services.ai.gemini_provider import GeminiLLMProvider


def get_llm_provider() -> BaseLLMProvider:
    """Factory function to instantiate the configured LLM provider.
    Falls back gracefully to MockLLMProvider if keys are absent or unconfigured.
    """
    provider_name = (settings.AI_PROVIDER or "mock").lower().strip()

    if provider_name == "openai" and settings.OPENAI_API_KEY:
        return OpenAILLMProvider(
            api_key=settings.OPENAI_API_KEY,
            model_name=settings.AI_MODEL_NAME if "gpt" in settings.AI_MODEL_NAME else "gpt-4o-mini",
        )

    if provider_name == "gemini" and settings.GEMINI_API_KEY:
        return GeminiLLMProvider(
            api_key=settings.GEMINI_API_KEY,
            model_name=settings.AI_MODEL_NAME if "gemini" in settings.AI_MODEL_NAME else "gemini-1.5-flash",
        )

    return MockLLMProvider(model_name=settings.AI_MODEL_NAME or "vibha-ai-deterministic-v1")
