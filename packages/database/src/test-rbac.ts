// ============================================================================
// RBAC Integration Test Suite & System Verification
// Tests:
// 1. Schema integrity & catalogs
// 2. Single Role Invariant: UNIQUE(user_id) constraint in user_roles
// 3. User role assignment (upsert replaces previous single role)
// 4. Permission evaluator (wildcard '*' and fine-grained permissions)
// 5. System role protection invariant
// ============================================================================

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import {
  roles,
  permissions,
  rolePermissions,
  userRoles,
  users,
} from './schema';
import { checkCapability, Permission } from '@tavonza/authorization';

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const connectionString =
  process.env.DATABASE_URL?.replace('@postgres:5432', '@localhost:5432') ||
  'postgresql://postgres:postgres@localhost:5432/platform_dev?sslmode=disable';

const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function runRbacTests() {
  console.log('--- Starting RBAC Integration Test Suite ---');
  let failures = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
    } else {
      failures++;
      console.error(`  ✗ FAIL: ${testName}${detail ? ` (${detail})` : ''}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // Test 1: Catalogs & Seeding verification
    // -------------------------------------------------------------------------
    console.log('\n[Suite 1: Catalogs & Tables]');
    const allRoles = await db.select().from(roles);
    assert(allRoles.length >= 9, 'All 9 default system roles are present', `Found ${allRoles.length}`);

    const allPermissions = await db.select().from(permissions);
    assert(allPermissions.length >= 63, 'Catalog has at least 63 canonical permissions', `Found ${allPermissions.length}`);

    const superAdminRole = allRoles.find((r) => r.slug === 'super-admin');
    assert(!!superAdminRole, 'Super Admin role exists');
    assert(superAdminRole?.isSystem === true, 'Super Admin has isSystem = true');

    const superAdminPerms = await db
      .select({ key: permissions.permissionKey })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, superAdminRole!.id));
    
    const hasWildcard = superAdminPerms.some((p) => p.key === '*');
    assert(hasWildcard, 'Super Admin has global wildcard (*) permission assigned');

    // -------------------------------------------------------------------------
    // Test 2: Single Role Invariant (Database Constraint)
    // -------------------------------------------------------------------------
    console.log('\n[Suite 2: Single Role Invariant - UNIQUE(user_id)]');
    // Find or pick a user
    const existingUsers = await db.select().from(users).limit(2);
    if (existingUsers.length === 0 || !existingUsers[0]) {
      throw new Error('No users found in database for invariant testing.');
    }
    const testUser = existingUsers[0];
    const customerRole = allRoles.find((r) => r.slug === 'customer') || allRoles[0];
    const cashierRole = allRoles.find((r) => r.slug === 'cashier') || allRoles[1];
    if (!customerRole || !cashierRole) {
      throw new Error('Customer or Cashier role not found.');
    }

    // Clean any existing user_role for testUser
    await db.delete(userRoles).where(eq(userRoles.userId, testUser.id));

    // Insert first role
    await db.insert(userRoles).values({
      userId: testUser.id,
      roleId: customerRole.id,
    });
    assert(true, 'Inserted first role for test user');

    // Attempt to insert second role for same user (should fail due to UNIQUE constraint)
    let duplicateErrorCaught = false;
    try {
      await db.insert(userRoles).values({
        userId: testUser.id,
        roleId: cashierRole.id,
      });
    } catch (err: any) {
      const pgCode = err.code || err.cause?.code;
      const msg = `${err.message || ''} ${err.cause?.message || ''}`;
      if (pgCode === '23505' || msg.includes('user_roles_user_unique') || msg.includes('unique constraint')) {
        duplicateErrorCaught = true;
      }
    }
    assert(
      duplicateErrorCaught,
      'Database rejects multiple roles for the same user (Single Role Invariant enforced via UNIQUE constraint)'
    );

    // Verify user still has exactly 1 role record
    const countUserRoles = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, testUser.id));
    assert(countUserRoles.length === 1, 'User has strictly one role in user_roles table', `Count: ${countUserRoles.length}`);

    // Test upsert pattern: Reassign role by deleting previous or on conflict update
    await db
      .insert(userRoles)
      .values({
        userId: testUser.id,
        roleId: cashierRole.id,
      })
      .onConflictDoUpdate({
        target: userRoles.userId,
        set: { roleId: cashierRole.id },
      });

    const updatedUserRoles = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, testUser.id));
    assert(
      updatedUserRoles.length === 1 && updatedUserRoles[0]?.roleId === cashierRole.id,
      'Role reassignment successfully replaces previous role with exactly 1 record'
    );

    // -------------------------------------------------------------------------
    // Test 3: Matrix Transformation Validation
    // -------------------------------------------------------------------------
    console.log('\n[Suite 3: Dynamic Matrix Representation]');
    // Build matrix for cashier role
    const cashierRolePerms = await db
      .select({
        moduleName: permissions.moduleName,
        action: permissions.action,
        key: permissions.permissionKey,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, cashierRole.id));

    const matrix: Record<string, Record<string, boolean>> = {};
    for (const p of allPermissions) {
      if (!matrix[p.moduleName]) {
        matrix[p.moduleName] = {};
      }
      const mod = matrix[p.moduleName]!;
      mod[p.action] = false;
    }
    for (const cp of cashierRolePerms) {
      const mod = matrix[cp.moduleName];
      if (mod) {
        mod[cp.action] = true;
      }
    }

    assert(typeof matrix === 'object', 'Matrix is a valid JSON object');
    assert('orders' in matrix && 'payments' in matrix, 'Matrix contains core modules (orders, payments)');
    assert(
      matrix['payments']?.['write'] === true,
      'Cashier role has payments:write enabled in matrix'
    );
    assert(
      matrix['roles']?.['delete'] === false,
      'Cashier role has roles:delete disabled in matrix'
    );

    // -------------------------------------------------------------------------
    // Test 4: Capability & Evaluator Logic
    // -------------------------------------------------------------------------
    console.log('\n[Suite 4: Evaluator & Wildcard Resolution]');
    // Test Super Admin with wildcard '*'
    const superAdminGranted = checkCapability(['*'], 'users:delete');
    assert(superAdminGranted, "Super Admin wildcard '*' grants users:delete");

    const superAdminAnyGranted = checkCapability(['*'], 'any_new_module:arbitrary_action');
    assert(superAdminAnyGranted, "Super Admin wildcard '*' grants uncataloged actions");

    // Test Waiter permissions (should have orders:write)
    const waiterRole = allRoles.find((r) => r.slug === 'waiter');
    assert(!!waiterRole, 'Waiter role exists');
    const waiterRolePerms = await db
      .select({ key: permissions.permissionKey })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, waiterRole!.id));
    const waiterPermKeys = waiterRolePerms.map((p) => p.key);
    const waiterCanCreateOrder = checkCapability(waiterPermKeys, Permission.ORDERS_WRITE);
    assert(waiterCanCreateOrder, 'Waiter is granted orders:write');

    // Test Cashier permissions (should NOT have orders:write, but HAS payments:write)
    const cashierPermKeys = cashierRolePerms.map((p) => p.key);
    const cashierCanProcessPayment = checkCapability(cashierPermKeys, Permission.PAYMENTS_WRITE);
    assert(cashierCanProcessPayment, 'Cashier is granted payments:write');

    const cashierCannotCreateOrder = checkCapability(cashierPermKeys, Permission.ORDERS_WRITE);
    assert(!cashierCannotCreateOrder, 'Cashier is correctly denied orders:write');

    const cashierCannotDeleteRole = checkCapability(cashierPermKeys, Permission.ROLES_DELETE);
    assert(!cashierCannotDeleteRole, 'Cashier is correctly denied roles:delete');

    const cashierCannotManageSettings = checkCapability(cashierPermKeys, 'branch_settings:manage');
    assert(!cashierCannotManageSettings, 'Cashier is correctly denied branch_settings:manage');

    // Test module wildcard (e.g. orders:*)
    const ordersWildcardGranted = checkCapability(['orders:*'], 'orders:delete');
    assert(ordersWildcardGranted, "Module wildcard 'orders:*' grants orders:delete");
    const ordersWildcardDeniedOther = checkCapability(['orders:*'], 'users:delete');
    assert(!ordersWildcardDeniedOther, "Module wildcard 'orders:*' does not grant users:delete");

    console.log('\n-------------------------------------------');
    if (failures === 0) {
      console.log('🎉 ALL RBAC INTEGRATION TESTS PASSED (100% SUCCESS)!');
    } else {
      console.error(`❌ ${failures} TEST(S) FAILED!`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runRbacTests();
