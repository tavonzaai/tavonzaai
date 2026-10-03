import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch } from '../api/baseApi';

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

export interface WaiterTableAssignment {
  id: string;
  branchId: string;
  waiterId: string;
  tableId: string;
  tableNumber: string;
  capacity?: number;
  serviceStatus: string;
  activeSessionId?: string | null;
  sessionStart: string;
  sessionEnd: string;
}

export interface WaiterOrderSummary {
  id: string;
  orderId?: string;
  orderNumber: string;
  tableNumber: string;
  tableLabel?: string;
  tableId: string;
  itemsCount: number;
  totalAmount: number;
  total?: number;
  paymentStatus?: string;
  waiterName?: string;
  status: string;
  placedAt: string;
  createdAt?: string;
  acceptedAt?: string | null;
  guestName?: string | null;
  specialInstructions?: string | null;
  items?: any[];
}

export interface WaiterOrderItem {
  id: string;
  menuItemId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  specialInstructions?: string | null;
  status?: string | null;
  stationType?: string;
  addOns?: Array<{ name: string; price: number }>;
}

export interface WaiterOrderDetail extends WaiterOrderSummary {
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  items: WaiterOrderItem[];
}

export interface CustomerAlert {
  id: string;
  tableNumber: string;
  tableId: string;
  tableSessionId: string;
  type: 'call_waiter' | 'request_bill' | 'need_help' | 'custom';
  message?: string | null;
  status: 'pending' | 'acknowledged' | 'resolved';
  createdAt: string;
}

export interface RejectOrderPayload {
  orderId: string;
  reason: string;
  reasonCode?: 'ITEM_UNAVAILABLE' | 'KITCHEN_CAPACITY' | 'MODIFICATION_IMPOSSIBLE' | 'ALLERGY_CONCERN' | 'RESTAURANT_CLOSING' | 'OTHER';
}

export interface CreateOrderOnBehalfPayload {
  branchId: string;
  tableId: string;
  tableSessionId: string;
  customerIdentifier: string;
  items: Array<{
    menuItemId: string;
    name: string;
    unitPrice: string;
    quantity: number;
    specialInstructions?: string;
    addOns?: Array<{ name: string; price: number }>;
  }>;
}

export const waiterService = {
  getMyTables: async (branchId: string): Promise<WaiterTableAssignment[]> => {
    const res = await baseApiFetch<WaiterTableAssignment[]>(`/waiter/tables?branchId=${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  assignTable: async (payload: { branchId: string; waiterId: string; tableId: string }): Promise<WaiterTableAssignment> => {
    const res = await baseApiFetch<WaiterTableAssignment>('/waiter/tables/assign', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  getPendingOrders: async (branchId: string): Promise<WaiterOrderSummary[]> => {
    const res = await baseApiFetch<WaiterOrderSummary[]>(`/waiter/orders/pending?branchId=${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getActiveOrders: async (branchId: string): Promise<WaiterOrderSummary[]> => {
    const res = await baseApiFetch<WaiterOrderSummary[]>(`/waiter/orders/active?branchId=${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getOrderDetail: async (orderId: string): Promise<WaiterOrderDetail> => {
    const res = await baseApiFetch<WaiterOrderDetail>(`/waiter/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  acceptOrder: async (orderId: string): Promise<{ message: string }> => {
    const res = await baseApiFetch<{ message: string }>(`/waiter/orders/${encodeURIComponent(orderId)}/accept`, {
      method: 'POST',
    });
    return (res as any)?.data || res;
  },

  rejectOrder: async (payload: RejectOrderPayload): Promise<{ message: string }> => {
    const res = await baseApiFetch<{ message: string }>(`/waiter/orders/${encodeURIComponent(payload.orderId)}/reject`, {
      method: 'POST',
      body: JSON.stringify({
        reason: payload.reason,
        reasonCode: payload.reasonCode || 'OTHER',
      }),
    });
    return (res as any)?.data || res;
  },

  serveOrder: async (orderId: string): Promise<{ message: string }> => {
    const res = await baseApiFetch<{ message: string }>(`/waiter/orders/${encodeURIComponent(orderId)}/serve`, {
      method: 'POST',
    });
    return (res as any)?.data || res;
  },

  createOrderOnBehalf: async (payload: CreateOrderOnBehalfPayload): Promise<any> => {
    const res = await baseApiFetch<any>('/waiter/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  getMyAlerts: async (branchId: string): Promise<CustomerAlert[]> => {
    const res = await baseApiFetch<CustomerAlert[]>(`/waiter/alerts?branchId=${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  ackAlert: async (alertId: string): Promise<{ message: string }> => {
    const res = await baseApiFetch<{ message: string }>(`/waiter/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
      method: 'PATCH',
    });
    return (res as any)?.data || res;
  },

  getAllTables: async (branchId: string): Promise<any[]> => {
    const res = await baseApiFetch<any[]>(`/tables?branchId=${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getMenuItems: async (branchId: string): Promise<any[]> => {
    const res = await baseApiFetch<any[]>(`/menus/${encodeURIComponent(branchId)}/items`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },
};

export const fetchWaiterTables = createAsyncThunk<WaiterTableAssignment[], string, { rejectValue: string }>(
  'waiter/fetchTables',
  async (branchId, { rejectWithValue }) => {
    try {
      return await waiterService.getMyTables(branchId);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch assigned tables');
    }
  }
);

export const fetchPendingOrders = createAsyncThunk<WaiterOrderSummary[], string, { rejectValue: string }>(
  'waiter/fetchPendingOrders',
  async (branchId, { rejectWithValue }) => {
    try {
      return await waiterService.getPendingOrders(branchId);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch pending orders');
    }
  }
);

export const fetchActiveOrders = createAsyncThunk<WaiterOrderSummary[], string, { rejectValue: string }>(
  'waiter/fetchActiveOrders',
  async (branchId, { rejectWithValue }) => {
    try {
      return await waiterService.getActiveOrders(branchId);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch active orders');
    }
  }
);

export const fetchWaiterAlerts = createAsyncThunk<CustomerAlert[], string, { rejectValue: string }>(
  'waiter/fetchAlerts',
  async (branchId, { rejectWithValue }) => {
    try {
      return await waiterService.getMyAlerts(branchId);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch alerts');
    }
  }
);
