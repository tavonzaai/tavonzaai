# Business Hierarchy

## Platform Hierarchy

```text
Platform Owner
└── Organization
    └── Restaurant
        └── Branch
            ├── Floor
            ├── Table
            ├── Staff Assignment
            ├── Menu
            ├── Customer Session
            ├── Table Session
            ├── Order
            ├── Kitchen
            └── Payment
```

## Platform Owner

The platform owner operates the SaaS platform itself.

Platform-level responsibilities may include:

- Organization provisioning
- Platform configuration
- Subscription/platform management
- Global administration
- Platform-level reporting
- System operations

Platform ownership is above tenant organization data.

## Organization

An organization is a tenant/customer of the SaaS platform.

An organization may own or manage one or more restaurants.

Tenant isolation is mandatory.

## Restaurant

A restaurant belongs to an organization.

A restaurant represents a logical restaurant business within the tenant.

## Branch

A branch is an operational physical location.

Branch-scoped operational resources include:

- Floors
- Tables
- Staff assignments
- Menus
- Customer sessions
- Table sessions
- Orders
- Kitchen operations
- Payments

## Floor

A floor groups tables within a branch.

## Table

A table is an operational customer seating resource.

A table should have a stable internal identity and an opaque QR token.

QR URLs must not expose sensitive internal identifiers.

## Staff

Staff are users/actors assigned to an organization, restaurant, and/or branch with explicit permissions and scopes.

A staff member may have different capabilities in different branches.

## Customer Session

A customer session represents the customer's browser/session identity for the ordering experience.

It is intentionally lightweight and must not require unnecessary account friction.

## Table Session & Multi-Guest Model

A table session represents a customer visit at a specific table. It is a first-class entity supporting multi-guest collaboration without collisions.

```text
Table Session
├── Host Guest Session (First Guest)
├── Guest Session 2 (Joined via QR / Code)
├── Guest Session 3 (Joined via QR / Code)
├── Orders (Individual or Together)
└── Payment Allocations (Scope: ORDER | ORDER_ITEMS | GUEST_SESSION | TABLE_SESSION)
```

## Order

An order belongs to a table session (or direct takeaway/delivery) and is associated with a specific guest session or shared table context.

Orders contain order items and progress through controlled, independent state transitions.

## Stations: Kitchen & Bar

Kitchen and Bar are operational production domains responsible for station workflow:

- `KITCHEN`: Food items prepared by `KITCHEN_STAFF`.
- `BAR`: Beverage items prepared by `BARTENDER`.

An accepted order splits items automatically by `stationType` (`KITCHEN` vs. `BAR`), and line items progress independently (`PENDING` → `PREPARING` → `READY` / `UNAVAILABLE`). Ready notifications route directly to the assigned waiter for service.

## Payment

Payment is a separate sensitive domain.

Payment may support:

- Cash
- Card
- Digital providers

Provider-specific details must remain behind payment interfaces/adapters.

## Important Separation

Business hierarchy does not determine authorization by itself.

For example:

```text
Branch #12
  ↓
Staff assignment
  ↓
Permissions
  ↓
Resource scope
```

The hierarchy provides context. Authorization decides whether an actor can perform an action.
