export type KitchenStatus = 'New Orders' | 'In Progress' | 'Ready To Serve';

export interface KitchenOrderItem {
  name: string;
  quantity: number;
  note?: string;
}

export interface KitchenOrder {
  id: string; // '#10482'
  tableId: string; // 'T-08'
  server: string; // 'Jake R.'
  isRush?: boolean;
  status: KitchenStatus;
  elapsedSeconds: number; // e.g. 134 -> 02:14
  items: KitchenOrderItem[];
  createdAt: string;
}

export interface KDSStats {
  newOrdersCount: number;
  inProgressCount: number;
  readyToServeCount: number;
  totalActiveCount: number;
  avgPrepTimeMinutes: number;
}
