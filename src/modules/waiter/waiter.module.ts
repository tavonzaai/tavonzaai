// ============================================================================
// WaiterModule — Waiter domain: tables, orders, alerts
// ============================================================================

import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { WaiterService } from './services/waiter.service';
import { DrizzleWaiterRepository } from './repositories/drizzle-waiter.repository';
import { DrizzleWaiterOrderRepository } from './repositories/drizzle-waiter-order.repository';
import { DrizzleAlertRepository } from './repositories/drizzle-alert.repository';
import { DrizzleUserRepository } from '../identity/repositories/drizzle-user.repository';
import {
  WaiterTablesController,
  WaiterOrdersController,
  WaiterAlertsController,
  CustomerAlertsController,
} from './controllers/waiter.controller';

@Module({
  imports: [
    IdentityModule, // provides JwtModule + PassportModule for JwtAuthGuard
  ],
  controllers: [
    WaiterTablesController,
    WaiterOrdersController,
    WaiterAlertsController,
    CustomerAlertsController,
  ],
  providers: [
    WaiterService,
    DrizzleWaiterRepository,
    DrizzleWaiterOrderRepository,
    DrizzleAlertRepository,
    DrizzleUserRepository, // needed for auto-create customer + staff lookup
  ],
  exports: [WaiterService],
})
export class WaiterModule {}
