// ============================================================================
// MenusModule — NestJS Module Wiring
// ============================================================================
// Connects all layers via dependency injection:
//   Controller → Service → Repository (interface → Drizzle implementation)
//
// KEY WIRING:
//   provide: MENU_REPOSITORY         ← domain interface token
//   useClass: DrizzleMenuRepository  ← infrastructure implementation
//
// To swap ORMs: just change useClass here. Nothing else changes.
// ============================================================================

import { Module } from '@nestjs/common';
import { MenuService } from './services/menu.service';
import { MenuController } from './controllers/menu.controller';
import { MenuCompatibilityController } from './controllers/menu-compatibility.controller';
import { DrizzleMenuRepository } from './repositories/drizzle-menu.repository';
import { MENU_REPOSITORY } from './repositories/menu-repository.interface';
import { OrganizationsModule } from '../organizations/organizations.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
  imports: [OrganizationsModule, RestaurantsModule],
  controllers: [MenuController, MenuCompatibilityController],
  providers: [
    MenuService,
    {
      provide: MENU_REPOSITORY,
      useClass: DrizzleMenuRepository,
    },
  ],
  exports: [MenuService],
})
export class MenusModule {}
