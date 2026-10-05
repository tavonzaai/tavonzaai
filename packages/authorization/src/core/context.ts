// ============================================================================
// @tavonza/authorization — Core Context Model
// ============================================================================
// Authorization request context containing actor, action, resource, scope, and
// environmental metadata passed to the engine.
// ============================================================================

import type { Actor } from './actor';
import type { Resource } from './resource';
import type { Scope } from './scope';
import { createResource } from './resource';
import { normalizePermission } from './permission';

/**
 * Input request provided to the AuthorizationEngine.
 */
export interface AuthorizationRequest {
  /** The acting subject requesting access */
  readonly actor: Actor;

  /** Action or capability requested (e.g. 'order:read', 'read', 'orders.read') */
  readonly action: string;

  /** The target resource or resource name */
  readonly resource: Resource | string;

  /** Target scope required for this operation */
  readonly scope?: Scope;

  /** Organization / tenant boundary of the request */
  readonly organizationId?: string | null;

  /** Branch / location boundary of the request */
  readonly branchId?: string | null;

  /** Unique request trace identifier */
  readonly requestId?: string;

  /** Millisecond timestamp */
  readonly timestamp?: number;

  /** Environment or ABAC variables (e.g. current time, client IP, payload amount) */
  readonly environment?: Readonly<Record<string, unknown>>;

  /** Arbitrary metadata */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Normalized context object used across engine evaluation steps.
 */
export interface NormalizedAuthorizationContext {
  readonly actor: Actor;
  readonly action: string;
  readonly resource: Resource;
  readonly requiredPermission: string;
  readonly scope?: Scope;
  readonly organizationId?: string | null;
  readonly branchId?: string | null;
  readonly requestId: string;
  readonly timestamp: number;
  readonly environment: Readonly<Record<string, unknown>>;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Normalizes an incoming authorization request into a standard context.
 */
export function normalizeAuthorizationRequest(
  request: AuthorizationRequest,
): NormalizedAuthorizationContext {
  if (!request.actor) {
    throw new Error('AuthorizationRequest requires an actor');
  }
  if (!request.action || typeof request.action !== 'string') {
    throw new Error('AuthorizationRequest requires an action');
  }
  if (!request.resource) {
    throw new Error('AuthorizationRequest requires a resource');
  }

  const resource: Resource =
    typeof request.resource === 'string'
      ? createResource({
          type: request.resource,
          organizationId: request.organizationId,
          branchId: request.branchId,
        })
      : request.resource;

  // Derive the canonical permission string (e.g. 'order:read')
  const rawAction = request.action.trim();
  let requiredPermission: string;
  if (rawAction.includes(':') || rawAction.includes('.')) {
    requiredPermission = normalizePermission(rawAction);
  } else {
    requiredPermission = `${resource.type.toLowerCase()}:${rawAction.toLowerCase()}`;
  }

  return {
    actor: request.actor,
    action: rawAction,
    resource,
    requiredPermission,
    scope: request.scope,
    organizationId: request.organizationId ?? resource.organizationId ?? request.actor.organizationId ?? null,
    branchId: request.branchId ?? resource.branchId ?? request.actor.branchId ?? null,
    requestId: request.requestId ?? `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: request.timestamp ?? Date.now(),
    environment: request.environment ? Object.freeze({ ...request.environment }) : Object.freeze({}),
    metadata: request.metadata ? Object.freeze({ ...request.metadata }) : Object.freeze({}),
  };
}
