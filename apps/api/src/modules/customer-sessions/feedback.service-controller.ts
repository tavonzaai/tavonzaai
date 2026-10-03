// ============================================================================
// Feedback Service & Controller
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { IsUUID, IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';
import { DRIZZLE, type DrizzleDatabase, orderReviews, orders, customers, users } from '@tavonza/database';

// ── DTOs ──────────────────────────────────────────────────────────────

export class SubmitFeedbackDto {
  @ApiProperty({ description: 'Order this feedback belongs to' })
  @IsUUID()
  orderId!: string;

  @ApiProperty({ description: 'Star rating 1-5', example: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ required: false, description: 'Text comment', example: 'Amazing food!' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;
}

// ── Service ───────────────────────────────────────────────────────────

@Injectable()
export class FeedbackService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  /**
   * POST /feedback
   * Figma: "How Was Your Experience?" screen
   * Fields: star rating (1-5), text comment
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
      // Find or provision a guest customer profile
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
   * Get feedback for an order
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

// ── Controller ────────────────────────────────────────────────────────

@ApiTags('Customer | Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * POST /feedback
   * Figma: "Submit Review" button on Feedback screen
   * On success → shows "Thank You — Your feedback was Successfully." screen
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Customer] Submit order feedback and rating' })
  @ApiCreatedResponse({ description: 'Feedback recorded — show Thank You screen' })
  async submitFeedback(@Body() dto: SubmitFeedbackDto) {
    const result = await this.feedbackService.submitFeedback(dto);
    return {
      ...result,
      message: 'Your feedback was submitted successfully.',
    };
  }

  /**
   * GET /feedback/order/:orderId
   * Check if feedback already submitted for this order
   */
  @Get('order/:orderId')
  @ApiOperation({ summary: '[Customer] Get feedback for an order' })
  @ApiOkResponse({ description: 'Feedback record or null if not yet submitted' })
  async getFeedbackByOrder(@Param('orderId') orderId: string) {
    return this.feedbackService.getFeedbackByOrder(orderId);
  }
}
