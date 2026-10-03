export interface CashierProfile {
  name: string;
  role: string;
  branch: string;
  avatarUrl?: string;
  unreadNotifications: number;
}

export interface CashierStatCard {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  trendType: 'positive' | 'negative' | 'urgent' | 'neutral';
  badgeText: string;
  iconName: string;
}

export interface LiveTransaction {
  id: string;
  transactionId: string;
  orderId: string;
  paymentMethod: string;
  status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  amount: number;
  time: string;
}

export interface PendingCheckoutOrder {
  id: string;
  table: string;
  customerName: string;
  orderNumber: string;
  amount: number;
  itemCount: number;
  timeWaiting: string;
}

export interface AIUpsellSuggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
  probability: string;
}

export interface PaymentAlert {
  id: string;
  message: string;
  severity: 'urgent' | 'warning' | 'info' | 'success';
}

export interface PaymentMethodBreakdown {
  label: string;
  percentage: number;
  color: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
}
