export interface StatCardData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext: string;
  accentColor: 'yellow' | 'blue' | 'purple' | 'green' | 'teal' | 'orange';
  badgeExtra?: string;
  breakdown?: { label: string; value: string; color: string }[];
}

export interface QuickActionItem {
  id: string;
  label: string;
  iconName: string;
  color: string;
  bgGlow: string;
}

export interface FinancialPulseMetric {
  title: string;
  value: string;
  badge: string;
  isPositive: boolean;
  period: string;
  status: string;
  iconColor: string;
}

export interface OrderItem {
  id: string;
  table: string;
  customer: string;
  status: 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
  total: string;
  time: string;
  itemsCount?: number;
}

export interface TopMenuItem {
  rank: number;
  name: string;
  revenue: string;
  soldCount: number;
  percentage: number;
  category: string;
}

export interface ReservationItem {
  id: string;
  time: string;
  status: 'confirmed' | 'pending' | 'seated';
  guestName: string;
  table: string;
  guests: number;
  notes?: string;
}

export interface AIRecommendation {
  id: string;
  icon: string;
  title: string;
  category: 'Revenue' | 'Urgent' | 'Operations' | 'Marketing';
  categoryColor: string;
  description: string;
  impact: string;
  actionText: string;
  applied?: boolean;
}

export interface InventoryAlert {
  id: string;
  item: string;
  level: 'Critical' | 'Low' | 'Restock' | 'Recommended';
  percentage: number;
  color: string;
  currentStock: string;
  minRequired: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  timeAgo: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface MarketingCampaign {
  id: string;
  name: string;
  channel: string;
  sentCount: number;
  openRate: number;
  openRateTrend: 'up' | 'down';
  revenue: string;
}

export interface SupplierItem {
  id: string;
  name: string;
  category: string;
  status: 'Active' | 'Pending Delivery' | 'Invoice Due';
  nextDelivery: string;
  pendingAmount: string;
}
