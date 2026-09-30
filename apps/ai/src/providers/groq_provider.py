import json
import logging
from typing import Any

from groq import AsyncGroq, RateLimitError

from ..config import settings
from .base import ModelProvider, ProviderResponse, ToolCall

logger = logging.getLogger(__name__)


FALLBACK_MODELS = [
    settings.groq_model,
    "llama-3.1-8b-instant",
]


class GroqProvider(ModelProvider):
    def __init__(self) -> None:
        # Use dummy key if none provided to avoid empty Bearer header crash in dev mode
        api_key = settings.groq_api_key.strip() if settings.groq_api_key else "gsk_placeholder_dev_key"
        self._client = AsyncGroq(api_key=api_key)
        self._model = settings.groq_model

    async def generate(self, messages: list[dict], tools: list[dict]) -> ProviderResponse:
        if not settings.groq_api_key or settings.groq_api_key.strip() in {"", "your_groq_api_key_here"}:
            # Dev mock fallback if user hasn't put in their Groq API key yet
            logger.info("GROQ_API_KEY not configured. Returning development guidance response.")
            return {
                "role": "assistant",
                "content": (
                    "JARVIS AI is active and running in dev mode. "
                    "Please configure GROQ_API_KEY in apps/ai/.env with your key from https://console.groq.com to enable live LLM inference."
                ),
                "tool_calls": None,
            }

        kwargs: dict[str, Any] = {}
        if tools:

            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"

        models_to_try = [self._model] + [m for m in FALLBACK_MODELS if m != self._model]
        last_exc = None

        for model_name in models_to_try:
            try:
                resp = await self._client.chat.completions.create(  # type: ignore[call-overload]
                    model=model_name,
                    messages=messages,  # type: ignore[arg-type]
                    **kwargs,
                )

                choice = resp.choices[0].message

                tool_calls: list[ToolCall] | None = None
                tc_items = choice.tool_calls or []
                if tc_items:
                    tool_calls = [
                        {
                            "id": tc.id,
                            "name": tc.function.name,
                            "arguments": json.loads(tc.function.arguments or "{}"),
                        }
                        for tc in tc_items
                    ]


                return {"role": "assistant", "content": choice.content, "tool_calls": tool_calls}
            except RateLimitError as exc:
                logger.warning("Groq model %s hit RateLimitError: %s. Trying fallback...", model_name, exc)
                last_exc = exc
                continue

        if last_exc:
            raise last_exc
        raise RuntimeError("No Groq models available")
