// ============================================================================
// Security Context — Explicit actor security context from .agent/AUTHORIZATION.md
// ============================================================================

import type { ActorType } from './actor';
import type { Permission } from './permission';
import type { Scope } from './scope';

export interface SecurityContext {
  actorType: ActorType;
  actorId: string;
  role: string;
  permissions: Permission[];
  scopes: Scope[];
  organizationId?: string | null;
  restaurantId?: string | null;
  branchId?: string | null;
}
