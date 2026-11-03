import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDatabase, orderReviews, orders, customers, users } from '@/database';

@Injectable()
export class FeedbackService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  /**
   * POST /feedback
   * Figma: "How Was Your Experience?" screen
   */
  async submitFeedback(data: {
    orderId: string;
    rating: number;
    comment?: string;
    customerId?: string;
    guestSessionId?: string;
  }) {
    let customerId = data.customerId;
    let guestSessionId = data.guestSessionId;

    const [order] = await this.db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        guestSessionId: orders.guestSessionId,
      })
      .from(orders)
      .where(eq(orders.id, data.orderId))
      .limit(1);

    if (!order) {
      throw new NotFoundException(`Order ${data.orderId} not found`);
    }

    if (!customerId && !guestSessionId) {
      customerId = order.customerId ?? undefined;
      guestSessionId = order.guestSessionId ?? undefined;
    }

    if (!customerId && !guestSessionId) {
      throw new NotFoundException('Could not resolve customer or guest session for review attribution');
    }

    const [result] = await this.db
      .insert(orderReviews)
      .values({
        orderId: data.orderId,
        customerId: customerId ?? null,
        guestSessionId: guestSessionId ?? null,
        rating: Math.min(5, Math.max(1, Number(data.rating))),
        comment: data.comment ?? null,
      })
      .returning();

    return result;
  }

  /**
   * GET /feedback/order/:orderId
   */
  async getFeedbackByOrder(orderId: string) {
    const [result] = await this.db
      .select()
      .from(orderReviews)
      .where(eq(orderReviews.orderId, orderId))
      .limit(1);

    return result ?? null;
  }
}
