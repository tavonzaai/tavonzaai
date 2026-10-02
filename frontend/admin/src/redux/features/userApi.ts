import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch, getApiBaseUrl } from '../api/baseApi';

// ─────────────────────────────────────────
// 📋 Data Models & Interfaces (Mirroring Backend DTOs)
// ─────────────────────────────────────────

export interface AddressData {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface CustomerData {
  loyaltyPoints?: number;
  defaultAddress?: AddressData;
  preferences?: Record<string, any>;
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  password: string;
  contactNo?: string;
  role?: 'CUSTOMER' | string;
  avatar?: string;
  customer?: CustomerData;
}

export interface UpdateMePayload {
  name?: string;
  contactNo?: string;
  avatar?: string | File;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  contactNo?: string;
  avatar?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  contactNo?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'RESTAURANT_OWNER' | 'STAFF' | 'CUSTOMER' | string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    userId: string;
    loyaltyPoints?: number;
    defaultAddress?: AddressData;
    preferences?: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface UsersListResponse {
  data: UserResponse[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage?: number;
  };
}

// ─────────────────────────────────────────
// 📡 Raw User API Handlers
// ─────────────────────────────────────────
export const rawUserApi = {
  /**
   * 1. Create Customer User (Public)
   * POST /api/v1/users/create-customer
   */
  createCustomer: async (payload: CreateCustomerPayload): Promise<UserResponse> => {
    const response = await baseApiFetch<UserResponse>('/users/create-customer', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        role: 'CUSTOMER',
        customer: payload.customer || {},
      }),
    });
    return response.data;
  },

  /**
   * 2. Update the Current User Profile (Authenticated)
   * PATCH /api/v1/users/me
   */
  updateMe: async (payload: UpdateMePayload): Promise<UserResponse> => {
    // If an avatar File object is provided, send as multipart/form-data
    if (payload.avatar instanceof File) {
      const formData = new FormData();
      formData.append('avatar', payload.avatar);
      const dataPayload: Record<string, any> = {};
      if (payload.name !== undefined) dataPayload.name = payload.name;
      if (payload.contactNo !== undefined) dataPayload.contactNo = payload.contactNo;
      formData.append('data', JSON.stringify(dataPayload));

      const API_BASE_URL = getApiBaseUrl();
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to update profile');
      }
      return json.data;
    }

    // Standard JSON payload
    const body: Record<string, any> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.contactNo !== undefined) body.contactNo = payload.contactNo;

    const response = await baseApiFetch<UserResponse>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data;
  },

  /**
   * 3. Create Admin User (SUPER_ADMIN only)
   * POST /api/v1/users/create-admin
   */
  createAdmin: async (payload: CreateAdminPayload): Promise<any> => {
    const response = await baseApiFetch('/users/create-admin', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  /**
   * 4. Get a specific user by email or ID (ADMIN only)
   * GET /api/v1/users/:id
   */
  getUserById: async (id: string): Promise<UserResponse> => {
    const response = await baseApiFetch<UserResponse>(`/users/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
    return response.data;
  },

  /**
   * 5. Toggle user status (Active/Inactive) (ADMIN / RESTAURANT_OWNER)
   * PATCH /api/v1/users/status/:id
   */
  changeStatus: async (id: string): Promise<UserResponse> => {
    const response = await baseApiFetch<UserResponse>(`/users/status/${encodeURIComponent(id)}`, {
      method: 'PATCH',
    });
    return response.data;
  },

  /**
   * 6. Find all Users (Public / Admin)
   * GET /api/v1/users
   */
  getUsers: async (query?: GetUsersQuery): Promise<UsersListResponse> => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', String(query.page));
    if (query?.limit) params.append('limit', String(query.limit));
    if (query?.search) params.append('search', query.search);
    if (query?.role) params.append('role', query.role);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await baseApiFetch<UserResponse[]>(`/users${queryString}`, {
      method: 'GET',
    });
    return { data: response.data, meta: (response as any).meta };
  },
};

// ─────────────────────────────────────────
// ⚡ Redux Async Thunks
// ─────────────────────────────────────────

// 1. Create Customer Account (Customer Self-Registration)
export const createCustomerUser = createAsyncThunk(
  'user/createCustomerUser',
  async (payload: CreateCustomerPayload, { rejectWithValue }) => {
    try {
      return await rawUserApi.createCustomer(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create customer account.');
    }
  }
);

// 2. Update Profile (Current User self-service)
export const updateMe = createAsyncThunk(
  'user/updateMe',
  async (payload: UpdateMePayload, { rejectWithValue }) => {
    try {
      return await rawUserApi.updateMe(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update profile.');
    }
  }
);

// 3. Create Admin User (SUPER_ADMIN)
export const createAdminUser = createAsyncThunk(
  'user/createAdminUser',
  async (payload: CreateAdminPayload, { rejectWithValue }) => {
    try {
      return await rawUserApi.createAdmin(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create admin user.');
    }
  }
);

// 4. Get User Details
export const getUserById = createAsyncThunk(
  'user/getUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await rawUserApi.getUserById(id);
    } catch (err: any) {
      return rejectWithValue(err.message || 'User not found.');
    }
  }
);

// 5. Change User Status
export const changeUserStatus = createAsyncThunk(
  'user/changeUserStatus',
  async (id: string, { rejectWithValue }) => {
    try {
      return await rawUserApi.changeStatus(id);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to change user status.');
    }
  }
);

// 6. Get Users List
export const getUsersList = createAsyncThunk(
  'user/getUsersList',
  async (query: GetUsersQuery | undefined, { rejectWithValue }) => {
    try {
      return await rawUserApi.getUsers(query);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to retrieve users.');
    }
  }
);
