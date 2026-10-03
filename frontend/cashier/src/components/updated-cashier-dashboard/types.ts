export type KitchenStatus = "READY_TO_SERVE" | "PREPARING" | "COMPLETED";
export type FinanceStatus = "REQUESTING_CASH" | "NOT_PAID" | "PAID_CASH";

export type QueueStatus =
  | "Preparing"
  | "Ready"
  | "Pending"
  | "Payment Pending"
  | "Needs Attention"
  | "Ordering";

export interface CashierOrderItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

export interface CashierOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  tableNumber: string;
  guestCount: number;
  waitTime: string;
  customerName: string;
  itemCount: number;
  items: CashierOrderItem[];
  kitchenStatus: KitchenStatus;
  financeStatus: FinanceStatus;
  subtotal: number;
  serviceCharge: number;
  tax: number;
  paymentDate?: string;
  paymentMethod?: string;
}

export interface BillQueueItem {
  id: string;
  orderNumber: string;
  tableNumber: string;
  customerName: string;
  itemCount: number;
  paymentMethod: "Visa Card" | "Cash" | "Digital Wallet";
  status: QueueStatus;
  total: number;
  items: { name: string; price: number; quantity: number }[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  time: string;
}
