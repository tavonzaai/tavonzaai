# Tavonza Team Integration Contract & Interface Specification

> **Document Scope**: Defines the authoritative integration boundaries between the **Backend Team**, **Frontend Team**, and **AI Team** following repository separation.

---

## 1. Overview of Team Responsibilities

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND REPOSITORY                  │
│               Owner: Frontend Team Lead                │
│    Tech: Next.js 14, React, Redux Toolkit, Tailwind    │
└───────────────▲────────────────────────▲───────────────┘
                │                        │
       1. REST API / WebSocket    2. Chat & Voice
                │                        │
┌───────────────▼────────┐      ┌────────▼───────────────┐
│   BACKEND REPOSITORY   │      │     AI REPOSITORY      │
│  Owner: Backend Lead   │◄─────┤   Owner: AI Team Lead  │
│  Tech: NestJS, Drizzle │  3.  │ Tech: FastAPI, Python  │
│   Postgres, Redis, SES │ Tool │     Groq, Whisper      │
└────────────────────────┘  GW  └────────────────────────┘
```

---

## 2. Backend ↔ Frontend Contract

### 2.1 Base URLs
- **Local Development**: `http://localhost:3000`
- **Staging / Production**: `https://api.tavonza.com`

### 2.2 OpenAPI / Swagger Auto-Type Generation
The Frontend team must **never** manually write backend request/response types. The Backend automatically publishes a live OpenAPI 3.0 specification:
- **Spec URL**: `https://api.tavonza.com/docs-json` (or `http://localhost:3000/docs-json`)
- **Interactive UI**: `https://api.tavonza.com/docs`

#### How Frontend Generates Types (One Command):
In `tavonza-frontend`, run:
```bash
npx openapi-typescript http://localhost:3000/docs-json -o src/types/api.generated.ts
```
Whenever the backend adds or changes an endpoint, the Frontend team re-runs this command to instantly receive updated TypeScript interfaces.

### 2.3 Authentication & Session Management
- **Token Delivery**: HTTP headers (`Authorization: Bearer <accessToken>`) or secure HttpOnly cookies (`tvz_rt_*`).
- **Refresh Flow**: `POST /auth/refresh` with credentials included.
- **Role Enforcement**: User role is returned in the JWT and user profile:
  - `CUSTOMER`, `WAITER`, `KITCHEN_STAFF`, `CASHIER`, `BRANCH_MANAGER`, `ORGANIZATION_ADMIN`, `SUPER_ADMIN`.

### 2.4 Realtime WebSocket Gateway (Socket.IO)
- **Endpoint**: Same as API base URL (`ws://localhost:3000` / `wss://api.tavonza.com`).
- **Authentication**: Passed during handshake in `auth.token`.
- **Channel Partitioning**:
  - `branch:{branchId}`: All staff updates in the branch.
  - `session:{tableSessionId}`: Specific diner table session updates.
  - `branch:{branchId}:waiter`: Waiter calls and order ready alerts.
  - `branch:{branchId}:kitchen`: Kitchen tickets and prep stage changes.
  - `user:{userId}`: User-specific direct notifications.

#### Core Realtime Events:
| Event Name | Description | RTK Query Tag Invalidation |
| :--- | :--- | :--- |
| `TABLE_STATUS_CHANGED` | Table occupied, vacant, dirty | `['TABLE', 'DASHBOARD']` |
| `ORDER_CREATED` | New diner order placed | `['ORDER', 'ORDER_ITEM', 'DASHBOARD']` |
| `ORDER_STATUS_CHANGED` | Status updated (CONFIRMED, PREPARING, READY, SERVED) | `['ORDER', 'DASHBOARD']` |
| `ORDER_ITEM_STATUS_CHANGED` | Line item marked completed | `['ORDER_ITEM', 'ORDER']` |
| `PAYMENT_STATUS_CHANGED` | Paid, refunded, or failed | `['PAYMENT', 'ORDER', 'TABLE']` |
| `WAITER_CALLED` | Diner clicked "Call Waiter" | `['NOTIFICATION', 'TABLE']` |

---

## 3. Backend ↔ AI Contract (Tool Gateway)

In compliance with platform architectural rules, **AI agents never connect directly to the database**. All queries and mutations execute via the Backend Tool Gateway.

### 3.1 Service Authentication
Every request from `apps/ai` to `apps/api` must include the internal service secret:
```http
Authorization: Bearer <INTERNAL_API_SERVICE_TOKEN>
Content-Type: application/json
```
Configured in both `.env` files as `INTERNAL_API_SERVICE_TOKEN`.

### 3.2 Gateway Endpoints Hosted by Backend

#### 1. Actor Resolution
`POST /internal/auth/resolve-actor`
- **Input**: `{ "token": "<raw bearer token from customer or staff>" }`
- **Output**: Full `ActorContext` (`actor_type`, `acting_user_id`, `organization_id`, `branch_id`, `permissions`, `resource_scope`).

#### 2. Context Bootstrap
`GET /internal/context/bootstrap?actor_id=<id>&branch_id=<id>`
- **Output**: Current operational state (assigned tables, active sessions) for the AI context builder.

#### 3. Authorized Tool Execution
`POST /internal/tools/execute`
- **Request Body**:
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
- **Allowed Tools**: `get_menu`, `get_table_status`, `get_order_status`, `get_kitchen_queue`, `get_branch_summary`, `get_table_bill`, `get_inventory`.

#### 4. Audit Logging
`POST /internal/audit`
- AI service reports every executed tool call for security auditability. Returns `202 Accepted`.

---

## 4. Frontend ↔ AI Contract

The Frontend team interacts with the AI service at `http://localhost:8000` (or `https://ai.tavonza.com`):

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Health check probe | None |
| `POST` | `/ai/chat` | Multi-turn conversational chat | `Bearer <UserJWT>` |
| `POST` | `/ai/chat/stream` | Server-Sent Events (SSE) token stream | `Bearer <UserJWT>` |
| `POST` | `/ai/voice/transcribe` | Whisper Cloud audio speech-to-text | `Bearer <UserJWT>` |
| `POST` | `/ai/voice/synthesize` | Text to neural speech audio stream (MP3) | `Bearer <UserJWT>` |
