export type PaymentStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'REFUNDED'
  | 'FAILED';

export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'MOBILE_WALLET'
  | 'ONLINE_GATEWAY';

export type PaymentScope =
  | 'ORDER'
  | 'ORDER_ITEMS'
  | 'GUEST_SESSION'
  | 'TABLE_SESSION';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface PaymentEntity {
  id: string;
  orderId?: string | null;
  tableSessionId?: string | null;
  payerGuestSessionId?: string | null;
  paidForGuestIds?: string[];
  scope: PaymentScope;
  amount: number;
  tipAmount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string | null;
  paidAt?: Date | null;
  settledById?: string | null;
  collectedById?: string | null;
  refundedAt?: Date | null;
  refundRef?: string | null;
  refundAmount?: number | null;
  createdAt: Date;
}

export interface PaymentAllocationEntity {
  id: string;
  paymentId: string;
  orderId?: string | null;
  orderItemId?: string | null;
  amount: number;
  createdAt: Date;
}

export interface DiscountEntity {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  isActive: boolean;
  validFrom?: Date | null;
  validUntil?: Date | null;
  usageLimit?: number | null;
  timesUsed: number;
}
