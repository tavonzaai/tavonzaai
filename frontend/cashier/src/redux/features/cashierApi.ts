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

export const cashierService = {
  getOrders: async (branchId: string): Promise<any[]> => {
    const res = await baseApiFetch<any[]>(`/orders/branch/${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getTables: async (branchId: string): Promise<any[]> => {
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
