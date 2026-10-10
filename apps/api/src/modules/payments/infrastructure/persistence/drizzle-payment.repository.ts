import { Injectable, Inject } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  payments,
  paymentAllocations,
  discounts,
} from '@tavonza/database';
import { DrizzleQueryBuilder } from '../../../../common/database';
import type { IPaymentRepository } from '../../domain/repositories/payment-repository.interface';
import type {
  PaymentEntity,
  PaymentAllocationEntity,
  DiscountEntity,
} from '../../domain/entities/payment.entity';
import {
  ResourceNotFoundException,
  InternalOperationException,
} from '../../../../common/errors/app.exception';

@Injectable()
export class DrizzlePaymentRepository implements IPaymentRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async createPayment(
    data: Omit<PaymentEntity, 'id' | 'createdAt'>
  ): Promise<PaymentEntity> {
    const [created] = await this.db
      .insert(payments)
      .values({
        orderId: data.orderId ?? null,
        tableSessionId: data.tableSessionId ?? null,
        payerGuestSessionId: data.payerGuestSessionId ?? null,
        paidForGuestIds: data.paidForGuestIds ?? [],
        scope: data.scope,
        amount: data.amount,
        tipAmount: data.tipAmount ?? 0,
        method: data.method,
        status: data.status,
        transactionRef: data.transactionRef ?? null,
        paidAt: data.paidAt ?? null,
        settledById: data.settledById ?? null,
        collectedById: data.collectedById ?? null,
      })
      .returning();

    if (!created) throw new InternalOperationException('Failed to create payment record');
    return this.mapPayment(created);
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const [row] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);

    return row ? this.mapPayment(row) : null;
  }

  async findByOrderId(orderId: string): Promise<PaymentEntity[]> {
    const qb = new DrizzleQueryBuilder<typeof payments>(this.db, payments)
      .filterExact({ orderId });
    const rows = await qb.executePlain();
    return rows.map((r) => this.mapPayment(r));
  }

  async findByTableSessionId(tableSessionId: string): Promise<PaymentEntity[]> {
    const qb = new DrizzleQueryBuilder<typeof payments>(this.db, payments)
      .filterExact({ tableSessionId });
    const rows = await qb.executePlain();
    return rows.map((r) => this.mapPayment(r));
  }

  async findByTransactionRef(transactionRef: string): Promise<PaymentEntity | null> {
    const [row] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.transactionRef, transactionRef))
      .limit(1);

    return row ? this.mapPayment(row) : null;
  }

  async findPendingByOrderOrSession(params: {
    orderId?: string;
    tableSessionId?: string;
  }): Promise<PaymentEntity | null> {
    if (!params.orderId && !params.tableSessionId) return null;

    const condition = params.orderId
      ? and(eq(payments.orderId, params.orderId), eq(payments.status, 'UNPAID'))
      : and(eq(payments.tableSessionId, params.tableSessionId!), eq(payments.status, 'UNPAID'));

    const [row] = await this.db
      .select()
      .from(payments)
      .where(condition)
      .limit(1);

    return row ? this.mapPayment(row) : null;
  }

  async updateStatus(
    id: string,
    status: PaymentEntity['status'],
    extras?: {
      transactionRef?: string;
      paidAt?: Date;
      settledById?: string;
      collectedById?: string;
      refundRef?: string;
      refundAmount?: number;
    }
  ): Promise<PaymentEntity> {
    const [updated] = await this.db
      .update(payments)
      .set({
        status,
        ...(extras?.transactionRef ? { transactionRef: extras.transactionRef } : {}),
        ...(extras?.paidAt ? { paidAt: extras.paidAt } : {}),
        ...(extras?.settledById ? { settledById: extras.settledById } : {}),
        ...(extras?.collectedById ? { collectedById: extras.collectedById } : {}),
        ...(extras?.refundRef ? { refundRef: extras.refundRef, refundedAt: new Date() } : {}),
        ...(extras?.refundAmount !== undefined ? { refundAmount: extras.refundAmount } : {}),
      })
      .where(eq(payments.id, id))
      .returning();

    if (!updated) throw new ResourceNotFoundException('Payment', id);
    return this.mapPayment(updated);
  }

  async createAllocations(
    allocationsList: Array<Omit<PaymentAllocationEntity, 'id' | 'createdAt'>>
  ): Promise<PaymentAllocationEntity[]> {
    if (allocationsList.length === 0) return [];

    const createdRows = await this.db
      .insert(paymentAllocations)
      .values(
        allocationsList.map((a) => ({
          paymentId: a.paymentId,
          orderId: a.orderId ?? null,
          orderItemId: a.orderItemId ?? null,
          amount: a.amount,
        }))
      )
      .returning();

    return createdRows.map((r) => this.mapAllocation(r));
  }

  async findAllocationsByPaymentId(paymentId: string): Promise<PaymentAllocationEntity[]> {
    const qb = new DrizzleQueryBuilder<typeof paymentAllocations>(this.db, paymentAllocations)
      .filterExact({ paymentId });
    const rows = await qb.executePlain();
    return rows.map((r) => this.mapAllocation(r));
  }

  async findDiscountByCode(code: string): Promise<DiscountEntity | null> {
    const [row] = await this.db
      .select()
      .from(discounts)
      .where(eq(discounts.code, code))
      .limit(1);

    return row ? this.mapDiscount(row) : null;
  }

  async incrementDiscountUsage(id: string): Promise<void> {
    await this.db
      .update(discounts)
      .set({
        timesUsed: sql`${discounts.timesUsed} + 1`,
      })
      .where(eq(discounts.id, id));
  }

  // ── Mapping Helpers ───────────────────────────────────────────────────

  private mapPayment(row: typeof payments.$inferSelect): PaymentEntity {
    return {
      id: row.id,
      orderId: row.orderId,
      tableSessionId: row.tableSessionId,
      payerGuestSessionId: row.payerGuestSessionId,
      paidForGuestIds: row.paidForGuestIds ?? [],
      scope: row.scope as PaymentEntity['scope'],
      amount: row.amount,
      tipAmount: row.tipAmount ?? 0,
      method: row.method as PaymentEntity['method'],
      status: row.status as PaymentEntity['status'],
      transactionRef: row.transactionRef,
      paidAt: row.paidAt,
      settledById: row.settledById,
      collectedById: row.collectedById,
      refundedAt: row.refundedAt,
      refundRef: row.refundRef,
      refundAmount: row.refundAmount,
      createdAt: row.createdAt ?? new Date(),
    };
  }

  private mapAllocation(row: typeof paymentAllocations.$inferSelect): PaymentAllocationEntity {
    return {
      id: row.id,
      paymentId: row.paymentId,
      orderId: row.orderId,
      orderItemId: row.orderItemId,
      amount: row.amount,
      createdAt: row.createdAt ?? new Date(),
    };
  }

  private mapDiscount(row: typeof discounts.$inferSelect): DiscountEntity {
    return {
      id: row.id,
      code: row.code,
      type: row.type as DiscountEntity['type'],
      value: row.value,
      isActive: row.isActive ?? true,
      validFrom: row.validFrom,
      validUntil: row.validUntil,
      usageLimit: row.usageLimit,
      timesUsed: row.timesUsed ?? 0,
    };
  }
}
