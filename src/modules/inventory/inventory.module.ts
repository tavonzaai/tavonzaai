import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';
import { DrizzleInventoryRepository } from './repositories/drizzle-inventory.repository';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, DrizzleInventoryRepository],
  exports: [InventoryService, DrizzleInventoryRepository],
})
export class InventoryModule {}
