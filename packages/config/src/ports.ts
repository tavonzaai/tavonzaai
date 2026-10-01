/**
 * Centralized Port Mappings across the Tavonza AI Monorepo
 */
export const DEFAULT_PORTS = {
  // Backend Services
  API: 3000,
  API_CONTAINER: 5000,
  REALTIME: 3001,
  WORKER: 3002,
  AI: 8000,

  // Frontend Applications
  CUSTOMER: 3100,
  WAITER: 3101,
  ADMIN: 3102,
  ADMIN_ALT: 3043,
  BRANCH_MANAGER: 3103,
  CASHIER: 3104,
  KITCHEN: 3105,
} as const;

export type AppServicePort = typeof DEFAULT_PORTS[keyof typeof DEFAULT_PORTS];
