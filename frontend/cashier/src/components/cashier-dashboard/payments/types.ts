export type PaymentMode = 'process' | 'refund';
export type PaymentMethodOption = 'card' | 'cash' | 'qr';

export interface PaymentStatItem {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  accent: 'teal' | 'amber' | 'red' | 'blue';
  borderOutline: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  textColor: string;
}

export interface HourlyRevenuePoint {
  hour: string;
  amount: number;
}

export interface PaymentMethodBreakdownItem {
  label: string;
  percentage: number;
  color: string;
  textColor: string;
  barColor: string;
  dotColor: string;
}
