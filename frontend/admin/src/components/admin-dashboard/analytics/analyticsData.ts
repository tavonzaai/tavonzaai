import {
  AnalyticsKPIs,
  AnalyticsTimeframe,
  CategorySplitItem,
  CustomersVsOrdersPoint,
  DailyRevenuePoint,
  HourlyTrafficItem,
  ServerPerformanceItem,
} from './types';

export const TIMEFRAME_ANALYTICS_KPIS: Record<AnalyticsTimeframe, AnalyticsKPIs> = {
  'This Week': {
    totalRevenue: 12840,
    revenueChangePercent: 12.8,
    avgOrderValue: 39.4,
    aovChangePercent: 6.3,
    peakHour: '7:00 PM',
    peakHourOrders: 188,
    topCategoryName: 'Burgers',
    topCategoryPercent: 34,
  },
  'This Month': {
    totalRevenue: 58640,
    revenueChangePercent: 15.4,
    avgOrderValue: 42.1,
    aovChangePercent: 8.1,
    peakHour: '7:30 PM',
    peakHourOrders: 790,
    topCategoryName: 'Burgers',
    topCategoryPercent: 36,
  },
};

export const DAILY_REVENUE_DATA: DailyRevenuePoint[] = [
  { day: 'Mon', revenue: 8.2 },
  { day: 'Tue', revenue: 11.4 },
  { day: 'Wed', revenue: 9.8 },
  { day: 'Thu', revenue: 13.5 },
  { day: 'Fri', revenue: 17.6 },
  { day: 'Sat', revenue: 21.4 },
  { day: 'Sun', revenue: 16.8 },
];

export const CATEGORY_SPLIT_DATA: CategorySplitItem[] = [
  {
    name: 'Burgers',
    amountFormatted: '$28.4k',
    amount: 28400,
    percentage: 34,
    color: '#f97316', // orange-500
  },
  {
    name: 'Pizza',
    amountFormatted: '$24.8k',
    amount: 24800,
    percentage: 29,
    color: '#3b82f6', // blue-500
  },
  {
    name: 'Pasta',
    amountFormatted: '$16.2k',
    amount: 16200,
    percentage: 19,
    color: '#a855f7', // purple-500
  },
  {
    name: 'Salads',
    amountFormatted: '$9.8k',
    amount: 9800,
    percentage: 11,
    color: '#22c55e', // green-500
  },
  {
    name: 'Desserts',
    amountFormatted: '$6.4k',
    amount: 6400,
    percentage: 7,
    color: '#ec4899', // pink-500
  },
  {
    name: 'Drinks',
    amountFormatted: '$12.8k',
    amount: 12800,
    percentage: 15,
    color: '#14b8a6', // teal-500
  },
];

export const HOURLY_TRAFFIC_DATA: HourlyTrafficItem[] = [
  { hour: '10am', dineIn: 18, takeout: 12, total: 30 },
  { hour: '11am', dineIn: 45, takeout: 25, total: 70 },
  { hour: '12pm', dineIn: 68, takeout: 32, total: 100 },
  { hour: '1pm', dineIn: 55, takeout: 28, total: 83 },
  { hour: '2pm', dineIn: 32, takeout: 18, total: 50 },
  { hour: '3pm', dineIn: 22, takeout: 14, total: 36 },
  { hour: '4pm', dineIn: 28, takeout: 16, total: 44 },
  { hour: '5pm', dineIn: 58, takeout: 26, total: 84 },
  { hour: '6pm', dineIn: 76, takeout: 34, total: 110 },
  { hour: '7pm', dineIn: 92, takeout: 42, total: 134 },
  { hour: '8pm', dineIn: 64, takeout: 24, total: 88 },
  { hour: '9pm', dineIn: 38, takeout: 14, total: 52 },
];

export const TOP_SERVERS_DATA: ServerPerformanceItem[] = [
  { rank: 1, name: 'Jake R.', revenue: 4240, percentage: 100, rating: 4.9 },
  { rank: 2, name: 'Maria L.', revenue: 3240, percentage: 76, rating: 4.9 },
  { rank: 3, name: 'Carlos M.', revenue: 2890, percentage: 68, rating: 4.8 },
  { rank: 4, name: 'Aisha B.', revenue: 2540, percentage: 60, rating: 4.8 },
  { rank: 5, name: 'Elena S.', revenue: 2120, percentage: 50, rating: 4.7 },
];

export const CUSTOMERS_VS_ORDERS_DATA: CustomersVsOrdersPoint[] = [
  { day: 'Mon', orders: 240, customers: 190 },
  { day: 'Tue', orders: 310, customers: 260 },
  { day: 'Wed', orders: 290, customers: 230 },
  { day: 'Thu', orders: 380, customers: 310 },
  { day: 'Fri', orders: 490, customers: 410 },
  { day: 'Sat', orders: 580, customers: 490 },
  { day: 'Sun', orders: 430, customers: 360 },
];
