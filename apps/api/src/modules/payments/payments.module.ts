import { Module } from '@nestjs/common';
import { PaymentService } from './application/payment.service';
import { PaymentController } from './presentation/payment.controller';
import { DrizzlePaymentRepository } from './infrastructure/persistence/drizzle-payment.repository';

import { StripeAdapter } from './infrastructure/adapters/stripe.adapter';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [PaymentController],
  providers: [PaymentService, DrizzlePaymentRepository, StripeAdapter],
  exports: [PaymentService, DrizzlePaymentRepository, StripeAdapter],
})
export class PaymentsModule {}
