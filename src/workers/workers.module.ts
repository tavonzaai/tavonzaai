import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { OutboxProcessor } from './outbox.worker';
import { IdleSessionJob } from './idle-session.job';
import { WorkersService } from './workers.service';

@Module({
  imports: [DatabaseModule],
  providers: [OutboxProcessor, IdleSessionJob, WorkersService],
  exports: [WorkersService, OutboxProcessor, IdleSessionJob],
})
export class WorkersModule {}
