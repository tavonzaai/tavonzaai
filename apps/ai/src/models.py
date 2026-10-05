from typing import Any, Literal

from pydantic import AliasChoices, BaseModel, Field


class ActorContext(BaseModel):
    """
    Resolved once per request by the platform backend's Authorization module.
    apps/ai never invents or expands this — it only enforces what's inside it.
    Reference: .agent/AI.md Actor Model & Scope
    """
    actor_type: Literal["USER", "AI_AGENT", "SYSTEM", "INTEGRATION"]
    acting_user_id: str | None = None
    ai_agent_id: str | None = None
    role: str | None = None
    organization_id: str
    restaurant_id: str | None = Field(
        default=None,
        validation_alias=AliasChoices("restaurant_id", "restaurantId"),
    )
    branch_id: str
    permissions: list[str] = Field(default_factory=list)
    resource_scope: dict[str, Any] = Field(default_factory=dict)


class ChatRequest(BaseModel):
    session_id: str = Field(..., max_length=128)
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    session_id: str
    reply: str


class ToolResult(BaseModel):
    ok: bool
    data: dict[str, Any] | None = None
    pending_confirmation_id: str | None = None
    error: str | None = None


class SynthesizeVoiceRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)
    persona: str = Field(default="uk_jarvis", max_length=64)
