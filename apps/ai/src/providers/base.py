"""
Model Provider Abstraction — Reference: .agent/AI.md Section "Provider Abstraction"
"Model providers must be isolated behind a provider boundary.
Business domains must not depend directly on a model vendor SDK."
"""

from abc import ABC, abstractmethod
from typing import Any, TypedDict


class ToolCall(TypedDict):
    id: str
    name: str
    arguments: dict[str, Any]


class ProviderResponse(TypedDict):
    role: str
    content: str | None
    tool_calls: list[ToolCall] | None


class ModelProvider(ABC):
    """Vendor SDKs must stay behind this interface — no business domain should import a model vendor SDK."""

    @abstractmethod
    async def generate(self, messages: list[dict], tools: list[dict]) -> ProviderResponse:
        ...
