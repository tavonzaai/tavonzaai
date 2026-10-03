export type OrderStatus =
  | 'All'
  | 'Paid'
  | 'Pending'
  | 'Preparing'
  | 'Ready'
  | 'Cancelled';

export interface CashierOrder {
  id: string;
  orderNumber: string; // e.g. "#10590"
  table: string; // e.g. "T-08"
  customer: string; // e.g. "James Carter"
  itemsCount: number; // e.g. 4
  method: string; // e.g. "Visa Card"
  status: 'Paid' | 'Pending' | 'Preparing' | 'Ready' | 'Cancelled';
  total: number; // e.g. 52.40
  time: string; // e.g. "12:45pm"
}
