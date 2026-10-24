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
  scope: 'ORDER' | 'FULL_ORDER' | 'ORDER_ITEMS' | 'SPLIT_EQUAL' | 'TABLE_SESSION' | 'GUEST_SESSION';
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

let cachedBranchId: string = '';
let cachedOrganizationId: string = '';

/**
 * Returns the currently active branch ID if cached in memory or set in active_branch_id cookie.
 */
export function getActiveBranchId(): string {
  if (cachedBranchId && isUUID(cachedBranchId)) {
    return cachedBranchId;
  }
  if (typeof window !== 'undefined') {
    try {
      const match = document.cookie.match(/(?:^|;\s*)(?:active_branch_id|branch_id)=([^;]+)/);
      if (match && match[1]) {
        const val = decodeURIComponent(match[1]);
        if (isUUID(val)) {
          cachedBranchId = val;
          return val;
        }
      }
    } catch {}
  }
  return '';
}

/**
 * Dynamically resolves the active branch ID from authoritative backend APIs:
 * 1. GET /me/assignments (Staff Assignments)
 * 2. GET /users/me (User Profile)
 */
export async function fetchActiveBranchId(): Promise<string> {
  if (cachedBranchId && isUUID(cachedBranchId)) {
    return cachedBranchId;
  }
  const synchronousId = getActiveBranchId();
  if (synchronousId) return synchronousId;

  try {
    const res = await baseApiFetch<any>('/me/assignments', { method: 'GET' }).catch(() => null);
    const data = (res as any)?.data || res;
    const assignments = data?.assignments || (Array.isArray(data) ? data : []);
    const active = assignments.find((a: any) => a.isActive !== false && isUUID(a.branchId));
    const branchId = active?.branchId || assignments[0]?.branchId;
    if (branchId && isUUID(branchId)) {
      cachedBranchId = branchId;
      return branchId;
    }
  } catch {}

  try {
    const meRes = await baseApiFetch<any>('/users/me', { method: 'GET' }).catch(() => null);
    const meData = (meRes as any)?.data || meRes;
    if (isUUID(meData?.branchId)) {
      cachedBranchId = meData.branchId;
      return meData.branchId;
    }
  } catch {}

  return '';
}

/**
 * Dynamically resolves the organization ID from backend APIs:
 * 1. GET /users/me (User Profile)
 * 2. GET /branches/:branchId -> GET /restaurants/:restaurantId (Branch Hierarchy)
 */
export async function resolveOrganizationId(branchId?: string): Promise<string> {
  if (cachedOrganizationId && isUUID(cachedOrganizationId)) {
    return cachedOrganizationId;
  }

  // 1. Dynamic API: Check user profile
  try {
    const meRes = await baseApiFetch<any>('/users/me', { method: 'GET' }).catch(() => null);
    const meData = (meRes as any)?.data || meRes;
    if (isUUID(meData?.organizationId)) {
      cachedOrganizationId = meData.organizationId;
      return cachedOrganizationId;
    }
  } catch {}

  // 2. Dynamic API: Resolve through branch & restaurant hierarchy
  const bId = branchId || cachedBranchId || (await fetchActiveBranchId());
  if (!bId) return '';
  try {
    const branchRes = await baseApiFetch<any>(`/branches/${encodeURIComponent(bId)}`, {
      method: 'GET',
    }).catch(() => null);
    const branchData = (branchRes as any)?.data || branchRes;
    const restaurantId = branchData?.restaurantId;
    if (restaurantId) {
      const restRes = await baseApiFetch<any>(`/restaurants/${encodeURIComponent(restaurantId)}`, {
        method: 'GET',
      }).catch(() => null);
      const restData = (restRes as any)?.data || restRes;
      const orgId = restData?.organizationId;
      if (orgId && isUUID(orgId)) {
        cachedOrganizationId = orgId;
        return orgId;
      }
    }
  } catch {}

  return '';
}

export function getActiveOrganizationId(): string {
  if (cachedOrganizationId && isUUID(cachedOrganizationId)) {
    return cachedOrganizationId;
  }
  return '';
}


export const cashierService = {
  /** KPI snapshot — never derive dashboard cards from getOrders. */
  getCashierDashboardAnalytics: async (branchId: string): Promise<{
    todayRevenue: number;
    todayPaidOrders: number;
    unpaidOrders: number;
    unpaidAmount: number;
    refundsToday: number;
    refundCountToday: number;
    pendingOfflinePayments: number;
  }> => {
    if (!branchId) {
      return {
        todayRevenue: 0,
        todayPaidOrders: 0,
        unpaidOrders: 0,
        unpaidAmount: 0,
        refundsToday: 0,
        refundCountToday: 0,
        pendingOfflinePayments: 0,
      };
    }
    const res = await baseApiFetch<any>(
      `/analytics/cashier-dashboard?branchId=${encodeURIComponent(branchId)}`,
      { method: 'GET' },
    );
    return (res as any)?.data || res;
  },

  getOrders: async (branchId: string): Promise<any[]> => {
    if (!branchId) return [];
    const res = await baseApiFetch<any[]>(`/orders/branch/${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getOrder: async (orderId: string): Promise<any> => {
    if (!orderId) return null;
    const res = await baseApiFetch<any>(`/orders/${encodeURIComponent(orderId)}`, {
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
    const isUuid = (val?: string) =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val.trim());

    const cleanPayload: Record<string, any> = {
      amount: typeof payload.amount === 'number' ? Number(payload.amount.toFixed(2)) : payload.amount,
      method: payload.method || 'CASH',
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
    if (typeof payload.tipAmount === 'number' && payload.tipAmount > 0) cleanPayload.tipAmount = payload.tipAmount;
    if (payload.discountCode?.trim()) cleanPayload.discountCode = payload.discountCode.trim();
    if (payload.transactionRef?.trim()) cleanPayload.transactionRef = payload.transactionRef.trim();

    const res = await baseApiFetch<CashierPaymentRecord>('/payments', {
      method: 'POST',
      body: JSON.stringify(cleanPayload),
    });
    return (res as any)?.data || res;
  },

  createStripePaymentIntent: async (payload: {
    orderId?: string;
    tableSessionId?: string;
    tipAmount?: number;
    discountCode?: string;
  }): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    publishableKey: string;
    orderId: string | null;
    tableSessionId: string | null;
  }> => {
    const isUuid = (val?: string) =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val.trim());

    const cleanPayload: Record<string, any> = {};
    if (isUuid(payload.orderId)) cleanPayload.orderId = payload.orderId;
    if (isUuid(payload.tableSessionId)) cleanPayload.tableSessionId = payload.tableSessionId;
    if (typeof payload.tipAmount === 'number' && payload.tipAmount > 0) cleanPayload.tipAmount = payload.tipAmount;
    if (payload.discountCode?.trim()) cleanPayload.discountCode = payload.discountCode.trim();

    const res = await baseApiFetch<any>('/payments/stripe/create-intent', {
      method: 'POST',
      body: JSON.stringify(cleanPayload),
    });
    return (res as any)?.data || res;
  },

  verifyStripePayment: async (paymentIntentId: string): Promise<CashierPaymentRecord> => {
    const res = await baseApiFetch<CashierPaymentRecord>('/payments/stripe/verify', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
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

  getBranchSessions: async (branchId: string, status?: string): Promise<any[]> => {
    const qs = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    const res = await baseApiFetch<any[]>(`/sessions/branch/${encodeURIComponent(branchId)}${qs}`, {
      method: 'GET',
    });
    return (res as any)?.data || res || [];
  },

  /**
   * GET /payments/:id
   * Fetch itemized payment receipt breakdown.
   */
  getPaymentReceipt: async (paymentId: string): Promise<CashierPaymentRecord> => {
    const res = await baseApiFetch<CashierPaymentRecord>(`/payments/${encodeURIComponent(paymentId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  /**
   * GET /payments/order/:orderId
   * Retrieve all payment records under an order.
   */
  getPaymentsByOrder: async (orderId: string): Promise<CashierPaymentRecord[]> => {
    const res = await baseApiFetch<CashierPaymentRecord[]>(`/payments/order/${encodeURIComponent(orderId)}`, {
      method: 'GET',
    });
    const data = (res as any)?.data || res;
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /payments?branchId=:branchId&organizationId=:organizationId&page=:page&limit=10
   * Retrieve recent payments ledger for the branch to identify paid orders.
   * Per-page limit is strictly 10.
   */
  listPayments: async (branchId: string, page = 1, limit = 10): Promise<any[]> => {
    if (!branchId) return [];
    try {
      let orgId = getActiveOrganizationId();
      if (!orgId) {
        orgId = await resolveOrganizationId(branchId);
      }
      // If organizationId is missing, do not make an invalid call that triggers
      // backend 400 Bad Request ("organizationId is required" - payment.service.ts line 1292)
      if (!orgId) {
        return [];
      }
      const res = await baseApiFetch<any>(
        `/payments?branchId=${encodeURIComponent(branchId)}&organizationId=${encodeURIComponent(orgId)}&page=${page}&limit=${limit}`,
        { method: 'GET' }
      );
      const data = (res as any)?.data || res;
      return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  /**
   * GET /payments/session/:sessionId/bill
   * Authoritative bill total and remaining unpaid balance for table session.
   */
  getSessionBill: async (sessionId: string): Promise<any> => {
    const res = await baseApiFetch<any>(`/payments/session/${encodeURIComponent(sessionId)}/bill`, {
      method: 'GET',
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
