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
  scope: 'ORDER' | 'FULL_ORDER' | 'ORDER_ITEMS' | 'SPLIT_EQUAL' | 'TABLE_SESSION' | 'GUEST_SESSION';
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
    const isUuid = (val?: string) =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val.trim());

    const cleanPayload: Record<string, any> = {
      amount: typeof payload.amount === 'number' ? Number(payload.amount.toFixed(2)) : payload.amount,
      method: payload.method,
      scope: payload.scope === 'FULL_ORDER' ? 'ORDER' : (payload.scope || 'ORDER'),
    };

    if (isUuid(payload.orderId)) cleanPayload.orderId = payload.orderId;
    if (isUuid(payload.tableSessionId)) cleanPayload.tableSessionId = payload.tableSessionId;
    if (isUuid(payload.payerGuestSessionId)) cleanPayload.payerGuestSessionId = payload.payerGuestSessionId;
    if (Array.isArray(payload.paidForGuestIds)) cleanPayload.paidForGuestIds = payload.paidForGuestIds.filter(isUuid);
    if (typeof payload.tipAmount === 'number' && payload.tipAmount > 0) cleanPayload.tipAmount = payload.tipAmount;
    if (payload.discountCode?.trim()) cleanPayload.discountCode = payload.discountCode.trim();

    const res = await baseApiFetch<PaymentResponse>('/payments', {
      method: 'POST',
      body: JSON.stringify(cleanPayload),
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
    const isUuid = (val?: string) =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val.trim());

    const cleanPayload: Record<string, any> = {};
    if (isUuid(payload.orderId)) cleanPayload.orderId = payload.orderId;
    if (isUuid(payload.tableSessionId)) cleanPayload.tableSessionId = payload.tableSessionId;
    if (isUuid(payload.payerGuestSessionId)) cleanPayload.payerGuestSessionId = payload.payerGuestSessionId;
    if (typeof payload.tipAmount === 'number' && payload.tipAmount > 0) cleanPayload.tipAmount = payload.tipAmount;
    if (payload.discountCode?.trim()) cleanPayload.discountCode = payload.discountCode.trim();

    const res = await baseApiFetch<StripePaymentIntentResponse>('/payments/stripe/create-intent', {
      method: 'POST',
      body: JSON.stringify(cleanPayload),
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

  /**
   * GET /payments/session/:sessionId/bill
   * Authoritative bill calculation for the active table session.
   */
  getSessionBill: async (sessionId: string): Promise<any> => {
    const res = await baseApiFetch<any>(`/payments/session/${encodeURIComponent(sessionId)}/bill`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  /**
   * GET /payments/:id
   * Fetch payment receipt by payment ID.
   */
  getPaymentReceipt: async (paymentId: string): Promise<PaymentResponse> => {
    const res = await baseApiFetch<PaymentResponse>(`/payments/${encodeURIComponent(paymentId)}`, {
      method: 'GET',
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
