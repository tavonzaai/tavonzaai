// ============================================================================
// Payments Service
// ============================================================================
//
// Figma Screens:
//   "Payment option" → select method
//   "Complete Payment" (card) → POST /payments
//   "Thank you!" receipt → GET /payments/:id
// ============================================================================

import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@tavonza/database';
import { payments, orders } from '@tavonza/database';

type DrizzleDb = any;

function generateTransactionId(): string {
  // Figma receipt shows: #ID-22465476578390-3789
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 10000);
  return `ID-${ts}-${rand}`;
}

@Injectable()
export class PaymentService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  /**
   * GET /payments/options
   * Returns available payment methods for the branch
   * Figma: "Payment option" screen shows card / cash / QR etc.
   */
  async getPaymentOptions(_branchId: string) {
    // In production this would be configured per-branch
    return {
      methods: [
        { id: 'card', label: 'Credit / Debit Card', icon: 'card' },
        { id: 'cash', label: 'Cash', icon: 'cash' },
        { id: 'qr', label: 'QR Payment', icon: 'qr' },
      ],
    };
  }

  /**
   * POST /payments
   * Figma: "Complete Payment" screen — customer pays by card
   *
   * In production: integrate Stripe/PayOS/etc.
   * For now: records payment and marks order as PAID.
   */
  async createPayment(data: {
    orderId: string;
    method: 'card' | 'cash' | 'qr' | 'split';
    amount: number;
    currency?: string;
    tableSessionId?: string;
    customerSessionId?: string;
    // Card fields (only last4 stored — never full card number)
    cardLast4?: string;
    cardholderName?: string;
  }) {
    // Validate order exists
    const orderResult = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, data.orderId))
      .limit(1);

    if (!orderResult[0]) {
      throw new NotFoundException('Order not found');
    }

    const order = orderResult[0];

    if (!['SUBMITTED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'].includes(order.status)) {
      throw new BadRequestException(
        'Order must be submitted before payment can be processed',
      );
    }

    const transactionId = generateTransactionId();
    const now = new Date();

    const result = await this.db
      .insert(payments)
      .values({
        orderId: data.orderId,
        tableSessionId: data.tableSessionId ?? null,
        customerSessionId: data.customerSessionId ?? null,
        method: data.method,
        status: 'completed', // In prod: 'pending' → webhook → 'completed'
        amount: data.amount.toFixed(2),
        currency: data.currency ?? 'USD',
        cardLast4: data.cardLast4 ?? null,
        cardholderName: data.cardholderName ?? null,
        transactionId,
        receiptData: {
          date: now.toLocaleDateString('en-US'),
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          to: data.cardholderName ?? 'Customer',
          total: `$${data.amount.toFixed(2)}`,
        },
        paidAt: now,
      })
      .returning();

    return result[0];
  }

  /**
   * GET /payments/:paymentId
   * Figma: "Thank you!" receipt screen
   * Shows: transaction ID, date, time, total, "PAID" badge
   */
  async getPayment(paymentId: string) {
    const result = await this.db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!result[0]) throw new NotFoundException('Payment not found');
    return result[0];
  }

  /**
   * GET /payments/order/:orderId
   * Get payment for a specific order
   */
  async getPaymentByOrder(orderId: string) {
    const result = await this.db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    return result[0] ?? null;
  }
}
