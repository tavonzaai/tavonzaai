// ============================================================================
// @tavonza/authorization — Core Actor Model
// ============================================================================
// Framework-agnostic actor interface representing any entity initiating actions:
// human users, AI agents, service accounts, background workers, or system processes.
// ============================================================================

import type { Scope } from './scope';

/**
 * Standard actor types recognized across platform systems.
 * Actor types are extensible strings; custom types may be defined by applications.
 */
export const ActorType = {
  USER: 'USER',
  AI_AGENT: 'AI_AGENT',
  SYSTEM: 'SYSTEM',
  INTEGRATION: 'INTEGRATION',
  SERVICE_ACCOUNT: 'SERVICE_ACCOUNT',
} as const;

export type ActorType = (typeof ActorType)[keyof typeof ActorType] | (string & {});

/**
 * An Actor represents any subject capable of requesting an action on a resource.
 */
export interface Actor {
  /** Unique identifier of the actor (e.g. user UUID, AI agent identifier, service ID) */
  readonly id: string;

  /** Actor classification (human user, AI agent, service account, etc.) */
  readonly type: ActorType;

  /** Roles assigned to this actor */
  readonly roles?: readonly string[];

  /** Explicit direct permissions granted to this actor (independent of roles) */
  readonly permissions?: readonly string[];

  /** Scopes governing this actor's authorization boundaries */
  readonly scopes?: readonly Scope[];

  /** Organization / tenant identifier */
  readonly organizationId?: string | null;

  /** Branch / location identifier */
  readonly branchId?: string | null;

  /** Additional arbitrary context attributes for ABAC policy evaluation */
  readonly attributes?: Readonly<Record<string, unknown>>;
}

/**
 * Helper to construct a validated Actor object.
 */
export function createActor(params: {
  id: string;
  type?: string;
  roles?: string[];
  permissions?: string[];
  scopes?: Scope[];
  organizationId?: string | null;
  branchId?: string | null;
  attributes?: Record<string, unknown>;
}): Actor {
  if (!params.id || typeof params.id !== 'string' || params.id.trim() === '') {
    throw new Error('Actor id must be a non-empty string');
  }

  return {
    id: params.id.trim(),
    type: params.type ?? ActorType.USER,
    roles: params.roles ? Object.freeze([...params.roles]) : Object.freeze([]),
    permissions: params.permissions ? Object.freeze([...params.permissions]) : Object.freeze([]),
    scopes: params.scopes ? Object.freeze([...params.scopes]) : Object.freeze([]),
    organizationId: params.organizationId ?? null,
    branchId: params.branchId ?? null,
    attributes: params.attributes ? Object.freeze({ ...params.attributes }) : Object.freeze({}),
  };
}
