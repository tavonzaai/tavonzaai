import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  evaluateRefreshToken,
  isAuthClient,
  isSessionUsable,
  refreshCookieName,
} from './token-policy';

describe('token-policy', () => {
  it('uses 7-day access and 90-day refresh lifetimes', () => {
    assert.equal(ACCESS_TOKEN_TTL_SECONDS, 7 * 24 * 3600);
    assert.equal(REFRESH_TOKEN_TTL_SECONDS, 90 * 24 * 3600);
  });

  it('names per-client refresh cookies', () => {
    assert.equal(refreshCookieName('customer'), 'tvz_rt_customer');
    assert.equal(isAuthClient('waiter'), true);
    assert.equal(isAuthClient('unknown'), false);
  });

  it('rotates a valid unused refresh token', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const decision = evaluateRefreshToken({
      record: {
        tokenHash: 'abc',
        expiresAt: new Date('2026-04-01T00:00:00Z'),
        rotatedAt: null,
      },
      session: {
        userId: 'user-1',
        expiresAt: new Date('2026-04-01T00:00:00Z'),
        revokedAt: null,
      },
      subject: 'user-1',
      presentedHash: 'abc',
      now,
    });
    assert.equal(decision.outcome, 'rotate');
  });

  it('detects reuse after the grace window', () => {
    const now = new Date('2026-01-01T00:01:00Z');
    const decision = evaluateRefreshToken({
      record: {
        tokenHash: 'abc',
        expiresAt: new Date('2026-04-01T00:00:00Z'),
        rotatedAt: new Date('2026-01-01T00:00:00Z'),
      },
      session: {
        userId: 'user-1',
        expiresAt: new Date('2026-04-01T00:00:00Z'),
        revokedAt: null,
      },
      subject: 'user-1',
      presentedHash: 'abc',
      now,
    });
    assert.equal(decision.outcome, 'reuse');
  });

  it('rejects revoked or foreign sessions', () => {
    const now = new Date();
    assert.equal(
      isSessionUsable(
        { userId: 'u1', expiresAt: new Date(Date.now() + 10000), revokedAt: new Date() },
        'u1',
        now,
      ),
      false,
    );
    assert.equal(
      isSessionUsable(
        { userId: 'u1', expiresAt: new Date(Date.now() + 10000), revokedAt: null },
        'other',
        now,
      ),
      false,
    );
  });
});
