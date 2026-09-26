# Multi-Tenant Restaurant/Bar SaaS Platform

Production-grade, multi-tenant SaaS platform for restaurants and bars to manage QR-based customer ordering and in-venue operations.

## Architecture Source of Truth

The authoritative architectural specifications and design rules are documented under [`.agent/`](.agent/):

- [OVERVIEW.md](.agent/OVERVIEW.md) — Product surfaces, core flows, and high-level technology stack.
- [ARCHITECTURE.md](.agent/ARCHITECTURE.md) — Domain-oriented modular monolith pattern and runtime architecture.
- [HIERARCHY.md](.agent/HIERARCHY.md) — Multi-tenant organization hierarchy vs. authorization model.
- [AUTHORIZATION.md](.agent/AUTHORIZATION.md) — Capability and scope-based security model.
- [FLOWS.md](.agent/FLOWS.md) — End-to-end customer, staff, kitchen, cashier, and event flows.
- [RULES.md](.agent/RULES.md) — Non-negotiable architectural constraints and boundary policies.
- [DATABASE.md](.agent/DATABASE.md) — PostgreSQL data ownership, table sessions, and isolation principles.
- [AI.md](.agent/AI.md) — AI subsystem, tool gateway, and capability boundary.
- [DEVOPS.md](.agent/DEVOPS.md) — Managed AWS deployment, ECS/Fargate, VPC topology, and observability.
- [STATUS.md](.agent/STATUS.md) — Implementation tracking and active phase status.

---

## Architectural Principles

1. **Modular Monolith First**: Monolith in deployment, modular in architecture. No distributed microservices prematurely.
2. **Domain Ownership**: Each business domain strictly owns its persistence, business rules, and state transitions. No direct cross-domain database access.
3. **Backend Authority**: Authorization is determined exclusively by the backend (`Actor + Permission + Scope + Resource + Domain Rules`). Frontend checks are purely for UX.
4. **Tenant Isolation**: Organization boundaries are strictly enforced across API, persistence, background jobs, realtime, analytics, and AI.
5. **AI Cannot Bypass Platform**: AI interacts only via the Tool Gateway, subject to the exact same authorization and domain rules as human users.
6. **Domain Independence from AWS**: Business domain logic must never import AWS SDKs directly; all external integrations use ports and infrastructure adapters.
7. **Realtime Is Not Source of Truth**: Realtime WebSocket delivery communicates state transitions; persistent business state resides in PostgreSQL.

---

## Monorepo Structure

```text
apps/
├── api/            # NestJS modular monolith REST API & orchestration
├── realtime/       # WebSocket gateway, presence, subscriptions
├── worker/         # Background queue workers, outbox processor, scheduled jobs
└── ai/             # AI agent runtime, context builder, tool gateway

packages/
├── authorization/  # Capability & scope models, security interfaces
├── contracts/      # Cross-domain contracts, shared DTOs, API specs
├── database/       # DB connection, migrations, shared persistence utilities
├── events/         # Domain events, outbox schemas, event bus interfaces
├── observability/  # Structured logging, metrics, tracing, audit telemetry
├── queue/          # Queue interfaces (SQS) & job payload contracts
├── storage/        # Object storage abstractions (S3)
├── config/         # Environment schema validation
└── shared/         # Pure domain-agnostic utilities and primitives

frontend/
├── customer/       # QR-driven customer ordering experience
├── staff/          # Operational staff app (Waiter, Kitchen, Cashier, Bartender, Manager)
└── admin/          # Tenant & branch administration console

infra/
├── modules/        # Reusable Terraform modules (vpc, ecs, rds, redis, etc.)
└── environments/   # Environment configurations (dev, staging, production)

docs/
├── api/            # API documentation & OpenAPI specs
├── architecture/   # Engineering design documents
├── operations/     # Infrastructure operations guides
└── runbooks/       # Operational runbooks

docker/             # Application Dockerfiles and local dev docker-compose
scripts/            # Developer automation and tooling scripts
.github/            # CI/CD workflows, CODEOWNERS, PR template
.agent/             # Architectural source of truth and ADRs
```

---

## Dependency Direction

```text
Frontend
    ↓
API
    ↓
Authorization
    ↓
Application
    ↓
Domain
    ↓
Infrastructure
    ↓
Database / AWS
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker & Docker Compose

### Commands

```bash
# Install dependencies
pnpm install

# Run all applications in development mode
pnpm dev

# Build all applications and packages
pnpm build

# Typecheck monorepo
pnpm typecheck

# Run linting
pnpm lint

# Run tests
pnpm test
```
