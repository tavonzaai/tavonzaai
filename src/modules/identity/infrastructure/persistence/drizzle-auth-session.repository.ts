import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull, ne } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  authSessions,
  refreshTokens,
} from '@/database';

export type SessionRevokeReason = 'LOGOUT' | 'REUSE_DETECTED' | 'PASSWORD_CHANGED' | 'ACCOUNT_DISABLED';

@Injectable()
export class DrizzleAuthSessionRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async createSessionWithToken(input: {
    sessionId: string;
    userId: string;
    client: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    expiresAt: Date;
    refreshTokenId: string;
    tokenHash: string;
  }): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(authSessions).values({
        id: input.sessionId,
        userId: input.userId,
        client: input.client,
        userAgent: input.userAgent?.slice(0, 1000) ?? null,
        ipAddress: input.ipAddress?.slice(0, 64) ?? null,
        expiresAt: input.expiresAt,
      });

      await tx.insert(refreshTokens).values({
        id: input.refreshTokenId,
        sessionId: input.sessionId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      });
    });
  }

  async findRefreshToken(id: string) {
    const [row] = await this.db
      .select({ token: refreshTokens, session: authSessions })
      .from(refreshTokens)
      .innerJoin(authSessions, eq(authSessions.id, refreshTokens.sessionId))
      .where(eq(refreshTokens.id, id))
      .limit(1);
    return row ?? null;
  }

  async findSession(id: string) {
    const [row] = await this.db
      .select()
      .from(authSessions)
      .where(eq(authSessions.id, id))
      .limit(1);
    return row ?? null;
  }

  /**
   * Retires `oldId` and stores its replacement atomically. Returns false when
   * another request already rotated `oldId` (lost the race).
   */
  async rotate(input: {
    oldId: string;
    sessionId: string;
    newId: string;
    newHash: string;
    expiresAt: Date;
  }): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const now = new Date();
      const retired = await tx
        .update(refreshTokens)
        .set({ rotatedAt: now, replacedById: input.newId })
        .where(and(eq(refreshTokens.id, input.oldId), isNull(refreshTokens.rotatedAt)))
        .returning({ id: refreshTokens.id });

      if (retired.length === 0) {
        return false;
      }

      await tx.insert(refreshTokens).values({
        id: input.newId,
        sessionId: input.sessionId,
        tokenHash: input.newHash,
        expiresAt: input.expiresAt,
      });

      await tx
        .update(authSessions)
        .set({ lastRotatedAt: now, expiresAt: input.expiresAt })
        .where(eq(authSessions.id, input.sessionId));

      return true;
    });
  }

  async revokeSession(sessionId: string, reason: SessionRevokeReason): Promise<void> {
    await this.db
      .update(authSessions)
      .set({ revokedAt: new Date(), revokedReason: reason })
      .where(and(eq(authSessions.id, sessionId), isNull(authSessions.revokedAt)));
  }

  async revokeAllForUser(
    userId: string,
    reason: SessionRevokeReason,
    exceptSessionId?: string,
  ): Promise<void> {
    const conditions = [eq(authSessions.userId, userId), isNull(authSessions.revokedAt)];
    if (exceptSessionId) {
      conditions.push(ne(authSessions.id, exceptSessionId));
    }
    await this.db
      .update(authSessions)
      .set({ revokedAt: new Date(), revokedReason: reason })
      .where(and(...conditions));
  }
}
