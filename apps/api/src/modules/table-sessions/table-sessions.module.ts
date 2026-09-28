// ============================================================================
// TableSessionsModule
// ============================================================================

import { Module } from '@nestjs/common';
import { TableSessionService } from './application/services/table-session.service';
import { TableSessionController } from './presentation/table-session.controller';

@Module({
  controllers: [TableSessionController],
  providers: [TableSessionService],
  exports: [TableSessionService],
})
export class TableSessionsModule {}
