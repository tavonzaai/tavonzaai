import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Global Pipes ─────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strip unknown props
      forbidNonWhitelisted: true,
      transform: true,       // auto-cast types (e.g. string → number)
    }),
  );

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
    .addTag("Customer | Sessions", "Table QR scanning, guest joining, and order modes")
    .addTag("Customer | Menus", "Menu categories, items, and add-ons")
    .addTag("Customer | Orders", "Cart management, checkout, and order tracking")
    .addTag("Customer | Payments", "Payment methods, checkout, and receipts")
    .addTag("Customer | Feedback", "Customer ratings, tips, and reviews")
    .addTag("Customer | Alerts", "Send alerts to your waiter (call_waiter, request_bill, need_help, custom)")
    .addTag("Waiter | Tables", "View and manage table assignments for the waiter's shift")
    .addTag("Waiter | Orders", "Accept, reject, serve, and create orders at assigned tables")
    .addTag("Waiter | Alerts", "View, acknowledge, and resolve customer alerts")
    // Future groups (uncomment as implemented):
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
