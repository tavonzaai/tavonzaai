import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch } from '../api/baseApi';

export interface CartItemDto {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  specialInstructions?: string | null;
  addOns?: Array<{ name: string; price: number }>;
  lineTotal: number;
}

export interface CartResponse {
  id: string;
  orderNumber: string;
  branchId: string;
  tableId: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  items: CartItemDto[];
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
  quantity: number;
  specialInstructions?: string;
}

export interface RemoveCartItemPayload {
  orderId: string;
  itemId: string;
}

export interface OrderTrackingResponse {
  id: string;
  orderNumber: string;
  status: string;
  acceptanceMode?: string;
  items: CartItemDto[];
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  paymentStatus: string;
  placedAt: string;
  estimatedMinutes?: number;
}

export const orderService = {
  getCart: async (branchId: string, tableId: string): Promise<CartResponse> => {
    const res = await baseApiFetch<CartResponse>(`/orders/cart/${encodeURIComponent(branchId)}/${encodeURIComponent(tableId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  addItem: async (payload: AddItemToCartPayload): Promise<CartResponse> => {
    const { orderId, ...body } = payload;
    const res = await baseApiFetch<CartResponse>(`/orders/cart/${encodeURIComponent(orderId)}/items`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return (res as any)?.data || res;
  },

  updateItem: async (payload: UpdateCartItemPayload): Promise<CartResponse> => {
    const { orderId, itemId, ...body } = payload;
    const res = await baseApiFetch<CartResponse>(`/orders/cart/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return (res as any)?.data || res;
  },

  removeItem: async (payload: RemoveCartItemPayload): Promise<CartResponse> => {
    const res = await baseApiFetch<CartResponse>(`/orders/cart/${encodeURIComponent(payload.orderId)}/items/${encodeURIComponent(payload.itemId)}`, {
      method: 'DELETE',
    });
    return (res as any)?.data || res;
  },

  submitOrder: async (orderId: string): Promise<OrderTrackingResponse> => {
    const res = await baseApiFetch<OrderTrackingResponse>(`/orders/${encodeURIComponent(orderId)}/submit`, {
      method: 'POST',
    });
    return (res as any)?.data || res;
  },

  trackOrder: async (orderId: string): Promise<OrderTrackingResponse> => {
    const res = await baseApiFetch<OrderTrackingResponse>(`/orders/${encodeURIComponent(orderId)}/track`, {
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
