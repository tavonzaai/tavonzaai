import {
  BIActionPlanItem,
  BIPredictiveCard,
  BIRadarMetric,
  BIRevenueForecastPoint,
} from './types';

export const BI_PREDICTIVE_CARDS: BIPredictiveCard[] = [
  {
    id: 'pred-1',
    title: 'Revenue Forecast',
    description:
      'Weekend revenue is projected at $39,200, 8.4% above last weekend. Peak hours 6pm–9pm on Saturday.',
    category: 'revenue',
    iconColor: '#22c55e',
    iconBg: 'rgba(34, 197, 94, 0.10)',
  },
  {
    id: 'pred-2',
    title: 'Menu Optimization',
    description:
      'Burgers and desserts have the highest margin-to-volume ratio. Consider bundling for combo upsells.',
    category: 'menu',
    iconColor: '#6366f1',
    iconBg: 'rgba(99, 102, 241, 0.10)',
  },
  {
    id: 'pred-3',
    title: 'Staffing Alert',
    description:
      'Dinner service on Saturday will need 2 additional waiters. Current schedule is under-allocated by 18%.',
    category: 'staffing',
    iconColor: '#f59e0b',
    iconBg: 'rgba(245, 158, 11, 0.10)',
  },
  {
    id: 'pred-4',
    title: 'Customer Behavior',
    description:
      'Returning customers spend 34% more per visit. Loyalty program enrollment is up 12% this month.',
    category: 'behavior',
    iconColor: '#ec4899',
    iconBg: 'rgba(236, 72, 153, 0.10)',
  },
];

export const BI_REVENUE_FORECAST_DATA: BIRevenueForecastPoint[] = [
  { day: 'Mon', revenue: 7.5 },
  { day: 'Tue', revenue: 10.2 },
  { day: 'Wed', revenue: 9.4 },
  { day: 'The', revenue: 13.8 }, // 'The' (Thu) from Figma
  { day: 'Fri', revenue: 18.5 },
  { day: 'Sta', revenue: 21.8 }, // 'Sta' (Sat) from Figma
  { day: 'Sun', revenue: 17.2 },
];

export const BI_RADAR_METRICS: BIRadarMetric[] = [
  { axis: 'Revenue', label: 'Revenue', value: 94 },
  { axis: 'Operations', label: 'Operations', value: 88 },
  { axis: 'Inventory', label: 'Inventory', value: 92 },
  { axis: 'Customer Sat.', label: 'Customer Sat.', value: 95 },
  { axis: 'Staff', label: 'Staff', value: 85 },
  { axis: 'Profitability', label: 'Profitability', value: 90 },
];

export const BI_ACTION_PLAN_ITEMS: BIActionPlanItem[] = [
  {
    id: 'act-1',
    priority: 'P1',
    action: 'Increase kitchen staff by 1 chef on Friday and Saturday evenings',
    impact: '↑ $2,400/week',
    effort: 'Low effort',
    status: 'Recommended',
    statusVariant: 'green',
  },
  {
    id: 'act-2',
    priority: 'P2',
    action: 'Launch a weekend combo meal promotion with 15% bundle discount',
    impact: '↑ $1,800/week',
    effort: 'Medium effort',
    status: 'Recommended',
    statusVariant: 'green',
  },
  {
    id: 'act-3',
    priority: 'P3',
    action: 'Restock mozzarella and chicken breast before Thursday service',
    impact: 'Prevent $3,100 loss',
    effort: 'Low effort',
    status: 'Urgent',
    statusVariant: 'red',
  },
  {
    id: 'act-4',
    priority: 'P4',
    action: 'Send review request to 12 recent satisfied customers via SMS',
    impact: '↑ 2-3 new reviews',
    effort: 'Low effort',
    status: 'Pending',
    statusVariant: 'slate',
  },
  {
    id: 'act-5',
    priority: 'P5',
    action: 'Implement dynamic pricing during peak hours (6pm–9pm)',
    impact: '↑ $900/week',
    effort: 'High effort',
    status: 'Analysis',
    statusVariant: 'slate',
  },
];
