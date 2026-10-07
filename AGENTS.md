# AGENT INSTRUCTION MANUAL & MANDATORY COMPLIANCE GUIDELINES

Every AI assistant or developer working on the **Tavonza AI Restaurant Platform** MUST carefully read and strictly implement all architectural principles, domain definitions, database schemas, authorization models, and non-negotiable rules documented in the [`.agent/`](file:///c:/Users/MD_Kayesur/Desktop/All_web/tavonzaai/.agent) directory.

---

## 1. Core Architecture Documentation (Required Reading)

Before implementing any feature, bug fix, schema change, or endpoint, inspect the relevant document in [`.agent/`](file:///c:/Users/MD_Kayesur/Desktop/All_web/tavonzaai/.agent):

- [**`.agent/RULES.md`**](file:///c:/Users/MD_Kayesur/Desktop/All_web/tavonzaai/.agent/RULES.md) — 25 Non-Negotiable Architectural Rules (Modular monolith, backend authorization authority, tenant isolation, domain boundary separation, etc.).
- [**`.agent/OVERVIEW.md`**](file:///c:/Users/MD_Kayesur/Desktop/All_web/tavonzaai/.agent/OVERVIEW.md) — System purpose, product surfaces (Customer, Staff, Admin), business hierarchy, and tech stack.
- [**`.agent/HIERARCHY.md`**](file:///c:/Users/MD_Kayesur/Desktop/All_web/tavonzaai/.agent/HIERARCHY.md) — Platform Owner → Organization → Restaurant → Branch breakdown, table sessions, guest sessions, and kitchen/bar station routing.
- [**`.agent/AUTHORIZATION.md`**](file:///c:/Users/MD_Kayesur/Desktop/All_web/tavonzaai/.agent/AUTHORIZATION.md) — Capability and scope-based RBAC engine, `GlobalRole`, `StaffAssignment`, and `permissionActionEnum`.
- [**`.agent/DATABASE.md`**](file:///c:/Users/MD_Kayesur/Desktop/All_web/tavonzaai/.agent/DATABASE.md) — Authoritative spec for all database tables, enums, Drizzle ORM models, relations, and invariants.
- [**`.agent/ARCHITECTURE.md`**](file:///c:/Users/MD_Kayesur/Desktop/All_web/tavonzaai/.agent/ARCHITECTURE.md) — Modular monolith domain boundaries, event-driven realtime outbox, worker jobs, and API design.
- [**`.agent/AI.md`**](file:///c:/Users/MD_Kayesur/Desktop/All_web/tavonzaai/.agent/AI.md) — AI subsystem architecture, Tool Gateway, Groq model provider integration, and strict `/internal/*` authorization paths.
- [**`.agent/STATUS.md`**](file:///c:/Users/MD_Kayesur/Desktop/All_web/tavonzaai/.agent/STATUS.md) — Live phase roadmap and task completion status (Phases 1–4 complete; Phase 5 Frontend Applications in progress).
- [**`.agent/FLOWS.md`**](file:///c:/Users/MD_Kayesur/Desktop/All_web/tavonzaai/.agent/FLOWS.md) — Detailed operational user and system workflows.
- [**`.agent/DEVOPS.md`**](file:///c:/Users/MD_Kayesur/Desktop/All_web/tavonzaai/.agent/DEVOPS.md) — AWS ECS, RDS, SQS, S3, CloudFront infrastructure and deployment guidelines.

---

## 2. Key Non-Negotiable Development Rules

1. **Modular Monolith First**: Keep business logic scoped to its domain (`apps/api/src/modules/<domain>`). Do not introduce global dumping ground folders (e.g. `src/controllers/`, `src/services/`).
2. **Backend is Security Authority**: Frontend is never a security boundary. Validate tenant scope (`organizationId`, `branchId`) and capabilities on every backend request.
3. **Tenant Isolation**: Mandatory on all database queries and realtime pub/sub topics.
4. **AI Gateway Isolation**: AI must NEVER run direct SQL queries. All AI interactions pass through:
   `AI → Tool Gateway → Authorization → Application Service → Domain → Database`.
5. **Drizzle ORM Single Source of Truth**: Database changes must be modeled in Drizzle schema files (`packages/database/src/schema/`) and generated via `drizzle-kit`.
6. **No Invented Product Scope**: Implement features strictly as defined in product & architecture specs.
