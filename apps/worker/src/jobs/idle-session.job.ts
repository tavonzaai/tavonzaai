import { eq, and, sql, lte } from 'drizzle-orm';
import {
  createDrizzleDatabase,
  tableSessions,
  tables,
  branchSettings,
  OutboxService,
} from '@tavonza/database';

export class IdleSessionJob {
  private isRunning = false;
  private timerId: NodeJS.Timeout | null = null;
  private db: ReturnType<typeof createDrizzleDatabase> | null = null;
  private outboxService: OutboxService | null = null;

  async start(intervalMs = 120000): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return;

    this.db = createDrizzleDatabase(dbUrl);
    this.outboxService = new OutboxService(this.db);
    this.isRunning = true;

    console.log('[IdleSessionJob] Scheduled idle table session cleanup job running every 2 minutes');

    this.scheduleNext(intervalMs);
  }

  stop(): void {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNext(intervalMs: number): void {
    if (!this.isRunning) return;
    this.timerId = setTimeout(async () => {
      await this.runCleanup();
      this.scheduleNext(intervalMs);
    }, intervalMs);
  }

  async runCleanup(): Promise<number> {
    if (!this.db || !this.outboxService) return 0;

    try {
      // Find active sessions that have been idle past their branch's timeout threshold
      const activeSessions = await this.db
        .select({
          sessionId: tableSessions.id,
          branchId: tableSessions.branchId,
          tableId: tableSessions.tableId,
          updatedAt: tableSessions.updatedAt,
          autoCloseIdleSessionMins: branchSettings.autoCloseIdleSessionMins,
        })
        .from(tableSessions)
        .leftJoin(branchSettings, eq(branchSettings.branchId, tableSessions.branchId))
        .where(
          and(
            eq(tableSessions.status, 'ACTIVE'),
            lte(
              tableSessions.updatedAt,
              sql`NOW() - INTERVAL '1 minute' * COALESCE(${branchSettings.autoCloseIdleSessionMins}, 60)`
            )
          )
        );

      let closedCount = 0;

      for (const session of activeSessions) {
        // Mark session as closed due to idle timeout
        await this.db
          .update(tableSessions)
          .set({
            status: 'ABANDONED',
            endedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(tableSessions.id, session.sessionId));

        // Free up the table
        await this.db
          .update(tables)
          .set({
            serviceStatus: 'AVAILABLE',
            updatedAt: new Date(),
          })
          .where(eq(tables.id, session.tableId));

        // Publish Outbox Event for real-time notification
        await this.outboxService.publishEvent({
          aggregateType: 'TABLE_SESSION',
          aggregateId: session.sessionId,
          eventType: 'TableSessionClosed',
          branchId: session.branchId,
          payload: {
            tableSessionId: session.sessionId,
            tableId: session.tableId,
            branchId: session.branchId,
            reason: 'IDLE_TIMEOUT',
            closedAt: new Date().toISOString(),
          },
        });

        closedCount++;
      }

      if (closedCount > 0) {
        console.log(`[IdleSessionJob] Cleaned up ${closedCount} idle dining table sessions.`);
      }

      return closedCount;
    } catch (err: any) {
      console.error(`[IdleSessionJob] Error during idle session cleanup: ${err.message}`);
      return 0;
    }
  }
}
