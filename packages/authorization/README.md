# @tavonza/authorization

Production-grade, framework-agnostic authorization and policy engine supporting RBAC, ABAC, wildcards, hierarchical scopes, resource ownership, AI agent governance, approval workflows, and audit logging.

---

## 1. Architectural Overview

`@tavonza/authorization` serves as the **single authoritative decision point** across HTTP APIs, AI agent tool gateways, background workers, and internal domain services. The core authorization engine is pure TypeScript with zero framework or database dependencies, allowing seamless reuse across diverse backend domains (SaaS, Healthcare, E-Commerce, ERP, Banking, AI Agent Platforms).

### Central Decision Pipeline

```text
       Incoming Request (Actor, Action, Resource, Scope, Environment)
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   1. Actor Model    │
                         │ (Human, AI, System) │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  2. Role Resolution │
                         │ (Inheritance graph) │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ 3. Capability Match │
                         │  (Exact & Wildcard) │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  4. Scope Containment│
                         │ (Tenant / Branch /  │
                         │      Resource)      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ 5. Resource Owner   │
                         │  (:own vs :any)     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ 6. Dynamic ABAC     │
                         │      Policies       │
                         │ (Limits, Approvals) │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │7. Structured Result │
                         │   ALLOW / DENY /    │
                         │  REQUIRES_APPROVAL  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ 8. Audit Event Sink │
                         │ (Structured SIEM /  │
                         │     Compliance)     │
                         └─────────────────────┘
```

---

## 2. Core Concepts

### 2.1 Actor

An actor represents any entity capable of initiating actions:
* Human users (`ActorType.USER`)
* AI agents (`ActorType.AI_AGENT`)
* System processes (`ActorType.SYSTEM`)
* External integrations (`ActorType.INTEGRATION`)
* Service accounts (`ActorType.SERVICE_ACCOUNT`)

```typescript
import { createActor, ActorType } from '@tavonza/authorization';

const actor = createActor({
  id: 'user_42',
  type: ActorType.USER,
  roles: ['WAITER'],
  organizationId: 'org_01',
  branchId: 'branch_05',
  attributes: { refundLimit: 50 },
});
```

### 2.2 Permissions

Permissions follow the standard `resource:action` format:
* `order:read`, `order:create`, `order:update`, `order:delete`
* `payment:refund`, `product:create`, `report:export`

The engine automatically normalizes dot notation (`orders.read` -> `orders:read`) and supports singular/plural resource matching (`order:read` satisfies `orders:read`).

### 2.3 Wildcards

* `*`: Grants absolute access across all resources and actions.
* `resource:*` (e.g. `order:*`): Grants all actions on the target resource.
* `*:action` (e.g. `*:read`): Grants the action across all resources.

Matching is strictly deterministic and fail-closed. Wildcards can be toggled via `wildcardsEnabled: false` if needed.

### 2.4 Roles

Roles are application-defined bundles of permissions with support for recursive inheritance:

```typescript
import { createRole } from '@tavonza/authorization';

const editor = createRole({
  name: 'EDITOR',
  permissions: ['doc:read', 'doc:update'],
});

const admin = createRole({
  name: 'ADMIN',
  inherits: ['EDITOR'],
  permissions: ['doc:delete', 'doc:publish'],
});
```

The resolver automatically detects and prevents cyclic inheritance loops (`Role A -> Role B -> Role A`).

### 2.5 Scopes

Scopes define multi-tenant, organizational, and resource boundaries:
* `global`: Unconditionally satisfies any scope check.
* `organization`: Tenant boundary (prevents cross-tenant access).
* `branch` / `workspace` / `department`: Location or unit boundary.
* `resource`: Restricts access to an allowlist of specific resource IDs (`resourceIds: ['table-1', 'table-2']`).

Organization scope hierarchically covers child branches and resources.

### 2.6 Ownership

Support for owner-restricted capabilities (`:own` qualifier):
* `order:read:own`: Permits access only when `actor.id === resource.ownerId`.
* `order:read` or `order:read:any`: Permits access regardless of ownership.

### 2.7 Dynamic ABAC Policies

Policies evaluate runtime conditions such as financial limits, time of day, or operational states:

```typescript
import { createPolicy, type PolicyContext } from '@tavonza/authorization';

export const MaxRefundPolicy = createPolicy({
  id: 'policy_max_refund',
  name: 'Max Refund Auto-Approval',
  priority: 10,
  appliesTo: (ctx: PolicyContext) => ctx.action === 'payment:refund',
  evaluate: (ctx: PolicyContext) => {
    const amount = Number(ctx.environment?.amount ?? 0);
    const limit = Number(ctx.actor.attributes?.refundLimit ?? 100);

    if (amount > limit) {
      return {
        effect: 'REQUIRES_APPROVAL',
        reason: `Refund amount ($${amount}) exceeds threshold ($${limit}). Approval required.`,
      };
    }
    return { effect: 'ALLOW' };
  },
});
```

### 2.8 Structured Decisions

Decisions return rich diagnostic metadata rather than simple booleans:

```typescript
interface AuthorizationDecision {
  allowed: boolean;
  status: 'ALLOW' | 'DENY' | 'REQUIRES_APPROVAL';
  reason?: string;
  code?: string;
  matchedPermission?: string;
  matchedRole?: string;
  matchedPolicy?: string;
  scope?: Scope;
  timestamp: number;
  metadata?: Record<string, unknown>;
}
```

---

## 3. Integration Guide

### 3.1 Framework-Independent Service Authorization

Protect any business service or background job without relying on HTTP guards:

```typescript
import { AuthorizationEngine, PermissionDeniedError } from '@tavonza/authorization';

const engine = new AuthorizationEngine();

async function processRefund(actor: Actor, orderId: string, amount: number) {
  // Throws PermissionDeniedError, ScopeDeniedError, or ApprovalRequiredError
  await engine.assertAuthorized({
    actor,
    action: 'payment:refund',
    resource: { type: 'payment', id: orderId, attributes: { amount } },
    environment: { amount },
  });

  // Proceed with domain logic
}
```

### 3.2 AI Agent & Tool Gateway Integration

AI agents follow the exact same security principles. The `AiToolAuthorizer` validates tool invocations:

```typescript
import {
  AuthorizationEngine,
  AiToolAuthorizer,
  type AiToolDefinition,
} from '@tavonza/authorization';

const tools: AiToolDefinition[] = [
  { name: 'get_menu', resource: 'menu', action: 'read', riskTier: 'read_only' },
  { name: 'create_order', resource: 'order', action: 'create', riskTier: 'mutation' },
  {
    name: 'cancel_order',
    resource: 'order',
    action: 'delete',
    riskTier: 'high_risk_approval',
    requiresApproval: true,
  },
];

const engine = new AuthorizationEngine();
const authorizer = new AiToolAuthorizer(engine, tools);

// In your tool dispatch handler
const decision = await authorizer.authorizeToolCall({
  actor: aiActor,
  tool: 'cancel_order',
  args: { orderId: 'ord-123' },
});

if (decision.status === 'REQUIRES_APPROVAL') {
  return { status: 'PENDING_APPROVAL', reason: decision.reason };
}
if (!decision.allowed) {
  return { status: 'ERROR', error: decision.reason };
}
```

### 3.3 HTTP & API Route Protection

Use `@RequirePermissions` or `@Authorize` with `GenericHttpAuthorizationGuard`:

```typescript
import {
  RequirePermissions,
  Authorize,
  GenericHttpAuthorizationGuard,
} from '@tavonza/authorization';

// In your route controller
@Get(':id')
@RequirePermissions('order:read')
async getOrder(@Param('id') id: string) { ... }

@Post(':id/refund')
@Authorize({ resource: 'payment', action: 'refund' })
async refundOrder(@Param('id') id: string) { ... }
```

### 3.4 Audit Sink Integration

Register custom audit sinks to stream authorization events into your SIEM, message queue, or database:

```typescript
import {
  AuthorizationEngine,
  type AuditSink,
  type AuthorizationAuditEvent,
} from '@tavonza/authorization';

class DatabaseAuditSink implements AuditSink {
  async record(event: AuthorizationAuditEvent): Promise<void> {
    await db.insert(auditLogs).values({
      actorId: event.actorId,
      actorType: event.actorType,
      action: event.action,
      resource: event.resource,
      decision: event.decision,
      reason: event.reason,
      timestamp: event.timestamp,
    });
  }
}

const engine = new AuthorizationEngine({
  auditSink: new DatabaseAuditSink(),
  onDecision: (event) => console.log(`[AUDIT] ${event.decision}: ${event.action}`),
});
```

---

## 4. Reusing Across Other Projects

To reuse this package in completely different business domains (e.g. Healthcare, E-Commerce, ERP):

1. **Keep the Core Package Unchanged**: The core engine understands only `Actor`, `Role`, `Permission`, `Scope`, `Resource`, `Policy`, and `Decision`.
2. **Define Domain Presets**: Create domain permission constants and default roles in your consuming application:
   ```typescript
   // E-Commerce Example
   export const EcommercePermissions = {
     INVENTORY_UPDATE: 'inventory:update',
     PRODUCT_PUBLISH: 'product:publish',
     ORDER_FULFILL: 'order:fulfill',
   };
   ```
3. **Plug In Your Persistence Repositories**: Implement `RoleRepository` or `PolicyRepository` backed by Prisma, TypeORM, Mongo, or Drizzle.

---

## 5. Security Principles

1. **Fail Closed**: Any unhandled error, missing actor, or invalid context produces `status: 'DENY'`.
2. **No Role-Name Hardcoding**: Roles are dynamic bundles of permissions. Never write `if (role === 'admin')`.
3. **No Implicit Wildcards**: Wildcard capabilities are strictly explicit.
4. **No AI Bypass**: AI agents undergo identical authorization and scope validation as humans.
5. **Backend Authority**: Frontend visibility checks exist solely for UX; backend re-evaluates all capabilities.

---

## 6. Testing

The package includes 52 comprehensive unit and integration tests:

```bash
# Run unit and integration tests
pnpm --filter @tavonza/authorization test

# Typecheck package
pnpm --filter @tavonza/authorization typecheck
```
