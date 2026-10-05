// ============================================================================
// @tavonza/authorization — Core Scope Model
// ============================================================================
// Hierarchical scope interfaces allowing multi-tenant, location, or resource
// boundary restrictions.
// ============================================================================

/**
 * Standard scope type identifiers.
 * Applications may define additional custom scope types.
 */
export const ScopeType = {
  GLOBAL: 'global',
  ORGANIZATION: 'organization',
  RESTAURANT: 'restaurant',
  BRANCH: 'branch',
  WORKSPACE: 'workspace',
  DEPARTMENT: 'department',
  SESSION: 'session',
  RESOURCE: 'resource',
} as const;

export type ScopeType = (typeof ScopeType)[keyof typeof ScopeType] | (string & {});

/**
 * A Scope defines the boundary within which an authorization grant or request applies.
 */
export interface Scope {
  /** Scope category (e.g. 'global', 'organization', 'branch', 'workspace') */
  readonly type: ScopeType;

  /** Scope identifier (e.g. org-123, branch-456). Null or undefined indicates all entities of that type */
  readonly id?: string | null;

  /** Parent scope identifier if applicable */
  readonly parentId?: string | null;

  /** Specific resource identifiers if this scope restricts to an allowlist */
  readonly resourceIds?: readonly string[];

  /** Additional scope metadata */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Scope check requested during authorization evaluation.
 */
export interface RequiredScopeCheck {
  readonly type: ScopeType;
  readonly id?: string | null;
  readonly resourceId?: string | null;
}

/**
 * Factory to create an immutable Scope object.
 */
export function createScope(params: {
  type: string;
  id?: string | null;
  parentId?: string | null;
  resourceIds?: string[];
  metadata?: Record<string, unknown>;
}): Scope {
  if (!params.type || typeof params.type !== 'string' || params.type.trim() === '') {
    throw new Error('Scope type must be a non-empty string');
  }

  return {
    type: params.type.trim().toLowerCase(),
    id: params.id ?? null,
    parentId: params.parentId ?? null,
    resourceIds: params.resourceIds ? Object.freeze([...params.resourceIds]) : undefined,
    metadata: params.metadata ? Object.freeze({ ...params.metadata }) : undefined,
  };
}
