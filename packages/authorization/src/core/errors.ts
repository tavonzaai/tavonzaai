// ============================================================================
// @tavonza/authorization — Core Error Hierarchy
// ============================================================================
// Strongly-typed error hierarchy for authorization rejections and approval triggers.
// Sanitized for safe exposure in public API contexts.
// ============================================================================

import type { AuthorizationDecision } from './decision';

/**
 * Base authorization error class.
 */
export class AuthorizationError extends Error {
  public readonly decision?: AuthorizationDecision;
  public readonly code: string;

  constructor(message: string, code = 'AUTHORIZATION_ERROR', decision?: AuthorizationDecision) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.decision = decision;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when an actor fails authentication or cannot be identified.
 */
export class UnauthorizedError extends AuthorizationError {
  constructor(message = 'Unauthorized actor', decision?: AuthorizationDecision) {
    super(message, 'UNAUTHORIZED', decision);
  }
}

/**
 * Thrown when an actor is authenticated but forbidden from performing the action.
 */
export class ForbiddenError extends AuthorizationError {
  constructor(message = 'Access forbidden', code = 'FORBIDDEN', decision?: AuthorizationDecision) {
    super(message, code, decision);
  }
}

/**
 * Thrown when an actor lacks the required permission capability.
 */
export class PermissionDeniedError extends ForbiddenError {
  public readonly requiredPermission?: string;

  constructor(message: string, requiredPermission?: string, decision?: AuthorizationDecision) {
    super(message, 'PERMISSION_DENIED', decision);
    this.requiredPermission = requiredPermission;
  }
}

/**
 * Thrown when an actor has permission but fails scope constraints (e.g. wrong branch/org).
 */
export class ScopeDeniedError extends ForbiddenError {
  constructor(message: string, decision?: AuthorizationDecision) {
    super(message, 'SCOPE_DENIED', decision);
  }
}

/**
 * Thrown when an actor is denied due to not owning the target resource.
 */
export class OwnershipDeniedError extends ForbiddenError {
  constructor(message = 'Resource ownership verification failed', decision?: AuthorizationDecision) {
    super(message, 'OWNERSHIP_DENIED', decision);
  }
}

/**
 * Thrown when dynamic policy conditions fail.
 */
export class PolicyDeniedError extends ForbiddenError {
  public readonly policyId?: string;

  constructor(message: string, policyId?: string, decision?: AuthorizationDecision) {
    super(message, 'POLICY_DENIED', decision);
    this.policyId = policyId;
  }
}

/**
 * Thrown when an action is paused awaiting secondary human or manager approval.
 */
export class ApprovalRequiredError extends AuthorizationError {
  public readonly approvalRequestId?: string;

  constructor(message: string, approvalRequestId?: string, decision?: AuthorizationDecision) {
    super(message, 'APPROVAL_REQUIRED', decision);
    this.approvalRequestId = approvalRequestId;
  }
}
