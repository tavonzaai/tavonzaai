import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch, getCookie, getAuthToken } from '../api/baseApi';

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

  return null;
}

export interface CartItemDto {
  id: string;
  orderId?: string;
  menuItemId: string;
  name: string;
  imageUrl?: string | null;
  basePrice?: number;
  unitPrice: number;
  quantity: number;
  specialInstructions?: string | null;
  modifierIds?: string[];
  modifiers?: Array<{ id: string; name: string; price: number }>;
  addOns?: Array<{ name: string; price: number }>;
  addOnsTotal?: number;
  lineTotal: number;
  available?: boolean;
  issue?: string | null;
}

export interface CartResponse {
  id: string;
  /** @deprecated DRAFT-order carts are gone; kept for transitional UI reads. */
  orderId?: string;
  orderNumber?: string;
  branchId: string | null;
  tableId?: string;
  status?: string;
  subtotal: number;
  serviceChargeRate?: number;
  serviceCharge: number;
  taxRate?: number;
  tax?: number;
  taxAmount?: number;
  total?: number;
  totalAmount?: number;
  itemCount?: number;
  canCheckout?: boolean;
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
  amountPaid?: number;
  isFullyPaid?: boolean;
  tableSessionId?: string | null;
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
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
  modifierIds?: string[];
  branchId?: string;
  /** @deprecated ignored — cart ownership comes from the JWT */
  orderId?: string;
  addOns?: Array<{ name: string; price: number }>;
}

export interface UpdateCartItemPayload {
  itemId: string;
  quantity?: number;
  specialInstructions?: string;
  /** @deprecated ignored */
  orderId?: string;
}

export interface RemoveCartItemPayload {
  itemId: string;
  /** @deprecated ignored */
  orderId?: string;
}

function unwrapCart(res: any): CartResponse {
  const data = res?.data || res;
  return {
    ...data,
    taxAmount: data.taxAmount ?? data.tax ?? 0,
    totalAmount: data.totalAmount ?? data.total ?? 0,
    items: (data.items || []).map((item: any) => ({
      ...item,
      addOns: item.modifiers?.map((m: any) => ({ name: m.name, price: m.price })) ?? item.addOns ?? [],
    })),
  };
}

function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `ord_${crypto.randomUUID().replace(/-/g, '')}`;
  }
  return `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

interface MyOrdersCacheEntry {
  data: OrderListResponse[];
  timestamp: number;
}

const myOrdersCache = new Map<string, MyOrdersCacheEntry>();
const myOrdersInFlight = new Map<string, Promise<OrderListResponse[]>>();
const MY_ORDERS_CACHE_TTL_MS = 15000; // 15 seconds in-memory deduplication cache

let cartCache: { data: CartResponse; timestamp: number } | null = null;
let cartInFlight: Promise<CartResponse> | null = null;
const CART_CACHE_TTL_MS = 4000; // 4 seconds in-memory cache for rapid renders

const trackOrderCache = new Map<string, { data: OrderTrackingResponse; timestamp: number }>();
const trackOrderInFlight = new Map<string, Promise<OrderTrackingResponse>>();

const orderDetailCache = new Map<string, { data: OrderDetailResponse; timestamp: number }>();
const orderDetailInFlight = new Map<string, Promise<OrderDetailResponse>>();
const ORDER_DETAIL_TTL_MS = 8000; // 8 seconds

export function clearCartCache(): void {
  cartCache = null;
  cartInFlight = null;
}

export function clearMyOrdersCache(): void {
  myOrdersCache.clear();
  myOrdersInFlight.clear();
}

export function clearTrackOrderCache(): void {
  trackOrderCache.clear();
  trackOrderInFlight.clear();
  orderDetailCache.clear();
  orderDetailInFlight.clear();
}

if (typeof window !== 'undefined') {
  window.addEventListener('tavonza:order_status_changed', () => {
    clearMyOrdersCache();
    clearTrackOrderCache();
  });
  window.addEventListener('tavonza:order_created', () => {
    clearMyOrdersCache();
    clearTrackOrderCache();
    clearCartCache();
  });
  window.addEventListener('tavonza:order_item_changed', () => {
    clearMyOrdersCache();
    clearTrackOrderCache();
    clearCartCache();
  });
  window.addEventListener('tavonza:payment_status_changed', () => {
    clearMyOrdersCache();
    clearTrackOrderCache();
  });
}

export const orderService = {
  /** GET /cart — server-side cart for the authenticated diner (deduplicated). */
  getCart: async (_branchId?: string, _tableId?: string): Promise<CartResponse> => {
    if (cartCache && Date.now() - cartCache.timestamp < CART_CACHE_TTL_MS) {
      return cartCache.data;
    }
    if (cartInFlight) {
      return cartInFlight;
    }
    const reqPromise = (async () => {
      try {
        const res = await baseApiFetch<CartResponse>('/cart', { method: 'GET' });
        const unwrapped = unwrapCart(res);
        cartCache = { data: unwrapped, timestamp: Date.now() };
        return unwrapped;
      } finally {
        cartInFlight = null;
      }
    })();
    cartInFlight = reqPromise;
    return reqPromise;
  },

  getCartFromSession: async (_branchId?: string, _tableId?: string): Promise<CartResponse> => {
    return orderService.getCart();
  },

  // GET /orders/me (with in-flight request deduplication and short TTL cache)
  getMyOrders: async (
    filters?: {
      branchId?: string;
      tableId?: string;
      status?: string;
      search?: string;
    },
    options?: { forceRefresh?: boolean }
  ): Promise<OrderListResponse[]> => {
    // /orders/me requires an authenticated customer account or active guest session.
    // If diner is unauthenticated, return [] immediately without sending an unauthorized/forbidden HTTP request.
    const token = getAuthToken();
    if (!token) {
      return [];
    }

    const params = new URLSearchParams();
    if (filters?.branchId) params.append('branchId', filters.branchId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const cacheKey = queryString || '__all__';

    // 1. Check TTL cache if not forcing refresh
    if (!options?.forceRefresh) {
      const cached = myOrdersCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < MY_ORDERS_CACHE_TTL_MS) {
        return cached.data;
      }

      // 2. Reuse active in-flight request to prevent parallel duplicate calls
      const inFlight = myOrdersInFlight.get(cacheKey);
      if (inFlight) {
        return inFlight;
      }
    }

    // 3. Initiate request with in-flight deduplication
    const reqPromise = (async () => {
      try {
        const res = await baseApiFetch<OrderListResponse[]>(`/orders/me${queryString}`, {
          method: 'GET',
          skipToast: true,
        });
        const data = (res as any)?.data || res;
        const list = Array.isArray(data) ? data : [];
        myOrdersCache.set(cacheKey, { data: list, timestamp: Date.now() });
        return list;
      } catch (err: any) {
        // If 403 Forbidden or 401 Unauthorized, safely return empty orders without throwing
        const fallback = myOrdersCache.get(cacheKey);
        if (fallback) return fallback.data;
        return [];
      } finally {
        myOrdersInFlight.delete(cacheKey);
      }
    })();

    myOrdersInFlight.set(cacheKey, reqPromise);
    return reqPromise;
  },

  // POST /cart/items
  addItem: async (payload: AddItemToCartPayload): Promise<CartResponse> => {
    clearCartCache();
    const body = {
      menuItemId: payload.menuItemId,
      quantity: payload.quantity,
      specialInstructions: payload.specialInstructions,
      modifierIds: payload.modifierIds,
      branchId: payload.branchId,
    };
    const res = await baseApiFetch<CartResponse>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return unwrapCart(res);
  },

  // PATCH /cart/items/:itemId
  updateItem: async (payload: UpdateCartItemPayload): Promise<CartResponse> => {
    clearCartCache();
    const itemId = (payload.itemId || '').trim();
    if (!itemId) throw new Error('itemId is required to update cart item');
    const res = await baseApiFetch<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        quantity: payload.quantity,
        specialInstructions: payload.specialInstructions,
      }),
    });
    return unwrapCart(res);
  },

  // DELETE /cart/items/:itemId
  removeItem: async (payload: RemoveCartItemPayload): Promise<CartResponse> => {
    clearCartCache();
    const itemId = (payload.itemId || '').trim();
    if (!itemId) throw new Error('itemId is required to remove cart item');
    const res = await baseApiFetch<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    });
    return unwrapCart(res);
  },

  clearCart: async (): Promise<CartResponse> => {
    clearCartCache();
    const res = await baseApiFetch<CartResponse>('/cart', { method: 'DELETE' });
    return unwrapCart(res);
  },

  /**
   * POST /orders — place order from the server cart.
   * Cart is cleared by the API only after the order persists.
   */
  placeOrder: async (options?: {
    qrToken?: string;
    idempotencyKey?: string;
  }): Promise<OrderTrackingResponse> => {
    clearCartCache();
    clearMyOrdersCache();
    clearTrackOrderCache();
    const key = options?.idempotencyKey || newIdempotencyKey();
    const res = await baseApiFetch<OrderTrackingResponse>('/orders', {
      method: 'POST',
      headers: { 'Idempotency-Key': key },
      body: JSON.stringify({ qrToken: options?.qrToken }),
    });
    return (res as any)?.data || res;
  },

  /** @deprecated use placeOrder — DRAFT-order submit was removed. */
  submitOrder: async (_orderId?: string): Promise<OrderTrackingResponse> => {
    const { getCookie } = await import('../api/baseApi');
    const qrToken = getCookie('tavonza_qr_token') || undefined;
    return orderService.placeOrder({ qrToken });
  },

  // GET /orders/:orderId/track (with deduplication & TTL cache)
  trackOrder: async (orderId: string, options?: { forceRefresh?: boolean }): Promise<OrderTrackingResponse> => {
    const cleanId = (orderId || '').trim();
    if (!cleanId) throw new Error('orderId is required to track order');

    if (!options?.forceRefresh) {
      const cached = trackOrderCache.get(cleanId);
      if (cached && Date.now() - cached.timestamp < ORDER_DETAIL_TTL_MS) {
        return cached.data;
      }
      const inFlight = trackOrderInFlight.get(cleanId);
      if (inFlight) {
        return inFlight;
      }
    }

    const reqPromise = (async () => {
      try {
        const res = await baseApiFetch<OrderTrackingResponse>(`/orders/${encodeURIComponent(cleanId)}/track`, {
          method: 'GET',
        });
        const data = (res as any)?.data || res;
        trackOrderCache.set(cleanId, { data, timestamp: Date.now() });
        return data;
      } finally {
        trackOrderInFlight.delete(cleanId);
      }
    })();

    trackOrderInFlight.set(cleanId, reqPromise);
    return reqPromise;
  },

  // GET /orders/:orderId (with deduplication & TTL cache)
  getOrderDetail: async (orderId: string, options?: { forceRefresh?: boolean }): Promise<OrderDetailResponse> => {
    const cleanId = (orderId || '').trim();
    if (!cleanId) throw new Error('orderId is required to get order detail');

    if (!options?.forceRefresh) {
      const cached = orderDetailCache.get(cleanId);
      if (cached && Date.now() - cached.timestamp < ORDER_DETAIL_TTL_MS) {
        return cached.data;
      }
      const inFlight = orderDetailInFlight.get(cleanId);
      if (inFlight) {
        return inFlight;
      }
    }

    const reqPromise = (async () => {
      try {
        const res = await baseApiFetch<OrderDetailResponse>(`/orders/${encodeURIComponent(cleanId)}`, {
          method: 'GET',
        });
        const data = (res as any)?.data || res;
        orderDetailCache.set(cleanId, { data, timestamp: Date.now() });
        return data;
      } finally {
        orderDetailInFlight.delete(cleanId);
      }
    })();

    orderDetailInFlight.set(cleanId, reqPromise);
    return reqPromise;
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

  /**
   * GET /analytics/customer-dashboard
   * Customer order and dining statistics snapshot.
   */
  getCustomerDashboard: async (): Promise<any> => {
    const res = await baseApiFetch<any>('/analytics/customer-dashboard', {
      method: 'GET',
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
    const orders = await orderService.getMyOrders({ branchId });
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


