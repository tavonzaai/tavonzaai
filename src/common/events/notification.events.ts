export interface NotificationCreatedEvent {
  eventType: 'NOTIFICATION_CREATED';
  notificationId: string;
  userId?: string | null;
  branchId?: string | null;
  targetRole?:
    | 'BRANCH_MANAGER'
    | 'HOST'
    | 'WAITER'
    | 'KITCHEN_STAFF'
    | 'BARTENDER'
    | 'CASHIER'
    | null;
  type: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationReadEvent {
  eventType: 'NOTIFICATION_READ';
  notificationId: string;
  userId: string;
  readAt: string;
}

export type NotificationEvent = NotificationCreatedEvent | NotificationReadEvent;
