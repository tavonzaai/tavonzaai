export interface PaymentItem {
  id: string;
  orderNumber: string;
  restaurant: string;
  branch: string;
  tableNumber: string;
  server: string;
  amount: number;
  formattedAmount: string;
  method: 'Card' | 'Cash' | 'Stripe' | 'POS Terminal' | 'QR Pay' | 'Apple Pay';
  cardLast4?: string;
  cardBrand?: string;
  authCode?: string;
  status: 'Completed' | 'Pending' | 'Refunded';
  timestamp: string;
  date: string;
  items?: { name: string; qty: number; price: number }[];
}
