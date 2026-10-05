// ============================================================================
// @tavonza/authorization — Core Decision Model
// ============================================================================
// Structured decision output containing authoritative outcomes, security rationale,
// matched capabilities, and audit details.
// ============================================================================

import type { Scope } from './scope';

export type DecisionStatus = 'ALLOW' | 'DENY' | 'REQUIRES_APPROVAL';

/**
 * Standard decision reason codes.
 */
export const DecisionCode = {
  ALLOWED: 'ALLOWED',
  DENIED_NO_PERMISSION: 'DENIED_NO_PERMISSION',
  DENIED_SCOPE_MISMATCH: 'DENIED_SCOPE_MISMATCH',
  DENIED_NOT_OWNER: 'DENIED_NOT_OWNER',
  DENIED_POLICY: 'DENIED_POLICY',
  DENIED_UNKNOWN_ACTOR: 'DENIED_UNKNOWN_ACTOR',
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  ERROR_FAIL_CLOSED: 'ERROR_FAIL_CLOSED',
} as const;

export type DecisionCode = (typeof DecisionCode)[keyof typeof DecisionCode] | (string & {});

/**
 * An authoritative authorization decision.
 */
export interface AuthorizationDecision {
  /** True if the action is fully permitted without pending approvals */
  readonly allowed: boolean;

  /** Granular status: ALLOW, DENY, or REQUIRES_APPROVAL */
  readonly status: DecisionStatus;

  /** Human-readable explanation of the outcome */
  readonly reason?: string;

  /** Machine-readable classification code */
  readonly code?: DecisionCode;

  /** Granted permission that satisfied the capability check */
  readonly matchedPermission?: string;

  /** Role that supplied the matched permission (if resolved via role) */
  readonly matchedRole?: string;

  /** Policy rule that governed the decision (if governed by a policy) */
  readonly matchedPolicy?: string;

  /** Scope evaluated during this decision */
  readonly scope?: Scope;

  /** Millisecond timestamp when the decision was calculated */
  readonly timestamp: number;

  /** Additional non-sensitive context metadata */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Decision builder helpers.
 */
export function allow(params?: {
  reason?: string;
  matchedPermission?: string;
  matchedRole?: string;
  matchedPolicy?: string;
  scope?: Scope;
  metadata?: Record<string, unknown>;
}): AuthorizationDecision {
  return {
    allowed: true,
    status: 'ALLOW',
    code: DecisionCode.ALLOWED,
    reason: params?.reason ?? 'Action permitted',
    matchedPermission: params?.matchedPermission,
    matchedRole: params?.matchedRole,
    matchedPolicy: params?.matchedPolicy,
    scope: params?.scope,
    timestamp: Date.now(),
    metadata: params?.metadata ? Object.freeze({ ...params?.metadata }) : undefined,
  };
}

export function deny(params: {
  reason: string;
  code?: DecisionCode;
  matchedPermission?: string;
  matchedRole?: string;
  matchedPolicy?: string;
  scope?: Scope;
  metadata?: Record<string, unknown>;
}): AuthorizationDecision {
  return {
    allowed: false,
    status: 'DENY',
    code: params.code ?? DecisionCode.DENIED_NO_PERMISSION,
    reason: params.reason,
    matchedPermission: params.matchedPermission,
    matchedRole: params.matchedRole,
    matchedPolicy: params.matchedPolicy,
    scope: params.scope,
    timestamp: Date.now(),
    metadata: params.metadata ? Object.freeze({ ...params.metadata }) : undefined,
  };
}

export function requiresApproval(params: {
  reason: string;
  matchedPermission?: string;
  matchedPolicy?: string;
  scope?: Scope;
  approvalRequestId?: string;
  metadata?: Record<string, unknown>;
}): AuthorizationDecision {
  return {
    allowed: false,
    status: 'REQUIRES_APPROVAL',
    code: DecisionCode.APPROVAL_REQUIRED,
    reason: params.reason,
    matchedPermission: params.matchedPermission,
    matchedPolicy: params.matchedPolicy,
    scope: params.scope,
    timestamp: Date.now(),
    metadata: Object.freeze({
      ...(params.metadata ?? {}),
      ...(params.approvalRequestId ? { approvalRequestId: params.approvalRequestId } : {}),
    }),
  };
}
