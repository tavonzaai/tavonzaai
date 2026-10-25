// ============================================================================
// OrdersModule — NestJS Module Wiring
// ============================================================================

import { Module } from '@nestjs/common';
import { OrderService } from './application/services/order.service';
import { CartService } from './application/services/cart.service';
import { CheckoutService } from './application/services/checkout.service';
import { OrderController } from './presentation/controllers/order.controller';
import { CartController } from './presentation/controllers/cart.controller';
import { DrizzleOrderRepository } from './infrastructure/persistence/drizzle-order.repository';
import { DrizzleCartRepository } from './infrastructure/persistence/drizzle-cart.repository';
import { ORDER_REPOSITORY } from './domain/interfaces/order-repository.interface';
import { MenusModule } from '../menus/menus.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [MenusModule, NotificationsModule, IdentityModule],
  controllers: [CartController, OrderController],
  providers: [
    OrderService,
    CartService,
    CheckoutService,
    DrizzleCartRepository,
    {
      provide: ORDER_REPOSITORY,
      useClass: DrizzleOrderRepository,
    },
  ],
  exports: [OrderService, CartService, CheckoutService],
})
export class OrdersModule {}
