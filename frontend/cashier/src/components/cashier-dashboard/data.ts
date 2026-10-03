import {
  CashierProfile,
  CashierStatCard,
  LiveTransaction,
  PendingCheckoutOrder,
  AIUpsellSuggestion,
  PaymentAlert,
  PaymentMethodBreakdown,
  CustomerReview,
} from './types';

export const mockCashierProfile: CashierProfile = {
  name: 'Emily Wilson',
  role: 'Cashier',
  branch: 'Downtown Branch',
  avatarUrl: '/icon.png',
  unreadNotifications: 2,
};

export const mockCashierStatCards: CashierStatCard[] = [
  {
    id: 'transactions-today',
    title: 'Transactions Today',
    value: '248',
    subtitle: 'Completed Payments',
    trend: '+12%',
    trendType: 'positive',
    badgeText: '+12%',
    iconName: 'Receipt',
  },
  {
    id: 'revenue-collected',
    title: 'Revenue Collected',
    value: '$9,860',
    subtitle: "Today's Sales",
    trend: '+8%',
    trendType: 'positive',
    badgeText: '+8%',
    iconName: 'DollarSign',
  },
  {
    id: 'pending-payments',
    title: 'Pending Payments',
    value: '03',
    subtitle: 'Require Immediate Attention',
    trend: 'Urgent',
    trendType: 'urgent',
    badgeText: 'Urgent',
    iconName: 'Clock',
  },
  {
    id: 'avg-checkout-time',
    title: 'Avg Checkout Time',
    value: '46s',
    subtitle: 'Excellent Performance',
    trend: '-4s',
    trendType: 'positive',
    badgeText: '-4s',
    iconName: 'Timer',
  },
  {
    id: 'refund-requests',
    title: 'Refund Requests',
    value: '02',
    subtitle: 'Pending Approval',
    trend: 'review',
    trendType: 'urgent',
    badgeText: 'review',
    iconName: 'RotateCcw',
  },
  {
    id: 'digital-payments',
    title: 'Digital Payments',
    value: '81%',
    subtitle: 'Cashless Transactions',
    trend: '+5%',
    trendType: 'positive',
    badgeText: '+5%',
    iconName: 'Smartphone',
  },
];

export const mockLiveTransactions: LiveTransaction[] = [
  {
    id: 'tx-1',
    transactionId: 'TX-10590',
    orderId: '#10482',
    paymentMethod: 'Visa Card',
    status: 'Paid',
    amount: 46.50,
    time: '2 mins ago',
  },
  {
    id: 'tx-2',
    transactionId: 'TX-10589',
    orderId: '#10482',
    paymentMethod: 'Cash',
    status: 'Paid',
    amount: 46.50,
    time: '5 mins ago',
  },
  {
    id: 'tx-3',
    transactionId: 'TX-10588',
    orderId: '#10482',
    paymentMethod: 'QR Payment',
    status: 'Paid',
    amount: 46.50,
    time: '8 mins ago',
  },
  {
    id: 'tx-4',
    transactionId: 'TX-10587',
    orderId: '#10482',
    paymentMethod: 'MasterCard',
    status: 'Pending',
    amount: 46.50,
    time: '12 mins ago',
  },
];

export const mockPendingOrders: PendingCheckoutOrder[] = [
  {
    id: 'pending-1',
    table: 'T-12',
    customerName: 'Mia Patel',
    orderNumber: '#10587',
    amount: 39.90,
    itemCount: 3,
    timeWaiting: '2m',
  },
  {
    id: 'pending-2',
    table: 'T-12',
    customerName: 'Noah Adams',
    orderNumber: '#10585',
    amount: 68.40,
    itemCount: 5,
    timeWaiting: '4m',
  },
  {
    id: 'pending-3',
    table: 'T-12',
    customerName: 'Noah Adams',
    orderNumber: '#10585',
    amount: 68.40,
    itemCount: 4,
    timeWaiting: '6m',
  },
];

export const mockAIUpsellSuggestions: AIUpsellSuggestion[] = [
  {
    id: 'upsell-1',
    title: 'Add Fries',
    description: 'Customers ordering burgers are 68% more likely to add fries.',
    icon: '🍟',
    probability: '68%',
  },
  {
    id: 'upsell-2',
    title: 'Recommend Soft Drinks',
    description: 'Combo upgrades are performing exceptionally well today.',
    icon: '🥤',
    probability: '54%',
  },
  {
    id: 'upsell-3',
    title: 'Suggest Desserts',
    description: 'Customers spending over $40 have a high chance of adding desserts.',
    icon: '🍰',
    probability: '72%',
  },
];

export const mockPaymentAlerts: PaymentAlert[] = [
  {
    id: 'alert-1',
    message: 'Card transaction TX-10579 requires manual verification.',
    severity: 'urgent',
  },
  {
    id: 'alert-2',
    message: 'Three completed orders are still awaiting payment.',
    severity: 'warning',
  },
  {
    id: 'alert-3',
    message: 'QR payment processing is operating normally.',
    severity: 'info',
  },
  {
    id: 'alert-4',
    message: 'Cash drawer balance should be reconciled before shift end.',
    severity: 'success',
  },
];

export const mockPaymentBreakdown: PaymentMethodBreakdown[] = [
  { label: 'Credit/Debit Cards', percentage: 46, color: '#3B82F6' },
  { label: 'QR Payments', percentage: 35, color: '#14B8A6' },
  { label: 'Cash', percentage: 19, color: '#F59E0B' },
];

export const mockCustomerReviews: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Sarah Johnson',
    rating: 5,
    comment: 'Fast payment process and friendly staff.',
  },
  {
    id: 'rev-2',
    author: 'Sarah Johnson',
    rating: 5,
    comment: 'Fast payment process and friendly staff.',
  },
];
