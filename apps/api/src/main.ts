import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { getCorsConfig, setupSwagger } from "@tavonza/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS Configuration ───────────────────────────────────────────────────
  // Supports all local frontends, live production (*.tavonza.com), and prod test
  app.enableCors(getCorsConfig());

  // ── Global Pipes ─────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strip unknown props
      forbidNonWhitelisted: true,
      transform: true,       // auto-cast types (e.g. string → number)
    }),
  );

  // ── Swagger / OpenAPI Documentation ───────────────────────────────────────
  // Standardized tags and interactive UI centrally maintained in @tavonza/config
  setupSwagger(app);

  const port = process.env.API_PORT || process.env.PORT || 3000;

  await app.listen(port);
  console.log(`API server listening on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/docs`);
}

bootstrap();
