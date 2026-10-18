// ============================================================================
// Session access — who may act on a table session
// ============================================================================

export interface SessionGuestClaim {
  /** Guest session row id. */
  id?: string | null;
  guestSessionId?: string | null;
  tableSessionId?: string | null;
  customerId?: string | null;
}

export interface SessionActor {
  /** Guest / customer principal from JWT. */
  guestSessionId?: string | null;
  tableSessionId?: string | null;
  customerId?: string | null;
  sub?: string | null;
  role?: string | null;
  typ?: string | null;
  branchId?: string | null;
}

function guestId(guest: SessionGuestClaim): string | null {
  return guest.guestSessionId ?? guest.id ?? null;
}

/** True when the diner is seated in this table session (guest token claims or linked customer). */
export function isSessionParticipant(
  sessionId: string,
  actor: SessionActor,
  guests: readonly SessionGuestClaim[],
): boolean {
  if (actor.tableSessionId === sessionId) return true;

  if (actor.guestSessionId) {
    const match = guests.some(
      (guest) =>
        guestId(guest) === actor.guestSessionId &&
        (guest.tableSessionId == null || guest.tableSessionId === sessionId),
    );
    if (match) return true;
  }

  if (actor.customerId) {
    return guests.some(
      (guest) =>
        guest.customerId === actor.customerId &&
        (guest.tableSessionId == null || guest.tableSessionId === sessionId),
    );
  }

  return false;
}

export function isStaffActor(actor: SessionActor): boolean {
  const role = (actor.role || '').toUpperCase();
  if (!role || role === 'CUSTOMER') return false;
  if (actor.typ === 'guest') return false;
  return true;
}
