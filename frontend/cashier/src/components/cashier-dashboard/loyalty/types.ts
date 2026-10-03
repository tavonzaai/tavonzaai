export type LoyaltyTab =
  | 'Overview'
  | 'VIP Customers'
  | 'Birthday Reminders'
  | 'Personalized Upsell';

export type LoyaltyTier = 'VIP' | 'Gold' | 'Silver' | 'Bronze';

export interface UpsellSuggestion {
  id: string;
  name: string;
  emoji: string;
  reason: string;
  probability: number;
  applied?: boolean;
}

export interface LoyaltyMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  tier: LoyaltyTier;
  points: number;
  nextTierPoints: number;
  lifetimeValue: number;
  avgOrder: number;
  visits: number;
  birthday: string;
  isBirthdayToday?: boolean;
  joinDate: string;
  tags: string[];
  suggestedBirthdayOffer?: string;
  birthdayOfferSent?: boolean;
  upsellSuggestions?: UpsellSuggestion[];
  avatarUrl?: string;
}

export interface LoyaltyStats {
  totalMembers: number;
  vipCustomers: number;
  totalLTV: number;
  birthdaysThisMonth: number;
}

export interface TierDistributionItem {
  tier: LoyaltyTier;
  membersCount: number;
  percentage: number;
  color: string;
  barColor: string;
}

export interface LTVLeaderboardItem {
  rank: number;
  initials: string;
  name: string;
  ltv: number;
  color: string;
}
