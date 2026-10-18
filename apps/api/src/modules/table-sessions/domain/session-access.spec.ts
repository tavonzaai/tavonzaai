import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isSessionParticipant, isStaffActor } from './session-access.ts';

describe('session-access', () => {
  const sessionId = 'sess-1';
  const guests = [
    { id: 'guest-1', tableSessionId: sessionId, customerId: 'cust-1' },
    { id: 'guest-2', tableSessionId: sessionId, customerId: null },
  ];

  it('allows guest token claims and linked customers', () => {
    assert.equal(
      isSessionParticipant(sessionId, { tableSessionId: sessionId }, guests),
      true,
    );
    assert.equal(
      isSessionParticipant(sessionId, { guestSessionId: 'guest-1' }, guests),
      true,
    );
    assert.equal(
      isSessionParticipant(sessionId, { customerId: 'cust-1' }, guests),
      true,
    );
    assert.equal(
      isSessionParticipant(sessionId, { guestSessionId: 'other' }, guests),
      false,
    );
  });

  it('treats only non-customer, non-guest roles as staff', () => {
    assert.equal(isStaffActor({ role: 'WAITER' }), true);
    assert.equal(isStaffActor({ role: 'CUSTOMER' }), false);
    assert.equal(isStaffActor({ role: 'WAITER', typ: 'guest' }), false);
  });
});
