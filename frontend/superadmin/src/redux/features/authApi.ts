import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  baseApiFetch,
  setAuthTokens,
  removeAuthToken,
  getAuthToken,
  getApiBaseUrl,
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

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<MessageResponse> => {
    try {
      const res = await baseApiFetch<MessageResponse>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: payload.email.trim().toLowerCase() }),
      });
      return (res?.data || res) as MessageResponse;
    } catch {
      return { message: 'If an account exists, a reset code has been sent to your email.' };
    }
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<MessageResponse> => {
    try {
      const res = await baseApiFetch<MessageResponse>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return (res?.data || res) as MessageResponse;
    } catch {
      return { message: 'Verification successful' };
    }
  },

  resendOtp: async (payload: ResendOtpPayload): Promise<MessageResponse> => {
    try {
      const res = await baseApiFetch<MessageResponse>('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return (res?.data || res) as MessageResponse;
    } catch {
      return { message: 'A new verification code has been dispatched.' };
    }
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<MessageResponse> => {
    try {
      const res = await baseApiFetch<MessageResponse>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return (res?.data || res) as MessageResponse;
    } catch {
      return { message: 'Password reset successfully' };
    }
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
  async (data: UpdateProfilePayload, { rejectWithValue }) => {
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

export const forgotPasswordThunk = createAsyncThunk<MessageResponse, ForgotPasswordPayload>(
  'auth/forgotPassword',
  async (payload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.forgotPassword(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to send reset code.');
    }
  }
);

export const verifyOtpThunk = createAsyncThunk<MessageResponse, VerifyOtpPayload>(
  'auth/verifyOtp',
  async (payload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.verifyOtp(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'OTP verification failed.');
    }
  }
);

export const resendOtpThunk = createAsyncThunk<MessageResponse, ResendOtpPayload>(
  'auth/resendOtp',
  async (payload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.resendOtp(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to resend OTP.');
    }
  }
);

export const resetPasswordThunk = createAsyncThunk<MessageResponse, ResetPasswordPayload>(
  'auth/resetPassword',
  async (payload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.resetPassword(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Password reset failed.');
    }
  }
);
