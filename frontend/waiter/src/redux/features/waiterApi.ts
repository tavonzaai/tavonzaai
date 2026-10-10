import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch } from '../api/baseApi';

export const isUUID = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));

export function getActiveBranchId(): string {
  if (typeof window !== 'undefined') {
    try {
      // 1. Direct branch cookies
      const match = document.cookie.match(/(?:^|;\s*)(?:active_branch_id|tavonza_branch_id|waiter_branch_id|branch_id)=([^;]+)/);
      if (match && match[1]) {
        const val = decodeURIComponent(match[1]);
        if (isUUID(val)) return val;
      }

      // 2. User cookies (waiter_user, tavonza_user, user)
      const userCookieMatch = document.cookie.match(/(?:^|;\s*)(?:waiter_user|tavonza_user|user)=([^;]+)/);
      if (userCookieMatch && userCookieMatch[1]) {
        try {
          const parsed = JSON.parse(decodeURIComponent(userCookieMatch[1]));
          if (isUUID(parsed?.branchId)) return parsed.branchId;
          if (isUUID(parsed?.assignments?.[0]?.branchId)) return parsed.assignments[0].branchId;
          if (isUUID(parsed?.assignments?.[0]?.branch?.id)) return parsed.assignments[0].branch.id;
        } catch {}
      }

      // 3. localStorage keys
      for (const key of ['waiter_user', 'tavonza_user', 'user']) {
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
  tableNumber?: string;
  tableLabel?: string;
  tableId: string;
  itemsCount?: number;
  itemCount?: number;
  totalAmount?: number;
  total?: number;
  paymentStatus?: string;
  waiterName?: string;
  status: string;
  placedAt?: string;
  createdAt?: string;
  submittedAt?: string | Date;
  acceptedAt?: string | Date | null;
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
  getMyTables: async (branchId?: string): Promise<WaiterTableAssignment[]> => {
    const resolvedBranchId = (branchId && isUUID(branchId)) ? branchId : getActiveBranchId();
    const query = resolvedBranchId && isUUID(resolvedBranchId) ? `?branchId=${encodeURIComponent(resolvedBranchId)}` : '';
    const res = await baseApiFetch<WaiterTableAssignment[]>(`/waiter/tables${query}`, {
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

  queryOrders: async (params: {
    branchId?: string;
    scope?: 'MY_TABLES' | 'ALL_TABLES';
    status?: string;
    tableId?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<WaiterOrderSummary[]> => {
    const q = new URLSearchParams();
    const resolvedBranchId = (params.branchId && isUUID(params.branchId)) ? params.branchId : getActiveBranchId();
    if (resolvedBranchId && isUUID(resolvedBranchId)) q.append('branchId', resolvedBranchId);
    if (params.scope) q.append('scope', params.scope);
    if (params.status) q.append('status', params.status);
    if (params.tableId && params.tableId.trim() && params.tableId !== 'T-01') {
      q.append('tableId', params.tableId.trim());
    }
    if (params.search) q.append('search', params.search);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit));

    const qs = q.toString();
    const res = await baseApiFetch<any[]>(`/waiter/orders${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });

    const data = (res as any)?.data || res;
    if (Array.isArray(data)) {
      return data.map((o: any) => ({
        id: o.id || o.orderId,
        orderId: o.id || o.orderId,
        orderNumber: o.orderNumber || `#${(o.id || o.orderId).slice(0, 5)}`,
        tableId: o.tableId,
        tableNumber: o.tableNumber || o.tableLabel || 'Table',
        tableLabel: o.tableNumber || o.tableLabel || 'Table',
        status: o.status,
        displayStatus: o.displayStatus || o.status,
        itemsCount: o.itemsCount || o.itemCount || (o.items?.length ?? 1),
        totalAmount: Number(o.totalAmount ?? o.total ?? 0),
        total: Number(o.total ?? o.totalAmount ?? 0),
        paymentStatus: o.paymentStatus || 'PENDING',
        waiterName: o.waiterName || 'Staff',
        items: o.items || [],
        placedAt: o.placedAt || o.submittedAt || o.createdAt || new Date().toISOString(),
        createdAt: o.createdAt,
        submittedAt: o.submittedAt,
        guestName: o.guestName,
        specialInstructions: o.specialInstructions,
      }));
    }
    return [];
  },

  getPendingOrders: async (branchId: string): Promise<WaiterOrderSummary[]> => {
    try {
      const res = await baseApiFetch<any[]>(`/waiter/orders/pending?branchId=${encodeURIComponent(branchId)}`, {
        method: 'GET',
      });
      const data = (res as any)?.data || res;
      if (Array.isArray(data) && data.length > 0) {
        return data.map((o: any) => ({
          id: o.id || o.orderId,
          orderId: o.id || o.orderId,
          orderNumber: o.orderNumber || `#${(o.id || o.orderId).slice(0, 5)}`,
          tableId: o.tableId,
          tableNumber: o.tableNumber || o.tableLabel || 'Table',
          tableLabel: o.tableNumber || o.tableLabel || 'Table',
          status: o.status,
          displayStatus: o.displayStatus || 'Pending Acceptance',
          itemsCount: o.itemsCount || o.itemCount || (o.items?.length ?? 1),
          totalAmount: Number(o.totalAmount ?? o.total ?? 0),
          total: Number(o.total ?? o.totalAmount ?? 0),
          paymentStatus: o.paymentStatus || 'PENDING',
          placedAt: o.placedAt || o.submittedAt || o.createdAt || new Date().toISOString(),
          createdAt: o.createdAt,
          submittedAt: o.submittedAt,
        }));
      }
    } catch {
      // Fallback to general branch endpoint
    }

    try {
      const branchRes = await baseApiFetch<any[]>(`/orders/branch/${encodeURIComponent(branchId)}?status=SUBMITTED`, {
        method: 'GET',
      });
      const raw = (branchRes as any)?.data || branchRes;
      if (Array.isArray(raw)) {
        return raw.map((o: any) => ({
          id: o.id || o.orderId,
          orderId: o.orderId || o.id,
          orderNumber: o.orderNumber || `#${(o.orderId || o.id).slice(0, 5)}`,
          tableId: o.tableId,
          tableNumber: o.tableNumber || o.tableLabel || 'Table',
          tableLabel: o.tableLabel || 'Table',
          status: o.status,
          displayStatus: o.displayStatus || 'Pending Acceptance',
          itemsCount: o.itemsCount || o.itemCount || 1,
          totalAmount: Number(o.total || o.totalAmount || 0),
          total: Number(o.total || o.totalAmount || 0),
          paymentStatus: o.paymentStatus || 'PENDING',
          placedAt: o.placedAt || o.createdAt || new Date().toISOString(),
          createdAt: o.createdAt,
          submittedAt: o.submittedAt,
        }));
      }
    } catch {
      // empty
    }
    return [];
  },

  getActiveOrders: async (branchId: string): Promise<WaiterOrderSummary[]> => {
    try {
      const res = await baseApiFetch<any[]>(`/waiter/orders/active?branchId=${encodeURIComponent(branchId)}`, {
        method: 'GET',
      });
      const data = (res as any)?.data || res;
      if (Array.isArray(data) && data.length > 0) {
        return data.map((o: any) => ({
          id: o.id || o.orderId,
          orderId: o.id || o.orderId,
          orderNumber: o.orderNumber || `#${(o.id || o.orderId).slice(0, 5)}`,
          tableId: o.tableId,
          tableNumber: o.tableNumber || o.tableLabel || (o.tableId ? 'Table' : 'Takeaway'),
          tableLabel: o.tableNumber || o.tableLabel || (o.tableId ? 'Table' : 'Takeaway'),
          status: o.status,
          displayStatus: o.displayStatus || o.status,
          itemsCount: o.itemsCount || o.itemCount || (o.items?.length ?? 1),
          totalAmount: Number(o.totalAmount ?? o.total ?? 0),
          total: Number(o.total ?? o.totalAmount ?? 0),
          paymentStatus: o.paymentStatus || 'PENDING',
          waiterName: o.waiterName || 'Staff',
          items: o.items || [],
          placedAt: o.placedAt || o.submittedAt || o.createdAt || new Date().toISOString(),
          createdAt: o.createdAt,
          submittedAt: o.submittedAt,
        }));
      }
    } catch {
      // Fallback to general branch endpoint
    }

    try {
      const branchRes = await baseApiFetch<any[]>(`/orders/branch/${encodeURIComponent(branchId)}`, {
        method: 'GET',
      });
      const raw = (branchRes as any)?.data || branchRes;
      if (Array.isArray(raw)) {
        return raw.map((o: any) => ({
          id: o.id || o.orderId,
          orderId: o.orderId || o.id,
          orderNumber: o.orderNumber || `#${(o.orderId || o.id).slice(0, 5)}`,
          tableId: o.tableId,
          tableNumber: o.tableNumber || o.tableLabel || (o.tableId ? 'Table' : 'Takeaway'),
          tableLabel: o.tableLabel || (o.tableId ? 'Table' : 'Takeaway'),
          status: o.status,
          displayStatus: o.displayStatus || o.status,
          itemsCount: o.itemsCount || o.itemCount || (o.items?.length ?? 1),
          totalAmount: Number(o.total || o.totalAmount || 0),
          total: Number(o.total || o.totalAmount || 0),
          paymentStatus: o.paymentStatus || 'PENDING',
          waiterName: o.waiterName || 'Staff',
          items: o.items || [],
          placedAt: o.placedAt || o.createdAt || new Date().toISOString(),
          createdAt: o.createdAt,
          submittedAt: o.submittedAt,
        }));
      }
    } catch {
      // empty
    }
    return [];
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

  resolveAlert: async (alertId: string): Promise<{ message: string }> => {
    const res = await baseApiFetch<{ message: string }>(`/waiter/alerts/${encodeURIComponent(alertId)}/resolve`, {
      method: 'PATCH',
    });
    return (res as any)?.data || res;
  },

  createAlert: async (payload: {
    branchId: string;
    tableId: string;
    tableSessionId: string;
    type: string;
    message?: string;
  }): Promise<CustomerAlert> => {
    const res = await baseApiFetch<CustomerAlert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
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

  requestOfflinePayment: async (payload: {
    orderId: string;
    tableSessionId?: string;
    method: 'CASH' | 'CARD';
    notes?: string;
  }): Promise<{ success: boolean; paymentId: string; status: string; message: string }> => {
    const res = await baseApiFetch<{ success: boolean; paymentId: string; status: string; message: string }>('/payments/request-offline', {
      method: 'POST',
      body: JSON.stringify(payload),
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

export const acknowledgeAlertThunk = createAsyncThunk<{ message: string; alertId: string }, string, { rejectValue: string }>(
  'waiter/acknowledgeAlert',
  async (alertId, { rejectWithValue }) => {
    try {
      const res = await waiterService.ackAlert(alertId);
      return { message: res.message || 'Alert acknowledged', alertId };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to acknowledge alert');
    }
  }
);

export const resolveAlertThunk = createAsyncThunk<{ message: string; alertId: string }, string, { rejectValue: string }>(
  'waiter/resolveAlert',
  async (alertId, { rejectWithValue }) => {
    try {
      const res = await waiterService.resolveAlert(alertId);
      return { message: res.message || 'Alert resolved', alertId };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to resolve alert');
    }
  }
);
