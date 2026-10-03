// ============================================================================
// Drizzle User Repository — Identity Persistence
// ============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { eq, or, and, gt } from 'drizzle-orm';
import { DRIZZLE, schema } from '@tavonza/database';

type DrizzleDb = any;

@Injectable()
export class DrizzleUserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  // ── Users ──────────────────────────────────────────────────────────────

  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    return result[0] ?? null;
  }

  async findByEmailOrPhone(identifier: string) {
    const trimmed = identifier.trim();
    const result = await this.db
      .select()
      .from(schema.users)
      .where(or(eq(schema.users.email, trimmed.toLowerCase()), eq(schema.users.contactNo, trimmed)))
      .limit(1);
    return result[0] ?? null;
  }

  async findById(id: string) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    contactNo?: string;
    role?: any;
  }) {
    const result = await this.db
      .insert(schema.users)
      .values({
        email: data.email,
        password: data.passwordHash,
        name: data.name,
        contactNo: data.contactNo ?? null,
        role: data.role ?? 'CUSTOMER',
      })
      .returning();
    
    // Auto-create customer profile
    if (data.role === 'CUSTOMER' || !data.role) {
      await this.db.insert(schema.customers).values({
        userId: result[0].id,
      });
    }

    return result[0];
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db
      .update(schema.users)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
  }

  // ── OTP Codes ──────────────────────────────────────────────────────────

  async createPasswordResetOtp(email: string, code: string, expiresAt: Date) {
    const result = await this.db
      .insert(schema.passwordResetOtps)
      .values({
        email,
        otp: code,
        expiresAt,
      })
      .returning();
    return result[0];
  }

  async findValidPasswordResetOtp(email: string) {
    const result = await this.db
      .select()
      .from(schema.passwordResetOtps)
      .where(
        and(
          eq(schema.passwordResetOtps.email, email),
          gt(schema.passwordResetOtps.expiresAt, new Date())
        )
      )
      .orderBy(schema.passwordResetOtps.createdAt)
      .limit(1);
    return result[0] ?? null;
  }

  // ── Staff Assignments ──────────────────────────────────────────────────

  async findStaffAssignments(userId: string) {
    try {
      const results = await this.db
        .select({
          id: schema.staffAssignments.id,
          branchId: schema.staffAssignments.branchId,
          branchName: schema.branches.name,
          role: schema.staffAssignments.role,
          permissions: schema.staffAssignments.permissions,
          isActive: schema.staffAssignments.isActive,
        })
        .from(schema.staff)
        .innerJoin(schema.staffAssignments, eq(schema.staffAssignments.staffId, schema.staff.id))
        .innerJoin(schema.branches, eq(schema.branches.id, schema.staffAssignments.branchId))
        .where(and(eq(schema.staff.userId, userId), eq(schema.staffAssignments.isActive, true)));
      return results;
    } catch {
      return [];
    }
  }
}
