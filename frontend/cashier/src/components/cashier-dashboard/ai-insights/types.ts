export interface AIMetric {
  id: string;
  value: string;
  label: string;
  subtext: string;
  color: string;
}

export interface AIPerformancePoint {
  time: string;
  revenue: number;
}

export interface AIChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export type RecommendationType = 'peak' | 'qr' | 'upsell' | 'verify';

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  type: RecommendationType;
  accent: 'teal' | 'blue' | 'amber' | 'red';
  actionLabel?: string;
  resolved?: boolean;
}
