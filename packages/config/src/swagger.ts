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
  // ── Identity & Access Control ─────────────────────────────────────────────
  {
    name: 'Identity | Authentication',
    description: 'Account registration, credential login, token refresh, OTP verification, and password resets',
  },
  {
    name: 'Identity | User Management',
    description: 'User profiles, multi-branch staff assignments, user directory search, and account status management',
  },
  {
    name: 'Authorization | Roles & Permissions',
    description: 'Dynamic RBAC management: roles catalog, permission matrix, single-role user assignments, and capability grants',
  },

  // ── Core Domain Hierarchy ─────────────────────────────────────────────────
  {
    name: 'Core | Organization Management',
    description: 'Multi-tenant enterprise organization portfolios, organization owner administration, and hierarchy',
  },
  {
    name: 'Core | Restaurant Management',
    description: 'Restaurant brand definitions, cuisine concepts, and restaurant-level configuration',
  },
  {
    name: 'Core | Branch Management',
    description: 'Physical restaurant branch locations, operational settings, operating hours, holidays, and staff assignment',
  },

  // ── Operations & Staff Workflows ──────────────────────────────────────────
  {
    name: 'Operations | Tables & Areas',
    description: 'Physical dining tables, floor layouts, QR code token resolution, seating capacity, and table reservations',
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
    name: 'Operations | Notifications',
    description: 'Persistent and real-time user notification feed, unread counters, and mark-as-read workflows',
  },

  // ── Customer Experience ───────────────────────────────────────────────────
  {
    name: 'Customer | Sessions',
    description: 'Table QR scanning, dining party guest sessions, ordering modes, and dine-in initialization',
  },
  {
    name: 'Customer | Menus',
    description: 'Customer menu browsing: category chips, items grid, dietary tags, allergens, and add-on customizations',
  },
  {
    name: 'Customer | Orders',
    description: 'Cart management, order placement, order item specifications, and live order tracking',
  },
  {
    name: 'Customer | Feedback',
    description: 'Customer dining reviews, food quality ratings, and staff gratuity/tipping',
  },
  {
    name: 'Customer | Alerts',
    description: 'Send alerts to your waiter (call_waiter, request_bill, need_help, custom)',
  },

  // ── Floor Staff Operations (Waiter) ───────────────────────────────────────
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
    description: 'View, acknowledge, and resolve customer waiter assistance and bill requests',
  },

  // ── Kitchen & Display Systems ─────────────────────────────────────────────
  {
    name: 'Kitchen & Bar Display System (KDS)',
    description: 'Kitchen ticket management, dish preparation workflow, line item status transitions, and 86 availability toggling',
  },

  // ── Payments & Settlements ────────────────────────────────────────────────
  {
    name: 'Payments & Billing',
    description: 'Payment collection, split-bill allocations, Stripe integration, refunds, manual tender, and receipts',
  },

  // ── System, Storage & AI Utilities ────────────────────────────────────────
  {
    name: 'System | Mailer',
    description: 'Diagnostic, testing, and queue tools for AWS SES and email verification',
  },
  {
    name: 'System | Storage',
    description: 'S3 object storage, direct file uploads, multipart streaming, presigned URLs, and asset management',
  },
  {
    name: 'Internal | AI Agent Tool Gateway',
    description: 'Strict internal AI execution endpoints: actor resolution, context bootstrap, tool execution, and audit trail',
  },
  {
    name: 'Menu Compatibility',
    description: 'Backward-compatible endpoints for legacy mobile clients and third-party menu aggregators',
  },
  {
    name: 'Health',
    description: 'Service uptime, database connectivity, and system diagnostics',
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
 * Automatically prunes empty/orphan tags so every accordion folder in Swagger UI is fully expandable.
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

  // Collect all tags that are actually attached to at least one operation in the endpoints
  const usedTags = new Set<string>();
  if (document.paths) {
    for (const pathItem of Object.values(document.paths)) {
      if (pathItem && typeof pathItem === 'object') {
        for (const method of ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const) {
          const op = (pathItem as Record<string, any>)[method];
          if (op && Array.isArray(op.tags)) {
            for (const t of op.tags) {
              usedTags.add(t);
            }
          }
        }
      }
    }
  }

  // Prune orphan tags that have 0 operations to prevent collapsed/unexpandable folders
  if (document.tags) {
    document.tags = document.tags.filter((t) => usedTags.has(t.name));
  }

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

