export interface OrderSubmittedEvent {
  eventType: 'OrderSubmitted';
  orderId: string;
  orderNumber: string;
  branchId: string;
  tableId?: string | null;
  tableLabel?: string | null;
  tableSessionId?: string | null;
  guestSessionId?: string | null;
  guestName?: string | null;
  itemsCount: number;
  subtotal: number;
  totalAmount: number;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    stationType: 'KITCHEN' | 'BAR';
    specialInstructions?: string | null;
  }>;
  occurredAt: string;
}

export interface OrderAcceptedEvent {
  eventType: 'OrderAccepted';
  orderId: string;
  orderNumber: string;
  branchId: string;
  tableId?: string | null;
  tableSessionId?: string | null;
  acceptedById: string;
  acceptedAt: string;
}

export interface OrderRejectedEvent {
  eventType: 'OrderRejected';
  orderId: string;
  orderNumber: string;
  branchId: string;
  tableSessionId?: string | null;
  rejectedById: string;
  rejectionReasonCode: string;
  rejectionReason?: string | null;
  rejectedAt: string;
}

export interface OrderKitchenStatusChangedEvent {
  eventType: 'OrderKitchenStatusChanged';
  orderId: string;
  orderNumber: string;
  branchId: string;
  tableSessionId?: string | null;
  tableLabel?: string | null;
  orderItemId: string;
  productName: string;
  stationType: 'KITCHEN' | 'BAR';
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'UNAVAILABLE';
  unavailableReason?: string | null;
  occurredAt: string;
}

export interface OrderServedEvent {
  eventType: 'OrderServed';
  orderId: string;
  orderNumber: string;
  branchId: string;
  tableSessionId?: string | null;
  servedById?: string | null;
  servedAt: string;
}

export type OrderEvent =
  | OrderSubmittedEvent
  | OrderAcceptedEvent
  | OrderRejectedEvent
  | OrderKitchenStatusChangedEvent
  | OrderServedEvent;
