import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  orders,
  tableSessions,
  tables,
} from '@tavonza/database';
import { DrizzlePaymentRepository } from '../infrastructure/persistence/drizzle-payment.repository';
import type {
  CreatePaymentDto,
  CreateSplitPaymentDto,
  ApplyDiscountDto,
  RefundPaymentDto,
} from '../presentation/http/dto/payment.dto';
import type {
  PaymentEntity,
  PaymentAllocationEntity,
} from '../domain/entities/payment.entity';

function generateTransactionRef(): string {
  const ts = Date.now();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TX-${ts}-${rand}`;
}

import { OutboxService } from '@tavonza/database';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { NotificationService } from '../../notifications/application/services/notification.service';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
    private readonly paymentRepo: DrizzlePaymentRepository,
    private readonly outboxService: OutboxService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Get available payment methods
   */
  async getPaymentOptions(_branchId?: string) {
    return {
      methods: [
        { id: 'CARD', label: 'Credit / Debit Card', icon: 'card' },
        { id: 'CASH', label: 'Cash Payment', icon: 'cash' },
        { id: 'MOBILE_WALLET', label: 'Mobile Wallet (Apple/Google Pay)', icon: 'wallet' },
        { id: 'ONLINE_GATEWAY', label: 'Online Payment Gateway', icon: 'gateway' },
      ],
    };
  }

  /**
   * Process a single payment (full order or table session)
   */
  async createPayment(dto: CreatePaymentDto): Promise<PaymentEntity> {
    if (!dto.orderId && !dto.tableSessionId) {
      throw new BadRequestException('Either orderId or tableSessionId must be provided');
    }

    let finalAmount = dto.amount;

    if (dto.discountCode) {
      const discount = await this.validateDiscountInternal(dto.discountCode, dto.amount);
      finalAmount = Math.max(0, dto.amount - discount.discountAmount);
      await this.paymentRepo.incrementDiscountUsage(discount.discountId);
    }

    let branchIdForEvent: string | null = null;

    if (dto.orderId) {
      const [order] = await this.db
        .select()
        .from(orders)
        .where(eq(orders.id, dto.orderId))
        .limit(1);

      if (!order) throw new NotFoundException(`Order ${dto.orderId} not found`);

      branchIdForEvent = order.branchId;
      const newAmountPaid = (order.amountPaid ?? 0) + finalAmount;
      const newPaymentStatus = newAmountPaid >= order.totalAmount ? 'PAID' : 'PARTIALLY_PAID';

      await this.db
        .update(orders)
        .set({
          amountPaid: newAmountPaid,
          paymentStatus: newPaymentStatus,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      if (order.tableId) {
        await this.db
          .update(tables)
          .set({
            serviceStatus: 'PAYMENT_PENDING',
            updatedAt: new Date(),
          })
          .where(eq(tables.id, order.tableId));

        await this.outboxService.publishEvent({
          aggregateType: 'TABLE',
          aggregateId: order.tableId,
          eventType: 'TableStatusChanged',
          branchId: order.branchId,
          payload: {
            tableId: order.tableId,
            tableLabel: 'Table',
            branchId: order.branchId,
            serviceStatus: 'PAYMENT_PENDING',
            operationalFlag: 'NORMAL',
            activeSessionId: order.tableSessionId,
            updatedAt: new Date().toISOString(),
          },
        });
      }
    }

    if (dto.tableSessionId) {
      const [session] = await this.db
        .select()
        .from(tableSessions)
        .where(eq(tableSessions.id, dto.tableSessionId))
        .limit(1);

      if (!session) throw new NotFoundException(`Table session ${dto.tableSessionId} not found`);

      if (!branchIdForEvent) branchIdForEvent = session.branchId;

      if (!dto.orderId) {
        const sessionOrders = await this.db
          .select()
          .from(orders)
          .where(eq(orders.tableSessionId, dto.tableSessionId));

        for (const o of sessionOrders) {
          if (o.paymentStatus !== 'PAID') {
            await this.db
              .update(orders)
              .set({
                amountPaid: o.totalAmount,
                paymentStatus: 'PAID',
                updatedAt: new Date(),
              })
              .where(eq(orders.id, o.id));
          }
        }
      }

      if (session.tableId) {
        await this.db
          .update(tables)
          .set({
            serviceStatus: 'PAYMENT_PENDING',
            updatedAt: new Date(),
          })
          .where(eq(tables.id, session.tableId));

        await this.outboxService.publishEvent({
          aggregateType: 'TABLE',
          aggregateId: session.tableId,
          eventType: 'TableStatusChanged',
          branchId: session.branchId,
          payload: {
            tableId: session.tableId,
            tableLabel: 'Table',
            branchId: session.branchId,
            serviceStatus: 'PAYMENT_PENDING',
            operationalFlag: 'NORMAL',
            activeSessionId: session.id,
            updatedAt: new Date().toISOString(),
          },
        });
      }
    }

    const transactionRef = dto.transactionRef ?? generateTransactionRef();

    const payment = await this.paymentRepo.createPayment({
      orderId: dto.orderId ?? null,
      tableSessionId: dto.tableSessionId ?? null,
      payerGuestSessionId: dto.payerGuestSessionId ?? null,
      paidForGuestIds: dto.paidForGuestIds ?? [],
      scope: dto.scope,
      amount: finalAmount,
      tipAmount: dto.tipAmount ?? 0,
      method: dto.method,
      status: 'PAID',
      transactionRef,
      paidAt: new Date(),
    });

    await this.outboxService.publishEvent({
      aggregateType: 'PAYMENT',
      aggregateId: payment.id,
      eventType: 'PaymentCompleted',
      branchId: branchIdForEvent,
      payload: {
        paymentId: payment.id,
        orderId: payment.orderId,
        tableSessionId: payment.tableSessionId,
        amount: payment.amount,
        tipAmount: payment.tipAmount,
        method: payment.method,
        transactionRef: payment.transactionRef,
        paidAt: payment.paidAt?.toISOString() ?? new Date().toISOString(),
      },
    });

    this.realtimeGateway.emitPaymentStatusChanged({
      eventType: 'PAYMENT_STATUS_CHANGED',
      eventId: payment.id,
      branchId: branchIdForEvent ?? '',
      paymentId: payment.id,
      orderId: payment.orderId,
      tableSessionId: payment.tableSessionId,
      status: 'PAID',
      method: payment.method as any,
      amount: Number(payment.amount),
      transactionRef: payment.transactionRef,
      occurredAt: new Date().toISOString(),
    });

    if (branchIdForEvent) {
      await this.notificationService.create({
        branchId: branchIdForEvent,
        targetRole: 'CASHIER',
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Received',
        message: `Payment of $${payment.amount} settled via ${payment.method}.`,
        entityType: 'PAYMENT',
        entityId: payment.id,
      });
    }

    return payment;
  }

  /**
   * Process a split payment with item or guest allocations
   */
  async createSplitPayment(dto: CreateSplitPaymentDto): Promise<{
    payment: PaymentEntity;
    allocations: PaymentAllocationEntity[];
  }> {
    if (!dto.allocations || dto.allocations.length === 0) {
      throw new BadRequestException('At least one allocation is required for split payment');
    }

    const totalAllocated = dto.allocations.reduce((acc, curr) => acc + curr.amount, 0);
    const transactionRef = dto.transactionRef ?? generateTransactionRef();

    const payment = await this.paymentRepo.createPayment({
      orderId: dto.orderId ?? null,
      tableSessionId: dto.tableSessionId ?? null,
      payerGuestSessionId: dto.payerGuestSessionId ?? null,
      paidForGuestIds: [],
      scope: 'ORDER_ITEMS',
      amount: totalAllocated,
      tipAmount: dto.tipAmount ?? 0,
      method: dto.method,
      status: 'PAID',
      transactionRef,
      paidAt: new Date(),
    });

    const allocations = await this.paymentRepo.createAllocations(
      dto.allocations.map((a) => ({
        paymentId: payment.id,
        orderId: a.orderId ?? dto.orderId ?? null,
        orderItemId: a.orderItemId ?? null,
        amount: a.amount,
      }))
    );

    let branchIdForEvent: string | null = null;
    const orderAmounts = new Map<string, number>();
    for (const a of dto.allocations) {
      const oId = a.orderId ?? dto.orderId;
      if (oId) {
        orderAmounts.set(oId, (orderAmounts.get(oId) ?? 0) + a.amount);
      }
    }

    let tableIdToUpdate: string | null = null;
    let sessionIdToUpdate: string | null = dto.tableSessionId ?? null;

    for (const [oId, allocatedAmount] of orderAmounts.entries()) {
      const [targetOrder] = await this.db
        .select()
        .from(orders)
        .where(eq(orders.id, oId))
        .limit(1);

      if (targetOrder) {
        if (!branchIdForEvent) branchIdForEvent = targetOrder.branchId;
        if (targetOrder.tableId) tableIdToUpdate = targetOrder.tableId;
        if (targetOrder.tableSessionId) sessionIdToUpdate = targetOrder.tableSessionId;

        const newAmountPaid = (targetOrder.amountPaid ?? 0) + allocatedAmount;
        const newPaymentStatus = newAmountPaid >= targetOrder.totalAmount ? 'PAID' : 'PARTIALLY_PAID';

        await this.db
          .update(orders)
          .set({
            amountPaid: newAmountPaid,
            paymentStatus: newPaymentStatus,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, targetOrder.id));
      }
    }

    if (!tableIdToUpdate && dto.tableSessionId) {
      const [session] = await this.db
        .select()
        .from(tableSessions)
        .where(eq(tableSessions.id, dto.tableSessionId))
        .limit(1);
      if (session) {
        tableIdToUpdate = session.tableId;
        if (!branchIdForEvent) branchIdForEvent = session.branchId;
      }
    }

    if (tableIdToUpdate && branchIdForEvent) {
      await this.db
        .update(tables)
        .set({
          serviceStatus: 'PAYMENT_PENDING',
          updatedAt: new Date(),
        })
        .where(eq(tables.id, tableIdToUpdate));

      await this.outboxService.publishEvent({
        aggregateType: 'TABLE',
        aggregateId: tableIdToUpdate,
        eventType: 'TableStatusChanged',
        branchId: branchIdForEvent,
        payload: {
          tableId: tableIdToUpdate,
          tableLabel: 'Table',
          branchId: branchIdForEvent,
          serviceStatus: 'PAYMENT_PENDING',
          operationalFlag: 'NORMAL',
          activeSessionId: sessionIdToUpdate,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    await this.outboxService.publishEvent({
      aggregateType: 'PAYMENT',
      aggregateId: payment.id,
      eventType: 'PaymentCompleted',
      branchId: branchIdForEvent,
      payload: {
        paymentId: payment.id,
        orderId: payment.orderId,
        tableSessionId: payment.tableSessionId,
        amount: payment.amount,
        tipAmount: payment.tipAmount,
        method: payment.method,
        transactionRef: payment.transactionRef,
        allocationsCount: allocations.length,
        paidAt: payment.paidAt?.toISOString() ?? new Date().toISOString(),
      },
    });

    this.realtimeGateway.emitPaymentStatusChanged({
      eventType: 'PAYMENT_STATUS_CHANGED',
      eventId: payment.id,
      branchId: branchIdForEvent ?? '',
      paymentId: payment.id,
      orderId: payment.orderId,
      tableSessionId: payment.tableSessionId,
      status: 'PAID',
      method: payment.method as any,
      amount: Number(payment.amount),
      transactionRef: payment.transactionRef,
      occurredAt: new Date().toISOString(),
    });

    return { payment, allocations };
  }

  /**
   * Validate and calculate discount
   */
  async applyDiscount(dto: ApplyDiscountDto) {
    const res = await this.validateDiscountInternal(dto.code, dto.subtotal);
    return {
      code: dto.code,
      type: res.type,
      discountAmount: res.discountAmount,
      subtotal: dto.subtotal,
      netTotal: Math.max(0, dto.subtotal - res.discountAmount),
    };
  }

  /**
   * Refund an existing payment
   */
  async refundPayment(paymentId: string, dto: RefundPaymentDto): Promise<PaymentEntity> {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status !== 'PAID' && payment.status !== 'PARTIALLY_PAID') {
      throw new BadRequestException(`Cannot refund payment in ${payment.status} status`);
    }

    if (dto.refundAmount > payment.amount) {
      throw new BadRequestException('Refund amount cannot exceed payment amount');
    }

    const newStatus = dto.refundAmount === payment.amount ? 'REFUNDED' : 'PARTIALLY_PAID';
    const updated = await this.paymentRepo.updateStatus(paymentId, newStatus, {
      refundRef: dto.reason,
      refundAmount: dto.refundAmount,
    });

    this.realtimeGateway.emitPaymentStatusChanged({
      eventType: 'PAYMENT_STATUS_CHANGED',
      eventId: updated.id,
      branchId: '',
      paymentId: updated.id,
      orderId: updated.orderId,
      tableSessionId: updated.tableSessionId,
      status: (newStatus === 'REFUNDED' ? 'REFUNDED' : 'PARTIALLY_PAID') as any,
      method: updated.method as any,
      amount: Number(updated.amount),
      transactionRef: updated.transactionRef,
      occurredAt: new Date().toISOString(),
    });

    await this.outboxService.publishEvent({
      aggregateType: 'PAYMENT',
      aggregateId: updated.id,
      eventType: 'PaymentRefunded',
      branchId: null,
      payload: {
        paymentId: updated.id,
        orderId: updated.orderId,
        tableSessionId: updated.tableSessionId,
        refundAmount: dto.refundAmount,
        reason: dto.reason,
        refundedAt: new Date().toISOString(),
      },
    });

    return updated;
  }

  /**
   * Get payment receipt by ID
   */
  async getPayment(paymentId: string): Promise<PaymentEntity & { allocations: PaymentAllocationEntity[] }> {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');

    const allocations = await this.paymentRepo.findAllocationsByPaymentId(paymentId);
    return { ...payment, allocations };
  }

  /**
   * Get payments by Order ID
   */
  async getPaymentsByOrder(orderId: string): Promise<PaymentEntity[]> {
    return this.paymentRepo.findByOrderId(orderId);
  }

  /**
   * Get payments by Table Session ID
   */
  async getPaymentsByTableSession(tableSessionId: string): Promise<PaymentEntity[]> {
    return this.paymentRepo.findByTableSessionId(tableSessionId);
  }

  /**
   * Calculate Table Bill (Subtotal, Tax, Service Charge, Total Paid, Balance Due)
   */
  async calculateTableBill(tableSessionId: string) {
    const sessionOrders = await this.db
      .select()
      .from(orders)
      .where(eq(orders.tableSessionId, tableSessionId));

    let subtotal = 0;
    let taxAmount = 0;
    let serviceCharge = 0;
    let totalAmount = 0;

    for (const order of sessionOrders) {
      if (order.status !== 'CANCELLED' && order.status !== 'REJECTED') {
        subtotal += order.subtotal ?? 0;
        taxAmount += order.taxAmount ?? 0;
        serviceCharge += order.serviceCharge ?? 0;
        totalAmount += order.totalAmount ?? 0;
      }
    }

    const sessionPayments = await this.paymentRepo.findByTableSessionId(tableSessionId);
    const paidAmount = sessionPayments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const balanceDue = Math.max(0, totalAmount - paidAmount);

    return {
      tableSessionId,
      ordersCount: sessionOrders.length,
      subtotal,
      taxAmount,
      serviceCharge,
      totalAmount,
      paidAmount,
      balanceDue,
      isFullyPaid: balanceDue === 0 && totalAmount > 0,
    };
  }

  // ── Helper ────────────────────────────────────────────────────────────

  private async validateDiscountInternal(code: string, amount: number) {
    const discount = await this.paymentRepo.findDiscountByCode(code);
    if (!discount || !discount.isActive) {
      throw new BadRequestException(`Discount code ${code} is invalid or inactive`);
    }

    const now = new Date();
    if (discount.validFrom && now < discount.validFrom) {
      throw new BadRequestException(`Discount code ${code} is not yet active`);
    }
    if (discount.validUntil && now > discount.validUntil) {
      throw new BadRequestException(`Discount code ${code} has expired`);
    }
    if (discount.usageLimit !== null && discount.usageLimit !== undefined && discount.timesUsed >= discount.usageLimit) {
      throw new BadRequestException(`Discount code ${code} has reached its usage limit`);
    }

    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = (amount * discount.value) / 100;
    } else {
      discountAmount = Math.min(amount, discount.value);
    }

    return {
      discountId: discount.id,
      type: discount.type,
      discountAmount,
    };
  }
}
