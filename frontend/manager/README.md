# Branch Manager Frontend

Operational console for branch managers, shift monitoring, floor tables, and localized branch configuration.

## Architectural Principles

- The frontend is NOT a security boundary.
- All authorization decisions must be validated authoritatively by the backend.
- UI elements reflect branch-scoped permissions purely for UX flow.
