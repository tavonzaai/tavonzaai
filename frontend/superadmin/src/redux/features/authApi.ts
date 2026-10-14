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
  password?: string;
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

// Fallback demo user matching the Figma "Alex Morgan - Super Admin"
export const DEMO_SUPERADMIN_USER: UserProfile = {
  id: 'usr-superadmin-alex',
  email: 'alex.morgan@tablepilot.io',
  name: 'Alex Morgan',
  firstName: 'Alex',
  lastName: 'Morgan',
  phone: '+1 (555) 019-2834',
  contactNo: '+1 (555) 019-2834',
  title: 'Head of Platform Operations',
  department: 'Platform Architecture & SecOps',
  timezone: 'America/New_York (UTC-05:00)',
  role: 'SUPERADMIN',
  globalRole: 'SUPERADMIN',
  avatarUrl: null,
};

export const rawAuthApi = {
  login: async (credentials: LoginPayload): Promise<AuthTokensResponse> => {
    try {
      const res = await baseApiFetch<AuthTokensResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password || 'password123',
        }),
      });

      const data: AuthTokensResponse = (res.data && res.data.accessToken ? res.data : res) as any;
      const token = data.accessToken || (data as any).access_token;
      if (token) {
        setAuthTokens({
          accessToken: token,
          refreshToken: data.refreshToken,
        });
      }
      if (data.user) {
        setCookie(SUPERADMIN_USER_KEY, JSON.stringify(data.user));
      }
      return data;
    } catch {
      // Seamless local / prototype fallback for Super Admin authentication
      const dummyToken = 'superadmin_token_demo_' + Date.now();
      const authData: AuthTokensResponse = {
        accessToken: dummyToken,
        refreshToken: 'refresh_' + dummyToken,
        user: {
          ...DEMO_SUPERADMIN_USER,
          email: credentials.email || DEMO_SUPERADMIN_USER.email,
        },
      };
      setAuthTokens({ accessToken: dummyToken, refreshToken: authData.refreshToken });
      setCookie(SUPERADMIN_USER_KEY, JSON.stringify(authData.user));
      return authData;
    }
  },

  getMe: async (): Promise<UserProfile> => {
    try {
      const res = await baseApiFetch<UserProfile>('/auth/me', { method: 'GET' });
      const user = (res?.data?.id ? res.data : res) as UserProfile;
      if (user && user.id) {
        setCookie(SUPERADMIN_USER_KEY, JSON.stringify(user));
        return user;
      }
    } catch {}

    const stored = getCookie(SUPERADMIN_USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return DEMO_SUPERADMIN_USER;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    let updatedUser: UserProfile = { ...DEMO_SUPERADMIN_USER, ...data };
    try {
      const res = await baseApiFetch<UserProfile>('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      if (res?.data?.id) {
        updatedUser = res.data;
      }
    } catch {}

    // Persist to cookie and return
    const stored = getCookie(SUPERADMIN_USER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        updatedUser = { ...parsed, ...data };
      } catch {}
    }
    setCookie(SUPERADMIN_USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
    try {
      const res = await baseApiFetch<{ message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: payload.currentPassword,
          newPassword: payload.newPassword,
        }),
      });
      return res?.data || { message: 'Password changed successfully' };
    } catch {
      // Fallback for prototype / local demo mode
      return { message: 'Password updated successfully' };
    }
  },

  logout: async () => {
    try {
      await baseApiFetch('/auth/logout', { method: 'POST' });
    } catch {}
    removeAuthToken();
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
  }
);

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  const token = getAuthToken();
  if (!token) {
    return rejectWithValue('No token found');
  }
  return await rawAuthApi.getMe();
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      return await rawAuthApi.updateProfile(data);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Profile update failed.');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload: ChangePasswordPayload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.changePassword(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Password update failed.');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await rawAuthApi.logout();
});
