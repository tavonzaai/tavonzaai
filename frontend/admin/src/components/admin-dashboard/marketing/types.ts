export type CampaignChannel = 'SMS' | 'Email' | 'Push';
export type CampaignStatus = 'Active' | 'Draft' | 'Scheduled' | 'Completed';

export interface CampaignItem {
  id: string;
  name: string;
  channel: CampaignChannel;
  date: string;
  status: CampaignStatus;
  sentCount: number;
  openRate: number; // percentage
  revenue: number; // in USD
  targetAudience: string;
  messageContent: string;
  deliveryRate?: number; // e.g. 98.4%
  clickRate?: number; // e.g. 34.2%
  conversionsCount?: number; // e.g. 142 orders
  cost?: number; // in USD
}

export interface MarketingKPI {
  id: string;
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtext: string;
  badge?: string;
}

export interface AudienceOption {
  id: string;
  name: string;
  count: number;
  description: string;
}

export interface CreateCampaignFormData {
  name: string;
  channel: CampaignChannel;
  targetAudience: string;
  messageContent: string;
  status: CampaignStatus;
}
