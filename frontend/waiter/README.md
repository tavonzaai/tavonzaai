# Waiter Floor Application

Operational mobile & tablet-friendly web interface for restaurant floor waiters to manage assigned tables, live orders, customer call alerts, and order lifecycle transitions.

## Architectural Principles

- The frontend is **NOT** a security boundary; all mutations (accepting orders, resolving alerts, marking served) are authoritatively validated by the NestJS API.
- Runs on port `3101` in local development (`pnpm --filter @frontend/waiter dev`).
- Interfaces with `@tavonza/contracts` and `@tavonza/shared` for domain types and schemas.
