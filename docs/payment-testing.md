# Tavonza Payment System Verification & Testing Guide

This guide provides complete, step-by-step instructions for verifying both online Stripe payments and offline cashier collection flows in development and staging environments.

---

## 1. Automated Test Suite Execution

Tavonza includes a dedicated automated integration test suite validating all 8 critical payment invariants.

### Run the Test Suite:
```bash
node scratch/test-payments.js
```

### Verified Test Assertions:
- **Test 1**: `getPaymentOptions` returns valid branch currency and Stripe publishable key.
- **Test 2**: `createStripePaymentIntent` strictly rejects unconfirmed orders (`PENDING` or `DRAFT`).
- **Test 3**: `createStripePaymentIntent` computes the exact authoritative balance for a `CONFIRMED` order and creates an `UNPAID` ledger record.
- **Test 4**: `verifyStripePayment` authoritatively queries the gateway and settles the order and payment to `PAID`.
- **Test 5**: `handleStripeWebhook` processes `payment_intent.succeeded` idempotently, preventing duplicate payments upon replay.
- **Test 6**: `requestOfflinePayment` generates an `UNPAID` request with `REQ-...` reference and updates table session to `BILL_REQUESTED`.
- **Test 7**: `confirmOfflinePayment` records cashier `settledById`, updates order to `PAID`, and emits real-time events.
- **Test 8**: `rejectOfflinePayment` marks the record `FAILED` with refund/rejection reason and reverts session to `ACTIVE`.

---

## 2. Testing Online Stripe Payments (Stripe Elements)

### 2.1 Test Successful Card Payment
1. **Prepare a Confirmed Order**:
   - Open the Waiter Dashboard (`http://localhost:3102`).
   - Confirm a guest order for Table 4 so its status transitions to `CONFIRMED`.
2. **Open Customer Payment Screen**:
   - Navigate to `http://localhost:3100/checkout/payment?order=<orderId>&table=Table%2004`.
   - The UI displays the authoritative bill breakdown fetched from the backend.
3. **Select Stripe Card**:
   - Ensure "Stripe Card (Online)" tab is active.
   - Enter Stripe standard test card credentials:
     - **Card Number**: `4242 4242 4242 4242`
     - **MM/YY**: Any future date (e.g. `12/28`)
     - **CVC**: Any 3 digits (e.g. `123`)
     - **ZIP**: `90210`
4. **Submit Charge**:
   - Click **Pay with Stripe**.
   - The client confirms with Stripe, the backend verifies the intent via `/payments/stripe/verify`, and the order is marked `PAID`.
   - The browser automatically transitions to `/checkout/confirmation` displaying the official digital receipt with the real `pi_...` transaction reference.

### 2.2 Test Failed / Declined Card
1. On the same checkout screen, input Stripe decline test card:
   - **Card Number**: `4000 0000 0000 0002` (Always declines with `card_declined`)
2. Click **Pay with Stripe**.
3. **Expected Behavior**:
   - Stripe rejects the charge with error message `"Your card was declined."`
   - The UI displays the error in the alert box.
   - The payment record remains `UNPAID` or moves to `FAILED`; the order remains unpaid.

### 2.3 Test Webhook Delivery & Idempotency
1. Forward Stripe events to your local API:
   ```bash
   stripe listen --forward-to localhost:3000/payments/stripe/webhook
   ```
2. Trigger a test success event:
   ```bash
   stripe trigger payment_intent.succeeded
   ```
3. Verify that the API server logs:
   ```text
   [PaymentService] Received verified Stripe webhook event: payment_intent.succeeded
   ```
4. Re-send the exact same event using Stripe CLI:
   ```bash
   stripe trigger payment_intent.succeeded
   ```
5. **Expected Behavior**:
   - The API server detects that the payment is already settled:
   ```text
   [PaymentService] Payment pay_... already settled; skipping duplicate webhook.
   ```
   - No duplicate ledger entries or charges are recorded.

---

## 3. Testing Offline Cashier Payments

### 3.1 Test Offline Cash Payment Flow
1. **Submit Offline Request**:
   - On the Customer Payment screen (`/checkout/payment`), click **Cash at Table (Cashier)**.
   - Click **Request Cash Payment at Table**.
   - Backend creates an `UNPAID` payment with reference `REQ-XXXX`, transitions table session to `BILL_REQUESTED`, and table status to `PAYMENT_PENDING`.
   - The customer screen displays: `"Request Submitted to Cashier. Reference REQ-XXXX."`
2. **Cashier Realtime Notification**:
   - Open Cashier Dashboard (`http://localhost:3101/cashier-dashboard/table-view`).
   - The cashier receives a realtime alert: `"Offline Payment Requested for Table 4"`.
   - Table 4 displays badge: `Payment Pending`.
3. **Cashier Confirmation**:
   - In the Cashier Table View, select Table 4 and click **Confirm Cash Paid**.
   - Cashier invokes `POST /payments/offline/:id/confirm`.
   - Backend stamps `settledById = <cashierUserId>`, updates payment status to `PAID`, and marks order `paymentStatus = 'PAID'`.
4. **Realtime Customer & Waiter Synchronization**:
   - The customer screen automatically detects the `tavonza:payment_status_changed` Socket.IO event and redirects to `/checkout/confirmation` with `Settled` badge.
   - The Waiter Dashboard bill view updates to `Settled`.

---

## 4. Testing Payment Security & Invariants

### 4.1 Order Eligibility Invariant Test
Attempt to initiate payment on an unconfirmed order:
```bash
curl -X POST http://localhost:3000/payments/stripe/create-intent \
  -H "Content-Type: application/json" \
  -d '{"orderId": "<PENDING_ORDER_UUID>"}'
```
**Expected Response (`400 Bad Request`):**
```json
{
  "statusCode": 400,
  "message": "Payment cannot be processed for order in PENDING status. Order must first be confirmed by waitstaff."
}
```

### 4.2 Unauthorized Cashier Confirmation Test
Attempt to confirm offline payment without JWT staff authorization:
```bash
curl -X POST http://localhost:3000/payments/offline/<PAYMENT_UUID>/confirm \
  -H "Content-Type: application/json" \
  -d '{"receivedAmount": 45.00}'
```
**Expected Response (`401 Unauthorized`):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
Payment confirmation is restricted strictly to authenticated cashier staff.
