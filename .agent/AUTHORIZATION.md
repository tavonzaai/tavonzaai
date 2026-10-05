# Authorization

## Core Model

Authorization is capability and scope based.

The authoritative decision is:

```text
Actor
+
Permission
+
Scope
+
Resource
+
Domain Rules
```

A role may be used as a reusable permission bundle, but roles are not the final security decision. Every cell beyond fixed defaults can be adjusted through the granular `permissionActionEnum` grant system on a `StaffAssignment`.

## Role Hierarchy & Mapping

Tavonza defines two tiers of users:

1. **Platform-Level Users:**
   - `GlobalRole.SUPER_ADMIN`: Cross-organization, platform/support console. Access to client data is strictly logged, permissioned, and time-limited.
   - `GlobalRole.ADMIN` / `RESTAURANT_OWNER`: Owns the `Organization`, with full control across all brands (Restaurants) and branches under that organization.
   - `GlobalRole.CUSTOMER`: End customer, bound per visit to a `GuestSession` inside a `TableSession`.

2. **Branch-Level Staff (`StaffAssignment`):**
   - `BRANCH_MANAGER`: Assigned to a branch.
     - *Regional Manager*: Multiple `StaffAssignment` rows (one per overseen branch) with full manager permissions.
     - *General Manager / Shift Manager / Assistant Manager*: A single-branch `StaffAssignment` instantiated with specific `permissions[]` templates (e.g., Assistant Manager has no staff creation or branch settings by default).
   - `WAITER`: Time-bound `WaiterTableAssignment` at an assigned branch.
   - `BARTENDER`: Station scope `stationType = 'BAR'` at an assigned branch.
   - `KITCHEN_STAFF`: Station scope `stationType = 'KITCHEN'` at an assigned branch.
   - `CASHIER`: Payment settlement scope at an assigned branch.
   - `HOST`: Table seating and reservation greeting scope.

## Granular Permission Actions (`permissionActionEnum`)

Staff capabilities can be fine-tuned per assignment using:

```text
MANAGE_MENU
MANAGE_TABLES
MANAGE_STAFF
MANAGE_RESERVATIONS
VIEW_ORDERS
UPDATE_ORDER_STATUS
MANAGE_PAYMENTS
APPLY_DISCOUNTS
VIEW_REPORTS
MANAGE_BRANCH_SETTINGS
```

## Scope

Permissions must be evaluated against scope.

Possible scope dimensions include:

```text
Organization
Restaurant
Branch
Resource
```

More granular resource/table scope may be required for certain staff assignments.

Example:

```text
Actor: Waiter
Permission: orders.accept
Scope: Branch #12
Resource scope: Tables 1, 2, 5
```

## Central Authorization Flow

```text
Request
  ↓
Authentication
  ↓
Identify Actor
  ↓
Determine Resource
  ↓
Check Permission
  ↓
Check Scope
  ↓
Check Resource Relationship
  ↓
Check Domain Rules
  ↓
Allow / Deny
```

## Backend Authority

The backend is the final security authority.

Frontend permission checks exist for UX only.

Never trust:

- Hidden buttons
- Client-side route guards
- Browser state
- UI role checks
- Client-supplied organization IDs
- Client-supplied branch access claims

The backend must derive and validate authorization context.

## Domain Rules

Permission alone may not be sufficient.

Examples:

- A waiter may have `orders.serve` but only for an assigned branch.
- A staff member may read a resource but not mutate it.
- A payment refund may require additional policy/confirmation.
- A table session may only transition to closed after payment conditions are satisfied.

## AI Authorization

AI follows exactly the same security principles.

```text
AI Agent
  ↓
Tool
  ↓
Authorization
  ↓
Application Service
  ↓
Domain
```

AI must never bypass the normal authorization path.

## Audit

Sensitive authorization decisions and mutations should be auditable.

Relevant audit information may include:

```text
actorType
actingUserId
aiAgentId
organizationId
restaurantId
branchId
permission
resource
action
authorizationResult
timestamp
```

The final audit schema is defined during implementation and database design.
