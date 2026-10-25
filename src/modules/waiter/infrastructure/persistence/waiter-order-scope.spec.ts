/**
 * Documents waiter order scoping rules: assigned tables only.
 * Mirrors findOrdersForTables guard logic.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

function resolveScopedTableIds(
  assignedTableIds: string[],
  filters: { scope?: string; tableId?: string },
): string[] | 'empty' {
  const assignedIds = [...new Set(assignedTableIds.filter(Boolean))];
  if (assignedIds.length === 0) return 'empty';

  // ALL_TABLES must never expand scope beyond assignments
  if (filters.tableId) {
    return assignedIds.includes(filters.tableId) ? [filters.tableId] : 'empty';
  }
  return assignedIds;
}

describe('waiter order table scope', () => {
  it('returns no orders when waiter has zero assignments', () => {
    assert.equal(resolveScopedTableIds([], {}), 'empty');
    assert.equal(resolveScopedTableIds([], { scope: 'ALL_TABLES' }), 'empty');
  });

  it('always limits to assigned tables even if ALL_TABLES is requested', () => {
    const scoped = resolveScopedTableIds(['t1', 't2'], { scope: 'ALL_TABLES' });
    assert.deepEqual(scoped, ['t1', 't2']);
  });

  it('rejects tableId filter outside the waiter assignment set', () => {
    assert.equal(
      resolveScopedTableIds(['t1', 't2'], { tableId: 't3' }),
      'empty',
    );
  });

  it('allows tableId only when it is assigned to the waiter', () => {
    assert.deepEqual(
      resolveScopedTableIds(['t1', 't2'], { tableId: 't2' }),
      ['t2'],
    );
  });
});
