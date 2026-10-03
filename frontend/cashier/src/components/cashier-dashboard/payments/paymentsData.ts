import { PaymentStatItem, HourlyRevenuePoint, PaymentMethodBreakdownItem } from './types';

export const INITIAL_PAYMENT_STATS: PaymentStatItem[] = [
  {
    id: 'today-revenue',
    title: "Today's Revenue",
    value: '$9,860',
    subtitle: '248 transactions',
    accent: 'teal',
    borderOutline: 'outline-yellow-500/30',
    iconBg: 'bg-teal-500/10',
    iconBorder: 'outline-teal-500/20',
    iconColor: 'text-teal-500',
    textColor: 'text-teal-500',
  },
  {
    id: 'pending-amount',
    title: 'Pending Amount',
    value: '$113.70',
    subtitle: '3 pending payments',
    accent: 'amber',
    borderOutline: 'outline-blue-500/30',
    iconBg: 'bg-amber-500/10',
    iconBorder: 'outline-amber-500/20',
    iconColor: 'text-amber-500',
    textColor: 'text-amber-500',
  },
  {
    id: 'refunds-today',
    title: 'Refunds Today',
    value: '$18.50',
    subtitle: '1 transaction',
    accent: 'red',
    borderOutline: 'outline-green-700/30',
    iconBg: 'bg-red-500/10',
    iconBorder: 'outline-red-500/20',
    iconColor: 'text-red-500',
    textColor: 'text-red-500',
  },
  {
    id: 'avg-transaction',
    title: 'Avg Transaction',
    value: '$39.76',
    subtitle: 'Per payment',
    accent: 'blue',
    borderOutline: 'outline-zinc-800',
    iconBg: 'bg-blue-500/10',
    iconBorder: 'outline-blue-500/20',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-500',
  },
];

export const HOURLY_REVENUE_DATA: HourlyRevenuePoint[] = [
  { hour: '8AM', amount: 380 },
  { hour: '10AM', amount: 550 },
  { hour: '12PM', amount: 820 },
  { hour: '2PM', amount: 1450 },
  { hour: '4PM', amount: 1180 },
  { hour: '6PM', amount: 720 },
  { hour: '8PM', amount: 220 },
];

export const PAYMENT_METHOD_BREAKDOWN: PaymentMethodBreakdownItem[] = [
  {
    label: 'Credit/Debit Cards',
    percentage: 46,
    color: '#3B82F6',
    textColor: 'text-blue-500',
    barColor: 'bg-blue-500',
    dotColor: 'bg-blue-500',
  },
  {
    label: 'QR Payments',
    percentage: 35,
    color: '#14B8A6',
    textColor: 'text-teal-500',
    barColor: 'bg-teal-500',
    dotColor: 'bg-teal-500',
  },
  {
    label: 'Cash',
    percentage: 19,
    color: '#F59E0B',
    textColor: 'text-amber-500',
    barColor: 'bg-amber-500',
    dotColor: 'bg-amber-500',
  },
];
