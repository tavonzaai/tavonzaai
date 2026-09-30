# 📡 Tavonza AI ↔ Backend (`apps/api`) Complete Integration Specification

> **Target Audience:** Platform Backend Engineers (`apps/api` / NestJS team)  
> **Source Service:** Tavonza AI Subsystem (`apps/ai` / Python FastAPI)  
> **Status:** Ready for Implementation  

---

## 1. Architectural Overview & Security Boundary

The AI service (`apps/ai`) operates as an **authorized client** of the platform backend (`apps/api`). It enforces a strict zero-trust boundary:

```text
Frontend Client (Customer QR / Waiter / Cashier / Manager)
        │
        ▼ (Public HTTP / Bearer User JWT)
  apps/ai (FastAPI Runtime & Agent ReAct Loop)
        │
        ▼ (Private HTTP / Shared Service Token)
  apps/api (Tool Gateway & Authorization)
        │
        ▼ (SQL / Drizzle ORM)
  PostgreSQL Database
```

### Core Rules
1. **Zero Direct Database Access**: The AI service never connects directly to PostgreSQL.
2. **Actor Context Enforcement**: Every tool execution passes the authenticated `ActorContext`. The backend validates tenant isolation (`organization_id`, `branch_id`) and permissions before returning data.
3. **Internal Boundary**: All internal integration endpoints live under `/internal/*` and are protected by a shared internal service secret.

---

## 2. Environment Variables & Shared Secrets

Both services must be configured with matching values in their respective `.env` files:

### For `apps/api` (.env)
```env
# Shared secret for internal service-to-service communication
INTERNAL_API_SERVICE_TOKEN=sec_prod_tavonza_internal_service_token_987654321

# Internal server port (default 3000)
API_PORT=3000
```

### For `apps/ai` (.env)
```env
# Switch from local mock fixtures to the live backend
DEV_MODE_MOCK_BACKEND=false

# URL pointing to apps/api's internal gateway
INTERNAL_API_BASE_URL=http://localhost:3000/internal

# Must EXACTLY match INTERNAL_API_SERVICE_TOKEN in apps/api
INTERNAL_API_SERVICE_TOKEN=sec_prod_tavonza_internal_service_token_987654321
```

---

## 3. Security Guard (NestJS Implementation)

All `/internal/*` routes in `apps/api` must be guarded by an `InternalServiceGuard` verifying the service token:

```typescript
// apps/api/src/common/guards/internal-service.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalServiceGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid service token');
    }
    const token = authHeader.split(' ')[1];
    const expectedToken = this.configService.get<string>('INTERNAL_API_SERVICE_TOKEN');
    if (!expectedToken || token !== expectedToken) {
      throw new UnauthorizedException('Unauthorized internal service call');
    }
    return true;
  }
}
```

---

## 4. The 5 Required Internal Endpoints

All endpoints are hosted by `apps/api` under the prefix `/internal`.

```text
POST /internal/auth/resolve-actor
GET  /internal/context/bootstrap
POST /internal/tools/execute
POST /internal/tools/execute/confirm
POST /internal/audit
```

---

### Route 1: `POST /internal/auth/resolve-actor`
**Purpose:** Resolves an incoming end-user / customer JWT into a validated `ActorContext`.

* **Request Headers:**
  * `Authorization: Bearer <INTERNAL_API_SERVICE_TOKEN>`
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "actor_type": "USER",
    "acting_user_id": "usr_99812",
    "ai_agent_id": "waiter_ai_v1",
    "organization_id": "org_481",
    "restaurant_id": "rest_12",
    "branch_id": "branch_05",
    "permissions": [
      "menu.read",
      "tables.read",
      "orders.read"
    ],
    "resource_scope": {
      "table_code": "T1",
      "table_session_id": "ts_8872",
      "tables": ["T1", "T2", "T5"],
      "station": "grill"
    }
  }
  ```
* **Error Responses:**
  * `401 Unauthorized` if token is invalid or expired.
  * `403 Forbidden` if user is suspended/disabled.

---

### Route 2: `GET /internal/context/bootstrap`
**Purpose:** Returns a lightweight snapshot of active dining tables and operational sessions to initialize the prompt context.

* **Request Headers:**
  * `Authorization: Bearer <INTERNAL_API_SERVICE_TOKEN>`
* **Query Parameters:**
  * `actor_id` (string, required) — ID of the acting user/agent.
  * `branch_id` (string, required) — Active restaurant branch.
* **Success Response (`200 OK`):**
  ```json
  {
    "assigned_tables": ["T1", "T2", "T5"],
    "active_sessions": [
      { "id": "ts_8872", "table_id": "tbl_01", "status": "active" },
      { "id": "ts_8873", "table_id": "tbl_02", "status": "active" }
    ]
  }
  ```

---

### Route 3: `POST /internal/tools/execute`
**Purpose:** The central **Tool Gateway**. Executes approved domain tools against the real database and returns structured data to the AI.

* **Request Headers:**
  * `Authorization: Bearer <INTERNAL_API_SERVICE_TOKEN>`
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "tool": "get_menu",
    "args": {
      "low_stock_only": false
    },
    "scope": {
      "organization_id": "org_481",
      "branch_id": "branch_05"
    },
    "actor": {
      "actor_type": "USER",
      "acting_user_id": "usr_99812",
      "organization_id": "org_481",
      "branch_id": "branch_05",
      "permissions": ["menu.read"]
    }
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "ok": true,
    "data": { ... }
  }
  ```
* **Failure Response (`200 OK` or `400/403`):**
  ```json
  {
    "ok": false,
    "error": "Table T99 does not exist in branch_05."
  }
  ```

---

### Route 4: `POST /internal/tools/execute/confirm`
**Purpose:** Confirmation handshake for sensitive or high-risk mutations (refunds, large discounts, cancellations).

* **Request Body:**
  ```json
  {
    "pending_confirmation_id": "conf_771829",
    "actor": {
      "actor_type": "USER",
      "acting_user_id": "usr_99812",
      "organization_id": "org_481",
      "branch_id": "branch_05"
    }
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "ok": true,
    "data": {
      "confirmed": true,
      "executed_action": "apply_discount"
    }
  }
  ```

---

### Route 5: `POST /internal/audit`
**Purpose:** Receives structured audit event records from AI actions to log into the platform audit trail.

* **Request Headers:**
  * `Authorization: Bearer <INTERNAL_API_SERVICE_TOKEN>`
* **Request Body:**
  ```json
  {
    "actorType": "USER",
    "actingUserId": "usr_99812",
    "aiAgentId": "waiter_ai_v1",
    "organizationId": "org_481",
    "restaurantId": "rest_12",
    "branchId": "branch_05",
    "action": "get_menu",
    "resource": {},
    "before": null,
    "after": { "action": "query_menu", "count": 12 },
    "authorizationResult": "ALLOW",
    "timestamp": "2026-09-29T09:20:00.000Z",
    "source": "tavonza-ai"
  }
  ```
* **Success Response:** `202 Accepted` or `200 OK`.

---

## 5. Tool Gateway: The 8 Tool Specifications

The backend dispatcher for `POST /internal/tools/execute` must handle these 8 tools:

| # | Tool Name | Required Permission | Input Arguments (`args`) | Expected `data` Schema |
|---|---|---|---|---|
| 1 | `get_menu` | `menu.read` | `{}` | `{"items": [{"name": "Wagyu Burger", "price": 18.5, "category": "Mains"}]}` |
| 2 | `get_table_status` | `tables.read` | `{"table_id": "T1"}` | `{"table_id": "T1", "status": "OCCUPIED", "capacity": 4}` |
| 3 | `get_order_status` | `orders.read` | `{"order_id": "ord_101"}` (or `null` for table active order) | `{"order_id": "ord_101", "status": "PREPARING", "items_count": 3}` |
| 4 | `get_kitchen_queue` | `orders.read` *(migrates to `kitchen.read` when Kitchen domain is built)* | `{"station": "grill"}` (or `null` for all) | `{"station": "ALL", "pending_count": 3, "items": [{"name": "Ribeye", "station": "grill", "quantity": 1, "status": "IN_PREPARATION", "table": "T1"}]}` |
| 5 | `get_branch_summary` | `reports.read` | `{}` | `{"total_tables": 10, "occupied_tables": 4, "available_tables": 6, "open_orders": 3, "audit_events_count": 120}` |
| 6 | `get_audit_events` | `reports.read` | `{}` | `{"events": [{"action": "order.created", "actor": "Customer T1", "timestamp": "2m ago"}]}` |
| 7 | `get_table_bill` | `payments.read` | `{"table_id": "T1"}` | `{"table_code": "T1", "subtotal": 52.5, "tax": 5.25, "total": 57.75, "paid_amount": 0.0, "balance_due": 57.75, "status": "UNPAID", "items": [{"name": "Burger", "quantity": 2, "price": 18.5, "line_total": 37.0}]}` |
| 8 | `get_inventory` | `inventory.read` | `{"low_stock_only": false}` | `{"branch_id": "branch_05", "total_items": 15, "low_stock_count": 1, "items": [{"sku_code": "BEEF-PATTY", "name": "Beef patty", "on_hand": 18.0, "par_level": 10.0, "unit": "kg", "status": "HEALTHY"}]}` |

---

## 6. TypeScript DTO Reference for Backend Developers

Backend developers can paste these TypeScript interfaces directly into `apps/api`:

```typescript
// apps/api/src/modules/ai/dto/internal-ai.dto.ts

export interface ActorContextDto {
  actor_type: 'USER' | 'AI_AGENT' | 'SYSTEM' | 'INTEGRATION';
  acting_user_id: string | null;
  ai_agent_id?: string | null;
  organization_id: string;
  restaurant_id?: string | null;
  branch_id: string;
  permissions: string[];
  resource_scope: {
    table_id?: string;
    table_code?: string;
    table_session_id?: string;
    tables?: string[];
    station?: string;
    [key: string]: any;
  };
}

export interface ResolveActorRequestDto {
  token: string;
}

export interface ToolExecuteRequestDto {
  tool: string;
  args: Record<string, any>;
  scope: {
    organization_id: string;
    branch_id: string;
  };
  actor: ActorContextDto;
}

export interface ToolExecuteResponseDto {
  ok: boolean;
  data?: Record<string, any>;
  error?: string;
}

export interface AuditRecordDto {
  actorType: string;
  actingUserId: string | null;
  aiAgentId: string | null;
  organizationId: string;
  restaurantId?: string | null;
  branchId: string;
  action: string;
  resource: Record<string, any>;
  before: any;
  after: any;
  authorizationResult: 'ALLOW' | 'DENY';
  timestamp: string;
  source: string;
}
```

---

## 7. Verification & End-to-End Checklist

Once the backend developer finishes these 5 endpoints:

1. **Verify Backend Health**:
   Send a test curl with the internal service token:
   ```bash
   curl -X POST http://localhost:3000/internal/tools/execute \
     -H "Authorization: Bearer <INTERNAL_API_SERVICE_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"tool": "get_menu", "args": {}, "scope": {"organization_id": "org_1", "branch_id": "branch_1"}, "actor": {"actor_type": "USER", "organization_id": "org_1", "branch_id": "branch_1", "permissions": ["menu.read"]}}'
   ```
2. **Switch AI Service to Live Mode**:
   In `apps/ai/.env`, set `DEV_MODE_MOCK_BACKEND=false`.
3. **Run Live AI Query**:
   In PowerShell, query the AI service:
   ```powershell
   (Invoke-RestMethod -Uri "http://127.0.0.1:8000/ai/chat" -Method POST -Headers @{ Authorization = "Bearer <REAL_USER_JWT>" } -ContentType "application/json" -Body '{"session_id":"live_test","message":"what is on the menu?"}').reply
   ```
4. **Confirm Database Record**:
   The response should now display the actual dishes stored in your PostgreSQL `menus` table!
