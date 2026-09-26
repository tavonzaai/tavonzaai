# Staff Frontend

Operational interface supporting capability-driven workflows for Waiter, Kitchen, Cashier, Bartender, and Manager.

## Architectural Principles

- The frontend is NOT a security boundary.
- All authorization decisions must be validated authoritatively by the backend.
- UI elements (e.g. action buttons, role-specific screens) reflect permissions purely for UX flow.
