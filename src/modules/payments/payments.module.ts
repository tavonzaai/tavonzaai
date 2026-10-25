import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';
import { DrizzlePaymentRepository } from './repositories/drizzle-payment.repository';

import { StripeAdapter } from './adapters/stripe.adapter';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [NotificationsModule, AuthorizationModule, IdentityModule],
  controllers: [PaymentController],
  providers: [PaymentService, DrizzlePaymentRepository, StripeAdapter],
  exports: [PaymentService, DrizzlePaymentRepository, StripeAdapter],
})
export class PaymentsModule {}
