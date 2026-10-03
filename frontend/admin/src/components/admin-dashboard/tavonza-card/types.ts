export type CardTier = 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
export type CardMemberStatus = 'Active' | 'Inactive';

export interface CardMember {
  id: string;
  cardId: string;
  name: string;
  email: string;
  tier: CardTier;
  points: number;
  totalSpend: number;
  visits: number;
  lastVisit: string;
  joined: string;
  status: CardMemberStatus;
}

export interface CardTierInfo {
  tier: CardTier;
  criteria: string;
  count: number;
  color: string;
}

export interface CardSummaryKPIs {
  totalMembers: number;
  activeMembers: number;
  pointsIssued: string;
  memberSpend: string;
  tierBreakdown: Record<CardTier, number>;
}
