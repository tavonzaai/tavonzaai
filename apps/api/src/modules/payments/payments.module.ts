// ============================================================================
// PaymentsModule
// ============================================================================

import { Module } from '@nestjs/common';
import { PaymentService } from './application/payment.service';
import { PaymentController } from './presentation/payment.controller';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentsModule {}
