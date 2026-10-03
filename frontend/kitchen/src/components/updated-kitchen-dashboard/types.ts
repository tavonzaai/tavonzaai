export type OrderStatus = "NEW" | "PREPARING" | "READY" | "OVERDUE" | "COMPLETED";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  options: string[];
  isCompleted: boolean;
}

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  table: string;
  orderType: string;
  waiter: string;
  status: OrderStatus;
  items: OrderItem[];
  timeElapsedMinutes: number;
  station: string;
  flaggedIssue?: string;
  createdAt: string;
}

export interface KitchenStation {
  id: string;
  name: string;
  chefAssigned: string;
  activeTickets: number;
  status: "OPTIMAL" | "BUSY" | "BOTTLENECK";
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

export interface Recipe {
  id: string;
  name: string;
  prepTimeMinutes: number;
  station: string;
  ingredients: string[];
}

export interface ShiftStat {
  ticketsCompleted: number;
  avgPrepTimeMinutes: number;
  flaggedIssuesCount: number;
  efficiencyScorePct: number;
}
