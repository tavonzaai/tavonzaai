// ============================================================================
// Order access — which diner may read an order
// ============================================================================

export interface OrderOwnership {
  customerId: string | null;
  customerSessionId: string | null;
}

export interface DinerIdentity {
  customerId: string | null;
  guestSessionId: string | null;
}

/** A diner sees an order only when it was placed by their account or their own guest session. */
export function isOrderOwnedBy(order: OrderOwnership, diner: DinerIdentity): boolean {
  if (diner.customerId && order.customerId === diner.customerId) return true;
  if (diner.guestSessionId && order.customerSessionId === diner.guestSessionId) return true;
  return false;
}
