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
import { MenuService } from './application/services/menu.service';
import { MenuController } from './presentation/controllers/menu.controller';
import { DrizzleMenuRepository } from './infrastructure/persistence/drizzle-menu.repository';
import { MENU_REPOSITORY } from './domain/interfaces/menu-repository.interface';

@Module({
  controllers: [MenuController],
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
