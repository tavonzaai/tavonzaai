import { Module } from '@nestjs/common';
import { DatabaseModule } from '@tavonza/database';
import { BranchController } from './presentation/http/branch.controller';
import { BranchService } from './application/services/branch.service';
import { DrizzleBranchRepository } from './infrastructure/persistence/drizzle-branch.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [BranchController],
  providers: [BranchService, DrizzleBranchRepository],
  exports: [BranchService, DrizzleBranchRepository],
})
export class BranchesModule {}
