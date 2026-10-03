import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  baseApiFetch,
  setCookie,
  getCookie,
  removeCookie,
} from '../api/baseApi';

// ─────────────────────────────────────────────────────────────────────────────
// 📋 Data Models & Types (Matching Backend Drizzle Schema & Controller DTOs)
// ─────────────────────────────────────────────────────────────────────────────

export type TableSessionStatus = 'active' | 'closed' | 'paying';
export type CustomerRole = 'host' | 'guest';
export type OrderMode = 'individual' | 'together';

export interface TableSession {
  id: string;
  branchId: string;
  tableId: string;
  tableNumber: string;
  status: TableSessionStatus;
  shareCode: string | null;
  shareCodeExpiresAt: string | null;
  openedAt: string;
  closedAt: string | null;
}

export interface CustomerSession {
  id: string;
  tableSessionId: string;
  userId: string | null;
  displayName: string | null;
  role: CustomerRole;
  orderMode: OrderMode;
  joinedAt: string;
  leftAt: string | null;
}

// ── DTOs & Payloads ──────────────────────────────────────────────────────────

export interface ScanQrPayload {
  branchId: string;
  tableId: string;
  tableNumber: string;
}

export interface ScanQrResponse {
  session: TableSession;
  customerSession: CustomerSession | null;
  isNew: boolean;
}

export interface GetSessionResponse {
  session: TableSession;
  customers: CustomerSession[];
}

export interface GenerateShareCodeResponse {
  code: string;
  expiresAt: string;
}

export interface JoinSessionPayload {
  code: string;
  displayName?: string;
}

export interface JoinSessionResponse {
  session: TableSession;
  customerSession: CustomerSession;
}

export interface SetOrderModePayload {
  customerSessionId: string;
  orderMode: OrderMode;
}

export interface CloseSessionResponse {
  message: string;
}

// ── Cookie Storage Keys ──────────────────────────────────────────────────────
export const SESSION_COOKIES = {
  TABLE_SESSION_ID: 'tavonza_table_session_id',
  CUSTOMER_SESSION_ID: 'tavonza_customer_session_id',
  TABLE_NUMBER: 'tavonza_table_number',
  BRANCH_ID: 'tavonza_branch_id',
  TABLE_ID: 'tavonza_table_id',
  ROLE: 'tavonza_customer_role',
  ORDER_MODE: 'tavonza_order_mode',
};

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 Direct Service Methods (Can be called directly or via Redux Thunks)
// ─────────────────────────────────────────────────────────────────────────────

export const sessionService = {
  /**
   * 1. POST /sessions/scan
   * Figma: QR Scan Screen → Splash Screen
   * Creates a new table session or joins existing active session for this table.
   * If authenticated, creates customer session (host for new, guest for existing).
   */
  scanQr: async (payload: ScanQrPayload): Promise<ScanQrResponse> => {
    const res = await baseApiFetch<ScanQrResponse>('/sessions/scan', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data: ScanQrResponse = (res as any)?.data || res;

    // Cache active session in cookies for persistence across page refreshes
    if (data?.session?.id) {
      setCookie(SESSION_COOKIES.TABLE_SESSION_ID, data.session.id);
      setCookie(SESSION_COOKIES.TABLE_NUMBER, data.session.tableNumber);
      setCookie(SESSION_COOKIES.BRANCH_ID, data.session.branchId);
      setCookie(SESSION_COOKIES.TABLE_ID, data.session.tableId);
    }
    if (data?.customerSession?.id) {
      setCookie(SESSION_COOKIES.CUSTOMER_SESSION_ID, data.customerSession.id);
      setCookie(SESSION_COOKIES.ROLE, data.customerSession.role);
      setCookie(SESSION_COOKIES.ORDER_MODE, data.customerSession.orderMode);
    }

    return data;
  },

  /**
   * 2. GET /sessions/:sessionId
   * Figma: Splash Screen & Menu Header
   * Fetches session details with list of all joined customers/guests.
   */
  getSession: async (sessionId: string): Promise<GetSessionResponse> => {
    const res = await baseApiFetch<GetSessionResponse>(
      `/sessions/${encodeURIComponent(sessionId)}`,
      { method: 'GET' }
    );
    return (res as any)?.data || res;
  },

  /**
   * 3. POST /sessions/:sessionId/share-code
   * Figma: "Share Code" Screen (HostGuest Feature)
   * Generates a 6-character share code with 30-second expiry for guests to scan.
   * Requires JWT Bearer Token (Host must be authenticated).
   */
  generateShareCode: async (sessionId: string): Promise<GenerateShareCodeResponse> => {
    const res = await baseApiFetch<GenerateShareCodeResponse>(
      `/sessions/${encodeURIComponent(sessionId)}/share-code`,
      { method: 'POST' }
    );
    return (res as any)?.data || res;
  },

  /**
   * 4. POST /sessions/join
   * Figma: Guest Menu Screen ("You've joined the table as a Host Guest")
   * Allows a companion to join an active table session using the host's 6-character code.
   */
  joinSession: async (payload: JoinSessionPayload): Promise<JoinSessionResponse> => {
    const res = await baseApiFetch<JoinSessionResponse>('/sessions/join', {
      method: 'POST',
      body: JSON.stringify({
        code: payload.code.trim().toUpperCase(),
        ...(payload.displayName ? { displayName: payload.displayName.trim() } : {}),
      }),
    });

    const data: JoinSessionResponse = (res as any)?.data || res;

    // Cache joined session in cookies
    if (data?.session?.id) {
      setCookie(SESSION_COOKIES.TABLE_SESSION_ID, data.session.id);
      setCookie(SESSION_COOKIES.TABLE_NUMBER, data.session.tableNumber);
      setCookie(SESSION_COOKIES.BRANCH_ID, data.session.branchId);
      setCookie(SESSION_COOKIES.TABLE_ID, data.session.tableId);
    }
    if (data?.customerSession?.id) {
      setCookie(SESSION_COOKIES.CUSTOMER_SESSION_ID, data.customerSession.id);
      setCookie(SESSION_COOKIES.ROLE, data.customerSession.role);
      setCookie(SESSION_COOKIES.ORDER_MODE, data.customerSession.orderMode);
    }

    return data;
  },

  /**
   * 5. PATCH /sessions/order-mode
   * Figma: Cart Screen — "Order Individually" vs "Order Together"
   * Sets how the customer orders with other guests at the table.
   */
  setOrderMode: async (payload: SetOrderModePayload): Promise<CustomerSession> => {
    const res = await baseApiFetch<CustomerSession>('/sessions/order-mode', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    const data: CustomerSession = (res as any)?.data || res;
    if (data?.orderMode) {
      setCookie(SESSION_COOKIES.ORDER_MODE, data.orderMode);
    }
    return data;
  },

  /**
   * 6. POST /sessions/:sessionId/close
   * Figma: Post-Payment Completion Screen
   * Marks table session status as 'closed' and sets closedAt timestamp.
   * Requires JWT Bearer Token.
   */
  closeSession: async (sessionId: string): Promise<CloseSessionResponse> => {
    const res = await baseApiFetch<CloseSessionResponse>(
      `/sessions/${encodeURIComponent(sessionId)}/close`,
      { method: 'POST' }
    );

    // Clear session cookies
    removeCookie(SESSION_COOKIES.TABLE_SESSION_ID);
    removeCookie(SESSION_COOKIES.CUSTOMER_SESSION_ID);
    removeCookie(SESSION_COOKIES.ROLE);
    removeCookie(SESSION_COOKIES.ORDER_MODE);

    return (res as any)?.data || res;
  },

  /**
   * Helper to retrieve cached session identifiers from cookies
   */
  getCachedSessionInfo: () => {
    return {
      tableSessionId: getCookie(SESSION_COOKIES.TABLE_SESSION_ID),
      customerSessionId: getCookie(SESSION_COOKIES.CUSTOMER_SESSION_ID),
      tableNumber: getCookie(SESSION_COOKIES.TABLE_NUMBER),
      branchId: getCookie(SESSION_COOKIES.BRANCH_ID),
      tableId: getCookie(SESSION_COOKIES.TABLE_ID),
      role: (getCookie(SESSION_COOKIES.ROLE) as CustomerRole) || null,
      orderMode: (getCookie(SESSION_COOKIES.ORDER_MODE) as OrderMode) || 'individual',
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ⚡ Redux Async Thunks
// ─────────────────────────────────────────────────────────────────────────────

export const scanTableQr = createAsyncThunk<
  ScanQrResponse,
  ScanQrPayload,
  { rejectValue: string }
>('session/scanQr', async (payload, { rejectWithValue }) => {
  try {
    return await sessionService.scanQr(payload);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to scan table QR code');
  }
});

export const fetchTableSession = createAsyncThunk<
  GetSessionResponse,
  string,
  { rejectValue: string }
>('session/fetchSession', async (sessionId, { rejectWithValue }) => {
  try {
    return await sessionService.getSession(sessionId);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to retrieve session details');
  }
});

export const generateHostShareCode = createAsyncThunk<
  GenerateShareCodeResponse,
  string,
  { rejectValue: string }
>('session/generateShareCode', async (sessionId, { rejectWithValue }) => {
  try {
    return await sessionService.generateShareCode(sessionId);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to generate guest share code');
  }
});

export const joinTableSession = createAsyncThunk<
  JoinSessionResponse,
  JoinSessionPayload,
  { rejectValue: string }
>('session/joinSession', async (payload, { rejectWithValue }) => {
  try {
    return await sessionService.joinSession(payload);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to join table session');
  }
});

export const updateOrderMode = createAsyncThunk<
  CustomerSession,
  SetOrderModePayload,
  { rejectValue: string }
>('session/updateOrderMode', async (payload, { rejectWithValue }) => {
  try {
    return await sessionService.setOrderMode(payload);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to update order mode');
  }
});

export const closeTableSession = createAsyncThunk<
  CloseSessionResponse,
  string,
  { rejectValue: string }
>('session/closeSession', async (sessionId, { rejectWithValue }) => {
  try {
    return await sessionService.closeSession(sessionId);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to close table session');
  }
});
