// ============================================================================
// Scopes — Scope taxonomy from .agent/AUTHORIZATION.md
// ============================================================================

export const ScopeType = {
  GLOBAL: 'global',
  ORGANIZATION: 'organization',
  RESTAURANT: 'restaurant',
  BRANCH: 'branch',
  SESSION: 'session',
  RESOURCE: 'resource',
} as const;

export type ScopeType = (typeof ScopeType)[keyof typeof ScopeType];

export interface Scope {
  type: ScopeType;
  id?: string;
  resourceIds?: string[];
}
