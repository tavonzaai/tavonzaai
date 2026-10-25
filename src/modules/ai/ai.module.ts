import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InternalAiController } from './presentation/http/internal-ai.controller';
import { InternalAiService } from './application/internal-ai.service';
import { InternalServiceGuard } from '../../common/guards/internal-service.guard';
import { InventoryModule } from '../inventory/inventory.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-prod',
    }),
    InventoryModule,
    PaymentsModule,
  ],
  controllers: [InternalAiController],
  providers: [InternalAiService, InternalServiceGuard],
  exports: [InternalAiService],
})
export class AiModule {}
