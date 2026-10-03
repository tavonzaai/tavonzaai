export type AnalyticsTimeframe = 'This Week' | 'This Month';

export interface AnalyticsKPIs {
  totalRevenue: number;
  revenueChangePercent: number;
  avgOrderValue: number;
  aovChangePercent: number;
  peakHour: string;
  peakHourOrders: number;
  topCategoryName: string;
  topCategoryPercent: number;
}

export interface DailyRevenuePoint {
  day: string;
  revenue: number; // in thousands e.g. 14.5
}

export interface CategorySplitItem {
  name: string;
  amountFormatted: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface HourlyTrafficItem {
  hour: string; // '10am', '11am', ...
  dineIn: number;
  takeout: number;
  total: number;
}

export interface ServerPerformanceItem {
  rank: number;
  name: string;
  revenue: number;
  percentage: number;
  rating: number;
}

export interface CustomersVsOrdersPoint {
  day: string;
  orders: number;
  customers: number;
}
