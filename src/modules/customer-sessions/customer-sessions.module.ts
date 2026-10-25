// ============================================================================
// CustomerSessionsModule — Feedback
// ============================================================================

import { Module } from '@nestjs/common';
import { FeedbackService, FeedbackController } from './feedback.service-controller';

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class CustomerSessionsModule {}
