# Tavonza AI Restaurant Platform — Product Requirements Document

## Document Purpose

This is the product requirements source of truth for **Tavonza AI**. It describes who the product is for, what the platform must do, and which capabilities exist in the current codebase.

Architecture, schema, authorization, and implementation status live in sibling documents. This PRD does not replace them.

| Topic | Authoritative document |
| :--- | :--- |
| Architecture & domain boundaries | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| Database schema & invariants | [`DATABASE.md`](./DATABASE.md) |
| Roles, capabilities, scopes | [`AUTHORIZATION.md`](./AUTHORIZATION.md), [`CORE.md`](./CORE.md) |
| Operational user flows | [`FLOWS.md`](./FLOWS.md), [`CORE.md`](./CORE.md) |
| AI tool gateway | [`AI.md`](./AI.md) |
| Realtime & notifications | [`REALTIME_AND_NOTIFICATIONS.md`](./REALTIME_AND_NOTIFICATIONS.md) |
| Payments (Stripe) | [`STRIPE.md`](./STRIPE.md) |
| Roadmap / phase status | [`STATUS.md`](./STATUS.md) |
| Non-negotiable engineering rules | [`RULES.md`](./RULES.md) |

**Status of this PRD:** Reflects the product as implemented through Phase 5 (frontend applications). Phases 6 (QA) and 7 (production DevOps) remain open.

---

## 1. Product Summary

Tavonza AI is a multi-tenant SaaS platform for restaurants and bars to run QR-based customer ordering and in-venue operations.

The core dining loop is:

```text
QR code → table/guest session → menu → cart → identity (OTP) → order
  → waiter/manager/auto acceptance → kitchen/bar preparation
  → waiter service → payment (online or cashier) → table clearance
```

The platform is production-oriented: tenant isolation, capability-based authorization, realtime operations, reliable async processing, and an AI layer (JARVIS) that uses the same authorized application capabilities as human users.

### 1.1 Product goals

1. Let diners order from their phone without waiting for a waiter to take the first order.
2. Give waiters, kitchen, bar, cashier, and managers a live operational picture of the floor.
3. Support multi-guest tables without blocking later guests with “table occupied.”
4. Keep money, permissions, and tenant data under backend authority — never the UI.
5. Let AI assist staff and guests without bypassing authorization or talking to the database.

### 1.2 Non-goals (current product)

- Delivery marketplace / third-party aggregator (Uber Eats, DoorDash).
- Consumer social network or public restaurant discovery app.
- Full ERP / accounting suite.
- Privileged AI that writes SQL or skips RBAC.
- Hard-coded demo users, fallback UUIDs, or offline login bypasses.

---

## 2. Users & Personas

Tavonza has two identity tiers: **platform-level users** (global role) and **branch-level staff** (`StaffAssignment`). Manager titles such as Regional / Assistant / Shift Manager are **permission templates** on `BRANCH_MANAGER`, not separate enum values.

| Persona | Identity | What they need |
| :--- | :--- | :--- |
| **Diner (Customer)** | `GlobalRole.CUSTOMER` + `GuestSession` | Scan QR, join table, browse, order, track, pay, review, talk to JARVIS |
| **Waiter** | `StaffAssignment.WAITER` + time-bound table assignments | Accept/reject orders, serve ready items, handle waiter calls, clear tables |
| **Kitchen staff** | `StaffAssignment.KITCHEN_STAFF` | Food KDS tickets, item status, availability / 86, prep time, inventory view |
| **Bartender** | `StaffAssignment.BARTENDER` | Drink KDS (`stationType = BAR`), independent item progress |
| **Cashier** | `StaffAssignment.CASHIER` | Unpaid balances, split settlement, cash/card/offline confirm, receipts |
| **Branch manager** | `StaffAssignment.BRANCH_MANAGER` | Floor, staff, menu, tables/QR, KDS monitor, payments, reports, branch settings |
| **Org admin / owner** | `GlobalRole.ADMIN` / `RESTAURANT_OWNER` | Brands, branches, permissions, org reports, subscription |
| **Super admin** | `GlobalRole.SUPER_ADMIN` | Tenant provisioning, platform billing/plans, support — not day-to-day service |

Host (`HOST`) is modeled in authorization (seating / reservations) even when a dedicated host frontend is not a primary shipped app.

---

## 3. Business Hierarchy

```text
Platform Owner
└── Organization          ← tenant boundary
    └── Restaurant        ← brand
        └── Branch        ← physical location
            ├── Floors & Tables (opaque QR tokens)
            ├── Staff assignments & waiter-to-table windows
            ├── Menu (categories, items, modifiers, stock, prep time)
            ├── Table sessions & guest sessions
            ├── Orders & order items (Kitchen vs Bar routing)
            ├── Payments & allocations
            ├── Inventory & suppliers
            └── Shifts, reservations, reviews, notifications
```

Hierarchy supplies context. **Authorization** (actor + permission + scope + resource + domain rules) decides whether an action is allowed.

---

## 4. Product Surfaces

Seven Next.js applications plus four backend runtimes.

| Surface | Package | Audience | Primary job |
| :--- | :--- | :--- | :--- |
| Customer web | `@frontend/customer` | Diners | QR ordering, cart, pay, track, JARVIS |
| Waiter | `@frontend/waiter` | Floor staff | Assigned tables, accept/serve, alerts, create order |
| Kitchen | `@frontend/kitchen` | Kitchen / bar production | KDS tickets, availability, inventory, shift report |
| Cashier | `@frontend/cashier` | POS / settlement | Table view, bill queue, create order, offline payments |
| Branch manager | `@frontend/manager` | Branch ops | Floor, staff, menu, orders, KDS, payments, reports, config |
| Org admin | `@frontend/admin` | Owners / org admins | Restaurants, branches, permissions, payments, reports |
| Super admin | `@frontend/superadmin` | Platform | Tenants, plans, billing, settings |
| API | `apps/api` | All clients | Authoritative REST + Socket.IO gateway |
| Worker | `apps/worker` | System | Outbox, idle-session close, background jobs |
| Realtime | `apps/realtime` + API gateway | All live UIs | Room-partitioned events |
| AI | `apps/ai` (Python) | Staff + guests | JARVIS via Tool Gateway `/internal/*` |

Frontends use **Redux Toolkit + RTK Query**. Live updates flow through `<RealtimeBridge />` (Socket.IO → cache invalidation). Persistent notifications use `<NotificationCenter />`. Frontend auth/route guards are UX only.

---

## 5. Functional Requirements

Requirements below are the product contract. Backend authorization and tenant scope are mandatory on every mutating and sensitive read path.

### 5.1 Identity, authentication & profile

**FR-ID-1.** Staff and customers authenticate with email/password (or equivalent login), JWT access tokens, and rotating refresh tokens bound to `auth_sessions`. Logout and account disable must revoke the session.

**FR-ID-2.** Password recovery uses OTP (`forgot-password` → OTP → `reset-password`). Login and table join may also require OTP when branch policy says so.

**FR-ID-3.** Authenticated users can view and update their profile (`GET/PATCH /auth/me`, `/users/me`), including assignments for staff.

**FR-ID-4.** Customer identity at a table is a verified `GuestSession` (phone or email + OTP). The QR token is **not** an authenticator.

**FR-ID-5.** No hardcoded demo users, fallback branch/table UUIDs, or offline login bypasses.

### 5.2 Organization, restaurant & branch

**FR-ORG-1.** Super admin / admin can provision organizations. Admins create restaurants (brands) and branches under their organization.

**FR-ORG-2.** Each branch has settings that control service behavior, including:

- Order acceptance mode: `AUTO_ACCEPT` | `WAITER_APPROVAL` | `MANAGER_APPROVAL`
- Backup accepter roles
- Hide vs disable unavailable menu items
- Multi-guest sessions, OTP-per-guest, split bill, guest checkout without account
- Idle session auto-close minutes
- Currency, tax %, service charge %, tips
- Reservations / waitlist flags

**FR-ORG-3.** Branches expose operating hours and holidays.

**FR-ORG-4.** Branch staff directory: invite/create, assign role + permissions, update, deactivate. Regional managers are multiple `BRANCH_MANAGER` assignments, not a new role.

### 5.3 Tables, QR & reservations

**FR-TBL-1.** Staff with table permission can create/update tables (label, number, capacity, shape, floor) and soft-delete them. Soft-deleted tables cannot seat new diners if open sessions, unpaid orders, or active waiter assignments exist.

**FR-TBL-2.** Each table has a stable internal id and an **opaque QR token**. Public URLs must not leak internal UUIDs. QR can be regenerated.

**FR-TBL-3.** `GET /tables/resolve-qr/:token` resolves branch + table context for the customer app.

**FR-TBL-4.** Table **service status** is independent of session status:

```text
AVAILABLE → OCCUPIED → ORDERING → PREPARING → SERVING → PAYMENT_PENDING → CLOSING → AVAILABLE
```

Operational flags (`NORMAL`, `RESERVED`, `CLEANING`, `OUT_OF_SERVICE`) are separate from service status.

**FR-TBL-5.** Reservations can be created, listed by branch, status-updated (`PENDING` → `CONFIRMED` → `SEATED` → `COMPLETED`, or `CANCELLED` / `NO_SHOW`), and cancelled. Customer app includes a reserve flow when the branch enables reservations.

**FR-TBL-6.** Managers assign waiters to tables for a time window. Overlapping double-assignment of the same table is rejected.

### 5.4 Table sessions & multi-guest dining

**FR-SES-1.** A table has at most one `ACTIVE` `TableSession`. The first verified guest opens it and is host (`isHostGuest`). Later guests scanning the same QR **join** — they are never blocked with “table occupied.”

**FR-SES-2.** Guests may join via QR scan or share/join code (`share-code`, `join`).

**FR-SES-3.** Ordering mode can be individual (per `GuestSession` tab) or together (shared table order).

**FR-SES-4.** Guests can call the waiter and request the bill. Bill request moves session toward `BILL_REQUESTED` / table toward `PAYMENT_PENDING` without necessarily stopping supplementary orders.

**FR-SES-5.** A guest may leave early (`LEFT` / `CLOSED`). The table stays open while other guests remain unsettled.

**FR-SES-6.** Session close (`COMPLETED`) is allowed only when every associated order is settled and no items remain `PENDING` or `PREPARING`. Waiter/manager clearance then returns the table to `AVAILABLE`.

**FR-SES-7.** Worker auto-abandons idle sessions per `autoCloseIdleSessionMins`. Abandoned sessions do not leave the table permanently occupied.

### 5.5 Menu & catalog

**FR-MNU-1.** Branch menus are organized by ordered categories and items. Items support description, images, base price, popularity, allergens/nutrition where captured, estimated prep time, stock quantity, and `isStockTracked`.

**FR-MNU-2.** Modifier groups and modifiers apply price deltas. Required vs optional modifiers are enforced at cart/order time.

**FR-MNU-3.** Customer menu hides or greys unavailable items according to branch settings. Search, category filter, and popular filter are required.

**FR-MNU-4.** Kitchen/bar can toggle operational availability (86 an item) without changing price, unless separately authorized.

**FR-MNU-5.** Managers/admins CRUD categories and items. Item create/update may include station type (`KITCHEN` | `BAR`).

**FR-MNU-6.** Tracked stock deducts atomically on order submit (`stock_quantity >= qty`). Rejection/cancellation restores stock once (`inventoryRestored` guard). Untracked items are unlimited.

### 5.6 Cart & ordering

**FR-ORD-1.** Server-owned cart: one cart per customer account or guest session. Add/update/remove/clear lines. Checkout uses `Idempotency-Key` mapped to `orders.idempotencyKey`. Cart clears only after the order row commits.

**FR-ORD-2.** At placement, each line snapshots product name, unit price, tax, modifiers, and station type. Later menu edits never change active or historical orders.

**FR-ORD-3.** Customers and authorized staff (waiter, cashier) can place orders. Staff-created orders still follow acceptance, routing, and payment rules.

**FR-ORD-4.** Order lifecycle:

```text
PENDING → CONFIRMED → PREPARING → READY → SERVED → COMPLETED
   │            └── CANCELLED (pre-prep only, unless manager override)
   └── REJECTED (reason code + optional note; customer can modify and resubmit)
```

Rejection reasons include at least: `ITEM_UNAVAILABLE`, `KITCHEN_CAPACITY`, `MODIFICATION_IMPOSSIBLE`, `ALLERGY_CONCERN`, `RESTAURANT_CLOSING`, `OTHER`.

**FR-ORD-5.** Acceptance is driven by `orderAcceptanceMode`. Waiter is primary under `WAITER_APPROVAL`; manager under `MANAGER_APPROVAL`; `AUTO_ACCEPT` confirms immediately. Backup accepter roles apply when the primary is unavailable.

**FR-ORD-6.** Waiters only act on orders for tables assigned to them in the active window (plus explicit backup/manager paths).

**FR-ORD-7.** Customers can track their order (`/orders/:id/track`, waiting/confirmed/track UIs) and see live status. Multiple orders can coexist on one table session.

**FR-ORD-8.** Overall order prep ETA is `max(item estimatedPrepTime)` to model parallel station work. Item timestamps `prepStartedAt`, `readyAt`, `servedAt` are persisted.

### 5.7 Kitchen & bar production

**FR-KDS-1.** Confirmed items route by `stationType`: food → kitchen queue, drinks → bar queue. Line items progress independently:

```text
PENDING → PREPARING → READY → SERVED
              └── UNAVAILABLE / CANCELLED (with reason; does not cancel sibling items)
```

**FR-KDS-2.** Marking `READY` notifies the assigned waiter. Kitchen UI shows table label/number, elapsed time, and ETA.

**FR-KDS-3.** Kitchen staff may read tables in their branch only (no cross-branch). They cannot set prices unless granted.

**FR-KDS-4.** Kitchen surface includes queue, active orders, station filter, inventory view, shift report, and JARVIS assist. Sound/alert for new tickets is a UX requirement of the KDS.

### 5.8 Waiter floor operations

**FR-WTR-1.** Waiter home/floor shows assigned tables and live service status.

**FR-WTR-2.** Waiter can inspect, accept, reject, and serve orders; acknowledge/resolve waiter-call alerts.

**FR-WTR-3.** Waiter can create an order on behalf of a seated table (assisted ordering).

**FR-WTR-4.** For offline payment, waiter collects cash/card and hands settlement to cashier (or customer pays online; waiter sees `PAID`).

**FR-WTR-5.** Table clearance is gated: all orders paid, zero pending kitchen/bar items.

**FR-WTR-6.** JARVIS copilot is available in the waiter app for authorized read/assist actions.

### 5.9 Cashier & payments

**FR-PAY-1.** Backend is the financial authority. Clients must not dictate payable amounts. Server computes outstanding balance, tax, service charge, tips, and verified discounts.

**FR-PAY-2.** Payment scopes: `ORDER` | `ORDER_ITEMS` | `GUEST_SESSION` | `TABLE_SESSION`. Split-by-item, pay-own-tab, pay-for-another, and pay-whole-table are all required when `allowSplitBill` is on.

**FR-PAY-3.** Methods: cash, card, mobile wallet, online gateway (Stripe PaymentIntents + Elements). No Stripe Checkout redirect for in-room table pay.

**FR-PAY-4.** Online intents only for orders in `CONFIRMED` | `PREPARING` | `READY` | `SERVED`. Draft/pending orders cannot start payment.

**FR-PAY-5.** A payment becomes `PAID` only after Stripe webhook `payment_intent.succeeded` (HMAC-verified) or server-to-server `POST /payments/stripe/verify`. Client clicks are not confirmation. Webhooks are idempotent on `transactionRef`.

**FR-PAY-6.** Payment status: `UNPAID` | `PARTIALLY_PAID` | `PAID` | `REFUNDED` | `FAILED`. There is no DB `PENDING` payment status; open intents stay `UNPAID`.

**FR-PAY-7.** `PaymentAllocation` rows must sum to the payment amount.

**FR-PAY-8.** Cashier dashboard: table view, bill queue, create order, confirm/reject offline requests, apply permitted discounts, refund when permitted, print/view receipt. Customer PII is masked unless operationally required.

**FR-PAY-9.** Refunds require permission, write audit (actor, amount, reason, original txn), and for card/online return via the original gateway when supported.

**FR-PAY-10.** Discounts validate server-side (`discounts/validate`, `discounts/apply`) and are permission-gated (`APPLY_DISCOUNTS`).

### 5.10 Staff, shifts & attendance

**FR-STF-1.** Branch managers/admins create staff with a role and permission grants, edit them, and remove assignment.

**FR-STF-2.** Work shifts can be created, listed by branch or staff assignment, clocked in/out, cancelled, and deleted (as authorized).

**FR-STF-3.** Waiter table assignments are first-class and returned with table details (`id`, `label`, `tableNumber`, `capacity`, `serviceStatus`, `operationalFlag`, `floor`) for manager UI.

### 5.11 Inventory & suppliers

**FR-INV-1.** Branch inventory: suppliers, inventory categories, items (SKU, on-hand, par, unit). Adjust stock with an audited delta.

**FR-INV-2.** Branch stock summary (including low-stock) is available to dashboards and AI `get_inventory`.

**FR-INV-3.** Menu-item stock tracking (FR-MNU-6) is distinct from ingredient inventory but both must stay tenant-scoped.

### 5.12 Reviews & feedback

**FR-REV-1.** After a visit, customers submit 1–5 star ratings and optional text. Moderation targets spam, abuse, and fraud — not disagreement.

**FR-REV-2.** Customer app includes feedback and thank-you screens.

### 5.13 Analytics & reports

**FR-RPT-1.** Role-scoped KPI endpoints — frontends must not load every order/table to compute dashboards:

- Org/admin overview
- Branch dashboard (manager)
- Waiter / cashier / kitchen / bartender dashboards
- Customer home (own open/completed orders)
- Branch performance report

**FR-RPT-2.** Manager and admin report UIs show sales/ops KPIs for their authorized scope only.

### 5.14 Notifications & realtime

**FR-RT-1.** Domain mutations persist first, then emit via transactional outbox. WebSockets are delivery, not source of truth.

**FR-RT-2.** Rooms are server-assigned and tenant-scoped, including `branch:{id}`, `branch:{id}:{role}`, `table_session:{id}`, `user:{id}`.

**FR-RT-3.** Persistent notifications target a user and/or `branchId + targetRole`. REST: list, unread count, mark read, mark all read, delete. Live badge via `NOTIFICATION_CREATED` / `NOTIFICATION_READ`.

**FR-RT-4.** Staff portals show a notification center. Customer notifications are user-addressed only.

**FR-RT-5.** Frontends must not use aggressive `setInterval` polling as the primary sync mechanism.

### 5.15 AI (JARVIS)

**FR-AI-1.** AI is an authorized client. Path is always `AI → Tool Gateway → Authorization → Application → Domain → Database`. Direct SQL is forbidden.

**FR-AI-2.** Every tool call carries actor context (acting user, agent, org, branch, permissions, resource scope) and is audited.

**FR-AI-3.** Shipped Tool Gateway tools (read, permissioned):

| Tool | Purpose |
| :--- | :--- |
| `get_menu` | Branch menu |
| `get_table_status` | Table service status |
| `get_order_status` | Order status |
| `get_kitchen_queue` | Station queue |
| `get_branch_summary` | Occupancy / open orders snapshot |
| `get_audit_events` | Recent operational events |
| `get_table_bill` | Bill breakdown |
| `get_inventory` | Stock / low-stock |

**FR-AI-4.** Internal API: `auth/resolve-actor`, `context/bootstrap`, `tools/execute`, `tools/execute/confirm`, `audit`. High-risk mutations require confirmation.

**FR-AI-5.** JARVIS appears in customer (chat / jarvis), waiter, kitchen, cashier, and manager surfaces. Fail closed: if a tool is denied or errors, the agent must not invent business data.

**FR-AI-6.** Approved model provider is Groq, isolated behind a provider interface.

### 5.16 Storage

**FR-STO-1.** Uploads (menu images, avatars) go through the storage module (presigned upload/download, list, delete). Domain code does not call cloud SDKs directly.

### 5.17 Super admin & commercial

**FR-PLT-1.** Super admin manages tenants (organizations), views tenant detail, platform plans, billing, and platform settings.

**FR-PLT-2.** Org admin has a subscription view (current plan, invoices). Standing unrestricted Super Admin access to diner PII/sales is not allowed; access is permissioned, logged, and time-bounded.

---

## 6. Product Surfaces — Feature Map

### 6.1 Customer (`@frontend/customer`)

| Area | Capabilities |
| :--- | :--- |
| Entry | `/t/[token]`, `/scan`, query `?qr=` / `?table=` |
| Auth | Register, login, OTP, forgot/reset/create password |
| Dining | Welcome, home, menu, search, dish detail |
| Cart | Personal cart, group cart, share-QR join |
| Checkout | Bill, split, Stripe payment, confirmation |
| Orders | Waiting, confirmed, track, history |
| Other | Call waiter (via session), reserve, profile, feedback, JARVIS chat |
| Empty/error | Order-unavailable and session-empty states (no fake demo table) |

### 6.2 Waiter (`@frontend/waiter`)

Floor / home, orders list + detail (accept/reject/serve), table orders, create order, menu lookup, alerts (ack/resolve), profile, JARVIS copilot. Auth: login, OTP, forgot/reset.

### 6.3 Kitchen (`@frontend/kitchen`)

Dashboard KPIs, kitchen queue, active orders, stations, recipes, inventory, shift report, AI insights, profile, availability toggle, sound alerts. Same auth pattern.

### 6.4 Cashier (`@frontend/cashier`)

Table view, create order, bill queue, order details, offline confirm/reject, discounts/refunds when granted, receipts, profile, JARVIS. Same auth pattern.

### 6.5 Branch manager (`@frontend/manager`)

Dashboard, tables + table detail + QR, orders, staff + assignments, kitchen KDS monitor, payments, menu, categories, reports, branch config, profile, Ask AI. Same auth pattern.

### 6.6 Org admin (`@frontend/admin`)

Dashboard, restaurants, branches, per-branch dashboard (overview, menu, tables/QR, staff), permissions matrix, payments ledger, reports, subscription, org settings.

### 6.7 Super admin (`@frontend/superadmin`)

Dashboard, tenants, tenant detail, plans, billing, settings, profile. Same auth pattern.

---

## 7. End-to-End Acceptance Scenarios

These are the product-level stories QA (Phase 6) must be able to execute.

1. **Host arrival:** Scan table QR → OTP → new `TableSession`, table `OCCUPIED`.
2. **Guest join:** Second diner scans same QR → joins same session; no occupied error.
3. **Individual + together orders:** Two carts submit; waiter sees both; prices snapshotted.
4. **Acceptance modes:** Same order path works for waiter approval, auto-accept, and manager approval.
5. **Station split:** Food item appears only on kitchen KDS; drink only on bar; each can go READY independently.
6. **86 mid-prep:** One item `UNAVAILABLE`; siblings continue; waiter/customer informed.
7. **Stock:** Tracked item rejects submit when stock insufficient; reject/cancel restores stock once.
8. **Serve & bill:** Ready → waiter serve → bill request → Stripe pay **or** cashier cash confirm.
9. **Split bill:** Two guests pay item subsets; allocations sum to payments; table does not close until remainder is settled.
10. **Clear table:** Waiter cannot clear while unpaid or preparing; after settlement, session `COMPLETED`, table `AVAILABLE`.
11. **Idle abandon:** No activity for configured minutes → session `ABANDONED`, table freed.
12. **Realtime:** Waiter, kitchen, cashier, manager, customer UIs update without full-page refresh when an order is accepted.
13. **Tenant isolation:** Staff JWT from Branch A cannot read Branch B orders, tickets, or analytics.
14. **AI:** Waiter JARVIS `get_table_status` succeeds in-scope and is denied/fails closed out of scope; no SQL from AI.

---

## 8. State Machines (Product Rules)

Independent machines — one table may have Order A `SERVED`, Order B `PREPARING`, and Order C unpaid while the session stays `ACTIVE`.

| Entity | States |
| :--- | :--- |
| Table service | `AVAILABLE` → `OCCUPIED` → `ORDERING` → `PREPARING` → `SERVING` → `PAYMENT_PENDING` → `CLOSING` → `AVAILABLE` |
| Table session | `ACTIVE` → `BILL_REQUESTED` → `CLOSING` → `COMPLETED`; or `ABANDONED` |
| Guest session | `ACTIVE` → `LEFT` / `CLOSED` |
| Order | `PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `SERVED` → `COMPLETED`; `REJECTED` from `PENDING`; `CANCELLED` pre-prep |
| Order item | `PENDING` → `PREPARING` → `READY` → `SERVED`; or `UNAVAILABLE` / `CANCELLED` |
| Payment | `UNPAID` → `PARTIALLY_PAID` → `PAID` → `REFUNDED`; or `FAILED` |
| Reservation | `PENDING` → `CONFIRMED` → `SEATED` → `COMPLETED`; or `CANCELLED` / `NO_SHOW` |

---

## 9. Non-Functional Requirements

**NFR-1 Security.** Backend is the security authority. Every query/mutation enforces organization (and usually branch) scope from validated JWT context, not client-supplied tenant ids.

**NFR-2 Authorization.** Capability + scope + resource + domain rules. UI hiding is not enforcement.

**NFR-3 Isolation.** Tenant isolation applies to API, DB, jobs, realtime rooms, analytics, storage, and AI tools.

**NFR-4 Audit.** Discounts, refunds, stock adjustments, permission changes, staff CRUD, manager overrides, Super Admin client access, and AI tool calls are auditable.

**NFR-5 Reliability.** Outbox in the same DB transaction as the mutation. Workers retry with backoff and dead-letter. Stripe webhooks idempotent.

**NFR-6 Observability.** Structured logs, health endpoints; production target is CloudWatch + error tracking (Phase 7).

**NFR-7 Performance.** Role dashboards use aggregated analytics endpoints. KDS and waiter UIs stay live via push, not full-collection polling.

**NFR-8 Accessibility & device.** Customer is mobile-first. Waiter/cashier/kitchen/manager are tablet/desktop capable. Dark operational UI is the product look.

**NFR-9 Configurability.** Branch settings drive acceptance, OTP, split bill, idle close, tax, and unavailable-item display — not hardcoded per restaurant.

---

## 10. Constraints & Invariants (Product-Facing)

1. Modular monolith: features ship as API domain + frontend + realtime + tests, not as a new microservice by default.
2. Drizzle schema is the only persistent contract; no ad-hoc tables.
3. AI never receives a whole organization’s data when it only needs one branch or table.
4. Opaque QR tokens only on public links.
5. Price/name snapshot on every order line.
6. One active table session per table.
7. Table cannot return to `AVAILABLE` until session is `COMPLETED` or `ABANDONED`.

---

## 11. Implementation Status

Aligned with [`STATUS.md`](./STATUS.md).

| Phase | Scope | Status |
| :--- | :--- | :--- |
| 1 | Database / Drizzle schema | Complete |
| 2 | Shared foundation, JWT, RBAC | Complete |
| 3 | Domain REST modules (identity through AI internals) | Complete |
| 4 | Realtime, outbox worker, notifications | Complete |
| 5 | Six staff/customer frontends + super admin, realtime RTK, no demo fallbacks | Complete |
| 6 | Unit, workflow, tenant isolation, E2E, load tests | **Open** |
| 7 | Terraform AWS, CI/CD, production observability | **Open** |

Shipped domains in `apps/api`: identity, authorization, organizations, restaurants, branches, menus, tables, table-sessions, orders/cart, waiter, kitchen, payments, inventory, shifts, notifications/mail, analytics, storage, audit, AI internals.

---

## 12. Success Metrics (Product)

| Metric | Intent |
| :--- | :--- |
| Time from QR scan to first submitted order | Reduce waiter bottleneck at seating |
| Order accept latency (submit → confirmed) | Floor responsiveness |
| KDS item time-to-ready vs `estimatedPrepTime` | Kitchen performance |
| Table turn time (`OCCUPIED` → `AVAILABLE`) | Cover count |
| Payment success rate (Stripe + offline confirm) | Revenue capture |
| Split-bill completion without cashier error | Group dining UX |
| Cross-tenant access incidents | Must stay at zero |
| AI tool deny/error rate without hallucinated data | Safe copilot |

Exact numeric targets are set at launch; the instrumentation must exist before Phase 7 production cutover.

---

## 13. Related Runtime Notes

- Monorepo: pnpm + Turborepo; packages `apps/*`, `packages/*`, `frontend/*`.
- API: NestJS, PostgreSQL, Redis/Valkey, Socket.IO.
- Frontends: Next.js, React, Redux Toolkit / RTK Query, socket.io-client.
- AI: Python FastAPI, Groq models, InternalClient only.
- Payments: Stripe PaymentIntents, webhook `POST /payments/stripe/webhook`.
- Target infra: AWS ECS/Fargate, RDS, ElastiCache, S3, CloudFront, Route 53 (see [`DEVOPS.md`](./DEVOPS.md)).
