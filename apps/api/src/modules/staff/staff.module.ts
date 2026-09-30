// ============================================================================
// StaffModule — Waiter domain: tables, orders, alerts
// ============================================================================

import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { WaiterService } from './application/services/waiter.service';
import { DrizzleWaiterRepository } from './infrastructure/persistence/drizzle-waiter.repository';
import { DrizzleWaiterOrderRepository } from './infrastructure/persistence/drizzle-waiter-order.repository';
import { DrizzleAlertRepository } from './infrastructure/persistence/drizzle-alert.repository';
import { DrizzleUserRepository } from '../identity/infrastructure/persistence/drizzle-user.repository';
import {
  WaiterTablesController,
  WaiterOrdersController,
  WaiterAlertsController,
  CustomerAlertsController,
} from './presentation/http/waiter.controller';

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
export class StaffModule {}
