import { Module } from '@nestjs/common';
import { DatabaseModule } from '@tavonza/database';
import { RestaurantController } from './presentation/http/restaurant.controller';
import { RestaurantService } from './application/services/restaurant.service';
import { DrizzleRestaurantRepository } from './infrastructure/persistence/drizzle-restaurant.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [RestaurantController],
  providers: [RestaurantService, DrizzleRestaurantRepository],
  exports: [RestaurantService, DrizzleRestaurantRepository],
})
export class RestaurantsModule {}
