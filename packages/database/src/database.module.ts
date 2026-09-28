// ============================================================================
// DatabaseModule — Provides Drizzle DB to the entire application
// ============================================================================
// Registers the Drizzle database instance as a global NestJS provider.
//
// PATTERN:
//   1. Any module that needs DB access injects: @Inject(DRIZZLE)
//   2. The provider factory reads DATABASE_URL from env
//   3. @Global() makes it available everywhere without explicit imports
// ============================================================================

import { Global, Module } from '@nestjs/common';
import { DRIZZLE, createDrizzleDatabase } from './client';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: () => {
        const url = process.env.DATABASE_URL;
        if (!url) {
          throw new Error('DATABASE_URL environment variable is required');
        }
        return createDrizzleDatabase(url);
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
