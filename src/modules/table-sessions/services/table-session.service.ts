// ============================================================================
// Table Sessions — Customer Flow Entry Point
// ============================================================================
//
// Operational Flow (per CORE.md § 3.9 & 4):
//   1. Customer scans QR code at table (gets branch + table context)
//   2. Customer requests table OTP (POST /sessions/table-otp/request)
//   3. Customer verifies OTP (POST /sessions/table-otp/verify) -> Authenticated Guest Session
//      - First guest opens TableSession as host (Table -> OCCUPIED)
//      - Subsequent guests join active TableSession without collision
//   4. Order mode selection (individual vs. together)
//   5. Share code generation for companion guests
//   6. Session closure with payment & kitchen invariant gates (Table -> AVAILABLE)
// ============================================================================

import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { randomInt, timingSafeEqual } from 'node:crypto';
import { eq, and, gt, lt, desc, inArray } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';
import { InternalOperationException } from '../../../common/errors/app.exception';
import {
  DRIZZLE,
  type DrizzleDatabase,
  tableSessions,
  guestSessions,
  tables,
  branches,
  orders,
  orderItems,
  tableAuthOtps,
  customers,
  OutboxService,
} from '@/database';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { NotificationService } from '../../notifications/services/notification.service';
import { MailService } from '../../notifications/services/mail.service';
import { DrizzleQueryBuilder } from '../../../common/database';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  TOKEN_TYPE,
} from '../../identity/services/token-policy';
import { BranchAccessService } from '../../authorization/services/branch-access.service';
import { isSessionParticipant, isStaffActor, type SessionActor } from '../domain/session-access';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';

const JOIN_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const JOIN_CODE_TTL_MS = 4 * 60 * 60 * 1000;
const OTP_RESEND_WINDOW_MS = 60 * 1000;
const JOIN_ATTEMPT_WINDOW_MS = 60 * 1000;
const JOIN_ATTEMPT_LIMIT = 5;
const joinAttempts = new Map<string, number[]>();

function generateJoinCode(): string {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += JOIN_CODE_ALPHABET[randomInt(0, JOIN_CODE_ALPHABET.length)];
  }
  return code;
}

function joinCodeExpiry(from = new Date()): Date {
  return new Date(from.getTime() + JOIN_CODE_TTL_MS);
}

function assertJoinRateLimit(code: string): void {
  const now = Date.now();
  const recent = (joinAttempts.get(code) ?? []).filter((ts) => now - ts < JOIN_ATTEMPT_WINDOW_MS);
  if (recent.length >= JOIN_ATTEMPT_LIMIT) {
    throw new HttpException('Too many join attempts. Try again shortly.', HttpStatus.TOO_MANY_REQUESTS);
  }
  recent.push(now);
  joinAttempts.set(code, recent);
}

function looksLikeEmail(value: string): boolean {
  return value.includes('@');
}

@Injectable()
export class TableSessionService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
    private readonly outboxService: OutboxService,
    private readonly jwtService: JwtService,
    private readonly branchAccess: BranchAccessService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
  ) {}

  /**
   * POST /sessions/table-otp/request
   * Step 2 of Customer Flow: Enter phone/email to receive verification OTP
   */
  async requestTableAuthOtp(dto: {
    branchId: string;
    tableId: string;
    contact: string;
    tableSessionId?: string;
  }) {
    await this.assertTableOrderable(dto.branchId, dto.tableId);

    const contact = dto.contact.trim();
    if (!contact) {
      throw new BadRequestException('Contact is required');
    }

    const [recent] = await this.db
      .select({ createdAt: tableAuthOtps.createdAt })
      .from(tableAuthOtps)
      .where(
        and(
          eq(tableAuthOtps.contact, contact),
          eq(tableAuthOtps.tableId, dto.tableId),
          gt(tableAuthOtps.createdAt, new Date(Date.now() - OTP_RESEND_WINDOW_MS)),
        ),
      )
      .orderBy(desc(tableAuthOtps.createdAt))
      .limit(1);
    if (recent) {
      throw new HttpException('Please wait before requesting another code', HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.db.insert(tableAuthOtps).values({
      contact,
      tableId: dto.tableId,
      tableSessionId: dto.tableSessionId ?? null,
      purpose: 'TABLE_AUTH',
      otp: code,
      attempts: 0,
      expiresAt,
      verified: false,
    });

    if (looksLikeEmail(contact)) {
      const mailResult = await this.mailService.sendVerificationCode(contact, 'Guest', code);
      if (!mailResult.success && process.env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException('Unable to send the verification code. Please try again.');
      }
    } else {
      await this.notificationService.create({
        branchId: dto.branchId,
        targetRole: 'WAITER',
        type: 'TABLE_OTP_REQUESTED',
        title: 'Table verification requested',
        message: `A diner at this table requested a verification code for ${contact}.`,
        entityType: 'TABLE',
        entityId: dto.tableId,
      });
    }

    return {
      success: true,
      message: 'Verification code sent',
      devOtp: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  private safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  }

  /**
   * POST /sessions/table-otp/verify
   * Step 2 & 3 of Customer Flow: Verify OTP -> Authenticated Guest Session bound to Table Session
   */
  async verifyTableAuthOtp(dto: {
    branchId: string;
    tableId: string;
    contact: string;
    code: string;
    displayName?: string;
    tableNumber?: string;
    /** Authenticated customer user id, when the diner already has an account. */
    userId?: string;
  }) {
    await this.assertTableOrderable(dto.branchId, dto.tableId);

    const contact = dto.contact.trim();
    const code = dto.code.trim();
    const [otpRecord] = await this.db
      .select()
      .from(tableAuthOtps)
      .where(
        and(
          eq(tableAuthOtps.contact, contact),
          eq(tableAuthOtps.tableId, dto.tableId),
          eq(tableAuthOtps.verified, false),
          gt(tableAuthOtps.expiresAt, new Date()),
          lt(tableAuthOtps.attempts, 5),
        ),
      )
      .orderBy(desc(tableAuthOtps.createdAt))
      .limit(1);

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    const matches = this.safeCompare(otpRecord.otp, code);
    if (!matches) {
      const nextAttempts = (otpRecord.attempts ?? 0) + 1;
      if (nextAttempts >= 5) {
        await this.db
          .delete(tableAuthOtps)
          .where(eq(tableAuthOtps.id, otpRecord.id));
        throw new BadRequestException('Too many failed attempts. This verification code has been revoked.');
      } else {
        await this.db
          .update(tableAuthOtps)
          .set({ attempts: nextAttempts })
          .where(eq(tableAuthOtps.id, otpRecord.id));
        throw new BadRequestException(`Incorrect verification code. ${5 - nextAttempts} attempt(s) remaining.`);
      }
    }

    await this.db
      .update(tableAuthOtps)
      .set({ verified: true })
      .where(eq(tableAuthOtps.id, otpRecord.id));

    // Check for existing active table session
    const [existingSession] = await this.db
      .select()
      .from(tableSessions)
      .where(
        and(
          eq(tableSessions.branchId, dto.branchId),
          eq(tableSessions.tableId, dto.tableId),
          eq(tableSessions.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    let session = existingSession;
    let isHost = false;

    if (!session) {
      const [created] = await this.db
        .insert(tableSessions)
        .values({
          branchId: dto.branchId,
          tableId: dto.tableId,
          joinCode: generateJoinCode(),
          joinCodeExpiresAt: joinCodeExpiry(),
          status: 'ACTIVE',
        })
        .returning();

      if (!created) {
        throw new BadRequestException('Failed to create table session');
      }
      session = created;
      isHost = true;

      // Transition Table Service Status to OCCUPIED
      await this.db
        .update(tables)
        .set({ serviceStatus: 'OCCUPIED', updatedAt: new Date() })
        .where(eq(tables.id, dto.tableId));

      await this.outboxService.publishEvent({
        aggregateType: 'TABLE',
        aggregateId: dto.tableId,
        eventType: 'TableStatusChanged',
        branchId: dto.branchId,
        payload: {
          tableId: dto.tableId,
          tableLabel: dto.tableNumber ?? 'Table',
          branchId: dto.branchId,
          serviceStatus: 'OCCUPIED',
          operationalFlag: 'NORMAL',
          activeSessionId: created.id,
          updatedAt: new Date().toISOString(),
        },
      });

      this.realtimeGateway.emitTableStatusChanged({
        eventType: 'TABLE_STATUS_CHANGED',
        eventId: dto.tableId,
        branchId: dto.branchId,
        tableId: dto.tableId,
        tableLabel: dto.tableNumber ?? 'Table',
        serviceStatus: 'OCCUPIED',
        operationalFlag: 'NORMAL',
        activeSessionId: created.id,
        occurredAt: new Date().toISOString(),
      });

      this.realtimeGateway.emitTableSessionStatusChanged({
        eventType: 'TABLE_SESSION_STATUS_CHANGED',
        eventId: created.id,
        branchId: dto.branchId,
        tableId: dto.tableId,
        tableSessionId: created.id,
        status: 'ACTIVE',
        guestCount: 1,
        occurredAt: new Date().toISOString(),
      });

      await this.outboxService.publishEvent({
        aggregateType: 'TABLE_SESSION',
        aggregateId: created.id,
        eventType: 'TableSessionStarted',
        branchId: dto.branchId,
        payload: {
          tableSessionId: created.id,
          tableId: dto.tableId,
          tableLabel: dto.tableNumber ?? 'Table',
          branchId: dto.branchId,
          openedAt: new Date().toISOString(),
        },
      });
    }

    const customerId = await this.resolveCustomerId(dto.userId, contact);

    const [guest] = await this.db
      .insert(guestSessions)
      .values({
        tableSessionId: session.id,
        customerId,
        displayName: dto.displayName ?? (isHost ? 'Host' : 'Guest'),
        contact,
        otpVerifiedAt: new Date(),
        isHostGuest: isHost,
        status: 'ACTIVE',
      })
      .returning();

    if (!guest) {
      throw new InternalOperationException('Failed to create guest session');
    }

    await this.outboxService.publishEvent({
      aggregateType: 'GUEST_SESSION',
      aggregateId: guest.id,
      eventType: 'GuestJoinedSession',
      branchId: dto.branchId,
      payload: {
        tableSessionId: session.id,
        guestSessionId: guest.id,
        displayName: guest.displayName,
        isHost,
        joinedAt: new Date().toISOString(),
      },
    });

    const accessToken = this.signGuestToken({
      guestSessionId: guest.id,
      tableSessionId: session.id,
      tableId: dto.tableId,
      branchId: dto.branchId,
      customerId,
    });

    return {
      session,
      guestSession: guest,
      accessToken,
      isHost,
    };
  }

  /**
   * POST /sessions/scan
   * Figma: QR Scan Screen → Splash Screen
   */
  async scanQr(data: {
    branchId: string;
    tableId: string;
    tableNumber?: string;
    userId?: string;
    displayName?: string;
  }) {
    await this.assertTableOrderable(data.branchId, data.tableId);

    // Check for existing active session on this table
    const [existing] = await this.db
      .select()
      .from(tableSessions)
      .where(
        and(
          eq(tableSessions.branchId, data.branchId),
          eq(tableSessions.tableId, data.tableId),
          eq(tableSessions.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    let session = existing;
    let isNew = false;

    if (!session) {
      const [created] = await this.db
        .insert(tableSessions)
        .values({
          branchId: data.branchId,
          tableId: data.tableId,
          joinCode: generateJoinCode(),
          joinCodeExpiresAt: joinCodeExpiry(),
          status: 'ACTIVE',
        })
        .returning();
      if (!created) {
        throw new BadRequestException('Failed to create table session');
      }
      session = created;
      isNew = true;

      // Table Service Status moves AVAILABLE -> OCCUPIED
      await this.db
        .update(tables)
        .set({ serviceStatus: 'OCCUPIED', updatedAt: new Date() })
        .where(eq(tables.id, data.tableId));

      await this.outboxService.publishEvent({
        aggregateType: 'TABLE',
        aggregateId: data.tableId,
        eventType: 'TableStatusChanged',
        branchId: data.branchId,
        payload: {
          tableId: data.tableId,
          tableLabel: data.tableNumber ?? 'Table',
          branchId: data.branchId,
          serviceStatus: 'OCCUPIED',
          operationalFlag: 'NORMAL',
          activeSessionId: created.id,
          updatedAt: new Date().toISOString(),
        },
      });

      await this.outboxService.publishEvent({
        aggregateType: 'TABLE_SESSION',
        aggregateId: created.id,
        eventType: 'TableSessionStarted',
        branchId: data.branchId,
        payload: {
          tableSessionId: created.id,
          tableId: data.tableId,
          tableLabel: data.tableNumber ?? 'Table',
          branchId: data.branchId,
          openedAt: new Date().toISOString(),
        },
      });
    }

    // Create guest session for this customer (host if new)
    let guestSession = null;
    if (session) {
      const [existingGuest] = await this.db
        .select()
        .from(guestSessions)
        .where(
          and(
            eq(guestSessions.tableSessionId, session.id),
            eq(guestSessions.status, 'ACTIVE'),
          ),
        )
        .limit(1);

      const isHost = isNew || !existingGuest;

      const [newGuest] = await this.db
        .insert(guestSessions)
        .values({
          tableSessionId: session.id,
          displayName: data.displayName ?? (isHost ? 'Host' : 'Guest'),
          isHostGuest: isHost,
          status: 'ACTIVE',
        })
        .returning();

      if (newGuest) {
        guestSession = newGuest;

        await this.outboxService.publishEvent({
          aggregateType: 'GUEST_SESSION',
          aggregateId: newGuest.id,
          eventType: 'GuestJoinedSession',
          branchId: data.branchId,
          payload: {
            tableSessionId: session.id,
            guestSessionId: newGuest.id,
            displayName: newGuest.displayName,
            isHost,
            joinedAt: new Date().toISOString(),
          },
        });
      }
    }

    return { session, guestSession, isNew };
  }

  /**
   * GET /sessions/:sessionId
   * Returns current session with all guests
   */
  async getSession(sessionId: string, actor: JwtPayload) {
    const { session, guests } = await this.requireSessionWithGuests(sessionId);
    await this.assertCanAccessSession(actor, session, guests);
    return { session, guests };
  }

  /**
   * Get all table sessions for a branch with optional status filter.
   */
  async findSessionsByBranch(user: JwtPayload, branchId: string, status?: string) {
    await this.branchAccess.assertAccess(user, branchId);
    const qb = new DrizzleQueryBuilder<typeof tableSessions>(this.db, tableSessions)
      .filterExact({ branchId, status })
      .sort('startedAt', 'desc');

    return qb.executePlain();
  }

  /**
   * POST /sessions/:sessionId/share-code
   * Figma: "Share Code" screen — generates/refreshes join code
   */
  async generateShareCode(sessionId: string, actor: JwtPayload) {
    const { session, guests } = await this.requireSessionWithGuests(sessionId);
    await this.assertCanAccessSession(actor, session, guests);

    const code = generateJoinCode();
    const expiresAt = joinCodeExpiry();

    await this.db
      .update(tableSessions)
      .set({ joinCode: code, joinCodeExpiresAt: expiresAt, updatedAt: new Date() })
      .where(eq(tableSessions.id, sessionId));

    return { code, expiresAt };
  }

  /**
   * POST /sessions/join
   * Figma: Guest enters Join Code → joins active session without collision
   */
  async joinByCode(data: { code: string; displayName?: string; userId?: string }) {
    const code = data.code.trim().toUpperCase();
    if (!code) {
      throw new BadRequestException('Join code is required');
    }
    assertJoinRateLimit(code);

    const [session] = await this.db
      .select()
      .from(tableSessions)
      .where(
        and(
          eq(tableSessions.joinCode, code),
          eq(tableSessions.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    if (!session) {
      throw new BadRequestException('Invalid or expired join code');
    }
    const expiresAt =
      session.joinCodeExpiresAt ??
      (session.updatedAt
        ? new Date(session.updatedAt.getTime() + JOIN_CODE_TTL_MS)
        : session.startedAt
          ? new Date(session.startedAt.getTime() + JOIN_CODE_TTL_MS)
          : null);
    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired join code');
    }

    await this.assertTableOrderable(session.branchId, session.tableId);
    const customerId = await this.resolveCustomerId(data.userId);

    const [guest] = await this.db
      .insert(guestSessions)
      .values({
        tableSessionId: session.id,
        customerId,
        displayName: data.displayName ?? 'Guest',
        isHostGuest: false,
        status: 'ACTIVE',
      })
      .returning();

    if (!guest) {
      throw new InternalOperationException('Failed to create guest session');
    }

    await this.outboxService.publishEvent({
      aggregateType: 'GUEST_SESSION',
      aggregateId: guest.id,
      eventType: 'GuestJoinedSession',
      branchId: session.branchId,
      payload: {
        tableSessionId: session.id,
        guestSessionId: guest.id,
        displayName: guest.displayName,
        isHost: false,
        joinedAt: new Date().toISOString(),
      },
    });

    const accessToken = this.signGuestToken({
      guestSessionId: guest.id,
      tableSessionId: session.id,
      tableId: session.tableId,
      branchId: session.branchId,
      customerId,
    });

    return { session, guestSession: guest, accessToken };
  }

  async setOrderMode(
    actor: JwtPayload,
    customerSessionId: string,
    orderMode: 'individual' | 'together',
  ) {
    const [guest] = await this.db
      .select()
      .from(guestSessions)
      .where(and(eq(guestSessions.id, customerSessionId), eq(guestSessions.status, 'ACTIVE')))
      .limit(1);
    if (!guest) {
      throw new NotFoundException('Guest session not found');
    }
    const { session, guests } = await this.requireSessionWithGuests(guest.tableSessionId);
    await this.assertCanAccessSession(actor, session, guests);
    return { success: true, orderMode };
  }

  /**
   * POST /sessions/:sessionId/close
   * Closes the table session after verifying payment and preparation invariants.
   * Resets table service status to AVAILABLE.
   */
  async closeSession(sessionId: string, actor: JwtPayload) {
    const { session, guests } = await this.requireSessionWithGuests(sessionId);
    await this.assertCanAccessSession(actor, session, guests);

    // Invariant 1: Ensure all orders in this table session are paid
    const sessionOrders = await this.db
      .select({
        id: orders.id,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        totalAmount: orders.totalAmount,
      })
      .from(orders)
      .where(eq(orders.tableSessionId, sessionId));

    const unpaidOrders = sessionOrders.filter(
      (o) => o.paymentStatus !== 'PAID' && o.status !== 'CANCELLED' && o.status !== 'REJECTED',
    );
    if (unpaidOrders.length > 0) {
      throw new BadRequestException(
        `Cannot close table session: ${unpaidOrders.length} order(s) remain unpaid. Settle all orders before closing.`,
      );
    }

    // Invariant 2: Ensure no kitchen or bar items are currently in preparation
    const activeItems = await this.db
      .select({ id: orderItems.id, status: orderItems.status })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(orders.tableSessionId, sessionId),
          inArray(orderItems.status, ['PENDING', 'PREPARING']),
        ),
      );

    if (activeItems.length > 0) {
      throw new BadRequestException(
        `Cannot close table session: ${activeItems.length} kitchen/bar item(s) are still in preparation.`,
      );
    }

    const totalPaid = sessionOrders.reduce(
      (sum, o) => sum + (o.paymentStatus === 'PAID' ? o.totalAmount : 0),
      0,
    );

    await this.db
      .update(tableSessions)
      .set({ status: 'COMPLETED', endedAt: new Date(), updatedAt: new Date() })
      .where(eq(tableSessions.id, sessionId));

    await this.db
      .update(guestSessions)
      .set({ status: 'CLOSED', leftAt: new Date(), updatedAt: new Date() })
      .where(eq(guestSessions.tableSessionId, sessionId));

    // Reset Table Service Status to AVAILABLE
    await this.db
      .update(tables)
      .set({ serviceStatus: 'AVAILABLE', updatedAt: new Date() })
      .where(eq(tables.id, session.tableId));

    this.realtimeGateway.emitTableSessionStatusChanged({
      eventType: 'TABLE_SESSION_STATUS_CHANGED',
      eventId: session.id,
      branchId: session.branchId,
      tableId: session.tableId,
      tableSessionId: session.id,
      status: 'COMPLETED',
      occurredAt: new Date().toISOString(),
    });

    this.realtimeGateway.emitTableStatusChanged({
      eventType: 'TABLE_STATUS_CHANGED',
      eventId: session.tableId,
      branchId: session.branchId,
      tableId: session.tableId,
      tableLabel: 'Table',
      serviceStatus: 'AVAILABLE',
      operationalFlag: 'NORMAL',
      activeSessionId: null,
      occurredAt: new Date().toISOString(),
    });

    await this.outboxService.publishEvent({
      aggregateType: 'TABLE',
      aggregateId: session.tableId,
      eventType: 'TableStatusChanged',
      branchId: session.branchId,
      payload: {
        tableId: session.tableId,
        tableLabel: 'Table',
        branchId: session.branchId,
        serviceStatus: 'AVAILABLE',
        operationalFlag: 'NORMAL',
        activeSessionId: null,
        updatedAt: new Date().toISOString(),
      },
    });

    await this.outboxService.publishEvent({
      aggregateType: 'TABLE_SESSION',
      aggregateId: session.id,
      eventType: 'TableSessionClosed',
      branchId: session.branchId,
      payload: {
        tableSessionId: session.id,
        tableId: session.tableId,
        tableLabel: 'Table',
        branchId: session.branchId,
        totalPaid,
        closedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * POST /sessions/:id/request-bill
   * Guest requests bill settlement
   */
  async requestBill(sessionId: string, actor: JwtPayload) {
    const { session, guests } = await this.requireSessionWithGuests(sessionId);
    await this.assertCanAccessSession(actor, session, guests);

    await this.db
      .update(tableSessions)
      .set({ status: 'BILL_REQUESTED', updatedAt: new Date() })
      .where(eq(tableSessions.id, sessionId));

    await this.db
      .update(tables)
      .set({ serviceStatus: 'PAYMENT_PENDING', updatedAt: new Date() })
      .where(eq(tables.id, session.tableId));

    this.realtimeGateway.emitTableSessionStatusChanged({
      eventType: 'TABLE_SESSION_STATUS_CHANGED',
      eventId: session.id,
      branchId: session.branchId,
      tableId: session.tableId,
      tableSessionId: session.id,
      status: 'BILL_REQUESTED',
      occurredAt: new Date().toISOString(),
    });

    this.realtimeGateway.emitTableStatusChanged({
      eventType: 'TABLE_STATUS_CHANGED',
      eventId: session.tableId,
      branchId: session.branchId,
      tableId: session.tableId,
      tableLabel: 'Table',
      serviceStatus: 'PAYMENT_PENDING',
      operationalFlag: 'NORMAL',
      activeSessionId: session.id,
      occurredAt: new Date().toISOString(),
    });

    // Persistent notifications for Cashier and Waitstaff
    await this.notificationService.create({
      branchId: session.branchId,
      targetRole: 'CASHIER',
      type: 'BILL_REQUESTED',
      title: 'Bill Requested',
      message: `Table session has requested the bill.`,
      entityType: 'TABLE_SESSION',
      entityId: session.id,
    });

    await this.notificationService.create({
      branchId: session.branchId,
      targetRole: 'WAITER',
      type: 'BILL_REQUESTED',
      title: 'Bill Requested',
      message: `Table session has requested the bill.`,
      entityType: 'TABLE_SESSION',
      entityId: session.id,
    });

    return { success: true, status: 'BILL_REQUESTED' };
  }

  /**
   * POST /sessions/:id/call-waiter
   * Guest calls staff to table
   */
  async callWaiter(sessionId: string, actor: JwtPayload, reason?: string) {
    const { session, guests } = await this.requireSessionWithGuests(sessionId);
    await this.assertCanAccessSession(actor, session, guests);

    await this.notificationService.create({
      branchId: session.branchId,
      targetRole: 'WAITER',
      type: 'CALL_WAITER',
      title: 'Customer Calling Waiter',
      message: reason ? `Assistance requested: ${reason}` : 'Guest requested waiter assistance.',
      entityType: 'TABLE_SESSION',
      entityId: session.id,
    });

    return { success: true };
  }

  private async requireSessionWithGuests(sessionId: string) {
    const [session] = await this.db
      .select()
      .from(tableSessions)
      .where(eq(tableSessions.id, sessionId))
      .limit(1);

    if (!session) throw new NotFoundException('Session not found');

    const guestsQb = new DrizzleQueryBuilder<typeof guestSessions>(this.db, guestSessions)
      .filterExact({ tableSessionId: sessionId });
    const guests = await guestsQb.executePlain();

    return { session, guests };
  }

  private async assertCanAccessSession(
    actor: JwtPayload,
    session: { id: string; branchId: string },
    guests: Array<{ id: string; tableSessionId: string; customerId?: string | null }>,
  ): Promise<void> {
    const sessionActor: SessionActor = {
      guestSessionId: actor.guestSessionId,
      tableSessionId: actor.tableSessionId,
      customerId: actor.customerId,
      sub: actor.sub,
      role: actor.role,
      typ: actor.typ,
      branchId: actor.branchId,
    };

    if (isSessionParticipant(session.id, sessionActor, guests)) {
      return;
    }

    if (isStaffActor(sessionActor)) {
      await this.branchAccess.assertAccess(actor, session.branchId);
      return;
    }

    throw new ForbiddenException('You do not have access to this table session');
  }

  private signGuestToken(claims: {
    guestSessionId: string;
    tableSessionId: string;
    tableId: string;
    branchId: string;
    customerId?: string | null;
  }): string {
    return this.jwtService.sign(
      {
        sub: claims.guestSessionId,
        typ: TOKEN_TYPE.GUEST,
        role: 'CUSTOMER',
        guestSessionId: claims.guestSessionId,
        tableSessionId: claims.tableSessionId,
        tableId: claims.tableId,
        branchId: claims.branchId,
        customerId: claims.customerId ?? null,
      },
      { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
    );
  }

  /** Table must be active, not soft-deleted, not out of service, and in an active branch. */
  private async assertTableOrderable(branchId: string, tableId: string): Promise<void> {
    const [row] = await this.db
      .select({
        tableId: tables.id,
        branchId: tables.branchId,
        isActive: tables.isActive,
        deletedAt: tables.deletedAt,
        operationalFlag: tables.operationalFlag,
        branchActive: branches.isActive,
      })
      .from(tables)
      .innerJoin(branches, eq(branches.id, tables.branchId))
      .where(and(eq(tables.id, tableId), eq(tables.branchId, branchId)))
      .limit(1);

    if (
      !row ||
      row.isActive === false ||
      row.deletedAt ||
      row.operationalFlag === 'OUT_OF_SERVICE' ||
      row.branchActive === false
    ) {
      throw new ForbiddenException('This table is not available for seating. Please ask staff for help.');
    }
  }

  private async resolveCustomerId(userId?: string, contact?: string): Promise<string | null> {
    if (userId) {
      const [byUser] = await this.db
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.userId, userId))
        .limit(1);
      if (byUser) return byUser.id;
    }
    // Contact matching is intentionally not used for ownership linkage without
    // a verified account token — prevents claiming another diner's profile.
    void contact;
    return null;
  }
}
