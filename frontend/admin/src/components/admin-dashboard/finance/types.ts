export type TimeframeFilter = 'Week' | 'Month' | 'Quarter' | 'Year';

export interface FinanceKPIs {
  revenue: number;
  revenueChange: number;
  expenses: number;
  expensesChange: number;
  netProfit: number;
  netProfitChange: number;
  profitMargin: number;
  marginChangePp: number;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface PnLRow {
  id: string;
  category: string;
  thisMonth: number;
  lastMonth: number;
  changePercent: number;
  ytd: number;
  isNegative?: boolean;
  isSummary?: boolean;
}
