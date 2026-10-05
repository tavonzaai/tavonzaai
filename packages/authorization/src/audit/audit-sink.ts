// ============================================================================
// @tavonza/authorization — Audit: Sinks & Hooks
// ============================================================================
// Pluggable sinks and hooks for persisting or streaming authorization audit records.
// ============================================================================

import type { AuthorizationAuditEvent } from './audit-record';

export interface AuditSink {
  record(event: AuthorizationAuditEvent): void | Promise<void>;
}

/**
 * In-memory audit sink suitable for automated testing and inspection.
 */
export class InMemoryAuditSink implements AuditSink {
  public readonly events: AuthorizationAuditEvent[] = [];

  record(event: AuthorizationAuditEvent): void {
    this.events.push(event);
  }

  clear(): void {
    this.events.length = 0;
  }

  findLastByActor(actorId: string): AuthorizationAuditEvent | undefined {
    for (let i = this.events.length - 1; i >= 0; i--) {
      const e = this.events[i];
      if (e && e.actorId === actorId) return e;
    }
    return undefined;
  }
}

/**
 * Composite sink delegating to multiple child sinks.
 */
export class CompositeAuditSink implements AuditSink {
  private readonly sinks: AuditSink[];

  constructor(sinks: AuditSink[] = []) {
    this.sinks = [...sinks];
  }

  addSink(sink: AuditSink): void {
    this.sinks.push(sink);
  }

  async record(event: AuthorizationAuditEvent): Promise<void> {
    for (const sink of this.sinks) {
      try {
        await sink.record(event);
      } catch {
        // Fail-safe: Audit recording errors must not compromise authorization flow
      }
    }
  }
}

/**
 * Functional callback type for inline decision notifications.
 */
export type DecisionHook = (event: AuthorizationAuditEvent) => void | Promise<void>;
