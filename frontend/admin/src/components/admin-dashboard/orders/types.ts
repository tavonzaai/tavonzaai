export type OrderStatus =
  | 'All'
  | 'Pending'
  | 'Preparing'
  | 'Ready'
  | 'Served'
  | 'Completed'
  | 'Cancelled';

export interface OrderRow {
  id: string;
  table: string;
  customer: string;
  items: string;
  server: string;
  time: string;
  status: 'Preparing' | 'Ready' | 'Served' | 'Completed' | 'Pending' | 'Cancelled';
  total: string;
}

export interface OrdersStatMetric {
  title: string;
  value: string;
  iconName: 'ShoppingBag' | 'Clock' | 'TrendingUp' | 'DollarSign';
  isRevenue?: boolean;
}
