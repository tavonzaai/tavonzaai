// ============================================================================
// Table Sessions — Customer Flow Entry Point
// ============================================================================
//
// Figma Flow:
//   1. Customer scans QR code at table
//   2. App calls POST /sessions/scan  → creates/returns active table session
//   3. Splash screen shows table info
//   4. Customer can share code for HostGuest feature
//   5. Guests scan/enter code → join as guests
// ============================================================================

import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { eq, and, gt } from 'drizzle-orm';
import { DRIZZLE } from '@tavonza/database';
import { tableSessions, customerSessions } from '@tavonza/database';

type DrizzleDb = any;

function generateShareCode(): string {
  // 6-char alphanumeric code — displayed as QR on "Share Code" screen
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

@Injectable()
export class TableSessionService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  /**
   * POST /sessions/scan
   * Figma: QR Scan Screen → Splash Screen
   *
   * Called when customer scans QR code. Returns:
   *  - table info (tableNumber, branchId)
   *  - sessionId for subsequent calls
   *  - whether session is new or existing
   */
  async scanQr(data: {
    branchId: string;
    tableId: string;
    tableNumber: string;
    userId?: string;
  }) {
    // Check for existing active session on this table
    const existing = await this.db
      .select()
      .from(tableSessions)
      .where(
        and(
          eq(tableSessions.branchId, data.branchId),
          eq(tableSessions.tableId, data.tableId),
          eq(tableSessions.status, 'active'),
        ),
      )
      .limit(1);

    let session = existing[0];
    let isNew = false;

    if (!session) {
      const result = await this.db
        .insert(tableSessions)
        .values({
          branchId: data.branchId,
          tableId: data.tableId,
          tableNumber: data.tableNumber,
          status: 'active',
        })
        .returning();
      session = result[0];
      isNew = true;
    }

    // Create customer session for this user (as host if new, or join as guest)
    let customerSession = null;
    if (data.userId) {
      const existingCustomer = await this.db
        .select()
        .from(customerSessions)
        .where(
          and(
            eq(customerSessions.tableSessionId, session.id),
            eq(customerSessions.userId, data.userId),
          ),
        )
        .limit(1);

      if (!existingCustomer[0]) {
        const hostCount = await this.db
          .select()
          .from(customerSessions)
          .where(eq(customerSessions.tableSessionId, session.id));

        const result = await this.db
          .insert(customerSessions)
          .values({
            tableSessionId: session.id,
            userId: data.userId,
            role: hostCount.length === 0 ? 'host' : 'guest',
            orderMode: 'individual',
          })
          .returning();
        customerSession = result[0];
      } else {
        customerSession = existingCustomer[0];
      }
    }

    return { session, customerSession, isNew };
  }

  /**
   * GET /sessions/:sessionId
   * Returns current session with all customers
   */
  async getSession(sessionId: string) {
    const result = await this.db
      .select()
      .from(tableSessions)
      .where(eq(tableSessions.id, sessionId))
      .limit(1);

    if (!result[0]) throw new NotFoundException('Session not found');

    const customers = await this.db
      .select()
      .from(customerSessions)
      .where(eq(customerSessions.tableSessionId, sessionId));

    return { session: result[0], customers };
  }

  /**
   * POST /sessions/:sessionId/share-code
   * Figma: "Share Code" screen — generates a QR code that guests scan
   */
  async generateShareCode(sessionId: string) {
    const result = await this.db
      .select()
      .from(tableSessions)
      .where(eq(tableSessions.id, sessionId))
      .limit(1);

    if (!result[0]) throw new NotFoundException('Session not found');

    const code = generateShareCode();
    const expiresAt = new Date(Date.now() + 30 * 1000); // 30 seconds (matches Figma "00:30sec")

    await this.db
      .update(tableSessions)
      .set({ shareCode: code, shareCodeExpiresAt: expiresAt })
      .where(eq(tableSessions.id, sessionId));

    return { code, expiresAt };
  }

  /**
   * POST /sessions/join
   * Figma: Guest scans Share Code QR → joins as guest
   * Guest menu shows: "You've joined the table as a Host Guest"
   */
  async joinByCode(data: { code: string; userId?: string; displayName?: string }) {
    const result = await this.db
      .select()
      .from(tableSessions)
      .where(
        and(
          eq(tableSessions.shareCode, data.code.toUpperCase()),
          eq(tableSessions.status, 'active'),
          gt(tableSessions.shareCodeExpiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!result[0]) {
      throw new BadRequestException('Invalid or expired share code');
    }

    const session = result[0];

    // Check if user already in session
    if (data.userId) {
      const existing = await this.db
        .select()
        .from(customerSessions)
        .where(
          and(
            eq(customerSessions.tableSessionId, session.id),
            eq(customerSessions.userId, data.userId),
          ),
        )
        .limit(1);

      if (existing[0]) {
        throw new ConflictException('You are already part of this table session');
      }
    }

    const guestResult = await this.db
      .insert(customerSessions)
      .values({
        tableSessionId: session.id,
        userId: data.userId ?? null,
        displayName: data.displayName ?? null,
        role: 'guest',
        orderMode: 'individual',
      })
      .returning();

    return { session, customerSession: guestResult[0] };
  }

  /**
   * PATCH /sessions/:sessionId/order-mode
   * Figma: "Order Individually" / "Order together" choice
   */
  async setOrderMode(
    customerSessionId: string,
    orderMode: 'individual' | 'together',
  ) {
    const result = await this.db
      .update(customerSessions)
      .set({ orderMode })
      .where(eq(customerSessions.id, customerSessionId))
      .returning();

    if (!result[0]) throw new NotFoundException('Customer session not found');
    return result[0];
  }

  /**
   * POST /sessions/:sessionId/close
   * Closes the table session after payment
   */
  async closeSession(sessionId: string) {
    await this.db
      .update(tableSessions)
      .set({ status: 'closed', closedAt: new Date() })
      .where(eq(tableSessions.id, sessionId));
  }
}
