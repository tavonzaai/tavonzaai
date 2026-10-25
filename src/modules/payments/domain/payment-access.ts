// ============================================================================
// Payment access — who may act on a payable order / session / payment
// ============================================================================

import { isOrderOwnedBy, type DinerIdentity, type OrderOwnership } from '../../orders/domain/order-access';

export type { DinerIdentity, OrderOwnership };

export function isPaymentOrderOwnedBy(order: OrderOwnership, diner: DinerIdentity): boolean {
  return isOrderOwnedBy(order, diner);
}

/** Staff (non-customer, non-guest) actors may settle payments when they hold branch access. */
export function isStaffPaymentActor(actor: {
  role?: string | null;
  typ?: string | null;
  globalRole?: string | null;
}): boolean {
  if (actor.typ === 'guest') return false;
  const role = (actor.role || actor.globalRole || '').toUpperCase();
  if (!role || role === 'CUSTOMER') return false;
  return true;
}
