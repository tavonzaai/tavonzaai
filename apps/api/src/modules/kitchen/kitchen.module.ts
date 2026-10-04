import { Module } from '@nestjs/common';
import { KitchenService } from './application/kitchen.service';
import { KitchenController } from './presentation/http/kitchen.controller';
import { DrizzleKitchenRepository } from './infrastructure/persistence/drizzle-kitchen.repository';

@Module({
  controllers: [KitchenController],
  providers: [KitchenService, DrizzleKitchenRepository],
  exports: [KitchenService, DrizzleKitchenRepository],
})
export class KitchenModule {}
