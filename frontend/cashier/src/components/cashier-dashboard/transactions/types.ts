export type TransactionStatus = 'All' | 'Paid' | 'Pending' | 'Failed' | 'Refunded';

export interface TransactionItem {
  id: string;
  txId: string;
  orderNumber: string;
  method: string;
  cashier: string;
  status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  amount: number;
  time: string;
  customerName?: string;
  itemsCount?: number;
}
