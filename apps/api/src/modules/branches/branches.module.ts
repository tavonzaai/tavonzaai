import { Module } from '@nestjs/common';
import { DatabaseModule } from '@tavonza/database';
import { OrganizationsModule } from '../organizations/organizations.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { BranchController } from './presentation/http/branch.controller';
import { BranchService } from './application/services/branch.service';
import { DrizzleBranchRepository } from './infrastructure/persistence/drizzle-branch.repository';

@Module({
  imports: [DatabaseModule, OrganizationsModule, RestaurantsModule],
  controllers: [BranchController],
  providers: [BranchService, DrizzleBranchRepository],
  exports: [BranchService, DrizzleBranchRepository],
})
export class BranchesModule {}
