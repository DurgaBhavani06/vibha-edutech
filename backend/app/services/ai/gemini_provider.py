import json
from typing import Optional, Dict, Any, Type
import httpx
from pydantic import BaseModel
from app.services.ai.base import BaseLLMProvider, LLMResult


class GeminiLLMProvider(BaseLLMProvider):
    """Google Gemini API Provider using REST endpoint with timeout and tracking."""

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> LLMResult:
        url = f"{self.base_url}/models/{self.model_name}:generateContent?key={self.api_key}"

        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": f"System Context: {system_prompt}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will adhere strictly to this pedagogical role."}]})
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": temperature,
            },
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(url, json=payload)
            res.raise_for_status()
            data = res.json()

        text = data["candidates"][0]["content"]["parts"][0]["text"]
        usage = data.get("usageMetadata", {})
        prompt_tokens = usage.get("promptTokenCount", len(prompt) // 4)
        completion_tokens = usage.get("candidatesTokenCount", len(text) // 4)
        total_tokens = usage.get("totalTokenCount", prompt_tokens + completion_tokens)

        cost = total_tokens * 0.0000003
        return LLMResult(
            text=text,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            model_name=self.model_name,
            estimated_cost_usd=round(cost, 6),
        )

    async def generate_structured(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        response_model: Optional[Type[BaseModel]] = None,
    ) -> Dict[str, Any]:
        result = await self.generate_response(
            prompt=f"{prompt}\n\nPlease output valid raw JSON only.",
            system_prompt=system_prompt,
            temperature=0.2,
        )
        clean = result.text.strip()
        if clean.startswith("```json"):
            clean = clean[7:]
        if clean.startswith("```"):
            clean = clean[3:]
        if clean.endswith("```"):
            clean = clean[:-3]
        return json.loads(clean.strip())
