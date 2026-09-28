import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Swagger / OpenAPI ────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle("Tavonza AI API")
    .setDescription("Interactive API documentation for the Tavonza AI platform")
    .setVersion("0.1.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "access-token",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: "Tavonza AI – API Docs",
  });
  // ────────────────────────────────────────────────────────────────────────

  const port = process.env.API_PORT || process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API server listening on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/docs`);
}

bootstrap();
