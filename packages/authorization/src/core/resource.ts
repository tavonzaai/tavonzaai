// ============================================================================
// @tavonza/authorization — Core Resource Model
// ============================================================================
// Domain-neutral representation of a protected entity or collection.
// ============================================================================

import type { Scope } from './scope';

/**
 * A protected resource upon which an action is requested.
 */
export interface Resource {
  /** Resource type/kind (e.g. 'order', 'payment', 'report', 'document') */
  readonly type: string;

  /** Unique identifier of the resource instance (optional for collection/create actions) */
  readonly id?: string | null;

  /** Owner identifier for evaluating ownership policies (e.g. resource:read:own) */
  readonly ownerId?: string | null;

  /** Organization / tenant boundary of this resource */
  readonly organizationId?: string | null;

  /** Branch / location boundary of this resource */
  readonly branchId?: string | null;

  /** Scope where this resource belongs */
  readonly scope?: Scope;

  /** Free-form attributes for dynamic ABAC policy evaluation */
  readonly attributes?: Readonly<Record<string, unknown>>;
}

/**
 * Factory to create an immutable Resource.
 */
export function createResource(params: {
  type: string;
  id?: string | null;
  ownerId?: string | null;
  organizationId?: string | null;
  branchId?: string | null;
  scope?: Scope;
  attributes?: Record<string, unknown>;
}): Resource {
  if (!params.type || typeof params.type !== 'string' || params.type.trim() === '') {
    throw new Error('Resource type must be a non-empty string');
  }

  return {
    type: params.type.trim().toLowerCase(),
    id: params.id ?? null,
    ownerId: params.ownerId ?? null,
    organizationId: params.organizationId ?? null,
    branchId: params.branchId ?? null,
    scope: params.scope,
    attributes: params.attributes ? Object.freeze({ ...params.attributes }) : Object.freeze({}),
  };
}
