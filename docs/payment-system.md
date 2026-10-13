# Tavonza Payment System Architecture & Integration Guide

This document describes the end-to-end payment subsystem in the **Tavonza AI Restaurant Platform**, including the authoritative backend service architecture, online Stripe processing, offline cashier collection workflows, database schemas, and frontend real-time synchronization.

---

## 1. High-Level Architecture Overview

The Tavonza payment module follows a strictly authoritative modular monolith architecture. No payment state is ever mutated directly by client applications. The backend is the sole authority for calculating payable balances, verifying gateway transactions, enforcing permissions, and transitioning order and session financial states.

```text
       ┌──────────────────────┐          ┌──────────────────────┐
       │   Customer Frontend  │          │   Waiter Frontend    │
       │  (Stripe / Offline)  │          │  (Offline Cash Req)  │
       └──────────┬───────────┘          └──────────┬───────────┘
                  │                                 │
                  ▼                                 ▼
   ┌───────────────────────────────────────────────────────────────┐
   │                  Tavonza Backend API Layer                    │
   │               (NestJS /payment.controller.ts)                 │
   └──────────────────────────────┬────────────────────────────────┘
                                  │
                                  ▼
   ┌───────────────────────────────────────────────────────────────┐
   │             Authoritative Payment Application Service         │
   │                    (payment.service.ts)                       │
   │  • Eligibility gate (Order must be CONFIRMED)                 │
   │  • Authoritative balance calculation                          │
   │  • Discount & Tip validation                                  │
   └───────────────┬───────────────────────────────┬───────────────┘
                   │                               │
       ┌───────────▼───────────┐       ┌───────────▼───────────┐
       │  StripeAdapter (SDK)  │       │   PostgreSQL Database  │
       │  • PaymentIntents API │       │   (Drizzle ORM Engine)│
       │  • Webhook Verification│      │   • payments table    │
       └───────────────────────┘       │   • orders table      │
                                       │   • table_sessions    │
                                       └───────────┬───────────┘
                                                   │
                                                   ▼
                                       ┌───────────────────────┐
                                       │  RealtimeGateway      │
                                       │  (Socket.IO & Outbox) │
                                       │  • PAYMENT_STATUS_CHG │
                                       │  • PAYMENT_REQUESTED  │
                                       └───────────┬───────────┘
                                                   │
                                ┌──────────────────┴──────────────────┐
                                ▼                                     ▼
                     ┌──────────────────────┐              ┌──────────────────────┐
                     │   Cashier Frontend   │              │   Manager Frontend   │
                     │  (Confirm Receipt)   │              │  (Real-Time Audit)   │
                     └──────────────────────┘              └──────────────────────┘
```

---

## 2. Core Payment Workflows

### 2.1 Online Payment via Stripe (PaymentIntents API)

Online payments are executed using Stripe's client-side Elements and the authoritative server-side PaymentIntents lifecycle:

1. **Eligibility Check**: Customer selects online card payment. The backend verifies that the target order has been confirmed by waitstaff (`CONFIRMED`, `PREPARING`, `READY`, or `SERVED`). Orders in `DRAFT` or `PENDING` status are strictly rejected.
2. **Intent Creation**: `POST /payments/stripe/create-intent` is invoked with `orderId` or `tableSessionId`.
   - The backend validates the outstanding balance (`totalAmount - amountPaid`).
   - If an `UNPAID` payment intent already exists for the order, its client secret is safely returned.
   - Otherwise, a new Stripe PaymentIntent is generated via `stripeAdapter.createPaymentIntent(...)`.
   - An `UNPAID` database record is persisted in `payments` with `transactionRef = intent.id`.
3. **Card Confirmation**: Customer inputs payment credentials via Stripe Elements on the frontend. Stripe confirms the charge client-side.
4. **Authoritative Verification**:
   - **Path A (Frontend Synchronous Verification)**: Frontend immediately calls `POST /payments/stripe/verify` with `{ paymentIntentId }`. The backend retrieves the authoritative PaymentIntent status directly from Stripe API.
   - **Path B (Asynchronous Webhook)**: Stripe issues signed `payment_intent.succeeded` event to `POST /payments/stripe/webhook`.
5. **Settlement**: Upon verifying `succeeded`, `completePaymentSettlement(...)` transitions the payment record to `PAID`, updates order `paymentStatus` to `PAID`, emits Socket.IO event `PAYMENT_STATUS_CHANGED`, and inserts an event into the transactional outbox.

### 2.2 Offline Payment via Cash / Card Terminal (Cashier Flow)

Offline table transactions require physical handover of currency or an in-venue card terminal receipt:

```text
Customer selects Cash/Terminal
              ↓
Waiter or Customer calls POST /payments/request-offline
              ↓
Backend checks order confirmation, creates UNPAID record (REQ-XXXX)
              ↓
TableSession moves to BILL_REQUESTED & Table moves to PAYMENT_PENDING
              ↓
Realtime event PAYMENT_REQUESTED emitted to Cashier Station
              ↓
Cashier collects currency and clicks "Confirm Payment Received"
              ↓
Cashier client calls POST /payments/offline/:id/confirm
              ↓
Backend verifies cashier identity (staffUserId) and records settledById
              ↓
Payment record becomes PAID; Order paymentStatus becomes PAID
              ↓
Socket.IO emits PAYMENT_STATUS_CHANGED to Customer, Waiter, and Cashier
              ↓
Customer & Waiter interfaces automatically synchronize to Settled Receipt
```

Merely acknowledging an alert does **not** settle the payment. Settlement occurs strictly upon invocation of `/payments/offline/:id/confirm` or `/payments/confirm-offline`.

---

## 3. Database Models & Schema Specifications

The schema is defined using Drizzle ORM in `packages/database/src/schema/billing.ts` and `orders.ts`.

### 3.1 Database Enums

PostgreSQL database enums are defined in `packages/database/src/schema/enums.ts`:

- `payment_status`: Strictly `'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED' | 'FAILED'`.
  *(Note: There is no `PENDING` database enum for `payment_status`; uncompleted or queued payments reside in `'UNPAID'` status).*
- `payment_method`: Strictly `'CASH' | 'CARD' | 'MOBILE_WALLET' | 'ONLINE_GATEWAY'`.
- `payment_scope`: Strictly `'FULL_ORDER' | 'ORDER_ITEMS' | 'SPLIT_EQUAL' | 'CUSTOM'`.
- `order_status`: `'PENDING' | 'ACCEPTED' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'`.

### 3.2 Tables and Invariants

#### `payments`
- `id`: UUID (Primary Key)
- `orderId`: UUID (Nullable foreign key to `orders.id`)
- `tableSessionId`: UUID (Nullable foreign key to `table_sessions.id`)
- `payerGuestSessionId`: UUID (Nullable foreign key to `guest_sessions.id`)
- `scope`: `payment_scope` enum
- `amount`: double precision (Must match authoritative balance)
- `tipAmount`: double precision (Default `0`)
- `method`: `payment_method` enum
- `status`: `payment_status` enum (Initial: `UNPAID`, Settled: `PAID`)
- `transactionRef`: string (e.g. `pi_...` for Stripe, `REQ-...` for offline requests)
- `paidAt`: timestamp with time zone (Set only when settled)
- `settledById`: UUID (Staff user ID who confirmed the payment)
- `collectedById`: UUID (Staff member who collected physical payment)
- `refundRef`: string (Reason or refund ID)
- `refundAmount`: double precision (Refunded sum)
- `createdAt`: timestamp with time zone

#### `payment_allocations`
Tracks item-level split billing allocations:
- `id`: UUID (Primary Key)
- `paymentId`: UUID (Foreign key to `payments.id`)
- `orderId`: UUID (Nullable foreign key to `orders.id`)
- `orderItemId`: UUID (Nullable foreign key to `order_items.id`)
- `amount`: double precision

---

## 4. Backend API Endpoints Contract

All endpoints are mounted under the `/payments` prefix.

| Method | Endpoint | Access / Guard | Description |
|---|---|---|---|
| `GET` | `/payments/options?branchId=...` | Public / Customer | Returns branch currency & Stripe publishable key |
| `POST` | `/payments/stripe/create-intent` | Public / Customer | Creates PaymentIntent with authoritative amount |
| `POST` | `/payments/stripe/verify` | Public / Customer | Verifies PaymentIntent status from Stripe API |
| `POST` | `/payments/stripe/webhook` | Stripe Public | Cryptographically verified Stripe webhook listener |
| `POST` | `/payments/request-offline` | Customer / Waiter | Requests cash/card offline payment collection |
| `GET` | `/payments/offline/requests` | Cashier / Staff | Retrieves pending `UNPAID` requests for branch |
| `POST` | `/payments/offline/:id/confirm` | Cashier / Staff | Confirms physical payment receipt with `settledById` |
| `POST` | `/payments/confirm-offline` | Cashier / Staff | Body-based alias for cashier offline confirmation |
| `POST` | `/payments/offline/:id/reject` | Cashier / Staff | Rejects offline request, marks `FAILED` |
| `POST` | `/payments/reject-offline` | Cashier / Staff | Body-based alias for cashier offline rejection |
| `POST` | `/payments/:id/refund` | Manager / Cashier | Authoritatively refunds transaction |
| `GET` | `/payments/:id` | Customer / Staff | Fetches itemized payment receipt breakdown |
| `GET` | `/payments/order/:orderId` | Customer / Staff | Lists all payment records for an order |
| `GET` | `/payments/session/:sessionId/bill` | Customer / Staff | Consolidated bill breakdown for table session |

---

## 5. Request & Response Examples

### 5.1 Create Stripe PaymentIntent
**Request (`POST /payments/stripe/create-intent`):**
```json
{
  "orderId": "8877332f-4512-40bc-8012-d881e6e58003",
  "tipAmount": 5.00
}
```

**Response (`201 Created`):**
```json
{
  "clientSecret": "pi_3MtwxAEbvhnraI_secret_LgZ762e",
  "paymentIntentId": "pi_3MtwxAEbvhnraI",
  "amount": 55.97,
  "currency": "USD",
  "publishableKey": "pk_test_TYooMQauvdEDq54NiTphI7jx",
  "orderId": "8877332f-4512-40bc-8012-d881e6e58003",
  "tableSessionId": null
}
```

### 5.2 Request Offline Payment
**Request (`POST /payments/request-offline`):**
```json
{
  "orderId": "8877332f-4512-40bc-8012-d881e6e58003",
  "method": "CASH",
  "tipAmount": 2.00
}
```

**Response (`201 Created`):**
```json
{
  "id": "55667788-99aa-bbcc-ddee-112233445566",
  "orderId": "8877332f-4512-40bc-8012-d881e6e58003",
  "tableSessionId": "11223344-5566-7788-99aa-bbccddeeff00",
  "amount": 52.97,
  "tipAmount": 2.00,
  "method": "CASH",
  "status": "UNPAID",
  "transactionRef": "REQ-172839281-4829",
  "paidAt": null
}
```

### 5.3 Cashier Confirms Offline Payment
**Request (`POST /payments/offline/55667788-99aa-bbcc-ddee-112233445566/confirm`):**
```json
{
  "receivedAmount": 52.97,
  "tipAmount": 2.00
}
```

**Response (`200 OK`):**
```json
{
  "id": "55667788-99aa-bbcc-ddee-112233445566",
  "orderId": "8877332f-4512-40bc-8012-d881e6e58003",
  "status": "PAID",
  "method": "CASH",
  "amount": 52.97,
  "tipAmount": 2.00,
  "transactionRef": "REQ-172839281-4829",
  "settledById": "c018274a-2938-412e-9d29-192837461029",
  "paidAt": "2026-10-10T16:30:00.000Z"
}
```

---

## 6. Realtime Events & Cache Synchronization

The payment subsystem coordinates real-time synchronization using **Socket.IO** server rooms partitioned by branch (`branch:<branchId>`) and table session:

1. **`PAYMENT_REQUESTED`**:
   - Emitted to `branch:<branchId>` when customer or waiter submits an offline request.
   - Cashier interface captures this event and refreshes its offline requests queue.
2. **`PAYMENT_STATUS_CHANGED`**:
   - Emitted whenever a payment record transitions to `PAID` or `FAILED`.
   - Customer `RealtimeBridge` receives event and triggers tag invalidation `['PAYMENT', 'ORDER']`.
   - Waiter and Cashier dashboards invalidate `['PAYMENT', 'ORDER', 'TABLE', 'DASHBOARD']`.
3. **`TABLE_STATUS_CHANGED`**:
   - Emitted when an offline request sets the table service status to `PAYMENT_PENDING`, or when full settlement clears the table status.
