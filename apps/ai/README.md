# Tavonza AI Service

Python/FastAPI AI agent runtime for the Tavonza platform.

## Structure

```
apps/ai/
├── main.py                  # FastAPI app entrypoint
├── config.py                # Environment config (pydantic-settings)
├── requirements.txt         # Runtime dependencies
├── requirements-dev.txt     # Dev/test dependencies
├── .python-version          # Python version pin (3.11)
├── .env.example             # Copy to .env and fill in secrets
│
├── routers/                 # FastAPI route handlers
│   ├── health.py            # GET /health
│   └── tools.py             # Tool invocation endpoints
│
├── gateway/                 # Tool Gateway HTTP client
│   └── tool_gateway.py      # The ONLY way to call platform data
│
├── schemas/                 # Pydantic v2 request/response models
│   └── base.py              # ActorContext, ToolInvokeRequest/Response
│
├── src/                     # Core AI logic (existing structure)
│   ├── agents/              # AI agent definitions
│   ├── tools/               # Tool implementations
│   │   ├── registry/        # Tool registry
│   │   ├── definitions/     # Tool definitions and metadata
│   │   ├── executor/        # Tool execution logic
│   │   └── authorization/   # Tool-level auth checks
│   ├── context/             # Context building
│   │   ├── context-builder/ # Builds actor context
│   │   ├── context-providers/ # Data providers for context
│   │   └── scope-resolver/  # Scope resolution
│   ├── policies/            # AI action/confirmation policies
│   ├── providers/           # LLM provider adapters
│   ├── conversations/       # Conversation state
│   └── audit/               # Audit logging
│
└── tests/                   # pytest test suite
    └── test_health.py       # Example test
```

## Setup

**Prerequisites:** Python 3.11+

```bash
# From apps/ai/
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

pip install -r requirements.txt
pip install -r requirements-dev.txt

cp .env.example .env
# Fill in .env with your secrets
```

## Running

```bash
# Development (hot reload)
uvicorn main:app --reload --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs

## Testing

```bash
pytest tests/
```

## The Golden Rule

**AI never touches the database directly.**

Every platform capability is called through the Tool Gateway:

```python
from gateway.tool_gateway import tool_gateway

result = await tool_gateway.invoke(
    tool="orders.getStatus",
    actor=actor_context,
    params={"order_id": order_id},
)
```

The Tool Gateway enforces the full authorization chain:
`Actor → Permission → Scope → Resource → Domain Rules`
