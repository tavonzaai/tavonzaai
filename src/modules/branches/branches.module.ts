import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { OrganizationsModule } from '../organizations/organizations.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { BranchController } from './controllers/branch.controller';
import { BranchService } from './services/branch.service';
import { DrizzleBranchRepository } from './repositories/drizzle-branch.repository';

@Module({
  imports: [DatabaseModule, OrganizationsModule, RestaurantsModule],
  controllers: [BranchController],
  providers: [BranchService, DrizzleBranchRepository],
  exports: [BranchService, DrizzleBranchRepository],
})
export class BranchesModule {}
