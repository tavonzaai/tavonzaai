// ============================================================================
// @tavonza/authorization — Unit Tests: Scope Resolution & Containment
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createScope, ScopeType } from '../core/scope';
import { ScopeResolver } from '../engine/scope-resolver';
import { createActor } from '../core/actor';
import { createResource } from '../core/resource';

describe('Scope Resolution', () => {
  const scopeResolver = new ScopeResolver();

  it('global scope unconditionally satisfies any target scope', () => {
    const actor = createActor({
      id: 'super-user',
      scopes: [createScope({ type: ScopeType.GLOBAL })],
    });

    const result = scopeResolver.evaluateScope({
      actor,
      targetScope: createScope({ type: ScopeType.BRANCH, id: 'branch-999' }),
      targetOrganizationId: 'org-external',
    });

    assert.equal(result.allowed, true);
  });

  it('allows access within the same organization', () => {
    const actor = createActor({
      id: 'org-member',
      organizationId: 'org-100',
      scopes: [createScope({ type: ScopeType.ORGANIZATION, id: 'org-100' })],
    });

    const result = scopeResolver.evaluateScope({
      actor,
      targetOrganizationId: 'org-100',
    });

    assert.equal(result.allowed, true);
  });

  it('denies cross-tenant organization access', () => {
    const actor = createActor({
      id: 'org-member',
      organizationId: 'org-100',
      scopes: [createScope({ type: ScopeType.ORGANIZATION, id: 'org-100' })],
    });

    const result = scopeResolver.evaluateScope({
      actor,
      targetOrganizationId: 'org-200',
    });

    assert.equal(result.allowed, false);
    assert.match(result.reason ?? '', /Cross-tenant access denied/);
  });

  it('organization scope hierarchy covers branches within that organization', () => {
    const actor = createActor({
      id: 'org-admin',
      organizationId: 'org-100',
      scopes: [createScope({ type: ScopeType.ORGANIZATION, id: 'org-100' })],
    });

    const result = scopeResolver.evaluateScope({
      actor,
      targetScope: createScope({ type: ScopeType.BRANCH, id: 'branch-42' }),
      targetOrganizationId: 'org-100',
    });

    assert.equal(result.allowed, true);
  });

  it('isolates branch staff from accessing different branch', () => {
    const actor = createActor({
      id: 'waiter-1',
      organizationId: 'org-100',
      branchId: 'branch-1',
      scopes: [createScope({ type: ScopeType.BRANCH, id: 'branch-1' })],
    });

    const result = scopeResolver.evaluateScope({
      actor,
      targetBranchId: 'branch-2',
    });

    assert.equal(result.allowed, false);
    assert.match(result.reason ?? '', /Branch isolation/);
  });

  it('enforces resource allowlist restriction when specified on scope', () => {
    const actor = createActor({
      id: 'restricted-waiter',
      scopes: [
        createScope({
          type: ScopeType.RESOURCE,
          resourceIds: ['table-1', 'table-2'],
        }),
      ],
    });

    const allowedResource = createResource({
      type: 'table',
      id: 'table-1',
    });

    const deniedResource = createResource({
      type: 'table',
      id: 'table-5',
    });

    const allowedResult = scopeResolver.evaluateScope({
      actor,
      targetScope: createScope({ type: ScopeType.RESOURCE }),
      resource: allowedResource,
    });
    assert.equal(allowedResult.allowed, true);

    const deniedResult = scopeResolver.evaluateScope({
      actor,
      targetScope: createScope({ type: ScopeType.RESOURCE }),
      resource: deniedResource,
    });
    assert.equal(deniedResult.allowed, false);
  });
});
