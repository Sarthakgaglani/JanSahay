"""Provider-agnostic LLM boundary used by RAG and eligibility services."""

import asyncio
import os
from abc import ABC, abstractmethod
from functools import lru_cache

import httpx


class LLMProviderError(RuntimeError):
    pass


class LLMProvider(ABC):
    name = "unknown"
    is_available = True

    @abstractmethod
    async def generate_response(self, prompt: str, temperature: float = 0.2) -> str:
        raise NotImplementedError

    async def generate_structured_response(self, prompt: str, temperature: float = 0.1) -> str:
        return await self.generate_response(prompt, temperature)

    async def health_check(self) -> bool:
        return self.is_available


class UnavailableProvider(LLMProvider):
    name = "unavailable"
    is_available = False

    async def generate_response(self, prompt: str, temperature: float = 0.2) -> str:
        raise LLMProviderError("No configured LLM provider is available.")


class GeminiProvider(LLMProvider):
    name = "gemini"

    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model
        self.timeout_seconds = max(3, float(os.getenv("LLM_TIMEOUT_SECONDS", "20")))

    def _generate_sync(self, prompt: str, temperature: float) -> str:
        try:
            from google import genai
            client = genai.Client(api_key=self.api_key)
            response = client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=genai.types.GenerateContentConfig(temperature=temperature),
            )
            return (response.text or "").strip()
        except (ImportError, AttributeError):
            try:
                import google.generativeai as legacy_genai
                legacy_genai.configure(api_key=self.api_key)
                model = legacy_genai.GenerativeModel(self.model)
                response = model.generate_content(prompt, generation_config=legacy_genai.types.GenerationConfig(temperature=temperature))
                return (response.text or "").strip()
            except Exception as exc:
                raise LLMProviderError("Gemini is unavailable.") from exc
        except Exception as exc:
            raise LLMProviderError("Gemini is unavailable.") from exc

    async def generate_response(self, prompt: str, temperature: float = 0.2) -> str:
        try:
            return await asyncio.wait_for(asyncio.to_thread(self._generate_sync, prompt, temperature), timeout=self.timeout_seconds)
        except asyncio.TimeoutError as exc:
            raise LLMProviderError("Gemini timed out.") from exc


class OpenAICompatibleProvider(LLMProvider):
    name = "openai-compatible"

    def __init__(self, api_key: str, base_url: str, model: str):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout_seconds = max(3, float(os.getenv("LLM_TIMEOUT_SECONDS", "20")))

    async def generate_response(self, prompt: str, temperature: float = 0.2) -> str:
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={"model": self.model, "messages": [{"role": "user", "content": prompt}], "temperature": temperature},
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
                if not content:
                    raise ValueError("empty provider response")
                return content.strip()
        except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as exc:
            raise LLMProviderError("The configured AI provider is unavailable.") from exc


@lru_cache(maxsize=1)
def get_llm_provider() -> LLMProvider:
    provider = os.getenv("LLM_PROVIDER", "gemini").strip().lower()
    model = os.getenv("LLM_MODEL", "gemini-1.5-flash")
    if provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY", "")
        return GeminiProvider(api_key, model) if api_key and api_key != "your_gemini_api_key_here" else UnavailableProvider()
    if provider in {"openai", "openai-compatible", "compatible"}:
        api_key = os.getenv("OPENAI_API_KEY", "")
        base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        selected_model = os.getenv("OPENAI_MODEL", model)
        return OpenAICompatibleProvider(api_key, base_url, selected_model) if api_key else UnavailableProvider()
    return UnavailableProvider()
