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
  orderType?: string;
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

export interface BranchDetail {
  id: string;
  restaurantId: string;
  name: string;
  address: {
    line1?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    [key: string]: any;
  };
  phone?: string;
  timezone?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchOperatingHourItem {
  id?: string;
  branchId?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
  permissions?: string[];
}

export interface KitchenTicketItem {
  id: string;
  orderId: string;
  orderNumber: string;
  tableLabel?: string | null;
  productName: string;
  quantity: number;
  stationType: string;
  status: string;
  specialInstructions?: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  servedAt?: string | null;
  createdAt?: string;
}

export const branchManagerService = {
  getBranch: async (branchId: string): Promise<BranchDetail> => {
    const res = await baseApiFetch<BranchDetail>(`/branches/${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  updateBranch: async (branchId: string, payload: Partial<BranchDetail>): Promise<BranchDetail> => {
    const res = await baseApiFetch<BranchDetail>(`/branches/${encodeURIComponent(branchId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  getOperatingHours: async (branchId: string): Promise<BranchOperatingHourItem[]> => {
    const res = await baseApiFetch<BranchOperatingHourItem[]>(`/branches/${encodeURIComponent(branchId)}/operating-hours`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  updateOperatingHours: async (
    branchId: string,
    hours: Array<{ dayOfWeek: number; openTime: string; closeTime: string }>
  ): Promise<BranchOperatingHourItem[]> => {
    const res = await baseApiFetch<BranchOperatingHourItem[]>(`/branches/${encodeURIComponent(branchId)}/operating-hours`, {
      method: 'PUT',
      body: JSON.stringify({ hours }),
    });
    return (res as any)?.data || res;
  },

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

  getStaffAssignments: async (
    branchId: string,
    filters?: { role?: string; search?: string }
  ): Promise<StaffAssignmentItem[]> => {
    const params = new URLSearchParams();
    if (filters?.role && filters.role !== 'ALL') params.append('role', filters.role);
    if (filters?.search && filters.search.trim()) params.append('search', filters.search.trim());
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await baseApiFetch<StaffAssignmentItem[]>(`/branches/${encodeURIComponent(branchId)}/staff${query}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  createStaff: async (branchId: string, payload: CreateStaffPayload): Promise<StaffAssignmentItem> => {
    const res = await baseApiFetch<StaffAssignmentItem>(`/branches/${encodeURIComponent(branchId)}/staff`, {
      method: 'POST',
      body: JSON.stringify(payload),
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

  getOrders: async (
    branchId: string,
    filters?: { status?: string; search?: string; tableId?: string } | string
  ): Promise<LiveOrderItem[]> => {
    const params = new URLSearchParams();
    if (typeof filters === 'string') {
      if (filters && filters !== 'ALL') params.append('status', filters);
    } else if (filters) {
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.tableId) params.append('tableId', filters.tableId);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await baseApiFetch<LiveOrderItem[]>(`/orders/branch/${encodeURIComponent(branchId)}${query}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getKitchenTickets: async (branchId: string, station?: string): Promise<KitchenTicketItem[]> => {
    const query = station && station !== 'ALL' ? `?station=${encodeURIComponent(station)}` : '';
    const res = await baseApiFetch<KitchenTicketItem[]>(`/kitchen/tickets/${encodeURIComponent(branchId)}${query}`, {
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
