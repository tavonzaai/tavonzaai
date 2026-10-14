import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TenantOrganization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
}

export interface TenantState {
  organizations: TenantOrganization[];
  organizationId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: TenantState = {
  organizations: [],
  organizationId: null,
  loading: false,
  error: null,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenantLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTenantError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setOrganizations: (state, action: PayloadAction<TenantOrganization[]>) => {
      state.organizations = action.payload;
      if (!state.organizationId && action.payload[0]) {
        state.organizationId = action.payload[0].id;
      }
      if (
        state.organizationId &&
        action.payload.length > 0 &&
        !action.payload.some((org) => org.id === state.organizationId)
      ) {
        state.organizationId = action.payload[0].id;
      }
      state.loading = false;
      state.error = null;
    },
    setOrganizationId: (state, action: PayloadAction<string | null>) => {
      state.organizationId = action.payload;
    },
    clearTenant: () => initialState,
  },
});

export const {
  setTenantLoading,
  setTenantError,
  setOrganizations,
  setOrganizationId,
  clearTenant,
} = tenantSlice.actions;

export default tenantSlice.reducer;
