import { Module } from '@nestjs/common';
import { InventoryService } from './application/inventory.service';
import { InventoryController } from './presentation/inventory.controller';
import { DrizzleInventoryRepository } from './infrastructure/persistence/drizzle-inventory.repository';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, DrizzleInventoryRepository],
  exports: [InventoryService, DrizzleInventoryRepository],
})
export class InventoryModule {}
