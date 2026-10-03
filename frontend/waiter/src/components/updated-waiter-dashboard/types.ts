export type TableStatus = 'ready' | 'attention' | 'preparing' | 'bill' | 'seated';

export interface TrayItem {
  id: string;
  name: string;
  source: string; // e.g. 'KITCHEN' | 'BAR'
  verified?: boolean;
}

export interface DashboardTable {
  id: string;
  tableNumber: number;
  tableName: string;
  zone: string;
  timeElapsed: string; // e.g. "45m"
  status: TableStatus;
  statusLabel: string;
  guestsCount: string; // e.g. "2/2 guests"
  waiterName: string; // e.g. "Alex Rivera ( you )"
  notes: string;
  trayItems: TrayItem[];
  orderId?: string;
  billAmount?: string;
  attentionReason?: string;
}

export interface ShiftKPIs {
  allTables: number;
  ready: number;
  attention: number;
  bill: number;
  seated: number;
  shiftStatus: string;
  ordersInProgress: number;
  nextPriorityTable: string;
  nextPriorityOrder: string;
}

export interface SpeedPreset {
  id: string;
  title: string;
  department: 'Busser' | 'Kitchen' | 'Manager' | 'Bar';
  priority: 'Normal' | 'High' | 'Urgent';
  iconType?: string;
}

export interface AdHocRequest {
  id: string;
  tableName: string;
  department: 'Kitchen' | 'Busser' | 'Manager' | 'Bar';
  priority: 'Normal' | 'High' | 'Urgent';
  timestamp: string;
  message: string;
  completed?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'Starters' | 'Mains' | 'Desserts' | 'Cocktails & Wine' | 'Non-Alcoholic' | 'Chef Specials';
  description: string;
  dietaryTags: string[]; // e.g. ['Vegetarian', 'Gluten-Free']
  imageUrl?: string;
}

export interface OrderTicketItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  allergyNote: string;
}
