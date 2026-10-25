import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { TableController } from './controllers/table.controller';
import { TableService } from './services/table.service';
import { DrizzleTableRepository } from './repositories/drizzle-table.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [TableController],
  providers: [TableService, DrizzleTableRepository],
  exports: [TableService, DrizzleTableRepository],
})
export class TablesModule {}
