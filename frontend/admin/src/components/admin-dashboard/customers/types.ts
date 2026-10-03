export type CustomerSegment = 'VIP' | 'Regular' | 'New';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: CustomerSegment;
  visits: number;
  totalSpent: number;
  rating: number;
  lastVisit: string;
  memberSince?: string;
  notes?: string;
}

export interface CustomersKPIs {
  totalCustomers: number;
  vipMembers: number;
  avgSpend: number;
  visitsToday: number;
}
