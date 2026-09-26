# Admin Frontend

Administrative interface for Organization, Restaurant, Branch, Staff, Permissions, Menu, Configuration, and Reports.

## Architectural Principles

- The frontend is NOT a security boundary.
- All authorization decisions must be validated authoritatively by the backend.
- UI elements (e.g. action buttons, role-specific screens) reflect permissions purely for UX flow.
