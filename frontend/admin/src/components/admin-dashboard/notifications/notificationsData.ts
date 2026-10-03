import { NotificationCategory, NotificationItem } from './types';

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  'All',
  'Order',
  'Inventory',
  'AI Insight',
  'Review',
  'System',
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Sparkling Water — Out of Stock',
    category: 'Inventory',
    message:
      'Sparkling Water (btl) has reached 0 units. Guests may be affected. Reorder from BevSupply immediately.',
    time: '2 min ago',
    isRead: false,
    priority: 'High',
  },
  {
    id: 'notif-2',
    title: 'Mozzarella Cheese Critical',
    category: 'Inventory',
    message:
      'Mozzarella Cheese is at 4 kg — below the critical threshold of 10 kg. Affects Pizza and Pasta categories.',
    time: '8 min ago',
    isRead: false,
    priority: 'High',
  },
  {
    id: 'notif-3',
    title: 'New Order — #10483',
    category: 'Order',
    message:
      'Table T-09 · 5 items · $74.50 · Assigned to Priya S. Order is now in Pending status.',
    time: '12 min ago',
    isRead: false,
    priority: 'Normal',
  },
  {
    id: 'notif-4',
    title: 'AI Insight: Weekend Revenue Surge',
    category: 'AI Insight',
    message:
      'Based on booking data and historical patterns, this weekend\'s revenue is projected +12% above last week. Consider additional staff coverage.',
    time: '25 min ago',
    isRead: false,
    priority: 'Normal',
  },
  {
    id: 'notif-5',
    title: 'New 5-Star Review from James W.',
    category: 'Review',
    message:
      '"Came in with a group of 6 for a birthday dinner. The staff went above and beyond — unforgettable!" Requires your reply.',
    time: '42 min ago',
    isRead: false,
    priority: 'Normal',
  },
  {
    id: 'notif-6',
    title: 'Order #10481 Ready for Pickup',
    category: 'Order',
    message:
      'Table T-03 · Liam Chen · 2 items are ready to be served. Server: Maria L.',
    time: '1 hr ago',
    isRead: true,
    priority: 'Normal',
  },
  {
    id: 'notif-7',
    title: 'Parmesan Cheese — Critical Level',
    category: 'Inventory',
    message:
      'Parmesan Cheese is at 3 kg vs. minimum 5 kg. Supplier: FreshDairy Co. Last updated: Today 9:00 AM.',
    time: '1 hr ago',
    isRead: true,
    priority: 'Normal',
  },
  {
    id: 'notif-8',
    title: 'AI Insight: Bundle Upsell Opportunity',
    category: 'AI Insight',
    message:
      '68% of dessert orders follow mains. A main + dessert combo at 10% discount could increase average order value by $4–6.',
    time: '2 hr ago',
    isRead: true,
    priority: 'Normal',
  },
  {
    id: 'notif-9',
    title: 'Order #10477 Cancelled',
    category: 'Order',
    message:
      'Table T-07 · Ava Johnson · $67.30 order cancelled. Server: Carlos M. Reason: Guest request.',
    time: '2 hr ago',
    isRead: true,
    priority: 'Normal',
  },
  {
    id: 'notif-10',
    title: 'QR Codes Regenerated',
    category: 'System',
    message:
      'All 30 table QR codes have been successfully regenerated. Previous codes are now invalidated.',
    time: '3 hr ago',
    isRead: true,
    priority: 'Normal',
  },
  {
    id: 'notif-11',
    title: 'New 2-Star Review from Tom H.',
    category: 'Review',
    message:
      '"My order came out wrong twice and the replacement took 20 minutes." Urgent — needs a response to protect your rating.',
    time: '3 hr ago',
    isRead: true,
    priority: 'Normal',
  },
  {
    id: 'notif-12',
    title: 'Daily Sales Report Ready',
    category: 'System',
    message:
      'Today\'s sales report has been generated. Total revenue: $15,840. 312 orders. Peak hour: 7 PM.',
    time: '5 hr ago',
    isRead: true,
    priority: 'Normal',
  },
  {
    id: 'notif-13',
    title: 'Soft Drinks (Cans) — Critical',
    category: 'Inventory',
    message:
      'Only 12 cans remain vs. minimum 48. BevSupply has same-day delivery available.',
    time: 'Yesterday',
    isRead: true,
    priority: 'Normal',
  },
  {
    id: 'notif-14',
    title: 'Table T-24 — High-Value Bill',
    category: 'Order',
    message:
      'Lucas Taylor\'s party has run up a $242.80 bill. Longest sitting table tonight (3h 20min).',
    time: 'Yesterday',
    isRead: true,
    priority: 'Normal',
  },
];
