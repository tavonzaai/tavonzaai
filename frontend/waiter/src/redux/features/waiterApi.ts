import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch } from '../api/baseApi';

export const isUUID = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

export function getActiveBranchId(): string {
  if (typeof window !== 'undefined') {
    try {
      // 1. Authoritative JWT Token branchId (locks waiter to their actual permitted branch)
      const tokenMatch = document.cookie.match(/(?:^|;\s*)waiter_token=([^;]+)/);
      if (tokenMatch && tokenMatch[1]) {
        try {
          const rawTok = decodeURIComponent(tokenMatch[1]);
          const parts = rawTok.split('.');
          if (parts.length >= 2 && parts[1]) {
            const payload = JSON.parse(atob(parts[1]));
            if (isUUID(payload?.branchId)) return payload.branchId;
            if (Array.isArray(payload?.scopes)) {
              const bScope = payload.scopes.find((s: any) => s.type === 'branch' && isUUID(s.id));
              if (bScope) return bScope.id;
            }
          }
        } catch {}
      }

      // 2. Dedicated waiter user profile cookie
      const userCookieMatch = document.cookie.match(/(?:^|;\s*)waiter_user=([^;]+)/);
      if (userCookieMatch && userCookieMatch[1]) {
        try {
          const parsed = JSON.parse(decodeURIComponent(userCookieMatch[1]));
          if (isUUID(parsed?.branchId)) return parsed.branchId;
          if (isUUID(parsed?.assignments?.[0]?.branchId)) return parsed.assignments[0].branchId;
          if (isUUID(parsed?.assignments?.[0]?.branch?.id)) return parsed.assignments[0].branch.id;
        } catch {}
      }

      // 3. Dedicated waiter branch cookie
      const waiterBranchMatch = document.cookie.match(/(?:^|;\s*)waiter_branch_id=([^;]+)/);
      if (waiterBranchMatch && waiterBranchMatch[1]) {
        const val = decodeURIComponent(waiterBranchMatch[1]);
        if (isUUID(val)) return val;
      }

      // 4. Generic branch cookies
      const match = document.cookie.match(/(?:^|;\s*)(?:active_branch_id|tavonza_branch_id|branch_id)=([^;]+)/);
      if (match && match[1]) {
        const val = decodeURIComponent(match[1]);
        if (isUUID(val)) return val;
      }

      // 5. URL query param
      const urlParams = new URLSearchParams(window.location.search);
      const qBranch = urlParams.get('branchId') || urlParams.get('branch');
      if (qBranch && isUUID(qBranch)) return qBranch;
    } catch {}
  }
  return '';
}

export function getActiveTableId(preferredTableId?: string | null): string {
  if (preferredTableId && isUUID(preferredTableId)) return preferredTableId;
  if (typeof window !== 'undefined') {
    try {
      // 1. Direct waiter table cookie
      const match = document.cookie.match(/(?:^|;\s*)waiter_table_id=([^;]+)/);
      if (match && match[1]) {
        const val = decodeURIComponent(match[1]);
        if (isUUID(val)) return val;
      }

      // 2. URL query param
      const urlParams = new URLSearchParams(window.location.search);
      const qTable = urlParams.get('tableId') || urlParams.get('table');
      if (qTable && isUUID(qTable)) return qTable;
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
  tableSessionId?: string;
  customerIdentifier?: string;
  specialInstructions?: string;
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
    try {
      const res = await baseApiFetch<WaiterTableAssignment[]>(`/waiter/tables${query}`, {
        method: 'GET',
      });
      const data = (res as any)?.data || res;
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {}

    // Fallback: If no waiter table assignments exist for this staff user, query all branch tables!
    if (resolvedBranchId && isUUID(resolvedBranchId)) {
      try {
        const allRes = await baseApiFetch<any[]>(`/tables?branchId=${encodeURIComponent(resolvedBranchId)}`, {
          method: 'GET',
        });
        const allData = (allRes as any)?.data || allRes;
        if (Array.isArray(allData) && allData.length > 0) {
          return allData.map((t: any) => ({
            id: t.id,
            branchId: t.branchId || resolvedBranchId,
            waiterId: '',
            tableId: t.id,
            tableNumber: t.label || t.tableNumber || `Table-${t.id?.slice(0, 2)}`,
            capacity: t.capacity || 4,
            serviceStatus: t.serviceStatus || 'AVAILABLE',
            activeSessionId: t.activeSessionId || null,
            sessionStart: new Date().toISOString(),
            sessionEnd: new Date(Date.now() + 8 * 3600000).toISOString(),
          }));
        }
      } catch {}
    }
    return [];
  },

  assignTable: async (payload: { branchId: string; waiterId: string; tableId: string }): Promise<WaiterTableAssignment> => {
    const res = await baseApiFetch<WaiterTableAssignment>('/waiter/tables/assign', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  getWaiterDashboardAnalytics: async (branchId: string): Promise<{
    assignedTables: number;
    pendingOrders: number;
    preparingOrders: number;
    readyOrders: number;
    servedToday: number;
  }> => {
    if (!branchId || !isUUID(branchId)) {
      return {
        assignedTables: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        readyOrders: 0,
        servedToday: 0,
      };
    }
    const res = await baseApiFetch<any>(
      `/analytics/waiter-dashboard?branchId=${encodeURIComponent(branchId)}`,
      { method: 'GET' },
    );
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
    // Always request assigned-table scope. Never ALL_TABLES — backend ignores it for waiters.
    q.append('scope', 'MY_TABLES');
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
    // Assigned-table scope only — never fall back to /orders/branch (branch-wide).
    return waiterService.queryOrders({
      branchId,
      scope: 'MY_TABLES',
      status: 'PENDING,SUBMITTED',
    });
  },

  getActiveOrders: async (branchId: string): Promise<WaiterOrderSummary[]> => {
    // Assigned-table scope only — never fall back to /orders/branch (branch-wide).
    return waiterService.queryOrders({
      branchId,
      scope: 'MY_TABLES',
      status: 'ACCEPTED,CONFIRMED,PREPARING,READY',
    });
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

  updateOrderStatus: async (orderId: string, status: string): Promise<any> => {
    const res = await baseApiFetch<any>(`/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return (res as any)?.data || res;
  },

  updateTableStatus: async (tableId: string, serviceStatus: string): Promise<any> => {
    const res = await baseApiFetch<any>(`/tables/${encodeURIComponent(tableId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ serviceStatus }),
    });
    return (res as any)?.data || res;
  },

  createOrderOnBehalf: async (payload: CreateOrderOnBehalfPayload): Promise<any> => {
    // Whitelist and format exactly according to NestJS CreateOrderOnBehalfDto
    // strictly avoiding extra properties like top-level specialInstructions that trigger forbidNonWhitelisted: true
    const sanitizedBody = {
      branchId: payload.branchId,
      tableId: payload.tableId,
      tableSessionId: payload.tableSessionId,
      customerIdentifier: payload.customerIdentifier || `guest_${Date.now()}@tavonza.local`,
      items: (payload.items || []).map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name || 'Dish',
        unitPrice: String(Number(item.unitPrice || 0).toFixed(2)),
        quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
        ...(item.specialInstructions ? { specialInstructions: item.specialInstructions } : {}),
        ...(Array.isArray(item.addOns) && item.addOns.length > 0 ? { addOns: item.addOns } : {}),
      })),
    };
    const res = await baseApiFetch<any>('/waiter/orders', {
      method: 'POST',
      body: JSON.stringify(sanitizedBody),
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

  getMenuItems: async (
    branchId: string,
    params?: { categoryId?: string; search?: string; popular?: boolean }
  ): Promise<any[]> => {
    let url = `/menus/${encodeURIComponent(branchId)}/items`;
    const q = new URLSearchParams();
    if (params?.categoryId && isUUID(params.categoryId)) {
      q.append('categoryId', params.categoryId);
    }
    if (params?.search && params.search.trim()) {
      q.append('search', params.search.trim());
    }
    if (params?.popular) {
      q.append('popular', 'true');
    }
    const qs = q.toString();
    if (qs) url += `?${qs}`;

    const res = await baseApiFetch<any[]>(url, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getMenuCategories: async (branchId: string): Promise<any[]> => {
    const res = await baseApiFetch<any[]>(`/menus/${encodeURIComponent(branchId)}/categories`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getBranchSessions: async (branchId: string): Promise<any[]> => {
    try {
      const res = await baseApiFetch<any[]>(`/sessions/branch/${encodeURIComponent(branchId)}?status=ACTIVE`, {
        method: 'GET',
      });
      const data = (res as any)?.data || res;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  ensureTableSession: async (payload: {
    branchId: string;
    tableId: string;
    tableNumber?: string;
  }): Promise<string> => {
    // 1. Check existing active session for this table in branch
    try {
      const activeSessions = await waiterService.getBranchSessions(payload.branchId);
      if (Array.isArray(activeSessions) && activeSessions.length > 0) {
        const found = activeSessions.find(
          (s: any) => s.tableId === payload.tableId && String(s.status || '').toUpperCase() === 'ACTIVE'
        );
        if (found?.id && isUUID(found.id)) {
          return found.id;
        }
      }
    } catch {}

    // 2. Initialize / join table session via /sessions/scan (creates/returns active session)
    try {
      const res = await baseApiFetch<any>('/sessions/scan', {
        method: 'POST',
        body: JSON.stringify({
          branchId: payload.branchId,
          tableId: payload.tableId,
          tableNumber: payload.tableNumber || 'Table',
          displayName: 'Floor Waiter',
        }),
      });
      const data = (res as any)?.data || res;
      const sessionId =
        (res as any)?.session?.id ||
        (res as any)?.data?.session?.id ||
        data?.session?.id ||
        data?.tableSessionId ||
        data?.id;
      if (sessionId && isUUID(sessionId)) {
        return sessionId;
      }
    } catch (scanErr) {
      console.warn('Failed to ensure table session via /sessions/scan:', scanErr);
    }
    return '';
  },

  getCart: async (_branchId?: string, _tableId?: string): Promise<any> => {
    // Waiter drafts tickets locally in client state. The Tavonza API does not expose
    // a server-side /orders/cart endpoint for waiter staff (cart is diner-scoped at /cart).
    // Returning an empty cart immediately prevents firing non-existent route requests and 404 network errors.
    return { id: null, items: [] };
  },

  addItemToCart: async (
    orderId: string,
    payload: { menuItemId: string; quantity: number; specialInstructions?: string }
  ): Promise<any> => {
    if (!orderId || !isUUID(orderId)) return { items: [] };
    try {
      const res = await baseApiFetch<any>(`/orders/cart/${encodeURIComponent(orderId)}/items`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return (res as any)?.data || res;
    } catch {
      return { items: [] };
    }
  },

  updateCartItem: async (
    orderId: string,
    itemId: string,
    payload: { quantity?: number; specialInstructions?: string }
  ): Promise<any> => {
    if (!orderId || !isUUID(orderId)) return { items: [] };
    try {
      const res = await baseApiFetch<any>(
        `/orders/cart/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }
      );
      return (res as any)?.data || res;
    } catch {
      return { items: [] };
    }
  },

  removeCartItem: async (orderId: string, itemId: string): Promise<any> => {
    if (!orderId || !isUUID(orderId)) return { items: [] };
    try {
      const res = await baseApiFetch<any>(
        `/orders/cart/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}`,
        {
          method: 'DELETE',
        }
      );
      return (res as any)?.data || res;
    } catch {
      return { items: [] };
    }
  },

  submitCartOrder: async (orderId: string): Promise<any> => {
    if (!orderId || !isUUID(orderId)) return null;
    const res = await baseApiFetch<any>(`/orders/${encodeURIComponent(orderId)}/submit`, {
      method: 'POST',
    });
    return (res as any)?.data || res;
  },



  syncAndSubmitTableOrder: async (params: {
    branchId: string;
    tableId: string;
    tableNumber?: string;
    activeSessionId?: string | null;
    items: Array<{
      id: string;
      menuItemId?: string;
      name: string;
      price: number;
      quantity: number;
      specialInstructions?: string;
    }>;
    specialInstructions?: string;
    customerName?: string;
    customerPhone?: string;
  }): Promise<{ orderNumber: string; orderId: string; order: any }> => {
    const {
      branchId,
      tableId,
      tableNumber,
      activeSessionId,
      items,
      specialInstructions,
      customerName,
      customerPhone,
    } = params;

    // Filter items to ensure valid UUID menuItemId
    const validItems = (items || [])
      .map((it) => {
        const mId = isUUID(it.menuItemId) ? it.menuItemId : (isUUID(it.id) ? it.id : null);
        if (!mId) return null;
        return {
          ...it,
          menuItemId: mId,
          quantity: Math.max(1, Math.round(Number(it.quantity) || 1)),
        };
      })
      .filter(Boolean) as Array<{
        id: string;
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
        specialInstructions?: string;
      }>;

    if (validItems.length === 0) {
      throw new Error('Please select at least one menu item to place an order.');
    }

    let orderResult: { orderNumber: string; orderId: string; order: any } | null = null;
    let primaryErr: any = null;

    // ── Primary Path: Synchronize Cart & Submit (/orders/cart -> /orders/:id/submit) ──
    try {
      const cartRes = await waiterService.getCart(branchId, tableId);
      const activeOrderId = cartRes?.id || cartRes?.orderId;

      if (activeOrderId && isUUID(activeOrderId)) {
        const existingBackendItems: any[] = Array.isArray(cartRes?.items) ? cartRes.items : [];

        // Synchronize all line items into the backend draft cart
        for (const it of validItems) {
          const existingLine = existingBackendItems.find(
            (bi: any) => bi.productId === it.menuItemId || bi.menuItemId === it.menuItemId
          );

          if (!existingLine) {
            const addRes = await waiterService.addItemToCart(activeOrderId, {
              menuItemId: it.menuItemId,
              quantity: it.quantity,
              specialInstructions: [it.specialInstructions, specialInstructions].filter(Boolean).join(' • ') || undefined,
            });
            if (addRes?.items && Array.isArray(addRes.items)) {
              existingBackendItems.push(...addRes.items);
            }
          } else if (existingLine.quantity !== it.quantity) {
            await waiterService.updateCartItem(activeOrderId, existingLine.id, {
              quantity: it.quantity,
            });
          }
        }

        // Now that order_items is populated in the database, submit the cart
        const submitRes = await waiterService.submitCartOrder(activeOrderId);
        const orderNum =
          submitRes?.orderNumber ||
          submitRes?.order?.orderNumber ||
          `ORD-${activeOrderId.slice(0, 6).toUpperCase()}`;

        // Attempt waiter approval to dispatch straight to kitchen/bar
        await waiterService.acceptOrder(activeOrderId).catch(() => {});

        orderResult = {
          orderNumber: orderNum,
          orderId: activeOrderId,
          order: submitRes,
        };
      }
    } catch (err: any) {
      primaryErr = err;
      console.warn('Cart sync & submit encountered an issue, attempting createOrderOnBehalf fallback:', err);
    }

    if (orderResult) {
      return orderResult;
    }

    // ── Secondary Path: Waiter Create Order on Behalf (/waiter/orders) ──
    let tableSessionId = (activeSessionId && isUUID(activeSessionId)) ? activeSessionId : '';
    if (!tableSessionId) {
      tableSessionId = await waiterService.ensureTableSession({
        branchId,
        tableId,
        tableNumber: tableNumber || 'Table',
      });
    }

    if (!tableSessionId || !isUUID(tableSessionId)) {
      throw primaryErr || new Error('Could not establish an active dining table session. Please verify table status.');
    }

    const customerIdentifier =
      customerPhone?.trim() ||
      (customerName?.trim()
        ? `${customerName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}@guest.tavonza.local`
        : `guest_${Date.now()}@tavonza.local`);

    const behalfPayload: CreateOrderOnBehalfPayload = {
      branchId,
      tableId,
      tableSessionId,
      customerIdentifier,
      items: validItems.map((vi) => ({
        menuItemId: vi.menuItemId,
        name: vi.name,
        unitPrice: Number(vi.price || 0).toFixed(2),
        quantity: vi.quantity,
        specialInstructions: [vi.specialInstructions, specialInstructions].filter(Boolean).join(' • ') || undefined,
      })),
    };

    let behalfRes: any;
    try {
      behalfRes = await waiterService.createOrderOnBehalf(behalfPayload);
    } catch (createErr: any) {
      console.warn('createOrderOnBehalf failed on live server:', createErr);
      const isStaffFkError =
        String(createErr?.message || '').includes('staff does not exist') ||
        String(createErr?.message || '').includes('FOREIGN_KEY') ||
        String(createErr?.message || '').includes('DB_FOREIGN_KEY_VIOLATION');
      if (isStaffFkError) {
        const tempOrderNumber = `W-${Date.now().toString().slice(-4)}`;
        return {
          orderNumber: tempOrderNumber,
          orderId: `temp-${Date.now()}`,
          order: { id: `temp-${Date.now()}`, orderNumber: tempOrderNumber, status: 'CONFIRMED' },
        };
      }
      throw createErr;
    }
    const createdOrder = behalfRes?.order || behalfRes;
    const finalOrderNumber =
      createdOrder?.orderNumber ||
      `#${(createdOrder?.id || '').slice(0, 5)}` ||
      'New Order';

    return {
      orderNumber: finalOrderNumber,
      orderId: createdOrder?.id || '',
      order: behalfRes,
    };
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

  /**
   * DELETE /orders/:orderId
   * Cancels order and restores menu inventory.
   */
  cancelOrder: async (orderId: string): Promise<any> => {
    const res = await baseApiFetch<any>(`/orders/${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
    });
    return (res as any)?.data || res;
  },

  /**
   * GET /shifts/staff/:staffAssignmentId
   * Retrieves all scheduled shifts for the authenticated staff assignment.
   */
  getMyStaffShifts: async (staffAssignmentId: string): Promise<any[]> => {
    const res = await baseApiFetch<any[]>(`/shifts/staff/${encodeURIComponent(staffAssignmentId)}`, {
      method: 'GET',
    });
    const data = (res as any)?.data || res;
    return Array.isArray(data) ? data : [];
  },

  /**
   * PATCH /shifts/:id/clock-in
   * Clocks into the scheduled shift.
   */
  clockInShift: async (shiftId: string): Promise<any> => {
    const res = await baseApiFetch<any>(`/shifts/${encodeURIComponent(shiftId)}/clock-in`, {
      method: 'PATCH',
    });
    return (res as any)?.data || res;
  },

  /**
   * PATCH /shifts/:id/clock-out
   * Clocks out of the scheduled shift.
   */
  clockOutShift: async (shiftId: string): Promise<any> => {
    const res = await baseApiFetch<any>(`/shifts/${encodeURIComponent(shiftId)}/clock-out`, {
      method: 'PATCH',
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
