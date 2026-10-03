import { LucideIcon } from 'lucide-react';

export interface WaiterKPI {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  valueColor?: string;
}

export interface PriorityTask {
  id: string;
  title: string;
  table: string;
  severity: 'high' | 'medium' | 'yellow' | 'low';
  dotColor: string;
  completed?: boolean;
}

export interface AssignedTable {
  id: string;
  tableNumber: string;
  guests: number;
  maxCapacity: number;
  status: 'Available' | 'Occupied' | 'Dining' | 'Billing';
  waitMinutes: number;
  serverName?: string;
  notes?: string;
}

export interface LiveOrder {
  id: string;
  orderNumber: string;
  tableNumber: string;
  items: string[];
  status: 'Ready to Serve' | 'Preparing' | 'Served' | 'New Order';
  statusColor: string;
  statusBg: string;
  statusText: string;
  eta: string;
  timeAgo: string;
}

export interface AIRecommendation {
  id: string;
  category: 'Upsell' | 'Beverage' | 'VIP Guest' | 'Birthday' | 'Special';
  categoryColor: string;
  categoryBg: string;
  title: string;
  description: string;
  targetTable: string;
  iconType: 'sparkles' | 'glass' | 'star' | 'cake';
  applied?: boolean;
}

export interface LiveAlert {
  id: string;
  message: string;
  severity: 'red' | 'yellow' | 'green' | 'orange';
  dotColor: string;
  timeAgo: string;
}

export interface GuestReview {
  id: string;
  guestName: string;
  rating: number;
  comment: string;
  timeAgo: string;
}

export interface CheckoutTable {
  id: string;
  tableNumber: string;
  amount: number;
  status: 'Ready' | 'Waiting' | 'Processing';
  statusColor: string;
  statusBg: string;
  guestName?: string;
  itemCount: number;
}

export interface QuickActionItem {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  badge?: string;
}

export interface GuestRequest {
  id: string;
  tableNumber: string;
  type: 'Water Refill' | 'Bill Request' | 'Waiter Call' | 'Extra Cutlery' | 'Clean Table';
  status: 'Pending' | 'In Progress' | 'Resolved';
  timeAgo: string;
  notes?: string;
}
