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
  ApiParam,
} from '@nestjs/swagger';
import { ApiStandardErrors } from '@/common/swagger';
import { FeedbackService } from '../services/feedback.service';
import { SubmitFeedbackDto, FeedbackResponseDto } from '../dto/feedback.dto';

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
