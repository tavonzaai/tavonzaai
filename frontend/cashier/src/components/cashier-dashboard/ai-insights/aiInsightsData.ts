import {
  AIMetric,
  AIPerformancePoint,
  AIRecommendation,
  AIChatMessage,
} from './types';

export const initialAIMetrics: AIMetric[] = [
  {
    id: 'm-1',
    value: '$1,160',
    label: 'Revenue Prediction (2PM)',
    subtext: '+12%',
    color: 'text-teal-500',
  },
  {
    id: 'm-2',
    value: '20%',
    label: 'Expected Traffic Increase',
    subtext: 'in 1 hour',
    color: 'text-blue-500',
  },
  {
    id: 'm-3',
    value: '+$480',
    label: 'Upsell Opportunity',
    subtext: 'if applied',
    color: 'text-amber-500',
  },
  {
    id: 'm-4',
    value: '94%',
    label: 'AI Confidence Score',
    subtext: 'high',
    color: 'text-violet-500',
  },
];

export const initialAIPerformancePoints: AIPerformancePoint[] = [
  { time: '8am', revenue: 2150 },
  { time: '9am', revenue: 3650 },
  { time: '10am', revenue: 4550 },
  { time: '11am', revenue: 7900 },
  { time: '12pm', revenue: 12200 },
  { time: '1pm', revenue: 11100 },
  { time: '2pm', revenue: 6350 },
];

export const initialAIRecommendations: AIRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Peak Hour Strategy',
    description:
      'Your 12PM–1PM window generates 40% of daily revenue. Staff at Counter 02 can reduce wait time by 2 minutes.',
    type: 'peak',
    accent: 'teal',
    actionLabel: 'Alert Staff',
  },
  {
    id: 'rec-2',
    title: 'Promote QR Payments',
    description:
      'QR payments are 32% faster than cash. Displaying QR codes prominently could reduce average checkout from 46s to 31s.',
    type: 'qr',
    accent: 'blue',
    actionLabel: 'Enable QR Display',
  },
  {
    id: 'rec-3',
    title: 'Upsell Window',
    description:
      '3 current orders are at $35–$40. Suggesting desserts or drinks could push them over $50, triggering loyalty tier benefits.',
    type: 'upsell',
    accent: 'amber',
    actionLabel: 'Suggest Upsells',
  },
  {
    id: 'rec-4',
    title: 'Verify TX-10579',
    description:
      'This MasterCard transaction has been flagged for manual review. Delay could result in payment reversal after 24 hours.',
    type: 'verify',
    accent: 'red',
    actionLabel: 'Inspect TX',
  },
];

export const initialChatMessages: AIChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: "Hello! I'm Tavonza AI. I've analyzed today's checkout data and I'm ready to help. What would you like to know?",
    timestamp: 'Just now',
  },
];

export const suggestedPromptChips = [
  'Which hour has peak sales today?',
  "What's the most popular payment method?",
  'Which items should I upsell next?',
];
