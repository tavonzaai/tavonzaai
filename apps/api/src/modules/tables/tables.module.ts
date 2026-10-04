import { Module } from '@nestjs/common';
import { DatabaseModule } from '@tavonza/database';
import { TableController } from './presentation/http/table.controller';
import { TableService } from './application/services/table.service';
import { DrizzleTableRepository } from './infrastructure/persistence/drizzle-table.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [TableController],
  providers: [TableService, DrizzleTableRepository],
  exports: [TableService, DrizzleTableRepository],
})
export class TablesModule {}
