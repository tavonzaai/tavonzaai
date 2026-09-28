// ============================================================================
// Feedback Service + Controller
// ============================================================================
//
// Figma Screens:
//   "Feedback / How Was Your Experience?" → POST /feedback
//   "Thank You — Your feedback was Successfully." → response
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
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
import { DRIZZLE } from '@tavonza/database';
import { feedback } from '@tavonza/database';

type DrizzleDb = any;

// ── Service ───────────────────────────────────────────────────────────

@Injectable()
export class FeedbackService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  /**
   * POST /feedback
   * Figma: "How Was Your Experience?" screen
   * Fields: star rating (1-5), text comment
   */
  async submitFeedback(data: {
    orderId: string;
    rating: string;
    comment?: string;
    tableSessionId?: string;
    customerSessionId?: string;
    userId?: string;
  }) {
    const result = await this.db
      .insert(feedback)
      .values({
        orderId: data.orderId,
        tableSessionId: data.tableSessionId ?? null,
        customerSessionId: data.customerSessionId ?? null,
        userId: data.userId ?? null,
        rating: data.rating,
        comment: data.comment ?? null,
      })
      .returning();

    return result[0];
  }

  /**
   * GET /feedback/order/:orderId
   * Get feedback for an order
   */
  async getFeedbackByOrder(orderId: string) {
    const result = await this.db
      .select()
      .from(feedback)
      .where(eq(feedback.orderId, orderId))
      .limit(1);

    return result[0] ?? null;
  }
}

// ── DTOs ──────────────────────────────────────────────────────────────

class SubmitFeedbackDto {
  @ApiProperty({ description: 'Order this feedback belongs to' })
  orderId!: string;

  @ApiProperty({ description: 'Star rating 1-5', example: '5' })
  rating!: string;

  @ApiProperty({ required: false, description: 'Text comment', example: 'Amazing food!' })
  comment?: string;

  @ApiProperty({ required: false })
  tableSessionId?: string;

  @ApiProperty({ required: false })
  customerSessionId?: string;
}

// ── Controller ────────────────────────────────────────────────────────

@ApiTags('feedback')
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
  @ApiOperation({ summary: 'Submit order feedback and rating' })
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
  @ApiOperation({ summary: 'Get feedback for an order' })
  @ApiOkResponse({ description: 'Feedback record or null if not yet submitted' })
  async getFeedbackByOrder(@Param('orderId') orderId: string) {
    return this.feedbackService.getFeedbackByOrder(orderId);
  }
}
