import type {
  tableServiceStatusEnum,
  tableOperationalFlagEnum,
  orderStatusEnum,
  orderItemStatusEnum,
  stationTypeEnum,
  tableSessionStatusEnum,
  paymentStatusEnum,
  paymentMethodEnum,
  orderRejectionReasonEnum,
  staffRoleEnum,
} from '@tavonza/database';

export type TableServiceStatus = (typeof tableServiceStatusEnum.enumValues)[number];
export type TableOperationalFlag = (typeof tableOperationalFlagEnum.enumValues)[number];
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type OrderItemStatus = (typeof orderItemStatusEnum.enumValues)[number];
export type StationType = (typeof stationTypeEnum.enumValues)[number];
export type TableSessionStatus = (typeof tableSessionStatusEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type OrderRejectionReason = (typeof orderRejectionReasonEnum.enumValues)[number];
export type StaffRole = (typeof staffRoleEnum.enumValues)[number];

export interface RealtimeTableStatusChangedPayload {
  eventType: 'TABLE_STATUS_CHANGED';
  eventId: string;
  branchId: string;
  tableId: string;
  tableLabel: string;
  serviceStatus: TableServiceStatus;
  operationalFlag: TableOperationalFlag;
  activeSessionId?: string | null;
  occurredAt: string;
}

export interface RealtimeTableSessionStatusChangedPayload {
  eventType: 'TABLE_SESSION_STATUS_CHANGED';
  eventId: string;
  branchId: string;
  tableId: string;
  tableSessionId: string;
  status: TableSessionStatus;
  guestCount?: number;
  occurredAt: string;
}

export interface RealtimeOrderCreatedPayload {
  eventType: 'ORDER_CREATED';
  eventId: string;
  branchId: string;
  orderId: string;
  orderNumber: string;
  tableId?: string | null;
  tableSessionId?: string | null;
  status: 'PENDING';
  paymentStatus: PaymentStatus;
  totalAmount: number;
  acceptanceMode: 'AUTO_ACCEPT' | 'WAITER_APPROVAL' | 'MANAGER_APPROVAL';
  itemsCount: number;
  occurredAt: string;
}

export interface RealtimeOrderStatusChangedPayload {
  eventType: 'ORDER_STATUS_CHANGED';
  eventId: string;
  branchId: string;
  orderId: string;
  orderNumber: string;
  tableId?: string | null;
  tableSessionId?: string | null;
  status: OrderStatus;
  previousStatus?: string;
  rejectionReasonCode?: OrderRejectionReason;
  rejectionReason?: string | null;
  acceptedById?: string | null;
  occurredAt: string;
}

export interface RealtimeOrderItemStatusChangedPayload {
  eventType: 'ORDER_ITEM_STATUS_CHANGED';
  eventId: string;
  branchId: string;
  orderId: string;
  orderItemId: string;
  productName: string;
  stationType: StationType;
  status: OrderItemStatus;
  occurredAt: string;
}

export interface RealtimePaymentStatusChangedPayload {
  eventType: 'PAYMENT_STATUS_CHANGED';
  eventId: string;
  branchId: string;
  paymentId: string;
  orderId?: string | null;
  tableSessionId?: string | null;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  transactionRef?: string | null;
  occurredAt: string;
}

export interface RealtimePaymentRequestedPayload {
  eventType: 'PAYMENT_REQUESTED';
  eventId: string;
  branchId: string;
  tableId: string;
  tableLabel: string;
  tableSessionId: string;
  orderId?: string | null;
  amount: number;
  preferredMethod?: 'CASH' | 'CARD' | 'MOBILE_WALLET';
  occurredAt: string;
}

export interface RealtimeNotificationCreatedPayload {
  eventType: 'NOTIFICATION_CREATED';
  eventId: string;
  notificationId: string;
  userId?: string | null;
  branchId?: string | null;
  targetRole?: StaffRole | null;
  type: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface RealtimeNotificationReadPayload {
  eventType: 'NOTIFICATION_READ';
  eventId: string;
  notificationId: string;
  userId: string;
  readAt: string;
}
