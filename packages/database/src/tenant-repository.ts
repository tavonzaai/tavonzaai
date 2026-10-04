import { eq, and } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { DrizzleDatabase } from './client';

/**
 * Base repository that enforces tenant isolation.
 * Any read, update, or delete operation must pass through here
 * so that `branchId` or `organizationId` is automatically appended to the WHERE clause.
 */
export class TenantScopedRepository<T extends PgTable & { branchId: any }> {
  constructor(
    protected readonly db: DrizzleDatabase,
    protected readonly table: T
  ) {}

  /**
   * Automatically scopes any `findMany` operation to the branchId.
   */
  async findMany(branchId: string, conditions?: any) {
    if (conditions) {
      return this.db.select().from(this.table as any).where(and(eq(this.table.branchId, branchId), conditions));
    }
    return this.db.select().from(this.table as any).where(eq(this.table.branchId, branchId));
  }

  /**
   * Automatically scopes any `findOne` operation to the branchId.
   */
  async findOne(branchId: string, conditions: any) {
    const result = await this.db.select().from(this.table as any).where(and(eq(this.table.branchId, branchId), conditions)).limit(1);
    return result[0] || null;
  }

  /**
   * Scopes `update` operation to the branchId.
   */
  async update(branchId: string, conditions: any, values: any) {
    return this.db.update(this.table)
      .set(values)
      .where(and(eq(this.table.branchId, branchId), conditions))
      .returning();
  }

  /**
   * Scopes `delete` operation to the branchId.
   */
  async delete(branchId: string, conditions: any) {
    return this.db.delete(this.table)
      .where(and(eq(this.table.branchId, branchId), conditions))
      .returning();
  }
}
