import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { OrganizationsModule } from '../organizations/organizations.module';
import { RestaurantController } from './controllers/restaurant.controller';
import { RestaurantService } from './services/restaurant.service';
import { DrizzleRestaurantRepository } from './repositories/drizzle-restaurant.repository';

@Module({
  imports: [DatabaseModule, OrganizationsModule],
  controllers: [RestaurantController],
  providers: [RestaurantService, DrizzleRestaurantRepository],
  exports: [RestaurantService, DrizzleRestaurantRepository],
})
export class RestaurantsModule {}
