import { Injectable, Inject, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { eq, and, or, isNull, desc, count } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  notifications,
  OutboxService,
} from '@tavonza/database';
import { RealtimeGateway } from '../../../realtime/realtime.gateway';
import type {
  CreateNotificationDto,
  GetNotificationsQueryDto,
  PaginatedNotificationsDto,
  NotificationResponseDto,
} from '../../presentation/http/dto/notification.dto';

export interface NotificationUserContext {
  id: string;
  branchId?: string | null;
  role?: string | null;
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
    private readonly outboxService: OutboxService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  private buildUserVisibilityFilter(user: NotificationUserContext) {
    const userDirect = eq(notifications.userId, user.id);

    if (user.branchId && user.role) {
      const roleMatches = and(
        eq(notifications.branchId, user.branchId),
        eq(notifications.targetRole, user.role as any),
      );
      const branchBroadcast = and(
        eq(notifications.branchId, user.branchId),
        isNull(notifications.targetRole),
        isNull(notifications.userId),
      );
      return or(userDirect, roleMatches, branchBroadcast);
    } else if (user.branchId) {
      const branchBroadcast = and(
        eq(notifications.branchId, user.branchId),
        isNull(notifications.targetRole),
        isNull(notifications.userId),
      );
      return or(userDirect, branchBroadcast);
    }

    return userDirect;
  }

  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const [created] = await this.db
      .insert(notifications)
      .values({
        userId: dto.userId ?? null,
        branchId: dto.branchId ?? null,
        targetRole: (dto.targetRole as any) ?? null,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        entityType: dto.entityType ?? null,
        entityId: dto.entityId ?? null,
        metadata: dto.metadata ?? null,
        isRead: false,
      })
      .returning();

    if (!created) {
      throw new InternalServerErrorException('Failed to create notification');
    }

    // 1. Emit live WebSocket event immediately
    this.realtimeGateway.emitNotificationCreated({
      eventType: 'NOTIFICATION_CREATED',
      eventId: created.id,
      notificationId: created.id,
      userId: created.userId,
      branchId: created.branchId,
      targetRole: created.targetRole as any,
      type: created.type,
      title: created.title,
      message: created.message,
      entityType: created.entityType,
      entityId: created.entityId,
      isRead: created.isRead,
      metadata: (created.metadata as Record<string, unknown>) ?? null,
      createdAt: created.createdAt.toISOString(),
    });

    // 2. Persist to outbox for audit / reliable worker delivery
    await this.outboxService.publishEvent({
      aggregateType: 'NOTIFICATION',
      aggregateId: created.id,
      eventType: 'NOTIFICATION_CREATED',
      branchId: created.branchId,
      payload: {
        notificationId: created.id,
        userId: created.userId,
        branchId: created.branchId,
        targetRole: created.targetRole,
        type: created.type,
        title: created.title,
        message: created.message,
        entityType: created.entityType,
        entityId: created.entityId,
        createdAt: created.createdAt.toISOString(),
      },
    });

    return created as unknown as NotificationResponseDto;
  }

  async findAllForUser(
    user: NotificationUserContext,
    query: GetNotificationsQueryDto,
  ): Promise<PaginatedNotificationsDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const baseFilter = this.buildUserVisibilityFilter(user);
    const whereClause =
      query.isRead !== undefined
        ? and(baseFilter, eq(notifications.isRead, query.isRead))
        : baseFilter;

    const [totalRow] = await this.db
      .select({ count: count() })
      .from(notifications)
      .where(whereClause);

    const total = totalRow?.count ?? 0;

    const items = await this.db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      items: items as unknown as NotificationResponseDto[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getUnreadCount(user: NotificationUserContext): Promise<number> {
    const baseFilter = this.buildUserVisibilityFilter(user);
    const whereClause = and(baseFilter, eq(notifications.isRead, false));

    const [row] = await this.db
      .select({ count: count() })
      .from(notifications)
      .where(whereClause);

    return row?.count ?? 0;
  }

  async markAsRead(id: string, user: NotificationUserContext): Promise<NotificationResponseDto> {
    const [existing] = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    const [updated] = await this.db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notifications.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Failed to update notification with ID ${id}`);
    }

    this.realtimeGateway.emitNotificationRead({
      eventType: 'NOTIFICATION_READ',
      eventId: updated.id,
      notificationId: updated.id,
      userId: user.id,
      readAt: updated.readAt ? updated.readAt.toISOString() : new Date().toISOString(),
    });

    return updated as unknown as NotificationResponseDto;
  }

  async markAllAsRead(user: NotificationUserContext): Promise<{ updatedCount: number }> {
    const baseFilter = this.buildUserVisibilityFilter(user);
    const whereClause = and(baseFilter, eq(notifications.isRead, false));

    const updated = await this.db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(whereClause)
      .returning({ id: notifications.id });

    return { updatedCount: updated.length };
  }

  async delete(id: string): Promise<void> {
    const [existing] = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    await this.db.delete(notifications).where(eq(notifications.id, id));
  }
}
