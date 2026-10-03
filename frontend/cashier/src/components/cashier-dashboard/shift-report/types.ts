export interface ShiftStats {
  totalRevenue: number;
  transactionsCount: number;
  avgSpend: number;
  cashierHours: string;
  cashCollected: number;
  cardPayments: number;
  qrPayments: number;
  visitsToday: number;
}

export interface HourlyRevenuePoint {
  hour: string;
  revenue: number;
  transactions: number;
  heightPercent: number;
}

export interface WeeklyPerformancePoint {
  day: string;
  revenue: number;
}

export interface TopPerformingItem {
  rank: number;
  name: string;
  quantitySold: number;
  revenue: number;
  progressPercent: number;
}

export interface ShiftInfo {
  cashierName: string;
  role: string;
  date: string;
  startTime: string;
  duration: string;
  branch: string;
  company: string;
}
