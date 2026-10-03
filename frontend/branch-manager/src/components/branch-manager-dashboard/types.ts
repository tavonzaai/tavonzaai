export type NavigationTab =
  | 'Dashboard'
  | 'Table'
  | 'Orders'
  | 'Staff'
  | 'Kitchen'
  | 'Payments'
  | 'Menu'
  | 'Reports'
  | 'Branch Config';

export type TableStatus =
  | 'available'
  | 'occupied'
  | 'preparing'
  | 'ready'
  | 'need_attention'
  | 'payment';

export interface TableItem {
  id: string;
  number: string;
  status: TableStatus;
  waiter?: string;
  orderNumber?: string;
  orderTime?: string;
  itemsCount?: number;
  capacity?: number;
  subtotal?: number;
}

export interface OrderDish {
  id: string;
  name: string;
  station: string;
  status: 'Ready' | 'preparing' | 'Delayed';
  notes?: string;
  quantity: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  activeTables: number;
  avatarColor?: string;
  isCurrent?: boolean;
}

export interface OrderItemRow {
  id: string;
  orderNumber: string;
  waiterLocation: string;
  items: string;
  timeElapsed: string;
  isUrgent?: boolean;
  status: 'Preparing' | 'Ready' | 'Pending' | 'Payment Pending' | 'Needs Attention' | 'Ordering' | 'Completed';
  total: string;
}

export interface StaffCardData {
  id: string;
  name: string;
  role: 'Waiters' | 'Kitchen' | 'Bartenders' | 'Cashiers' | 'Assistant Manager';
  status: 'Active' | 'Break' | 'Late';
  currentShift: string;
  currentAssignment: string;
  stationTables: string;
  clockInTime: string;
}

export interface KdsItem {
  name: string;
  category: 'MAIN' | 'SIDE' | 'BEVERAGE' | 'ALCOHOL' | 'APPETIZER';
  mod?: string;
}

export interface KdsTicket {
  id: string;
  table: string;
  orderNumber: string;
  timeAgo: string;
  server: string;
  items: KdsItem[];
  isPlated?: boolean;
}

export interface ManagerProfile {
  name: string;
  role: string;
  branch: string;
  avatarUrl?: string;
}

// Payments Types
export interface PaymentRecord {
  id: string;
  orderNumber: string;
  table: string;
  customer: string;
  amount: string;
  method: 'Visa Card' | 'Cash' | 'Digital Wallet';
  status: 'Preparing' | 'Ready' | 'Pending' | 'Payment Pending' | 'Needs Attention' | 'Ordering';
  waiter: string;
  timestamp?: string;
  partySize?: number;
  recordId?: string;
  servingCashier?: string;
  posDetails?: string;
}

export interface PaymentSummaryKpi {
  todaysTotal: string;
  transactionsCount: number;
  pendingTotal: string;
  pendingCount: number;
  completedTotal: string;
  completedCount: number;
  failedTotal: string;
  failedCount: number;
  cardReaderCount: number;
  cashCount: number;
}

// Menu Types
export interface MenuItem {
  id: string;
  name: string;
  category: 'Starters' | 'Mains - Grill' | 'Mains - Pasta' | 'Desserts' | 'Beverages' | 'Sides';
  stationBadge: string;
  stationBadgeColor: string;
  price: string;
  description: string;
  status: 'Available' | 'Disabled';
  availability: 'In stock' | 'Low Stock (8 Left)' | 'Out of stock';
  modifiersCount: string;
  enabled: boolean;
}
