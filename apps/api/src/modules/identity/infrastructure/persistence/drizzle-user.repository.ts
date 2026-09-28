// ============================================================================
// Drizzle User Repository — Identity Persistence
// ============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gt, or } from 'drizzle-orm';
import { DRIZZLE } from '@tavonza/database';
import { users, otpCodes } from '@tavonza/database';
import type { User, OtpCode } from '../../domain/entities/user.entity';

type DrizzleDb = any;

@Injectable()
export class DrizzleUserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  // ── Users ──────────────────────────────────────────────────────────────

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ?? null;
  }

  async findByEmailOrPhone(identifier: string): Promise<User | null> {
    const trimmed = identifier.trim();
    const result = await this.db
      .select()
      .from(users)
      .where(or(eq(users.email, trimmed.toLowerCase()), eq(users.phone, trimmed)))
      .limit(1);
    return result[0] ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
    permissions?: User['permissions'];
    scopes?: User['scopes'];
    organizationId?: string;
  }): Promise<User> {
    const result = await this.db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? null,
        role: data.role ?? 'customer',
        permissions: data.permissions ?? [],
        scopes: data.scopes ?? [],
        organizationId: data.organizationId ?? null,
      })
      .returning();
    return result[0];
  }

  async updateRefreshToken(userId: string, hashedToken: string | null): Promise<void> {
    await this.db
      .update(users)
      .set({ refreshToken: hashedToken, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({ isEmailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async markPhoneVerified(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({ isPhoneVerified: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // ── OTP Codes ──────────────────────────────────────────────────────────

  async createOtp(data: {
    userId: string;
    code: string;
    type: OtpCode['type'];
    expiresAt: Date;
  }): Promise<OtpCode> {
    const result = await this.db
      .insert(otpCodes)
      .values(data)
      .returning();
    return result[0];
  }

  async findValidOtp(
    userId: string,
    type: OtpCode['type'],
  ): Promise<OtpCode | null> {
    const result = await this.db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.userId, userId),
          eq(otpCodes.type, type),
          gt(otpCodes.expiresAt, new Date()),
        ),
      )
      .orderBy(otpCodes.createdAt)
      .limit(1);
    return result[0] ?? null;
  }

  async markOtpUsed(otpId: string): Promise<void> {
    await this.db
      .update(otpCodes)
      .set({ usedAt: new Date() })
      .where(eq(otpCodes.id, otpId));
  }
}
