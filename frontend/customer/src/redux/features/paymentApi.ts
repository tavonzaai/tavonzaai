import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch } from '../api/baseApi';

export interface PaymentOptionsResponse {
  currency?: string;
  publishableKey?: string;
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
  id?: string;
  orderId?: string | null;
  orderItemId?: string | null;
  guestSessionId?: string | null;
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
  createdAt?: string | Date;
}

export interface PaymentDetailResponse extends PaymentResponse {
  allocations: PaymentAllocationItem[];
}

export interface DiscountEvaluationResponse {
  code: string;
  type: 'PERCENTAGE' | 'FIXED' | string;
  discountAmount: number;
  subtotal: number;
  netTotal: number;
}

export interface TableBillCalculationResponse {
  tableSessionId: string;
  ordersCount: number;
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  isFullyPaid: boolean;
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
  /**
   * GET /payments/options
   * Get available payment methods and gateway configurations for a branch.
   */
  getPaymentOptions: async (branchId?: string): Promise<PaymentOptionsResponse> => {
    const url = branchId ? `/payments/options?branchId=${encodeURIComponent(branchId)}` : '/payments/options';
    const res = await baseApiFetch<PaymentOptionsResponse>(url, { method: 'GET' });
    return (res as any)?.data || res;
  },

  /**
   * POST /payments
   * Legacy or direct single payment settlement for an entire order or table session.
   */
  createPayment: async (payload: CreatePaymentPayload): Promise<PaymentResponse> => {
    const isUuid = (val?: string) =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val.trim());

    const cleanPayload: Record<string, any> = {
      amount: typeof payload.amount === 'number' ? Number(payload.amount.toFixed(2)) : payload.amount,
      method: payload.method,
      scope:
        payload.scope === 'FULL_ORDER' || !payload.scope
          ? 'ORDER'
          : ['ORDER', 'ORDER_ITEMS', 'GUEST_SESSION', 'TABLE_SESSION'].includes(payload.scope)
          ? payload.scope
          : 'ORDER',
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

  /**
   * POST /payments/split
   * Itemized or equal split payment allocation across specific line items or guests.
   */
  createSplitPayment: async (payload: CreateSplitPaymentPayload): Promise<{ payment: PaymentResponse; allocations: PaymentAllocationItem[] }> => {
    const res = await baseApiFetch<{ payment: PaymentResponse; allocations: PaymentAllocationItem[] }>('/payments/split', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  /**
   * POST /payments/stripe/create-intent
   * Generate Stripe PaymentIntent clientSecret for in-app card checkout.
   */
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

  /**
   * POST /payments/stripe/verify
   * Authoritatively verify Stripe PaymentIntent completion and mark order PAID.
   */
  verifyStripePayment: async (paymentIntentId: string): Promise<PaymentResponse> => {
    const res = await baseApiFetch<PaymentResponse>('/payments/stripe/verify', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
    return (res as any)?.data || res;
  },

  /**
   * POST /payments/request-offline
   * Register an offline payment request for Cash or in-person Card terminal.
   */
  requestOfflinePayment: async (payload: RequestOfflinePaymentPayload): Promise<PaymentResponse> => {
    const res = await baseApiFetch<PaymentResponse>('/payments/request-offline', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  /**
   * POST /payments/discounts/apply
   * Validate promo voucher code and calculate exact discount amount.
   */
  applyDiscount: async (code: string, subtotal: number): Promise<DiscountEvaluationResponse> => {
    const res = await baseApiFetch<DiscountEvaluationResponse>('/payments/discounts/apply', {
      method: 'POST',
      body: JSON.stringify({ code: code.trim(), subtotal: Number(subtotal) }),
    });
    return (res as any)?.data || res;
  },

  /**
   * POST /payments/discounts/validate
   * Alias to validate discount code before checkout.
   */
  validateDiscount: async (code: string, subtotal: number): Promise<DiscountEvaluationResponse> => {
    const res = await baseApiFetch<DiscountEvaluationResponse>('/payments/discounts/validate', {
      method: 'POST',
      body: JSON.stringify({ code: code.trim(), subtotal: Number(subtotal) }),
    });
    return (res as any)?.data || res;
  },

  /**
   * GET /payments/order/:orderId
   * Retrieve payment records and settlement transactions for a specific order.
   */
  getPaymentsByOrder: async (orderId: string): Promise<PaymentResponse[]> => {
    const cleanId = (orderId || '').trim();
    if (!cleanId) return [];
    try {
      const res = await baseApiFetch<PaymentResponse[]>(`/payments/order/${encodeURIComponent(cleanId)}`, {
        method: 'GET',
        skipToast: true,
      });
      const data = (res as any)?.data || res;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  /**
   * GET /payments/session/:sessionId/bill
   * Authoritative consolidated bill calculation for the active table session.
   */
  getSessionBill: async (sessionId: string): Promise<TableBillCalculationResponse> => {
    const res = await baseApiFetch<TableBillCalculationResponse>(`/payments/session/${encodeURIComponent(sessionId)}/bill`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  /**
   * GET /payments/:id
   * Fetch payment receipt with line-item breakdown by payment ID.
   */
  getPaymentReceipt: async (paymentId: string): Promise<PaymentDetailResponse> => {
    const res = await baseApiFetch<PaymentDetailResponse>(`/payments/${encodeURIComponent(paymentId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  /**
   * POST /waiter/alerts
   * Ping waiter to table for assistance or bill request.
   */
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
