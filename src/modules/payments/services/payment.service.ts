import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { eq, inArray, and, desc, sql, or, ilike } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  payments,
  orders,
  tableSessions,
  tables,
  branches,
  restaurants,
  branchSettings,
  staff,
  guestSessions,
  OutboxService,
} from '@/database';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';
import { isSuperAdmin } from '../../../common/auth/actor.util';
import { BranchAccessService } from '../../authorization/services/branch-access.service';
import {
  CustomerPrincipalService,
  isCustomerPayload,
} from '../../identity/services/customer-principal.service';
import { isPaymentOrderOwnedBy, isStaffPaymentActor } from '../domain/payment-access';
import { DrizzlePaymentRepository } from '../repositories/drizzle-payment.repository';
import { StripeAdapter } from '../adapters/stripe.adapter';
import type {
  CreatePaymentDto,
  CreateSplitPaymentDto,
  ApplyDiscountDto,
  RefundPaymentDto,
  CreateStripePaymentIntentDto,
  StripePaymentIntentResponseDto,
  RequestOfflinePaymentDto,
  ConfirmOfflinePaymentDto,
  RejectOfflinePaymentDto,
  OfflinePaymentRequestItemDto,
} from '../dto/payment.dto';
import type {
  PaymentEntity,
  PaymentAllocationEntity,
} from '../domain/payment.entity';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { NotificationService } from '../../notifications/services/notification.service';

function generateTransactionRef(prefix = 'TX'): string {
  const ts = Date.now();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${ts}-${rand}`;
}

const CONFIRMED_ORDER_STATUSES = ['CONFIRMED', 'PREPARING', 'READY', 'SERVED'];

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
    private readonly paymentRepo: DrizzlePaymentRepository,
    private readonly stripeAdapter: StripeAdapter,
    private readonly outboxService: OutboxService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly notificationService: NotificationService,
    private readonly branchAccess: BranchAccessService,
    private readonly principals: CustomerPrincipalService,
  ) {}

  /**
   * Customer/guest may act on an order they own or a table session they are seated in.
   * Staff may act when they hold live branch access. Guests never get staff privileges.
   */
  async assertPayableAccess(
    user: JwtPayload,
    opts: { orderId?: string | null; tableSessionId?: string | null; paymentId?: string | null },
  ): Promise<{ branchId: string }> {
    let orderId: string | null = opts.orderId ?? null;
    let tableSessionId: string | null = opts.tableSessionId ?? null;

    if (opts.paymentId) {
      const payment = await this.paymentRepo.findById(opts.paymentId);
      if (!payment) throw new NotFoundException('Payment not found');
      orderId = orderId ?? payment.orderId ?? null;
      tableSessionId = tableSessionId ?? payment.tableSessionId ?? null;
    }

    if (orderId) {
      const [order] = await this.db
        .select({
          id: orders.id,
          branchId: orders.branchId,
          customerId: orders.customerId,
          guestSessionId: orders.guestSessionId,
          tableSessionId: orders.tableSessionId,
        })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);
      if (!order) throw new NotFoundException('Order not found');
      tableSessionId = tableSessionId ?? order.tableSessionId;

      if (isStaffPaymentActor(user)) {
        await this.branchAccess.assertAccess(user, order.branchId);
        return { branchId: order.branchId };
      }

      if (isCustomerPayload(user) || user.typ === 'guest') {
        const principal = await this.principals.resolve(user);
        const ownsOrder = isPaymentOrderOwnedBy(
          { customerId: order.customerId, customerSessionId: order.guestSessionId },
          { customerId: principal.customerId, guestSessionId: principal.guestSessionId },
        );
        if (ownsOrder) return { branchId: order.branchId };
        if (order.tableSessionId) {
          await this.assertSessionParticipant(user, order.tableSessionId);
          return { branchId: order.branchId };
        }
        throw new ForbiddenException('You do not have access to this order payment');
      }

      throw new ForbiddenException('You do not have access to this payment');
    }

    if (tableSessionId) {
      const [session] = await this.db
        .select({ id: tableSessions.id, branchId: tableSessions.branchId })
        .from(tableSessions)
        .where(eq(tableSessions.id, tableSessionId))
        .limit(1);
      if (!session) throw new NotFoundException('Table session not found');

      if (isStaffPaymentActor(user)) {
        await this.branchAccess.assertAccess(user, session.branchId);
        return { branchId: session.branchId };
      }

      await this.assertSessionParticipant(user, tableSessionId);
      return { branchId: session.branchId };
    }

    throw new BadRequestException('Either orderId, tableSessionId, or paymentId is required');
  }

  private async assertSessionParticipant(user: JwtPayload, tableSessionId: string): Promise<void> {
    const principal =
      isCustomerPayload(user) || user.typ === 'guest'
        ? await this.principals.resolve(user)
        : null;

    if (principal?.tableSessionId === tableSessionId) return;

    if (principal?.guestSessionId) {
      const [guest] = await this.db
        .select({ id: guestSessions.id })
        .from(guestSessions)
        .where(
          and(
            eq(guestSessions.id, principal.guestSessionId),
            eq(guestSessions.tableSessionId, tableSessionId),
          ),
        )
        .limit(1);
      if (guest) return;
    }

    if (principal?.customerId) {
      const [guest] = await this.db
        .select({ id: guestSessions.id })
        .from(guestSessions)
        .where(
          and(
            eq(guestSessions.customerId, principal.customerId),
            eq(guestSessions.tableSessionId, tableSessionId),
          ),
        )
        .limit(1);
      if (guest) return;
    }

    throw new ForbiddenException('You do not have access to this table session payment');
  }

  /**
   * Get available payment methods and gateway configurations
   */
  async getPaymentOptions(branchId?: string) {
    let currency = 'USD';
    if (branchId) {
      const [settings] = await this.db
        .select({ currency: branchSettings.currency })
        .from(branchSettings)
        .where(eq(branchSettings.branchId, branchId))
        .limit(1);
      if (settings?.currency) {
        currency = settings.currency;
      }
    }

    return {
      currency,
      publishableKey: this.stripeAdapter.getPublishableKey(),
      methods: [
        { id: 'ONLINE_GATEWAY', label: 'Online Payment (Stripe)', icon: 'gateway' },
        { id: 'CARD', label: 'Credit / Debit Card (Cashier)', icon: 'card' },
        { id: 'CASH', label: 'Cash Payment (Cashier)', icon: 'cash' },
        { id: 'MOBILE_WALLET', label: 'Mobile Wallet (Apple/Google Pay)', icon: 'wallet' },
      ],
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // STRIPE ONLINE PAYMENT WORKFLOW
  // ══════════════════════════════════════════════════════════════════════

  /**
   * 1. Create or retrieve Stripe PaymentIntent for confirmed order or table session
   */
  async createStripePaymentIntent(
    user: JwtPayload,
    dto: CreateStripePaymentIntentDto,
  ): Promise<StripePaymentIntentResponseDto> {
    if (!dto.orderId && !dto.tableSessionId) {
      throw new BadRequestException('Either orderId or tableSessionId must be provided');
    }
    await this.assertPayableAccess(user, {
      orderId: dto.orderId,
      tableSessionId: dto.tableSessionId,
    });

    const {
      authoritativeAmount,
      currency,
      branchId,
      customerId,
    } = await this.resolveAndValidatePayableContext({
      orderId: dto.orderId,
      tableSessionId: dto.tableSessionId,
      tipAmount: dto.tipAmount ?? 0,
      discountCode: dto.discountCode,
    });

    if (authoritativeAmount <= 0) {
      throw new BadRequestException('Outstanding balance is zero. No payment required.');
    }

    // Check if an existing UNPAID Stripe payment exists for this order/session
    const existingPayment = await this.paymentRepo.findPendingByOrderOrSession({
      orderId: dto.orderId,
      tableSessionId: dto.tableSessionId,
    });

    let paymentRecord: PaymentEntity;

    if (
      existingPayment &&
      existingPayment.method === 'ONLINE_GATEWAY' &&
      existingPayment.transactionRef?.startsWith('pi_')
    ) {
      // Check existing intent with Stripe
      const existingIntent = await this.stripeAdapter.retrievePaymentIntent(
        existingPayment.transactionRef,
      );

      // If already succeeded, complete immediately
      if (existingIntent.status === 'succeeded') {
        await this.completePaymentSettlement(existingPayment, 'ONLINE_GATEWAY', existingIntent.id);
        return {
          clientSecret: '',
          paymentIntentId: existingIntent.id,
          amount: existingPayment.amount,
          currency: existingIntent.currency.toUpperCase(),
          publishableKey: this.stripeAdapter.getPublishableKey(),
          orderId: dto.orderId ?? null,
          tableSessionId: dto.tableSessionId ?? null,
        };
      }

      paymentRecord = existingPayment;
    } else {
      // Create a fresh PaymentIntent
      const amountInCents = Math.round(authoritativeAmount * 100);
      const idempotencyKey = `intent_${dto.orderId || dto.tableSessionId}_${amountInCents}`;

      const stripeResult = await this.stripeAdapter.createPaymentIntent({
        amountInCents,
        currency,
        orderId: dto.orderId ?? null,
        tableSessionId: dto.tableSessionId ?? null,
        branchId,
        customerId,
        idempotencyKey,
      });

      // Record payment with status 'UNPAID'
      paymentRecord = await this.paymentRepo.createPayment({
        orderId: dto.orderId ?? null,
        tableSessionId: dto.tableSessionId ?? null,
        payerGuestSessionId: dto.payerGuestSessionId ?? null,
        paidForGuestIds: [],
        scope: dto.orderId ? 'ORDER' : 'TABLE_SESSION',
        amount: authoritativeAmount,
        tipAmount: dto.tipAmount ?? 0,
        method: 'ONLINE_GATEWAY',
        status: 'UNPAID',
        transactionRef: stripeResult.paymentIntentId,
        paidAt: null,
      });

      return {
        clientSecret: stripeResult.clientSecret,
        paymentIntentId: stripeResult.paymentIntentId,
        amount: authoritativeAmount,
        currency: currency.toUpperCase(),
        publishableKey: this.stripeAdapter.getPublishableKey(),
        orderId: dto.orderId ?? null,
        tableSessionId: dto.tableSessionId ?? null,
      };
    }

    // Return client secret from existing payment intent
    const existingIntent = await this.stripeAdapter.retrievePaymentIntent(
      paymentRecord.transactionRef!,
    );

    return {
      clientSecret: `${existingIntent.id}_secret_reused`,
      paymentIntentId: existingIntent.id,
      amount: paymentRecord.amount,
      currency: currency.toUpperCase(),
      publishableKey: this.stripeAdapter.getPublishableKey(),
      orderId: dto.orderId ?? null,
      tableSessionId: dto.tableSessionId ?? null,
    };
  }

  /**
   * 2. Authoritative Server-Side Verification of Stripe PaymentIntent
   */
  async verifyStripePayment(paymentIntentId: string): Promise<PaymentEntity> {
    if (!paymentIntentId) {
      throw new BadRequestException('PaymentIntent ID is required');
    }

    const payment = await this.paymentRepo.findByTransactionRef(paymentIntentId);
    if (!payment) {
      throw new NotFoundException(`Payment record for transaction ${paymentIntentId} not found`);
    }

    if (payment.status === 'PAID') {
      return payment;
    }

    const intent = await this.stripeAdapter.retrievePaymentIntent(paymentIntentId);

    if (intent.status === 'succeeded') {
      return this.completePaymentSettlement(payment, 'ONLINE_GATEWAY', paymentIntentId);
    }

    if (intent.status === 'canceled' || intent.status === 'requires_payment_method') {
      await this.paymentRepo.updateStatus(payment.id, 'FAILED');
      throw new BadRequestException(`Stripe payment was not completed (status: ${intent.status})`);
    }

    return payment;
  }

  /**
   * 3. Idempotent Stripe Webhook Event Handler
   */
  async handleStripeWebhook(rawBody: Buffer | string, signature: string): Promise<{ received: boolean; processed?: boolean }> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_tavonza_dev';

    let event: any;
    try {
      event = this.stripeAdapter.constructWebhookEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Received verified Stripe webhook event: ${event.type}`);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const payment = await this.paymentRepo.findByTransactionRef(intent.id);

      if (!payment) {
        this.logger.warn(`Payment record not found for webhook transaction ${intent.id}`);
        return { received: true, processed: false };
      }

      if (payment.status === 'PAID') {
        this.logger.log(`Payment ${payment.id} already settled; skipping duplicate webhook.`);
        return { received: true, processed: true };
      }

      await this.completePaymentSettlement(payment, 'ONLINE_GATEWAY', intent.id);
      return { received: true, processed: true };
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      const payment = await this.paymentRepo.findByTransactionRef(intent.id);
      if (payment && payment.status !== 'PAID') {
        await this.paymentRepo.updateStatus(payment.id, 'FAILED');
        this.realtimeGateway.emitPaymentStatusChanged({
          eventType: 'PAYMENT_STATUS_CHANGED',
          eventId: payment.id,
          branchId: '',
          paymentId: payment.id,
          orderId: payment.orderId,
          tableSessionId: payment.tableSessionId,
          status: 'FAILED',
          method: 'ONLINE_GATEWAY',
          amount: Number(payment.amount),
          transactionRef: payment.transactionRef,
          occurredAt: new Date().toISOString(),
        });
      }
      return { received: true, processed: true };
    }

    return { received: true };
  }

  // ══════════════════════════════════════════════════════════════════════
  // OFFLINE CASH / CARD CASHIER WORKFLOW
  // ══════════════════════════════════════════════════════════════════════

  /**
   * 1. Customer or Waiter submits an Offline Payment Request
   */
  async requestOfflinePayment(
    user: JwtPayload,
    dto: RequestOfflinePaymentDto,
  ): Promise<PaymentEntity> {
    if (!dto.orderId && !dto.tableSessionId) {
      throw new BadRequestException('Either orderId or tableSessionId must be provided');
    }
    await this.assertPayableAccess(user, {
      orderId: dto.orderId,
      tableSessionId: dto.tableSessionId,
    });

    const {
      authoritativeAmount,
      branchId,
      tableId,
      tableLabel,
    } = await this.resolveAndValidatePayableContext({
      orderId: dto.orderId,
      tableSessionId: dto.tableSessionId,
      tipAmount: dto.tipAmount ?? 0,
      discountCode: dto.discountCode,
    });

    if (authoritativeAmount <= 0) {
      throw new BadRequestException('Outstanding balance is zero. No offline payment required.');
    }

    const transactionRef = generateTransactionRef('REQ');

    // Create payment in UNPAID status
    const payment = await this.paymentRepo.createPayment({
      orderId: dto.orderId ?? null,
      tableSessionId: dto.tableSessionId ?? null,
      payerGuestSessionId: dto.payerGuestSessionId ?? null,
      paidForGuestIds: [],
      scope: dto.orderId ? 'ORDER' : 'TABLE_SESSION',
      amount: authoritativeAmount,
      tipAmount: dto.tipAmount ?? 0,
      method: dto.method,
      status: 'UNPAID',
      transactionRef,
      paidAt: null,
    });

    // Update table session status to BILL_REQUESTED & table to PAYMENT_PENDING
    if (dto.tableSessionId) {
      await this.db
        .update(tableSessions)
        .set({ status: 'BILL_REQUESTED', updatedAt: new Date() })
        .where(eq(tableSessions.id, dto.tableSessionId));
    }

    if (tableId) {
      await this.db
        .update(tables)
        .set({ serviceStatus: 'PAYMENT_PENDING', updatedAt: new Date() })
        .where(eq(tables.id, tableId));

      this.realtimeGateway.emitTableStatusChanged({
        eventType: 'TABLE_STATUS_CHANGED',
        eventId: tableId,
        branchId,
        tableId,
        tableLabel: tableLabel || 'Table',
        serviceStatus: 'PAYMENT_PENDING',
        operationalFlag: 'NORMAL',
        activeSessionId: dto.tableSessionId ?? null,
        occurredAt: new Date().toISOString(),
      });
    }

    // Emit PAYMENT_REQUESTED to Cashier and Waitstaff
    this.realtimeGateway.emitPaymentRequested({
      eventType: 'PAYMENT_REQUESTED',
      eventId: payment.id,
      branchId,
      tableId: tableId || '',
      tableLabel: tableLabel || 'Table',
      tableSessionId: dto.tableSessionId || '',
      orderId: dto.orderId || null,
      amount: authoritativeAmount,
      preferredMethod: dto.method,
      occurredAt: new Date().toISOString(),
    });

    // Create persistent notification for Cashier
    await this.notificationService.create({
      branchId,
      targetRole: 'CASHIER',
      type: 'PAYMENT_REQUESTED',
      title: 'Offline Payment Requested',
      message: `${tableLabel || 'Table'} requested offline payment of $${authoritativeAmount.toFixed(2)} via ${dto.method}.`,
      entityType: 'PAYMENT',
      entityId: payment.id,
      metadata: {
        orderId: dto.orderId,
        tableSessionId: dto.tableSessionId,
        method: dto.method,
        amount: authoritativeAmount,
      },
    });

    return payment;
  }

  /**
   * 2. Cashier views all active offline payment requests
   */
  async getOfflinePaymentRequests(
    user: JwtPayload,
    branchId?: string,
  ): Promise<OfflinePaymentRequestItemDto[]> {
    const targetBranchId = branchId || user.branchId || undefined;
    if (!targetBranchId) return [];
    await this.branchAccess.assertAccess(user, targetBranchId);

    const rows = await this.db
      .select({
        id: payments.id,
        orderId: payments.orderId,
        tableSessionId: payments.tableSessionId,
        payerGuestSessionId: payments.payerGuestSessionId,
        amount: payments.amount,
        tipAmount: payments.tipAmount,
        method: payments.method,
        status: payments.status,
        transactionRef: payments.transactionRef,
        createdAt: payments.createdAt,
        orderNumber: orders.orderNumber,
        tableId: orders.tableId,
        orderBranchId: orders.branchId,
        guestName: orders.guestName,
        sessionBranchId: tableSessions.branchId,
        sessionTableId: tableSessions.tableId,
        tableLabel: tables.label,
      })
      .from(payments)
      .leftJoin(orders, eq(payments.orderId, orders.id))
      .leftJoin(tableSessions, eq(payments.tableSessionId, tableSessions.id))
      .leftJoin(tables, sql`${tables.id} = COALESCE(${orders.tableId}, ${tableSessions.tableId})`)
      .where(
        and(
          eq(payments.status, 'UNPAID'),
          inArray(payments.method, ['CASH', 'CARD']),
          sql`(${orders.branchId} = ${targetBranchId} OR ${tableSessions.branchId} = ${targetBranchId})`
        )
      )
      .orderBy(desc(payments.createdAt));

    return rows.map((r) => ({
      id: r.id,
      paymentId: r.id,
      orderId: r.orderId,
      orderNumber: r.orderNumber ?? undefined,
      tableId: r.tableId || r.sessionTableId || null,
      tableLabel: r.tableLabel || (r.tableId || r.sessionTableId ? 'Table' : undefined),
      customerName: r.guestName ?? undefined,
      tableSessionId: r.tableSessionId,
      payerGuestSessionId: r.payerGuestSessionId,
      amount: r.amount,
      tipAmount: r.tipAmount ?? 0,
      method: r.method,
      status: r.status ?? 'UNPAID',
      transactionRef: r.transactionRef || '',
      createdAt: r.createdAt ?? new Date(),
    }));
  }

  /**
   * 3. Cashier Confirms Payment Received
   */
  async confirmOfflinePayment(
    user: JwtPayload,
    paymentId: string,
    staffUserId: string,
    dto: ConfirmOfflinePaymentDto,
  ): Promise<PaymentEntity> {
    await this.assertPayableAccess(user, { paymentId });
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment request ${paymentId} not found`);
    }

    if (payment.status === 'PAID') {
      throw new BadRequestException('This payment request has already been settled.');
    }

    if (payment.status !== 'UNPAID') {
      throw new BadRequestException(`Cannot confirm payment in ${payment.status} status.`);
    }

    // Resolve staff ID
    let settledStaffId: string | null = staffUserId || null;
    if (staffUserId) {
      const [staffRecord] = await this.db
        .select({ id: staff.id })
        .from(staff)
        .where(eq(staff.userId, staffUserId))
        .limit(1);
      if (staffRecord?.id) settledStaffId = staffRecord.id;
    }

    const finalAmount = dto.receivedAmount ?? payment.amount;
    const finalTip = dto.tipAmount ?? payment.tipAmount;

    return this.completePaymentSettlement(
      payment,
      payment.method,
      payment.transactionRef || generateTransactionRef('SETTLED'),
      settledStaffId,
      finalAmount,
      finalTip,
    );
  }

  /**
   * 4. Cashier Rejects or Cancels an Offline Payment Request
   */
  async rejectOfflinePayment(
    user: JwtPayload,
    paymentId: string,
    staffUserId: string,
    dto: RejectOfflinePaymentDto,
  ): Promise<PaymentEntity> {
    await this.assertPayableAccess(user, { paymentId });
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment request ${paymentId} not found`);
    }

    if (payment.status === 'PAID') {
      throw new BadRequestException('Cannot reject a payment that has already been settled.');
    }

    const updated = await this.paymentRepo.updateStatus(paymentId, 'FAILED', {
      refundRef: dto.reason,
      settledById: staffUserId,
    });

    // Revert table session status to ACTIVE if table was waiting for bill
    if (payment.tableSessionId) {
      await this.db
        .update(tableSessions)
        .set({ status: 'ACTIVE', updatedAt: new Date() })
        .where(eq(tableSessions.id, payment.tableSessionId));
    }

    // Resolve branch ID for notification
    let branchId = '';
    if (payment.orderId) {
      const [ord] = await this.db.select({ branchId: orders.branchId }).from(orders).where(eq(orders.id, payment.orderId)).limit(1);
      if (ord) branchId = ord.branchId;
    } else if (payment.tableSessionId) {
      const [sess] = await this.db.select({ branchId: tableSessions.branchId }).from(tableSessions).where(eq(tableSessions.id, payment.tableSessionId)).limit(1);
      if (sess) branchId = sess.branchId;
    }

    if (branchId) {
      this.realtimeGateway.emitPaymentStatusChanged({
        eventType: 'PAYMENT_STATUS_CHANGED',
        eventId: updated.id,
        branchId,
        paymentId: updated.id,
        orderId: updated.orderId,
        tableSessionId: updated.tableSessionId,
        status: 'FAILED',
        method: updated.method as any,
        amount: Number(updated.amount),
        transactionRef: updated.transactionRef,
        occurredAt: new Date().toISOString(),
      });

      await this.notificationService.create({
        branchId,
        targetRole: 'WAITER',
        type: 'PAYMENT_REJECTED',
        title: 'Payment Request Rejected',
        message: `Offline payment request of $${payment.amount} was rejected: ${dto.reason}`,
        entityType: 'PAYMENT',
        entityId: payment.id,
      });
    }

    return updated;
  }

  // ══════════════════════════════════════════════════════════════════════
  // COMMON / COMPATIBILITY PAYMENT METHODS
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Legacy createPayment for POS direct settlement with authoritative validations
   */
  async createPayment(user: JwtPayload, dto: CreatePaymentDto): Promise<PaymentEntity> {
    if (!dto.orderId && !dto.tableSessionId) {
      throw new BadRequestException('Either orderId or tableSessionId must be provided');
    }
    await this.assertPayableAccess(user, {
      orderId: dto.orderId,
      tableSessionId: dto.tableSessionId,
    });

    const {
      authoritativeAmount,
    } = await this.resolveAndValidatePayableContext({
      orderId: dto.orderId,
      tableSessionId: dto.tableSessionId,
      tipAmount: dto.tipAmount ?? 0,
      discountCode: dto.discountCode,
    });

    const transactionRef = dto.transactionRef ?? generateTransactionRef('POS');

    const payment = await this.paymentRepo.createPayment({
      orderId: dto.orderId ?? null,
      tableSessionId: dto.tableSessionId ?? null,
      payerGuestSessionId: dto.payerGuestSessionId ?? null,
      paidForGuestIds: dto.paidForGuestIds ?? [],
      scope: dto.scope,
      amount: authoritativeAmount,
      tipAmount: dto.tipAmount ?? 0,
      method: dto.method,
      status: 'UNPAID',
      transactionRef,
      paidAt: null,
    });

    return this.completePaymentSettlement(
      payment,
      dto.method,
      transactionRef,
      null,
      authoritativeAmount,
      dto.tipAmount ?? 0,
    );
  }

  /**
   * Process a split payment with item or guest allocations
   */
  async createSplitPayment(user: JwtPayload, dto: CreateSplitPaymentDto): Promise<{
    payment: PaymentEntity;
    allocations: PaymentAllocationEntity[];
  }> {
    if (!dto.allocations || dto.allocations.length === 0) {
      throw new BadRequestException('At least one allocation is required for split payment');
    }
    await this.assertPayableAccess(user, {
      orderId: dto.orderId,
      tableSessionId: dto.tableSessionId,
    });

    const totalAllocated = dto.allocations.reduce((acc, curr) => acc + curr.amount, 0);
    const transactionRef = dto.transactionRef ?? generateTransactionRef('SPLIT');

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

    let branchIdForEvent = '';
    for (const a of dto.allocations) {
      const oId = a.orderId ?? dto.orderId;
      if (oId) {
        const [targetOrder] = await this.db.select().from(orders).where(eq(orders.id, oId)).limit(1);
        if (targetOrder) {
          branchIdForEvent = targetOrder.branchId;
          const newAmountPaid = (targetOrder.amountPaid ?? 0) + a.amount;
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
    }

    if (branchIdForEvent) {
      this.realtimeGateway.emitPaymentStatusChanged({
        eventType: 'PAYMENT_STATUS_CHANGED',
        eventId: payment.id,
        branchId: branchIdForEvent,
        paymentId: payment.id,
        orderId: payment.orderId,
        tableSessionId: payment.tableSessionId,
        status: 'PAID',
        method: payment.method as any,
        amount: Number(payment.amount),
        transactionRef: payment.transactionRef,
        occurredAt: new Date().toISOString(),
      });
    }

    return { payment, allocations };
  }

  /**
   * Validate and calculate promo voucher discount
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
  async refundPayment(
    user: JwtPayload,
    paymentId: string,
    dto: RefundPaymentDto,
  ): Promise<PaymentEntity> {
    await this.assertPayableAccess(user, { paymentId });
    if (!isStaffPaymentActor(user)) {
      throw new ForbiddenException('Only staff can refund payments');
    }
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

    let branchId = '';
    if (payment.orderId) {
      const [ord] = await this.db.select({ branchId: orders.branchId }).from(orders).where(eq(orders.id, payment.orderId)).limit(1);
      if (ord) branchId = ord.branchId;
    }

    this.realtimeGateway.emitPaymentStatusChanged({
      eventType: 'PAYMENT_STATUS_CHANGED',
      eventId: updated.id,
      branchId,
      paymentId: updated.id,
      orderId: updated.orderId,
      tableSessionId: updated.tableSessionId,
      status: (newStatus === 'REFUNDED' ? 'REFUNDED' : 'PARTIALLY_PAID') as any,
      method: updated.method as any,
      amount: Number(updated.amount),
      transactionRef: updated.transactionRef,
      occurredAt: new Date().toISOString(),
    });

    return updated;
  }

  /**
   * Get payment receipt by ID
   */
  async getPayment(
    user: JwtPayload,
    paymentId: string,
  ): Promise<PaymentEntity & { allocations: PaymentAllocationEntity[] }> {
    await this.assertPayableAccess(user, { paymentId });
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');

    const allocations = await this.paymentRepo.findAllocationsByPaymentId(paymentId);
    return { ...payment, allocations };
  }

  /**
   * Get payments by Order ID
   */
  async getPaymentsByOrder(user: JwtPayload, orderId: string): Promise<PaymentEntity[]> {
    await this.assertPayableAccess(user, { orderId });
    return this.paymentRepo.findByOrderId(orderId);
  }

  /**
   * Calculate Table Bill
   */
  /** Authenticated bill calculation (customer participant or staff with branch access). */
  async calculateTableBill(user: JwtPayload, tableSessionId: string) {
    await this.assertPayableAccess(user, { tableSessionId });
    return this.computeTableBill(tableSessionId);
  }

  /**
   * Trusted internal callers (AI tool gateway after its own authz) — no JWT ownership check.
   * Do not expose on HTTP controllers.
   */
  async calculateTableBillInternal(tableSessionId: string) {
    return this.computeTableBill(tableSessionId);
  }

  private async computeTableBill(tableSessionId: string) {
    const sessionOrders = await this.db
      .select()
      .from(orders)
      .where(eq(orders.tableSessionId, tableSessionId));

    let subtotal = 0;
    let taxAmount = 0;
    let serviceCharge = 0;
    let totalAmount = 0;
    let confirmedCount = 0;

    for (const order of sessionOrders) {
      if (order.status !== 'CANCELLED' && order.status !== 'REJECTED') {
        subtotal += order.subtotal ?? 0;
        taxAmount += order.taxAmount ?? 0;
        serviceCharge += order.serviceCharge ?? 0;
        totalAmount += order.totalAmount ?? 0;
        if (order.status && CONFIRMED_ORDER_STATUSES.includes(order.status)) {
          confirmedCount++;
        }
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
      confirmedOrdersCount: confirmedCount,
      subtotal,
      taxAmount,
      serviceCharge,
      totalAmount,
      paidAmount,
      balanceDue,
      isFullyPaid: balanceDue === 0 && totalAmount > 0,
      isEligibleForPayment: confirmedCount > 0,
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Validates order confirmation state and calculates authoritative balance due
   */
  private async resolveAndValidatePayableContext(params: {
    orderId?: string;
    tableSessionId?: string;
    tipAmount: number;
    discountCode?: string;
  }): Promise<{
    authoritativeAmount: number;
    currency: string;
    branchId: string;
    tableId: string | null;
    tableLabel: string | null;
    customerId: string | null;
    order?: any;
  }> {
    let authoritativeAmount = 0;
    let branchId = '';
    let tableId: string | null = null;
    let tableLabel: string | null = null;
    let customerId: string | null = null;
    let foundOrder: any = null;

    if (params.orderId) {
      const [order] = await this.db
        .select()
        .from(orders)
        .where(eq(orders.id, params.orderId))
        .limit(1);

      if (!order) {
        throw new NotFoundException(`Order ${params.orderId} not found`);
      }

      // Check order confirmation status
      if (order.status === 'DRAFT' || order.status === 'PENDING') {
        throw new BadRequestException(
          'Payment cannot be processed for order in PENDING status. Order must first be confirmed by waitstaff.'
        );
      }

      if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
        throw new BadRequestException(`Cannot process payment for an order in ${order.status} status.`);
      }

      if (order.paymentStatus === 'PAID') {
        throw new BadRequestException('This order is already fully paid.');
      }

      foundOrder = order;
      branchId = order.branchId;
      tableId = order.tableId;
      customerId = order.customerId;

      const outstandingBalance = Math.max(0, order.totalAmount - (order.amountPaid ?? 0));
      authoritativeAmount = outstandingBalance;
    } else if (params.tableSessionId) {
      const [session] = await this.db
        .select()
        .from(tableSessions)
        .where(eq(tableSessions.id, params.tableSessionId))
        .limit(1);

      if (!session) {
        throw new NotFoundException(`Table session ${params.tableSessionId} not found`);
      }

      branchId = session.branchId;
      tableId = session.tableId;

      const bill = await this.computeTableBill(params.tableSessionId);
      if (bill.confirmedOrdersCount === 0) {
        throw new BadRequestException(
          'No confirmed orders available for payment. Wait for the waiter to confirm at least one order.'
        );
      }

      if (bill.isFullyPaid) {
        throw new BadRequestException('This table session is already fully paid.');
      }

      authoritativeAmount = bill.balanceDue;
    }

    // Resolve table label if table exists
    if (tableId) {
      const [tbl] = await this.db
        .select({ label: tables.label })
        .from(tables)
        .where(eq(tables.id, tableId))
        .limit(1);
      if (tbl) tableLabel = tbl.label;
    }

    // Apply promo voucher discount if provided
    if (params.discountCode) {
      const discount = await this.validateDiscountInternal(params.discountCode, authoritativeAmount);
      authoritativeAmount = Math.max(0, authoritativeAmount - discount.discountAmount);
      await this.paymentRepo.incrementDiscountUsage(discount.discountId);
    }

    // Add tip amount
    authoritativeAmount += params.tipAmount;

    // Resolve currency from branchSettings
    let currency = 'USD';
    const [settings] = await this.db
      .select({ currency: branchSettings.currency })
      .from(branchSettings)
      .where(eq(branchSettings.branchId, branchId))
      .limit(1);
    if (settings?.currency) {
      currency = settings.currency;
    }

    return {
      authoritativeAmount: Number(authoritativeAmount.toFixed(2)),
      currency,
      branchId,
      tableId,
      tableLabel,
      customerId,
      order: foundOrder,
    };
  }

  /**
   * Final Authoritative Payment Settlement (State updates, events, notifications)
   */
  private async completePaymentSettlement(
    payment: PaymentEntity,
    method: string,
    transactionRef: string,
    settledById?: string | null,
    amountOverride?: number,
    tipOverride?: number,
  ): Promise<PaymentEntity> {
    const finalAmount = amountOverride ?? payment.amount;
    const finalTip = tipOverride ?? payment.tipAmount;

    // 1. Update Payment Record to PAID
    const updatedPayment = await this.paymentRepo.updateStatus(payment.id, 'PAID', {
      transactionRef,
      paidAt: new Date(),
      settledById: settledById ?? undefined,
      collectedById: settledById ?? undefined,
    });

    let branchIdForEvent = '';

    // 2. Update Order Record if bound to single order
    if (payment.orderId) {
      const [order] = await this.db
        .select()
        .from(orders)
        .where(eq(orders.id, payment.orderId))
        .limit(1);

      if (order) {
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
      }
    }

    // 3. Update Table Session Orders if session scope
    if (payment.tableSessionId) {
      const [session] = await this.db
        .select()
        .from(tableSessions)
        .where(eq(tableSessions.id, payment.tableSessionId))
        .limit(1);

      if (session) {
        if (!branchIdForEvent) branchIdForEvent = session.branchId;

        if (!payment.orderId) {
          const sessionOrders = await this.db
            .select()
            .from(orders)
            .where(eq(orders.tableSessionId, payment.tableSessionId));

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
      }
    }

    // 4. Emit Realtime Events via Socket.IO
    this.realtimeGateway.emitPaymentStatusChanged({
      eventType: 'PAYMENT_STATUS_CHANGED',
      eventId: updatedPayment.id,
      branchId: branchIdForEvent,
      paymentId: updatedPayment.id,
      orderId: updatedPayment.orderId,
      tableSessionId: updatedPayment.tableSessionId,
      status: 'PAID',
      method: method as any,
      amount: Number(finalAmount),
      transactionRef,
      occurredAt: new Date().toISOString(),
    });

    // 5. Emit Outbox Event for Background Workers
    await this.outboxService.publishEvent({
      aggregateType: 'PAYMENT',
      aggregateId: updatedPayment.id,
      eventType: 'PaymentCompleted',
      branchId: branchIdForEvent || null,
      payload: {
        paymentId: updatedPayment.id,
        orderId: updatedPayment.orderId,
        tableSessionId: updatedPayment.tableSessionId,
        amount: finalAmount,
        tipAmount: finalTip,
        method,
        transactionRef,
        paidAt: new Date().toISOString(),
      },
    });

    // 6. Create Persistent Notification
    if (branchIdForEvent) {
      await this.notificationService.create({
        branchId: branchIdForEvent,
        targetRole: 'CASHIER',
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Received',
        message: `Payment of $${finalAmount.toFixed(2)} settled via ${method}.`,
        entityType: 'PAYMENT',
        entityId: updatedPayment.id,
      });
    }

    return updatedPayment;
  }

  async listPayments(
    user: JwtPayload,
    query: {
      organizationId?: string;
      branchId?: string;
      status?: string;
      page?: number;
      limit?: number;
      search?: string;
    },
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 12));
    const offset = (page - 1) * limit;

    const organizationId = isSuperAdmin(user)
      ? query.organizationId
      : query.organizationId || user.organizationId;

    if (!isSuperAdmin(user) && !organizationId) {
      throw new BadRequestException('organizationId is required');
    }

    const conditions = [];
    if (organizationId) {
      conditions.push(eq(restaurants.organizationId, organizationId));
    }
    if (query.branchId) {
      conditions.push(eq(branches.id, query.branchId));
    }
    if (query.status) {
      conditions.push(eq(payments.status, query.status as any));
    }
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      conditions.push(
        or(ilike(orders.orderNumber, term), sql`${payments.id}::text ilike ${term}`),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(payments)
      .leftJoin(orders, eq(payments.orderId, orders.id))
      .leftJoin(tableSessions, eq(payments.tableSessionId, tableSessions.id))
      .leftJoin(
        branches,
        sql`COALESCE(${orders.branchId}, ${tableSessions.branchId}) = ${branches.id}`,
      )
      .leftJoin(restaurants, eq(branches.restaurantId, restaurants.id))
      .where(whereClause);

    const rows = await this.db
      .select({
        payment: payments,
        orderNumber: orders.orderNumber,
        branchId: branches.id,
        branchName: branches.name,
        restaurantName: restaurants.name,
      })
      .from(payments)
      .leftJoin(orders, eq(payments.orderId, orders.id))
      .leftJoin(tableSessions, eq(payments.tableSessionId, tableSessions.id))
      .leftJoin(
        branches,
        sql`COALESCE(${orders.branchId}, ${tableSessions.branchId}) = ${branches.id}`,
      )
      .leftJoin(restaurants, eq(branches.restaurantId, restaurants.id))
      .where(whereClause)
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

    const total = countRow?.total ?? 0;
    return {
      data: rows.map((row) => ({
        id: row.payment.id,
        orderId: row.payment.orderId,
        orderNumber: row.orderNumber,
        tableSessionId: row.payment.tableSessionId,
        branchId: row.branchId,
        branchName: row.branchName,
        restaurantName: row.restaurantName,
        amount: row.payment.amount,
        tipAmount: row.payment.tipAmount,
        method: row.payment.method,
        status: row.payment.status,
        transactionRef: row.payment.transactionRef,
        paidAt: row.payment.paidAt,
        createdAt: row.payment.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

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
      discountAmount: Number(discountAmount.toFixed(2)),
    };
  }
}
