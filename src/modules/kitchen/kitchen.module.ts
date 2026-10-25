import { Module } from '@nestjs/common';
import { KitchenService } from './services/kitchen.service';
import { KitchenController } from './controllers/kitchen.controller';
import { DrizzleKitchenRepository } from './repositories/drizzle-kitchen.repository';

import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [KitchenController],
  providers: [KitchenService, DrizzleKitchenRepository],
  exports: [KitchenService, DrizzleKitchenRepository],
})
export class KitchenModule {}
