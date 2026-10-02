export type PaymentMethod = 'All Methods' | 'Card' | 'Digital' | 'Cash';

export type PaymentStatus = 'completed' | 'refunded' | 'Pending';

export interface PaymentTransaction {
  id: string; // 'TXN-8821'
  orderId: string; // '#10480'
  customerName: string; // 'Olivia Martinez'
  tableId: string; // 'T-11'
  method: 'Card' | 'Digital' | 'Cash';
  server: string; // 'Aisha B.'
  time: string; // '4:35 PM'
  tipAmount: number; // 20.50 (0 if none)
  status: PaymentStatus;
  amount: number; // 92.00
}

export interface PaymentKPIs {
  todayRevenue: number;
  revenueChangePercent: number;
  totalTips: number;
  avgTipRatePercent: number;
  avgTransaction: number;
  completedTxnCount: number;
  cardPercent: number;
  digitalPercent: number;
  cashPercent: number;
}
