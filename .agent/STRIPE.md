# Stripe Integration & Webhook Events Specification

This document defines the authoritative architecture, webhook event lifecycle, security requirements, and operational rules for the **Stripe Payment Subsystem** within the Tavonza AI Restaurant Platform.

---

## 1. Architectural Principles & Non-Negotiable Rules

1. **Integration Model: Stripe PaymentIntents API**:
   - Tavonza strictly uses the **Stripe PaymentIntents API** combined with client-side Stripe Elements (`@stripe/stripe-js`).
   - Do **not** use Stripe Checkout Sessions or external redirects for dining room table payments. The payment experience occurs directly within the Tavonza customer frontend application.
2. **Backend is the Authoritative Financial Authority**:
   - The frontend is **never** permitted to calculate, submit, or dictate payable amounts.
   - The backend validates the outstanding balance (`totalAmount - amountPaid`), applies verified promo discounts, and calculates sales tax and tips.
3. **Strict Order Eligibility Gate**:
   - Payment intents can only be generated for orders that have been officially accepted and confirmed by waitstaff (`CONFIRMED`, `PREPARING`, `READY`, `SERVED`).
   - Attempting to initiate payment on an order in `DRAFT` or `PENDING` status is strictly rejected with `400 Bad Request`.
4. **Authoritative Confirmation Only**:
   - A payment is **never** marked `PAID` merely because a client-side button was clicked or an API request was dispatched.
   - Payment records transition to `PAID` strictly when verified by the signed Stripe webhook (`payment_intent.succeeded`) or by direct server-to-server verification (`POST /payments/stripe/verify`).
5. **PostgreSQL Enum Compliance**:
   - In accordance with [`.agent/DATABASE.md`](file:///home/euhan/projects/tavonzaai/.agent/DATABASE.md) and `packages/database/src/schema/enums.ts`, the database `payment_status` enum is strictly:
     `'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED' | 'FAILED'`.
   - There is no `PENDING` enum value in the database. Pending or queued payment intents are stored with status `'UNPAID'`.
   - The Stripe PaymentIntent ID (`pi_...`) is stored in `payments.transactionRef`.

---

## 2. Stripe Webhook Specification

### 2.1 Webhook Endpoint Contract
- **Endpoint Route**: `POST /payments/stripe/webhook`
- **Full Public URL**: `https://<api-domain>/payments/stripe/webhook` (or `https://<api-domain>/api/v1/payments/stripe/webhook`)
- **Required HTTP Header**: `stripe-signature`
- **Request Body**: Raw JSON payload (preserved as Buffer for HMAC verification)

### 2.2 Cryptographic Signature Verification
To prevent spoofing and unauthorized payment manipulation:
1. `apps/api/src/main.ts` configures NestJS with `rawBody: true` to preserve the unaltered request buffer.
2. `StripeAdapter.constructWebhookEvent(rawBody, signature, secret)` computes HMAC-SHA256 signature verification using the Stripe SDK.
3. Requests with invalid, missing, or expired signatures are immediately rejected with `400 Bad Request`.

```text
Incoming HTTP POST
  ├── Header: stripe-signature (timestamp t=..., signature v1=...)
  └── Body: Raw buffer
        ↓
StripeAdapter.constructWebhookEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)
  ├── Invalid Signature  ──► 400 Bad Request (Logged & Aborted)
  └── Valid Signature    ──► Stripe.Event Object
        ↓
PaymentService.handleStripeWebhook(event)
```

---

## 3. Webhook Events: Exact Subscription List & Handlers

Do **not** subscribe to wildcard or unrelated Stripe events. In the Stripe Dashboard or Stripe CLI, subscribe strictly to the following 4 events:

| Stripe Event Name | Frequency | Target Domain Model | Authoritative Backend Handler Behavior |
|---|---|---|---|
| **`payment_intent.succeeded`** | Mandatory | `payments`, `orders`, `table_sessions` | • Looks up `payments` record by `transactionRef = intent.id`.<br>• If already `PAID`: returns 200 OK (idempotent skip).<br>• Updates payment status to `PAID` with `paidAt`.<br>• Updates order `paymentStatus` to `PAID` and increments `amountPaid`.<br>• Emits Socket.IO event `PAYMENT_STATUS_CHANGED`.<br>• Appends `PaymentCompleted` event to Transactional Outbox.<br>• Creates persistent notification for Cashier. |
| **`payment_intent.payment_failed`** | Mandatory | `payments` | • Looks up `payments` record by `transactionRef = intent.id`.<br>• Sets payment record status to `FAILED`.<br>• Emits Socket.IO `PAYMENT_STATUS_CHANGED` with `status: 'FAILED'`.<br>• Does not mark order as paid. |
| **`payment_intent.canceled`** | Recommended | `payments`, `table_sessions` | • Sets payment record status to `FAILED`.<br>• Reverts table session status to `ACTIVE` if table was awaiting settlement.<br>• Emits Socket.IO `PAYMENT_STATUS_CHANGED`. |
| **`charge.refunded`** | Recommended | `payments`, `orders` | • Looks up payment record by charge or payment intent.<br>• Updates status to `REFUNDED` or `PARTIALLY_PAID`.<br>• Records `refundAmount` and `refundRef`.<br>• Emits `PAYMENT_STATUS_CHANGED`. |

---

## 4. Idempotency & Replay Protection

Stripe guarantees *at-least-once* webhook delivery. Network retries or duplicate webhook dispatches must never create double payments or duplicate charges.

### Idempotency Enforcement in `PaymentService`:
```typescript
if (event.type === 'payment_intent.succeeded') {
  const intent = event.data.object;
  const payment = await this.paymentRepo.findByTransactionRef(intent.id);

  if (!payment) {
    this.logger.warn(`Payment record not found for webhook transaction ${intent.id}`);
    return { received: true, processed: false };
  }

  // Idempotent Guard: If already settled, do not re-process
  if (payment.status === 'PAID') {
    this.logger.log(`Payment ${payment.id} already settled; skipping duplicate webhook.`);
    return { received: true, processed: true };
  }

  // Authoritative settlement
  await this.completePaymentSettlement(payment, 'ONLINE_GATEWAY', intent.id);
  return { received: true, processed: true };
}
```

---

## 5. End-to-End Online Payment Lifecycle

```text
1. Customer initiates Card Payment
       │
       ▼
2. POST /payments/stripe/create-intent { orderId }
       │  (Validates order status is CONFIRMED; checks outstanding balance)
       ▼
3. Backend creates UNPAID payment record & calls stripe.paymentIntents.create
       │  (Stores pi_XXXX in payments.transactionRef)
       ▼
4. Returns { clientSecret, paymentIntentId, publishableKey, amount }
       │
       ▼
5. Customer frontend mounts Stripe Card Element via @stripe/stripe-js
       │
       ▼
6. Customer submits card details -> stripe.confirmCardPayment(clientSecret)
       │
       ├─────────────────────────────────┬─────────────────────────────────┐
       ▼ (Synchronous Path)              │                                 ▼ (Asynchronous Webhook Path)
7a. Client calls POST /payments/stripe/verify  │            7b. Stripe dispatches signed webhook
    Backend calls stripe.retrieve(intentId)    │                POST /payments/stripe/webhook
       │                                       │                payment_intent.succeeded
       ▼                                       │                                 ▼
8. Authoritative Settlement:                   │
   • payments.status = 'PAID'                  │
   • orders.paymentStatus = 'PAID'             │
   • orders.amountPaid += amount               │
   • RealtimeGateway emits PAYMENT_STATUS_CHANGED
   • Outbox publishes PaymentCompleted         │
       │                                       │
       ▼                                       ▼
9. Redux RTK Query cache invalidation (tags: ['PAYMENT', 'ORDER'])
   Customer UI routes to /checkout/confirmation with real transaction reference
```

---

## 6. Environment Variables

Configure the following environment variables across backend and frontend:

```env
# Backend API (.env)
STRIPE_SECRET_KEY=sk_test_51...          # Secret key for server-side Stripe SDK
STRIPE_PUBLISHABLE_KEY=pk_test_51...      # Publishable key for Stripe Elements
STRIPE_WEBHOOK_SECRET=whsec_...           # Webhook signing secret from Dashboard or CLI

# Customer Frontend (.env)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

> [!WARNING]
> In production environments, store `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` strictly in AWS Secrets Manager or KMS-encrypted deployment secrets. Never check secrets into source control.

---

## 7. Developer & Staging Setup

### 7.1 Registering Webhook in Stripe Dashboard (Test Mode)
1. Open [Stripe Developer Dashboard](https://dashboard.stripe.com/test/webhooks).
2. Ensure the top-right toggle is set to **Test Mode**.
3. Click **Add an endpoint**.
4. Enter Endpoint URL: `https://<your-domain>/payments/stripe/webhook`.
5. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
6. Click **Add endpoint**.
7. Click **Reveal** under **Signing secret** to obtain your `whsec_...` value.

### 7.2 Testing Locally via Stripe CLI
```bash
# 1. Forward Stripe events to your local NestJS API server
stripe listen --forward-to localhost:3000/payments/stripe/webhook

# 2. Trigger a simulated test payment success event
stripe trigger payment_intent.succeeded

# 3. Trigger a simulated test payment failure event
stripe trigger payment_intent.payment_failed
```
