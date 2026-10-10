import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';

export interface SwaggerTagDefinition {
  name: string;
  description: string;
}

/**
 * Standardized Swagger Tag Groups across all domain boundaries
 * Follows the "Actor | Domain" convention
 */
export const SWAGGER_TAGS: SwaggerTagDefinition[] = [
  // ── Customer Experience ──────────────────────────────────────────────────
  {
    name: 'Customer | Auth',
    description: 'Account registration, login, OTP verification, and password reset for customers',
  },
  {
    name: 'Customer | Sessions',
    description: 'Table QR scanning, guest joining, and order modes',
  },
  {
    name: 'Customer | Menus',
    description: 'Menu categories, items, and add-ons',
  },
  {
    name: 'Customer | Orders',
    description: 'Cart management, checkout, and order tracking',
  },
  {
    name: 'Customer | Payments',
    description: 'Payment methods, checkout, and receipts',
  },
  {
    name: 'Customer | Feedback',
    description: 'Customer ratings, tips, and reviews',
  },
  {
    name: 'Customer | Alerts',
    description: 'Send alerts to your waiter (call_waiter, request_bill, need_help, custom)',
  },

  // ── Waiter / Staff Operations ───────────────────────────────────────────
  {
    name: 'Waiter | Tables',
    description: "View and manage table assignments for the waiter's shift",
  },
  {
    name: 'Waiter | Orders',
    description: 'Accept, reject, serve, and create orders at assigned tables',
  },
  {
    name: 'Waiter | Alerts',
    description: 'View, acknowledge, and resolve customer alerts',
  },

  // ── System & Diagnostic Utilities ────────────────────────────────────────
  {
    name: 'System | Mailer',
    description: 'Diagnostic, testing, and queue tools for AWS SES and email verification',
  },
  {
    name: 'System | Storage',
    description: 'S3 object storage, direct file uploads, multipart streaming, presigned URLs, and asset management',
  },

  // ── Kitchen Operations (Planned/Upcoming) ────────────────────────────────
  {
    name: 'Kitchen | Tickets',
    description: 'Kitchen ticket management, dish preparation workflow, and station routing',
  },

  // ── Cashier & POS ────────────────────────────────────────────────────────
  {
    name: 'Cashier | Payments',
    description: 'Manual and card payments, bill splitting, refunds, and session closure',
  },

  // ── Branch & Organization Management ─────────────────────────────────────
  {
    name: 'Manager | Branch',
    description: 'Branch settings, operating hours, floor plan tables, and performance reports',
  },

  // ── Authorization & Access Control ───────────────────────────────────────
  {
    name: 'Authorization & Roles',
    description: 'Dynamic roles, permissions catalog, user capability assignments, and authorization evaluation',
  },
];

export interface SwaggerConfigOptions {
  title?: string;
  description?: string;
  version?: string;
  docsPath?: string;
  customSiteTitle?: string;
  extraTags?: SwaggerTagDefinition[];
  bearerAuthName?: string;
  persistAuthorization?: boolean;
}

/**
 * Builds the OpenAPI / Swagger DocumentBuilder configuration
 */
export function buildSwaggerConfig(options?: SwaggerConfigOptions) {
  const title = options?.title ?? 'Tavonza AI API';
  const description =
    options?.description ?? 'Interactive API documentation for the Tavonza AI platform';
  const version = options?.version ?? '0.1.0';
  const bearerName = options?.bearerAuthName ?? 'access-token';

  const builder = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      bearerName
    );

  const tags = [...SWAGGER_TAGS, ...(options?.extraTags ?? [])];
  for (const tag of tags) {
    builder.addTag(tag.name, tag.description);
  }

  return builder.build();
}

/**
 * Mounts Swagger UI on the NestJS application with standard Tavonza AI theme and settings.
 *
 * @param app NestJS application instance
 * @param options Customization options (title, path, tags)
 * @returns Generated OpenAPIObject document
 */
export function setupSwagger(
  app: INestApplication,
  options?: SwaggerConfigOptions
): OpenAPIObject {
  const docsPath = options?.docsPath ?? 'docs';
  const customSiteTitle = options?.customSiteTitle ?? 'Tavonza AI – API Docs';
  const persistAuth = options?.persistAuthorization ?? true;

  const config = buildSwaggerConfig(options);
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(docsPath, app, document, {
    swaggerOptions: {
      persistAuthorization: persistAuth,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
    },
    customSiteTitle,
  });

  return document;
}
