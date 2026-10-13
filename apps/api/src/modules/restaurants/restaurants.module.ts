import { Module } from '@nestjs/common';
import { DatabaseModule } from '@tavonza/database';
import { OrganizationsModule } from '../organizations/organizations.module';
import { RestaurantController } from './presentation/http/restaurant.controller';
import { RestaurantService } from './application/services/restaurant.service';
import { DrizzleRestaurantRepository } from './infrastructure/persistence/drizzle-restaurant.repository';

@Module({
  imports: [DatabaseModule, OrganizationsModule],
  controllers: [RestaurantController],
  providers: [RestaurantService, DrizzleRestaurantRepository],
  exports: [RestaurantService, DrizzleRestaurantRepository],
})
export class RestaurantsModule {}
