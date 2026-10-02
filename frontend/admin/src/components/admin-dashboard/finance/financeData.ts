import { ExpenseItem, FinanceKPIs, MonthlyTrend, PnLRow, TimeframeFilter } from './types';

export const TIMEFRAME_KPIS: Record<TimeframeFilter, FinanceKPIs> = {
  Week: {
    revenue: 27400,
    revenueChange: 8.5,
    expenses: 15300,
    expensesChange: 2.1,
    netProfit: 12100,
    netProfitChange: 14.2,
    profitMargin: 44.1,
    marginChangePp: 1.8,
  },
  Month: {
    revenue: 108900,
    revenueChange: 12.8,
    expenses: 61200,
    expensesChange: 4.1,
    netProfit: 47700,
    netProfitChange: 18.4,
    profitMargin: 43.8,
    marginChangePp: 2.1,
  },
  Quarter: {
    revenue: 326700,
    revenueChange: 15.2,
    expenses: 183600,
    expensesChange: 3.8,
    netProfit: 143100,
    netProfitChange: 21.0,
    profitMargin: 43.8,
    marginChangePp: 2.4,
  },
  Year: {
    revenue: 1306800,
    revenueChange: 22.4,
    expenses: 734400,
    expensesChange: 5.6,
    netProfit: 572400,
    netProfitChange: 26.8,
    profitMargin: 43.8,
    marginChangePp: 3.2,
  },
};

export const EXPENSE_BREAKDOWN: ExpenseItem[] = [
  {
    id: 'exp-1',
    name: 'Food & Beverage',
    amount: 24800,
    percentage: 40,
    color: '#6366f1', // indigo-500
  },
  {
    id: 'exp-2',
    name: 'Staff Wages',
    amount: 18600,
    percentage: 30,
    color: '#22c55e', // green-500
  },
  {
    id: 'exp-3',
    name: 'Rent & Utilities',
    amount: 9300,
    percentage: 15,
    color: '#f59e0b', // amber-500
  },
  {
    id: 'exp-4',
    name: 'Marketing',
    amount: 4960,
    percentage: 8,
    color: '#ec4899', // pink-500
  },
  {
    id: 'exp-5',
    name: 'Equipment',
    amount: 3720,
    percentage: 6,
    color: '#06b6d4', // cyan-500
  },
  {
    id: 'exp-6',
    name: 'Other',
    amount: 620,
    percentage: 1,
    color: '#64748b', // slate-500
  },
];

export const MONTHLY_TRENDS: MonthlyTrend[] = [
  { month: 'Jan', revenue: 78000, expenses: 48000, profit: 30000 },
  { month: 'Feb', revenue: 84000, expenses: 51000, profit: 33000 },
  { month: 'Mar', revenue: 92000, expenses: 53000, profit: 39000 },
  { month: 'Apr', revenue: 95000, expenses: 56000, profit: 39000 },
  { month: 'May', revenue: 102000, expenses: 58000, profit: 44000 },
  { month: 'Jun', revenue: 104000, expenses: 59000, profit: 45000 },
  { month: 'Jul', revenue: 108900, expenses: 61200, profit: 47700 },
];

export const PNL_STATEMENT_ROWS: PnLRow[] = [
  {
    id: 'pnl-1',
    category: 'Food Revenue',
    thisMonth: 94200,
    lastMonth: 89100,
    changePercent: 5.7,
    ytd: 622400,
  },
  {
    id: 'pnl-2',
    category: 'Beverage Revenue',
    thisMonth: 14700,
    lastMonth: 13500,
    changePercent: 8.9,
    ytd: 98200,
  },
  {
    id: 'pnl-3',
    category: 'Cost of Goods Sold (COGS)',
    thisMonth: 24800,
    lastMonth: 23200,
    changePercent: -6.9,
    ytd: 168400,
    isNegative: true,
  },
  {
    id: 'pnl-4',
    category: 'Gross Profit',
    thisMonth: 84100,
    lastMonth: 79400,
    changePercent: 5.9,
    ytd: 552200,
    isSummary: true,
  },
  {
    id: 'pnl-5',
    category: 'Labor & Wages',
    thisMonth: 18600,
    lastMonth: 18200,
    changePercent: -2.2,
    ytd: 126800,
    isNegative: true,
  },
  {
    id: 'pnl-6',
    category: 'Rent & Utilities',
    thisMonth: 9300,
    lastMonth: 9300,
    changePercent: 0.0,
    ytd: 65100,
    isNegative: true,
  },
  {
    id: 'pnl-7',
    category: 'Marketing & Advertising',
    thisMonth: 4960,
    lastMonth: 5200,
    changePercent: 4.6,
    ytd: 34700,
    isNegative: true,
  },
  {
    id: 'pnl-8',
    category: 'Net Profit',
    thisMonth: 47700,
    lastMonth: 40300,
    changePercent: 18.4,
    ytd: 312800,
    isSummary: true,
  },
];
