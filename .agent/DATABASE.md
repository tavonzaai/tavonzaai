# Database Architecture & Comprehensive Schema Specification

## 1. Primary Database & ORM

- **Primary Database**: PostgreSQL (Relational Database)
- **Data Access & ORM**: Drizzle ORM
- **Migration Engine**: Drizzle Kit
- **Authority**: The PostgreSQL database is the single authoritative source of truth for persistent business state.

---

## 2. Multi-Tenancy & Tenant Boundaries

- **Organization** is the primary tenant boundary.
- All tenant-owned data must be explicitly associated with its organization directly or through an unbroken relationship chain:
  `Organization -> Restaurant -> Branch -> [Tables, Staff, Menu, Orders, Sessions, Inventory]`.
- Every query path must enforce tenant isolation at the repository/query layer; never rely on frontend filtering for tenant isolation.

---

## 3. Enumerated Types (PostgreSQL Enums)

All enums are managed natively in PostgreSQL and declared as Drizzle `pgEnum`:

```typescript
// Role & Identity Enums
export const globalRoleEnum = pgEnum('global_role', [
  'SUPER_ADMIN', // Platform-level super admin with cross-tenant access
  'ADMIN',       // Organization owner / restaurant admin
  'STAFF',       // Branch staff (waiter, kitchen, cashier, manager, host)
  'CUSTOMER'     // End-user restaurant customer
]);

export const staffRoleEnum = pgEnum('staff_role', [
  'BRANCH_MANAGER',
  'HOST',
  'WAITER',
  'KITCHEN_STAFF',
  'BARTENDER',
  'CASHIER'
]);

export const userStatusEnum = pgEnum('user_status', [
  'ACTIVE',
  'INACTIVE',
  'BANNED',
  'DELETED'
]);

export const permissionActionEnum = pgEnum('permission_action', [
  'MANAGE_MENU',
  'MANAGE_TABLES',
  'MANAGE_STAFF',
  'MANAGE_RESERVATIONS',
  'VIEW_ORDERS',
  'UPDATE_ORDER_STATUS',
  'MANAGE_PAYMENTS',
  'APPLY_DISCOUNTS',
  'VIEW_REPORTS',
  'MANAGE_BRANCH_SETTINGS'
]);

// Table & Physical Space Enums
export const tableServiceStatusEnum = pgEnum('table_service_status', [
  'AVAILABLE',       // Open for seating
  'OCCUPIED',        // Customer seated / authenticated, no order placed yet
  'ORDERING',        // Cart being built / order awaiting acceptance
  'PREPARING',       // Order accepted, food/drink being prepared
  'SERVING',         // Items ready or currently being delivered to table
  'PAYMENT_PENDING', // All items served, awaiting bill settlement
  'CLOSING'          // Paid, staff clearing and sanitizing table
]);

export const tableOperationalFlagEnum = pgEnum('table_operational_flag', [
  'NORMAL',
  'RESERVED',
  'CLEANING',
  'OUT_OF_SERVICE'
]);

export const shapeEnum = pgEnum('table_shape', [
  'CIRCLE',
  'SQUARE',
  'RECTANGLE',
  'TRIANGLE',
  'HEXAGON'
]);

// Session Lifecycle Enums
export const tableSessionStatusEnum = pgEnum('table_session_status', [
  'ACTIVE',          // Table is active; guests can join, order, and pay
  'BILL_REQUESTED',  // Bill requested; ordering may still continue
  'CLOSING',         // Settled, staff clearing table
  'COMPLETED',       // Session completed and closed
  'ABANDONED'        // Terminated due to no-show / abandonment
]);

export const guestSessionStatusEnum = pgEnum('guest_session_status', [
  'ACTIVE',          // Guest actively ordering / dining
  'LEFT',            // Guest left or settled their tab early
  'CLOSED'           // Closed together with the table session
]);

// Order & Production Enums
export const orderChannelEnum = pgEnum('order_channel', [
  'DINE_IN',
  'QR_SELF_ORDER',
  'POS',
  'SELF_SERVICE_KIOSK',
  'TAKEAWAY',
  'DELIVERY',
  'MOBILE_APP',
  'WEB'
]);

export const orderAcceptanceModeEnum = pgEnum('order_acceptance_mode', [
  'AUTO_ACCEPT',     // Order routed directly to production
  'WAITER_APPROVAL', // Waiter reviews and accepts (default)
  'MANAGER_APPROVAL' // Branch manager reviews exceptional workflows
]);

export const orderRejectionReasonEnum = pgEnum('order_rejection_reason', [
  'ITEM_UNAVAILABLE',
  'KITCHEN_CAPACITY',
  'MODIFICATION_IMPOSSIBLE',
  'ALLERGY_CONCERN',
  'RESTAURANT_CLOSING',
  'OTHER'
]);

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',         // Placed, awaiting waiter/branch acceptance
  'CONFIRMED',       // Accepted by staff, sent to preparation
  'PREPARING',       // Under preparation in kitchen/bar
  'READY',           // Ready for pickup or table delivery
  'SERVED',          // Delivered to table
  'COMPLETED',       // Consumed, paid & finalized
  'CANCELLED',       // Cancelled prior to fulfillment
  'REJECTED'         // Rejected by staff with reason
]);

export const orderItemStatusEnum = pgEnum('order_item_status', [
  'PENDING',
  'PREPARING',
  'READY',
  'SERVED',
  'UNAVAILABLE',
  'CANCELLED'
]);

export const stationTypeEnum = pgEnum('station_type', [
  'KITCHEN',
  'BAR'
]);

// Payment & Financial Enums
export const paymentStatusEnum = pgEnum('payment_status', [
  'UNPAID',
  'PARTIALLY_PAID',
  'PAID',
  'REFUNDED',
  'FAILED'
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'CASH',
  'CARD',
  'MOBILE_WALLET',
  'ONLINE_GATEWAY'
]);

export const paymentScopeEnum = pgEnum('payment_scope', [
  'ORDER',         // Settles an individual order in full
  'ORDER_ITEMS',   // Settles specific items (split by item)
  'GUEST_SESSION', // Settles everything one guest ordered
  'TABLE_SESSION'  // Settles the entire table tab
]);

export const discountTypeEnum = pgEnum('discount_type', [
  'PERCENTAGE',
  'FIXED_AMOUNT'
]);

// Operational & Logistics Enums
export const reservationStatusEnum = pgEnum('reservation_status', [
  'PENDING',
  'CONFIRMED',
  'SEATED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
]);

export const shiftSlotStatusEnum = pgEnum('shift_slot_status', [
  'ACTIVE',
  'INACTIVE'
]);

export const inventoryUnitEnum = pgEnum('inventory_unit', [
  'KG',
  'GRAM',
  'LITER',
  'ML',
  'PIECE',
  'BOX',
  'PACKET'
]);

export const otpPurposeEnum = pgEnum('otp_purpose', [
  'TABLE_AUTH',
  'PASSWORD_RESET'
]);
```

---

## 4. Composite Types & Structured JSON Schemas

### Address Object Structure
Used in branches, suppliers, customers, and orders:
```typescript
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  lat?: number;
  lng?: number;
}
```

---

## 5. Comprehensive Table & Relation Definitions

### 5.1 Multi-Tenant Organization & Hierarchy

#### `organizations`
- `id` (UUID, PK, default gen_random_uuid())
- `name` (VARCHAR(255), NOT NULL)
- `ownerId` (UUID, NOT NULL, FK -> users.id)
- `slug` (VARCHAR(255), UNIQUE, NOT NULL)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())

#### `restaurants`
- `id` (UUID, PK, default gen_random_uuid())
- `organizationId` (UUID, NOT NULL, FK -> organizations.id, ON DELETE CASCADE)
- `name` (VARCHAR(255), NOT NULL)
- `slug` (VARCHAR(255), UNIQUE, NOT NULL)
- `logoUrl` (TEXT)
- `description` (TEXT)
- `isActive` (BOOLEAN, default true)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(organizationId)`

#### `branches`
- `id` (UUID, PK, default gen_random_uuid())
- `restaurantId` (UUID, NOT NULL, FK -> restaurants.id, ON DELETE CASCADE)
- `name` (VARCHAR(255), NOT NULL)
- `address` (JSONB, NOT NULL)
- `phone` (VARCHAR(50))
- `timezone` (VARCHAR(50), default 'UTC')
- `isActive` (BOOLEAN, default true)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(restaurantId)`

#### `branch_settings`
- `id` (UUID, PK, default gen_random_uuid())
- `branchId` (UUID, UNIQUE, NOT NULL, FK -> branches.id, ON DELETE CASCADE)
- `orderAcceptanceMode` (order_acceptance_mode, default 'WAITER_APPROVAL')
- `backupAccepterRoles` (staff_role[], array of roles who can accept if waiter unavailable)
- `hideUnavailableItems` (BOOLEAN, default false)
- `allowMultipleGuestSessions` (BOOLEAN, default true)
- `requireOtpPerGuest` (BOOLEAN, default true)
- `allowSplitBill` (BOOLEAN, default true)
- `allowGuestCheckoutWithoutAccount` (BOOLEAN, default true)
- `autoCloseIdleSessionMins` (INTEGER)
- `currency` (VARCHAR(10), default 'USD')
- `taxPercent` (DOUBLE PRECISION, default 0)
- `serviceChargePct` (DOUBLE PRECISION, default 0)
- `tipEnabled` (BOOLEAN, default true)
- `reservationsEnabled` (BOOLEAN, default true)
- `waitlistEnabled` (BOOLEAN, default true)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())

---

### 5.2 Users, Staff & RBAC

#### `users`
- `id` (UUID, PK, default gen_random_uuid())
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `contactNo` (VARCHAR(50), UNIQUE)
- `password` (VARCHAR(255))
- `fcmToken` (TEXT)
- `name` (VARCHAR(255), NOT NULL)
- `role` (global_role, default 'CUSTOMER')
- `avatar` (TEXT)
- `status` (user_status, default 'ACTIVE')
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(role)`

#### `admins`
- `id` (UUID, PK, default gen_random_uuid())
- `userId` (UUID, UNIQUE, NOT NULL, FK -> users.id, ON DELETE CASCADE)
- `intro` (TEXT, default '')
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())

#### `staff`
- `id` (UUID, PK, default gen_random_uuid())
- `userId` (UUID, UNIQUE, NOT NULL, FK -> users.id, ON DELETE CASCADE)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())

#### `owners`
- `id` (UUID, PK, default gen_random_uuid())
- `userId` (UUID, UNIQUE, NOT NULL, FK -> users.id, ON DELETE CASCADE)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())

#### `customers`
- `id` (UUID, PK, default gen_random_uuid())
- `userId` (UUID, UNIQUE, NOT NULL, FK -> users.id, ON DELETE CASCADE)
- `defaultAddress` (JSONB)
- `loyaltyPoints` (INTEGER, default 0)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())

#### `staff_assignments`
- `id` (UUID, PK, default gen_random_uuid())
- `staffId` (UUID, NOT NULL, FK -> staff.id, ON DELETE CASCADE)
- `branchId` (UUID, NOT NULL, FK -> branches.id, ON DELETE CASCADE)
- `role` (staff_role, NOT NULL)
- `permissions` (permission_action[], NOT NULL default [])
- `isActive` (BOOLEAN, default true)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Constraints*: `UNIQUE(staffId, branchId)`
- *Indexes*: `(branchId)`

---

### 5.3 Menu & Catalog

#### `menu_categories`
- `id` (UUID, PK, default gen_random_uuid())
- `restaurantId` (UUID, NOT NULL, FK -> restaurants.id, ON DELETE CASCADE)
- `name` (VARCHAR(255), NOT NULL)
- `description` (TEXT)
- `displayOrder` (INTEGER, default 0)
- `isActive` (BOOLEAN, default true)
- *Indexes*: `(restaurantId)`

#### `menu_items`
- `id` (UUID, PK, default gen_random_uuid())
- `restaurantId` (UUID, NOT NULL, FK -> restaurants.id, ON DELETE CASCADE)
- `categoryId` (UUID, NOT NULL, FK -> menu_categories.id, ON DELETE RESTRICT)
- `name` (VARCHAR(255), NOT NULL)
- `description` (TEXT)
- `imageUrl` (TEXT)
- `basePrice` (DOUBLE PRECISION, NOT NULL)
- `isAvailable` (BOOLEAN, default true)
- `isVegetarian` (BOOLEAN, default false)
- `spiceLevel` (INTEGER) // 0-3
- `displayOrder` (INTEGER, default 0)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(restaurantId)`, `(categoryId)`

#### `modifier_groups`
- `id` (UUID, PK, default gen_random_uuid())
- `menuItemId` (UUID, NOT NULL, FK -> menu_items.id, ON DELETE CASCADE)
- `name` (VARCHAR(255), NOT NULL) // e.g. "Size", "Toppings"
- `isRequired` (BOOLEAN, default false)
- `minSelect` (INTEGER, default 0)
- `maxSelect` (INTEGER, default 1)
- *Indexes*: `(menuItemId)`

#### `modifiers`
- `id` (UUID, PK, default gen_random_uuid())
- `modifierGroupId` (UUID, NOT NULL, FK -> modifier_groups.id, ON DELETE CASCADE)
- `name` (VARCHAR(255), NOT NULL) // e.g. "Large", "Extra Cheese"
- `priceDelta` (DOUBLE PRECISION, default 0)
- `isAvailable` (BOOLEAN, default true)
- *Indexes*: `(modifierGroupId)`

---

### 5.4 Tables, Floor & Reservations

#### `tables`
- `id` (UUID, PK, default gen_random_uuid())
- `branchId` (UUID, NOT NULL, FK -> branches.id, ON DELETE CASCADE)
- `label` (VARCHAR(50), NOT NULL) // e.g. "T-12", "Patio 3"
- `capacity` (INTEGER, NOT NULL)
- `serviceStatus` (table_service_status, default 'AVAILABLE')
- `operationalFlag` (table_operational_flag, default 'NORMAL')
- `qrCodeToken` (VARCHAR(255), UNIQUE)
- `shape` (table_shape, default 'SQUARE')
- `floor` (INTEGER, default 1)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(branchId)`, `(branchId, serviceStatus)`

#### `reservations`
- `id` (UUID, PK, default gen_random_uuid())
- `branchId` (UUID, NOT NULL, FK -> branches.id, ON DELETE CASCADE)
- `tableId` (UUID, FK -> tables.id, ON DELETE SET NULL)
- `customerId` (UUID, FK -> customers.id, ON DELETE SET NULL)
- `tableSessionId` (UUID, UNIQUE, FK -> table_sessions.id, ON DELETE SET NULL)
- `guestName` (VARCHAR(255), NOT NULL)
- `guestPhone` (VARCHAR(50), NOT NULL)
- `partySize` (INTEGER, NOT NULL)
- `reservedFor` (TIMESTAMPTZ, NOT NULL)
- `durationMins` (INTEGER, default 90)
- `status` (reservation_status, default 'PENDING')
- `specialRequest` (TEXT)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(branchId, reservedFor)`, `(tableId)`, `(status)`

#### `waiter_table_assignments`
- `id` (UUID, PK, default gen_random_uuid())
- `branchId` (UUID, NOT NULL, FK -> branches.id, ON DELETE RESTRICT)
- `tableId` (UUID, NOT NULL, FK -> tables.id, ON DELETE RESTRICT)
- `waiterId` (UUID, NOT NULL, FK -> staff.id, ON DELETE RESTRICT)
- `assignedById` (UUID, NOT NULL, FK -> staff.id, ON DELETE RESTRICT)
- `sessionStart` (TIMESTAMPTZ, NOT NULL)
- `sessionEnd` (TIMESTAMPTZ, NOT NULL)
- `isActive` (BOOLEAN, default true)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(tableId, sessionStart, sessionEnd)`, `(waiterId, sessionStart)`

---

### 5.5 Table Sessions & Multi-Guest Sessions

#### `table_sessions`
- `id` (UUID, PK, default gen_random_uuid())
- `tableId` (UUID, NOT NULL, FK -> tables.id, ON DELETE CASCADE)
- `branchId` (UUID, NOT NULL, FK -> branches.id, ON DELETE CASCADE)
- `joinCode` (VARCHAR(20))
- `partySize` (INTEGER)
- `startedAt` (TIMESTAMPTZ, default now())
- `endedAt` (TIMESTAMPTZ)
- `status` (table_session_status, default 'ACTIVE')
- `openedByStaffId` (UUID, FK -> staff.id, ON DELETE SET NULL)
- `closedByStaffId` (UUID, FK -> staff.id, ON DELETE SET NULL)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(tableId, status)`, `(branchId, status)`

#### `guest_sessions`
- `id` (UUID, PK, default gen_random_uuid())
- `tableSessionId` (UUID, NOT NULL, FK -> table_sessions.id, ON DELETE CASCADE)
- `customerId` (UUID, FK -> customers.id, ON DELETE SET NULL)
- `displayName` (VARCHAR(100)) // "Guest 1", "Euhan"
- `contact` (VARCHAR(100))     // Email or phone
- `seatLabel` (VARCHAR(50))
- `otpVerifiedAt` (TIMESTAMPTZ)
- `isHostGuest` (BOOLEAN, default false)
- `joinedAt` (TIMESTAMPTZ, default now())
- `leftAt` (TIMESTAMPTZ)
- `status` (guest_session_status, default 'ACTIVE')
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(tableSessionId, status)`, `(customerId)`

---

### 5.6 Orders & Line Items

#### `orders`
- `id` (UUID, PK, default gen_random_uuid())
- `orderNumber` (VARCHAR(50), UNIQUE, NOT NULL)
- `branchId` (UUID, NOT NULL, FK -> branches.id, ON DELETE CASCADE)
- `tableId` (UUID, FK -> tables.id, ON DELETE SET NULL)
- `customerId` (UUID, FK -> customers.id, ON DELETE SET NULL)
- `tableSessionId` (UUID, FK -> table_sessions.id, ON DELETE SET NULL)
- `guestSessionId` (UUID, FK -> guest_sessions.id, ON DELETE SET NULL)
- `channel` (order_channel, default 'DINE_IN')
- `status` (order_status, default 'PENDING')
- `subtotal` (DOUBLE PRECISION, NOT NULL)
- `discountAmount` (DOUBLE PRECISION, default 0)
- `taxAmount` (DOUBLE PRECISION, default 0)
- `serviceCharge` (DOUBLE PRECISION, default 0)
- `tipAmount` (DOUBLE PRECISION, default 0)
- `totalAmount` (DOUBLE PRECISION, NOT NULL)
- `paymentStatus` (payment_status, default 'UNPAID')
- `amountPaid` (DOUBLE PRECISION, default 0)
- `discountId` (UUID, FK -> discounts.id, ON DELETE SET NULL)
- `discountCodeSnapshot` (VARCHAR(50))
- `discountAppliedById` (UUID, FK -> staff.id, ON DELETE SET NULL)
- `waiterAssignmentId` (UUID, FK -> waiter_table_assignments.id, ON DELETE SET NULL)
- `acceptanceMode` (order_acceptance_mode, default 'WAITER_APPROVAL')
- `acceptedById` (UUID, FK -> staff.id, ON DELETE SET NULL)
- `acceptedAt` (TIMESTAMPTZ)
- `rejectedById` (UUID, FK -> staff.id, ON DELETE SET NULL)
- `rejectedAt` (TIMESTAMPTZ)
- `rejectionReasonCode` (order_rejection_reason)
- `rejectionReason` (TEXT)
- `placedByStaffId` (UUID, FK -> staff.id, ON DELETE SET NULL)
- `specialInstructions` (TEXT)
- `resubmittedFromId` (UUID, FK -> orders.id, ON DELETE SET NULL)
- `guestName` (VARCHAR(255))
- `guestPhone` (VARCHAR(50))
- `deliveryAddress` (JSONB)
- `pickupAt` (TIMESTAMPTZ)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(branchId, status)`, `(tableId)`, `(customerId)`, `(tableSessionId)`, `(guestSessionId)`, `(createdAt)`

#### `order_items`
- `id` (UUID, PK, default gen_random_uuid())
- `orderId` (UUID, NOT NULL, FK -> orders.id, ON DELETE CASCADE)
- `productId` (UUID, NOT NULL, FK -> menu_items.id, ON DELETE RESTRICT)
- `productNameSnapshot` (VARCHAR(255), NOT NULL)
- `unitPrice` (DOUBLE PRECISION, NOT NULL)
- `quantity` (INTEGER, NOT NULL)
- `subtotal` (DOUBLE PRECISION, NOT NULL)
- `stationType` (station_type, NOT NULL)
- `status` (order_item_status, default 'PENDING')
- `preparingAt` (TIMESTAMPTZ)
- `readyAt` (TIMESTAMPTZ)
- `servedAt` (TIMESTAMPTZ)
- `unavailableReason` (TEXT)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(orderId, status)`, `(orderId, stationType, status)`

---

### 5.7 Billing, Split Payments & Allocations

#### `payments`
- `id` (UUID, PK, default gen_random_uuid())
- `orderId` (UUID, FK -> orders.id, ON DELETE SET NULL)
- `tableSessionId` (UUID, FK -> table_sessions.id, ON DELETE SET NULL)
- `payerGuestSessionId` (UUID, FK -> guest_sessions.id, ON DELETE SET NULL)
- `paidForGuestIds` (UUID[], default [])
- `scope` (payment_scope, default 'ORDER')
- `amount` (DOUBLE PRECISION, NOT NULL)
- `tipAmount` (DOUBLE PRECISION, default 0)
- `method` (payment_method, NOT NULL)
- `status` (payment_status, default 'UNPAID')
- `transactionRef` (VARCHAR(255))
- `paidAt` (TIMESTAMPTZ)
- `settledById` (UUID, FK -> staff.id, ON DELETE SET NULL)
- `collectedById` (UUID, FK -> staff.id, ON DELETE SET NULL)
- `refundedAt` (TIMESTAMPTZ)
- `refundRef` (VARCHAR(255))
- `refundAmount` (DOUBLE PRECISION)
- `createdAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(orderId)`, `(tableSessionId)`, `(payerGuestSessionId)`, `(status)`

#### `payment_allocations`
- `id` (UUID, PK, default gen_random_uuid())
- `paymentId` (UUID, NOT NULL, FK -> payments.id, ON DELETE CASCADE)
- `orderId` (UUID, FK -> orders.id, ON DELETE SET NULL)
- `orderItemId` (UUID, FK -> order_items.id, ON DELETE SET NULL)
- `amount` (DOUBLE PRECISION, NOT NULL)
- `createdAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(paymentId)`, `(orderId)`, `(orderItemId)`

#### `discounts`
- `id` (UUID, PK, default gen_random_uuid())
- `code` (VARCHAR(50), UNIQUE, NOT NULL)
- `type` (discount_type, NOT NULL)
- `value` (DOUBLE PRECISION, NOT NULL)
- `isActive` (BOOLEAN, default true)
- `validFrom` (TIMESTAMPTZ)
- `validUntil` (TIMESTAMPTZ)
- `usageLimit` (INTEGER)
- `timesUsed` (INTEGER, default 0)

---

### 5.8 Operations, Shifts & Inventory

#### `work_shifts`
- `id` (UUID, PK, default gen_random_uuid())
- `branchId` (UUID, NOT NULL, FK -> branches.id, ON DELETE CASCADE)
- `staffAssignmentId` (UUID, NOT NULL, FK -> staff_assignments.id, ON DELETE CASCADE)
- `name` (VARCHAR(100), NOT NULL) // "Morning Shift"
- `startTime` (TIMESTAMPTZ, NOT NULL)
- `endTime` (TIMESTAMPTZ, NOT NULL)
- `durationMin` (INTEGER, default 480)
- `date` (DATE, NOT NULL)
- `status` (shift_slot_status, default 'ACTIVE')
- `checkInAt` (TIMESTAMPTZ)
- `checkOutAt` (TIMESTAMPTZ)
- `note` (TEXT)
- `createdById` (UUID, NOT NULL, FK -> staff.id, ON DELETE RESTRICT)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Constraints*: `UNIQUE(staffAssignmentId, date, startTime)`
- *Indexes*: `(branchId)`, `(branchId, date)`, `(branchId, status)`, `(staffAssignmentId, date)`

#### `suppliers`
- `id` (UUID, PK, default gen_random_uuid())
- `branchId` (UUID, NOT NULL, FK -> branches.id, ON DELETE CASCADE)
- `name` (VARCHAR(255), NOT NULL)
- `contactName` (VARCHAR(255))
- `email` (VARCHAR(255))
- `phone` (VARCHAR(50))
- `address` (JSONB)
- `isActive` (BOOLEAN, default true)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(branchId)`, `(branchId, isActive)`

#### `inventory_categories`
- `id` (UUID, PK, default gen_random_uuid())
- `name` (VARCHAR(255), NOT NULL)
- `description` (TEXT)
- `branchId` (UUID, NOT NULL, FK -> branches.id, ON DELETE CASCADE)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(branchId)`

#### `inventory_items`
- `id` (UUID, PK, default gen_random_uuid())
- `branchId` (UUID, NOT NULL, FK -> branches.id, ON DELETE CASCADE)
- `supplierId` (UUID, NOT NULL, FK -> suppliers.id, ON DELETE RESTRICT)
- `categoryId` (UUID, NOT NULL, FK -> inventory_categories.id, ON DELETE RESTRICT)
- `name` (VARCHAR(255), NOT NULL)
- `sku` (VARCHAR(100))
- `unit` (inventory_unit, NOT NULL)
- `currentStock` (DOUBLE PRECISION, default 0)
- `lowStockThreshold` (DOUBLE PRECISION)
- `costPerUnit` (DOUBLE PRECISION)
- `isActive` (BOOLEAN, default true)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(branchId)`, `(supplierId)`, `(branchId, isActive)`

---

### 5.9 Audit, Reviews & State Logs

#### `audit_logs`
- `id` (UUID, PK, default gen_random_uuid())
- `branchId` (UUID, FK -> branches.id, ON DELETE SET NULL)
- `actorId` (UUID, NOT NULL, FK -> users.id, ON DELETE RESTRICT)
- `action` (VARCHAR(255), NOT NULL) // "ORDER_STATUS_UPDATED", "MENU_ITEM_EDITED"
- `entityType` (VARCHAR(100), NOT NULL) // "Order", "MenuItem"
- `entityId` (UUID, NOT NULL)
- `metadata` (JSONB)
- `createdAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(branchId)`, `(actorId)`, `(entityType, entityId)`

#### `order_reviews`
- `id` (UUID, PK, default gen_random_uuid())
- `orderId` (UUID, UNIQUE, NOT NULL, FK -> orders.id, ON DELETE CASCADE)
- `customerId` (UUID, NOT NULL, FK -> customers.id, ON DELETE CASCADE)
- `rating` (INTEGER, NOT NULL) // 1-5
- `comment` (TEXT)
- `isApproved` (BOOLEAN, default false)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(customerId)`

#### `status_change_logs`
- `id` (UUID, PK, default gen_random_uuid())
- `orderId` (UUID, NOT NULL, FK -> orders.id, ON DELETE CASCADE)
- `previousStatus` (order_status, NOT NULL)
- `newStatus` (order_status, NOT NULL)
- `changedById` (UUID, NOT NULL, FK -> users.id, ON DELETE RESTRICT)
- `note` (TEXT)
- `createdAt` (TIMESTAMPTZ, default now())

#### `order_item_status_change_logs`
- `id` (UUID, PK, default gen_random_uuid())
- `orderItemId` (UUID, NOT NULL, FK -> order_items.id, ON DELETE CASCADE)
- `previousStatus` (order_item_status, NOT NULL)
- `newStatus` (order_item_status, NOT NULL)
- `changedById` (UUID, FK -> users.id, ON DELETE SET NULL)
- `note` (TEXT)
- `createdAt` (TIMESTAMPTZ, default now())

---

### 5.10 Operational Hours & Authentication OTPs

#### `branch_operating_hours`
- `id` (UUID, PK, default gen_random_uuid())
- `branchId` (UUID, NOT NULL, FK -> branches.id, ON DELETE CASCADE)
- `dayOfWeek` (INTEGER, NOT NULL) // 0 = Sunday, 6 = Saturday
- `openTime` (VARCHAR(10), NOT NULL) // "11:00" (HH:mm)
- `closeTime` (VARCHAR(10), NOT NULL) // "23:00" (HH:mm)
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(branchId)`

#### `branch_holidays`
- `id` (UUID, PK, default gen_random_uuid())
- `branchId` (UUID, NOT NULL, FK -> branches.id, ON DELETE CASCADE)
- `date` (DATE, NOT NULL)
- `isClosed` (BOOLEAN, default true)
- `label` (VARCHAR(255))
- `openTime` (VARCHAR(10))
- `closeTime` (VARCHAR(10))
- `createdAt` (TIMESTAMPTZ, default now())
- `updatedAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(branchId, date)`

#### `password_reset_otps`
- `id` (UUID, PK, default gen_random_uuid())
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `otp` (VARCHAR(20), NOT NULL)
- `expiresAt` (TIMESTAMPTZ, NOT NULL)
- `createdAt` (TIMESTAMPTZ, default now())

#### `table_auth_otps`
- `id` (UUID, PK, default gen_random_uuid())
- `contact` (VARCHAR(100), NOT NULL)
- `tableId` (UUID, NOT NULL, FK -> tables.id, ON DELETE CASCADE)
- `tableSessionId` (UUID, FK -> table_sessions.id, ON DELETE SET NULL)
- `purpose` (otp_purpose, default 'TABLE_AUTH')
- `otp` (VARCHAR(20), NOT NULL)
- `expiresAt` (TIMESTAMPTZ, NOT NULL)
- `verified` (BOOLEAN, default false)
- `createdAt` (TIMESTAMPTZ, default now())
- *Indexes*: `(contact, tableId)`, `(tableSessionId)`

---

## 6. Critical Business Rules & Invariants

1. **Table Session vs. Guest Session**:
   - A table has at most one `ACTIVE` `TableSession` at any point in time.
   - Multiple guests scanning the same QR code join the same `TableSession` as distinct `GuestSession` records.
   - Guests can order independently, and their items are tracked by `guestSessionId`.
2. **Order Price & Name Snapshots**:
   - `OrderItem` must store `productNameSnapshot` and `unitPrice` at the exact moment of order placement. Changes to `MenuItem.basePrice` or name never alter past orders.
3. **Split Bill Invariant**:
   - `PaymentAllocation` ensures auditability: for any given payment, $\sum \text{allocations.amount} == \text{payment.amount}$.
4. **Order Status Progression**:
   - `PENDING -> CONFIRMED -> PREPARING -> READY -> SERVED -> COMPLETED`.
   - Rejection is only valid from `PENDING` and must record `rejectionReasonCode` and `rejectedById`.
5. **Kitchen Station Routing**:
   - `OrderItem.stationType` (`KITCHEN` or `BAR`) allows kitchen screens to filter and update line items independently without modifying the entire order.
6. **Outbox Pattern for Events**:
   - Database transactions publishing events must commit an `outbox` record in the same transaction to guarantee reliable delivery.
