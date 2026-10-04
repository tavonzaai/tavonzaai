"""
Tavonza AI Service — Core FastAPI Application
Implements:
- AI -> Agent Runtime -> Tool Gateway -> Authorization -> Application -> Database
- Zero direct database access
- Cloud Voice Pipeline (Whisper STT + Edge Neural TTS)
- SSE Token Streaming
- Per-table and per-staff session isolation
- Structured audit on all actions
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from .agents.jarvis_agent import JarvisAgent
from .config import settings
from .conversations.store import ConversationStore
from .internal_client import BackendUnavailableError, InternalClient
from .models import ActorContext, ChatRequest, ChatResponse, SynthesizeVoiceRequest
from .voice.service import VoiceService

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

internal_client = InternalClient()
conversation_store = ConversationStore()
agent = JarvisAgent(internal_client=internal_client, conversation_store=conversation_store)
voice_service = VoiceService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await internal_client.aclose()
    await conversation_store.aclose()


app = FastAPI(
    title="Tavonza AI Service — Autonomous Restaurant Agent",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.environment == "dev" else None,
    redoc_url=None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]


dev_origins = [
    "http://localhost:3000",
    "http://localhost:3100",
    "http://localhost:3101",
    "http://localhost:3102",
    "http://localhost:3103",
    "http://localhost:3104",
    "http://localhost:3105",
    "http://localhost:5173",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3100",
    "http://127.0.0.1:3101",
    "http://127.0.0.1:3102",
    "http://127.0.0.1:3103",
    "http://127.0.0.1:3104",
    "http://127.0.0.1:3105",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
]

configured_origins = [
    origin.strip()
    for origin in settings.allowed_origins.split(",")
    if origin.strip() and origin.strip() != "*"
]

allowed_origins = list(set(dev_origins + configured_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _resolve_effective_session_id(actor: ActorContext, session_id: str) -> str:
    """Isolates conversation memory per table and per staff user."""
    scope = actor.resource_scope or {}
    table_code = scope.get("table_code")
    if table_code:
        table_session_id = scope.get("table_session_id") or "active"
        return f"customer_table_{table_code}_{table_session_id}_{session_id}"
    acting_user = actor.acting_user_id or actor.actor_type
    return f"staff_{acting_user}_{session_id}"


async def _authenticate(authorization: str | None) -> ActorContext:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ", 1)[1]
    try:
        actor = await internal_client.resolve_actor(token)
    except BackendUnavailableError as exc:
        logger.error("Backend unreachable during auth: %s", exc)
        raise HTTPException(status_code=503, detail="Authentication service temporarily unavailable") from exc

    if actor is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return actor


@app.get("/health")
async def health():
    return {"status": "ok", "environment": settings.environment}


@app.get("/")
async def root():
    return {"message": "Tavonza AI service is running", "status": "ok"}


@app.post("/ai/chat", response_model=ChatResponse)
@limiter.limit("30/minute")
async def chat(request: Request, payload: ChatRequest, authorization: str | None = Header(default=None)):
    actor = await _authenticate(authorization)
    sid = _resolve_effective_session_id(actor, payload.session_id)
    reply = await agent.handle_message(actor=actor, session_id=sid, message=payload.message)
    return ChatResponse(session_id=payload.session_id, reply=reply)


@app.post("/ai/chat/stream")
@limiter.limit("30/minute")
async def chat_stream(request: Request, payload: ChatRequest, authorization: str | None = Header(default=None)):
    actor = await _authenticate(authorization)
    sid = _resolve_effective_session_id(actor, payload.session_id)
    return StreamingResponse(
        agent.stream_message(actor=actor, session_id=sid, message=payload.message),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/ai/voice/transcribe")
@limiter.limit("20/minute")
async def voice_transcribe(request: Request, file: UploadFile = File(...), authorization: str | None = Header(default=None)):
    await _authenticate(authorization)
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio recording")
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio file too large (max 25MB)")
    try:
        text = await voice_service.transcribe_audio(
            audio_bytes=audio_bytes,
            filename=file.filename or "recording.webm",
            content_type=file.content_type or "audio/webm",
        )
        return {"text": text}
    except Exception as exc:
        logger.error("Audio transcription failed: %s", exc)
        raise HTTPException(status_code=502, detail="Voice transcription service temporarily unavailable") from exc


@app.post("/ai/voice/synthesize")
@limiter.limit("60/minute")
async def voice_synthesize_post(request: Request, payload: SynthesizeVoiceRequest, authorization: str | None = Header(default=None)):
    await _authenticate(authorization)
    return StreamingResponse(
        voice_service.stream_speech(payload.text, persona=payload.persona),
        media_type="audio/mpeg",
        headers={"Cache-Control": "no-cache", "Content-Disposition": "inline; filename=jarvis_speech.mp3"},
    )


@app.get("/ai/voice/synthesize")
@limiter.limit("60/minute")
async def voice_synthesize_get(request: Request, text: str, persona: str = "uk_jarvis", authorization: str | None = Header(default=None)):
    await _authenticate(authorization)
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Empty text")
    if len(text) > 1000:
        raise HTTPException(status_code=400, detail="Text too long (max 1000 chars)")
    return StreamingResponse(
        voice_service.stream_speech(text, persona=persona),
        media_type="audio/mpeg",
        headers={"Cache-Control": "no-cache", "Content-Disposition": "inline; filename=jarvis_speech.mp3"},
    )
