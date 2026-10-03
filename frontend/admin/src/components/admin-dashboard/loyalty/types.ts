export interface LoyaltyKPIs {
  totalMembers: string;
  pointsIssued: string;
  pointsRedeemed: string;
  programRevenue: string;
}

export interface LoyaltyTier {
  id: string;
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  pointsRange: string;
  colorTheme: string;
  borderTheme: string;
  iconBg: string;
  textColor: string;
  metricLabel: string;
  metricValue: string;
  growth?: string;
  perks: string[];
}

export interface LoyaltyReward {
  id: string;
  icon: string;
  name: string;
  pointsCost: number;
  claimedCount: number;
  category?: string;
  description?: string;
}

export interface LoyaltyActivity {
  id: string;
  avatar: string;
  userName: string;
  action: string;
  timeAgo: string;
  pointsChange?: number;
  badge?: string;
  isUpgrade?: boolean;
}
