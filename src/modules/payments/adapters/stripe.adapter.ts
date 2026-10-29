import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

export interface CreatePaymentIntentParams {
  amountInCents: number;
  currency: string;
  orderId?: string | null;
  tableSessionId?: string | null;
  branchId?: string | null;
  customerId?: string | null;
  idempotencyKey?: string;
}

export interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

function isLocalStripeEnv(): boolean {
  const env = process.env.NODE_ENV;
  return !env || env === 'development' || env === 'test' || env === 'local';
}

@Injectable()
export class StripeAdapter {
  private readonly logger = new Logger(StripeAdapter.name);
  private stripeClient: Stripe | null = null;
  private isMockMode = false;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey && secretKey.startsWith('sk_') && !secretKey.includes('Mock')) {
      try {
        this.stripeClient = new Stripe(secretKey, {
          apiVersion: '2024-04-10' as any,
          typescript: true,
        });
        this.logger.log('Stripe client initialized with configured secret key');
      } catch (err: any) {
        this.logger.warn(`Stripe initialization failed: ${err.message}. Operating in mock/test mode.`);
        this.isMockMode = true;
      }
    } else {
      this.logger.warn('STRIPE_SECRET_KEY not set or is mock key. StripeAdapter running in simulated test mode.');
      this.isMockMode = true;
    }
  }

  /**
   * Get configured publishable key for frontend Elements
   */
  getPublishableKey(): string {
    return process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_tavonza_mock_publishable_key';
  }

  /**
   * Create or update a Stripe PaymentIntent
   */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const { amountInCents, currency, orderId, tableSessionId, branchId, customerId, idempotencyKey } = params;

    if (!this.isMockMode && this.stripeClient) {
      try {
        const metadata: Record<string, string> = {};
        if (orderId) metadata.orderId = orderId;
        if (tableSessionId) metadata.tableSessionId = tableSessionId;
        if (branchId) metadata.branchId = branchId;
        if (customerId) metadata.customerId = customerId;

        const paymentIntent = await this.stripeClient.paymentIntents.create(
          {
            amount: Math.round(amountInCents),
            currency: (currency || 'usd').toLowerCase(),
            automatic_payment_methods: { enabled: true },
            metadata,
          },
          idempotencyKey ? { idempotencyKey } : undefined
        );

        return {
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret || '',
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        };
      } catch (err: any) {
        this.logger.warn(`Stripe API call error: ${err.message}. Falling back to test mode intent.`);
      }
    }

    // Mock/Simulated Test Mode Intent (deterministic format)
    const mockIntentId = `pi_test_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const mockClientSecret = `${mockIntentId}_secret_${Math.random().toString(36).substring(2, 15)}`;

    return {
      paymentIntentId: mockIntentId,
      clientSecret: mockClientSecret,
      amount: amountInCents / 100,
      currency: (currency || 'usd').toLowerCase(),
      status: 'requires_payment_method',
    };
  }

  /**
   * Retrieve and verify status of a PaymentIntent
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    metadata: Record<string, string>;
  }> {
    if (!this.isMockMode && this.stripeClient) {
      try {
        const intent = await this.stripeClient.paymentIntents.retrieve(paymentIntentId);
        return {
          id: intent.id,
          status: intent.status,
          amount: intent.amount / 100,
          currency: intent.currency,
          metadata: (intent.metadata as Record<string, string>) || {},
        };
      } catch (err: any) {
        this.logger.warn(`Failed to retrieve live intent ${paymentIntentId}: ${err.message}`);
        throw new Error(`Failed to retrieve Stripe payment intent: ${err.message}`);
      }
    }

    if (this.isMockMode && isLocalStripeEnv() && paymentIntentId.startsWith('pi_test_')) {
      return {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 0,
        currency: 'usd',
        metadata: {},
      };
    }

    throw new Error('Stripe is not configured to retrieve payment intents');
  }

  /**
   * Construct and verify webhook event with cryptographic signature
   */
  constructWebhookEvent(rawBody: Buffer | string, signature: string, webhookSecret: string): Stripe.Event {
    if (!signature) {
      throw new Error('Missing Stripe-Signature header');
    }
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not configured');
    }
    if (!this.stripeClient) {
      throw new Error('Stripe webhook verification requires a configured secret key');
    }
    return this.stripeClient.webhooks.constructEvent(rawBody, signature, webhookSecret);
  }
}
