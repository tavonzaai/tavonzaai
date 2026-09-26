# Tavonza AI Service

This service is yours. You decide how to organize it, what libraries to use, and how to build it.  
This document only defines **the boundaries you must work within** and **how to get started**.

---

## Setup

**Python 3.11+** is required.

```bash
cd apps/ai

python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env             # fill in your keys

uvicorn main:app --reload --port 8000
```

API is live at **http://localhost:8000**  
Interactive docs at **http://localhost:8000/docs**

---

## Your Role

You are a **client of the backend API** (`apps/api`, running on port 3000).

You do not own any database tables. You do not write migrations. You do not call the database directly.

When you need platform data (orders, menus, sessions, users — anything), you call the backend API, which handles authorization and returns what you are allowed to see. Treat it like any external REST API.

```
Your AI service  →  POST http://localhost:3000/tools/invoke  →  backend does the auth + DB work  →  returns result
```

The backend team will expose a **Tool Gateway endpoint**. You call it with:
- what tool you want to run (e.g. `orders.getStatus`)
- the user/session context (who is asking)
- the parameters

The backend enforces all permissions. You just consume the response.

---

## Hard Rules

These are non-negotiable architectural boundaries:

1. **No direct database access.** You do not connect to Postgres, Redis, or any other data store owned by the backend. Ever.

2. **No AWS SDK calls in your business logic.** If you need to store something (e.g. embeddings, files), ask the backend team to expose a tool endpoint for it. You call that endpoint; the backend handles the actual storage.

3. **Always carry user context.** Every request you make to the backend must include the authenticated user/session context. AI never acts as a super-user.

4. **Fail closed.** If a backend call fails or is denied, surface an error. Never fabricate or guess a response from missing data.

5. **Audit your tool calls.** Log every outgoing Tool Gateway call with the tool name, actor, and result status. Structured JSON logs only.

---

## Language & Tools

Use whatever you need. Suggested starting points:

| Need | Options |
|------|---------|
| Web framework | **FastAPI** (already set up), Flask |
| LLM orchestration | LangChain, LlamaIndex, Haystack, raw API calls |
| Vector search | pgvector (via backend tool), Qdrant, Pinecone, Chroma |
| Embeddings | OpenAI, sentence-transformers, Cohere |
| Testing | pytest + pytest-asyncio |

Add any package to `requirements.txt`. You own that file.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values. Never commit `.env`.

Ask the team lead if you need any backend API keys or service URLs.

---

## Deploying

You do not handle deployment. The DevOps team handles it.  
What you need to ensure:
- `GET /health` returns `{"status": "ok"}` (used by load balancer)
- Your service starts with `uvicorn main:app --host 0.0.0.0 --port 8000`
- All secrets come from environment variables, never hardcoded
