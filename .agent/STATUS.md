# Project Status

## Document Purpose

This file tracks the active implementation roadmap and current project execution state.
Unlike the foundational `.agent` architecture documents, this file is continuously updated as phases and tasks progress.

---

## Current Phase

**Phase 5: Frontend Applications (One by One)**

Phase 1 (Database Modeling), Phase 2 (Shared Foundation & RBAC), Phase 3 (Backend Domain Modules & REST/RPC APIs), and Phase 4 (Realtime Engine & Background Processing) are complete and fully verified with 100% clean typecheck and production builds across all 19 workspace projects in the monorepo. We are now advancing to Phase 5.

---

## Detailed Project Implementation Phases

### Phase 1: Database Architecture & Drizzle Schema Modeling (Complete)
- [x] **1.1 Database Architecture & Schema Specification**
  - Complete authoritative specification of all 36 tables, 23 enums, relations, and business invariants in `.agent/DATABASE.md`.
- [x] **1.2 Drizzle ORM Infrastructure & Configuration**
  - Configure `drizzle.config.ts`, PostgreSQL client connection pool, and environment variables.
- [x] **1.3 TypeScript Schema Definitions (Drizzle ORM)**
  - [x] 1.3.1 Enums & common composite types (Address, etc.)
  - [x] 1.3.2 Organizations, Restaurants, Branches, and Branch Settings
  - [x] 1.3.3 Users, Admins, Staff, Owners, Customers, and Staff Assignments (RBAC)
  - [x] 1.3.4 Menu Categories, Menu Items, Modifier Groups, and Modifiers
  - [x] 1.3.5 Tables, Floor Layouts, Reservations, and Waiter Table Assignments
  - [x] 1.3.6 Table Sessions, Guest Sessions, and Table Auth OTPs
  - [x] 1.3.7 Orders, Order Items, Status Change Logs, and Reviews
  - [x] 1.3.8 Payments, Payment Allocations, and Discounts
  - [x] 1.3.9 Work Shifts, Suppliers, and Inventory Management
  - [x] 1.3.10 Audit Logs, Operating Hours, Holidays, and Password Reset OTPs
- [x] **1.4 Migration Pipeline & Generation**
  - Run initial `drizzle-kit generate` to produce SQL migrations and verify foreign keys, unique constraints, and indexes.
- [x] **1.5 Database Seeding & Validation**
  - Create seed scripts with sample multi-tenant data (Organizations, Branches, Users, Menus, Tables) and verify query execution.

---

### Phase 2: Core Backend Foundation & Shared Infrastructure (Complete)
- [x] **2.1 Monorepo & Build Orchestration**
  - Configure pnpm workspace, Turborepo pipelines, and strict TypeScript configurations.
- [x] **2.2 Shared Validation Schemas & Domain DTOs**
  - Build Zod schemas mirroring the database tables for type-safe runtime validation.
- [x] **2.3 Database Client & Tenant-Scoped Repositories**
  - Implement query helper abstractions enforcing mandatory tenant scoping on all reads/writes.
- [x] **2.4 Authentication & RBAC Engine**
  - JWT authentication, role guards (GlobalRole & StaffRole), OTP verification services, and capability checkers.
- [x] **2.5 Middleware & Observability**
  - Global exception handling, structured JSON logger, and automated audit logging interceptor.

---

### Phase 3: Backend Domain Modules & REST/RPC APIs (Complete)
- [x] **3.1 Identity & Access Module**
  - `/auth/*` endpoints (email/password login, token refresh, password reset OTP, profile management).
- [x] **3.2 Organization, Restaurant & Branch Hierarchy Module**
  - Multi-tenant CRUD, branch settings management, operating hours, and holiday schedules.
- [x] **3.3 Staff Assignment & Granular Permissions Module**
  - Staff onboarding, role assignments per branch, permission overrides, and staff directory.
- [x] **3.4 Menu & Catalog Management Module**
  - Category ordering, item management, modifier group configuration, price delta rules, and real-time availability toggles.
- [x] **3.5 Table & Area Management Module**
  - Table configuration (capacity, shape, floor), QR token generation/regeneration, and reservation scheduling.
- [x] **3.6 Table Session & Guest Session Lifecycle Module**
  - QR code scanning, multi-guest session join flow, guest display names, and join code verification.
- [x] **3.7 Order Lifecycle & Kitchen Station Routing Module**
  - Order placement, acceptance workflows (Auto/Waiter/Manager), station routing (Kitchen vs. Bar), item price snapshotting, and status transitions.
- [x] **3.8 Billing, Split-Payment & Discount Module**
  - Bill calculation (tax, service charges, tips), split-by-item / split-by-guest / split-table logic, payment allocations, and discount application.
- [x] **3.9 Work Shift & Attendance Module**
  - Shift slot creation, staff shift scheduling, and clock-in/clock-out tracking.
- [x] **3.10 Inventory & Supplier Management Module**
  - Supplier directory, inventory category organization, stock level tracking, and low-stock alerts.
- [x] **3.11 Customer Feedback & Reviews Module**
  - Post-dining order review submission, rating capture, and staff moderation.
- [x] **3.12 Internal AI Gateway Endpoints**
  - Implement the 5 `/internal/*` endpoints defined in `docs/AI_BACKEND_INTEGRATION_SPEC.md` for AI agent tool execution.

---

### Phase 4: Realtime Engine, Notifications & Background Processing (Complete)
- [x] **4.1 Shared Realtime Event Contracts & Outbox Schema**
  - Strongly-typed event contracts (`packages/events`) for Order, Session, Payment, Staff alerts, and Notifications (`NotificationEvent`).
  - Channel definitions with role/scope access boundaries (`packages/events/src/channels.ts`).
  - Drizzle `outbox_events` schema (`packages/database/src/schema/events.ts`) and transactional `OutboxService`.
  - Database migration generated (`0001_big_arachne.sql`).
- [x] **4.2 Dedicated WebSocket Server (`apps/realtime`) & Low-Latency API Gateway (`apps/api/src/modules/realtime`)**
  - NestJS `RealtimeGateway` using `@nestjs/platform-socket.io` with JWT handshake authentication.
  - Scope and role-aware room partitioning (`branch:{id}`, `branch:{id}:{role}`, `table_session:{id}`, `user:{id}`).
  - Redis Pub/Sub subscription engine bridging worker outbox broadcasts to connected WebSocket clients.
  - Presence tracker with 30s heartbeat ping/pong.
- [x] **4.3 Background Worker & Outbox Processor (`apps/worker`)**
  - Polling outbox worker with batch fetching, status progression (PENDING -> PROCESSING -> PUBLISHED), retry backoff, and dead-letter handling.
  - Redis event publisher dispatching outbox payloads to targeted channels.
  - Scheduled background cron jobs (`IdleSessionJob` checking branch `autoCloseIdleSessionMins` and auto-abandoning idle table sessions).
- [x] **4.4 API Module Event Outbox & Realtime Integration (`apps/api`)**
  - Transactional event emission across all domain services: `OrderService` (Submitted, Accepted, Rejected, Served), `PaymentService` (Completed, Refunded), `KitchenService` (ItemStatusChanged), `TableSessionService` (SessionStarted, GuestJoined, SessionClosed), and `WaiterService` (CallAlert, Acknowledged).
- [x] **4.5 Persistent Notification Subsystem (`packages/database`, `apps/api`)**
  - Persistent `notifications` table in PostgreSQL with multi-cast role and direct user targeting.
  - REST endpoints (`/notifications`, `/notifications/unread-count`, `/notifications/:id/read`, `/notifications/mark-all-read`).
  - Realtime emission (`NOTIFICATION_CREATED`, `NOTIFICATION_READ`) with live badge counters.

---

### Phase 5: Frontend Applications & Realtime Standardization (Complete)
- [x] **5.1 Architecture Standardization across All 6 React Applications**
  - Standardized on **Redux Toolkit & RTK Query** (`rtkBaseApi`, `notificationsApi`).
  - Strict elimination of all aggressive `setInterval` polling timers across all frontends.
  - Implemented `<RealtimeBridge />` component with `socket.io-client` syncing backend room events to RTK Query cache invalidation tags (`TABLE`, `ORDER`, `ORDER_ITEM`, `PAYMENT`, `NOTIFICATION`, `DASHBOARD`).
  - Mounted `<NotificationCenter />` with real-time unread badge counter in headers across all staff portals.
- [x] **5.2 Customer QR Self-Ordering Web App (`@frontend/customer`)**
  - Realtime table session synchronization, live order waiting/tracking updates via push events, and clean zero-error production build.
- [x] **5.3 Waiter & Floor Staff Tablet/Mobile App (`@frontend/waiter`)**
  - Instant table status invalidation, order update pushes, waiter-call alerts, and live notification dock.
- [x] **5.4 Kitchen & Bar Display System (`@frontend/kitchen`)**
  - Real-time KDS line-item and ticket feed updates on order confirmation and item progress without polling.
- [x] **5.5 Cashier & POS Terminal Web App (`@frontend/cashier`)**
  - Live checkout requests, transaction feed updates, and cashier alert notifications.
- [x] **5.6 Restaurant & Branch Manager Portal (`@frontend/manager`)**
  - Real-time KDS monitoring, payment summaries, and live manager alert notifications.
- [x] **5.7 Super Admin Platform Portal (`@frontend/admin`)**
  - Global tenant state invalidation and executive notification center.


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
