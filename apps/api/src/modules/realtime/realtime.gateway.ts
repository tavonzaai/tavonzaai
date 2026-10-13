import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { isOriginAllowed } from '@tavonza/config';
import { AppLogger } from '@tavonza/observability';
import { RealtimeChannels } from '@tavonza/events';
import type {
  RealtimeTableStatusChangedPayload,
  RealtimeTableSessionStatusChangedPayload,
  RealtimeOrderCreatedPayload,
  RealtimeOrderStatusChangedPayload,
  RealtimeOrderItemStatusChangedPayload,
  RealtimePaymentStatusChangedPayload,
  RealtimePaymentRequestedPayload,
  RealtimeNotificationCreatedPayload,
  RealtimeNotificationReadPayload,
} from './realtime.events';

export interface AuthenticatedSocketUser {
  sub: string;
  email?: string;
  role: string;
  globalRole?: string;
  branchId?: string | null;
  tableSessionId?: string | null;
  guestSessionId?: string | null;
  tableId?: string | null;
}

@WebSocketGateway({
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      callback(null, isOriginAllowed(origin));
    },
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new AppLogger('RealtimeGateway');

  constructor(private readonly jwtService: JwtService) {}

  afterInit(_server: Server) {
    this.logger.info('WebSocket Realtime Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') as string) ||
        (client.handshake.query?.token as string);

      let user: AuthenticatedSocketUser | null = null;

      if (token) {
        try {
          user = this.jwtService.verify<AuthenticatedSocketUser>(token, {
            secret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
          });
          client.data.user = user;
        } catch {
          this.logger.warn(`Invalid JWT token on socket connection: ${client.id}`);
        }
      }

      if (user) {
        // 1. User direct room
        if (user.sub) {
          const userRoom = RealtimeChannels.user(user.sub);
          client.join(userRoom);
        }

        // 2. Branch rooms
        if (user.branchId) {
          const branchRoom = RealtimeChannels.branch(user.branchId);
          client.join(branchRoom);

          const role = user.role?.toUpperCase();
          if (role === 'WAITER' || role === 'HOST') {
            client.join(RealtimeChannels.waiter(user.branchId));
          } else if (role === 'KITCHEN_STAFF') {
            client.join(RealtimeChannels.kitchenStation(user.branchId, 'KITCHEN'));
            client.join(`branch:${user.branchId}:kitchen`);
          } else if (role === 'BARTENDER') {
            client.join(RealtimeChannels.kitchenStation(user.branchId, 'BAR'));
            client.join(`branch:${user.branchId}:kitchen`);
          } else if (role === 'CASHIER') {
            client.join(RealtimeChannels.cashier(user.branchId));
          } else if (
            role === 'BRANCH_MANAGER' ||
            role === 'ORGANIZATION_ADMIN' ||
            role === 'SUPER_ADMIN'
          ) {
            client.join(RealtimeChannels.manager(user.branchId));
            client.join(RealtimeChannels.waiter(user.branchId));
            client.join(RealtimeChannels.cashier(user.branchId));
            client.join(`branch:${user.branchId}:kitchen`);
            client.join(RealtimeChannels.kitchenStation(user.branchId, 'KITCHEN'));
            client.join(RealtimeChannels.kitchenStation(user.branchId, 'BAR'));
          }
        }

        // 3. Customer Session / Table rooms
        if (user.tableSessionId) {
          client.join(RealtimeChannels.session(user.tableSessionId));
        }
        if (user.tableId) {
          client.join(RealtimeChannels.table(user.tableId));
        }

        this.logger.info(`Client connected (auth): ${client.id} (user: ${user.sub}, role: ${user.role})`);
      } else {
        // Query params fallback for customer QR browsing before auth
        const branchId = client.handshake.query?.branchId as string;
        const tableSessionId = client.handshake.query?.tableSessionId as string;
        const tableId = client.handshake.query?.tableId as string;

        if (branchId) {
          client.join(RealtimeChannels.branch(branchId));
        }
        if (tableSessionId) {
          client.join(RealtimeChannels.session(tableSessionId));
        }
        if (tableId) {
          client.join(RealtimeChannels.table(tableId));
        }

        this.logger.info(`Client connected (guest/unauth): ${client.id}`);
      }
    } catch (error: any) {
      this.logger.error(`Error during socket connection: ${error?.message}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.info(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    if (!data?.room) return { success: false, error: 'Room is required' };

    const room = data.room;
    const user: AuthenticatedSocketUser | undefined = client.data?.user;

    // Security check: validate room permission
    const isAllowed = this.isRoomAccessAllowed(room, user, client);
    if (!isAllowed) {
      this.logger.warn(`Unauthorized join_room attempt for ${room} from socket ${client.id}`);
      return { success: false, error: 'Unauthorized room access' };
    }

    client.join(room);
    return { success: true, room };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    if (data?.room) {
      client.leave(data.room);
      return { success: true, room: data.room };
    }
    return { success: false };
  }

  private isRoomAccessAllowed(
    room: string,
    user: AuthenticatedSocketUser | undefined,
    client: Socket,
  ): boolean {
    if (!room) return false;

    // Allow joining table session rooms if they match or if client is authorized
    if (room.startsWith('session:')) {
      const sessionId = room.replace('session:', '');
      return (
        user?.tableSessionId === sessionId ||
        !!user?.branchId ||
        client.handshake.query?.tableSessionId === sessionId
      );
    }

    // Allow table rooms
    if (room.startsWith('table:')) {
      const tableId = room.replace('table:', '');
      return (
        user?.tableId === tableId ||
        !!user?.branchId ||
        client.handshake.query?.tableId === tableId
      );
    }

    // Allow order rooms
    if (room.startsWith('order:')) {
      return true;
    }

    // Staff rooms require branchId match
    if (room.startsWith('branch:')) {
      const parts = room.split(':');
      const branchId = parts[1];
      if (!user?.branchId || user.branchId !== branchId) {
        return false;
      }
      return true;
    }

    // Personal user room
    if (room.startsWith('user:')) {
      return user?.sub === room.replace('user:', '');
    }

    return false;
  }

  // ── Emission Helpers ────────────────────────────────────────────────────────

  emitToRoom(room: string, event: string, data: any) {
    if (this.server) {
      this.server.to(room).emit(event, data);
    }
  }

  emitToUser(userId: string, event: string, data: any) {
    this.emitToRoom(RealtimeChannels.user(userId), event, data);
  }

  emitToBranch(branchId: string, event: string, data: any) {
    this.emitToRoom(RealtimeChannels.branch(branchId), event, data);
  }

  emitTableStatusChanged(payload: RealtimeTableStatusChangedPayload) {
    const rooms = [
      RealtimeChannels.branch(payload.branchId),
      RealtimeChannels.waiter(payload.branchId),
      RealtimeChannels.manager(payload.branchId),
      RealtimeChannels.table(payload.tableId),
    ];
    if (payload.activeSessionId) {
      rooms.push(RealtimeChannels.session(payload.activeSessionId));
    }
    rooms.forEach((room) => this.emitToRoom(room, 'TABLE_STATUS_CHANGED', payload));
  }

  emitTableSessionStatusChanged(payload: RealtimeTableSessionStatusChangedPayload) {
    const rooms = [
      RealtimeChannels.session(payload.tableSessionId),
      RealtimeChannels.table(payload.tableId),
      RealtimeChannels.waiter(payload.branchId),
      RealtimeChannels.cashier(payload.branchId),
      RealtimeChannels.manager(payload.branchId),
    ];
    rooms.forEach((room) => this.emitToRoom(room, 'TABLE_SESSION_STATUS_CHANGED', payload));
  }

  emitOrderCreated(payload: RealtimeOrderCreatedPayload) {
    const rooms = [
      RealtimeChannels.waiter(payload.branchId),
      RealtimeChannels.manager(payload.branchId),
    ];
    if (payload.tableSessionId) {
      rooms.push(RealtimeChannels.session(payload.tableSessionId));
    }
    if (payload.tableId) {
      rooms.push(RealtimeChannels.table(payload.tableId));
    }
    rooms.push(RealtimeChannels.order(payload.orderId));
    rooms.forEach((room) => this.emitToRoom(room, 'ORDER_CREATED', payload));
  }

  emitOrderStatusChanged(payload: RealtimeOrderStatusChangedPayload) {
    const rooms = [
      RealtimeChannels.order(payload.orderId),
      RealtimeChannels.waiter(payload.branchId),
      `branch:${payload.branchId}:kitchen`,
      RealtimeChannels.cashier(payload.branchId),
      RealtimeChannels.manager(payload.branchId),
    ];
    if (payload.tableSessionId) {
      rooms.push(RealtimeChannels.session(payload.tableSessionId));
    }
    if (payload.tableId) {
      rooms.push(RealtimeChannels.table(payload.tableId));
    }
    rooms.forEach((room) => this.emitToRoom(room, 'ORDER_STATUS_CHANGED', payload));
  }

  emitOrderItemStatusChanged(payload: RealtimeOrderItemStatusChangedPayload) {
    const rooms = [
      RealtimeChannels.kitchenStation(payload.branchId, payload.stationType),
      `branch:${payload.branchId}:kitchen`,
      RealtimeChannels.waiter(payload.branchId),
      RealtimeChannels.order(payload.orderId),
    ];
    rooms.forEach((room) => this.emitToRoom(room, 'ORDER_ITEM_STATUS_CHANGED', payload));
  }

  emitPaymentStatusChanged(payload: RealtimePaymentStatusChangedPayload) {
    const rooms = [
      RealtimeChannels.cashier(payload.branchId),
      RealtimeChannels.waiter(payload.branchId),
      RealtimeChannels.manager(payload.branchId),
    ];
    if (payload.tableSessionId) {
      rooms.push(RealtimeChannels.session(payload.tableSessionId));
    }
    if (payload.orderId) {
      rooms.push(RealtimeChannels.order(payload.orderId));
    }
    rooms.forEach((room) => this.emitToRoom(room, 'PAYMENT_STATUS_CHANGED', payload));
  }

  emitPaymentRequested(payload: RealtimePaymentRequestedPayload) {
    const rooms = [
      RealtimeChannels.cashier(payload.branchId),
      RealtimeChannels.waiter(payload.branchId),
      RealtimeChannels.session(payload.tableSessionId),
      RealtimeChannels.table(payload.tableId),
    ];
    rooms.forEach((room) => this.emitToRoom(room, 'PAYMENT_REQUESTED', payload));
  }

  emitNotificationCreated(payload: RealtimeNotificationCreatedPayload) {
    if (payload.userId) {
      this.emitToRoom(RealtimeChannels.user(payload.userId), 'NOTIFICATION_CREATED', payload);
    }
    if (payload.branchId && payload.targetRole) {
      const role = payload.targetRole.toUpperCase();
      if (role === 'WAITER') {
        this.emitToRoom(RealtimeChannels.waiter(payload.branchId), 'NOTIFICATION_CREATED', payload);
      } else if (role === 'CASHIER') {
        this.emitToRoom(RealtimeChannels.cashier(payload.branchId), 'NOTIFICATION_CREATED', payload);
      } else if (role === 'KITCHEN_STAFF') {
        this.emitToRoom(RealtimeChannels.kitchenStation(payload.branchId, 'KITCHEN'), 'NOTIFICATION_CREATED', payload);
      } else if (role === 'BARTENDER') {
        this.emitToRoom(RealtimeChannels.kitchenStation(payload.branchId, 'BAR'), 'NOTIFICATION_CREATED', payload);
      } else if (role === 'BRANCH_MANAGER') {
        this.emitToRoom(RealtimeChannels.manager(payload.branchId), 'NOTIFICATION_CREATED', payload);
      }
    } else if (payload.branchId && !payload.targetRole) {
      this.emitToRoom(RealtimeChannels.branch(payload.branchId), 'NOTIFICATION_CREATED', payload);
    }
  }

  emitNotificationRead(payload: RealtimeNotificationReadPayload) {
    this.emitToRoom(RealtimeChannels.user(payload.userId), 'NOTIFICATION_READ', payload);
  }
}
