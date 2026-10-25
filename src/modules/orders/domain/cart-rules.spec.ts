import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assertIdempotencyKey,
  assertItemOrderable,
  assertSameBranch,
  buildLineKey,
  computeTotals,
  priceLine,
  resolveModifiers,
  CartRuleError,
} from './cart-rules.ts';

const item = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Burger',
  basePrice: 10,
  isAvailable: true,
  isStockTracked: true,
  stockQuantity: 5,
  restaurantId: 'rest-1',
};

describe('cart-rules', () => {
  it('builds a stable line key for the same modifiers in any order', () => {
    const a = buildLineKey(item.id, ['b', 'a'], 'note');
    const b = buildLineKey(item.id, ['a', 'b'], 'note');
    assert.equal(a, b);
  });

  it('rejects unavailable or out-of-stock items', () => {
    assert.throws(
      () => assertItemOrderable({ ...item, isAvailable: false }, 1),
      (err: unknown) => err instanceof CartRuleError && err.code === 'ITEM_UNAVAILABLE',
    );
    assert.throws(
      () => assertItemOrderable(item, 6),
      (err: unknown) => err instanceof CartRuleError && err.code === 'INSUFFICIENT_STOCK',
    );
  });

  it('prices lines from catalog and rejects foreign modifiers', () => {
    const mods = [
      {
        id: 'm1',
        name: 'Cheese',
        priceDelta: 1.5,
        isAvailable: true,
        menuItemId: item.id,
        groupName: 'Add-ons',
      },
    ];
    const priced = priceLine(item, resolveModifiers(item, ['m1'], mods), 2);
    assert.equal(priced.unitPrice, 11.5);
    assert.equal(priced.lineTotal, 23);
    assert.throws(() => resolveModifiers(item, ['other'], mods), CartRuleError);
  });

  it('pins a cart to one branch while it has items', () => {
    assert.throws(
      () => assertSameBranch('branch-a', true, 'branch-b'),
      (err: unknown) => err instanceof CartRuleError && err.code === 'BRANCH_MISMATCH',
    );
    assert.doesNotThrow(() => assertSameBranch(null, false, 'branch-b'));
  });

  it('requires a well-formed idempotency key', () => {
    assert.throws(() => assertIdempotencyKey('short'), CartRuleError);
    assert.equal(assertIdempotencyKey('ord_abcdefghijklmnop'), 'ord_abcdefghijklmnop');
  });

  it('computes tax and service charge from rates', () => {
    const totals = computeTotals(100, { taxPercent: 8, serviceChargePercent: 5 });
    assert.equal(totals.tax, 8);
    assert.equal(totals.serviceCharge, 5);
    assert.equal(totals.total, 113);
  });
});
