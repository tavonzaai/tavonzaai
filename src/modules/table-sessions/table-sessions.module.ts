// ============================================================================
// TableSessionsModule
// ============================================================================

import { Module } from '@nestjs/common';
import { TableSessionService } from './application/services/table-session.service';
import { TableSessionController } from './presentation/table-session.controller';
import { IdentityModule } from '../identity/identity.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  imports: [IdentityModule, NotificationsModule, AuthorizationModule],
  controllers: [TableSessionController],
  providers: [TableSessionService],
  exports: [TableSessionService],
})
export class TableSessionsModule {}
