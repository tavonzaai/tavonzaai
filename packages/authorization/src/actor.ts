// ============================================================================
// Actor Types — Canonical actor taxonomy from .agent/AUTHORIZATION.md
// ============================================================================

export const ActorType = {
  USER: 'USER',
  AI_AGENT: 'AI_AGENT',
  SYSTEM: 'SYSTEM',
  INTEGRATION: 'INTEGRATION',
} as const;

export type ActorType = (typeof ActorType)[keyof typeof ActorType];
