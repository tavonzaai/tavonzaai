import { DEFAULT_PORTS } from './ports.js';

/**
 * All local development frontend origins
 */
export const LOCAL_CORS_ORIGINS: string[] = [
  // Customer Web App
  `http://localhost:${DEFAULT_PORTS.CUSTOMER}`,
  `http://127.0.0.1:${DEFAULT_PORTS.CUSTOMER}`,

  // Waiter Tablet / Mobile Web
  `http://localhost:${DEFAULT_PORTS.WAITER}`,
  `http://127.0.0.1:${DEFAULT_PORTS.WAITER}`,

  // Admin Dashboard
  `http://localhost:${DEFAULT_PORTS.ADMIN}`,
  `http://127.0.0.1:${DEFAULT_PORTS.ADMIN}`,
  `http://localhost:${DEFAULT_PORTS.ADMIN_ALT}`,
  `http://127.0.0.1:${DEFAULT_PORTS.ADMIN_ALT}`,

  // Branch Manager Dashboard
  `http://localhost:${DEFAULT_PORTS.BRANCH_MANAGER}`,
  `http://127.0.0.1:${DEFAULT_PORTS.BRANCH_MANAGER}`,

  // Cashier POS
  `http://localhost:${DEFAULT_PORTS.CASHIER}`,
  `http://127.0.0.1:${DEFAULT_PORTS.CASHIER}`,

  // Kitchen Display System (KDS)
  `http://localhost:${DEFAULT_PORTS.KITCHEN}`,
  `http://127.0.0.1:${DEFAULT_PORTS.KITCHEN}`,

  // Next.js Default / API & Realtime WebSockets
  `http://localhost:${DEFAULT_PORTS.API}`,
  `http://127.0.0.1:${DEFAULT_PORTS.API}`,
  `http://localhost:${DEFAULT_PORTS.REALTIME}`,
  `http://127.0.0.1:${DEFAULT_PORTS.REALTIME}`,
  `http://localhost:${DEFAULT_PORTS.WORKER}`,
  `http://127.0.0.1:${DEFAULT_PORTS.WORKER}`,
  `http://localhost:${DEFAULT_PORTS.AI}`,
  `http://127.0.0.1:${DEFAULT_PORTS.AI}`,
];

/**
 * Live (Main Production) environment frontend origins
 */
export const LIVE_CORS_ORIGINS: string[] = [
  'https://tavonza.com',
  'https://www.tavonza.com',
  'https://admin.tavonza.com',
  'https://kitchen.tavonza.com',
  'https://cashier.tavonza.com',
  'https://waiter.tavonza.com',
  'https://manager.tavonza.com',
  'https://branch.tavonza.com',
  'https://api.tavonza.com',
  'https://ai.tavonza.com',
  'https://realtime.tavonza.com',
];

/**
 * Prod (Testing / Staging version) environment frontend origins
 */
export const PROD_TESTING_CORS_ORIGINS: string[] = [
  'https://prod.tavonza.com',
  'https://www.prod.tavonza.com',
  'https://prod-admin.tavonza.com',
  'https://prod-kitchen.tavonza.com',
  'https://prod-cashier.tavonza.com',
  'https://prod-waiter.tavonza.com',
  'https://prod-manager.tavonza.com',
  'https://prod-branch.tavonza.com',
  'https://prod-api.tavonza.com',
  'https://prod-ai.tavonza.com',
  'https://prod-realtime.tavonza.com',
];

/**
 * Regular expression to match any subdomain under tavonza.com securely via HTTPS
 */
export const TAVONZA_DOMAIN_REGEX = /^https:\/\/([a-zA-Z0-9-]+\.)*tavonza\.com$/;

/**
 * Regular expression to match local development ports dynamically
 */
export const LOCALHOST_REGEX = /^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]{2,5})?$/;

/**
 * Reads any additional comma-separated origins from environment variable
 */
export function getEnvCustomOrigins(): string[] {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS;
  if (!envOrigins) return [];
  return envOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

/**
 * Retrieves the comprehensive list of allowed origins across all environments
 */
export function getAllAllowedOrigins(): string[] {
  const custom = getEnvCustomOrigins();
  return Array.from(
    new Set([
      ...LOCAL_CORS_ORIGINS,
      ...LIVE_CORS_ORIGINS,
      ...PROD_TESTING_CORS_ORIGINS,
      ...custom,
    ])
  );
}

/**
 * Validates whether an incoming request Origin header is permitted.
 * - Allows requests with no Origin (mobile apps, server-to-server, curl, Postman)
 * - Allows all configured local, live, and prod origins
 * - Matches secure *.tavonza.com subdomains
 * - Matches localhost on any standard dev port in development
 */
export function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true; // Server-to-server, curl, mobile native apps

  const allowedList = getAllAllowedOrigins();
  if (allowedList.includes(origin)) return true;

  // Wildcard match for *.tavonza.com
  if (TAVONZA_DOMAIN_REGEX.test(origin)) return true;

  // In non-production, allow any localhost/127.0.0.1 port
  if (process.env.NODE_ENV !== 'production' && LOCALHOST_REGEX.test(origin)) {
    return true;
  }

  return false;
}

export interface CorsConfigOptions {
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  methods?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Builds the complete CORS configuration object for NestJS `app.enableCors(...)`
 */
export function getCorsConfig(customOptions?: CorsConfigOptions) {
  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Request from origin: ${origin}`);
        callback(new Error(`CORS Error: Origin '${origin}' is not authorized.`), false);
      }
    },
    credentials: customOptions?.credentials ?? true,
    methods: customOptions?.methods ?? [
      'GET',
      'HEAD',
      'PUT',
      'PATCH',
      'POST',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: customOptions?.allowedHeaders ?? [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'X-Branch-Id',
      'X-Table-Id',
      'X-Session-Id',
      'X-Forwarded-Proto',
      'X-Forwarded-Host',
      'Origin',
    ],
    exposedHeaders: customOptions?.exposedHeaders ?? [
      'Content-Range',
      'X-Total-Count',
      'X-Response-Time',
      'X-Session-Token',
    ],
    maxAge: customOptions?.maxAge ?? 86400, // 24 hours preflight cache
  };
}
