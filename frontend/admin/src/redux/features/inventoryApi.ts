import { baseApiFetch } from '../api/baseApi';
import { buildQueryString } from '@tavonza/shared';

export interface BackendInventoryItem {
  id: string;
  branchId: string;
  name: string;
  sku?: string | null;
  categoryId?: string | null;
  unit: string;
  currentStock: number;
  minimumStock: number;
  costPerUnit: number;
  supplierId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendSupplier {
  id: string;
  branchId: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  leadTimeDays?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendInventoryCategory {
  id: string;
  branchId: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItemPayload {
  branchId: string;
  name: string;
  sku?: string;
  categoryId?: string;
  unit: string;
  currentStock?: number;
  minimumStock: number;
  costPerUnit: number;
  supplierId?: string;
}

export interface UpdateInventoryItemPayload {
  name?: string;
  sku?: string;
  categoryId?: string;
  unit?: string;
  minimumStock?: number;
  costPerUnit?: number;
  supplierId?: string;
  isActive?: boolean;
}

export interface AdjustStockPayload {
  quantityDelta: number;
  reason: 'PURCHASE_RECEIPT' | 'WASTE' | 'CORRECTION' | 'PRODUCTION_USAGE';
  notes?: string;
}

export const inventoryService = {
  getBranchItems: async (
    branchId: string,
    lowStockOnly = false
  ): Promise<BackendInventoryItem[]> => {
    const qs = buildQueryString({ lowStockOnly: lowStockOnly ? 'true' : undefined });
    const res = await baseApiFetch<BackendInventoryItem[]>(
      `/inventory/items/branch/${encodeURIComponent(branchId)}${qs}`,
      {
        method: 'GET',
      }
    );
    return (res as any)?.data || res || [];
  },

  getItemById: async (id: string): Promise<BackendInventoryItem> => {
    const res = await baseApiFetch<BackendInventoryItem>(
      `/inventory/items/${encodeURIComponent(id)}`,
      {
        method: 'GET',
      }
    );
    return (res as any)?.data || res;
  },

  createItem: async (payload: CreateInventoryItemPayload): Promise<BackendInventoryItem> => {
    const res = await baseApiFetch<BackendInventoryItem>('/inventory/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  updateItem: async (
    id: string,
    payload: UpdateInventoryItemPayload
  ): Promise<BackendInventoryItem> => {
    const res = await baseApiFetch<BackendInventoryItem>(
      `/inventory/items/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
    return (res as any)?.data || res;
  },

  deleteItem: async (id: string): Promise<BackendInventoryItem> => {
    const res = await baseApiFetch<BackendInventoryItem>(
      `/inventory/items/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      }
    );
    return (res as any)?.data || res;
  },

  adjustStock: async (
    id: string,
    payload: AdjustStockPayload
  ): Promise<BackendInventoryItem> => {
    const res = await baseApiFetch<BackendInventoryItem>(
      `/inventory/items/${encodeURIComponent(id)}/adjust`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
    return (res as any)?.data || res;
  },

  getInventorySummary: async (branchId: string, lowStockOnly = false): Promise<any> => {
    const qs = buildQueryString({ lowStockOnly: lowStockOnly ? 'true' : undefined });
    const res = await baseApiFetch<any>(
      `/inventory/summary/branch/${encodeURIComponent(branchId)}${qs}`,
      {
        method: 'GET',
      }
    );
    return (res as any)?.data || res || {};
  },

  getSuppliers: async (branchId: string): Promise<BackendSupplier[]> => {
    const res = await baseApiFetch<BackendSupplier[]>(
      `/inventory/suppliers/branch/${encodeURIComponent(branchId)}`,
      {
        method: 'GET',
      }
    );
    return (res as any)?.data || res || [];
  },

  createSupplier: async (payload: any): Promise<BackendSupplier> => {
    const res = await baseApiFetch<BackendSupplier>('/inventory/suppliers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  updateSupplier: async (id: string, payload: any): Promise<BackendSupplier> => {
    const res = await baseApiFetch<BackendSupplier>(
      `/inventory/suppliers/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
    return (res as any)?.data || res;
  },

  deleteSupplier: async (id: string): Promise<any> => {
    const res = await baseApiFetch<any>(`/inventory/suppliers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return (res as any)?.data || res;
  },

  getCategories: async (branchId: string): Promise<BackendInventoryCategory[]> => {
    const res = await baseApiFetch<BackendInventoryCategory[]>(
      `/inventory/categories/branch/${encodeURIComponent(branchId)}`,
      {
        method: 'GET',
      }
    );
    return (res as any)?.data || res || [];
  },

  createCategory: async (payload: any): Promise<BackendInventoryCategory> => {
    const res = await baseApiFetch<BackendInventoryCategory>('/inventory/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  deleteCategory: async (id: string): Promise<any> => {
    const res = await baseApiFetch<any>(`/inventory/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return (res as any)?.data || res;
  },
};
