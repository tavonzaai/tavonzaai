// ============================================================================
// System Permissions Catalog & Default Roles Manifest
// ============================================================================

export interface DeclaredPermission {
  moduleName: string;
  action: string;
  permissionKey: string;
  description: string;
}

export const SYSTEM_PERMISSIONS_CATALOG: DeclaredPermission[] = [
  // ── Roles & Permissions ───────────────────────────────────────────────────
  { moduleName: 'roles', action: 'read', permissionKey: 'roles:read', description: 'View roles, assignments, and permissions matrix' },
  { moduleName: 'roles', action: 'write', permissionKey: 'roles:write', description: 'Create new roles' },
  { moduleName: 'roles', action: 'update', permissionKey: 'roles:update', description: 'Update role details and assigned permissions' },
  { moduleName: 'roles', action: 'delete', permissionKey: 'roles:delete', description: 'Delete custom roles' },
  { moduleName: 'permissions', action: 'read', permissionKey: 'permissions:read', description: 'Query available system permissions' },
  { moduleName: 'users', action: 'assign_role', permissionKey: 'users:assign_role', description: 'Assign or change user roles' },

  // ── Users & Identity ─────────────────────────────────────────────────────
  { moduleName: 'users', action: 'read', permissionKey: 'users:read', description: 'View user profiles, search, and list' },
  { moduleName: 'users', action: 'write', permissionKey: 'users:write', description: 'Register new user profiles' },
  { moduleName: 'users', action: 'update', permissionKey: 'users:update', description: 'Update user status and profiles' },
  { moduleName: 'users', action: 'delete', permissionKey: 'users:delete', description: 'Soft delete user accounts' },

  // ── Organizations, Restaurants, Branches ─────────────────────────────────
  { moduleName: 'organizations', action: 'read', permissionKey: 'organizations:read', description: 'View organizations' },
  { moduleName: 'organizations', action: 'write', permissionKey: 'organizations:write', description: 'Create new organizations' },
  { moduleName: 'organizations', action: 'update', permissionKey: 'organizations:update', description: 'Update organization settings' },
  { moduleName: 'organizations', action: 'delete', permissionKey: 'organizations:delete', description: 'Delete organizations' },
  { moduleName: 'restaurants', action: 'read', permissionKey: 'restaurants:read', description: 'View restaurants' },
  { moduleName: 'restaurants', action: 'write', permissionKey: 'restaurants:write', description: 'Create restaurants' },
  { moduleName: 'restaurants', action: 'update', permissionKey: 'restaurants:update', description: 'Update restaurants' },
  { moduleName: 'restaurants', action: 'delete', permissionKey: 'restaurants:delete', description: 'Delete restaurants' },
  { moduleName: 'branches', action: 'read', permissionKey: 'branches:read', description: 'View branch details and hours' },
  { moduleName: 'branches', action: 'write', permissionKey: 'branches:write', description: 'Create new branches' },
  { moduleName: 'branches', action: 'update', permissionKey: 'branches:update', description: 'Update branch profile' },
  { moduleName: 'branches', action: 'delete', permissionKey: 'branches:delete', description: 'Deactivate branches' },
  { moduleName: 'branch_settings', action: 'manage', permissionKey: 'branch_settings:manage', description: 'Manage operational branch settings and taxes' },

  // ── Staff Management ─────────────────────────────────────────────────────
  { moduleName: 'staff', action: 'read', permissionKey: 'staff:read', description: 'View staff members and assignments' },
  { moduleName: 'staff', action: 'write', permissionKey: 'staff:write', description: 'Onboard and assign staff members' },
  { moduleName: 'staff', action: 'update', permissionKey: 'staff:update', description: 'Update staff assignments and roles' },
  { moduleName: 'staff', action: 'delete', permissionKey: 'staff:delete', description: 'Deactivate staff assignments' },
  { moduleName: 'staff', action: 'manage', permissionKey: 'staff:manage', description: 'Full staff management' },

  // ── Orders ───────────────────────────────────────────────────────────────
  { moduleName: 'orders', action: 'read', permissionKey: 'orders:read', description: 'View order history, status, and tickets' },
  { moduleName: 'orders', action: 'write', permissionKey: 'orders:write', description: 'Create and submit customer orders' },
  { moduleName: 'orders', action: 'update', permissionKey: 'orders:update', description: 'Update order item status and modifiers' },
  { moduleName: 'orders', action: 'delete', permissionKey: 'orders:delete', description: 'Cancel or void orders' },
  { moduleName: 'orders', action: 'accept', permissionKey: 'orders:accept', description: 'Accept incoming orders' },
  { moduleName: 'orders', action: 'reject', permissionKey: 'orders:reject', description: 'Reject incoming orders' },
  { moduleName: 'orders', action: 'serve', permissionKey: 'orders:serve', description: 'Mark orders as served' },

  // ── Tables & Reservations ────────────────────────────────────────────────
  { moduleName: 'tables', action: 'read', permissionKey: 'tables:read', description: 'View tables, floor layout, and occupancy' },
  { moduleName: 'tables', action: 'write', permissionKey: 'tables:write', description: 'Create new table configurations' },
  { moduleName: 'tables', action: 'update', permissionKey: 'tables:update', description: 'Update table service status and position' },
  { moduleName: 'tables', action: 'delete', permissionKey: 'tables:delete', description: 'Remove tables from layout' },
  { moduleName: 'reservations', action: 'read', permissionKey: 'reservations:read', description: 'View customer reservations' },
  { moduleName: 'reservations', action: 'write', permissionKey: 'reservations:write', description: 'Book reservations' },
  { moduleName: 'reservations', action: 'update', permissionKey: 'reservations:update', description: 'Update or reschedule reservations' },
  { moduleName: 'reservations', action: 'delete', permissionKey: 'reservations:delete', description: 'Cancel reservations' },
  { moduleName: 'reservations', action: 'manage', permissionKey: 'reservations:manage', description: 'Seat guests and manage waitlist' },

  // ── Menu & Catalog ───────────────────────────────────────────────────────
  { moduleName: 'menu', action: 'read', permissionKey: 'menu:read', description: 'View menu categories, items, and modifiers' },
  { moduleName: 'menu', action: 'write', permissionKey: 'menu:write', description: 'Create menu items and categories' },
  { moduleName: 'menu', action: 'update', permissionKey: 'menu:update', description: 'Update menu pricing, stock availability, and items' },
  { moduleName: 'menu', action: 'delete', permissionKey: 'menu:delete', description: 'Disable or delete menu items' },
  { moduleName: 'menu', action: 'manage', permissionKey: 'menu:manage', description: 'Full menu catalog administration' },

  // ── Payments & Billing ───────────────────────────────────────────────────
  { moduleName: 'payments', action: 'read', permissionKey: 'payments:read', description: 'View bills, receipts, and transactions' },
  { moduleName: 'payments', action: 'write', permissionKey: 'payments:write', description: 'Process payments and settlements' },
  { moduleName: 'payments', action: 'refund', permissionKey: 'payments:refund', description: 'Execute payment refunds' },
  { moduleName: 'payments', action: 'manage', permissionKey: 'payments:manage', description: 'Full payment gateway and POS administration' },
  { moduleName: 'discounts', action: 'read', permissionKey: 'discounts:read', description: 'View active discount codes and promotions' },
  { moduleName: 'discounts', action: 'apply', permissionKey: 'discounts:apply', description: 'Apply manual discounts and vouchers to orders' },
  { moduleName: 'discounts', action: 'manage', permissionKey: 'discounts:manage', description: 'Create and configure discount rules' },

  // ── Inventory & Suppliers ────────────────────────────────────────────────
  { moduleName: 'inventory', action: 'read', permissionKey: 'inventory:read', description: 'View stock levels and inventory alerts' },
  { moduleName: 'inventory', action: 'write', permissionKey: 'inventory:write', description: 'Add inventory items' },
  { moduleName: 'inventory', action: 'update', permissionKey: 'inventory:update', description: 'Adjust stock quantities and thresholds' },
  { moduleName: 'inventory', action: 'delete', permissionKey: 'inventory:delete', description: 'Remove inventory items' },
  { moduleName: 'suppliers', action: 'read', permissionKey: 'suppliers:read', description: 'View suppliers list' },
  { moduleName: 'suppliers', action: 'write', permissionKey: 'suppliers:write', description: 'Register new suppliers' },

  // ── Work Shifts & Attendance ─────────────────────────────────────────────
  { moduleName: 'shifts', action: 'read', permissionKey: 'shifts:read', description: 'View staff schedules and shifts' },
  { moduleName: 'shifts', action: 'write', permissionKey: 'shifts:write', description: 'Schedule work shifts' },
  { moduleName: 'shifts', action: 'update', permissionKey: 'shifts:update', description: 'Modify shifts and attendance logs' },
  { moduleName: 'shifts', action: 'delete', permissionKey: 'shifts:delete', description: 'Delete scheduled shifts' },

  // ── Alerts & Realtime Notifications ──────────────────────────────────────
  { moduleName: 'alerts', action: 'read', permissionKey: 'alerts:read', description: 'View live staff alerts and waiter calls' },
  { moduleName: 'alerts', action: 'acknowledge', permissionKey: 'alerts:acknowledge', description: 'Acknowledge incoming service requests' },
  { moduleName: 'alerts', action: 'resolve', permissionKey: 'alerts:resolve', description: 'Resolve staff alerts' },

  // ── Reports & Analytics ──────────────────────────────────────────────────
  { moduleName: 'reports', action: 'read', permissionKey: 'reports:read', description: 'View sales, revenue, and KDS performance reports' },
];

export interface SystemRoleDefinition {
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  permissionKeys: string[];
}

export const SYSTEM_DEFAULT_ROLES: SystemRoleDefinition[] = [
  {
    name: 'Super Admin',
    slug: 'super-admin',
    description: 'Platform owner with unrestricted wildcard access (*)',
    isSystem: true,
    permissionKeys: ['*'],
  },
  {
    name: 'Organization Admin',
    slug: 'admin',
    description: 'Tenant owner with full restaurant management authority',
    isSystem: true,
    permissionKeys: SYSTEM_PERMISSIONS_CATALOG.map((p) => p.permissionKey),
  },
  {
    name: 'Branch Manager',
    slug: 'branch-manager',
    description: 'Manager overseeing branch operations, staff, floor, and inventory',
    isSystem: true,
    permissionKeys: [
      'roles:read',
      'users:read',
      'branches:read',
      'branch_settings:manage',
      'staff:read',
      'staff:write',
      'staff:update',
      'staff:manage',
      'orders:read',
      'orders:write',
      'orders:update',
      'orders:delete',
      'orders:accept',
      'orders:reject',
      'orders:serve',
      'tables:read',
      'tables:write',
      'tables:update',
      'tables:delete',
      'reservations:read',
      'reservations:write',
      'reservations:update',
      'reservations:manage',
      'menu:read',
      'menu:write',
      'menu:update',
      'menu:manage',
      'payments:read',
      'payments:write',
      'payments:refund',
      'payments:manage',
      'discounts:read',
      'discounts:apply',
      'discounts:manage',
      'inventory:read',
      'inventory:write',
      'inventory:update',
      'suppliers:read',
      'shifts:read',
      'shifts:write',
      'shifts:update',
      'alerts:read',
      'alerts:acknowledge',
      'alerts:resolve',
      'reports:read',
    ],
  },
  {
    name: 'Waiter',
    slug: 'waiter',
    description: 'Floor staff managing tables, dining sessions, and taking orders',
    isSystem: true,
    permissionKeys: [
      'orders:read',
      'orders:write',
      'orders:update',
      'orders:accept',
      'orders:reject',
      'orders:serve',
      'tables:read',
      'tables:update',
      'alerts:read',
      'alerts:acknowledge',
      'alerts:resolve',
    ],
  },
  {
    name: 'Kitchen Staff',
    slug: 'kitchen-staff',
    description: 'Kitchen crew preparing items and updating prep tickets',
    isSystem: true,
    permissionKeys: [
      'orders:read',
      'orders:update',
      'menu:read',
      'menu:update',
      'tables:read',
      'alerts:read',
    ],
  },
  {
    name: 'Bartender',
    slug: 'bartender',
    description: 'Bar station mixologist preparing beverage tickets',
    isSystem: true,
    permissionKeys: [
      'orders:read',
      'orders:update',
      'menu:read',
      'menu:update',
      'tables:read',
      'alerts:read',
    ],
  },
  {
    name: 'Cashier',
    slug: 'cashier',
    description: 'POS cashier handling bills, checkout, and payment allocations',
    isSystem: true,
    permissionKeys: [
      'orders:read',
      'payments:read',
      'payments:write',
      'payments:refund',
      'discounts:read',
      'discounts:apply',
      'tables:read',
    ],
  },
  {
    name: 'Host',
    slug: 'host',
    description: 'Front-of-house host seating guests and managing reservations',
    isSystem: true,
    permissionKeys: [
      'tables:read',
      'tables:update',
      'reservations:read',
      'reservations:write',
      'reservations:update',
      'reservations:manage',
    ],
  },
  {
    name: 'Customer',
    slug: 'customer',
    description: 'Dine-in guest scanning QR code and ordering food',
    isSystem: true,
    permissionKeys: [
      'menu:read',
      'orders:read',
      'orders:write',
      'payments:read',
      'payments:write',
    ],
  },
];
