export interface BIPredictiveCard {
  id: string;
  title: string;
  description: string;
  category: 'revenue' | 'menu' | 'staffing' | 'behavior';
  iconColor: string;
  iconBg: string;
}

export interface BIRevenueForecastPoint {
  day: string;
  revenue: number; // in thousands e.g. 14.5
}

export interface BIRadarMetric {
  axis: string;
  value: number; // 0 to 100
  label: string;
}

export interface BIActionPlanItem {
  id: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  action: string;
  impact: string;
  effort: 'Low effort' | 'Medium effort' | 'High effort';
  status: 'Recommended' | 'Urgent' | 'Pending' | 'Analysis';
  statusVariant: 'green' | 'red' | 'slate';
}
