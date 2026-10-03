export type NotificationCategory =
  | 'All'
  | 'Order'
  | 'Inventory'
  | 'AI Insight'
  | 'Review'
  | 'System';

export type NotificationPriority = 'High' | 'Normal';

export interface NotificationItem {
  id: string;
  title: string;
  category: Exclude<NotificationCategory, 'All'>;
  message: string;
  time: string;
  isRead: boolean;
  priority?: NotificationPriority;
  actionUrl?: string;
  linkText?: string;
}
