export type KitchenStationType = 'KITCHEN' | 'BAR';

export type KitchenItemStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'UNAVAILABLE'
  | 'CANCELLED';

export interface KitchenTicketItemEntity {
  id: string;
  orderId: string;
  orderNumber: string;
  branchId?: string;
  tableId?: string | null;
  tableSessionId?: string | null;
  tableLabel?: string | null;
  productName: string;
  quantity: number;
  stationType: KitchenStationType;
  status: KitchenItemStatus;
  specialInstructions?: string | null;
  preparingAt?: Date | null;
  readyAt?: Date | null;
  servedAt?: Date | null;
  createdAt: Date;
}
