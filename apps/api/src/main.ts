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
    // ── Tag Groups (prefix = "Actor | Domain") ────────────────────────────
    .addTag("Customer | Auth", "Account registration, login, OTP verification, and password reset for customers")
    // Future groups (uncomment as implemented):
    // .addTag("Waiter | Orders",   "Order acceptance, rejection, and service for waiters")
    // .addTag("Kitchen | Tickets", "Kitchen ticket management and preparation workflow")
    // .addTag("Cashier | Payments","Payment processing and session closure")
    // .addTag("Manager | Branch",  "Branch, menu, staff, and reporting management")
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
