import { Module } from '@nestjs/common';
import { PaymentService } from './application/payment.service';
import { PaymentController } from './presentation/payment.controller';
import { DrizzlePaymentRepository } from './infrastructure/persistence/drizzle-payment.repository';

import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [PaymentController],
  providers: [PaymentService, DrizzlePaymentRepository],
  exports: [PaymentService, DrizzlePaymentRepository],
})
export class PaymentsModule {}
