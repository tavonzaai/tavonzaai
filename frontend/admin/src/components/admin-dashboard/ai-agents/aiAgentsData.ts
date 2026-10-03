import { AIAgentItem } from './types';

export const INITIAL_AI_AGENTS: AIAgentItem[] = [
  {
    id: 'agent-1',
    name: 'Revenue Optimizer',
    status: 'running',
    description:
      'Analyzes sales patterns and recommends pricing adjustments and promotions in real time.',
    actionsToday: 284,
    lastAction: '2 min ago',
    impact: '+$1,240 today',
    themeColor: 'green',
    iconType: 'revenue',
    autonomyLevel: 'Full Auto',
    accuracyRate: '99.4%',
    logs: [
      {
        id: 'log-1',
        timestamp: '2 min ago',
        action: 'Applied dynamic happy-hour bundle for Craft Cocktails (+14% orders)',
        type: 'success',
      },
      {
        id: 'log-2',
        timestamp: '18 min ago',
        action: 'Boosted Chef Special Pasta visibility during high table turnover',
        type: 'info',
      },
      {
        id: 'log-3',
        timestamp: '45 min ago',
        action: 'Recalibrated wine pairing suggestions for dinner rush',
        type: 'info',
      },
    ],
  },
  {
    id: 'agent-2',
    name: 'Inventory Monitor',
    status: 'running',
    description:
      'Tracks stock levels and automatically sends reorder alerts and purchase recommendations.',
    actionsToday: 48,
    lastAction: '15 min ago',
    impact: '0 stockouts today',
    themeColor: 'amber',
    iconType: 'inventory',
    autonomyLevel: 'Full Auto',
    accuracyRate: '98.9%',
    logs: [
      {
        id: 'log-4',
        timestamp: '15 min ago',
        action: 'Created draft purchase order for Organic Tomatoes (Stock < 15%)',
        type: 'warning',
      },
      {
        id: 'log-5',
        timestamp: '1h ago',
        action: 'Audited Truffle Oil usage variance across dinner service',
        type: 'info',
      },
    ],
  },
  {
    id: 'agent-3',
    name: 'Customer Engagement',
    status: 'running',
    description:
      'Identifies high-value customers and triggers personalized loyalty campaigns automatically.',
    actionsToday: 156,
    lastAction: '1h ago',
    impact: '12 campaigns sent',
    themeColor: 'indigo',
    iconType: 'customer',
    autonomyLevel: 'Full Auto',
    accuracyRate: '96.8%',
    logs: [
      {
        id: 'log-6',
        timestamp: '1h ago',
        action: 'Dispatched VIP Anniversary greeting with complimentary dessert coupon',
        type: 'success',
      },
      {
        id: 'log-7',
        timestamp: '2h ago',
        action: 'Re-engaged 18 lapsed weekend brunch guests with SMS invite',
        type: 'info',
      },
    ],
  },
  {
    id: 'agent-4',
    name: 'Reputation Sentinel',
    status: 'paused',
    description:
      'Analyzes guest sentiment across review platforms and drafts personalized responses.',
    actionsToday: 22,
    lastAction: '4h ago',
    impact: '4.9 avg rating',
    themeColor: 'pink',
    iconType: 'reputation',
    autonomyLevel: 'Approval Required',
    accuracyRate: '97.2%',
    logs: [
      {
        id: 'log-8',
        timestamp: '4h ago',
        action: 'Drafted 5-star gratitude response for Sarah M. review',
        type: 'info',
      },
      {
        id: 'log-9',
        timestamp: '6h ago',
        action: 'Flagged table service feedback trend to General Manager',
        type: 'warning',
      },
    ],
  },
  {
    id: 'agent-5',
    name: 'Labor & Shift Optimizer',
    status: 'running',
    description:
      'Forecasts customer traffic surges and automatically optimizes staff shift allocations.',
    actionsToday: 8,
    lastAction: '15 min ago',
    impact: '18% labor saved',
    themeColor: 'violet',
    iconType: 'labor',
    autonomyLevel: 'Full Auto',
    accuracyRate: '95.5%',
    logs: [
      {
        id: 'log-10',
        timestamp: '15 min ago',
        action: 'Adjusted Friday evening bar staff allocation for predicted +30% volume',
        type: 'success',
      },
      {
        id: 'log-11',
        timestamp: '3h ago',
        action: 'Suggested early shift release for 2 prep cooks (low demand index)',
        type: 'info',
      },
    ],
  },
  {
    id: 'agent-6',
    name: 'Menu Profitability Analyst',
    status: 'idle',
    description:
      'Identifies high-margin and underperforming menu items to suggest ingredient swaps.',
    actionsToday: 0,
    lastAction: 'Never',
    impact: '—',
    themeColor: 'cyan',
    iconType: 'menu',
    autonomyLevel: 'Supervised',
    accuracyRate: '98.0%',
    logs: [
      {
        id: 'log-12',
        timestamp: 'Yesterday',
        action: 'Initialized cost-per-portion analysis for Q3 seasonal menu',
        type: 'info',
      },
    ],
  },
];
