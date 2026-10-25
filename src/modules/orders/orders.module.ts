// ============================================================================
// OrdersModule — NestJS Module Wiring
// ============================================================================

import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { CartService } from './services/cart.service';
import { CheckoutService } from './services/checkout.service';
import { OrderController } from './controllers/order.controller';
import { CartController } from './controllers/cart.controller';
import { DrizzleOrderRepository } from './repositories/drizzle-order.repository';
import { DrizzleCartRepository } from './repositories/drizzle-cart.repository';
import { ORDER_REPOSITORY } from './repositories/order-repository.interface';
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
