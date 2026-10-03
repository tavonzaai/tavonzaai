export type TableStatus = 'Busy' | 'Free';
export type TableFilter = 'All' | 'Occupied' | 'Available';

export interface LiveOrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  status: 'served' | 'ready' | 'cooking';
}

export interface ActivityLogItem {
  id: string;
  text: string;
  time: string;
  type: 'amber' | 'emerald' | 'blue' | 'gray';
}

export interface QRTableItem {
  id: string; // 'T-01'
  number: string; // '01'
  seats: number; // 2
  zone: string; // 'Main Hall'
  status: TableStatus; // 'Busy' | 'Free'
  server: string; // 'Jake R.'
  url: string; // 'order.tavonza.ai/t/t-01'
  qrActiveVersion: string; // 'Yes — v3 (Jul 2026)'
  scansToday: number; // 5
  lastScanTime: string; // '4 min ago'
  seatedMinutesAgo?: number; // 28
  liveOrder?: {
    itemsCount: number;
    subtotal: number;
    items: LiveOrderItem[];
  };
  activityLogs?: ActivityLogItem[];
}
