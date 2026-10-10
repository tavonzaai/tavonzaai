import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch } from '../api/baseApi';

export interface PaymentOption {
  id: string;
  label: string;
  icon: string;
}

export interface ProcessPaymentPayload {
  orderId?: string;
  tableSessionId?: string;
  payerGuestSessionId?: string;
  scope: 'FULL_ORDER' | 'ORDER_ITEMS' | 'SPLIT_EQUAL';
  amount: number;
  tipAmount?: number;
  method: 'CASH' | 'CARD' | 'MOBILE_WALLET' | 'ONLINE_GATEWAY';
  discountCode?: string;
  transactionRef?: string;
}

export interface SplitPaymentAllocation {
  orderId?: string;
  orderItemId?: string;
  guestSessionId?: string;
  amount: number;
}

export interface ProcessSplitPaymentPayload {
  orderId?: string;
  tableSessionId?: string;
  payerGuestSessionId?: string;
  tipAmount?: number;
  method: 'CASH' | 'CARD' | 'MOBILE_WALLET' | 'ONLINE_GATEWAY';
  allocations: SplitPaymentAllocation[];
  transactionRef?: string;
}

export interface CashierPaymentRecord {
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

export interface OfflinePaymentRequestItem {
  id: string;
  paymentId?: string;
  orderId?: string | null;
  orderNumber?: string;
  tableId?: string | null;
  tableLabel?: string;
  customerName?: string;
  tableSessionId?: string | null;
  payerGuestSessionId?: string | null;
  amount: number;
  tipAmount: number;
  method: string;
  status: string;
  transactionRef: string;
  createdAt: string | Date;
}

const isUUID = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));

export function getActiveBranchId(): string {
  if (typeof window !== 'undefined') {
    try {
      // 1. Direct branch cookies
      const match = document.cookie.match(/(?:^|;\s*)(?:active_branch_id|tavonza_branch_id|cashier_branch_id|branch_id)=([^;]+)/);
      if (match && match[1]) {
        const val = decodeURIComponent(match[1]);
        if (isUUID(val)) return val;
      }

      // 2. User cookies (cashier_user, tavonza_user, user)
      const userCookieMatch = document.cookie.match(/(?:^|;\s*)(?:cashier_user|tavonza_user|user)=([^;]+)/);
      if (userCookieMatch && userCookieMatch[1]) {
        try {
          const parsed = JSON.parse(decodeURIComponent(userCookieMatch[1]));
          if (isUUID(parsed?.branchId)) return parsed.branchId;
          if (isUUID(parsed?.assignments?.[0]?.branchId)) return parsed.assignments[0].branchId;
          if (isUUID(parsed?.assignments?.[0]?.branch?.id)) return parsed.assignments[0].branch.id;
        } catch {}
      }

      // 3. localStorage keys
      for (const key of ['cashier_user', 'tavonza_user', 'user']) {
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


export const cashierService = {
  getOrders: async (branchId: string): Promise<any[]> => {
    if (!branchId) return [];
    const res = await baseApiFetch<any[]>(`/orders/branch/${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getTables: async (branchId: string): Promise<any[]> => {
    if (!branchId) return [];
    const res = await baseApiFetch<any[]>(`/tables?branchId=${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getMenuItems: async (branchId: string): Promise<any[]> => {
    if (!branchId) return [];
    const res = await baseApiFetch<any[]>(`/menus/${encodeURIComponent(branchId)}/items`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getCategories: async (branchId: string): Promise<any[]> => {
    const res = await baseApiFetch<any[]>(`/menus/${encodeURIComponent(branchId)}/categories`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getPaymentOptions: async (branchId?: string): Promise<{ methods: PaymentOption[] }> => {
    const url = branchId ? `/payments/options?branchId=${encodeURIComponent(branchId)}` : '/payments/options';
    const res = await baseApiFetch<{ methods: PaymentOption[] }>(url, { method: 'GET' });
    return (res as any)?.data || res;
  },

  processPayment: async (payload: ProcessPaymentPayload): Promise<CashierPaymentRecord> => {
    const res = await baseApiFetch<CashierPaymentRecord>('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  processSplitPayment: async (payload: ProcessSplitPaymentPayload): Promise<{ payment: CashierPaymentRecord; allocations: any[] }> => {
    const res = await baseApiFetch<{ payment: CashierPaymentRecord; allocations: any[] }>('/payments/split', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  validateDiscount: async (code: string, subtotal: number): Promise<{ code: string; type: string; discountAmount: number; netTotal: number }> => {
    const res = await baseApiFetch<{ code: string; type: string; discountAmount: number; netTotal: number }>('/payments/discounts/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
    return (res as any)?.data || res;
  },

  refundPayment: async (paymentId: string, refundAmount: number, reason: string): Promise<CashierPaymentRecord> => {
    const res = await baseApiFetch<CashierPaymentRecord>(`/payments/${encodeURIComponent(paymentId)}/refund`, {
      method: 'POST',
      body: JSON.stringify({ refundAmount, reason }),
    });
    return (res as any)?.data || res;
  },

  getOfflinePaymentRequests: async (branchId?: string): Promise<OfflinePaymentRequestItem[]> => {
    const url = branchId ? `/payments/offline/requests?branchId=${encodeURIComponent(branchId)}` : '/payments/offline/requests';
    const res = await baseApiFetch<OfflinePaymentRequestItem[]>(url, { method: 'GET' });
    return (res as any)?.data || res;
  },

  confirmOfflinePayment: async (
    paymentId: string,
    payload?: { receivedAmount?: number; tipAmount?: number }
  ): Promise<CashierPaymentRecord> => {
    const res = await baseApiFetch<CashierPaymentRecord>(`/payments/offline/${encodeURIComponent(paymentId)}/confirm`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
    return (res as any)?.data || res;
  },

  rejectOfflinePayment: async (paymentId: string, reason: string): Promise<CashierPaymentRecord> => {
    const res = await baseApiFetch<CashierPaymentRecord>(`/payments/offline/${encodeURIComponent(paymentId)}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return (res as any)?.data || res;
  },

  closeSession: async (sessionId: string): Promise<{ message: string }> => {
    const res = await baseApiFetch<{ message: string }>(`/sessions/${encodeURIComponent(sessionId)}/close`, {
      method: 'POST',
    });
    return (res as any)?.data || res;
  },
};

export const processCashierPayment = createAsyncThunk<
  CashierPaymentRecord,
  ProcessPaymentPayload,
  { rejectValue: string }
>(
  'cashier/processPayment',
  async (payload, { rejectWithValue }) => {
    try {
      return await cashierService.processPayment(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Payment failed');
    }
  }
);
