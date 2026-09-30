# Project Status

## Document Purpose

This file tracks the active implementation roadmap and current project execution state.
Unlike the foundational `.agent` architecture documents, this file is continuously updated as phases and tasks progress.

---

## Current Phase

**Phase 1: Database Architecture & Drizzle Schema Modeling**

We are currently establishing the complete database layer using PostgreSQL and Drizzle ORM based on the authoritative schema defined in `.agent/DATABASE.md`.

---

## Detailed Project Implementation Phases

### Phase 1: Database Architecture & Drizzle Schema Modeling (Current)
- [x] **1.1 Database Architecture & Schema Specification**
  - Complete authoritative specification of all 36 tables, 23 enums, relations, and business invariants in `.agent/DATABASE.md`.
- [ ] **1.2 Drizzle ORM Infrastructure & Configuration**
  - Configure `drizzle.config.ts`, PostgreSQL client connection pool, and environment variables.
- [ ] **1.3 TypeScript Schema Definitions (Drizzle ORM)**
  - [ ] 1.3.1 Enums & common composite types (Address, etc.)
  - [ ] 1.3.2 Organizations, Restaurants, Branches, and Branch Settings
  - [ ] 1.3.3 Users, Admins, Staff, Owners, Customers, and Staff Assignments (RBAC)
  - [ ] 1.3.4 Menu Categories, Menu Items, Modifier Groups, and Modifiers
  - [ ] 1.3.5 Tables, Floor Layouts, Reservations, and Waiter Table Assignments
  - [ ] 1.3.6 Table Sessions, Guest Sessions, and Table Auth OTPs
  - [ ] 1.3.7 Orders, Order Items, Status Change Logs, and Reviews
  - [ ] 1.3.8 Payments, Payment Allocations, and Discounts
  - [ ] 1.3.9 Work Shifts, Suppliers, and Inventory Management
  - [ ] 1.3.10 Audit Logs, Operating Hours, Holidays, and Password Reset OTPs
- [ ] **1.4 Migration Pipeline & Generation**
  - Run initial `drizzle-kit generate` to produce SQL migrations and verify foreign keys, unique constraints, and indexes.
- [ ] **1.5 Database Seeding & Validation**
  - Create seed scripts with sample multi-tenant data (Organizations, Branches, Users, Menus, Tables) and verify query execution.

---

### Phase 2: Core Backend Foundation & Shared Infrastructure
- [ ] **2.1 Monorepo & Build Orchestration**
  - Configure pnpm workspace, Turborepo pipelines, and strict TypeScript configurations.
- [ ] **2.2 Shared Validation Schemas & Domain DTOs**
  - Build Zod schemas mirroring the database tables for type-safe runtime validation.
- [ ] **2.3 Database Client & Tenant-Scoped Repositories**
  - Implement query helper abstractions enforcing mandatory tenant scoping on all reads/writes.
- [ ] **2.4 Authentication & RBAC Engine**
  - JWT authentication, role guards (GlobalRole & StaffRole), OTP verification services, and capability checkers.
- [ ] **2.5 Middleware & Observability**
  - Global exception handling, structured JSON logger, and automated audit logging interceptor.

---

### Phase 3: Backend Domain Modules & REST/RPC APIs
- [ ] **3.1 Identity & Access Module**
  - `/auth/*` endpoints (email/password login, token refresh, password reset OTP, profile management).
- [ ] **3.2 Organization, Restaurant & Branch Hierarchy Module**
  - Multi-tenant CRUD, branch settings management, operating hours, and holiday schedules.
- [ ] **3.3 Staff Assignment & Granular Permissions Module**
  - Staff onboarding, role assignments per branch, permission overrides, and staff directory.
- [ ] **3.4 Menu & Catalog Management Module**
  - Category ordering, item management, modifier group configuration, price delta rules, and real-time availability toggles.
- [ ] **3.5 Table & Area Management Module**
  - Table configuration (capacity, shape, floor), QR token generation/regeneration, and reservation scheduling.
- [ ] **3.6 Table Session & Guest Session Lifecycle Module**
  - QR code scanning, multi-guest session join flow, guest display names, and join code verification.
- [ ] **3.7 Order Lifecycle & Kitchen Station Routing Module**
  - Order placement, acceptance workflows (Auto/Waiter/Manager), station routing (Kitchen vs. Bar), item price snapshotting, and status transitions.
- [ ] **3.8 Billing, Split-Payment & Discount Module**
  - Bill calculation (tax, service charges, tips), split-by-item / split-by-guest / split-table logic, payment allocations, and discount application.
- [ ] **3.9 Work Shift & Attendance Module**
  - Shift slot creation, staff shift scheduling, and clock-in/clock-out tracking.
- [ ] **3.10 Inventory & Supplier Management Module**
  - Supplier directory, inventory category organization, stock level tracking, and low-stock alerts.
- [ ] **3.11 Customer Feedback & Reviews Module**
  - Post-dining order review submission, rating capture, and staff moderation.
- [ ] **3.12 Internal AI Gateway Endpoints**
  - Implement the 5 `/internal/*` endpoints defined in `docs/AI_BACKEND_INTEGRATION_SPEC.md` for AI agent tool execution.

---

### Phase 4: Realtime Engine & Background Processing
- [ ] **4.1 Realtime Event Hub (WebSocket / SSE)**
  - Live table state updates, kitchen display ticket updates, and order status broadcasts to guests.
- [ ] **4.2 Outbox Processor & Background Workers**
  - Transactional outbox reader, asynchronous event dispatch, FCM push notifications, and automatic idle table session cleanup.

---

### Phase 5: Frontend Applications (One by One)
- [ ] **5.1 Customer QR Self-Ordering Web App**
  - Mobile-first web app: QR landing, OTP verification, interactive menu with modifiers, multi-guest shared view, order status tracking, and split-bill checkout.
- [ ] **5.2 Waiter & Floor Staff Tablet/Mobile App**
  - Real-time floor plan view, table status indicators, pending order acceptance/rejection, manual order creation, and bill collection.
- [ ] **5.3 Kitchen & Bar Display System (KDS)**
  - Live station order feed (filtered by Kitchen vs. Bar), item preparation timer, line-item mark ready, and item out-of-stock toggle.
- [ ] **5.4 Cashier & POS Terminal Web App**
  - Register checkout view, cash/card payment recording, split-bill cashier settlement, and daily shift reconciliation.
- [ ] **5.5 Restaurant & Branch Manager Portal**
  - Menu catalog editor, floor layout designer, shift scheduler, inventory dashboard, discount creator, and branch settings toggles.
- [ ] **5.6 Super Admin Platform Portal**
  - Organization provisioning, global role management, cross-tenant audit log viewer, and platform-wide performance analytics.

---

### Phase 6: Comprehensive Testing & Quality Assurance
- [ ] **6.1 Unit & Repository Tests**
  - Drizzle query verification, transactional integrity tests, and domain rule unit tests.
- [ ] **6.2 State Machine & Workflow Integration Tests**
  - Complete lifecycle tests: Order status transitions, payment allocation math verification, and session closing invariants.
- [ ] **6.3 Multi-Tenant Isolation & Security Audit**
  - Verification that no branch or organization can read or mutate data across tenant boundaries.
- [ ] **6.4 End-to-End System Tests**
  - Automated simulation: Guest QR scan -> multi-guest ordering -> waiter acceptance -> KDS preparation -> payment settlement.
- [ ] **6.5 Performance & Concurrency Load Testing**
  - High-concurrency tests for simultaneous table ordering and kitchen ticket generation.

---

### Phase 7: Production Deployment & DevOps
- [ ] **7.1 Infrastructure Provisioning via Terraform**
  - AWS ECS/Fargate services, RDS PostgreSQL cluster, ElastiCache Redis, S3 bucket storage, and CloudFront CDN.
- [ ] **7.2 CI/CD Automation**
  - GitHub Actions pipelines for automated testing, linting, migration deployment, and container image builds.
- [ ] **7.3 Observability & Production Monitoring**
  - Centralized CloudWatch metrics, Sentry error tracking, latency tracing, and health check endpoints.

---

## Current Architectural State

### Confirmed Principles
- **Modular Monolith First**: Single repository and deployment unit initially; strict domain boundaries for clean extraction.
- **Tenant Boundary**: Organization is the root tenant boundary; every query enforces tenant scoping.
- **Authoritative Database**: PostgreSQL managed via Drizzle ORM is the single source of persistent truth.
- **Session Architecture**: Table sessions and Guest sessions are independent first-class entities.
- **Order & Production Separation**: Orders progress through explicit state machines; kitchen & bar stations process line items independently.
- **Financial Integrity**: Auditable split-bill support with atomic payment allocations.
- **AI Subsystem**: `apps/ai` is fully built and accesses business logic only via authorized internal endpoints (`/internal/*`).
