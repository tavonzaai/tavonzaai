# Tavonza AI — Backend Integration Contract & Team Guide

---

## 📬 Integration Guide for the Platform Backend Team (`apps/api`)

**Subject: AI ↔ Backend Integration Requirements — Tavonza AI Service**

The Tavonza AI service (`apps/ai`) is structured according to the architecture defined in `.agent/AI.md` and `.agent/AUTHORIZATION.md`.

In compliance with the platform rules:
- **No direct database access**: AI never connects to PostgreSQL, Redis, or any database directly (`AI -> SQL -> Database` is forbidden).
- **Tool Gateway**: All domain queries and mutations pass through the platform backend via the Tool Gateway:
  ```text
  AI -> Agent Runtime -> Tool Gateway -> Authorization -> Application -> Database
  ```
- **Actor Model & Scope**: Every AI interaction carries the authenticated `ActorContext` (`actor_type`, `acting_user_id`, `organization_id`, `branch_id`, `permissions`, `resource_scope`).
- **Fail Closed**: If authorization fails or the backend is unreachable in production, the AI fails closed and never fabricates state.
- **Audit**: Every tool call produces a structured audit record matching the platform schema.

---

## 🔐 Authentication Between AI and Backend

Every request the AI makes to the backend includes the shared service authorization header:

```
Authorization: Bearer <INTERNAL_API_SERVICE_TOKEN>
```

Both services configure this in their `.env`:

| Service | Variable Name | Value |
|---------|--------------|-------|
| `apps/ai` (.env) | `INTERNAL_API_SERVICE_TOKEN` | `<shared_secret>` |
| `apps/api` (.env) | `INTERNAL_API_SERVICE_TOKEN` | `<same shared_secret>` |

---

## 🛣️ The 5 Backend Endpoints

All endpoints are hosted by `apps/api` under `INTERNAL_API_BASE_URL` (default: `http://localhost:3000/internal`):

---

### Route 1 — `POST /internal/auth/resolve-actor`

**Purpose**: Resolves an incoming user JWT (or service token) into a structured `ActorContext`.  
The AI service does not decode or sign tokens; it delegates authorization resolution to the backend.

**Request body:**
```json
{ "token": "<raw bearer token from the client>" }
```

**Response (200 OK):**
```json
{
  "actor_type": "USER",
  "acting_user_id": "user_42",
  "ai_agent_id": null,
  "organization_id": "org_01",
  "restaurant_id": "rest_01",
  "branch_id": "branch_01",
  "permissions": ["menu.read", "orders.read", "tables.read"],
  "resource_scope": {
    "table_id": "table_15",
    "table_code": "T3",
    "table_session_id": "ts_101",
    "tables": ["T3"]
  }
}
```

---

### Route 2 — `GET /internal/context/bootstrap`

**Purpose**: Provides operational state snapshot (cached in Redis) to populate the role-aware context builder.

**Query parameters:**
```
?actor_id=<acting_user_id>&branch_id=<branch_id>
```

**Response (200 OK):**
```json
{
  "assigned_tables": ["T1", "T2", "T5"],
  "active_sessions": [
    { "id": "ts_101", "status": "active", "table_id": "table_15" },
    { "id": "ts_102", "status": "active", "table_id": "table_16" }
  ]
}
```

---

### Route 3 — `POST /internal/tools/execute`

**Purpose**: Executes an authorized tool invoked by the agent. The backend enforces permission check and returns data.

**Request body:**
```json
{
  "tool": "get_menu",
  "args": { "low_stock_only": false },
  "scope": {
    "organization_id": "org_01",
    "branch_id": "branch_01"
  },
  "actor": {
    "actor_type": "USER",
    "acting_user_id": "user_42",
    "organization_id": "org_01",
    "branch_id": "branch_01",
    "permissions": ["menu.read"]
  }
}
```

**Initial Tool Inventory:**

| Tool Name | Required Permission | Risk Tier | Description |
|-----------|---------------------|-----------|-------------|
| `get_menu` | `menu.read` | Read-only | Branch menu items, prices, and categories |
| `get_table_status` | `tables.read` | Read-only | Table status by `table_id` |
| `get_order_status` | `orders.read` | Read-only | Status of order or current table order |
| `get_kitchen_queue` | `orders.read` | Read-only | Kitchen preparation queue by station |
| `get_branch_summary` | `reports.read` | Read-only | Branch KPI summary (tables, orders, audit) |
| `get_audit_events` | `reports.read` | Read-only | Recent audit event logs |
| `get_table_bill` | `payments.read` | Read-only | Bill breakdown (subtotal, tax, balance) |
| `get_inventory` | `inventory.read` | Read-only | Stock levels and par thresholds |

---

### Route 4 — `POST /internal/tools/execute/confirm`

**Purpose**: Confirmation handshake for high-risk mutations (e.g. refunds, cancellations).

**Request body:**
```json
{
  "pending_confirmation_id": "conf_abc123",
  "actor": { ... }
}
```

---

### Route 5 — `POST /internal/audit`

**Purpose**: Receives structured audit events from AI actions. Uses the platform audit schema.

**Request body:**
```json
{
  "actorType": "USER",
  "actingUserId": "user_42",
  "aiAgentId": "waiter_ai_v1",
  "organizationId": "org_01",
  "restaurantId": "rest_01",
  "branchId": "branch_01",
  "action": "get_menu",
  "resource": {},
  "before": null,
  "after": { "action": "query_menu", "count": 12 },
  "authorizationResult": "ALLOW",
  "timestamp": "2026-09-28T10:00:00.000Z",
  "source": "tavonza-ai"
}
```
**Response**: `202 Accepted`.

---

## 📡 Frontend Integration Endpoints Exposed by `apps/ai`

The frontend clients (customer QR, waiter, cashier, manager) communicate with `apps/ai` at `http://localhost:8000`:

| Method | Path | Description | Authorization |
|--------|------|-------------|---------------|
| `GET` | `/health` | Service health check | None |
| `POST` | `/ai/chat` | Multi-turn conversational chat | `Bearer <JWT>` |
| `POST` | `/ai/chat/stream` | Server-Sent Events (SSE) token stream | `Bearer <JWT>` |
| `POST` | `/ai/voice/transcribe` | Audio file to text (Whisper Cloud) | `Bearer <JWT>` |
| `POST` | `/ai/voice/synthesize` | Text to MP3 audio stream (Edge Neural TTS) | `Bearer <JWT>` |
| `GET` | `/ai/voice/synthesize` | Direct audio source playback endpoint | `Bearer <JWT>` |
