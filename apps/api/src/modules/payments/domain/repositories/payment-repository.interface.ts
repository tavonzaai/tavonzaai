import type {
  PaymentEntity,
  PaymentAllocationEntity,
  DiscountEntity,
} from '../entities/payment.entity';

export interface IPaymentRepository {
  createPayment(data: Omit<PaymentEntity, 'id' | 'createdAt'>): Promise<PaymentEntity>;
  findById(id: string): Promise<PaymentEntity | null>;
  findByOrderId(orderId: string): Promise<PaymentEntity[]>;
  findByTableSessionId(tableSessionId: string): Promise<PaymentEntity[]>;
  findByTransactionRef(transactionRef: string): Promise<PaymentEntity | null>;
  findPendingByOrderOrSession(params: { orderId?: string; tableSessionId?: string }): Promise<PaymentEntity | null>;
  updateStatus(
    id: string,
    status: PaymentEntity['status'],
    extras?: { transactionRef?: string; paidAt?: Date; settledById?: string; collectedById?: string; refundRef?: string; refundAmount?: number }
  ): Promise<PaymentEntity>;
  createAllocations(allocations: Array<Omit<PaymentAllocationEntity, 'id' | 'createdAt'>>): Promise<PaymentAllocationEntity[]>;
  findAllocationsByPaymentId(paymentId: string): Promise<PaymentAllocationEntity[]>;
  findDiscountByCode(code: string): Promise<DiscountEntity | null>;
  incrementDiscountUsage(id: string): Promise<void>;
}
