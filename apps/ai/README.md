# Tavonza AI Service

This service is the official AI subsystem for the Tavonza platform.
It follows the architecture defined in [`.agent/AI.md`](../../.agent/AI.md) and [`.agent/AUTHORIZATION.md`](../../.agent/AUTHORIZATION.md).

---

## 🚀 Setup & Getting Started

**Python 3.11+** is required.

```bash
cd apps/ai

# 1. Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Fill in GROQ_API_KEY and configure backend connection

# 4. Start the service
uvicorn main:app --reload --port 8000
```

API is live at **http://localhost:8000**  
Interactive OpenAPI documentation at **http://localhost:8000/docs**

---

## 🏛️ Architecture & Principle

AI is an authorized client of the platform, not a privileged subsystem.

```text
AI Client / Frontend
         ↓
    apps/ai Runtime
         ↓
    Tool Gateway
         ↓
  apps/api Authorization
         ↓
 Application / Domain Service
         ↓
      Database
```

### 🚫 Non-Negotiable Hard Rules
1. **No direct database access**: AI never connects to PostgreSQL, Redis, or any data store owned by the backend (`AI -> SQL -> Database` is forbidden).
2. **No AWS SDK calls in business logic**: All resource storage/access routes through authorized application endpoints.
3. **Always carry user context**: Every request carries an `ActorContext` (`actor_type`, `acting_user_id`, `organization_id`, `branch_id`, `permissions`, `resource_scope`).
4. **Fail closed**: If a backend tool call fails or is denied, surface an error. Never fabricate or hallucinate responses from missing data.
5. **Audit your tool calls**: Every outgoing Tool Gateway call produces a structured JSON audit log.

---

## 🏗️ Structure

```text
apps/ai/
├── main.py                     ← Entrypoint (exports FastAPI app)
├── requirements.txt            ← Python dependencies
├── .env.example                ← Environment variable template
├── BACKEND_INTEGRATION.md      ← 5-route contract for the backend team (apps/api)
└── src/
    ├── main.py                 ← Core FastAPI app with auth, rate limiting & CORS
    ├── config.py               ← Typed Pydantic Settings
    ├── models.py               ← ActorContext, ChatRequest, ToolResult
    ├── internal_client.py      ← ONLY client module that contacts apps/api
    │
    ├── agents/
    │   └── jarvis_agent.py     ← Multi-turn tool execution loop & SSE streaming
    │
    ├── context/
    │   ├── context_builder.py  ← Role-aware prompt context (guest, waiter, chef, cashier, manager)
    │   └── scope_resolver.py   ← Enforces minimal, safe tenant & resource scope
    │
    ├── conversations/
    │   └── store.py            ← Redis-backed conversation memory with local fallback
    │
    ├── policies/
    │   ├── action_policy.py    ← Risk tiers: read_only, low_risk_mutation, high_risk_mutation
    │   └── confirmation_policy.py ← Human confirmation handshake for sensitive actions
    │
    ├── providers/
    │   ├── base.py             ← ModelProvider ABC isolating vendor SDKs
    │   └── groq_provider.py    ← Groq LLM inference with model fallback chain
    │
    ├── tools/
    │   ├── definitions/        ← Approved tool inventory & parameter schemas
    │   ├── authorization/      ← Actor permission validation per tool
    │   ├── executor/           ← Execution chain: Scope injection, execution & audit
    │   └── registry/           ← Dynamic tool pruning based on ActorContext
    │
    ├── voice/
    │   └── service.py          ← Groq Whisper Turbo STT + Edge Neural Cloud TTS
    │
    └── audit/
        └── audit_writer.py     ← Structured platform audit logging
```

---

## 📡 Exposed Endpoints

| Method | Path | Description | Authorization |
|--------|------|-------------|---------------|
| `GET` | `/health` | Service health check | None |
| `POST` | `/ai/chat` | Conversational text chat | Bearer JWT |
| `POST` | `/ai/chat/stream` | Server-Sent Events (SSE) streaming chat | Bearer JWT |
| `POST` | `/ai/voice/transcribe` | Audio file to text (Whisper Cloud) | Bearer JWT |
| `POST` | `/ai/voice/synthesize` | Text to MP3 audio stream (Edge Neural TTS) | Bearer JWT |
| `GET` | `/ai/voice/synthesize` | Direct audio source playback endpoint | Bearer JWT |

---

## 🔌 Connecting to the Backend (`apps/api`)

To switch from dev mock mode to the live backend:
1. In `apps/ai/.env`:
   ```bash
   DEV_MODE_MOCK_BACKEND=false
   INTERNAL_API_BASE_URL=http://localhost:3000/internal
   INTERNAL_API_SERVICE_TOKEN=<shared-secret>
   ```
2. See [`BACKEND_INTEGRATION.md`](./BACKEND_INTEGRATION.md) for the 5 HTTP routes expected from `apps/api`.
