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

import { Global, Module, Logger } from '@nestjs/common';
import { DRIZZLE, createDrizzleDatabase, DrizzleDatabase } from './client';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { resolve } from 'path';
import { existsSync } from 'fs';

import { OutboxService } from './outbox.service';

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
    {
      provide: OutboxService,
      inject: [DRIZZLE],
      useFactory: (db: DrizzleDatabase) => new OutboxService(db),
    },
    {
      provide: 'DATABASE_MIGRATION',
      inject: [DRIZZLE],
      useFactory: async (db: DrizzleDatabase) => {
        const logger = new Logger('DatabaseMigration');

        // Prevent worker or replica containers from competing on database migrations
        if (process.env.IS_WORKER === 'true' || process.env.SKIP_MIGRATIONS === 'true') {
          logger.log('Skipping migrations (IS_WORKER=true or SKIP_MIGRATIONS=true)');
          return true;
        }

        const candidates = [
          resolve(process.cwd(), 'drizzle'),
          resolve(__dirname, '../../drizzle'),
          resolve(__dirname, '../drizzle'),
        ];
        const migrationsFolder = candidates.find((dir) => existsSync(dir));
        if (!migrationsFolder) {
          logger.warn(
            `Database migrations folder not found. Looked in: ${candidates.join(', ')}. Continuing without auto-migration.`,
          );
          return false;
        }

        try {
          logger.log(`Running database migrations from ${migrationsFolder}...`);
          await migrate(db, { migrationsFolder });
          logger.log('Database migrations completed successfully');
          return true;
        } catch (err: any) {
          logger.error(`Database migration failed: ${err.message}`, err.stack);
          throw err;
        }
      },
    },
  ],
  exports: [DRIZZLE, OutboxService],
})
export class DatabaseModule {}
