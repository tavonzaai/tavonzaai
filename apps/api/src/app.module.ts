import { Module } from "@nestjs/common";
import { DatabaseModule } from "@tavonza/database";
import { IdentityModule } from "./modules/identity/identity.module";
import { AuthorizationModule } from "./modules/authorization/authorization.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { RestaurantsModule } from "./modules/restaurants/restaurants.module";
import { BranchesModule } from "./modules/branches/branches.module";
import { WaiterModule } from "./modules/waiter/waiter.module";
import { TablesModule } from "./modules/tables/tables.module";
import { MenusModule } from "./modules/menus/menus.module";
import { CustomerSessionsModule } from "./modules/customer-sessions/customer-sessions.module";
import { TableSessionsModule } from "./modules/table-sessions/table-sessions.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { KitchenModule } from "./modules/kitchen/kitchen.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";

import { AppController } from "./app.controller";

@Module({
  imports: [
    // Infrastructure — must be first (provides Drizzle DB globally)
    DatabaseModule,

    IdentityModule,
    AuthorizationModule,
    OrganizationsModule,
    RestaurantsModule,
    BranchesModule,
    WaiterModule,
    TablesModule,
    MenusModule,
    CustomerSessionsModule,
    TableSessionsModule,
    OrdersModule,
    KitchenModule,
    PaymentsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
