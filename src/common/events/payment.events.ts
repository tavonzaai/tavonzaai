export interface PaymentCompletedEvent {
  eventType: 'PaymentCompleted';
  paymentId: string;
  tableSessionId?: string | null;
  orderId?: string | null;
  amount: number;
  tipAmount: number;
  method: string;
  transactionRef?: string | null;
  isFullyPaid: boolean;
  balanceDue: number;
  paidAt: string;
}

export interface PaymentRefundedEvent {
  eventType: 'PaymentRefunded';
  paymentId: string;
  tableSessionId?: string | null;
  refundAmount: number;
  reason?: string | null;
  refundedAt: string;
}

export type PaymentEvent = PaymentCompletedEvent | PaymentRefundedEvent;
