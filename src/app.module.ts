import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { DatabaseModule } from "@/database";
import { AuthCacheModule } from "./modules/identity/auth-cache.module";
import { IdentityModule } from "./modules/identity/identity.module";
import { RateLimitGuard } from "./common/guards/rate-limit.guard";
import { AuthorizationModule } from "./modules/authorization/authorization.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { RestaurantsModule } from "./modules/restaurants/restaurants.module";
import { BranchesModule } from "./modules/branches/branches.module";
import { WaiterModule } from "./modules/waiter/waiter.module";
import { TablesModule } from "./modules/tables/tables.module";
import { MenusModule } from "./modules/menus/menus.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { TableSessionsModule } from "./modules/table-sessions/table-sessions.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { KitchenModule } from "./modules/kitchen/kitchen.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { ShiftsModule } from "./modules/shifts/shifts.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { AiModule } from "./modules/ai/ai.module";
import { ApiStorageModule } from "./modules/storage/storage.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";

import { AppController } from "./app.controller";

@Module({
  imports: [
    // Core Infrastructure — provides Drizzle DB globally
    DatabaseModule,
    AuthCacheModule,
    ApiStorageModule,
    RealtimeModule,

    // Business Modules (Pure HTTP & WebSockets)
    IdentityModule,
    AuthorizationModule,
    OrganizationsModule,
    RestaurantsModule,
    BranchesModule,
    WaiterModule,
    TablesModule,
    MenusModule,
    FeedbackModule,
    TableSessionsModule,
    OrdersModule,
    KitchenModule,
    PaymentsModule,
    ShiftsModule,
    InventoryModule,
    NotificationsModule,
    AnalyticsModule,
    SubscriptionsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
