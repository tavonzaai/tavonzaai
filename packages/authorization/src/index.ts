// ============================================================================
// @tavonza/authorization — Public API
// ============================================================================
// Production-grade, framework-agnostic authorization package.
// Single authorization decision point supporting RBAC, ABAC, wildcards,
// hierarchical scopes, ownership, approval workflows, and audit sinks.
// ============================================================================

// 1. Core Models (Actor, Role, Permission, Scope, Resource, Policy, Context, Decision, Errors)
export * from './core';

// 2. Authorization Engine (AuthorizationEngine, Resolvers, Evaluators)
export * from './engine';

// 3. Audit Logging (AuditSink, AuditEvent, CompositeSink, Hooks)
export * from './audit';

// 4. Framework & Platform Adapters (HTTP Guard, AI Tool Authorizer, Persistence Repositories)
export * from './adapters';

// 5. Domain Presets (Restaurant Permissions, Default Roles, Policies)
export * from './presets';

// 6. Backwards Compatibility Layer (Preserves all existing exports)
export * from './compatibility';
