import { Module } from '@nestjs/common';
import { DatabaseModule } from '@tavonza/database';
import { OrganizationController } from './presentation/http/organization.controller';
import { OrganizationService } from './application/services/organization.service';
import { DrizzleOrganizationRepository } from './infrastructure/persistence/drizzle-organization.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [OrganizationController],
  providers: [OrganizationService, DrizzleOrganizationRepository],
  exports: [OrganizationService, DrizzleOrganizationRepository],
})
export class OrganizationsModule {}
