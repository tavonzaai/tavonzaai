// ============================================================================
// RBAC Seeder Module (Permissions, Roles, and Single-Role Assignments)
// ============================================================================
import { DrizzleDatabase } from '../../client';
import * as schema from '../../schema';

export async function seedRbac(
  db: DrizzleDatabase,
  users: {
    superAdmin: typeof schema.users.$inferSelect;
    owner1: typeof schema.users.$inferSelect;
    owner2: typeof schema.users.$inferSelect;
    manager1: typeof schema.users.$inferSelect;
    manager2: typeof schema.users.$inferSelect;
    waiter1: typeof schema.users.$inferSelect;
    waiter2: typeof schema.users.$inferSelect;
    kitchen1: typeof schema.users.$inferSelect;
    kitchen2: typeof schema.users.$inferSelect;
    bartender1: typeof schema.users.$inferSelect;
    cashier1: typeof schema.users.$inferSelect;
    cashier2: typeof schema.users.$inferSelect;
    host1: typeof schema.users.$inferSelect;
    customer1: typeof schema.users.$inferSelect;
    customer2: typeof schema.users.$inferSelect;
  }
) {
  console.log('🛡️ Provisioning Dynamic RBAC permissions catalog and roles...');

  const catalogPermissions = [
    { moduleName: 'global', action: '*', permissionKey: '*', description: 'Global wildcard' },
    { moduleName: 'roles', action: 'read', permissionKey: 'roles:read', description: 'View roles' },
    { moduleName: 'roles', action: 'write', permissionKey: 'roles:write', description: 'Create roles' },
    { moduleName: 'roles', action: 'update', permissionKey: 'roles:update', description: 'Update roles' },
    { moduleName: 'roles', action: 'delete', permissionKey: 'roles:delete', description: 'Delete roles' },
    { moduleName: 'permissions', action: 'read', permissionKey: 'permissions:read', description: 'Query permissions' },
    { moduleName: 'users', action: 'assign_role', permissionKey: 'users:assign_role', description: 'Assign roles to users' },
    { moduleName: 'users', action: 'read', permissionKey: 'users:read', description: 'View users' },
    { moduleName: 'users', action: 'write', permissionKey: 'users:write', description: 'Create users' },
    { moduleName: 'users', action: 'update', permissionKey: 'users:update', description: 'Update users' },
    { moduleName: 'users', action: 'delete', permissionKey: 'users:delete', description: 'Delete users' },
    { moduleName: 'branches', action: 'read', permissionKey: 'branches:read', description: 'View branches' },
    { moduleName: 'branches', action: 'write', permissionKey: 'branches:write', description: 'Create branches' },
    { moduleName: 'branches', action: 'update', permissionKey: 'branches:update', description: 'Update branches' },
    { moduleName: 'branches', action: 'delete', permissionKey: 'branches:delete', description: 'Delete branches' },
    { moduleName: 'branch_settings', action: 'manage', permissionKey: 'branch_settings:manage', description: 'Manage branch settings' },
    { moduleName: 'staff', action: 'read', permissionKey: 'staff:read', description: 'View staff' },
    { moduleName: 'staff', action: 'write', permissionKey: 'staff:write', description: 'Add staff' },
    { moduleName: 'staff', action: 'update', permissionKey: 'staff:update', description: 'Update staff' },
    { moduleName: 'staff', action: 'delete', permissionKey: 'staff:delete', description: 'Delete staff' },
    { moduleName: 'staff', action: 'manage', permissionKey: 'staff:manage', description: 'Manage staff' },
    { moduleName: 'orders', action: 'read', permissionKey: 'orders:read', description: 'View orders' },
    { moduleName: 'orders', action: 'write', permissionKey: 'orders:write', description: 'Create orders' },
    { moduleName: 'orders', action: 'update', permissionKey: 'orders:update', description: 'Update orders' },
    { moduleName: 'orders', action: 'delete', permissionKey: 'orders:delete', description: 'Cancel orders' },
    { moduleName: 'orders', action: 'accept', permissionKey: 'orders:accept', description: 'Accept orders' },
    { moduleName: 'orders', action: 'reject', permissionKey: 'orders:reject', description: 'Reject orders' },
    { moduleName: 'orders', action: 'serve', permissionKey: 'orders:serve', description: 'Serve orders' },
    { moduleName: 'tables', action: 'read', permissionKey: 'tables:read', description: 'View tables' },
    { moduleName: 'tables', action: 'write', permissionKey: 'tables:write', description: 'Create tables' },
    { moduleName: 'tables', action: 'update', permissionKey: 'tables:update', description: 'Update tables' },
    { moduleName: 'tables', action: 'delete', permissionKey: 'tables:delete', description: 'Delete tables' },
    { moduleName: 'reservations', action: 'read', permissionKey: 'reservations:read', description: 'View reservations' },
    { moduleName: 'reservations', action: 'write', permissionKey: 'reservations:write', description: 'Book reservations' },
    { moduleName: 'reservations', action: 'update', permissionKey: 'reservations:update', description: 'Update reservations' },
    { moduleName: 'reservations', action: 'delete', permissionKey: 'reservations:delete', description: 'Cancel reservations' },
    { moduleName: 'reservations', action: 'manage', permissionKey: 'reservations:manage', description: 'Manage reservations' },
    { moduleName: 'menu', action: 'read', permissionKey: 'menu:read', description: 'View menu' },
    { moduleName: 'menu', action: 'write', permissionKey: 'menu:write', description: 'Create menu' },
    { moduleName: 'menu', action: 'update', permissionKey: 'menu:update', description: 'Update menu' },
    { moduleName: 'menu', action: 'delete', permissionKey: 'menu:delete', description: 'Delete menu' },
    { moduleName: 'menu', action: 'manage', permissionKey: 'menu:manage', description: 'Manage menu' },
    { moduleName: 'payments', action: 'read', permissionKey: 'payments:read', description: 'View payments' },
    { moduleName: 'payments', action: 'write', permissionKey: 'payments:write', description: 'Process payments' },
    { moduleName: 'payments', action: 'refund', permissionKey: 'payments:refund', description: 'Refund payments' },
    { moduleName: 'payments', action: 'manage', permissionKey: 'payments:manage', description: 'Manage payments' },
    { moduleName: 'discounts', action: 'read', permissionKey: 'discounts:read', description: 'View discounts' },
    { moduleName: 'discounts', action: 'apply', permissionKey: 'discounts:apply', description: 'Apply discounts' },
    { moduleName: 'discounts', action: 'manage', permissionKey: 'discounts:manage', description: 'Manage discounts' },
    { moduleName: 'inventory', action: 'read', permissionKey: 'inventory:read', description: 'View inventory' },
    { moduleName: 'inventory', action: 'write', permissionKey: 'inventory:write', description: 'Add inventory' },
    { moduleName: 'inventory', action: 'update', permissionKey: 'inventory:update', description: 'Adjust inventory' },
    { moduleName: 'inventory', action: 'delete', permissionKey: 'inventory:delete', description: 'Delete inventory' },
    { moduleName: 'suppliers', action: 'read', permissionKey: 'suppliers:read', description: 'View suppliers' },
    { moduleName: 'suppliers', action: 'write', permissionKey: 'suppliers:write', description: 'Register suppliers' },
    { moduleName: 'shifts', action: 'read', permissionKey: 'shifts:read', description: 'View shifts' },
    { moduleName: 'shifts', action: 'write', permissionKey: 'shifts:write', description: 'Schedule shifts' },
    { moduleName: 'shifts', action: 'update', permissionKey: 'shifts:update', description: 'Update shifts' },
    { moduleName: 'shifts', action: 'delete', permissionKey: 'shifts:delete', description: 'Delete shifts' },
    { moduleName: 'alerts', action: 'read', permissionKey: 'alerts:read', description: 'View alerts' },
    { moduleName: 'alerts', action: 'acknowledge', permissionKey: 'alerts:acknowledge', description: 'Acknowledge alerts' },
    { moduleName: 'alerts', action: 'resolve', permissionKey: 'alerts:resolve', description: 'Resolve alerts' },
    { moduleName: 'reports', action: 'read', permissionKey: 'reports:read', description: 'View reports' },
  ];

  const insertedPerms = await db.insert(schema.permissions).values(catalogPermissions).returning();
  const permMap = new Map<string, string>();
  for (const p of insertedPerms) {
    permMap.set(p.permissionKey, p.id);
  }

  // Provision Roles with explicit slugs
  const [superAdminRole] = await db.insert(schema.roles).values({
    name: 'Super Admin',
    slug: 'super-admin',
    description: 'Platform Super Administrator with wildcard access (*)',
    isSystem: true,
  }).returning();

  const [adminRole] = await db.insert(schema.roles).values({
    name: 'Organization Admin',
    slug: 'admin',
    description: 'Tenant organization owner with comprehensive restaurant management authority',
    isSystem: true,
  }).returning();

  const [managerRole] = await db.insert(schema.roles).values({
    name: 'Branch Manager',
    slug: 'branch-manager',
    description: 'Manager overseeing branch operations, staff, floor, and inventory',
    isSystem: true,
  }).returning();

  const [waiterRole] = await db.insert(schema.roles).values({
    name: 'Waiter',
    slug: 'waiter',
    description: 'Floor staff managing tables, dining sessions, and taking orders',
    isSystem: true,
  }).returning();

  const [kitchenRole] = await db.insert(schema.roles).values({
    name: 'Kitchen Staff',
    slug: 'kitchen-staff',
    description: 'Kitchen crew preparing items and updating prep tickets',
    isSystem: true,
  }).returning();

  const [bartenderRole] = await db.insert(schema.roles).values({
    name: 'Bartender',
    slug: 'bartender',
    description: 'Bar station mixologist preparing beverage tickets',
    isSystem: true,
  }).returning();

  const [cashierRole] = await db.insert(schema.roles).values({
    name: 'Cashier',
    slug: 'cashier',
    description: 'POS cashier handling bills, checkout, and payment allocations',
    isSystem: true,
  }).returning();

  const [hostRole] = await db.insert(schema.roles).values({
    name: 'Host',
    slug: 'host',
    description: 'Front-of-house host seating guests and managing reservations',
    isSystem: true,
  }).returning();

  const [customerRole] = await db.insert(schema.roles).values({
    name: 'Customer',
    slug: 'customer',
    description: 'Dine-in guest scanning QR code and ordering food',
    isSystem: true,
  }).returning();

  if (!superAdminRole || !adminRole || !managerRole || !waiterRole ||
      !kitchenRole || !bartenderRole || !cashierRole || !hostRole || !customerRole) {
    throw new Error('Failed to create RBAC roles');
  }

  // Role Permissions Mapping
  const rolePermInserts: Array<{ roleId: string; permissionId: string }> = [];

  // Super Admin -> *
  if (permMap.has('*')) {
    rolePermInserts.push({ roleId: superAdminRole.id, permissionId: permMap.get('*')! });
  }

  // Admin -> all perms
  for (const p of insertedPerms) {
    rolePermInserts.push({ roleId: adminRole.id, permissionId: p.id });
  }

  // Branch Manager
  const managerKeys = [
    'roles:read', 'users:read', 'branches:read', 'branch_settings:manage',
    'staff:read', 'staff:write', 'staff:update', 'staff:manage',
    'orders:read', 'orders:write', 'orders:update', 'orders:delete', 'orders:accept', 'orders:reject', 'orders:serve',
    'tables:read', 'tables:write', 'tables:update', 'tables:delete',
    'reservations:read', 'reservations:write', 'reservations:update', 'reservations:manage',
    'menu:read', 'menu:write', 'menu:update', 'menu:manage',
    'payments:read', 'payments:write', 'payments:refund', 'payments:manage',
    'discounts:read', 'discounts:apply', 'discounts:manage',
    'inventory:read', 'inventory:write', 'inventory:update', 'suppliers:read',
    'shifts:read', 'shifts:write', 'shifts:update',
    'alerts:read', 'alerts:acknowledge', 'alerts:resolve', 'reports:read',
  ];
  for (const k of managerKeys) {
    if (permMap.has(k)) rolePermInserts.push({ roleId: managerRole.id, permissionId: permMap.get(k)! });
  }

  // Waiter
  const waiterKeys = [
    'orders:read', 'orders:write', 'orders:update', 'orders:accept', 'orders:reject', 'orders:serve',
    'tables:read', 'tables:update', 'alerts:read', 'alerts:acknowledge', 'alerts:resolve',
  ];
  for (const k of waiterKeys) {
    if (permMap.has(k)) rolePermInserts.push({ roleId: waiterRole.id, permissionId: permMap.get(k)! });
  }

  // Kitchen Staff
  const kitchenKeys = ['orders:read', 'orders:update', 'menu:read', 'menu:update', 'tables:read', 'alerts:read'];
  for (const k of kitchenKeys) {
    if (permMap.has(k)) rolePermInserts.push({ roleId: kitchenRole.id, permissionId: permMap.get(k)! });
  }

  // Bartender
  const bartenderKeys = ['orders:read', 'orders:update', 'menu:read', 'menu:update', 'tables:read', 'alerts:read'];
  for (const k of bartenderKeys) {
    if (permMap.has(k)) rolePermInserts.push({ roleId: bartenderRole.id, permissionId: permMap.get(k)! });
  }

  // Cashier
  const cashierKeys = ['orders:read', 'payments:read', 'payments:write', 'payments:refund', 'discounts:read', 'discounts:apply', 'tables:read'];
  for (const k of cashierKeys) {
    if (permMap.has(k)) rolePermInserts.push({ roleId: cashierRole.id, permissionId: permMap.get(k)! });
  }

  // Host
  const hostKeys = ['tables:read', 'tables:update', 'reservations:read', 'reservations:write', 'reservations:update', 'reservations:manage'];
  for (const k of hostKeys) {
    if (permMap.has(k)) rolePermInserts.push({ roleId: hostRole.id, permissionId: permMap.get(k)! });
  }

  // Customer
  const customerKeys = ['menu:read', 'orders:read', 'orders:write', 'payments:read', 'payments:write'];
  for (const k of customerKeys) {
    if (permMap.has(k)) rolePermInserts.push({ roleId: customerRole.id, permissionId: permMap.get(k)! });
  }

  await db.insert(schema.rolePermissions).values(rolePermInserts);

  // Assign EXACTLY 1 OR MAX 2 USERS PER ROLE, All Assigned by Super Admin (assignedBy: superAdminUser.id)
  const userRoleAssignments = [
    // 1. Super Admin (1 user)
    { userId: users.superAdmin.id, roleId: superAdminRole.id, assignedBy: users.superAdmin.id },
    // 2. Organization Admin (2 users)
    { userId: users.owner1.id, roleId: adminRole.id, assignedBy: users.superAdmin.id },
    { userId: users.owner2.id, roleId: adminRole.id, assignedBy: users.superAdmin.id },
    // 3. Branch Manager (2 users)
    { userId: users.manager1.id, roleId: managerRole.id, assignedBy: users.superAdmin.id },
    { userId: users.manager2.id, roleId: managerRole.id, assignedBy: users.superAdmin.id },
    // 4. Waiter (2 users)
    { userId: users.waiter1.id, roleId: waiterRole.id, assignedBy: users.superAdmin.id },
    { userId: users.waiter2.id, roleId: waiterRole.id, assignedBy: users.superAdmin.id },
    // 5. Kitchen Staff (2 users)
    { userId: users.kitchen1.id, roleId: kitchenRole.id, assignedBy: users.superAdmin.id },
    { userId: users.kitchen2.id, roleId: kitchenRole.id, assignedBy: users.superAdmin.id },
    // 6. Bartender (1 user)
    { userId: users.bartender1.id, roleId: bartenderRole.id, assignedBy: users.superAdmin.id },
    // 7. Cashier (2 users)
    { userId: users.cashier1.id, roleId: cashierRole.id, assignedBy: users.superAdmin.id },
    { userId: users.cashier2.id, roleId: cashierRole.id, assignedBy: users.superAdmin.id },
    // 8. Host (1 user)
    { userId: users.host1.id, roleId: hostRole.id, assignedBy: users.superAdmin.id },
    // 9. Customer (2 users)
    { userId: users.customer1.id, roleId: customerRole.id, assignedBy: users.superAdmin.id },
    { userId: users.customer2.id, roleId: customerRole.id, assignedBy: users.superAdmin.id },
  ];
  await db.insert(schema.userRoles).values(userRoleAssignments);

  console.log(`✓ Seeded ${insertedPerms.length} permissions, 9 roles, and ${userRoleAssignments.length} user_roles with Super Admin assignedBy authority.`);

  return {
    superAdminRole,
    adminRole,
    managerRole,
    waiterRole,
    kitchenRole,
    bartenderRole,
    cashierRole,
    hostRole,
    customerRole,
  };
}
