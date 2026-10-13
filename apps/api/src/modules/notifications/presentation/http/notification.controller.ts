import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../identity/infrastructure/adapters/jwt.strategy';
import { NotificationService } from '../../application/services/notification.service';
import {
  GetNotificationsQueryDto,
  CreateNotificationDto,
  NotificationResponseDto,
  PaginatedNotificationsDto,
  UnreadCountResponseDto,
  MarkAllReadResponseDto,
} from './dto/notification.dto';
import { ApiStandardErrors } from '../../../../common/swagger';

@ApiTags('Operations | Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated notifications for current user and role' })
  @ApiOkResponse({ description: 'Paginated user notifications', type: PaginatedNotificationsDto })
  @ApiStandardErrors(401, 403, 500)
  async getNotifications(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetNotificationsQueryDto,
  ): Promise<PaginatedNotificationsDto> {
    return this.notificationService.findAllForUser(
      {
        id: user.sub,
        branchId: user.branchId,
        role: user.role,
      },
      query,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for current user and role' })
  @ApiOkResponse({ description: 'Current unread notification count', type: UnreadCountResponseDto })
  @ApiStandardErrors(401, 403, 500)
  async getUnreadCount(
    @CurrentUser() user: JwtPayload,
  ): Promise<UnreadCountResponseDto> {
    const count = await this.notificationService.getUnreadCount({
      id: user.sub,
      branchId: user.branchId,
      role: user.role,
    });
    return { unreadCount: count };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create and dispatch a notification' })
  @ApiCreatedResponse({ description: 'Notification created successfully', type: NotificationResponseDto })
  @ApiStandardErrors(400, 401, 403, 500)
  async createNotification(
    @Body() dto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.create(dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification UUID', example: 'b0e1d2c3-4567-89ab-cdef-0123456789ab' })
  @ApiOkResponse({ description: 'Notification marked as read', type: NotificationResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.markAsRead(id, {
      id: user.sub,
      branchId: user.branchId,
      role: user.role,
    });
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiOkResponse({ description: 'Number of marked notifications', type: MarkAllReadResponseDto })
  @ApiStandardErrors(401, 403, 500)
  async markAllAsRead(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ updatedCount: number }> {
    return this.notificationService.markAllAsRead({
      id: user.sub,
      branchId: user.branchId,
      role: user.role,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification UUID', example: 'b0e1d2c3-4567-89ab-cdef-0123456789ab' })
  @ApiNoContentResponse({ description: 'Notification deleted successfully' })
  @ApiStandardErrors(401, 403, 404, 500)
  async deleteNotification(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.notificationService.delete(id);
  }
}
