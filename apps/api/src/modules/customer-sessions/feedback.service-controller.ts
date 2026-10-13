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
  Injectable,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiProperty,
  ApiPropertyOptional,
  ApiParam,
} from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import { IsUUID, IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';
import { DRIZZLE, type DrizzleDatabase, orderReviews, orders, customers, users } from '@tavonza/database';
import { ApiStandardErrors } from '../../common/swagger';

// ── DTOs ──────────────────────────────────────────────────────────────

export class SubmitFeedbackDto {
  @ApiProperty({ description: 'Order UUID this feedback belongs to', example: '8877332f-4512-40bc-8012-d881e6e58003' })
  @IsUUID()
  orderId!: string;

  @ApiProperty({ description: 'Star rating 1 to 5', example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ description: 'Optional text comment or customer compliments', example: 'Amazing food and lightning-fast service!' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: 'Optional customer UUID if authenticated', example: '11223344-5566-7788-99aa-bbccddeeff00' })
  @IsOptional()
  @IsUUID()
  customerId?: string;
}

export class FeedbackResponseDto {
  @ApiProperty({ example: '77665544-3322-1100-aa99-887766554433', description: 'Review UUID' })
  id!: string;

  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Order UUID' })
  orderId!: string;

  @ApiProperty({ example: '11223344-5566-7788-99aa-bbccddeeff00', description: 'Customer UUID' })
  customerId!: string;

  @ApiProperty({ example: 5, description: 'Star rating recorded' })
  rating!: number;

  @ApiPropertyOptional({ example: 'Amazing food and lightning-fast service!', description: 'Customer comment' })
  comment!: string | null;

  @ApiProperty({ example: '2026-10-08T14:40:00.000Z', description: 'Submission timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: 'Your feedback was submitted successfully.', description: 'Feedback confirmation message' })
  message!: string;
}

// ── Service ───────────────────────────────────────────────────────────

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

// ── Controller ────────────────────────────────────────────────────────

@ApiTags('Customer | Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * POST /feedback
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[Customer] Submit order feedback and rating',
    description: 'Submits 1-5 star dining rating and optional text review for an order upon completion.',
  })
  @ApiCreatedResponse({
    type: FeedbackResponseDto,
    description: 'Feedback recorded successfully',
  })
  @ApiStandardErrors(400, 404, 500)
  async submitFeedback(@Body() dto: SubmitFeedbackDto): Promise<any> {
    const result = await this.feedbackService.submitFeedback(dto);
    return {
      ...result,
      message: 'Your feedback was submitted successfully.',
    };
  }

  /**
   * GET /feedback/order/:orderId
   */
  @Get('order/:orderId')
  @ApiOperation({
    summary: '[Customer] Get feedback for an order',
    description: 'Checks whether feedback has already been submitted for the specified order and retrieves the review.',
  })
  @ApiParam({
    name: 'orderId',
    type: String,
    description: 'Order UUID',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @ApiOkResponse({
    type: FeedbackResponseDto,
    description: 'Existing feedback record or null if not yet rated',
  })
  @ApiStandardErrors(400, 404, 500)
  async getFeedbackByOrder(@Param('orderId') orderId: string): Promise<any> {
    return this.feedbackService.getFeedbackByOrder(orderId);
  }
}
