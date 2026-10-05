// ============================================================================
// @tavonza/authorization — Persistence: Repository Interfaces
// ============================================================================
// Database-agnostic contracts for retrieving roles, permissions, policies,
// and audit logs. Applications supply ORM implementations (Drizzle, Prisma, etc.).
// ============================================================================

import type { Role } from '../../core/role';
import type { Policy } from '../../core/policy';
import type { AuthorizationAuditEvent } from '../../audit/audit-record';

export interface RoleRepository {
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  save(role: Role): Promise<void>;
  deleteByName?(name: string): Promise<void>;
}

export interface PolicyRepository {
  findAll(): Promise<Policy[]>;
  save(policy: Policy): Promise<void>;
}

export interface AuditRepository {
  save(event: AuthorizationAuditEvent): Promise<void>;
  findByActorId?(actorId: string, limit?: number): Promise<AuthorizationAuditEvent[]>;
}
