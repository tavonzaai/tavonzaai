export type InventoryUnit =
  | 'KG'
  | 'GRAM'
  | 'LITER'
  | 'ML'
  | 'PIECE'
  | 'BOX'
  | 'PACKET';

export interface SupplierEntity {
  id: string;
  branchId: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryCategoryEntity {
  id: string;
  name: string;
  description?: string | null;
  branchId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItemEntity {
  id: string;
  branchId: string;
  supplierId: string;
  categoryId: string;
  name: string;
  sku?: string | null;
  unit: InventoryUnit;
  currentStock: number;
  lowStockThreshold?: number | null;
  costPerUnit?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
