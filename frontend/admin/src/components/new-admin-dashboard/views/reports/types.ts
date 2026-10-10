export interface BranchPerformanceRecord {
  id: string;
  name: string;
  restaurant: string;
  location: string;
  orders: number;
  revenue: number;
  revenueFormatted: string;
  avgOrder: number;
  avgOrderFormatted: string;
  growth: number;
  growthFormatted: string;
  performance: 'Excellent' | 'Strong' | 'Review' | 'Underperforming';
  topItem: string;
  cardSplit: number;
  cashSplit: number;
}
