export type AdminNavTab =
  | 'dashboard'
  | 'restaurants'
  | 'branches'
  | 'restaurant-branches'
  | 'permissions'
  | 'payments'
  | 'reports'
  | 'subscription'
  | 'settings';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface MetricCardData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext?: string;
}

export interface RevenueDataPoint {
  day: string;
  value: number; // in thousands ($k)
  formatted: string;
}

export interface BusinessHealthMetric {
  name: string;
  score: number;
  color: string;
}

export interface RestaurantItem {
  id: string;
  name: string;
  description?: string;
  tagline?: string;
  cuisine?: string;
  manager?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  branchesCount: number;
  staffCount?: number;
  monthlyRevenue?: string;
  rating?: number;
  status: 'Active' | 'Setup' | 'Closed' | 'Open' | 'Maintenance';
}

export interface BranchItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  location: string;
  manager: string;
  hours?: string;
  openingTime?: string;
  closingTime?: string;
  contactNumber?: string;
  tablesCount?: number;
  occupancy?: number; // percentage
  status: 'Active' | 'Setup' | 'Closed' | 'Offline';
  kitchenSync?: 'Online' | 'Connecting';
  monthlyRevenue?: string;
}

export interface PermissionRole {
  id: string;
  title: string;
  usersCount: number;
  badgeColor: string;
  description: string;
  capabilities: string[];
}

export interface PaymentTransaction {
  id: string;
  restaurant: string;
  branch: string;
  orderNumber: string;
  amount: string;
  method: 'Stripe' | 'POS Terminal' | 'QR Pay' | 'Apple Pay';
  status: 'Completed' | 'Pending' | 'Refunded';
  timestamp: string;
}
