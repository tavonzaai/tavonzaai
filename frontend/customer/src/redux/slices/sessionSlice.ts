import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  TableSession,
  CustomerSession,
  OrderMode,
  sessionService,
  scanTableQr,
  fetchTableSession,
  generateHostShareCode,
  joinTableSession,
  updateOrderMode,
  closeTableSession,
} from '../features/sessionApi';

export interface SessionState {
  currentSession: TableSession | null;
  customerSession: CustomerSession | null;
  guests: CustomerSession[];
  shareCode: {
    code: string;
    expiresAt: string;
  } | null;
  isNewSession: boolean;
  orderMode: OrderMode;
  isLoading: boolean;
  isGeneratingCode: boolean;
  isJoining: boolean;
  error: string | null;
  shareCodeError: string | null;
}

const initialState: SessionState = {
  currentSession: null,
  customerSession: null,
  guests: [],
  shareCode: null,
  isNewSession: false,
  orderMode: 'individual',
  isLoading: false,
  isGeneratingCode: false,
  isJoining: false,
  error: null,
  shareCodeError: null,
};

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    /**
     * Optimistic or local switch of order mode in UI
     */
    setLocalOrderMode: (state, action: PayloadAction<OrderMode>) => {
      state.orderMode = action.payload;
      if (state.customerSession) {
        state.customerSession.orderMode = action.payload;
      }
    },

    /**
     * Clear active share code (e.g. after countdown expires)
     */
    clearShareCode: (state) => {
      state.shareCode = null;
      state.shareCodeError = null;
    },

    /**
     * Hydrate basic session info from cookies on app load
     */
    hydrateFromCookies: (state) => {
      const cached = sessionService.getCachedSessionInfo();
      if (cached.tableSessionId && !state.currentSession) {
        state.currentSession = {
          id: cached.tableSessionId,
          branchId: cached.branchId || '',
          tableId: cached.tableId || '',
          tableNumber: cached.tableNumber || '',
          status: 'active',
          shareCode: null,
          shareCodeExpiresAt: null,
          openedAt: new Date().toISOString(),
          closedAt: null,
        };
      }
      if (cached.customerSessionId && !state.customerSession) {
        state.customerSession = {
          id: cached.customerSessionId,
          tableSessionId: cached.tableSessionId || '',
          userId: null,
          displayName: null,
          role: cached.role || 'guest',
          orderMode: cached.orderMode,
          joinedAt: new Date().toISOString(),
          leftAt: null,
        };
        state.orderMode = cached.orderMode;
      }
    },

    /**
     * Clear all session state (logout or session ended)
     */
    resetSessionState: () => initialState,

    /**
     * Clear error state
     */
    clearSessionError: (state) => {
      state.error = null;
      state.shareCodeError = null;
    },
  },
  extraReducers: (builder) => {
    // ── 1. scanTableQr ──
    builder
      .addCase(scanTableQr.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(scanTableQr.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload.session;
        state.customerSession = action.payload.customerSession;
        state.isNewSession = action.payload.isNew;
        if (action.payload.customerSession?.orderMode) {
          state.orderMode = action.payload.customerSession.orderMode;
        }
      })
      .addCase(scanTableQr.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to scan table QR code';
      });

    // ── 2. fetchTableSession ──
    builder
      .addCase(fetchTableSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTableSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload.session;
        state.guests = action.payload.customers || [];
      })
      .addCase(fetchTableSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch session info';
      });

    // ── 3. generateHostShareCode ──
    builder
      .addCase(generateHostShareCode.pending, (state) => {
        state.isGeneratingCode = true;
        state.shareCodeError = null;
      })
      .addCase(generateHostShareCode.fulfilled, (state, action) => {
        state.isGeneratingCode = false;
        state.shareCode = {
          code: action.payload.code,
          expiresAt: action.payload.expiresAt,
        };
        if (state.currentSession) {
          state.currentSession.shareCode = action.payload.code;
          state.currentSession.shareCodeExpiresAt = action.payload.expiresAt;
        }
      })
      .addCase(generateHostShareCode.rejected, (state, action) => {
        state.isGeneratingCode = false;
        state.shareCodeError = action.payload || 'Failed to generate share code';
      });

    // ── 4. joinTableSession ──
    builder
      .addCase(joinTableSession.pending, (state) => {
        state.isJoining = true;
        state.error = null;
      })
      .addCase(joinTableSession.fulfilled, (state, action) => {
        state.isJoining = false;
        state.currentSession = action.payload.session;
        state.customerSession = action.payload.customerSession;
        state.orderMode = action.payload.customerSession.orderMode || 'individual';
      })
      .addCase(joinTableSession.rejected, (state, action) => {
        state.isJoining = false;
        state.error = action.payload || 'Failed to join table session';
      });

    // ── 5. updateOrderMode ──
    builder
      .addCase(updateOrderMode.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOrderMode.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.customerSession) {
          state.customerSession.orderMode = action.payload.orderMode;
        }
        state.orderMode = action.payload.orderMode;
      })
      .addCase(updateOrderMode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update order mode';
      });

    // ── 6. closeTableSession ──
    builder
      .addCase(closeTableSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(closeTableSession.fulfilled, (state) => {
        state.isLoading = false;
        if (state.currentSession) {
          state.currentSession.status = 'closed';
        }
      })
      .addCase(closeTableSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to close table session';
      });
  },
});

export const {
  setLocalOrderMode,
  clearShareCode,
  hydrateFromCookies,
  resetSessionState,
  clearSessionError,
} = sessionSlice.actions;

export default sessionSlice.reducer;
