import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { getCorsConfig, setupSwagger } from "@/config";
import { AppLogger } from "@/infrastructure/observability";
import { AppModule } from "./app.module";
import { HttpLoggerInterceptor } from "./common/interceptors/http-logger.interceptor";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { createValidationException } from "./common/errors/validation-exception.factory";

async function bootstrap() {
  process.env.IS_WORKER = 'false';
  const logger = new AppLogger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    // Disable NestJS's default logger — we use our own structured one
    logger: false,
    rawBody: true,
  });

  // Enable graceful shutdown hooks (SIGTERM/SIGINT)
  app.enableShutdownHooks();

  // ── Trust Proxy ────────────────────────────────────────────────────────────
  // Ensures Express accurately parses X-Forwarded-For behind ALBs, Cloudflare, and Nginx
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter && typeof (httpAdapter.getInstance() as any)?.set === 'function') {
    (httpAdapter.getInstance() as any).set('trust proxy', true);
  }

  // ── Global Exception Filter ────────────────────────────────────────────────
  // Must be registered before interceptors so it catches everything
  app.useGlobalFilters(new AllExceptionsFilter());

  // ── Global HTTP Logger ─────────────────────────────────────────────────────
  // Logs every request: method, path, status, duration, IP
  app.useGlobalInterceptors(new HttpLoggerInterceptor());

  // ── CORS Configuration ─────────────────────────────────────────────────────
  app.enableCors(getCorsConfig());

  // ── Global Pipes ───────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: createValidationException,
    }),
  );

  // ── Swagger / OpenAPI ──────────────────────────────────────────────────────
  const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
  const enableSwaggerInProd = process.env.ENABLE_SWAGGER_IN_PROD === 'true';

  if (!isProd || enableSwaggerInProd) {
    setupSwagger(app);
  } else {
    logger.info('Swagger documentation disabled in production mode (enable with ENABLE_SWAGGER_IN_PROD=true)');
  }

  const port = process.env.API_PORT || process.env.PORT || 3000;
  const env  = process.env.NODE_ENV || 'development';

  await app.listen(port, '0.0.0.0', () => {
    logger.info(`API server started`, {
      port,
      env,
      swagger: `http://localhost:${port}/docs`,
      pid: process.pid,
    });
  });

  logger.info(`API server started`, {
    port,
    env,
    swagger: `http://localhost:${port}/docs`,
    pid: process.pid,
  });
}

// Global safety net for unhandled asynchronous errors
process.on('unhandledRejection', (reason: any) => {
  const logger = new AppLogger('Process');
  logger.error('Unhandled Promise Rejection', {
    error: reason?.message || String(reason),
    stack: reason?.stack,
  });
});

process.on('uncaughtException', (err: Error) => {
  const logger = new AppLogger('Process');
  logger.error('Uncaught Exception — initiating graceful exit', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

bootstrap().catch((err) => {
  const logger = new AppLogger('Bootstrap');
  logger.error('Fatal error during startup', { error: err?.message, stack: err?.stack });
  process.exit(1);
});

