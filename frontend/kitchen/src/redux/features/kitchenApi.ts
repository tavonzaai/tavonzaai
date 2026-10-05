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

export function getActiveBranchId(): string {
  if (typeof window !== 'undefined') {
    try {
      const match = document.cookie.match(/(?:^|;\s*)active_branch_id=([^;]+)/);
      if (match && match[1]) {
        const val = decodeURIComponent(match[1]);
        if (val.length === 36 && val.includes('-')) return val;
      }
      const rawUser = localStorage.getItem('tavonza_user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed?.branchId && parsed.branchId.length === 36) return parsed.branchId;
        if (parsed?.assignments?.[0]?.branchId && parsed.assignments[0].branchId.length === 36) {
          return parsed.assignments[0].branchId;
        }
      }
    } catch {}
  }
  return 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';
}

export const kitchenService = {
  getOrders: async (branchId: string): Promise<any[]> => {
    const res = await baseApiFetch<any[]>(`/orders/branch/${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },
  getActiveTickets: async (branchId: string, station?: KitchenStationType): Promise<KitchenTicketItem[]> => {
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
