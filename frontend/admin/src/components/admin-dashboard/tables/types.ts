export type TableFloorStatus = 'Occupied' | 'Available' | 'Reserved';
export type TableFloorFilter =
  | 'All Tables'
  | 'Occupied'
  | 'Available'
  | 'Reserved';

export interface TableFloorItem {
  id: string; // 'T-01'
  number: string; // '01'
  capacity: number; // 4
  currentPartySize: number; // 3 (3p)
  zone: string; // 'Main Hall'
  status: TableFloorStatus;
  server: string; // 'Jake R.'
  seatedTime: string; // '1:15 PM' or '—'
  billAmount: number; // 68.50
}

export interface TablesKPIStats {
  occupiedCount: number;
  totalCount: number;
  availableCount: number;
  reservedCount: number;
  activeRevenue: number;
}
