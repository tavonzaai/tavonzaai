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
  }) {
    let customerId = data.customerId;

    if (!customerId) {
      const [order] = await this.db
        .select({ customerId: orders.customerId })
        .from(orders)
        .where(eq(orders.id, data.orderId))
        .limit(1);

      if (!order) {
        throw new NotFoundException(`Order ${data.orderId} not found`);
      }
      customerId = order.customerId ?? undefined;
    }

    if (!customerId) {
      let [existingCustomer] = await this.db.select().from(customers).limit(1);
      if (!existingCustomer) {
        const [guestUser] = await this.db
          .insert(users)
          .values({
            email: 'guest@tavonza.ai',
            name: 'Table Guest',
            role: 'CUSTOMER',
          })
          .returning();

        if (guestUser) {
          const [newCustomer] = await this.db
            .insert(customers)
            .values({
              userId: guestUser.id,
            })
            .returning();

          existingCustomer = newCustomer;
        }
      }
      customerId = existingCustomer?.id;
    }

    if (!customerId) {
      throw new NotFoundException('Could not resolve customer profile for review');
    }

    const [result] = await this.db
      .insert(orderReviews)
      .values({
        orderId: data.orderId,
        customerId,
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
