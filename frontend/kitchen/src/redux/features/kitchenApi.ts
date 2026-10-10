import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch } from '../api/baseApi';

export type KitchenStationType = 'KITCHEN' | 'BAR';
export type KitchenItemStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'UNAVAILABLE' | 'CANCELLED';

export interface KitchenTicketItem {
  id: string;
  orderId: string;
  orderNumber: string;
  branchId?: string;
  tableId?: string | null;
  tableSessionId?: string | null;
  tableLabel?: string | null;
  productName: string;
  quantity: number;
  stationType: KitchenStationType;
  status: KitchenItemStatus;
  specialInstructions?: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  servedAt?: string | null;
  createdAt: string;
}

export interface UpdateItemStatusPayload {
  itemId: string;
  status: KitchenItemStatus;
  unavailableReason?: string;
}

export interface ToggleAvailabilityPayload {
  menuItemId: string;
  isAvailable: boolean;
}

const isUUID = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));

export function getActiveBranchId(): string {
  if (typeof window !== 'undefined') {
    try {
      // 1. Direct branch cookies
      const match = document.cookie.match(/(?:^|;\s*)(?:active_branch_id|tavonza_branch_id|kitchen_branch_id|branch_id)=([^;]+)/);
      if (match && match[1]) {
        const val = decodeURIComponent(match[1]);
        if (isUUID(val)) return val;
      }

      // 2. User cookies (kitchen_user, tavonza_user, user)
      const userCookieMatch = document.cookie.match(/(?:^|;\s*)(?:kitchen_user|tavonza_user|user)=([^;]+)/);
      if (userCookieMatch && userCookieMatch[1]) {
        try {
          const parsed = JSON.parse(decodeURIComponent(userCookieMatch[1]));
          if (isUUID(parsed?.branchId)) return parsed.branchId;
          if (isUUID(parsed?.assignments?.[0]?.branchId)) return parsed.assignments[0].branchId;
          if (isUUID(parsed?.assignments?.[0]?.branch?.id)) return parsed.assignments[0].branch.id;
        } catch {}
      }

      // 3. localStorage keys
      for (const key of ['kitchen_user', 'tavonza_user', 'user']) {
        const rawUser = localStorage.getItem(key);
        if (rawUser) {
          try {
            const parsed = JSON.parse(rawUser);
            if (isUUID(parsed?.branchId)) return parsed.branchId;
            if (isUUID(parsed?.assignments?.[0]?.branchId)) return parsed.assignments[0].branchId;
            if (isUUID(parsed?.assignments?.[0]?.branch?.id)) return parsed.assignments[0].branch.id;
          } catch {}
        }
      }
    } catch {}
  }
  return '';
}


export const kitchenService = {
  getOrders: async (branchId: string): Promise<any[]> => {
    if (!branchId) return [];
    const res = await baseApiFetch<any[]>(`/orders/branch/${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },
  getActiveTickets: async (branchId: string, station?: KitchenStationType): Promise<KitchenTicketItem[]> => {
    if (!branchId) return [];
    let url = `/kitchen/tickets/${encodeURIComponent(branchId)}`;
    if (station) {
      url += `?station=${encodeURIComponent(station)}`;
    }
    const res = await baseApiFetch<KitchenTicketItem[]>(url, { method: 'GET' });
    return (res as any)?.data || res;
  },

  updateItemStatus: async (payload: UpdateItemStatusPayload): Promise<void> => {
    await baseApiFetch<void>(`/kitchen/items/${encodeURIComponent(payload.itemId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: payload.status,
        ...(payload.unavailableReason ? { unavailableReason: payload.unavailableReason } : {}),
      }),
    });
  },

  toggleMenuItemAvailability: async (payload: ToggleAvailabilityPayload): Promise<void> => {
    await baseApiFetch<void>(`/kitchen/menu-items/${encodeURIComponent(payload.menuItemId)}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable: payload.isAvailable }),
    });
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<any> => {
    const res = await baseApiFetch<any>(`/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return (res as any)?.data || res;
  },

  getInventoryItems: async (branchId: string): Promise<any[]> => {
    const res = await baseApiFetch<any[]>(`/inventory/items/branch/${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res || [];
  },

  adjustStock: async (
    itemId: string,
    payload: { quantityDelta: number; reason: string; notes?: string }
  ): Promise<any> => {
    const res = await baseApiFetch<any>(`/inventory/items/${encodeURIComponent(itemId)}/adjust`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  getShifts: async (branchId: string, date?: string): Promise<any[]> => {
    const qs = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await baseApiFetch<any[]>(`/shifts/branch/${encodeURIComponent(branchId)}${qs}`, {
      method: 'GET',
    });
    return (res as any)?.data || res || [];
  },
};

export const fetchActiveKitchenTickets = createAsyncThunk<
  KitchenTicketItem[],
  { branchId: string; station?: KitchenStationType },
  { rejectValue: string }
>(
  'kitchen/fetchActiveTickets',
  async ({ branchId, station }, { rejectWithValue }) => {
    try {
      return await kitchenService.getActiveTickets(branchId, station);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch kitchen tickets');
    }
  }
);

export const updateKitchenItemStatusThunk = createAsyncThunk<
  UpdateItemStatusPayload,
  UpdateItemStatusPayload,
  { rejectValue: string }
>(
  'kitchen/updateItemStatus',
  async (payload, { rejectWithValue }) => {
    try {
      await kitchenService.updateItemStatus(payload);
      return payload;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update item status');
    }
  }
);
