// ============================================================================
// @tavonza/authorization — Audit: Record Model
// ============================================================================
// Standardized, audit-friendly event structure produced by authorization decisions.
// Compatible with compliance logs, security SIEM, and application databases.
// ============================================================================

import type { DecisionStatus } from '../core/decision';
import type { Scope } from '../core/scope';

export interface AuthorizationAuditEvent {
  readonly actorId: string;
  readonly actorType: string;
  readonly action: string;
  readonly resource: string;
  readonly resourceId?: string | null;
  readonly scope?: Scope;
  readonly organizationId?: string | null;
  readonly branchId?: string | null;
  readonly decision: DecisionStatus;
  readonly reason?: string;
  readonly matchedPermission?: string;
  readonly matchedRole?: string;
  readonly matchedPolicy?: string;
  readonly timestamp: string;
  readonly requestId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
