# Cashier Frontend (POS)

Cashier point-of-sale interface for table settlement, split billing, payment provider integration, and receipt printing.

## Architectural Principles

- The frontend is NOT a security boundary.
- Financial transactions, discounts, and payment confirmations must be validated authoritatively by the backend.
- UI elements reflect cashier role permissions.
