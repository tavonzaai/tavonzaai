import { Module } from '@nestjs/common';
import { KitchenService } from './application/kitchen.service';
import { KitchenController } from './presentation/http/kitchen.controller';
import { DrizzleKitchenRepository } from './infrastructure/persistence/drizzle-kitchen.repository';

import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [KitchenController],
  providers: [KitchenService, DrizzleKitchenRepository],
  exports: [KitchenService, DrizzleKitchenRepository],
})
export class KitchenModule {}
