export type CustomerTier = 'Gold' | 'Silver' | 'Bronze';

export interface CashierCustomer {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  phone: string;
  visits: number;
  totalSpent: number;
  lastVisit: string;
  tier: CustomerTier;
  memberSince?: string;
  favoriteItems?: string[];
  notes?: string;
}

export interface CustomerStats {
  totalCustomers: number;
  goldMembers: number;
  avgLifetimeValue: number;
}
