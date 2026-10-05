// ============================================================================
// @tavonza/authorization — Core Policy Model (ABAC & Dynamic Conditions)
// ============================================================================
// Policy interfaces for evaluating fine-grained contextual conditions:
// financial thresholds, operational hours, state machines, or approval triggers.
// ============================================================================

import type { Actor } from './actor';
import type { Resource } from './resource';
import type { Scope } from './scope';

export type PolicyEffect = 'ALLOW' | 'DENY' | 'REQUIRES_APPROVAL';

/**
 * Context provided to policies during evaluation.
 */
export interface PolicyContext {
  readonly actor: Actor;
  readonly action: string;
  readonly resource: Resource;
  readonly scope?: Scope;
  readonly environment?: Readonly<Record<string, unknown>>;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Detailed outcome of a single policy evaluation.
 */
export interface PolicyResult {
  readonly effect: PolicyEffect;
  readonly reason?: string;
  readonly code?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * A Policy implements dynamic, context-aware authorization rules.
 */
export interface Policy {
  /** Unique policy identifier */
  readonly id: string;

  /** Human-readable policy name */
  readonly name: string;

  /** Optional description */
  readonly description?: string;

  /** Optional evaluation priority (lower numbers evaluate first, default 100) */
  readonly priority?: number;

  /**
   * Predicate determining if this policy is applicable to the current request.
   */
  appliesTo(context: PolicyContext): boolean | Promise<boolean>;

  /**
   * Evaluates the policy condition.
   * May return a boolean (true -> ALLOW, false -> DENY) or a full PolicyResult.
   */
  evaluate(context: PolicyContext): PolicyResult | boolean | Promise<PolicyResult | boolean>;
}

/**
 * Helper to build a functional Policy.
 */
export function createPolicy(params: {
  id: string;
  name: string;
  description?: string;
  priority?: number;
  appliesTo?: (context: PolicyContext) => boolean | Promise<boolean>;
  evaluate: (context: PolicyContext) => PolicyResult | boolean | Promise<PolicyResult | boolean>;
}): Policy {
  if (!params.id || typeof params.id !== 'string') {
    throw new Error('Policy id must be a non-empty string');
  }

  return {
    id: params.id.trim(),
    name: params.name,
    description: params.description,
    priority: params.priority ?? 100,
    appliesTo: params.appliesTo ?? (() => true),
    evaluate: params.evaluate,
  };
}
