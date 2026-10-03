import {
  ShiftStats,
  HourlyRevenuePoint,
  WeeklyPerformancePoint,
  TopPerformingItem,
  ShiftInfo,
} from './types';

export const initialShiftInfo: ShiftInfo = {
  cashierName: 'Emily Wilson',
  role: 'Cashier',
  date: 'Sunday, July 17, 2026',
  startTime: '08:00 AM',
  duration: '4h 32m',
  branch: 'Downtown Branch',
  company: 'Tavonza Group',
};

export const initialShiftStats: ShiftStats = {
  totalRevenue: 9860,
  transactionsCount: 248,
  avgSpend: 39.76,
  cashierHours: '4h 32m',
  cashCollected: 1873,
  cardPayments: 4536,
  qrPayments: 18.5,
  visitsToday: 18.5,
};

export const initialHourlyRevenue: HourlyRevenuePoint[] = [
  { hour: '8am', revenue: 650, transactions: 18, heightPercent: 30 },
  { hour: '9am', revenue: 1780, transactions: 44, heightPercent: 80 },
  { hour: '10am', revenue: 1120, transactions: 29, heightPercent: 51 },
  { hour: '11am', revenue: 450, transactions: 12, heightPercent: 20 },
  { hour: '12pm', revenue: 1380, transactions: 36, heightPercent: 63 },
  { hour: '1pm', revenue: 2180, transactions: 58, heightPercent: 99 },
  { hour: '2pm', revenue: 1020, transactions: 26, heightPercent: 46 },
  { hour: '3pm', revenue: 1310, transactions: 34, heightPercent: 60 },
  { hour: '4pm', revenue: 260, transactions: 7, heightPercent: 12 },
];

export const initialWeeklyPerformance: WeeklyPerformancePoint[] = [
  { day: 'Mon', revenue: 5200 },
  { day: 'Tue', revenue: 5800 },
  { day: 'Wed', revenue: 4900 },
  { day: 'The', revenue: 7200 },
  { day: 'Fri', revenue: 9100 },
  { day: 'Sta', revenue: 12400 },
  { day: 'Sun', revenue: 10800 },
];

export const initialTopItems: TopPerformingItem[] = [
  {
    rank: 1,
    name: 'Beef Burger',
    quantitySold: 42,
    revenue: 545.58,
    progressPercent: 84,
  },
  {
    rank: 2,
    name: 'Margherita Pizza',
    quantitySold: 35,
    revenue: 545.58,
    progressPercent: 76,
  },
  {
    rank: 3,
    name: 'French Fries',
    quantitySold: 61,
    revenue: 545.58,
    progressPercent: 66,
  },
  {
    rank: 4,
    name: 'Chocolate Cake',
    quantitySold: 28,
    revenue: 545.58,
    progressPercent: 52,
  },
  {
    rank: 5,
    name: 'Coca Cola',
    quantitySold: 78,
    revenue: 545.58,
    progressPercent: 52,
  },
];
