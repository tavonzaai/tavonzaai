import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch, getApiBaseUrl, getAuthToken } from '../api/baseApi';

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
   * Step 1: POST /storage/upload (if avatar File is provided)
   * Step 2: PATCH /users/me (update profile attributes and avatar URL)
   */
  updateMe: async (payload: UpdateMePayload): Promise<UserResponse> => {
    let uploadedAvatarUrl: string | undefined = undefined;

    // Step 1: If an avatar File object is provided, upload to POST /storage/upload first
    if (payload.avatar instanceof File) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', payload.avatar);

      const API_BASE_URL = getApiBaseUrl();
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const uploadRes = await fetch(`${API_BASE_URL}/storage/upload`, {
        method: 'POST',
        headers,
        body: uploadFormData,
        credentials: 'include',
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadJson.message || 'Failed to upload profile image to storage.');
      }

      uploadedAvatarUrl =
        uploadJson.url ||
        uploadJson.data?.url ||
        uploadJson.location ||
        uploadJson.fileUrl ||
        uploadJson.data?.fileUrl ||
        uploadJson.path ||
        uploadJson.data?.path ||
        uploadJson.key;
    } else if (typeof payload.avatar === 'string') {
      uploadedAvatarUrl = payload.avatar;
    }

    // Step 2: Call PATCH /users/me with updated fields and avatar URL
    const body: Record<string, any> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.contactNo !== undefined) body.contactNo = payload.contactNo;
    if (uploadedAvatarUrl) body.avatar = uploadedAvatarUrl;

    const response = await baseApiFetch<UserResponse>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data || (response as any);
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
