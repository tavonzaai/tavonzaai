import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch, getCookie } from '../api/baseApi';

export const DEFAULT_BRANCH_ID = 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(id: any): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id.trim());
}

export function getActiveBranchId(): string {
  const fromCookie = getCookie('tavonza_branch_id') || getCookie('branch_id');
  if (fromCookie && isValidUuid(fromCookie)) return fromCookie;

  const rawUser = getCookie('branch_manager_user');
  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser);
      if (parsed?.branchId && isValidUuid(parsed.branchId)) return parsed.branchId;
      if (parsed?.assignments?.[0]?.branchId && isValidUuid(parsed.assignments[0].branchId)) {
        return parsed.assignments[0].branchId;
      }
    } catch {}
  }

  return DEFAULT_BRANCH_ID;
}

export interface BranchSettings {
  id: string;
  branchId: string;
  orderAcceptanceMode: 'AUTO_ACCEPT' | 'WAITER_APPROVAL' | 'MANAGER_APPROVAL';
  taxRate: number;
  serviceChargeRate: number;
  currency: string;
  autoCloseIdleSessionMins: number;
  allowGuestOrdering: boolean;
  allowSplitPayments: boolean;
}

export interface TableItem {
  id: string;
  branchId: string;
  label: string;
  capacity: number;
  shape: string;
  serviceStatus: string;
  operationalFlag: string;
  activeSessionId?: string | null;
  qrCodeUrl?: string | null;
  qrCodeToken?: string | null;
  isActive: boolean;
}

export interface StaffAssignmentItem {
  id: string;
  branchId: string;
  staffId: string;
  staffName?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  role: string;
  permissions: string[];
  isActive: boolean;
  assignedAt: string;
}

export interface LiveOrderItem {
  id?: string;
  orderId: string;
  orderNumber: string;
  tableId: string;
  tableLabel?: string;
  tableNumber?: string;
  status: string;
  displayStatus: string;
  itemCount: number;
  total: number;
  totalAmount?: number;
  paymentStatus?: string;
  waiterName?: string;
  estimatedPrepTime?: number;
  createdAt: string;
  submittedAt?: string;
  items?: Array<{
    id: string;
    menuItemId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    notes?: string;
  }>;
}

export interface MenuCategoryItem {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  itemCount?: number;
}

export interface MenuItemResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  categoryName?: string;
  isPopular?: boolean;
  isAvailable?: boolean;
}

export const branchManagerService = {
  getSettings: async (branchId: string): Promise<BranchSettings> => {
    const res = await baseApiFetch<BranchSettings>(`/branches/${encodeURIComponent(branchId)}/settings`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  updateSettings: async (branchId: string, payload: Partial<BranchSettings>): Promise<BranchSettings> => {
    const res = await baseApiFetch<BranchSettings>(`/branches/${encodeURIComponent(branchId)}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  getTables: async (branchId: string): Promise<TableItem[]> => {
    const res = await baseApiFetch<TableItem[]>(`/tables?branchId=${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  createTable: async (payload: { branchId: string; label: string; capacity: number; shape?: string }): Promise<TableItem> => {
    const res = await baseApiFetch<TableItem>('/tables', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  updateTable: async (tableId: string, payload: Partial<TableItem>): Promise<TableItem> => {
    const res = await baseApiFetch<TableItem>(`/tables/${encodeURIComponent(tableId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  deleteTable: async (tableId: string): Promise<{ success: boolean }> => {
    const res = await baseApiFetch<{ success: boolean }>(`/tables/${encodeURIComponent(tableId)}`, {
      method: 'DELETE',
    });
    return (res as any)?.data || res;
  },

  getTableQr: async (tableId: string): Promise<{ qrCodeUrl: string; tableUrl: string }> => {
    try {
      const res = await baseApiFetch<{ qrCodeUrl: string; tableUrl: string }>(`/tables/${encodeURIComponent(tableId)}/qr`, {
        method: 'GET',
      });
      return (res as any)?.data || res;
    } catch {
      // Fallback to regenerateQr
      const regen = await baseApiFetch<TableItem>(`/tables/${encodeURIComponent(tableId)}/regenerate-qr`, {
        method: 'POST',
      });
      const token = (regen as any)?.qrCodeToken || (regen as any)?.data?.qrCodeToken;
      return {
        qrCodeUrl: token ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(token)}` : '',
        tableUrl: token ? `/t/${token}` : '',
      };
    }
  },

  regenerateQr: async (tableId: string): Promise<TableItem> => {
    const res = await baseApiFetch<TableItem>(`/tables/${encodeURIComponent(tableId)}/regenerate-qr`, {
      method: 'POST',
    });
    return (res as any)?.data || res;
  },

  getStaffAssignments: async (branchId: string): Promise<StaffAssignmentItem[]> => {
    const res = await baseApiFetch<StaffAssignmentItem[]>(`/branches/${encodeURIComponent(branchId)}/staff`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  assignStaff: async (branchId: string, payload: { staffId: string; role: string; permissions: string[] }): Promise<StaffAssignmentItem> => {
    const res = await baseApiFetch<StaffAssignmentItem>(`/branches/${encodeURIComponent(branchId)}/staff/assign`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  getOrders: async (branchId: string, status?: string): Promise<LiveOrderItem[]> => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await baseApiFetch<LiveOrderItem[]>(`/orders/branch/${encodeURIComponent(branchId)}${query}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getOrderDetail: async (orderId: string): Promise<LiveOrderItem> => {
    const res = await baseApiFetch<LiveOrderItem>(`/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<LiveOrderItem> => {
    const res = await baseApiFetch<LiveOrderItem>(`/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return (res as any)?.data || res;
  },

  getCategories: async (branchId: string): Promise<MenuCategoryItem[]> => {
    const res = await baseApiFetch<MenuCategoryItem[]>(`/menus/${encodeURIComponent(branchId)}/categories`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getMenuItems: async (branchId: string, categoryId?: string, search?: string): Promise<MenuItemResponse[]> => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (search) params.append('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await baseApiFetch<MenuItemResponse[]>(`/menus/${encodeURIComponent(branchId)}/items${queryString}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },
};

export const fetchBranchSettings = createAsyncThunk<BranchSettings, string, { rejectValue: string }>(
  'branchManager/fetchSettings',
  async (branchId, { rejectWithValue }) => {
    try {
      return await branchManagerService.getSettings(branchId);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch branch settings');
    }
  }
);

export const updateBranchSettingsThunk = createAsyncThunk<
  BranchSettings,
  { branchId: string; updates: Partial<BranchSettings> },
  { rejectValue: string }
>(
  'branchManager/updateSettings',
  async ({ branchId, updates }, { rejectWithValue }) => {
    try {
      return await branchManagerService.updateSettings(branchId, updates);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update branch settings');
    }
  }
);
