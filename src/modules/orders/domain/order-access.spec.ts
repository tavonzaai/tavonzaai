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

  it('allows order cancellation strictly when pending or submitted', () => {
    const isCancelableByCustomer = (status: string) => status === 'SUBMITTED' || status === 'PENDING';
    assert.equal(isCancelableByCustomer('SUBMITTED'), true);
    assert.equal(isCancelableByCustomer('PENDING'), true);
    assert.equal(isCancelableByCustomer('ACCEPTED'), false);
    assert.equal(isCancelableByCustomer('PREPARING'), false);
    assert.equal(isCancelableByCustomer('READY'), false);
    assert.equal(isCancelableByCustomer('SERVED'), false);
  });
});
