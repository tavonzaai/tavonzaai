export type BarStatus = 'Queued' | 'Mixing' | 'Ready';

export interface BarOrderItem {
  name: string;
  quantity: number;
  note?: string;
}

export interface BarOrder {
  id: string; // '#10482'
  tableId: string; // 'T-08'
  server: string; // 'Jake R.'
  isRush?: boolean;
  status: BarStatus;
  elapsedSeconds: number; // e.g. 134 -> 02:14
  items: BarOrderItem[];
  createdAt: string;
}

export interface BDSStats {
  queuedCount: number;
  mixingCount: number;
  readyCount: number;
  totalActiveCount: number;
}
