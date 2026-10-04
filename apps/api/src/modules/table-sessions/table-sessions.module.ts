// ============================================================================
// TableSessionsModule
// ============================================================================

import { Module } from '@nestjs/common';
import { TableSessionService } from './application/services/table-session.service';
import { TableSessionController } from './presentation/table-session.controller';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [IdentityModule],
  controllers: [TableSessionController],
  providers: [TableSessionService],
  exports: [TableSessionService],
})
export class TableSessionsModule {}
