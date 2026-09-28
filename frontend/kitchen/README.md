# Kitchen Frontend (KDS)

Kitchen Display System (KDS) interface for cooks, station chefs, and expediters to track orders, tickets, and prep progress.

## Architectural Principles

- The frontend is NOT a security boundary.
- Real-time updates rely on WebSockets / SSE synchronized with the backend.
- Ticket completions and state transitions are validated authoritatively by the backend.
