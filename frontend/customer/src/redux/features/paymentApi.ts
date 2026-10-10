import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch } from '../api/baseApi';

export interface PaymentOptionsResponse {
  methods: Array<{ id: string; label: string; icon: string }>;
}

export interface CreatePaymentPayload {
  orderId?: string;
  tableSessionId?: string;
  payerGuestSessionId?: string;
  paidForGuestIds?: string[];
  scope: 'FULL_ORDER' | 'ORDER_ITEMS' | 'SPLIT_EQUAL';
  amount: number;
  tipAmount?: number;
  method: 'CASH' | 'CARD' | 'MOBILE_WALLET' | 'ONLINE_GATEWAY';
  discountCode?: string;
  transactionRef?: string;
}

export interface PaymentAllocationItem {
  orderId?: string;
  orderItemId?: string;
  guestSessionId?: string;
  amount: number;
}

export interface CreateSplitPaymentPayload {
  orderId?: string;
  tableSessionId?: string;
  payerGuestSessionId?: string;
  tipAmount?: number;
  method: 'CASH' | 'CARD' | 'MOBILE_WALLET' | 'ONLINE_GATEWAY';
  allocations: PaymentAllocationItem[];
  transactionRef?: string;
}

export interface PaymentResponse {
  id: string;
  orderId: string | null;
  tableSessionId: string | null;
  scope: string;
  amount: number;
  tipAmount: number;
  method: string;
  status: string;
  transactionRef: string;
  paidAt: string;
}

export interface CreateAlertPayload {
  branchId: string;
  tableId: string;
  tableSessionId: string;
  type: 'call_waiter' | 'request_bill' | 'need_help' | 'custom';
  message?: string;
}

export interface StripePaymentIntentPayload {
  orderId?: string;
  tableSessionId?: string;
  payerGuestSessionId?: string;
  tipAmount?: number;
  discountCode?: string;
}

export interface StripePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  publishableKey: string;
  orderId?: string | null;
  tableSessionId?: string | null;
}

export interface RequestOfflinePaymentPayload {
  orderId?: string;
  tableSessionId?: string;
  payerGuestSessionId?: string;
  method: 'CASH' | 'CARD';
  tipAmount?: number;
  discountCode?: string;
}

export const paymentService = {
  getPaymentOptions: async (branchId?: string): Promise<PaymentOptionsResponse> => {
    const url = branchId ? `/payments/options?branchId=${encodeURIComponent(branchId)}` : '/payments/options';
    const res = await baseApiFetch<PaymentOptionsResponse>(url, { method: 'GET' });
    return (res as any)?.data || res;
  },

  createPayment: async (payload: CreatePaymentPayload): Promise<PaymentResponse> => {
    const res = await baseApiFetch<PaymentResponse>('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  createSplitPayment: async (payload: CreateSplitPaymentPayload): Promise<{ payment: PaymentResponse; allocations: any[] }> => {
    const res = await baseApiFetch<{ payment: PaymentResponse; allocations: any[] }>('/payments/split', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  createStripePaymentIntent: async (payload: StripePaymentIntentPayload): Promise<StripePaymentIntentResponse> => {
    const res = await baseApiFetch<StripePaymentIntentResponse>('/payments/stripe/create-intent', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  verifyStripePayment: async (paymentIntentId: string): Promise<PaymentResponse> => {
    const res = await baseApiFetch<PaymentResponse>('/payments/stripe/verify', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
    return (res as any)?.data || res;
  },

  requestOfflinePayment: async (payload: RequestOfflinePaymentPayload): Promise<PaymentResponse> => {
    const res = await baseApiFetch<PaymentResponse>('/payments/request-offline', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  validateDiscount: async (code: string, subtotal: number): Promise<{ discountAmount: number; netTotal: number }> => {
    const res = await baseApiFetch<{ discountAmount: number; netTotal: number }>('/payments/discounts/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
    return (res as any)?.data || res;
  },

  requestWaiterAlert: async (payload: CreateAlertPayload): Promise<any> => {
    const res = await baseApiFetch<any>('/waiter/alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },
};

export const processPaymentThunk = createAsyncThunk<PaymentResponse, CreatePaymentPayload, { rejectValue: string }>(
  'payments/processPayment',
  async (payload, { rejectWithValue }) => {
    try {
      return await paymentService.createPayment(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Payment processing failed');
    }
  }
);
