import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch } from '../api/baseApi';
import {
  getActiveBranchIdMemory,
  getBranchIdFromAccessToken,
  setActiveBranchIdMemory,
} from '../../lib/auth';
import { store } from '../store';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(id: any): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id.trim());
}

/**
 * Active branch comes from session memory / Redux / JWT — never cookies.
 */
export function getActiveBranchId(): string {
  const fromMemory = getActiveBranchIdMemory();
  if (fromMemory && isValidUuid(fromMemory)) return fromMemory;

  try {
    const user = store.getState()?.auth?.user as any;
    if (user?.branchId && isValidUuid(user.branchId)) {
      setActiveBranchIdMemory(user.branchId);
      return user.branchId;
    }
    const assignmentBranch =
      user?.assignments?.[0]?.branch?.id || user?.assignments?.[0]?.branchId;
    if (assignmentBranch && isValidUuid(assignmentBranch)) {
      setActiveBranchIdMemory(assignmentBranch);
      return assignmentBranch;
    }
  } catch {}

  const fromToken = getBranchIdFromAccessToken();
  if (fromToken) {
    setActiveBranchIdMemory(fromToken);
    return fromToken;
  }

  // Last-resort seed branch (Downtown) when JWT has no branch claim yet
  return 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';
}

const locallyDeletedTableIds = new Set<string>();

export function markTableDeletedLocally(tableId: string): void {
  if (tableId) locallyDeletedTableIds.add(String(tableId).toLowerCase());
}

export function isTableDeletedLocally(tableId: string): boolean {
  if (!tableId) return false;
  return locallyDeletedTableIds.has(String(tableId).toLowerCase());
}

export function clearTableDeletedLocally(tableId: string): void {
  if (tableId) locallyDeletedTableIds.delete(String(tableId).toLowerCase());
}

export interface BranchSettings {
  id: string;
  branchId: string;
  orderAcceptanceMode: 'AUTO_ACCEPT' | 'WAITER_APPROVAL' | 'MANAGER_APPROVAL';
  taxRate: number;
  serviceChargeRate: number;
  currency: string;
  autoCloseIdleSessionMins: number;
  allowGuestOrdering: boolean;
  allowSplitPayments: boolean;
}

export interface TableItem {
  id: string;
  branchId: string;
  label: string;
  capacity: number;
  shape: string;
  serviceStatus: string;
  operationalFlag: string;
  activeSessionId?: string | null;
  qrCodeUrl?: string | null;
  qrCodeToken?: string | null;
  isActive: boolean;
  tableNumber?: string;
  floor?: number;
  waiter?: string;
  waiterId?: string;
  assignedWaiter?: {
    waiterId?: string;
    waiterName?: string;
    sessionStart?: string;
    sessionEnd?: string;
  } | null;
}

export interface BranchSessionItem {
  id: string;
  branchId: string;
  tableId: string;
  tableNumber?: string;
  status: 'active' | 'closed' | 'paying' | 'ACTIVE' | 'PAYMENT_PENDING' | 'CLOSED' | 'ABANDONED' | string;
  shareCode?: string | null;
  openedAt: string;
  closedAt?: string | null;
  customerCount?: number;
}

export interface ReservationItem {
  id: string;
  branchId: string;
  tableId?: string | null;
  tableLabel?: string | null;
  guestName: string;
  guestPhone: string;
  partySize: number;
  reservedFor: string;
  durationMins: number;
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'CANCELLED' | 'NO_SHOW' | string;
  specialRequest?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationPayload {
  branchId: string;
  tableId?: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  reservedFor: string;
  durationMins?: number;
  specialRequest?: string;
}

export interface StaffAssignmentItem {
  id: string;
  branchId: string;
  staffId: string;
  staffName?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  role: string;
  permissions: string[];
  isActive: boolean;
  assignedAt: string;
}

export interface LiveOrderItem {
  id?: string;
  orderId: string;
  orderNumber: string;
  tableId: string;
  tableLabel?: string;
  tableNumber?: string;
  status: string;
  displayStatus: string;
  itemCount: number;
  total: number;
  totalAmount?: number;
  subtotal?: number;
  taxAmount?: number;
  paymentStatus?: string;
  orderType?: string;
  waiter?: string;
  waiterName?: string;
  customerName?: string;
  estimatedPrepTime?: number;
  createdAt: string;
  submittedAt?: string;
  items?: Array<{
    id: string;
    menuItemId: string;
    name: string;
    unitPrice: number;
    price?: number;
    quantity: number;
    lineTotal: number;
    notes?: string;
  }>;
}

export interface MenuCategoryItem {
  id: string;
  restaurantId?: string;
  name: string;
  slug?: string;
  description?: string | null;
  sortOrder?: number;
  displayOrder?: number;
  isActive?: boolean;
  itemCount?: number;
}

export interface MenuItemResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  basePrice?: number;
  imageUrl?: string | null;
  categoryName?: string;
  categoryId?: string;
  isPopular?: boolean;
  isAvailable?: boolean;
  estimatedPrepTime?: number;
  prepTime?: number;
  stockQuantity?: number;
  isStockTracked?: boolean;
  stationBadge?: string;
  station?: string;
  modifiersCount?: string;
}

export interface BranchDetail {
  id: string;
  restaurantId: string;
  name: string;
  address: {
    line1?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    [key: string]: any;
  };
  phone?: string;
  timezone?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchOperatingHourItem {
  id?: string;
  branchId?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchHolidayItem {
  id: string;
  branchId: string;
  date: string;
  label?: string | null;
  isClosed: boolean;
  openTime?: string | null;
  closeTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBranchHolidayPayload {
  date: string;
  label?: string;
  isClosed?: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface UpdateStaffPayload {
  role?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
  permissions?: string[];
}

export interface KitchenTicketItem {
  id: string;
  orderId: string;
  orderNumber: string;
  tableLabel?: string | null;
  productName: string;
  quantity: number;
  stationType: string;
  status: string;
  specialInstructions?: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  servedAt?: string | null;
  createdAt?: string;
}

/**
 * Resolves the base URL for the customer ordering application.
 * - Prioritizes NEXT_PUBLIC_CUSTOMER_APP_URL if defined.
 * - In production / HTTPS / public domains, never attaches :3100.
 * - For local development, falls back to http://localhost:3100 (or local IP with port 3100).
 */
export function getCustomerBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL || process.env.CUSTOMER_APP_URL;
  if (envUrl) {
    return envUrl.trim().replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isIpAddress = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

    // If on HTTPS or any standard domain (e.g. manager.tavonza.com), use the origin without :3100
    if (protocol === 'https:' || (!isLocalhost && !isIpAddress)) {
      return `${protocol}//${hostname}`;
    }

    // Local network IP during development (e.g. 192.168.1.5:3100)
    if (isIpAddress && !isLocalhost) {
      return `${protocol}//${hostname}:3100`;
    }
  }

  return 'http://localhost:3100';
}

export function getCustomerTableUrl(token: string): string {
  const base = getCustomerBaseUrl();
  return `${base}?qr=${encodeURIComponent(token)}`;
}

export function buildTableQrCodeUrl(token: string): string {
  const targetUrl = getCustomerTableUrl(token);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;
}

export const branchManagerService = {
  getBranch: async (branchId: string): Promise<BranchDetail> => {
    const res = await baseApiFetch<BranchDetail>(`/branches/${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  /**
   * Branch KPI analytics. Dashboards/reports must use this — never aggregate getOrders/getTables.
   * GET /analytics/branch-dashboard?branchId=
   */
  getBranchDashboardAnalytics: async (branchId: string): Promise<{
    branchId: string;
    tablesCount: number;
    availableTables: number;
    occupiedTables: number;
    occupancyPercent: number;
    staffCount: number;
    ordersCount: number;
    pendingOrders: number;
    preparingOrders: number;
    readyOrders: number;
    delayedOrders: number;
    unpaidOrders: number;
    unpaidAmount: number;
    paidRevenue: number;
    todayOrders: number;
    todayRevenue: number;
  }> => {
    const res = await baseApiFetch<any>(
      `/analytics/branch-dashboard?branchId=${encodeURIComponent(branchId)}`,
      { method: 'GET' },
    );
    return (res as any)?.data || res;
  },

  updateBranch: async (branchId: string, payload: Partial<BranchDetail>): Promise<BranchDetail> => {
    const res = await baseApiFetch<BranchDetail>(`/branches/${encodeURIComponent(branchId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  getOperatingHours: async (branchId: string): Promise<BranchOperatingHourItem[]> => {
    const res = await baseApiFetch<BranchOperatingHourItem[]>(`/branches/${encodeURIComponent(branchId)}/operating-hours`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  updateOperatingHours: async (
    branchId: string,
    hours: Array<{ dayOfWeek: number; openTime: string; closeTime: string }>
  ): Promise<BranchOperatingHourItem[]> => {
    const res = await baseApiFetch<BranchOperatingHourItem[]>(`/branches/${encodeURIComponent(branchId)}/operating-hours`, {
      method: 'PUT',
      body: JSON.stringify({ hours }),
    });
    return (res as any)?.data || res;
  },

  getHolidays: async (branchId: string): Promise<BranchHolidayItem[]> => {
    const res = await baseApiFetch<BranchHolidayItem[]>(`/branches/${encodeURIComponent(branchId)}/holidays`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  createHoliday: async (branchId: string, payload: CreateBranchHolidayPayload): Promise<BranchHolidayItem> => {
    const res = await baseApiFetch<BranchHolidayItem>(`/branches/${encodeURIComponent(branchId)}/holidays`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  getSettings: async (branchId: string): Promise<BranchSettings> => {
    const res = await baseApiFetch<BranchSettings>(`/branches/${encodeURIComponent(branchId)}/settings`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  updateSettings: async (branchId: string, payload: Partial<BranchSettings>): Promise<BranchSettings> => {
    const res = await baseApiFetch<BranchSettings>(`/branches/${encodeURIComponent(branchId)}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  getTables: async (branchId: string): Promise<TableItem[]> => {
    const res = await baseApiFetch<TableItem[]>(`/tables?branchId=${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    const list = (res as any)?.data || res;
    if (Array.isArray(list)) {
      return list
        .filter((t: any) => {
          if (!t || !t.id) return false;
          if (isTableDeletedLocally(t.id)) return false;
          const flag = String(t.operationalFlag || '').toUpperCase();
          const serv = String(t.serviceStatus || '').toUpperCase();
          const isDeletedFlag = Boolean(t.isDeleted || t.deletedAt);
          const isInactive = t.isActive === false;
          return flag !== 'OUT_OF_SERVICE' && serv !== 'OUT_OF_SERVICE' && !isDeletedFlag && !isInactive;
        })
        .map((t) => {
          const qrToken = t.qrCodeToken || t.id;
          return {
            ...t,
            qrCodeToken: qrToken,
            qrCodeUrl: t.qrCodeUrl || (qrToken ? buildTableQrCodeUrl(qrToken) : undefined),
          };
        });
    }
    return list;
  },

  getTable: async (tableId: string): Promise<TableItem> => {
    const res = await baseApiFetch<TableItem>(`/tables/${encodeURIComponent(tableId)}`, {
      method: 'GET',
    });
    const t = (res as any)?.data || res;
    const qrToken = t.qrCodeToken || t.id;
    const qrCodeUrl = t.qrCodeUrl || (qrToken ? buildTableQrCodeUrl(qrToken) : undefined);
    return {
      ...t,
      qrCodeUrl,
      qrCodeToken: qrToken,
    };
  },

  createTable: async (payload: { branchId: string; label: string; capacity: number; shape?: string; floor?: number }): Promise<TableItem> => {
    const res = await baseApiFetch<TableItem>('/tables', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  updateTable: async (tableId: string, payload: Partial<TableItem>): Promise<TableItem> => {
    const res = await baseApiFetch<TableItem>(`/tables/${encodeURIComponent(tableId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  deleteTable: async (tableId: string): Promise<{ success: boolean }> => {
    markTableDeletedLocally(tableId);
    const res = await baseApiFetch<{ success: boolean }>(`/tables/${encodeURIComponent(tableId)}`, {
      method: 'DELETE',
    });
    return (res as any)?.data || res;
  },

  getTableQr: async (tableId: string): Promise<{ qrCodeUrl: string; tableUrl: string }> => {
    try {
      const res = await baseApiFetch<{ qrCodeUrl: string; tableUrl: string }>(`/tables/${encodeURIComponent(tableId)}/qr`, {
        method: 'GET',
      });
      return (res as any)?.data || res;
    } catch {
      // Fallback to regenerateQr
      const regen = await baseApiFetch<TableItem>(`/tables/${encodeURIComponent(tableId)}/regenerate-qr`, {
        method: 'POST',
      });
      const token = (regen as any)?.qrCodeToken || (regen as any)?.data?.qrCodeToken;
      return {
        qrCodeUrl: token ? buildTableQrCodeUrl(token) : '',
        tableUrl: token ? getCustomerTableUrl(token) : '',
      };
    }
  },

  regenerateQr: async (tableId: string): Promise<TableItem> => {
    const res = await baseApiFetch<TableItem>(`/tables/${encodeURIComponent(tableId)}/regenerate-qr`, {
      method: 'POST',
    });
    return (res as any)?.data || res;
  },

  getStaffAssignments: async (
    branchId: string,
    filters?: { role?: string; search?: string }
  ): Promise<StaffAssignmentItem[]> => {
    const params = new URLSearchParams();
    if (filters?.role && filters.role !== 'ALL') params.append('role', filters.role);
    if (filters?.search && filters.search.trim()) params.append('search', filters.search.trim());
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await baseApiFetch<StaffAssignmentItem[]>(`/branches/${encodeURIComponent(branchId)}/staff${query}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  createStaff: async (branchId: string, payload: CreateStaffPayload): Promise<StaffAssignmentItem> => {
    const res = await baseApiFetch<StaffAssignmentItem>(`/branches/${encodeURIComponent(branchId)}/staff`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  assignStaff: async (branchId: string, payload: { staffId: string; role: string; permissions: string[] }): Promise<StaffAssignmentItem> => {
    const res = await baseApiFetch<StaffAssignmentItem>(`/branches/${encodeURIComponent(branchId)}/staff/assign`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  getStaffMember: async (branchId: string, staffId: string): Promise<StaffAssignmentItem> => {
    try {
      const res = await baseApiFetch<StaffAssignmentItem>(`/branches/${encodeURIComponent(branchId)}/staff/${encodeURIComponent(staffId)}`, {
        method: 'GET',
      });
      return (res as any)?.data || res;
    } catch {
      const list = await branchManagerService.getStaffAssignments(branchId);
      const found = list.find((s) => s.staffId === staffId || s.id === staffId);
      if (found) return found;
      throw new Error(`Staff member ${staffId} not found`);
    }
  },

  updateStaff: async (
    branchId: string,
    staffId: string,
    payload: UpdateStaffPayload
  ): Promise<StaffAssignmentItem> => {
    const res = await baseApiFetch<StaffAssignmentItem>(
      `/branches/${encodeURIComponent(branchId)}/staff/${encodeURIComponent(staffId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
    return (res as any)?.data || res;
  },

  getWaiterAssignments: async (
    branchId: string,
    waiterId?: string
  ): Promise<any[]> => {
    const params = new URLSearchParams({ branchId });
    if (waiterId) params.append('waiterId', waiterId);
    const res = await baseApiFetch<any>(`/waiter/tables/assignments?${params.toString()}`, {
      method: 'GET',
    });
    return (res as any)?.data || res || [];
  },

  assignWaiterToTable: async (payload: {
    branchId: string;
    tableId?: string;
    tableIds?: string[];
    waiterId: string;
    sessionStart?: string;
    sessionEnd?: string;
    shiftLabel?: string;
  }): Promise<any> => {
    const res = await baseApiFetch('/waiter/tables/assign', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  unassignWaiterTable: async (payload: {
    branchId: string;
    waiterId: string;
    tableId?: string;
    tableIds?: string[];
    assignmentId?: string;
  }): Promise<any> => {
    if (payload.assignmentId) {
      const res = await baseApiFetch(`/waiter/tables/assign/${encodeURIComponent(payload.assignmentId)}`, {
        method: 'DELETE',
      });
      return (res as any)?.data || res;
    }
    const res = await baseApiFetch('/waiter/tables/unassign', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  createMenuItem: async (payload: {
    restaurantId?: string;
    categoryId: string;
    name: string;
    description?: string;
    basePrice: number;
    imageUrl?: string;
    isVegetarian?: boolean;
    estimatedPrepTime?: number;
    stockQuantity?: number;
    isStockTracked?: boolean;
  }): Promise<any> => {
    let restaurantId = payload.restaurantId;
    if (!restaurantId || !isValidUuid(restaurantId)) {
      try {
        const branch = await branchManagerService.getBranch(getActiveBranchId());
        if (branch?.restaurantId && isValidUuid(branch.restaurantId)) {
          restaurantId = branch.restaurantId;
        }
      } catch {}
    }
    if (!restaurantId || !isValidUuid(restaurantId)) {
      restaurantId = getActiveBranchId();
    }
    const res = await baseApiFetch('/menus/items', {
      method: 'POST',
      body: JSON.stringify({ ...payload, restaurantId }),
    });
    return (res as any)?.data || res;
  },

  updateMenuItem: async (
    itemId: string,
    payload: {
      name?: string;
      description?: string;
      basePrice?: number;
      imageUrl?: string;
      isAvailable?: boolean;
      estimatedPrepTime?: number;
      stockQuantity?: number;
      isStockTracked?: boolean;
    }
  ): Promise<any> => {
    const res = await baseApiFetch(`/menus/items/${encodeURIComponent(itemId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  deleteMenuItem: async (itemId: string): Promise<any> => {
    const res = await baseApiFetch(`/menus/items/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    });
    return (res as any)?.data || res;
  },

  getOrders: async (
    branchId: string,
    filters?: { status?: string; search?: string; tableId?: string } | string
  ): Promise<LiveOrderItem[]> => {
    const params = new URLSearchParams();
    if (typeof filters === 'string') {
      if (filters && filters !== 'ALL') params.append('status', filters);
    } else if (filters) {
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.tableId) params.append('tableId', filters.tableId);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await baseApiFetch<LiveOrderItem[]>(`/orders/branch/${encodeURIComponent(branchId)}${query}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getKitchenTickets: async (branchId: string, station?: string): Promise<KitchenTicketItem[]> => {
    const query = station && station !== 'ALL' ? `?station=${encodeURIComponent(station)}` : '';
    const res = await baseApiFetch<KitchenTicketItem[]>(`/kitchen/tickets/${encodeURIComponent(branchId)}${query}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getOrderDetail: async (orderId: string): Promise<LiveOrderItem> => {
    const res = await baseApiFetch<LiveOrderItem>(`/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<LiveOrderItem> => {
    const res = await baseApiFetch<LiveOrderItem>(`/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return (res as any)?.data || res;
  },

  getCategories: async (branchId: string): Promise<MenuCategoryItem[]> => {
    const res = await baseApiFetch<MenuCategoryItem[]>(`/menus/${encodeURIComponent(branchId)}/categories`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  createCategory: async (payload: {
    restaurantId?: string;
    name: string;
    description?: string;
    displayOrder?: number;
  }): Promise<MenuCategoryItem> => {
    let restaurantId = payload.restaurantId;
    if (!restaurantId || !isValidUuid(restaurantId)) {
      const branch = await branchManagerService.getBranch(getActiveBranchId());
      if (branch?.restaurantId && isValidUuid(branch.restaurantId)) {
        restaurantId = branch.restaurantId;
      }
    }
    if (!restaurantId || !isValidUuid(restaurantId)) {
      throw new Error(
        'Cannot create menu category: restaurantId is missing. Open the branch and try again.',
      );
    }
    const res = await baseApiFetch<MenuCategoryItem>('/menus/categories', {
      method: 'POST',
      body: JSON.stringify({
        restaurantId,
        name: payload.name,
        description: payload.description,
        displayOrder: payload.displayOrder ?? 0,
      }),
    });
    return (res as any)?.data || res;
  },

  updateCategory: async (
    id: string,
    payload: {
      name?: string;
      description?: string;
      displayOrder?: number;
      isActive?: boolean;
    }
  ): Promise<MenuCategoryItem> => {
    const res = await baseApiFetch<MenuCategoryItem>(`/menus/categories/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  deleteCategory: async (id: string): Promise<any> => {
    const res = await baseApiFetch(`/menus/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return (res as any)?.data || res;
  },

  getMenuItems: async (branchId: string, categoryId?: string, search?: string): Promise<MenuItemResponse[]> => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (search) params.append('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await baseApiFetch<MenuItemResponse[]>(`/menus/${encodeURIComponent(branchId)}/items${queryString}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getInventorySummary: async (branchId: string): Promise<any> => {
    const res = await baseApiFetch<any>(`/inventory/summary/branch/${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getInventoryItems: async (branchId: string, lowStockOnly = false): Promise<any[]> => {
    const qs = lowStockOnly ? '?lowStockOnly=true' : '';
    const res = await baseApiFetch<any[]>(`/inventory/items/branch/${encodeURIComponent(branchId)}${qs}`, {
      method: 'GET',
    });
    return (res as any)?.data || res || [];
  },

  adjustStock: async (
    itemId: string,
    payload: { quantityDelta: number; reason: string; notes?: string }
  ): Promise<any> => {
    const res = await baseApiFetch<any>(`/inventory/items/${encodeURIComponent(itemId)}/adjust`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  getShifts: async (branchId: string, date?: string): Promise<any[]> => {
    const qs = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await baseApiFetch<any[]>(`/shifts/branch/${encodeURIComponent(branchId)}${qs}`, {
      method: 'GET',
    });
    return (res as any)?.data || res || [];
  },

  getBranchSessions: async (branchId: string, status?: string): Promise<BranchSessionItem[]> => {
    const qs = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    const res = await baseApiFetch<BranchSessionItem[]>(`/sessions/branch/${encodeURIComponent(branchId)}${qs}`, {
      method: 'GET',
    });
    return (res as any)?.data || res || [];
  },

  getReservations: async (branchId: string): Promise<ReservationItem[]> => {
    const res = await baseApiFetch<ReservationItem[]>(`/tables/reservations/branch/${encodeURIComponent(branchId)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res || [];
  },

  getReservation: async (id: string): Promise<ReservationItem> => {
    const res = await baseApiFetch<ReservationItem>(`/tables/reservations/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  createReservation: async (payload: CreateReservationPayload): Promise<ReservationItem> => {
    const res = await baseApiFetch<ReservationItem>('/tables/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  updateReservationStatus: async (
    id: string,
    status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'CANCELLED' | 'NO_SHOW' | string
  ): Promise<ReservationItem> => {
    const res = await baseApiFetch<ReservationItem>(`/tables/reservations/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return (res as any)?.data || res;
  },

  deleteReservation: async (id: string): Promise<any> => {
    const res = await baseApiFetch(`/tables/reservations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return (res as any)?.data || res;
  },
};

export const fetchBranchSettings = createAsyncThunk<BranchSettings, string, { rejectValue: string }>(
  'branchManager/fetchSettings',
  async (branchId, { rejectWithValue }) => {
    try {
      return await branchManagerService.getSettings(branchId);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch branch settings');
    }
  }
);

export const updateBranchSettingsThunk = createAsyncThunk<
  BranchSettings,
  { branchId: string; updates: Partial<BranchSettings> },
  { rejectValue: string }
>(
  'branchManager/updateSettings',
  async ({ branchId, updates }, { rejectWithValue }) => {
    try {
      return await branchManagerService.updateSettings(branchId, updates);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update branch settings');
    }
  }
);
