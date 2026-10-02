export type InventoryCategory =
  | 'All'
  | 'Dairy'
  | 'Protein'
  | 'Produce'
  | 'Dry Goods'
  | 'Beverages'
  | 'Condiments';

export type StockStatus = 'Critical' | 'Low Stock' | 'Out of Stock' | 'In Stock';

export type StockStatusFilter = 'All' | 'Critical' | 'Low' | 'Out' | 'OK';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  currentStock: number;
  unit: string; // 'kg', 'L', 'pcs', 'heads', 'btl', 'doz'
  minStock: number;
  maxStock: number;
  levelPercent: number; // 0 to 100
  supplier: string;
  lastUpdated: string;
  status: StockStatus;
}

export interface InventoryKPIs {
  totalItems: number;
  criticalOrLowCount: number;
  outOfStockCount: number;
  inStockCount: number;
}
