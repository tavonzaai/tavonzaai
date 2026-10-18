import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  baseApiFetch,
  setAuthTokens,
  removeAuthToken,
  getAuthToken,
  setCookie,
  getCookie,
  SUPERADMIN_USER_KEY,
} from '../api/baseApi';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  contactNo?: string;
  title?: string;
  department?: string;
  timezone?: string;
  role: string;
  globalRole?: string;
  avatar?: string | null;
  avatarUrl?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserProfile;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export const rawAuthApi = {
  /** Real API login only — no demo / dummy token fallbacks. */
  login: async (credentials: LoginPayload): Promise<AuthTokensResponse> => {
    if (!credentials.password?.trim()) {
      throw new Error('Password is required');
    }

    const res = await baseApiFetch<AuthTokensResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
        client: 'superadmin',
      }),
    });

    const data: AuthTokensResponse = (res.data && (res.data as any).accessToken ? res.data : res) as any;
    const token = data.accessToken || (data as any).access_token;
    if (!token) {
      throw new Error('Login did not return an access token');
    }

    setAuthTokens({ accessToken: token });
    if (data.user) {
      setCookie(SUPERADMIN_USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  getMe: async (): Promise<UserProfile> => {
    const res = await baseApiFetch<UserProfile>('/auth/me', { method: 'GET' });
    const user = (res?.data && (res.data as any).id ? res.data : res) as UserProfile;
    if (!user?.id) {
      throw new Error('Unable to load profile');
    }
    setCookie(SUPERADMIN_USER_KEY, JSON.stringify(user));
    return user;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await baseApiFetch<UserProfile>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    const updated = (res?.data && (res.data as any).id ? res.data : res) as UserProfile;
    if (!updated?.id) {
      throw new Error('Profile update failed');
    }
    setCookie(SUPERADMIN_USER_KEY, JSON.stringify(updated));
    return updated;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
    const res = await baseApiFetch<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      }),
    });
    return (res?.data as any) || { message: 'Password changed successfully' };
  },

  refresh: async (): Promise<AuthTokensResponse> => {
    const res = await baseApiFetch<AuthTokensResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ client: 'superadmin' }),
    });
    const data: AuthTokensResponse = (res.data && (res.data as any).accessToken ? res.data : res) as any;
    const accessToken = data.accessToken || (data as any).access_token;
    if (!accessToken) {
      throw new Error('Refresh did not return an access token');
    }
    setAuthTokens({ accessToken });
    return data;
  },

  logout: async () => {
    try {
      await baseApiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ client: 'superadmin' }),
      });
    } finally {
      removeAuthToken();
    }
  },
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginPayload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.login(credentials);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed.');
    }
  },
);

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  const token = getAuthToken();
  if (!token) {
    return rejectWithValue('No token found');
  }
  try {
    return await rawAuthApi.getMe();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to load profile');
  }
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      return await rawAuthApi.updateProfile(data);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Profile update failed.');
    }
  },
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload: ChangePasswordPayload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.changePassword(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Password update failed.');
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await rawAuthApi.logout();
});
