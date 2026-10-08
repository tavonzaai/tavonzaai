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

  // ── Operations & Hierarchy ──────────────────────────────────────────────
  {
    name: 'Organizations',
    description: 'Multi-tenant organization management, owner relationships, and enterprise grouping',
  },
  {
    name: 'Restaurants',
    description: 'Restaurant brand portfolios under organizations',
  },
  {
    name: 'Branches',
    description: 'Physical restaurant branch locations, operational settings, operating hours, holidays, and staff assignment',
  },
  {
    name: 'Tables & Areas',
    description: 'Physical table layouts, QR code token resolution, seating capacity, and table reservations',
  },
  {
    name: 'Users',
    description: 'User directory, profile management, and global administrative users',
  },
  {
    name: 'Notifications',
    description: 'Persistent and real-time user notification feed, unread counters, and mark-as-read workflows',
  },
  {
    name: 'Kitchen & Bar Display System (KDS)',
    description: 'Kitchen ticket management, dish preparation workflow, line item status transitions, and 86 availability toggling',
  },
  {
    name: 'Payments & Billing',
    description: 'Payment collection, split-bill allocations, discount voucher evaluation, refunds, and table balance receipts',
  },
  {
    name: 'Operations | Work Shifts & Attendance',
    description: 'Staff shift scheduling, clock-in, clock-out attendance tracking, and shift management',
  },
  {
    name: 'Operations | Inventory & Suppliers',
    description: 'Branch ingredient suppliers, inventory categories, stock tracking, and inventory adjustments',
  },
  {
    name: 'Internal | AI Agent Tool Gateway',
    description: 'Strict internal AI execution endpoints: actor resolution, context bootstrap, tool execution, and audit trail',
  },
  {
    name: 'Menu Compatibility',
    description: 'Backward-compatible endpoints for legacy menu fetching',
  },
  {
    name: 'Health',
    description: 'Service uptime and diagnostics health endpoints',
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
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Enter your JWT access token' },
      bearerName
    )
    .addApiKey(
      { type: 'apiKey', name: 'x-internal-service-token', in: 'header', description: 'Secret token for internal AI Gateway communication' },
      'InternalServiceToken'
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
