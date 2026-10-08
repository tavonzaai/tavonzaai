# Realtime Architecture & Persistent Notification Specification

## 1. Architectural Overview

The Tavonza platform uses a hybrid event-driven architecture combining:
1. **Asynchronous Outbox & Worker Pipeline** for background persistence and reliable queueing (`packages/events`, `apps/worker`).
2. **Low-Latency Socket.IO Gateway** (`apps/api/src/modules/realtime`) directly embedded within the API modular monolith for instantaneous operational synchronization (<50ms).
3. **Database-Backed Persistent Notifications** (`packages/database/src/schema/notifications.ts`, `apps/api/src/modules/notifications`) with RESTful management and live WebSocket dispatch.
4. **Redux Toolkit & RTK Query Frontend Cache Synchronization** across all six React frontends (`admin`, `manager`, `cashier`, `kitchen`, `waiter`, `customer`), eliminating aggressive data-polling timers (`setInterval`) entirely.

```text
Domain Command (HTTP REST)
  ↓
Application Service (e.g. OrderService, KitchenService, PaymentService)
  ├── 1. Database Mutation (Drizzle ORM)
  ├── 2. Create Persistent Notification (NotificationService) [if applicable]
  └── 3. Emit Realtime Event (RealtimeGateway.emitToBranch / emitToTableSession)
           ↓
     Socket.IO Gateway
           ↓
     Client RealtimeBridge (Frontend)
           ├── Invalidate RTK Query Cache Tags (TABLE, ORDER, PAYMENT, etc.)
           ├── Trigger Custom DOM Window Event (tavonza:*)
           └── Update NotificationCenter (unread badge count)
```

---

## 2. Authoritative Database Schema: `notifications`

Persistent notifications are stored in PostgreSQL via Drizzle ORM (`packages/database/src/schema/notifications.ts`):

```typescript
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'cascade' }),
  targetRole: staffRoleEnum('target_role'), // BRANCH_MANAGER | HOST | WAITER | KITCHEN_STAFF | BARTENDER | CASHIER
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 64 }).notNull(), // ORDER_READY | BILL_REQUESTED | WAITER_CALL | PAYMENT_RECEIVED | etc.
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  metadata: jsonb('metadata'), // { orderId, tableId, tableNumber, amount, ... }
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  tableId: uuid('table_id').references(() => tables.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### Table Invariants & Indexes
- **Foreign Keys**: Cascades on `user_id`, `organization_id`, and `branch_id`; sets null on `order_id` and `table_id`.
- **Targeting**: Either targeted directly to a specific user (`userId`), or broadcast to a specific staff role at a branch (`branchId` + `targetRole`), or to an organization.
- **Indexes**:
  - `idx_notifications_user_read`: `(user_id, is_read)`
  - `idx_notifications_branch_role`: `(branch_id, target_role, is_read)`
  - `idx_notifications_created_at`: `(created_at)`

---

## 3. Realtime Gateway (`apps/api/src/modules/realtime`)

The NestJS `RealtimeGateway` runs on the primary API server using `@nestjs/websockets` and `@nestjs/platform-socket.io`.

### Handshake & Authentication
1. **Staff Connections**: Token supplied via `auth.token` or cookie (`access_token`, `branch_manager_token`, `cashier_token`, `waiter_token`, `kitchen_token`, `admin_token`). Gateway decodes JWT payload, identifies `userId`, `organizationId`, and role assignments.
2. **Customer Connections**: Identified by `tableSessionId` and `tableId` query parameters, or customer session token.

### Server-Controlled Room Partitioning
To guarantee strict tenant isolation and operational routing:
- `org:{orgId}` — All organization-level updates.
- `branch:{branchId}` — General branch broadcast (all staff).
- `branch:{branchId}:waiter` — Waitstaff alerts (order ready, waiter call, table state).
- `branch:{branchId}:cashier` — Cashier alerts (bill requested, payment received).
- `branch:{branchId}:kitchen` — Kitchen display tickets (food items).
- `branch:{branchId}:bar` — Bar display tickets (beverage items).
- `branch:{branchId}:manager` — Branch manager escalation alerts.
- `user:{userId}` — Direct personal notifications.
- `table_session:{tableSessionId}` — Active table session guests.
- `table:{tableId}` — Active table QR listeners.

Clients **cannot** arbitrary join rooms from the client-side socket. Room admission is strictly enforced server-side upon authenticated connection.

---

## 4. Realtime Events & Database Status Integrity

All events must strictly use authoritative statuses from [`packages/database/src/schema/enums.ts`](file:///home/euhan/projects/tavonzaai/packages/database/src/schema/enums.ts):

| Event Name | Database Enums Used | Primary Target Rooms | UI Impact |
| :--- | :--- | :--- | :--- |
| `TABLE_STATUS_CHANGED` | `table_service_status`: `AVAILABLE`, `OCCUPIED`, `ORDERING`, `PREPARING`, `SERVING`, `PAYMENT_PENDING`, `CLOSING` | `branch:{id}`, `branch:{id}:waiter`, `table:{id}` | Floor plan & table card updates |
| `TABLE_SESSION_STATUS_CHANGED` | `table_session_status`: `ACTIVE`, `BILL_REQUESTED`, `CLOSING`, `COMPLETED`, `ABANDONED` | `branch:{id}:waiter`, `branch:{id}:cashier`, `table_session:{id}` | Bill collection & checkout updates |
| `ORDER_CREATED` | `order_status`: `PENDING` (or `CONFIRMED` on auto-accept) | `branch:{id}:waiter`, `branch:{id}:manager`, `table_session:{id}` | Waiter approval queue increments |
| `ORDER_STATUS_CHANGED` | `order_status`: `CONFIRMED`, `PREPARING`, `READY`, `SERVED`, `COMPLETED`, `CANCELLED`, `REJECTED` | `branch:{id}`, `table_session:{id}` | Order tracking & KDS status updates |
| `ORDER_ITEM_STATUS_CHANGED` | `order_item_status`: `PENDING`, `PREPARING`, `READY`, `SERVED`, `UNAVAILABLE`, `CANCELLED` | `branch:{id}:kitchen`, `branch:{id}:bar`, `branch:{id}:waiter` | KDS line item checkoff & waiter pickup chime |
| `PAYMENT_STATUS_CHANGED` | `payment_status`: `UNPAID`, `PARTIALLY_PAID`, `PAID`, `REFUNDED`, `FAILED` | `branch:{id}:cashier`, `branch:{id}:waiter`, `table_session:{id}` | Cashier register & receipt confirmation |
| `WAITER_CALLED` | — | `branch:{id}:waiter` | Waiter assistance request alert |
| `NOTIFICATION_CREATED` | — | `user:{id}`, `branch:{id}:{role}` | Bell badge increments, notification toast |
| `NOTIFICATION_READ` | — | `user:{id}` | Bell badge decrements |

---

## 5. Frontend Synchronization & Cache Invalidation

All six React frontends follow the standard **Redux Toolkit + RTK Query** pattern:

### 1. `rtkBaseApi` & Cache Tag Invalidation
Every application defines `rtkBaseApi` in `src/redux/api/baseApi.ts` with standardized tag types:
`['TABLE', 'ORDER', 'ORDER_ITEM', 'PAYMENT', 'NOTIFICATION', 'DASHBOARD', 'USER']`.

When a Socket.IO event arrives at `<RealtimeBridge />`:
```typescript
socket.on('ORDER_STATUS_CHANGED', (payload) => {
  dispatch(rtkBaseApi.util.invalidateTags(['ORDER', 'ORDER_ITEM', 'DASHBOARD']));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tavonza:order_status_changed', { detail: payload }));
  }
});
```

### 2. Dual Synchronization Mechanism
- **RTK Query Endpoints**: Queries automatically re-fetch from the backend cache in the background without full page reloads or UI flickers.
- **Legacy View Custom Events**: Dispatches `window.dispatchEvent(new CustomEvent('tavonza:*'))` so dashboard views previously reliant on `setInterval` update instantly upon state changes.

### 3. Notification Center (`<NotificationCenter />`)
A reusable component mounted in every staff header/topbar:
- Polls `0` times; relies entirely on RTK Query tags invalidated by `NOTIFICATION_CREATED` and `NOTIFICATION_READ`.
- Displays real-time unread badge counter.
- Provides mark-as-read and mark-all-as-read actions via `/notifications` REST endpoints.

---

## 6. Polling Elimination Standard

Periodic data-fetching polling (`setInterval(fetchData, 3000..10000)`) is **strictly prohibited** across all frontends:
- All cashier checkout, transaction, order, and customer lists synchronize via `PAYMENT_STATUS_CHANGED` and `ORDER_STATUS_CHANGED`.
- All waiter dashboards, alerts, order lists, and floor plans synchronize via `TABLE_STATUS_CHANGED`, `ORDER_STATUS_CHANGED`, and `WAITER_CALLED`.
- All kitchen KDS screens synchronize via `ORDER_CREATED`, `ORDER_STATUS_CHANGED`, and `ORDER_ITEM_STATUS_CHANGED`.
- Customer order waiting and tracking screens synchronize via `ORDER_STATUS_CHANGED` and `ORDER_ITEM_STATUS_CHANGED`.

*Permissible local timers*: Local UI countdowns (OTP expiry, live stopwatch elapsed counters, clock ticks) that do not trigger HTTP network requests.
