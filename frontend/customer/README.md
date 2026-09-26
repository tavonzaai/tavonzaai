# Customer Frontend

Mobile-first web experience for customers accessed via table QR token (QR -> Table Session -> Menu -> Cart -> Order -> Order Tracking -> Payment).

## Architectural Principles

- The frontend is NOT a security boundary.
- All authorization decisions must be validated authoritatively by the backend.
- UI elements (e.g. action buttons, role-specific screens) reflect permissions purely for UX flow.
