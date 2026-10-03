"""
ConversationStore — Redis-backed in production, in-memory fallback for development.
History bounded to MAX_TURNS. Redis keys auto-expire after SESSION_TTL_SECONDS.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from ..config import settings

logger = logging.getLogger(__name__)

MAX_TURNS = 20
SESSION_TTL_SECONDS = 60 * 60 * 4  # 4-hour auto-expiry



try:
    import redis.asyncio as aioredis  # type: ignore
except Exception:
    aioredis = None  # type: ignore


class ConversationStore:
    def __init__(self) -> None:
        self._redis: Any = None
        self._local: dict[str, list[dict[str, Any]]] = {}
        self._try_connect_redis()

    def _try_connect_redis(self) -> None:
        if aioredis is None:
            logger.warning(
                "ConversationStore: Redis package unavailable. Using in-memory fallback."
            )
            self._redis = None
            return

        try:
            self._redis = aioredis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=1.0,
                socket_timeout=1.5,
            )
            logger.info("ConversationStore: Redis connected at %s", settings.redis_url)
        except Exception as exc:
            logger.warning(
                "ConversationStore: Redis unavailable (%s). Using in-memory fallback "
                "(single-process only — not suitable for multi-worker production).", exc
            )
            self._redis = None

    def get(self, session_id: str) -> list[dict[str, Any]]:
        return list(self._local.get(session_id, []))

    def append(self, session_id: str, message: dict[str, Any]) -> None:
        self._local.setdefault(session_id, []).append(message)
        self._local[session_id] = self._local[session_id][-MAX_TURNS:]

    async def get_async(self, session_id: str) -> list[dict[str, Any]]:
        if self._redis is None:
            return list(self._local.get(session_id, []))
        try:
            raw = await self._redis.get(f"tavonza:conv:{session_id}")
            if raw:
                return json.loads(raw)[-MAX_TURNS:]
        except Exception as exc:
            logger.warning("Redis get failed for %s: %s", session_id, exc)
        return list(self._local.get(session_id, []))

    async def append_async(self, session_id: str, message: dict[str, Any]) -> None:
        if self._redis is None:
            self._local.setdefault(session_id, []).append(message)
            self._local[session_id] = self._local[session_id][-MAX_TURNS:]
            return
        try:
            key = f"tavonza:conv:{session_id}"
            raw = await self._redis.get(key)
            history: list[dict[str, Any]] = json.loads(raw) if raw else []
            history.append(message)
            history = history[-MAX_TURNS:]
            await self._redis.set(key, json.dumps(history), ex=SESSION_TTL_SECONDS)
        except Exception as exc:
            logger.warning("Redis append failed for %s: %s — using in-memory", session_id, exc)
            self._local.setdefault(session_id, []).append(message)
            self._local[session_id] = self._local[session_id][-MAX_TURNS:]

    async def aclose(self) -> None:
        if self._redis is not None:
            try:
                await self._redis.aclose()
            except Exception as exc:
                logger.warning("Error closing Redis client: %s", exc)
