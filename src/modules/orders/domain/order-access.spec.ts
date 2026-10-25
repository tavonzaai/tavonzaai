import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isOrderOwnedBy } from './order-access.ts';

describe('order-access', () => {
  it('matches by customer account or guest session only', () => {
    assert.equal(
      isOrderOwnedBy(
        { customerId: 'c1', customerSessionId: 'g1' },
        { customerId: 'c1', guestSessionId: null },
      ),
      true,
    );
    assert.equal(
      isOrderOwnedBy(
        { customerId: null, customerSessionId: 'g1' },
        { customerId: null, guestSessionId: 'g1' },
      ),
      true,
    );
    assert.equal(
      isOrderOwnedBy(
        { customerId: 'c1', customerSessionId: 'g1' },
        { customerId: 'c2', guestSessionId: 'g2' },
      ),
      false,
    );
  });
});
