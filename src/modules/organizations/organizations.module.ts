import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { OrganizationController } from './controllers/organization.controller';
import { OrganizationService } from './services/organization.service';
import { DrizzleOrganizationRepository } from './repositories/drizzle-organization.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [OrganizationController],
  providers: [OrganizationService, DrizzleOrganizationRepository],
  exports: [OrganizationService, DrizzleOrganizationRepository],
})
export class OrganizationsModule {}
