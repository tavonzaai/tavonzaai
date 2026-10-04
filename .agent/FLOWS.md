# Operational Flows

## Customer Flow

```text
Scan Table QR Code
  ↓
Resolve Table & Branch Context
  ↓
Enter Phone / Email → Receive OTP → Verify OTP
  ↓
Create Authenticated GuestSession bound to TableSession
  ├── First Guest  → Opens new TableSession (isHostGuest = true), Table -> OCCUPIED
  └── Other Guests → Joins active TableSession (no "table occupied" block!)
  ↓
Browse Menu (unavailable items hidden / disabled per branch setting)
  ↓
Select Items & Lock Modifier Options (price snapshotted)
  ↓
Cart Selection:
  ├── Order Individually (own GuestSession tab)
  └── Order Together (shared table order)
  ↓
Submit Order (PENDING)
  ↓
Order Acceptance Mode (per branch_settings):
  ├── WAITER_APPROVAL  → Assigned Waiter accepts / rejects (with reason)
  ├── AUTO_ACCEPT      → Automatically CONFIRMED
  └── MANAGER_APPROVAL → On-shift Manager accepts / rejects
  ↓
Routing by stationType:
  ├── Food items  → Kitchen Queue
  └── Drink items → Bar Queue
  ↓
Preparation (per-item: PENDING → PREPARING → READY)
  ↓
Waiter Notified → Serves ready items (Table -> SERVING)
  ↓
Billing (Table -> PAYMENT_PENDING):
  ├── Online instant payment
  └── Offline settlement (Waiter collects → Cashier settles)
  Scope: Individual / Together / Split-by-item / Pay-for-another
  ↓
Clear Table (Waiter verifies all orders paid & 0 pending items)
  ↓
TableSession -> COMPLETED, Table -> CLOSING -> AVAILABLE
```

## Waiter Flow

```text
Login
  ↓
Active Shift: Time-bound WaiterTableAssignment (e.g. Tables 1–3, 10:00–22:00)
  ↓
View incoming customer orders (WebSocket feed)
  ↓
Inspect order
  ├── Reject (select reason code: ITEM_UNAVAILABLE, KITCHEN_CAPACITY, etc. + note)
  └── Accept (routes items to Kitchen / Bar, Table -> PREPARING)
  ↓
Monitor preparation by station
  ↓
Receive item READY notification
  ↓
Collect from station & Serve customer (Table -> SERVING)
  ↓
Handle bill / payment:
  ├── Online: observes order updated to PAID
  └── Offline: collects cash/card from table → hands to Cashier
  ↓
Table Clearance: verifies all orders paid & zero items pending
  ↓
Marks table clear → TableSession COMPLETED, Table -> AVAILABLE
```

## Bartender Flow

```text
Login (filtered to assigned branch)
  ↓
View Bar Queue: order items where stationType = 'BAR'
  ↓
Independent line-item progress:
  PENDING → PREPARING → READY (or UNAVAILABLE with reason code)
  ↓
Marking READY notifies assigned Waiter for service
  ↓
Operational availability: toggle beverage items (Available / Unavailable / 86'd)
```

## Kitchen Flow

```text
Login (filtered to assigned branch)
  ↓
View Kitchen Queue: order items where stationType = 'KITCHEN'
  ↓
Independent line-item progress:
  PENDING → PREPARING → READY (or UNAVAILABLE with reason code)
  ↓
Marking READY notifies assigned Waiter for service
  ↓
Operational availability: toggle food items (Available / Unavailable / 86'd)
  ↓
Inventory linkage: recipes reduce theoretical stock automatically
```

Kitchen and Bar are modeled as distinct operational domains rather than generic UI screens.

## Cashier Flow

```text
Login (filtered to assigned branch)
  ↓
View active orders / unpaid balances (limited order view, masked PII)
  ↓
Select payment scope:
  ├── ORDER (single order in full)
  ├── ORDER_ITEMS (specific split items)
  ├── GUEST_SESSION (one guest's individual tab)
  └── TABLE_SESSION (entire table at once)
  ↓
Apply permitted adjustments (discounts per permission grant)
  ↓
Select payment method (CASH, CARD, MOBILE_WALLET, ONLINE_GATEWAY)
  ↓
Process / confirm payment → PaymentStatus: PAID
  ↓
Issue receipt & emit PaymentCompleted event
  ↓
Refunds: requires permission; logged to Audit Log with reason & actor
```

## Manager / Administrator Flow

```text
Organization (Admin / Owner)
  ↓
Restaurant / Brand (Admin / Owner)
  ↓
Branch (Admin / Owner / Regional Manager / Assistant Manager)
  ├── Branch Settings (acceptance mode, tax, service charge, OTP policy)
  ├── Floors & Tables (create tables, generate opaque QR tokens)
  ├── Waiter Table Assignments (time-bound shift windows)
  ├── Menu Catalog & Pricing
  ├── Staff Assignments & Granular Permissions
  ├── Backup Order Acceptance & Refund Overrides
  └── Rolled-up Reports & Analytics (cross-branch or branch-scoped)
```

Actual available actions depend on capability and scope-based authorization.

## Order Lifecycle

```text
PENDING
  ├── REJECTED (with reason code)
  ├── CANCELLED (pre-preparation only)
  └── CONFIRMED
        ↓
    PREPARING
        ↓
      READY
        ↓
      SERVED
        ↓
    COMPLETED
```

## Order Item Lifecycle

```text
PENDING
  ├── PREPARING
  │     ├── READY ──► SERVED
  │     └── UNAVAILABLE (86'd mid-prep with reason)
  └── CANCELLED
```

## Table Service Status Lifecycle

```text
AVAILABLE ──► OCCUPIED ──► ORDERING ──► PREPARING ──► SERVING ──► PAYMENT_PENDING ──► CLOSING ──► AVAILABLE
```

## Table Session Lifecycle

```text
ACTIVE ──► BILL_REQUESTED ──► CLOSING ──► COMPLETED
  │
  └─────────────────────────────────────► ABANDONED (Idle timeout worker)
```

## Guest Session Lifecycle

```text
ACTIVE ──► LEFT / CLOSED
```

## Payment Flow

```text
Payment Request (Scope: ORDER | ORDER_ITEMS | GUEST_SESSION | TABLE_SESSION)
  ↓
Authorization & Discount Validation
  ↓
Payment Provider / Cash Handling
  ↓
Payment Result (PAID | PARTIALLY_PAID | FAILED)
  ↓
Persist Payment State (Atomic allocation)
  ↓
Emit PaymentCompleted Event (Outbox)
  ↓
Update Order & Table Session State
```

Payment provider integration must be isolated behind adapters.

## Realtime Flow

```text
Command
  ↓
API
  ↓
Domain State Change
  ↓
Event / Outbox
  ↓
Realtime Publisher
  ↓
Subscribed Clients
```

Realtime messages communicate state changes; they do not replace authoritative domain state.

## Feature Development Flow

Every major feature should be implemented as a vertical slice:

```text
Feature
  ↓
Define user flow
  ↓
Define authorization
  ↓
Define contract
  ↓
Backend + Frontend + Realtime
  ↓
Tests
  ↓
Deploy
  ↓
Monitor
```

Example:

```text
Customer submits order
  ↓
API command
  ↓
Validation + authorization
  ↓
Order state change
  ↓
OrderSubmitted event
  ↓
Waiter realtime update
  ↓
Audit
  ↓
Observability
```
