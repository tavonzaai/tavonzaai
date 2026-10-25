/**
 * Tavonza AI — Background Worker Entrypoint
 * Boots NestJS ApplicationContext headlessly for background queue processing.
 */
import { config } from 'dotenv';
config();

// Declare worker runtime execution flag
process.env.IS_WORKER = 'true';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrapWorker() {
  console.log('====================================================');
  console.log('  🚀 Tavonza AI Background Worker Starting (NestJS Context)');
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Redis URL:   ${(process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL) ? '[CONFIGURED]' : 'redis://localhost:6379'}`);
  console.log('====================================================');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Enable graceful shutdown hooks so onModuleDestroy() cleans up workers and connections
  app.enableShutdownHooks();

  console.log('✅ Worker application context initialized and active.');

  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Closing worker application context...`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrapWorker().catch((err) => {
  console.error('💥 Fatal error during worker startup:', err);
  process.exit(1);
});
