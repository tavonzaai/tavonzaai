// ============================================================================
// @tavonza/authorization — Persistence: In-Memory Implementations
// ============================================================================
// Lightweight default repositories for tests, microservices, and in-memory caches.
// ============================================================================

import type { Role } from '../../core/role';
import type { Policy } from '../../core/policy';
import type { RoleProvider } from '../../engine/role-resolver';
import type { PolicyProvider } from '../../engine/policy-evaluator';
import type { RoleRepository, PolicyRepository } from './repository-interfaces';

export class InMemoryRoleRepository implements RoleRepository, RoleProvider {
  private readonly store = new Map<string, Role>();

  constructor(initialRoles: Role[] = []) {
    for (const r of initialRoles) {
      this.store.set(r.name.toUpperCase(), r);
    }
  }

  async findByName(name: string): Promise<Role | null> {
    return this.store.get(name.toUpperCase()) ?? null;
  }

  async getRole(name: string): Promise<Role | undefined> {
    return this.store.get(name.toUpperCase());
  }

  async findAll(): Promise<Role[]> {
    return Array.from(this.store.values());
  }

  async save(role: Role): Promise<void> {
    this.store.set(role.name.toUpperCase(), role);
  }

  async deleteByName(name: string): Promise<void> {
    this.store.delete(name.toUpperCase());
  }
}

export class InMemoryPolicyRepository implements PolicyRepository, PolicyProvider {
  private readonly store = new Map<string, Policy>();

  constructor(initialPolicies: Policy[] = []) {
    for (const p of initialPolicies) {
      this.store.set(p.id, p);
    }
  }

  async findAll(): Promise<Policy[]> {
    return Array.from(this.store.values());
  }

  async getPolicies(): Promise<Policy[]> {
    return Array.from(this.store.values());
  }

  async save(policy: Policy): Promise<void> {
    this.store.set(policy.id, policy);
  }
}
