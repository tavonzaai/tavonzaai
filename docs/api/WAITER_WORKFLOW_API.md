# Waiter Workflow API & Figma Integration Guide

> **Product surface**: Waiter staff app (`@frontend/waiter`, Next.js, Figma-aligned route `/new-waiter-dashboard`)  
> **Figma file**: [milkyamsterdamm || sync_lab | Waiter canvas](https://www.figma.com/design/wIPqSCyJyaTtPNrw4kv7Kx/milkyamsterdamm-%257C%257C-sync_lab%257C-FO11BE7195387?node-id=730-8076)  
> **Figma canvas**: `730:8076` (` Waiter `) · **Section**: `3359:12417` (`Waiter (Mobile Device)`)  
> **Backend module**: `apps/api/src/modules/waiter`  
> **Primary controllers**: `WaiterTablesController`, `WaiterOrdersController`, `WaiterAlertsController` in `apps/api/src/modules/waiter/presentation/http/waiter.controller.ts`  
> **Related controllers**: `AuthController`, `MeController`, `MenuController`, `TableController`, `TableSessionController`, `PaymentController`, `ShiftController`, `NotificationController`  
> **Frontend API client**: `frontend/waiter/src/redux/features/waiterApi.ts` (`waiterService`)  
> **Auth client**: `frontend/waiter/src/redux/features/authApi.ts`  
> **Spec sources**: `.agent/FLOWS.md` (Waiter Flow), `.agent/AUTHORIZATION.md`, `.agent/DATABASE.md`, `.agent/REALTIME_AND_NOTIFICATIONS.md`

This document is the primary developer reference for implementing and verifying the Waiter workflow. Endpoint paths, request fields, and response properties are taken from NestJS controllers, DTOs, services, and Drizzle repositories. **Nothing below invents a contract.** Gaps are classified explicitly.

---

## Table of contents

1. [Overview of the Waiter workflow](#1-overview-of-the-waiter-workflow)
2. [Figma screen and navigation map](#2-figma-screen-and-navigation-map)
3. [Authentication, authorization, and conventions](#3-authentication-authorization-and-conventions)
4. [Complete API reference](#4-complete-api-reference)
5. [Screen-by-screen API integration guide](#5-screen-by-screen-api-integration-guide)
6. [Missing and incomplete API audit](#6-missing-and-incomplete-api-audit)
7. [Backend implementation recommendations](#7-backend-implementation-recommendations)
8. [Workflow dependencies and business rules](#8-workflow-dependencies-and-business-rules)
9. [Frontend integration checklist](#9-frontend-integration-checklist)
10. [Acceptance criteria and testing recommendations](#10-acceptance-criteria-and-testing-recommendations)
11. [Unresolved questions](#11-unresolved-questions)

---

## 1. Overview of the Waiter workflow

Canonical product sequence from `.agent/FLOWS.md` **Waiter Flow**, aligned with Figma section `3359:12417`:

```text
Login (staff JWT)
  ↓
Clock in on scheduled work shift (Figma Profile; backend exists, UI not wired)
  ↓
Active WaiterTableAssignment (time-bound; tables assigned by manager)
  ↓
Home: My Table cards + pending-order strip + Create Order
  ↓
Table Details: ALL / Pending / Active / Completed → Accept | Reject | Serve
  ↓
Browse Menu → cart → send order on behalf of customer (requires existing table session)
  ↓
Kitchen prepares → READY → waiter Serves
  ↓
Alerts: customer call_waiter / request_bill / need_help (Figma also shows delay/escalation — not in backend)
  ↓
Bill: offline cash/card request → cashier confirms (not waiter)
  ↓
Clear table: POST /sessions/:sessionId/close (invariants: unpaid + in-prep items)
  ↓
JARVIS copilot (external AI host, not Nest waiter module)
  ↓
Profile: GET /auth/me, change password; clock out
```

**Frontend that matches Figma**: `frontend/waiter/src/components/new-waiter-dashboard/`  
Primary shell: `NewWaiterLandingView.tsx` with bottom dock `Home / Order / JARVIS / Alert / Profile`.

A second, older surface exists under `frontend/waiter/src/components/updated-waiter-dashboard/` (including `BillCheckoutView.tsx`). Do not treat it as the Figma source of truth. Reuse its `requestOfflinePayment` wiring rather than recreating the client.

**Realtime**: Socket.IO room `branch:{branchId}:waiter` (see `.agent/REALTIME_AND_NOTIFICATIONS.md`). Home already reloads on window events `tavonza:order_status_changed`, `tavonza:waiter_called`, `tavonza:payment_status_changed`, etc.

---

## 2. Figma screen and navigation map

Inspected from Figma file `wIPqSCyJyaTtPNrw4kv7Kx`, canvas `730:8076`, session used for metadata dump. Labels below are the on-canvas section headers (`*Home`, `*Create Order`, …).

| Workflow phase | Figma label | Representative node | Dock tab | Next screens |
|---|---|---|---|---|
| Login | Staff login (shared identity screens; not labeled under `*Home`) | `3449:5423` (login composition inspected separately from the Waiter section headers) | — | Home |
| Home | `*Home` | `3359:12823` (home phone frame under `3359:12418`) | Home | Table Details, Create Order, Orders, Bill, Clear, dock |
| Create Order / Browse Menu | `*Create Order` | `3359:13042` Browse Menu; select-table + cart frames in the same section | Home action **Create Order** | Home after submit |
| Table Details | `*Table Details` | `3359:12426` `Table Details (All)` | Home → table card **Order** | Accept/Reject, Serve, back to Home |
| Orders | `*Orders` | Orders phone frame containing title `Orders` (`3359:14365`) | Order | Order detail / Accept / Reject |
| JARVIS | `*Jervis` | `3422:4152` | JARVIS | Home (dock) |
| Alerts | `*Alert` | `3422:4013` | Alert | Acknowledge / Escalate (escalate not in backend) |
| Profile | `*Profile` | `3422:3142` | Profile | Clock out, Change password, Language |

### Home (`3359:12823`) — verified UI actions

- Greeting + waiter first name
- **My Table** cards: table label, guest occupancy (`2/4 Guests` in design), status chip (`New Order` / `Occupied` / `Available` / `Ready To Serve`), **Order** / **Bill** / **Clear**
- **Create Order** primary button
- **Pending Orders** strip (order number, table, item summary, price, **Pending** / **Active**)
- Bottom dock: Home, Order, JARVIS, Alert, Profile

### Table Details (`3359:12426`) — verified UI actions

- Back, table title (`Table-01`)
- Tabs: **ALL / Pending / Active / Completed**
- **Action Needed (N)**
- Order card: status, order number, time + **Target 12min**, line items + prices, **Accept** / **Reject**
- Cooking / Ready to Serve states on later frames in the same `*Table Details` section

### Create Order (`3359:13042`) — verified UI actions

- Select table
- Browse menu (categories, item cards, add)
- Cart / ticket with quantity, modifications, **Send to kitchen** (wording in frontend: `handleSendToKitchen`)

### Alerts (`3422:4013`) — verified UI actions

- Header **Alert**
- Cards such as **Order Delayed** with **Check Status**, **Acknowledge & send to kitchen**, **Escalate to Manager**
- These labels **do not match** backend alert types (`call_waiter`, `request_bill`, `need_help`, `custom`)

### Profile (`3422:3142`) — verified UI actions

- Clock Out
- Personal / work information
- Performance KPIs (orders served / created) — no waiter analytics API verified
- Change password
- Language

### JARVIS (`3422:4152`)

- Chat composer, suggested prompts, voice affordances
- Frontend talks to `POST {NEXT_PUBLIC_AI_API_URL}/ai/chat`, not to `apps/api` waiter controllers

### Navigation graph (Figma dock)

```text
Login → Home
Home.Create Order → Browse Menu → (ticket) → Home
Home.table.Order → Table Details → Home
Home.table.Bill → bill sheet (Figma; backend bill + offline request)
Home.table.Clear → table Available (Figma; backend session close)
Dock.Order → Orders (ALL/Pending/Active/Completed)
Dock.JARVIS → JARVIS
Dock.Alert → Alert
Dock.Profile → Profile
```

---

## 3. Authentication, authorization, and conventions

### 3.1 Auth mechanics

| Item | Verified value |
|---|---|
| Login | `POST /auth/login` · `LoginDto`: `{ email, password }` |
| Tokens | `AuthTokensDto`: `{ accessToken, refreshToken, user }` |
| Header | `Authorization: Bearer <accessToken>` (`JwtAuthGuard`) |
| Waiter cookie | Frontend `WAITER_TOKEN_KEY = 'waiter_token'` in `frontend/waiter/src/redux/api/baseApi.ts` |
| JWT payload | `sub`, `email`, `role`, `globalRole?`, `branchId?`, `permissions?`, `scopes?`, `organizationId?` (`jwt.strategy.ts`) |
| Profile | `GET /auth/me` or `GET /me` |
| Staff assignments | `GET /me/assignments` |
| Refresh | `POST /auth/refresh` `{ refreshToken }` |
| Logout | `POST /auth/logout` |
| Change password | `POST /auth/change-password` |

Waiter app role is staff `WAITER` (`packages/authorization/src/role.ts`), not a separate login endpoint. There is a documentation-only `WaiterLoginContextDto` in `waiter-request.dto.ts`; it is **not** a live route.

### 3.2 Default WAITER permissions

From `STAFF_ROLE_DEFAULT_PERMISSIONS[StaffRole.WAITER]`:

`VIEW_ORDERS`, `ORDERS_READ`, `ORDERS_CREATE`, `ORDERS_ACCEPT`, `ORDERS_REJECT`, `ORDERS_UPDATE`, `ORDERS_SERVE`, `UPDATE_ORDER_STATUS`, `TABLES_READ`, `TABLES_UPDATE`, `MANAGE_TABLES`, `ALERTS_READ`, `ALERTS_ACKNOWLEDGE`, `ALERTS_RESOLVE`.

Manager-oriented routes `POST /waiter/tables/assign` and `POST /waiter/tables/unassign` also require `TABLES_UPDATE`. They are **not** Figma Waiter-app actions; table assignment is a manager/admin concern. Waiters consume the result via `GET /waiter/tables`.

### 3.3 Branch isolation

Most waiter list endpoints take optional `branchId` and fall back to `user.branchId` from the JWT. `GET /waiter/alerts` **requires** `branchId`. `WaiterService.assertWaiterOwnsTable` is enforced on accept / reject / serve / create-on-behalf / order detail.

### 3.4 Standard errors

Controllers decorate `@ApiStandardErrors(400, 401, 403, 404, 500)` (subset per route). Nest throws `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`. Do not assume a custom envelope beyond what each method returns.

### 3.5 Frontend loading / empty / error (required UX)

Unless a screen currently ignores these states (called out per screen):

| State | Requirement |
|---|---|
| Loading | Disable primary actions; skeleton or spinner on lists |
| Empty | Home with zero assignments: empty My Table, not demo tables; Alerts with `[]`: empty copy |
| Success | Toast + refetch lists (`GET /waiter/tables` + `GET /waiter/orders`) |
| 401 | Clear `waiter_token`, redirect `/new-waiter-dashboard/login` |
| 403 | Toast “not assigned / missing permission”; do not retry with a different branch |
| 409 on session close | Show invariant message; do not locally mark table Available |

---

## 4. Complete API reference

Base path is the Nest API (`apps/api`). All waiter module routes are REST (no GraphQL waiter operations found).

Classification key used throughout:

| Status | Meaning |
|---|---|
| **Implemented and verified** | Controller + DTO + service exist in source |
| **Implemented but incomplete** | Exists, but contract or behavior is insufficient for the Figma action |
| **Implemented but not integrated** | Backend exists; Figma-aligned UI does not call it (or only a leftover dashboard does) |
| **Missing from the backend** | Figma action has no matching verified endpoint |
| **Blocked** | Cannot ship until a dependency or product rule is confirmed |

---

### 4.1 `POST /auth/login` — Staff login

| Field | Value |
|---|---|
| Purpose | Authenticate waiter; persist JWT |
| Figma | Login (`3449:5423`); submit of email + password |
| When | Form submit |
| Auth | Public |
| Status | **Implemented and verified** · **Integrated** (`authApi` + `NewWaiterLoginMobileView`) |

**Request** (`LoginDto`):

```json
{
  "email": "waiter@restaurant.com",
  "password": "SecurePass123!"
}
```

**Response** (`AuthTokensDto`):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "d7a1c9e8-b2f3-4567-8901-234567abcdef",
  "user": {
    "id": "f0e1d2c3-b4a5-6789-0123-456789abcdef",
    "email": "waiter@restaurant.com",
    "name": "Alex Waiter",
    "firstName": "Alex",
    "lastName": "Waiter",
    "role": "STAFF",
    "permissions": ["ORDERS_READ", "ORDERS_ACCEPT", "TABLES_READ", "ALERTS_READ"],
    "organizationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

`user.role` on `UserProfileDto` is the **global** role label. Staff role `WAITER` comes from assignments (`GET /me/assignments`), not necessarily `user.role`. Frontend `UserProfile` also reads `assignments[].role` and `branchId`.

**Errors**: 401 invalid credentials.

**Dependencies**: After login, call `GET /auth/me` (app already does this in `ReduxProvider`) and `GET /me/assignments` if `branchId` is missing from JWT.

---

### 4.2 `POST /auth/refresh` — Rotate tokens

| Field | Value |
|---|---|
| Figma | Silent; not a visible screen |
| When | Access token expiry / 401 retry |
| Auth | Body refresh token; controller also accepts optional JWT |
| Status | **Implemented and verified** · integrated in waiter `baseApi` refresh path |

```json
{ "refreshToken": "d7a1c9e8-b2f3-4567-8901-234567abcdef" }
```

Response: same `AuthTokensDto`.

---

### 4.3 `POST /auth/logout` — Logout

| Field | Value |
|---|---|
| Figma | Profile clock-out area / account exit (Profile `3422:3142` does not label a dedicated Logout control in the inspected frame; clock-out is the visible shift action) |
| When | User signs out |
| Auth | JWT |
| Status | **Implemented and verified** · client exists in `authApi` |

Response: `{ "message": "Logged out successfully" }`.

---

### 4.4 `GET /auth/me` and `GET /me` — Current profile

| Field | Value |
|---|---|
| Figma | Profile `3422:3142` personal/work info; also app bootstrap |
| When | Page init (Profile); session restore |
| Auth | JWT |
| Permission | Authenticated user |
| Status | **Implemented and verified** · **Integrated** (`getMe` in `ProfileView` and `ReduxProvider`) |

Response: `UserProfileDto` (see 4.1 `user` object).

**Empty/error**: 401 → login. Missing `firstName` → Figma greeting falls back to `'Michael'` in `NewWaiterLandingView` (local default, not API).

---

### 4.5 `GET /me/assignments` — Staff assignments / branch context

| Field | Value |
|---|---|
| Purpose | Resolve `branchId`, staff assignment id (needed for shifts) |
| Figma | Implicit on Home/Profile (work info) |
| When | After login if JWT has no `branchId` |
| Auth | JWT |
| Status | **Implemented and verified** · **Partially integrated** (`UserProfile.assignments` on login/getMe; dedicated call exists in identity module) |

Response type: `MyAssignmentsResponseDto` (`me.controller.ts`). Exact item shape is defined in `user-response.dto.ts`; frontend expects `{ id, branchId, branchName, role, permissions, isActive }`.

---

### 4.6 `POST /auth/change-password` — Change password

| Field | Value |
|---|---|
| Figma | Profile `3422:3142` Change password |
| When | Form submit in modal (`ProfileView`) |
| Auth | JWT |
| Status | **Implemented and verified** · **Integrated** |

**Request** (`ChangePasswordDto` — field names in identity DTO; frontend sends `currentPassword` / `oldPassword` plus new password):

```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

Confirm the exact DTO property names in `auth-request.dto.ts` before wiring a new form. Response: `{ "message": "Password changed successfully" }`. Errors: 400 current password incorrect or weak new password.

---

### 4.7 `GET /waiter/tables` — Assigned tables (Home My Table)

| Field | Value |
|---|---|
| Purpose | Tables assigned to the authenticated waiter for the active branch |
| Figma | Home `3359:12823` My Table |
| When | Home init; after realtime events; after Clear/Bill/Accept |
| Auth | JWT · `TABLES_READ` |
| Query | `branchId` optional UUID; else `user.branchId` |
| Status | **Implemented but incomplete** (no `activeSessionId`, no seated guest count) · **Integrated** on Home |

**Request**: `GET /waiter/tables?branchId=ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27`

**Response** (`TableAssignmentDto[]`). Repository `findActiveTableAssignmentsForWaiter` actually maps:

```json
[
  {
    "id": "assignment-uuid",
    "branchId": "ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27",
    "waiterId": "staff-or-user-uuid",
    "tableId": "5298804e-5847-4e5a-bdba-73a8f06d9ed2",
    "tableNumber": "Table 08",
    "capacity": 4,
    "serviceStatus": "OCCUPIED",
    "shape": "SQUARE",
    "floor": 1,
    "operationalFlag": "NORMAL",
    "sessionStart": "2026-10-08T08:00:00.000Z",
    "sessionEnd": "2026-10-08T16:00:00.000Z",
    "isActive": true,
    "waiterName": "Alex Waiter",
    "assignedTables": [
      {
        "id": "5298804e-5847-4e5a-bdba-73a8f06d9ed2",
        "label": "Table 08",
        "tableNumber": "Table 08",
        "capacity": 4,
        "serviceStatus": "OCCUPIED",
        "operationalFlag": "NORMAL",
        "floor": 1,
        "shape": "SQUARE",
        "assignmentId": "assignment-uuid",
        "sessionStart": "2026-10-08T08:00:00.000Z",
        "sessionEnd": "2026-10-08T16:00:00.000Z",
        "isActive": true
      }
    ],
    "assignedCount": 1
  }
]
```

**Not returned (verified absence)**: `activeSessionId`, seated guest count, live `orderCount`, Figma chip `New Order` / `Ready To Serve` as display enums. Home derives chips from `GET /waiter/orders` + `serviceStatus`. Guest line is rendered as `` `${capacity} Guests` ``, not `2/4`.

**Empty**: `[]` when waiter has no active `waiter_table_assignments` row.

**DB**: `waiter_table_assignments` ⋈ `tables` (`isActive = true`, waiter user id **or** staff profile id).

**Do not recreate**: this is the Home table source of truth. `GET /tables?branchId=` is a branch-wide fallback (`waiterService.getAllTables`) and is **not** assignment-scoped.

---

### 4.8 `GET /waiter/tables/assignments` — Branch assignment list

| Field | Value |
|---|---|
| Purpose | Manager/waiter list of active assignments |
| Figma | Not a Waiter-app screen |
| When | Admin/manager tooling |
| Auth | JWT · `TABLES_READ` · query `branchId` required (JWT fallback) · optional `waiterId` |
| Status | **Implemented and verified** · **Not integrated** into Figma waiter app |

---

### 4.9 `POST /waiter/tables/assign` — Manager assign tables

| Field | Value |
|---|---|
| Figma | Not in Waiter canvas (manager/admin) |
| Auth | JWT · `TABLES_UPDATE` |
| Status | **Implemented and verified** · **Not a waiter-app API** |

**Request** (`AssignTableDto`):

```json
{
  "branchId": "ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27",
  "waiterId": "00000001-0000-4000-8000-000000000002",
  "tableIds": ["5298804e-5847-4e5a-bdba-73a8f06d9ed2"],
  "sessionStart": "2026-10-07T09:00:00Z",
  "sessionEnd": "2026-10-07T17:00:00Z",
  "shiftLabel": "Lunch Shift (10:00 AM - 04:00 PM)"
}
```

Related: `POST /waiter/tables/unassign`, `DELETE /waiter/tables/assign/:assignmentId`. Waiter Home **depends** on these having already run. Do not call assign from the Figma waiter dock.

---

### 4.10 `GET /waiter/orders` — Orders for assigned tables

| Field | Value |
|---|---|
| Purpose | List orders on waiter tables with filters |
| Figma | Home pending strip; Table Details `3359:12426`; Orders `*Orders` |
| When | Home init; Table Details when a table is selected; Orders tab init; after accept/reject/serve |
| Auth | JWT · `ORDERS_READ` |
| Status | **Implemented and verified** (list attaches items via `attachTableAndItems`) · **Integrated** on Home + Table Details load + `OrdersListView` |

**Query**

| Param | Required | Notes |
|---|---|---|
| `branchId` | if JWT has none | UUID; 400 if missing |
| `scope` | no | `my_tables` (default filter-in assigned ids), `ALL_TABLES`, `PENDING`, `ACTIVE`, `SERVED`/`COMPLETED`, `CANCELLED`/`REJECTED` |
| `status` | no | Single status or comma-separated |
| `tableId` | no | UUID **or** table label (resolved in branch) |
| `search` | no | `orderNumber` and `guestName` |

Swagger documents `WaiterOrderSummaryDto`. Repository returns order rows **plus** table label and items (`attachTableAndItems`). Treat extra fields as implemented in persistence, not in the Swagger DTO.

**Example**

`GET /waiter/orders?branchId=ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27&tableId=5298804e-5847-4e5a-bdba-73a8f06d9ed2`

```json
[
  {
    "id": "8877332f-4512-40bc-8012-d881e6e58003",
    "orderNumber": "ORD-84920",
    "tableId": "5298804e-5847-4e5a-bdba-73a8f06d9ed2",
    "tableSessionId": "8877332f-4512-40bc-8012-d881e6e58003",
    "status": "SUBMITTED",
    "total": "36.80",
    "placedByWaiterId": null,
    "customerAutoCreated": false,
    "rejectionReason": null,
    "submittedAt": "2026-10-08T14:35:00.000Z",
    "acceptedAt": null,
    "servedAt": null
  }
]
```

Item/table extras may be present from `attachTableAndItems`. **Not present**: Figma `Target 12min`, elapsed SLA.

**Empty**: `[]` when waiter has no assigned tables (my-tables scope) or no matching orders.

**Frontend mapping (Home)**: treats `PENDING` and `SUBMITTED` (and some `DRAFT` cases) as pending strip items. Status chips: `CONFIRMED`/`PREPARING` → Cooking, `READY` → Ready to Serve, `SERVED`/`COMPLETED` → Completed.

---

### 4.11 `GET /waiter/orders/pending` — Pending queue

| Field | Value |
|---|---|
| Figma | Home pending strip; Table Details **Pending** tab; Orders **Pending** |
| When | Alternative to filtered `GET /waiter/orders` |
| Auth | JWT · `ORDERS_READ` · `branchId` required (JWT fallback) |
| Status | **Implemented but incomplete** |

Implementation: `findPendingOrdersForTables` → `status: 'PENDING'` only.

`.agent/FLOWS.md` waiter-approval path uses **SUBMITTED** until accept. `canWaiterTransition` allows accept from `SUBMITTED` **and** `PENDING`. Prefer `GET /waiter/orders` with client/server filter `PENDING,SUBMITTED` until this endpoint is expanded.

`waiterApi` pending/active helpers fall back to `/orders/branch/:id` if waiter routes fail — that fallback is a compatibility path, not the Figma contract.

---

### 4.12 `GET /waiter/orders/active` — Active kitchen/floor orders

| Field | Value |
|---|---|
| Figma | Table Details **Active**; Orders **Active** |
| Auth | JWT · `ORDERS_READ` |
| Status | **Implemented but incomplete** relative to Figma |

Repository `scope=ACTIVE` uses statuses `CONFIRMED`, `PREPARING`, `READY`. Dedicated `getActiveOrders` uses `findActiveOrdersForTables`. Confirm in `drizzle-waiter-order.repository.ts` whether `ACCEPTED` is included — Swagger text says `ACCEPTED, PREPARING, READY` while the `scope=ACTIVE` filter uses `CONFIRMED, PREPARING, READY`. **Do not assume `ACCEPTED` is returned until verified in that finder.**

---

### 4.13 `GET /waiter/orders/:id` — Order detail

| Field | Value |
|---|---|
| Figma | Table Details card expansion; `OrderDetailView` |
| When | Open order / before Accept-Reject-Serve |
| Auth | JWT · `ORDERS_READ` · waiter must own table |
| Status | **Implemented and verified** · **Integrated** in `OrderDetailView` |

Response `WaiterOrderDetailDto` = summary + `items[]` (`WaiterOrderItemDto`: `id`, `menuItemId`, `name`, `quantity`, `unitPrice`, `specialInstructions`, `status`).

**Errors**: 404 order not found; 403 table not assigned to waiter.

---

### 4.14 `POST /waiter/orders/:id/accept` — Accept order

| Field | Value |
|---|---|
| Figma | Table Details **Accept**; Orders **Accept** |
| When | Button click on `SUBMITTED` or `PENDING` order |
| Auth | JWT · `ORDERS_ACCEPT` · owns table |
| Body | none |
| Status | **Implemented and verified** · **Integrated** in `OrdersListView` / `OrderDetailView` · **Not integrated** on Home Table Details handlers in `NewWaiterLandingView` (those mutate local state) |

Response: `{ "message": "Order accepted and sent to kitchen" }` (`WaiterMessageDto`).

**Side effects** (`waiter.service.ts`): order → accepted; table `serviceStatus` → `PREPARING`; outbox `OrderAccepted` + `TableStatusChanged`.

**Errors**: 400 if `canWaiterTransition(status, ACCEPTED)` is false (message text still says “must be in SUBMITTED status” even though `PENDING` is also allowed). 404 / 403 as above.

**Idempotency**: not documented; repeating accept on `ACCEPTED` is expected to 400. Do not retry blindly.

---

### 4.15 `POST /waiter/orders/:id/reject` — Reject order

| Field | Value |
|---|---|
| Figma | Table Details **Reject** |
| When | Button click; reason required |
| Auth | JWT · `ORDERS_REJECT` |
| Status | **Implemented and verified** · integrated in Orders views; **not** in landing Table Details |

**Request** (`RejectOrderDto`; path `id` is authoritative, body also has `orderId`):

```json
{
  "orderId": "8877332f-4512-40bc-8012-d881e6e58003",
  "reasonCode": "ITEM_UNAVAILABLE",
  "reason": "Potato Corn Burger is 86'd"
}
```

`reasonCode` / `rejectionReasonCode` enum: `ITEM_UNAVAILABLE` | `KITCHEN_CAPACITY` | `MODIFICATION_IMPOSSIBLE` | `ALLERGY_CONCERN` | `RESTAURANT_CLOSING` | `OTHER`.

Response: `{ "message": "Order rejected" }`. Outbox `OrderRejected`.

Figma Reject control on Table Details does **not** show a reason-code picker in the inspected All frame; backend **requires** `reason` string. UI must collect a reason (modal) or send a default note — product confirmation needed (see §11).

---

### 4.16 `POST /waiter/orders/:id/serve` — Mark served

| Field | Value |
|---|---|
| Figma | Table Details Ready-to-Serve **Serve** (later frames in `*Table Details`) |
| When | Order `status === READY` |
| Auth | JWT · `ORDERS_SERVE` |
| Status | **Implemented and verified** · integrated in Orders views; landing Table Details uses local `handleMarkTableOrderServed` |

Response: `{ "message": "Order marked as served" }`. Allowed from `READY` → `SERVED` (also `COMPLETED` in `WAITER_ALLOWED_TRANSITIONS`; serve method targets `SERVED`). Outbox `OrderServed`.

Waiter **cannot** legally transition `PREPARING` → `READY`. That is kitchen/bar. Landing’s `handleAdvanceToReadyToServe` is UI-only and must not be treated as an API.

---

### 4.17 `POST /waiter/orders` — Create order on behalf of customer

| Field | Value |
|---|---|
| Purpose | Waiter punches an order for a seated table |
| Figma | Create Order / Browse Menu `3359:13042` → Send to kitchen |
| When | Cart submit |
| Auth | JWT · `ORDERS_CREATE` · owns `tableId` |
| Status | **Implemented but incomplete** · client method `waiterService.createOrderOnBehalf` exists · **Figma Create Order submit is local toast only** (`handleSendToKitchen`) |

**Request** (`CreateOrderOnBehalfDto`):

```json
{
  "branchId": "ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27",
  "tableId": "5298804e-5847-4e5a-bdba-73a8f06d9ed2",
  "tableSessionId": "8877332f-4512-40bc-8012-d881e6e58003",
  "customerIdentifier": "guest@example.com",
  "items": [
    {
      "menuItemId": "4455110d-8720-41ab-bc92-d667c4c36001",
      "name": "Potato Corn Burger",
      "unitPrice": "14.50",
      "quantity": 1,
      "specialInstructions": "No onions",
      "addOns": [{ "name": "Extra cheese", "price": 1.5 }]
    }
  ]
}
```

**Required**: existing `tableSessionId`. There is **no** verified waiter endpoint that opens a table session. Customer flow uses `POST /sessions/scan`. Figma Select Table does not collect session or identifier.

**Response** (`CreateOrderOnBehalfResponseDto`):

```json
{
  "order": {
    "id": "...",
    "orderNumber": "W-1710000000000-123",
    "tableId": "...",
    "tableSessionId": "...",
    "status": "...",
    "total": "36.80"
  },
  "customerAutoCreated": true,
  "customerId": "11223344-5566-7788-99aa-bbccddeeff00"
}
```

**Business facts (do not silently change)**:

- Auto-created customer password hash is argon2 of `'1234'` (`waiter.service.ts`) — security risk; not a Figma field.
- Tax 8% and service 5% are **hardcoded**, not `branch_settings`.
- Order number `W-{timestamp}-{rand}`.

**Blocked by**: missing `tableSessionId` on `GET /waiter/tables`; no waiter “open session” API.

---

### 4.18 `GET /menus/:branchId/items` — Menu for Create Order

| Field | Value |
|---|---|
| Figma | Browse Menu `3359:13042` |
| When | Enter Create Order / menu tab |
| Auth | Public on controller (no waiter-specific permission on this GET; still used with waiter JWT by frontend) |
| Query | optional `categoryId`, `search`, `popular` |
| Status | **Implemented and verified** · **Integrated** (`getMenuItems` in landing Create Order) |

Response: `MenuItemListResponseDto[]`. Use real item `id` as `menuItemId` on create-on-behalf.

Related optional: `GET /menus/:branchId/categories` on the same controller.

---

### 4.19 `GET /tables?branchId=` — All branch tables

| Field | Value |
|---|---|
| Purpose | Unfiltered branch table list |
| Figma | Create Order select-table **if** product wants any table, not only assigned ones — **not confirmed** |
| Auth | JWT · `TABLES_READ` · branch access asserted |
| Status | **Implemented and verified** · client `getAllTables` exists · Home correctly uses `GET /waiter/tables` instead |

FLOWS.md requires assignment before serving a table. Select-table in Create Order should stay on assigned tables unless product says otherwise.

---

### 4.20 `GET /waiter/alerts` — Pending assistance alerts

| Field | Value |
|---|---|
| Figma | Alert `3422:4013` |
| When | Alert tab init; realtime `tavonza:waiter_called` |
| Auth | JWT · `ALERTS_READ` · **`branchId` query required** |
| Status | **Implemented but incomplete** (branch-wide pending; types ≠ Figma) · **Integrated** in `AlertsView` |

```json
[
  {
    "id": "aa112233-4455-6677-8899-00aabbccddee",
    "branchId": "ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27",
    "tableId": "5298804e-5847-4e5a-bdba-73a8f06d9ed2",
    "tableSessionId": "8877332f-4512-40bc-8012-d881e6e58003",
    "customerSessionId": null,
    "type": "call_waiter",
    "message": "Need extra napkins",
    "status": "pending",
    "acknowledgedById": null,
    "acknowledgedAt": null,
    "resolvedAt": null,
    "createdAt": "2026-10-08T14:38:00.000Z"
  }
]
```

`type` enum: `call_waiter` | `request_bill` | `need_help` | `custom`.  
`status`: `pending` | `acknowledged` | `resolved`.

Service: `findPendingForBranch` after confirming staff is assigned to the branch. **Not** filtered to waiter-owned tables.

Figma **Order Delayed** / **Escalate to Manager** / **Acknowledge & send to kitchen** are **not** these types.

---

### 4.21 `PATCH /waiter/alerts/:id/acknowledge`

| Field | Value |
|---|---|
| Figma | Alert **Acknowledge** (closest match; Figma copy adds “send to kitchen”) |
| When | Button click |
| Auth | JWT · `ALERTS_ACKNOWLEDGE` |
| Status | **Implemented and verified** · **Integrated** (`ackAlert`) |

Response: `{ "message": "Alert acknowledged" }`. 400 if already `resolved`. Outbox `AlertAcknowledged`. Does **not** dispatch anything to kitchen.

---

### 4.22 `PATCH /waiter/alerts/:id/resolve`

| Field | Value |
|---|---|
| Figma | Completing an alert after visiting the table (not labeled “Resolve” on the inspected card) |
| Auth | JWT · `ALERTS_RESOLVE` |
| Status | **Implemented and verified** · **Integrated** (`resolveAlert`) |

Response: `{ "message": "Alert resolved" }`.

---

### 4.23 `POST /alerts` — Customer creates alert

| Field | Value |
|---|---|
| Figma | Customer app, not waiter canvas |
| Auth | **No `JwtAuthGuard` on this method** |
| Status | **Implemented and verified** · waiter `createAlert` client exists (unusual for waiter UI) |

Waiters should **read/ack/resolve**, not create customer alerts, unless product confirms a floor-side “need help” log.

---

### 4.24 `POST /sessions/:sessionId/request-bill`

| Field | Value |
|---|---|
| Purpose | Notify floor/cashier guests want the bill |
| Figma | Home **Bill** is closer to showing a bill + taking payment; this endpoint is the customer “request bill” action |
| Auth | Not JWT-guarded on the method (customer session action) |
| Status | **Implemented and verified** · **Not integrated** in Figma waiter Home |

Response: `SessionActionResponseDto` (session module). Prefer waiter **Bill** → `GET /payments/session/:sessionId/bill` + `POST /payments/request-offline`.

---

### 4.25 `POST /sessions/:sessionId/call-waiter`

Customer call. Creates the alert waiter sees. **Not** a waiter-app call.

---

### 4.26 `POST /sessions/:sessionId/close` — Clear table

| Field | Value |
|---|---|
| Figma | Home **Clear** |
| When | Waiter confirms table can be released |
| Auth | JWT |
| Status | **Implemented and verified** · **Not integrated** (landing `handleClearTable` only updates local React state + toast) |

Response: `{ "success": true, "message": "Session closed" }`.

**Invariants** (controller description + FLOWS.md): unpaid orders must be settled; no pending/preparing items. Expect **409/400** when invariants fail. Table should move toward `AVAILABLE`.

**Blocked on Home**: `GET /waiter/tables` does not return `activeSessionId`. Close cannot be called from assignment payload alone. Need session id from an order’s `tableSessionId` or a new field on tables.

---

### 4.27 `GET /sessions/:sessionId` — Session + guests

| Field | Value |
|---|---|
| Purpose | Session detail / guest list |
| Figma | Home `2/4 Guests` **if** occupancy is derived here |
| Auth | Session module (see `CUSTOMER_SESSIONS_API.md`) |
| Status | **Implemented and verified** (customer sessions) · **Not integrated** in waiter Home |

Do not invent occupancy from `capacity` only.

---

### 4.28 `GET /payments/session/:sessionId/bill` — Table bill

| Field | Value |
|---|---|
| Figma | Home **Bill** |
| When | Bill button |
| Auth | Check `PaymentController` method — JWT is used on several payment routes; confirm guard on this specific GET before assuming 401 behavior |
| Status | **Implemented and verified** · **Not integrated** in Figma waiter Home (`waiterApi` has no wrapper) |

**Response** (`TableBillCalculationResponseDto`):

```json
{
  "tableSessionId": "8877332f-4512-40bc-8012-d881e6e58003",
  "ordersCount": 2,
  "subtotal": 70.0,
  "taxAmount": 3.5,
  "serviceCharge": 7.0,
  "totalAmount": 80.5,
  "paidAmount": 40.0,
  "balanceDue": 40.5,
  "isFullyPaid": false
}
```

Empty/zero: `balanceDue === 0` → `requestOfflinePayment` throws “Outstanding balance is zero”.

---

### 4.29 `POST /payments/request-offline` — Waiter requests cashier settlement

| Field | Value |
|---|---|
| Figma | Home **Bill** confirm cash/card |
| When | After displaying bill, waiter collects method |
| Auth | **Method is not wrapped in `JwtAuthGuard` in `payment.controller.ts`** (documented as Customer/Waiter) |
| Status | **Implemented and verified** · client in `waiterApi.requestOfflinePayment` · **Figma Home not wired**; leftover `updated-waiter-dashboard` checkout uses it |

**Request** (`RequestOfflinePaymentDto`):

```json
{
  "orderId": "8877332f-4512-40bc-8012-d881e6e58003",
  "tableSessionId": "8877332f-4512-40bc-8012-d881e6e58003",
  "method": "CASH",
  "tipAmount": 2.0
}
```

Either `orderId` **or** `tableSessionId` required. `method`: `CASH` | `CARD`.

**Response**: `PaymentRecordResponseDto` (`id`, `orderId`, `tableSessionId`, `scope`, `amount`, `tipAmount`, `status`, `method`, …). Service creates `UNPAID` payment, sets session `BILL_REQUESTED`, table `PAYMENT_PENDING`.

Frontend `waiterApi` types `{ success, paymentId, status, message }` — **that shape is not the Nest DTO**. Map `id` / `status` from `PaymentRecordResponseDto`.

**Cashier next steps (not waiter Figma)**: `POST /payments/offline/:id/confirm`, `POST /payments/confirm-offline`. Waiter must not confirm cash as paid unless product changes FLOWS.md (cashier settles).

---

### 4.30 `GET /shifts/staff/:staffAssignmentId` — Waiter’s shifts

| Field | Value |
|---|---|
| Figma | Profile clock in/out needs a shift id |
| When | Profile init |
| Auth | JWT (`ShiftController` class guard) |
| Status | **Implemented and verified** · **Not integrated** in waiter Profile |

Optional query `date=YYYY-MM-DD`. Response `WorkShiftResponseDto[]` (`id`, `branchId`, `staffAssignmentId`, `name`, `startTime`, `endTime`, `durationMin`, `date`, `status`, `checkInAt`, `checkOutAt`, `note`, …).

`staffAssignmentId` comes from `GET /me/assignments`, **not** from `user.sub` alone.

---

### 4.31 `PATCH /shifts/:id/clock-in` and `PATCH /shifts/:id/clock-out`

| Field | Value |
|---|---|
| Figma | Profile `3422:3142` Clock Out (and implied Clock In) |
| When | Button click |
| Auth | JWT |
| Status | **Implemented and verified** · **Not integrated** (`ProfileView` clock is local React state) |

**Request** (`ClockInDto` / `ClockOutDto`):

```json
{ "timestamp": "2026-10-04T16:00:00Z", "note": "Covered floor table 12-18" }
```

Both fields optional. Response: `WorkShiftResponseDto`.

---

### 4.32 `GET /notifications` and `GET /notifications/unread-count`

| Field | Value |
|---|---|
| Figma | Alert tab could mix persistent notifications; design shows operational alert cards |
| Auth | JWT |
| Status | **Implemented and verified** · **Not integrated** in waiter Alert tab |

Do not substitute these for `GET /waiter/alerts`.

---

### 4.33 JARVIS — `POST {AI_BASE}/ai/chat`

| Field | Value |
|---|---|
| Figma | JARVIS `3422:4152` send / voice |
| When | Composer submit; voice transcript complete |
| Auth | Bearer token (frontend); host is `NEXT_PUBLIC_AI_API_URL` or `https://ai.tavonza.com` |
| Status | **Implemented in waiter client** (`chatApi.ts`) · **not** a Nest `apps/api` waiter controller |

```json
{ "message": "Which tables are waiting longest?", "session_id": "waiter_floor_copilot" }
```

Client maps `{ reply, session_id, action, data }`. Voice: frontend `useJarvisVoice` + `/ai/voice/transcribe|synthesize` in the same client file. Tool-gateway rules in `.agent/AI.md` still apply on the AI host; this guide does not invent those internal contracts.

**Filters** All / Upsell / Needs Attention / Regulars on the JARVIS screen are **frontend-only** in `JarvisCopilotView` (`activeFilter` state). No matching waiter API was found.

---

### 4.34 Realtime (not HTTP)

Join `branch:{branchId}:waiter`. Events used by Home reload: table status, session, order created/status/item, waiter called, payment status (window event names in `NewWaiterLandingView`). Source of truth remains HTTP refetch after events.

---

## 5. Screen-by-screen API integration guide

### 5.1 Login

1. **Screen**: Staff login · Figma `3449:5423` · route `/new-waiter-dashboard/login`
2. **Purpose**: Authenticate waiter and store `waiter_token`
3. **On load**: none (public)
4. **On submit**: `POST /auth/login`
5. **Display**: none from API until success; then `user.name` / assignments
6. **State**: persist tokens + user; redirect `/new-waiter-dashboard/dashboard`
7. **Next**: Home
8. **Errors**: 401 invalid credentials. Permission: staff assignment `WAITER` should exist; login itself does not check waiter role in the controller summary (it is generic identity login)

**Reuse**: existing `authApi.login` / `NewWaiterLoginMobileView`.

---

### 5.2 Home — My Table + pending + Create Order

1. **Screen**: `*Home` · `3359:12823` · `NewWaiterLandingView` tab `home`
2. **Purpose**: Assigned tables, pending work, entry to create/order/bill/clear
3. **On load** (already wired):
   - `GET /waiter/tables?branchId=`
   - `GET /waiter/orders?branchId=`
   - Subscribe to realtime window events and refetch both
4. **On action**:

| UI control | Required API | Current code |
|---|---|---|
| Table **Order** | Navigate to Table Details; `GET /waiter/orders?tableId=` | Load query **is** wired; accept/reject **local** |
| Table **Bill** | `GET /payments/session/:sessionId/bill` then `POST /payments/request-offline` | Not wired on this screen |
| Table **Clear** | `POST /sessions/:sessionId/close` | Local toast `handleClearTable` |
| **Create Order** | Switch to menu; later `POST /waiter/orders` | Menu load wired; submit local |
| Pending card | Open Table Details / Orders | Display mapped from `GET /waiter/orders` |

5. **Data mapping**

| Figma | Source field |
|---|---|
| Table name | `tableNumber` / `label` |
| Guests `2/4` | **Not available**; UI shows `capacity` only |
| Status chip | Derived: order count → `New Order`; `OCCUPIED`/`PREPARING` → Occupied; `READY` (table flag) → Ready To Serve |
| Pending items/price | order `items`, `total` / `totalAmount` |
| Location “Main Hall” | **Hardcoded** in landing, not API |

6. **State**: `tables`, `pendingOrders` React state. Clear/create currently **desync** from server.
7. **Next**: Table Details, Create Order, dock
8. **Permissions**: `TABLES_READ`, `ORDERS_READ`. Empty assignments → empty My Table (do not keep demo `T-01` after a successful empty fetch; landing still uses `'T-01'` as a sentinel when loading table orders)

---

### 5.3 Table Details

1. **Screen**: `Table Details (All)` `3359:12426`
2. **Purpose**: Per-table order queue and accept/reject/serve
3. **On load**: `GET /waiter/orders?branchId=&tableId=` (wired when `selectedTable.id !== 'T-01'`)
4. **On action**:

| UI | API | Integration |
|---|---|---|
| Tab Pending/Active/Completed | Client filter **or** `status` / `GET .../pending` / `.../active` | Client filter in landing |
| **Accept** | `POST /waiter/orders/:id/accept` | Landing local; **OrdersListView / OrderDetailView wired** |
| **Reject** | `POST /waiter/orders/:id/reject` + reason | Same split |
| **Serve** | `POST /waiter/orders/:id/serve` | Same split |
| Target 12min | — | **Missing** |

5. **Display**: `orderNumber`, `submittedAt` → time, `items[].name/quantity/unitPrice`, `status`
6. **State after Accept**: order accepted, table `PREPARING`; refetch Home + this list
7. **Next**: stay on Table Details or back Home
8. **Errors**: 400 wrong status; 403 not assigned. Disable Accept unless `PENDING`/`SUBMITTED`

---

### 5.4 Orders (dock)

1. **Screen**: `*Orders` · title node `3359:14365`
2. **Component**: `OrdersListView.tsx` / `OrderDetailView.tsx`
3. **On load**: `waiterService.queryOrders` (**integrated**)
4. **Actions**: accept / reject / serve (**integrated**)
5. **Reuse this screen’s wiring** for Table Details rather than duplicating local handlers
6. **Next**: order detail → back to list / Home

---

### 5.5 Create Order / Browse Menu

1. **Screen**: `*Create Order` · Browse Menu `3359:13042`
2. **On load**: `GET /menus/:branchId/items` (**integrated**); tables from already-loaded `GET /waiter/tables`
3. **Cart**: local state (`cartItems`, modifications)
4. **Submit**: **must** become `POST /waiter/orders` with `tableSessionId` + `customerIdentifier` + line items  
   Current: `handleSendToKitchen` invents `#random` order ids and toasts
5. **Blocked** until session id is available (see §7.1)
6. **Next Figma**: Home with table `New Order`
7. **Errors**: 400 validation; 403 table not assigned; missing session

---

### 5.6 Bill (Home Bill)

1. **Screen**: Home Bill control (sheet/modal in Figma Home)
2. **On open**: resolve `tableSessionId` → `GET /payments/session/:sessionId/bill`
3. **Display**: `subtotal`, `taxAmount`, `serviceCharge`, `totalAmount`, `paidAmount`, `balanceDue`
4. **On confirm method**: `POST /payments/request-offline` `{ tableSessionId, method: "CASH"|"CARD", tipAmount? }`
5. **State**: table `PAYMENT_PENDING`; **do not** close table yet
6. **Next**: wait for cashier confirm (realtime `payment_status_changed`) then Clear
7. **Reuse**: `waiterService.requestOfflinePayment` (fix response mapping to `PaymentRecordResponseDto`)

---

### 5.7 Clear table

1. **Screen**: Home **Clear**
2. **On click**: `POST /sessions/:sessionId/close`
3. **Success**: table `AVAILABLE`; remove from occupied styling; refetch `GET /waiter/tables`
4. **Error 409/400**: show server message; keep occupied
5. **Forbidden to fake success** as current toast does

---

### 5.8 Alerts

1. **Screen**: `*Alert` `3422:4013` · `AlertsView.tsx`
2. **On load**: `GET /waiter/alerts?branchId=` (**integrated**)
3. **Acknowledge**: `PATCH /waiter/alerts/:id/acknowledge` (**integrated**) — maps only to “waiter is coming”, **not** “send to kitchen”
4. **Resolve**: `PATCH .../resolve` (**integrated**)
5. **Check Status**: no dedicated API; closest is `GET /waiter/orders/:id` or table-filtered list — **not wired** to Figma copy
6. **Escalate to Manager**: **Missing**
7. **Empty**: `[]` pending alerts
8. **Do not** invent `order_delayed` types in the client

---

### 5.9 Profile

1. **Screen**: `*Profile` `3422:3142` · `ProfileView.tsx`
2. **On load**: `GET /auth/me` (**integrated**); should also `GET /me/assignments` + `GET /shifts/staff/:staffAssignmentId`
3. **Clock in/out**: `PATCH /shifts/:id/clock-in|out` — **not integrated**
4. **Change password**: `POST /auth/change-password` (**integrated**)
5. **Performance KPIs**: **Missing**
6. **Language**: **Missing** (local-only if implemented)
7. **Logout**: `POST /auth/logout` + clear cookie

---

### 5.10 JARVIS

1. **Screen**: `*Jervis` `3422:4152` · `JarvisCopilotView.tsx`
2. **On load**: local chat slice (no waiter HTTP)
3. **Send**: `POST /ai/chat` (**integrated** to AI host)
4. **Filters**: local only
5. **Next**: remain on JARVIS; dock Home

---

## 6. Missing and incomplete API audit

### 6.1 Classification matrix

| API / capability | Classification | Figma |
|---|---|---|
| `POST /auth/login` | Implemented and verified · integrated | Login |
| `GET /auth/me` | Implemented and verified · integrated | Profile / bootstrap |
| `POST /auth/change-password` | Implemented and verified · integrated | Profile |
| `GET /waiter/tables` | Implemented but incomplete | Home My Table |
| `GET /waiter/orders` | Implemented and verified · integrated | Home, Table Details, Orders |
| `GET /waiter/orders/pending` | Implemented but incomplete (`PENDING` only) | Pending tabs |
| `GET /waiter/orders/active` | Implemented but incomplete (`ACCEPTED` vs `CONFIRMED` mismatch in docs vs filter) | Active tabs |
| `GET /waiter/orders/:id` | Implemented and verified · integrated | Order detail |
| `POST /waiter/orders/:id/accept` | Implemented and verified · integrated on Orders, **not** landing Table Details | Accept |
| `POST /waiter/orders/:id/reject` | Implemented and verified · same split | Reject |
| `POST /waiter/orders/:id/serve` | Implemented and verified · same split | Serve |
| `POST /waiter/orders` | Implemented but incomplete · **not integrated** on Figma submit | Create Order |
| `GET /menus/:branchId/items` | Implemented and verified · integrated | Browse Menu |
| `GET /waiter/alerts` | Implemented but incomplete · integrated | Alert |
| `PATCH .../acknowledge` / `resolve` | Implemented and verified · integrated | Alert |
| `POST /sessions/:id/close` | Implemented and verified · **not integrated** | Clear |
| `GET /payments/session/:id/bill` | Implemented and verified · **not integrated** | Bill |
| `POST /payments/request-offline` | Implemented and verified · client exists · Home **not** integrated | Bill |
| `GET /shifts/staff/:id` + clock-in/out | Implemented and verified · **not integrated** | Profile |
| `POST /ai/chat` | Implemented on AI host · integrated | JARVIS |
| `POST /waiter/tables/assign` | Implemented · not waiter-app | Manager |
| Seated guest occupancy | **Missing** | Home `2/4 Guests` |
| `activeSessionId` on assigned tables | **Missing from this payload** (incomplete tables API) | Bill, Clear, Create Order |
| Waiter open/create table session | **Missing** | Create Order without customer QR |
| Order SLA / Target 12min | **Missing** | Table Details |
| Escalate to manager | **Missing** | Alert |
| Kitchen delay alert type | **Missing** | Alert “Order Delayed” |
| Waiter performance KPIs | **Missing** | Profile |
| Language preference | **Missing** (or unverified) | Profile |
| JARVIS All/Upsell/Regulars data | **Missing** | JARVIS chips |
| Waiter marks READY | **Must not exist** (kitchen owns READY) | Fake landing handler |

### 6.2 Incomplete — detail

**A. `GET /waiter/tables` missing session + occupancy**  
Screens: Home Bill, Clear, Create Order, `2/4 Guests`.  
Why: `drizzle-waiter.repository.ts` select list has no session join and no guest count.  
Update: waiter repository + `AssignedTableDetailDto` / `TableAssignmentDto`.  
Need: `activeSessionId` (nullable), optionally `guestCount` from active `table_sessions` / `customer_sessions`.  
Auth unchanged: `TABLES_READ`.  
Errors: none new.  
Acceptance: Home can call close/bill/create without a second guess.

**B. `GET /waiter/orders/pending` ignores `SUBMITTED`**  
Figma Pending includes unaccepted tickets. FLOWS waiter-approval is SUBMITTED.  
Update: `findPendingOrdersForTables` statuses `PENDING,SUBMITTED`.  
Acceptance: pending strip matches accept-eligible orders.

**C. `POST /waiter/orders` tax/service/password**  
Incomplete vs `branch_settings` and identity policy. Flag only; do not change in this documentation task.

**D. `GET /waiter/alerts` not table-scoped; types ≠ Figma**  
Incomplete for “my tables” and for delay/escalation UX.

**E. `POST /payments/request-offline` unauthenticated**  
Security gap vs “backend is security authority”. Incomplete hardening, not a missing Figma field.

**F. Accept error string vs `PENDING`**  
Behavior allows PENDING; message says SUBMITTED only.

---

## 7. Backend implementation recommendations

These are recommendations for **future** work. This task does not implement them.

### 7.1 Active session on assigned tables (highest blocker)

- **Module**: `waiter` repository + `AssignedTableDetailDto`
- **Goal**: Join active table session (`status` not completed/closed — confirm enum in `session.schema.ts`) onto each assigned table
- **Response add**: `activeSessionId: string | null`
- **Auth**: existing `GET /waiter/tables`
- **Unlocks**: Bill, Clear, Create Order
- **If no session**: Create Order and Bill must 409 with a clear message; do not open a session from the waiter app until product confirms

### 7.2 Waiter open-session (only if product requires walk-in without QR)

- **Missing today**. Customer `POST /sessions/scan` is the verified session creator
- If required: new waiter-scoped operation in `table-sessions` module, JWT + `TABLES_UPDATE` or `ORDERS_CREATE`, must assert assignment, create `TableSession` OCCUPIED
- **Do not implement** until product confirms waiters may start sessions without a customer scan (FLOWS.md customer flow starts at QR)

### 7.3 Guest occupancy

- Count active guest/customer sessions for `activeSessionId`
- Return `guestCount` + existing `capacity` so Figma `2/4 Guests` is honest
- Validation: `guestCount <= capacity` is a seating rule; **not verified** as enforced today

### 7.4 Pending = accept-eligible

- Change pending finder to `PENDING` + `SUBMITTED` (and document it)
- Keep `GET /waiter/orders?status=SUBMITTED` working as-is

### 7.5 Alert model vs Figma

Options (product must choose; do not silently merge):

1. Map Figma copy onto existing `call_waiter` / `need_help` / `request_bill` only, and drop Escalate / Order Delayed from UI
2. Add alert types + `POST` from kitchen delay jobs + `POST /waiter/alerts/:id/escalate` notifying manager (new outbox event). Requires schema enum change in alerts table

**Escalate contract (if option 2)** — proposed, **not implemented**: waiter JWT, `ALERTS_ACKNOWLEDGE` or a new permission, body optional `note`, 404/400 if already resolved, notify manager room. **This is a recommendation, not a live API.**

### 7.6 SLA / Target 12min

No field on `WaiterOrderSummaryDto`. Would need `branch_settings` target minutes + `submittedAt` elapsed on the client **or** a computed `elapsedSeconds` / `targetMinutes` on the order DTO. Client-only elapsed from `submittedAt` is possible **without** a new API if the 12-minute target is a fixed design number. Confirm whether 12 is brand-wide or per-branch.

### 7.7 Profile KPIs

No waiter analytics controller found. Do not aggregate by scanning all orders in the frontend as a substitute security boundary. If required: waiter-scoped counts (`ORDERS_READ`) for served/created today at assigned tables.

### 7.8 Session close discoverability

Even without 7.1, frontend could take `tableSessionId` from the latest order on that table (`GET /waiter/orders?tableId=`). Document as a **temporary** integration path, not a new endpoint.

### 7.9 Harden offline payment

Add `JwtAuthGuard` + waiter/customer permission on `POST /payments/request-offline`. Confirm with payments module owner; changing it is a behavior change.

---

## 8. Workflow dependencies and business rules

### 8.1 Required order of operations

```text
1. Manager: POST /waiter/tables/assign (time-bound WaiterTableAssignment)
2. Waiter: POST /auth/login → GET /auth/me → GET /waiter/tables
3. Optional: GET /shifts/staff/:assignmentId → PATCH clock-in
4. Customer (or existing session): POST /sessions/scan  → table OCCUPIED
5. Customer submits order → SUBMITTED/PENDING
6. Waiter: GET /waiter/orders → POST accept | reject
7. Kitchen/bar: PREPARING → READY  (waiter does not set READY)
8. Waiter: POST serve (READY only)
9. Additional orders: repeat 5–8 on same tableSessionId
10. Bill: GET bill → POST request-offline → cashier confirm
11. POST /sessions/:id/close → table AVAILABLE
```

Skipping (1) → `GET /waiter/tables` empty; accept/serve 403 `assertWaiterOwnsTable`.  
Skipping (4) → `POST /waiter/orders` cannot supply `tableSessionId`.  
Skipping (10) with unpaid balance → close fails.

### 8.2 Branch access

JWT `branchId` or query `branchId` must match staff assignment (`isStaffAssignedToBranch` on alerts; `assertBranchAccess` on `GET /tables`). Do not send another branch’s UUID from the client as a security control — backend must keep rejecting it.

### 8.3 Table `serviceStatus` (from product/DB enums)

Documented usage in this workflow: `AVAILABLE`, `OCCUPIED`, `PREPARING` (set on accept), `PAYMENT_PENDING` (offline request), `CLOSING`/`AVAILABLE` (close). Figma chips `New Order` / `Ready To Serve` are **UI labels**, not enum values.

### 8.4 Order status (waiter-legal)

From `WAITER_ALLOWED_TRANSITIONS`:

| From | Waiter may go to |
|---|---|
| `SUBMITTED` | `ACCEPTED`, `CONFIRMED`, `REJECTED` |
| `PENDING` | `ACCEPTED`, `CONFIRMED`, `REJECTED` |
| `READY` | `SERVED`, `COMPLETED` |

Accept implementation calls `ACCEPTED` only. Serve calls `SERVED` only.

### 8.5 Duplicate / retry

- Accept/reject/serve: **not idempotent**; retry after success → 400
- Create order on behalf: each POST creates a new `W-…` order; debounce submit
- Offline request: new `UNPAID` payment each call; avoid double-tap
- Close: second close should fail (session already closed) — confirm exact code in `closeSession`

### 8.6 Concurrent updates

Two waiters: assignment is per waiter; `assertWaiterOwnsTable` should block a second waiter unless also assigned. Two devices same waiter: last write wins; rely on realtime refetch. **No optimistic-lock field** was verified on order rows for waiter actions.

### 8.7 Billing responsibility

FLOWS.md: waiter collects offline tender and **cashier** settles. `confirm-offline` is cashier-tagged. Waiter Home Bill = request, not confirm.

### 8.8 Close conditions

Controller: all orders served/settled, no in-prep items, balance settled. Aligns with FLOWS “Clear Table”. Frontend must **not** mark Available locally when close fails.

### 8.9 Rules that need confirmation

See §11. Do not change hardcoded 8%/5% tax, auto-guest `'1234'`, or alert type enum in the waiter app.

---

## 9. Frontend integration checklist

Target app: `frontend/waiter` `new-waiter-dashboard`. Reuse `waiterService` / `authApi`; do not add parallel clients.

| # | Screen | Item | API | FE status | Depends on | Expected result |
|---|---|---|---|---|---|---|
| 1 | Login | Submit credentials | `POST /auth/login` | Done | — | JWT + redirect |
| 2 | App | Session restore | `GET /auth/me` | Done | token | Valid session |
| 3 | Home | Assigned tables | `GET /waiter/tables` | Done | assignment | My Table cards |
| 4 | Home | Pending strip | `GET /waiter/orders` | Done | (3) | Pending cards |
| 5 | Home | Realtime refetch | socket → same GETs | Done | gateway | Live chips |
| 6 | Home | Guest `n/capacity` | tables + session guests | **Blocked** | §7.1 / §7.3 | `2/4 Guests` truthful |
| 7 | Table Details | Load orders | `GET /waiter/orders?tableId=` | Done (landing) | selected table | List |
| 8 | Table Details | Accept | `POST .../accept` | **Reuse OrdersListView**; landing TODO | status SUBMITTED/PENDING | Kitchen queue |
| 9 | Table Details | Reject + reason UI | `POST .../reject` | Orders done; landing TODO | reason string | Order rejected |
| 10 | Table Details | Serve | `POST .../serve` | Orders done; landing TODO | READY | SERVED |
| 11 | Table Details | Remove local READY hack | — | TODO | kitchen | No fake READY |
| 12 | Orders dock | List + actions | same waiter order APIs | Done | — | Full queue |
| 13 | Create Order | Menu | `GET /menus/:branchId/items` | Done | branchId | Item grid |
| 14 | Create Order | Submit | `POST /waiter/orders` | **Not integrated** | `tableSessionId` | Real `W-` order |
| 15 | Create Order | Customer identifier field | DTO required | Missing in Figma select-table | product | Valid DTO |
| 16 | Bill | Show totals | `GET /payments/session/:id/bill` | **Not integrated** | session id | `balanceDue` |
| 17 | Bill | Request cash/card | `POST /payments/request-offline` | Client exists; Home TODO | (16) | `UNPAID` + PAYMENT_PENDING |
| 18 | Clear | Close session | `POST /sessions/:id/close` | **Not integrated** | paid + not in-prep | AVAILABLE |
| 19 | Alert | List | `GET /waiter/alerts` | Done | branchId | Cards |
| 20 | Alert | Acknowledge / resolve | PATCH | Done | pending alert | Status change |
| 21 | Alert | Escalate / delay | — | **Missing backend** | product | Do not fake |
| 22 | Profile | Change password | `POST /auth/change-password` | Done | JWT | Success message |
| 23 | Profile | Clock in/out | `PATCH /shifts/:id/clock-*` | **Not integrated** | shift id from GET staff shifts | `checkInAt`/`checkOutAt` |
| 24 | Profile | KPIs | — | **Missing** | product | Hide or stub labeled unverified |
| 25 | JARVIS | Chat | `POST /ai/chat` | Done | AI host | Reply |
| 26 | JARVIS | Segment chips | — | Local only | — | Do not claim API |

**Already correct — reuse, do not recreate**

- `waiterService.getMyTables`, `queryOrders`, `acceptOrder`, `rejectOrder`, `serveOrder`, `getMenuItems`, `getMyAlerts`, `ackAlert`, `resolveAlert`
- `authApi` login / getMe / changePassword
- `chatApi.sendChatMessage`
- Orders tab accept/reject/serve implementation

---

## 10. Acceptance criteria and testing recommendations

### 10.1 Acceptance (Figma Home happy path)

1. Waiter with active assignment sees only assigned tables after login.
2. Customer submit on that table appears in pending strip and Table Details Pending without a full page reload (realtime or short refetch).
3. Accept from Table Details **persists** (reload still shows accepted/cooking), unlike current landing toasts.
4. Serve is disabled until `READY`.
5. Bill shows `balanceDue` from payments API, not a hardcoded total.
6. Clear fails with a visible error when unpaid or items still preparing; succeeds only via `POST /sessions/:id/close`.
7. Create Order either sends `POST /waiter/orders` with a real session or shows “No active table session” — never a random `#12345`.
8. Alerts list real `call_waiter` / `request_bill` / `need_help` records; Figma delay/escalate copy is hidden or labeled unimplemented.
9. Profile clock in/out writes `checkInAt`/`checkOutAt` on the shift row.
10. 401 anywhere returns to login.

### 10.2 Test plan

| Case | How |
|---|---|
| Auth | Login wrong password 401; expired JWT refresh or redirect |
| Assignment | Waiter A cannot `GET` waiter B’s table orders (403 on detail/accept) |
| Accept twice | Second accept 400 |
| Reject without reason | 400 |
| Serve while PREPARING | 400 |
| Create on unassigned table | 403 |
| Create without session UUID | 400 |
| Offline pay `balanceDue=0` | 400 outstanding zero |
| Close with UNPAID payment | 409/400 |
| Alerts | Customer `POST /alerts` then waiter GET sees it; ack then resolve; resolve twice 400 |
| Realtime | Kitchen marks READY → waiter list shows Ready to Serve |
| Regression | `OrdersListView` accept still works after landing Table Details is wired (share `waiterService`, one source) |

Manual device pass: Home, Table Details ALL/Pending/Active/Completed, Create Order, Alert, Profile, JARVIS dock, Bill, Clear — against a branch with seeded assignment + open session.

Automated: extend existing waiter API e2e if present under `apps/api`; do not claim Playwright waiter coverage in this repo without a waiter spec file (admin Playwright is unrelated).

---

## 11. Unresolved questions

1. **May a waiter open a table session** without customer QR scan? FLOWS.md says customer scan creates the session. Figma Create Order only selects a table.
2. **Where does `customerIdentifier` come from** on Create Order? Figma landing collects `customerName` / `customerPhone` in local state but does not POST them.
3. **Reject reason UI**: backend requires `reason`; Figma Accept/Reject row has no reason sheet on `3359:12426`.
4. **Alert design vs domain**: implement delay/escalate, or restyle existing customer alerts?
5. **Is Target 12min** global, per-branch, or illustrative mock?
6. **Home guest occupancy**: seated guests vs capacity — is a new field required or is Figma mock data?
7. **Should `GET /waiter/orders/active` include `ACCEPTED`?** Swagger and `scope=ACTIVE` filter disagree.
8. **Cashier vs waiter on offline confirm**: FLOWS.md says cashier; Figma Bill might look like waiter completion. Confirm UX after `request-offline`.
9. **JARVIS chips** (Upsell / Regulars): product feature or design-only?
10. **Profile performance metrics**: required for MVP or drop from UI?
11. **Language control**: i18n API vs device locale?
12. **`POST /payments/request-offline` without JWT**: intentional customer-anonymous bill, or oversight?
13. **Auto-created guest password `'1234'`**: confirm identity policy before waiter create-order goes to production.
14. **Hardcoded 5%/8%** vs `branch_settings` for waiter-created orders.

---

## Source index

| Area | Path |
|---|---|
| Waiter HTTP | `apps/api/src/modules/waiter/presentation/http/waiter.controller.ts` |
| Waiter DTOs | `.../dto/waiter-request.dto.ts`, `waiter-response.dto.ts` |
| Waiter service | `apps/api/src/modules/waiter/application/services/waiter.service.ts` |
| Transitions | `apps/api/src/modules/waiter/domain/entities/waiter.entity.ts` |
| Table assignments SQL | `apps/api/src/modules/waiter/infrastructure/persistence/drizzle-waiter.repository.ts` |
| Orders SQL | `.../drizzle-waiter-order.repository.ts` |
| Auth | `apps/api/src/modules/identity/presentation/http/auth.controller.ts` |
| Sessions | `apps/api/src/modules/table-sessions/presentation/table-session.controller.ts` |
| Payments | `apps/api/src/modules/payments/presentation/payment.controller.ts` |
| Shifts | `apps/api/src/modules/shifts/presentation/shift.controller.ts` |
| Menus | `apps/api/src/modules/menus/presentation/controllers/menu.controller.ts` |
| RBAC | `packages/authorization/src/role.ts` |
| Waiter FE client | `frontend/waiter/src/redux/features/waiterApi.ts` |
| Figma Home implementation | `frontend/waiter/src/components/new-waiter-dashboard/NewWaiterLandingView.tsx` |
| Flows | `.agent/FLOWS.md` |
