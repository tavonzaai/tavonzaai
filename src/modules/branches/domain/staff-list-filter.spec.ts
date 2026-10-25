import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveStaffActiveFilter } from './staff-list-filter.ts';

type Assignment = { name: string; isActive: boolean };

const roster: Assignment[] = [
  { name: 'Active Waiter', isActive: true },
  { name: 'Inactive Host', isActive: false },
];

/** Mirrors findStaffByBranchId: an undefined isActive predicate keeps every row. */
function listStaff(status?: string): Assignment[] {
  const isActive = resolveStaffActiveFilter(status);
  if (isActive === undefined) return roster;
  return roster.filter((row) => row.isActive === isActive);
}

describe('branch staff status filter', () => {
  it('keeps the default list active-only', () => {
    assert.equal(resolveStaffActiveFilter(undefined), true);
    assert.equal(resolveStaffActiveFilter('active'), true);
    assert.deepEqual(listStaff().map((row) => row.name), ['Active Waiter']);
  });

  it('returns inactive assignments when status=all', () => {
    assert.equal(resolveStaffActiveFilter('all'), undefined);
    assert.equal(resolveStaffActiveFilter(' ALL '), undefined);
    assert.deepEqual(
      listStaff('all').map((row) => row.name),
      ['Active Waiter', 'Inactive Host'],
    );
  });

  it('returns only inactive assignments when status=inactive', () => {
    assert.equal(resolveStaffActiveFilter('inactive'), false);
    assert.deepEqual(listStaff('inactive').map((row) => row.name), ['Inactive Host']);
  });
});
