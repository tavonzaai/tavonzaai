# Stripe Webhook Setup, Configuration & Operations Guide

This guide details the complete configuration, security model, and testing procedures for the **Tavonza Stripe Webhook Subsystem**.

---

## 1. Stripe Integration Type

Tavonza integrates with Stripe using the **PaymentIntents API** (rather than Checkout Sessions). 

In this flow:
- The backend generates a Stripe `PaymentIntent` via `stripe.paymentIntents.create`.
- The customer completes card payment using Stripe Elements on the customer frontend.
- Stripe asynchronously delivers signed webhook events to Tavonza's webhook listener to confirm authoritative settlement.

---

## 2. Webhook Endpoint Specifications

### 2.1 Endpoint URL
The authoritative webhook endpoint is mounted at:

```http
POST https://<your-api-domain>/payments/stripe/webhook
```

*(Note: Depending on reverse-proxy or API Gateway path rewrites, e.g., if `/api/v1` is prefixed, the public URL is `https://<your-api-domain>/api/v1/payments/stripe/webhook`).*

### 2.2 HTTP Methods & Headers
- **HTTP Method**: `POST`
- **Required Header**: `stripe-signature` (containing timestamp `t=` and HMAC signature `v1=`)
- **Content-Type**: `application/json`

---

## 3. Required Webhook Events

Do **not** subscribe to "all events" in the Stripe Dashboard. Subscribe strictly to the events required for the PaymentIntents and refund lifecycle:

| Event Name | Purpose in Tavonza |
|---|---|
| **`payment_intent.succeeded`** | **Mandatory.** Triggered when a card payment succeeds. The backend authoritatively settles the payment record, sets status to `PAID`, marks the order as paid, and emits real-time events. |
| **`payment_intent.payment_failed`** | **Mandatory.** Triggered when a card charge is declined or authentication fails. Marks the payment record as `FAILED`. |
| **`payment_intent.canceled`** | **Recommended.** Triggered if a pending intent is explicitly canceled. Sets payment record to `FAILED`. |
| **`charge.refunded`** | **Recommended.** Triggered when a manager issues a partial or full refund through Stripe. Updates settlement state and logs refund reference. |

---

## 4. Environment Variables Configuration

Configure the following environment variables in your backend `.env` or deployment secrets vault:

```env
# Stripe Secret API Key (Use Test Mode key for development / testing)
STRIPE_SECRET_KEY=sk_test_51...

# Stripe Publishable Key (Exposed to Customer frontend)
STRIPE_PUBLISHABLE_KEY=pk_test_51...

# Stripe Webhook Signing Secret (Obtained from Dashboard or Stripe CLI)
STRIPE_WEBHOOK_SECRET=whsec_...
```

> [!CAUTION]
> Never commit actual Stripe live secrets (`sk_live_...`) or production webhook signing secrets (`whsec_...`) to version control. Always store them in AWS Secrets Manager, Doppler, or encrypted environment files.

---

## 5. Webhook Signature Verification Mechanics

To protect against man-in-the-middle attacks and fraudulent payment claims, Stripe signs every webhook payload.

### How Tavonza Verifies Signatures:
1. **Raw Body Preservation**: In `apps/api/src/main.ts`, the NestJS application is bootstrapped with `rawBody: true`:
   ```typescript
   const app = await NestFactory.create(AppModule, { rawBody: true });
   ```
2. **Cryptographic Validation**: In `apps/api/src/modules/payments/infrastructure/adapters/stripe.adapter.ts`, `stripe.webhooks.constructEvent` computes the HMAC SHA256 of the raw Buffer using `STRIPE_WEBHOOK_SECRET` and compares it with `stripe-signature`:
   ```typescript
   event = this.stripeClient.webhooks.constructEvent(rawBody, signature, webhookSecret);
   ```
3. If the signature is invalid or altered, the backend throws `400 Bad Request` and refuses to process the event.

---

## 6. Idempotency & Duplicate Delivery Handling

Stripe operates on an *at-least-once delivery* model. A single event may be dispatched multiple times due to network timeouts.

Tavonza enforces idempotent processing in `payment.service.ts`:
```typescript
if (event.type === 'payment_intent.succeeded') {
  const intent = event.data.object;
  const payment = await this.paymentRepo.findByTransactionRef(intent.id);

  if (payment && payment.status === 'PAID') {
    this.logger.log(`Payment ${payment.id} already settled; skipping duplicate webhook.`);
    return { received: true, processed: true };
  }

  await this.completePaymentSettlement(payment, 'ONLINE_GATEWAY', intent.id);
  return { received: true, processed: true };
}
```
- If a duplicate `payment_intent.succeeded` event arrives, the handler detects that `payment.status` is already `'PAID'`.
- It returns HTTP `200 OK` (`{ received: true, processed: true }`) immediately without re-crediting the balance, preventing double charges or duplicate outbox events.

---

## 7. Step-by-Step Stripe Dashboard Configuration

Follow these steps to register the webhook in the Stripe Developer Dashboard:

1. Log in to the [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard). Ensure **Test Mode** toggle is switched **ON** in the top-right corner.
2. Navigate to **Developers** → **Webhooks** (`https://dashboard.stripe.com/test/webhooks`).
3. Click **Add an endpoint**.
4. In the **Endpoint URL** field, enter your public backend URL:
   `https://api.yourdomain.com/payments/stripe/webhook`
5. Under **Select events to listen to**, select:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
6. Click **Add endpoint**.
7. In the newly created webhook endpoint details page, find **Signing secret**.
8. Click **Reveal** to copy the signing secret starting with `whsec_...`.
9. Set this value in your backend `.env` file as `STRIPE_WEBHOOK_SECRET`.

---

## 8. Local Development Testing via Stripe CLI

For local development or testing behind localhost:

1. Install the Stripe CLI:
   ```bash
   curl -s https://packages.stripe.dev/stripe-cli-gpg/stripe.gpg | sudo gpg --dearmor -o /usr/share/keyrings/stripe.gpg
   echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee /etc/apt/sources.list.d/stripe.list
   sudo apt-get update && sudo apt-get install stripe
   ```
2. Authenticate the CLI with your Stripe test account:
   ```bash
   stripe login
   ```
3. Forward events to your local API server:
   ```bash
   stripe listen --forward-to localhost:3000/payments/stripe/webhook
   ```
4. The CLI will output your local webhook signing secret:
   ```text
   > Ready! Your webhook signing secret is whsec_test_secret_123456
   ```
   Copy this into your local `.env` as `STRIPE_WEBHOOK_SECRET`.
5. In a second terminal, trigger a test payment success event:
   ```bash
   stripe trigger payment_intent.succeeded
   ```
6. Verify that your local API logs display:
   ```text
   [PaymentService] Received verified Stripe webhook event: payment_intent.succeeded
   ```

---

## 9. Troubleshooting & Common Failure Modes

### Issue 1: `Webhook Error: No signatures found matching the expected signature`
- **Cause**: The raw body was parsed by `express.json()` before signature verification, modifying whitespace or encoding.
- **Remedy**: Verify `rawBody: true` is configured in `NestFactory.create` (`main.ts`) and `req.rawBody` is passed to `stripeAdapter.constructWebhookEvent`.

### Issue 2: `Webhook Error: Signature verification failed`
- **Cause**: The `STRIPE_WEBHOOK_SECRET` does not match the webhook endpoint in the Stripe Dashboard.
- **Remedy**: Ensure the signing secret matches the exact endpoint URL in test mode. Do not mix test and live secrets.

### Issue 3: Duplicate deliveries causing database lock timeouts
- **Cause**: Slow response from webhook handler causing Stripe to retry after 5 seconds.
- **Remedy**: Ensure `handleStripeWebhook` is non-blocking. Tavonza uses lightweight transactional queries and pushes heavy notification logic to outbox background workers.
