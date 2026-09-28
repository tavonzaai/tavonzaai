// ============================================================================
// OrdersModule — NestJS Module Wiring
// ============================================================================
// Same DI pattern as MenusModule.
// Imports MenusModule for cross-domain menu item data access.
// ============================================================================

import { Module } from '@nestjs/common';
import { OrderService } from './application/services/order.service';
import { OrderController } from './presentation/controllers/order.controller';
import { DrizzleOrderRepository } from './infrastructure/persistence/drizzle-order.repository';
import { ORDER_REPOSITORY } from './domain/interfaces/order-repository.interface';
import { MenusModule } from '../menus/menus.module';

@Module({
  imports: [MenusModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: ORDER_REPOSITORY,
      useClass: DrizzleOrderRepository,
    },
  ],
  exports: [OrderService],
})
export class OrdersModule {}
