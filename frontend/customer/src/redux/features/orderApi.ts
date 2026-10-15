import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch, getCookie } from '../api/baseApi';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUUID(val?: string | null): boolean {
  return Boolean(val && UUID_REGEX.test(String(val).trim()));
}

export async function fetchBranchMenuCatalog(branchId: string): Promise<any[]> {
  try {
    const res = await baseApiFetch<any[]>(`/menus/${encodeURIComponent(branchId)}/items`, {
      method: 'GET',
    });
    const data = (res as any)?.data || res;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Failed to fetch menu catalog for branch:', branchId, err);
    return [];
  }
}

export function resolveCatalogMenuItemId(
  item: { id?: string; dishId?: string; name?: string },
  catalogItems: any[]
): string | null {
  if (!catalogItems || catalogItems.length === 0) {
    if (item.dishId && isUUID(item.dishId)) return item.dishId;
    if (item.id && isUUID(item.id)) return item.id;
    return null;
  }

  // 1. Direct ID match in active backend catalog
  const direct = catalogItems.find((c: any) => c.id === item.dishId || c.id === item.id);
  if (direct) return direct.id;

  // 2. Exact or case-insensitive name match
  if (item.name) {
    const cleanName = String(item.name).trim().toLowerCase();
    const byName = catalogItems.find(
      (c: any) => String(c.name || '').trim().toLowerCase() === cleanName
    );
    if (byName) return byName.id;

    // 3. Substring / partial name match
    const partial = catalogItems.find((c: any) => {
      const cName = String(c.name || '').trim().toLowerCase();
      return cName && (cName.includes(cleanName) || cleanName.includes(cName));
    });
    if (partial) return partial.id;
  }

  // 4. If item already has a valid UUID that exists in database
  if (item.dishId && isUUID(item.dishId) && catalogItems.some((c: any) => c.id === item.dishId)) {
    return item.dishId;
  }
  if (item.id && isUUID(item.id) && catalogItems.some((c: any) => c.id === item.id)) {
    return item.id;
  }

  // 5. Fallback to first available catalog item (which is guaranteed to exist in PostgreSQL)
  return catalogItems[0]?.id || null;
}

export interface CartItemDto {
  id: string;
  orderId?: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  specialInstructions?: string | null;
  addOns?: Array<{ name: string; price: number }>;
  addOnsTotal?: number;
  lineTotal: number;
}

export interface CartResponse {
  id: string;
  orderId: string;
  orderNumber: string;
  branchId: string;
  tableId: string;
  status: string;
  subtotal: number;
  serviceChargeRate?: number;
  serviceCharge: number;
  taxRate?: number;
  tax?: number;
  taxAmount: number;
  total?: number;
  totalAmount: number;
  itemCount?: number;
  items: CartItemDto[];
}

export interface OrderTimelineStep {
  step: string;
  completed: boolean;
  active: boolean;
}

export interface OrderTrackingResponse {
  id: string;
  orderId: string;
  orderNumber: string;
  branchId: string;
  tableId: string;
  status: string;
  displayStatus: string;
  estimatedPrepTime?: number | null;
  timeline?: OrderTimelineStep[];
  items: CartItemDto[];
  subtotal?: number;
  taxAmount?: number;
  serviceCharge?: number;
  total?: number;
  totalAmount: number;
  paymentStatus?: string;
  placedAt?: string;
  submittedAt?: string | Date | null;
  acceptedAt?: string | Date | null;
  readyAt?: string | Date | null;
  servedAt?: string | Date | null;
}

export interface OrderListResponse {
  id: string;
  orderId: string;
  orderNumber: string;
  tableId: string;
  status: string;
  displayStatus: string;
  itemCount: number;
  total: number;
  totalAmount: number;
  estimatedPrepTime?: number | null;
  items: CartItemDto[];
  orderType?: string;
  createdAt: string | Date;
  submittedAt?: string | Date | null;
}

export interface OrderDetailResponse {
  orderId: string;
  orderNumber: string;
  branchId: string;
  tableId: string;
  status: string;
  displayStatus: string;
  items: CartItemDto[];
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
  estimatedPrepTime?: number | null;
  isEditable?: boolean;
  isTerminal?: boolean;
  createdAt: string | Date;
  submittedAt?: string | Date | null;
  acceptedAt?: string | Date | null;
  readyAt?: string | Date | null;
  servedAt?: string | Date | null;
}

export interface AddItemToCartPayload {
  orderId: string;
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
  addOns?: Array<{ name: string; price: number }>;
}

export interface UpdateCartItemPayload {
  orderId: string;
  itemId: string;
  quantity?: number;
  specialInstructions?: string;
}

export interface RemoveCartItemPayload {
  orderId: string;
  itemId: string;
}

export const orderService = {
  // GET /orders/cart?branchId=...&tableId=...
  getCartFromSession: async (branchId?: string, tableId?: string): Promise<CartResponse> => {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId);
    if (tableId) params.append('tableId', tableId);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await baseApiFetch<CartResponse>(`/orders/cart${queryString}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  // GET /orders/cart/:branchId/:tableId (with fallback to GET /orders/cart)
  getCart: async (branchId: string, tableId: string): Promise<CartResponse> => {
    try {
      const res = await baseApiFetch<CartResponse>(
        `/orders/cart/${encodeURIComponent(branchId)}/${encodeURIComponent(tableId)}`,
        { method: 'GET' }
      );
      return (res as any)?.data || res;
    } catch {
      return await orderService.getCartFromSession(branchId, tableId);
    }
  },

  // GET /orders/me
  getMyOrders: async (filters?: {
    branchId?: string;
    tableId?: string;
    status?: string;
    search?: string;
  }): Promise<OrderListResponse[]> => {
    const params = new URLSearchParams();
    if (filters?.branchId) params.append('branchId', filters.branchId);
    if (filters?.tableId) params.append('tableId', filters.tableId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await baseApiFetch<OrderListResponse[]>(`/orders/me${queryString}`, {
      method: 'GET',
    });
    const data = (res as any)?.data || res;
    return Array.isArray(data) ? data : [];
  },

  // POST /orders/cart/:orderId/items
  addItem: async (payload: AddItemToCartPayload): Promise<CartResponse> => {
    const orderId = (payload.orderId || '').trim();
    if (!orderId) throw new Error('orderId is required to add items to cart');
    const { orderId: _, ...body } = payload;
    const res = await baseApiFetch<CartResponse>(`/orders/cart/${encodeURIComponent(orderId)}/items`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return (res as any)?.data || res;
  },

  // PATCH /orders/cart/:orderId/items/:itemId
  updateItem: async (payload: UpdateCartItemPayload): Promise<CartResponse> => {
    const orderId = (payload.orderId || '').trim();
    const itemId = (payload.itemId || '').trim();
    if (!orderId || !itemId) throw new Error('orderId and itemId are required to update cart item');
    const { orderId: _, itemId: __, ...body } = payload;
    const res = await baseApiFetch<CartResponse>(
      `/orders/cart/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    );
    return (res as any)?.data || res;
  },

  // DELETE /orders/cart/:orderId/items/:itemId
  removeItem: async (payload: RemoveCartItemPayload): Promise<CartResponse> => {
    const orderId = (payload.orderId || '').trim();
    const itemId = (payload.itemId || '').trim();
    if (!orderId || !itemId) throw new Error('orderId and itemId are required to remove cart item');
    const res = await baseApiFetch<CartResponse>(
      `/orders/cart/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}`,
      { method: 'DELETE' }
    );
    return (res as any)?.data || res;
  },

  // POST /orders/:orderId/submit
  submitOrder: async (orderId: string): Promise<OrderTrackingResponse> => {
    const cleanId = (orderId || '').trim();
    if (!cleanId) throw new Error('orderId is required to submit order');
    const res = await baseApiFetch<OrderTrackingResponse>(`/orders/${encodeURIComponent(cleanId)}/submit`, {
      method: 'POST',
    });
    return (res as any)?.data || res;
  },

  // GET /orders/:orderId/track
  trackOrder: async (orderId: string): Promise<OrderTrackingResponse> => {
    const cleanId = (orderId || '').trim();
    if (!cleanId) throw new Error('orderId is required to track order');
    const res = await baseApiFetch<OrderTrackingResponse>(`/orders/${encodeURIComponent(cleanId)}/track`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  // GET /orders/:orderId
  getOrderDetail: async (orderId: string): Promise<OrderDetailResponse> => {
    const cleanId = (orderId || '').trim();
    if (!cleanId) throw new Error('orderId is required to get order detail');
    const res = await baseApiFetch<OrderDetailResponse>(`/orders/${encodeURIComponent(cleanId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  // GET /orders/branch/:branchId
  getOrdersByBranch: async (
    branchId: string,
    filters?: { status?: string; tableId?: string; search?: string }
  ): Promise<OrderListResponse[]> => {
    const cleanBranchId = (branchId || '').trim();
    if (!cleanBranchId) return [];
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.tableId) params.append('tableId', filters.tableId);
    if (filters?.search) params.append('search', filters.search);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await baseApiFetch<OrderListResponse[]>(
      `/orders/branch/${encodeURIComponent(cleanBranchId)}${queryString}`,
      { method: 'GET' }
    );
    const data = (res as any)?.data || res;
    return Array.isArray(data) ? data : [];
  },

  // PATCH /orders/:orderId/status
  updateOrderStatus: async (orderId: string, status: string): Promise<OrderDetailResponse> => {
    const cleanId = (orderId || '').trim();
    if (!cleanId) throw new Error('orderId is required to update order status');
    const res = await baseApiFetch<OrderDetailResponse>(`/orders/${encodeURIComponent(cleanId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return (res as any)?.data || res;
  },
};

export const fetchActiveCart = createAsyncThunk<CartResponse, { branchId: string; tableId: string }, { rejectValue: string }>(
  'orders/fetchActiveCart',
  async ({ branchId, tableId }, { rejectWithValue }) => {
    try {
      return await orderService.getCart(branchId, tableId);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch cart');
    }
  }
);

export const submitActiveOrder = createAsyncThunk<OrderTrackingResponse, string, { rejectValue: string }>(
  'orders/submitActiveOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      return await orderService.submitOrder(orderId);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to submit order');
    }
  }
);

export async function getActiveCustomerOrder(
  branchId?: string,
  tableId?: string
): Promise<OrderListResponse | null> {
  try {
    const orders = await orderService.getMyOrders({ branchId, tableId });
    const active = orders.find((o) =>
      ['SUBMITTED', 'ACCEPTED', 'CONFIRMED', 'IN_PREPARATION', 'PREPARING', 'READY'].includes(
        (o.status || '').toUpperCase()
      )
    );
    if (active) return active;

    // Check last submitted order ID from session cookie or params
    const lastId = getCookie('tavonza_last_submitted_order_id') || getCookie('tavonza_active_order_id');
    if (lastId && isUUID(lastId)) {
      const tracked = await orderService.trackOrder(lastId);
        if (
          tracked &&
          ['SUBMITTED', 'ACCEPTED', 'CONFIRMED', 'IN_PREPARATION', 'PREPARING', 'READY'].includes(
            (tracked.status || '').toUpperCase()
          )
        ) {
          return {
            id: tracked.id || tracked.orderId,
            orderId: tracked.orderId || tracked.id,
            orderNumber: tracked.orderNumber,
            tableId: tracked.tableId,
            status: tracked.status,
            displayStatus: tracked.displayStatus,
            itemCount: tracked.items?.length || 0,
            total: tracked.totalAmount || tracked.total || 0,
            totalAmount: tracked.totalAmount || tracked.total || 0,
            estimatedPrepTime: tracked.estimatedPrepTime,
            items: tracked.items || [],
            createdAt: (tracked as any).submittedAt || new Date().toISOString(),
          };
        }
      }
    return null;
  } catch {
    return null;
  }
}


