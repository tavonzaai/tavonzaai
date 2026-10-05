import json
import logging
import time
from typing import Any

from groq import (
    APIConnectionError,
    APITimeoutError,
    AsyncGroq,
    InternalServerError,
    NotFoundError,
    RateLimitError,
)

from ..config import settings
from .base import ModelProvider, ProviderResponse, ToolCall

logger = logging.getLogger(__name__)


def _get_configured_fallback_models() -> list[str]:
    raw = settings.groq_fallback_models or ""
    parsed = [m.strip() for m in raw.split(",") if m.strip()]
    if not parsed:
        parsed = ["openai/gpt-oss-20b", "qwen/qwen3.8-27b"]
    return parsed


class GroqProvider(ModelProvider):
    def __init__(self) -> None:
        # Use dummy key if none provided to avoid empty Bearer header crash in dev mode
        api_key = settings.groq_api_key.strip() if settings.groq_api_key else "gsk_placeholder_dev_key"
        # max_retries is set from settings (default 0). Setting to 0 prevents the Groq SDK
        # from sleeping and retrying 2+ times with backoff on 429, allowing instantaneous failover!
        self._client = AsyncGroq(
            api_key=api_key,
            max_retries=settings.groq_max_retries,
            timeout=settings.groq_timeout_seconds,
        )
        self._model = settings.groq_model
        # Circuit breaker / rate-limit cooldowns: model_name -> expiry timestamp
        self._model_cooldowns: dict[str, float] = {}

    def _build_model_chain(self) -> list[str]:
        raw_fallbacks = _get_configured_fallback_models()
        candidates: list[str] = [self._model]
        for m in raw_fallbacks:
            if m not in candidates:
                candidates.append(m)

        now = time.time()
        available: list[str] = []
        cooling: list[tuple[float, str]] = []

        for m in candidates:
            expiry = self._model_cooldowns.get(m, 0.0)
            if expiry > now:
                cooling.append((expiry, m))
            else:
                available.append(m)

        if not available:
            # If all configured models are cooling down, prioritize the one whose cooldown expires earliest
            cooling.sort()
            return [m for _, m in cooling]

        if self._model in [m for _, m in cooling]:
            remaining = self._model_cooldowns[self._model] - now
            logger.info(
                "Primary Groq model '%s' in rate-limit cooldown (%.1fs left). Fast-routing directly to '%s'.",
                self._model,
                remaining,
                available[0],
            )

        # Try available models first, followed by cooling models sorted by earliest recovery
        cooling.sort()
        return available + [m for _, m in cooling]

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

        models_to_try = self._build_model_chain()
        last_exc = None

        for model_name in models_to_try:
            try:
                resp = await self._client.chat.completions.create(  # type: ignore[call-overload]
                    model=model_name,
                    messages=messages,  # type: ignore[arg-type]
                    **kwargs,
                )

                # Reset cooldown on success
                self._model_cooldowns.pop(model_name, None)

                choice = resp.choices[0].message

                tool_calls: list[ToolCall] | None = None
                tc_items = choice.tool_calls or []
                if tc_items:
                    tool_calls = []
                    for tc in tc_items:
                        raw_args = tc.function.arguments or "{}"
                        try:
                            parsed_args = json.loads(raw_args)
                            if not isinstance(parsed_args, dict):
                                parsed_args = {}
                        except Exception:
                            parsed_args = {}
                        tool_calls.append(
                            {
                                "id": tc.id,
                                "name": tc.function.name,
                                "arguments": parsed_args,
                            }
                        )

                return {"role": "assistant", "content": choice.content, "tool_calls": tool_calls}
            except RateLimitError as exc:
                cooldown = settings.groq_rate_limit_cooldown_seconds
                self._model_cooldowns[model_name] = time.time() + cooldown
                logger.warning(
                    "Groq model %s error (RateLimitError): %s. Cooldown active for %.0fs. Instantly switching to fallback...",
                    model_name,
                    exc,
                    cooldown,
                )
                last_exc = exc
                continue
            except (APIConnectionError, APITimeoutError, InternalServerError, NotFoundError) as exc:
                logger.warning(
                    "Groq model %s error (%s): %s. Instantly switching to fallback...",
                    model_name,
                    type(exc).__name__,
                    exc,
                )
                last_exc = exc
                continue

        if last_exc:
            raise last_exc
        raise RuntimeError("No Groq models available")

