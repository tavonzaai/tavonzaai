export type MarketplaceCategory =
  | 'All Tiers'
  | 'Delivery'
  | 'Reservations'
  | 'Reviews'
  | 'Accounting'
  | 'Marketing'
  | 'Payments'
  | 'Communication';

export type AppBadge = 'Popular' | '● On Shift' | 'Top Rated' | 'New' | 'Verified';

export interface MarketplaceApp {
  id: string;
  name: string;
  category: Exclude<MarketplaceCategory, 'All Tiers'>;
  badge?: AppBadge;
  description: string;
  price: string;
  rating: number;
  reviewsCount?: number;
  isInstalled: boolean;
  developer: string;
  logoBg: string;
  logoColor: string;
  permissions?: string[];
  lastSync?: string;
}
