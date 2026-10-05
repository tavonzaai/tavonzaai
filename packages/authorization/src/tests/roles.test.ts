// ============================================================================
// @tavonza/authorization — Unit Tests: Roles & Inheritance
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRole } from '../core/role';
import { RoleResolver } from '../engine/role-resolver';
import { PermissionResolver } from '../engine/permission-resolver';
import { createActor } from '../core/actor';
import { InMemoryRoleRepository } from '../adapters/persistence/in-memory-repositories';

describe('Roles & Role Inheritance', () => {
  it('creates role and normalizes permissions', () => {
    const role = createRole({
      name: 'OPERATOR',
      description: 'Operations staff',
      permissions: ['orders.read', 'tables:update', 'orders.read'],
    });

    assert.equal(role.name, 'OPERATOR');
    assert.deepEqual([...role.permissions].sort(), ['orders:read', 'tables:update'].sort());
  });

  it('resolves permissions from single role', async () => {
    const roleResolver = new RoleResolver({
      roles: [
        createRole({
          name: 'CASHIER',
          permissions: ['payments:read', 'payments:create'],
        }),
      ],
    });

    const result = await roleResolver.resolvePermissionsForRoles(['CASHIER']);
    assert.deepEqual(result.permissions.sort(), ['payments:create', 'payments:read'].sort());
    assert.equal(result.permissionToRoleMap.get('payments:read'), 'CASHIER');
  });

  it('resolves and unions permissions from multiple roles', async () => {
    const roleResolver = new RoleResolver({
      roles: [
        createRole({ name: 'READER', permissions: ['doc:read'] }),
        createRole({ name: 'WRITER', permissions: ['doc:write'] }),
      ],
    });

    const result = await roleResolver.resolvePermissionsForRoles(['READER', 'WRITER']);
    assert.deepEqual(result.permissions.sort(), ['doc:read', 'doc:write'].sort());
  });

  it('resolves nested inherited roles', async () => {
    const roleResolver = new RoleResolver({
      roles: [
        createRole({ name: 'VIEWER', permissions: ['item:view'] }),
        createRole({ name: 'EDITOR', inherits: ['VIEWER'], permissions: ['item:edit'] }),
        createRole({ name: 'ADMIN', inherits: ['EDITOR'], permissions: ['item:delete'] }),
      ],
    });

    const result = await roleResolver.resolvePermissionsForRoles(['ADMIN']);
    assert.deepEqual(result.permissions.sort(), ['item:delete', 'item:edit', 'item:view'].sort());
    assert.equal(result.permissionToRoleMap.get('item:view'), 'VIEWER');
    assert.equal(result.permissionToRoleMap.get('item:edit'), 'EDITOR');
    assert.equal(result.permissionToRoleMap.get('item:delete'), 'ADMIN');
  });

  it('protects against cyclic role inheritance loops without infinite recursion', async () => {
    const roleResolver = new RoleResolver({
      roles: [
        createRole({ name: 'ROLE_A', inherits: ['ROLE_B'], permissions: ['perm:a'] }),
        createRole({ name: 'ROLE_B', inherits: ['ROLE_A'], permissions: ['perm:b'] }),
      ],
    });

    const result = await roleResolver.resolvePermissionsForRoles(['ROLE_A']);
    assert.deepEqual(result.permissions.sort(), ['perm:a', 'perm:b'].sort());
  });

  it('integrates RoleResolver with PermissionResolver and Actor', async () => {
    const roleResolver = new RoleResolver({
      roles: [
        createRole({ name: 'WAITER', permissions: ['order:read', 'order:create'] }),
      ],
    });
    const permResolver = new PermissionResolver(roleResolver);

    const actor = createActor({
      id: 'actor-10',
      roles: ['WAITER'],
      permissions: ['custom:action'],
    });

    const resolved = await permResolver.resolveActorPermissions(actor);
    assert.deepEqual(resolved.permissions.sort(), ['custom:action', 'order:create', 'order:read'].sort());
    assert.equal(resolved.permissionToRoleMap.get('order:read'), 'WAITER');
    assert.equal(resolved.permissionToRoleMap.get('custom:action'), 'DIRECT');
  });

  it('supports pluggable RoleRepository provider', async () => {
    const repo = new InMemoryRoleRepository([
      createRole({ name: 'DYNAMIC_ROLE', permissions: ['dynamic:perm'] }),
    ]);

    const roleResolver = new RoleResolver({ provider: repo });
    const result = await roleResolver.resolvePermissionsForRoles(['DYNAMIC_ROLE']);
    assert.deepEqual(result.permissions, ['dynamic:perm']);
  });
});
