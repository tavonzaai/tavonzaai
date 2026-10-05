// ============================================================================
// @tavonza/authorization — Core Role Model
// ============================================================================
// Roles are application-defined permission bundles with optional inheritance.
// The engine does not hard-code special role names.
// ============================================================================

import { normalizePermission } from './permission';

/**
 * A Role is a named bundle of permissions.
 */
export interface Role {
  /** Unique name or key for this role (e.g. 'MANAGER', 'AUDITOR', 'VIEWER') */
  readonly name: string;

  /** Human-readable description */
  readonly description?: string;

  /** Permissions granted by this role */
  readonly permissions: readonly string[];

  /** Roles inherited by this role (permissions are unioned) */
  readonly inherits?: readonly string[];

  /** Application-defined metadata */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Factory to construct a validated Role.
 */
export function createRole(params: {
  name: string;
  description?: string;
  permissions: string[];
  inherits?: string[];
  metadata?: Record<string, unknown>;
}): Role {
  if (!params.name || typeof params.name !== 'string' || params.name.trim() === '') {
    throw new Error('Role name must be a non-empty string');
  }

  const normalizedPermissions = (params.permissions ?? [])
    .map((p) => normalizePermission(p))
    .filter((p) => p.length > 0);

  return {
    name: params.name.trim(),
    description: params.description,
    permissions: Object.freeze(Array.from(new Set(normalizedPermissions))),
    inherits: params.inherits ? Object.freeze([...params.inherits]) : Object.freeze([]),
    metadata: params.metadata ? Object.freeze({ ...params.metadata }) : Object.freeze({}),
  };
}
