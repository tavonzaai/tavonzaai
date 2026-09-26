import { Module } from '@nestjs/common';
import { IdentityModule } from './modules/identity/identity.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { BranchesModule } from './modules/branches/branches.module';
import { StaffModule } from './modules/staff/staff.module';
import { FloorsModule } from './modules/floors/floors.module';
import { TablesModule } from './modules/tables/tables.module';
import { MenusModule } from './modules/menus/menus.module';
import { CustomerSessionsModule } from './modules/customer-sessions/customer-sessions.module';
import { TableSessionsModule } from './modules/table-sessions/table-sessions.module';
import { OrdersModule } from './modules/orders/orders.module';
import { KitchenModule } from './modules/kitchen/kitchen.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    IdentityModule,
    AuthorizationModule,
    OrganizationsModule,
    RestaurantsModule,
    BranchesModule,
    StaffModule,
    FloorsModule,
    TablesModule,
    MenusModule,
    CustomerSessionsModule,
    TableSessionsModule,
    OrdersModule,
    KitchenModule,
    PaymentsModule,
    NotificationsModule,
    AuditModule,
    AnalyticsModule,
    AiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
