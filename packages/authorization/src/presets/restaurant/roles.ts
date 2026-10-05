// ============================================================================
// @tavonza/authorization — Restaurant Domain Preset: Roles
// ============================================================================
// Canonical roles for restaurant platforms. The engine treats these as ordinary
// role bundles; none are hardcoded into core decision logic.
// ============================================================================

import { createRole, type Role } from '../../core/role';
import { RestaurantPermissions } from './permissions';

export const RestaurantRoles: Record<string, Role> = {
  SUPER_ADMIN: createRole({
    name: 'SUPER_ADMIN',
    description: 'Platform Super Administrator with absolute wildcard access',
    permissions: ['*'],
  }),

  ORGANIZATION_OWNER: createRole({
    name: 'ORGANIZATION_OWNER',
    description: 'Owner of the restaurant organization and all child branches',
    permissions: ['*'],
  }),

  BRANCH_MANAGER: createRole({
    name: 'BRANCH_MANAGER',
    description: 'Manager overseeing all operational facets of an assigned branch',
    permissions: [
      RestaurantPermissions.ORDER_ALL,
      'product:*',
      RestaurantPermissions.TABLE_ALL,
      'customer:*',
      RestaurantPermissions.PAYMENT_MANAGE,
      RestaurantPermissions.PAYMENT_READ,
      RestaurantPermissions.PAYMENT_CREATE,
      RestaurantPermissions.PAYMENT_REFUND,
      RestaurantPermissions.DISCOUNT_APPLY,
      RestaurantPermissions.REPORT_READ,
      RestaurantPermissions.REPORT_EXPORT,
      RestaurantPermissions.MENU_MANAGE,
      RestaurantPermissions.MENU_READ,
      RestaurantPermissions.MENU_UPDATE,
      RestaurantPermissions.STAFF_READ,
      RestaurantPermissions.STAFF_MANAGE,
      RestaurantPermissions.BRANCH_SETTINGS_MANAGE,
      'alert:*',
    ],
  }),

  MANAGER: createRole({
    name: 'MANAGER',
    description: 'Branch Manager overseeing all operational facets of an assigned branch',
    permissions: [
      RestaurantPermissions.ORDER_ALL,
      'product:*',
      RestaurantPermissions.TABLE_ALL,
      'customer:*',
      RestaurantPermissions.PAYMENT_MANAGE,
      RestaurantPermissions.PAYMENT_READ,
      RestaurantPermissions.PAYMENT_CREATE,
      RestaurantPermissions.PAYMENT_REFUND,
      RestaurantPermissions.DISCOUNT_APPLY,
      RestaurantPermissions.REPORT_READ,
      RestaurantPermissions.REPORT_EXPORT,
      RestaurantPermissions.MENU_MANAGE,
      RestaurantPermissions.MENU_READ,
      RestaurantPermissions.MENU_UPDATE,
      RestaurantPermissions.STAFF_READ,
      RestaurantPermissions.STAFF_MANAGE,
      RestaurantPermissions.BRANCH_SETTINGS_MANAGE,
      'alert:*',
    ],
  }),

  WAITER: createRole({
    name: 'WAITER',
    description: 'Floor staff servicing tables and submitting customer orders',
    permissions: [
      RestaurantPermissions.ORDER_READ,
      RestaurantPermissions.ORDER_CREATE,
      RestaurantPermissions.ORDER_UPDATE,
      RestaurantPermissions.ORDER_ACCEPT,
      RestaurantPermissions.ORDER_REJECT,
      RestaurantPermissions.ORDER_SERVE,
      RestaurantPermissions.TABLE_READ,
      RestaurantPermissions.TABLE_UPDATE,
      RestaurantPermissions.ALERT_READ,
      RestaurantPermissions.ALERT_ACKNOWLEDGE,
      RestaurantPermissions.ALERT_RESOLVE,
    ],
  }),

  CASHIER: createRole({
    name: 'CASHIER',
    description: 'Checkout staff managing payments, bills, and settled orders',
    permissions: [
      RestaurantPermissions.ORDER_READ,
      RestaurantPermissions.PAYMENT_READ,
      RestaurantPermissions.PAYMENT_CREATE,
      RestaurantPermissions.PAYMENT_REFUND,
      RestaurantPermissions.PAYMENT_MANAGE,
      RestaurantPermissions.DISCOUNT_APPLY,
    ],
  }),

  KITCHEN_STAFF: createRole({
    name: 'KITCHEN_STAFF',
    description: 'Back-of-house staff fulfilling kitchen order preparation queues',
    permissions: [
      RestaurantPermissions.ORDER_READ,
      RestaurantPermissions.ORDER_UPDATE,
      RestaurantPermissions.MENU_READ,
      RestaurantPermissions.MENU_UPDATE,
    ],
  }),

  BARTENDER: createRole({
    name: 'BARTENDER',
    description: 'Bar staff preparing drink tickets and managing beverage stock',
    permissions: [
      RestaurantPermissions.ORDER_READ,
      RestaurantPermissions.ORDER_UPDATE,
      RestaurantPermissions.MENU_READ,
      RestaurantPermissions.MENU_UPDATE,
    ],
  }),

  HOST: createRole({
    name: 'HOST',
    description: 'Front-of-house staff managing table seating and reservations',
    permissions: [
      RestaurantPermissions.TABLE_READ,
      RestaurantPermissions.TABLE_UPDATE,
      RestaurantPermissions.RESERVATION_MANAGE,
    ],
  }),

  CUSTOMER: createRole({
    name: 'CUSTOMER',
    description: 'Diner placing orders and reviewing their table bill',
    permissions: [
      RestaurantPermissions.MENU_READ,
      RestaurantPermissions.TABLE_READ,
      'order:read:own',
      'order:create:own',
      'payment:read:own',
    ],
  }),

  AI_ASSISTANT: createRole({
    name: 'AI_ASSISTANT',
    description: 'AI Agent assisting floor staff or customer ordering',
    permissions: [
      RestaurantPermissions.MENU_READ,
      RestaurantPermissions.TABLE_READ,
      RestaurantPermissions.ORDER_READ,
      RestaurantPermissions.PAYMENT_READ,
    ],
  }),

  // Sample custom role demonstrating extensibility
  NIGHT_SHIFT_MANAGER: createRole({
    name: 'NIGHT_SHIFT_MANAGER',
    description: 'Custom night shift role with order wildcard and closing reports',
    permissions: [
      RestaurantPermissions.ORDER_ALL,
      RestaurantPermissions.PRODUCT_READ,
      RestaurantPermissions.TABLE_ALL,
      RestaurantPermissions.REPORT_READ,
    ],
  }),
};
