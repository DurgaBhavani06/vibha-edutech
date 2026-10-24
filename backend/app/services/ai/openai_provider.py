import json
from typing import Optional, Dict, Any, Type
import httpx
from pydantic import BaseModel
from app.services.ai.base import BaseLLMProvider, LLMResult


class OpenAILLMProvider(BaseLLMProvider):
    """OpenAI API Provider using httpx with timeout and usage tracking."""

    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model_name = model_name
        self.base_url = "https://api.openai.com/v1"

    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> LLMResult:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model_name,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()

        text = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {})
        prompt_tokens = usage.get("prompt_tokens", 0)
        completion_tokens = usage.get("completion_tokens", 0)
        total_tokens = usage.get("total_tokens", 0)

        cost = (prompt_tokens * 0.00000015) + (completion_tokens * 0.0000006)
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
            prompt=f"{prompt}\n\nPlease output valid JSON only without markdown code fences.",
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
