// ============================================================================
// Order Domain — Order Status & State Machine
// ============================================================================
// Instead of TypeScript `enum`, we use `as const` for the status values.
// This gives us full type safety without the rigidity of enums.
//
// The state machine (valid transitions) is a plain object — easy to read,
// easy to extend if new statuses are added later.
//
// Order Lifecycle (from Figma):
//   Customer sees:  Order Received → Preparing → Ready → Served
//   Backend tracks: DRAFT → SUBMITTED → ACCEPTED → KITCHEN_QUEUE → PREPARING → READY → SERVED
// ============================================================================

/**
 * All possible order statuses.
 * DRAFT = cart (not yet submitted by customer)
 */
export const ORDER_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'ACCEPTED',
  'REJECTED',
  'KITCHEN_QUEUE',
  'PREPARING',
  'READY',
  'SERVED',
  'CANCELLED',
] as const;

/** Type-safe order status — inferred from the array above. */
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Valid status transitions — the domain state machine.
 *
 * Read as: "An order in status X can move to [Y, Z]"
 * Example: DRAFT → SUBMITTED or CANCELLED
 *          SUBMITTED → ACCEPTED, REJECTED, or CANCELLED
 *          SERVED → nothing (terminal state)
 */
const VALID_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['KITCHEN_QUEUE', 'PREPARING', 'CANCELLED'],
  REJECTED: [], // terminal
  KITCHEN_QUEUE: ['PREPARING'],
  PREPARING: ['READY'],
  READY: ['SERVED'],
  SERVED: [], // terminal
  CANCELLED: [], // terminal
};

/** Check if a status transition is allowed by the state machine. */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Terminal states — no further transitions possible. */
export const TERMINAL_STATUSES: readonly OrderStatus[] = [
  'SERVED',
  'REJECTED',
  'CANCELLED',
];

/**
 * Customer-facing labels for the "Track Your Order" timeline.
 * Multiple backend statuses map to the same customer-visible step.
 */
const DISPLAY_LABELS: Record<OrderStatus, string> = {
  DRAFT: 'In Cart',
  SUBMITTED: 'Order Received',
  ACCEPTED: 'Order Received',
  REJECTED: 'Rejected',
  KITCHEN_QUEUE: 'Order Received',
  PREPARING: 'Preparing',
  READY: 'Ready',
  SERVED: 'Served',
  CANCELLED: 'Cancelled',
};

export function getDisplayLabel(status: OrderStatus): string {
  return DISPLAY_LABELS[status] ?? status;
}
