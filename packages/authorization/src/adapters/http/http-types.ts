// ============================================================================
// @tavonza/authorization — HTTP Adapter: Types
// ============================================================================
// Framework-agnostic HTTP context and extractor contracts.
// ============================================================================

import type { Actor } from '../../core/actor';
import type { Resource } from '../../core/resource';
import type { Scope } from '../../core/scope';

export interface HttpRequestLike {
  user?: any;
  params?: Record<string, string>;
  query?: Record<string, any>;
  body?: any;
  headers?: Record<string, string | string[] | undefined>;
}

export type ActorExtractor = (req: HttpRequestLike) => Actor | undefined;
export type ResourceExtractor = (req: HttpRequestLike) => Resource | string | undefined;
export type ScopeExtractor = (req: HttpRequestLike) => Scope | undefined;
