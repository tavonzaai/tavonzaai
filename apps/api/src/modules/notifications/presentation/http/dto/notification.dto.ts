import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { staffRoleEnum } from '@tavonza/database';

export class GetNotificationsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, example: 1, description: 'Page number (1-indexed)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100, example: 20, description: 'Items per page limit' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ description: 'Filter by read status', example: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isRead?: boolean;
}

export class CreateNotificationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ enum: staffRoleEnum.enumValues })
  @IsOptional()
  @IsEnum(staffRoleEnum.enumValues)
  targetRole?: (typeof staffRoleEnum.enumValues)[number];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class NotificationResponseDto {
  @ApiProperty({ example: 'b0e1d2c3-4567-89ab-cdef-0123456789ab', description: 'Notification UUID' })
  id!: string;

  @ApiPropertyOptional({ example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef', description: 'Target user UUID if direct' })
  userId?: string | null;

  @ApiPropertyOptional({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID if scoped to branch' })
  branchId?: string | null;

  @ApiPropertyOptional({ example: 'WAITER', description: 'Target staff role' })
  targetRole?: string | null;

  @ApiProperty({ example: 'ORDER_STATUS_CHANGED', description: 'System notification event type' })
  type!: string;

  @ApiProperty({ example: 'Order Ready for Pickup', description: 'Notification headline' })
  title!: string;

  @ApiProperty({ example: 'Order #1042 for Table T-12 is ready at Station Grill', description: 'Notification body message' })
  message!: string;

  @ApiPropertyOptional({ example: 'order', description: 'Associated entity type' })
  entityType?: string | null;

  @ApiPropertyOptional({ example: 'b1c2d3e4-f5a6-7890-abcd-ef1234567890', description: 'Associated entity UUID' })
  entityId?: string | null;

  @ApiProperty({ example: false, description: 'Whether the notification has been read' })
  isRead!: boolean;

  @ApiPropertyOptional({ example: null, description: 'Timestamp when read' })
  readAt?: Date | null;

  @ApiPropertyOptional({ example: { orderNumber: 1042, tableLabel: 'T-12' }, description: 'Event metadata payload' })
  metadata?: Record<string, unknown> | null;

  @ApiProperty({ example: '2026-10-08T14:40:00.000Z', description: 'Notification dispatch timestamp' })
  createdAt!: Date;
}

export class PaginatedNotificationsDto {
  @ApiProperty({ type: [NotificationResponseDto], description: 'List of notifications' })
  items!: NotificationResponseDto[];

  @ApiProperty({ example: 42, description: 'Total matching notifications' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page!: number;

  @ApiProperty({ example: 20, description: 'Items per page' })
  limit!: number;

  @ApiProperty({ example: 3, description: 'Total available pages' })
  totalPages!: number;
}

export class UnreadCountResponseDto {
  @ApiProperty({ example: 7, description: 'Count of unread notifications' })
  unreadCount!: number;
}

export class MarkAllReadResponseDto {
  @ApiProperty({ example: 7, description: 'Number of notifications marked as read' })
  updatedCount!: number;
}
