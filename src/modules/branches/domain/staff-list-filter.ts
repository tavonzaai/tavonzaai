/**
 * Maps GET /branches/:id/staff?status= to the assignment isActive predicate.
 * `undefined` means "do not filter", so inactive assignments stay in the result.
 * Missing or unknown values stay on the historical default: active only.
 */
export function resolveStaffActiveFilter(status?: string): boolean | undefined {
  const normalized = status?.trim().toLowerCase();
  if (normalized === 'all') return undefined;
  if (normalized === 'inactive') return false;
  return true;
}
