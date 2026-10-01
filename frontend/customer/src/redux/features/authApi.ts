import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  baseApiFetch,
  setAuthTokens,
  removeAuthToken,
  getAuthToken,
  getRefreshToken,
} from '../api/baseApi';

// ─── Types & Payloads ──────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  phone?: string | null;
  contactNo?: string | null;
  role: string;
  permissions?: string[];
  scopes?: any[];
  organizationId?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
  type: 'email_verification' | 'phone_verification' | 'password_reset';
}

export interface ResendOtpPayload {
  email: string;
  type: 'email_verification' | 'phone_verification' | 'password_reset';
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

// ─── 📡 Raw API Handlers (Exact Backend Endpoints) ───────────────────────────

export const rawAuthApi = {
  /** POST /auth/register — Create customer account */
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const res = await baseApiFetch<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone?.trim() || undefined,
        password: payload.password,
      }),
    });
    return res.data || res;
  },

  /** POST /auth/login — Authenticate customer */
  login: async (credentials: LoginPayload): Promise<AuthTokensResponse> => {
    const res = await baseApiFetch<AuthTokensResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      }),
    });

    const data: AuthTokensResponse = (res.data && res.data.accessToken ? res.data : res) as any;
    if (data.accessToken) {
      setAuthTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    }

    if (data.user) {
      data.user.name = `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || data.user.email;
    }

    return data;
  },

  /** POST /auth/verify-otp — Verify 5-digit code */
  verifyOtp: async (payload: VerifyOtpPayload): Promise<MessageResponse> => {
    const res = await baseApiFetch<MessageResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        code: payload.code.trim(),
        type: payload.type,
      }),
    });
    return res.data || res;
  },

  /** POST /auth/resend-otp — Resend 5-digit verification code */
  resendOtp: async (payload: ResendOtpPayload): Promise<MessageResponse> => {
    const res = await baseApiFetch<MessageResponse>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        type: payload.type,
      }),
    });
    return res.data || res;
  },

  /** POST /auth/forgot-password — Request password reset code */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<MessageResponse> => {
    const res = await baseApiFetch<MessageResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
      }),
    });
    return res.data || res;
  },

  /** POST /auth/reset-password — Set new password using 5-digit OTP */
  resetPassword: async (payload: ResetPasswordPayload): Promise<MessageResponse> => {
    const res = await baseApiFetch<MessageResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        code: payload.code.trim(),
        newPassword: payload.newPassword,
      }),
    });
    return res.data || res;
  },

  /** GET /auth/me — Retrieve current profile */
  getMe: async (): Promise<UserProfile> => {
    const res = await baseApiFetch<UserProfile>('/auth/me', {
      method: 'GET',
    });
    const user: UserProfile = (res.data && res.data.id ? res.data : res) as any;
    if (user) {
      user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    }
    return user;
  },

  /** POST /auth/refresh — Refresh access token */
  refresh: async (refreshTokenOverride?: string): Promise<AuthTokensResponse> => {
    const token = refreshTokenOverride || getRefreshToken();
    if (!token) throw new Error('No refresh token available');

    const res = await baseApiFetch<AuthTokensResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: token }),
    });

    const data: AuthTokensResponse = (res.data && res.data.accessToken ? res.data : res) as any;
    if (data.accessToken) {
      setAuthTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    }
    return data;
  },

  /** POST /auth/logout — Invalidate session */
  logout: async (): Promise<MessageResponse> => {
    try {
      const res = await baseApiFetch<MessageResponse>('/auth/logout', {
        method: 'POST',
      });
      return res.data || res;
    } finally {
      removeAuthToken();
    }
  },
};

// ─── ⚡ Redux Async Thunks ────────────────────────────────────────────────────

/** 1. Register Customer */
export const registerCustomer = createAsyncThunk(
  'auth/registerCustomer',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.register(payload);
    } catch (err: any) {
      const status = err?.status || err?.statusCode || (err?.isConflict ? 409 : 500);
      const isConflict = status === 409 || String(err?.message || '').toLowerCase().includes('already exists');
      const isTimeout = status === 504 || String(err?.message || '').toLowerCase().includes('timeout');
      return rejectWithValue({
        message: err?.message || 'Registration failed. Please check your information.',
        status: isConflict ? 409 : status,
        statusCode: isConflict ? 409 : status,
        isConflict,
        isTimeout,
      });
    }
  }
);

/** 2. Login User */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginPayload, { rejectWithValue }) => {
    try {
      const authData = await rawAuthApi.login(credentials);
      return authData;
    } catch (err: any) {
      const status = err?.status || err?.statusCode || 401;
      const isTimeout = status === 504 || String(err?.message || '').toLowerCase().includes('timeout');
      return rejectWithValue({
        message: err?.message || 'Login failed. Please check your credentials.',
        status,
        statusCode: status,
        isTimeout,
      });
    }
  }
);

/** 3. Verify OTP */
export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async (payload: VerifyOtpPayload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.verifyOtp(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Verification failed. Invalid or expired code.');
    }
  }
);

/** 4. Resend OTP */
export const resendOtpThunk = createAsyncThunk(
  'auth/resendOtp',
  async (payload: ResendOtpPayload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.resendOtp(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to resend verification code.');
    }
  }
);

/** 5. Forgot Password */
export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: ForgotPasswordPayload, { rejectWithValue }) => {
    try {
      const res = await rawAuthApi.forgotPassword(payload);
      return { email: payload.email, message: res.message };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to request password reset code.');
    }
  }
);

/** 6. Reset Password */
export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (payload: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.resetPassword(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Password reset failed. Check your OTP and password requirements.');
    }
  }
);

/** 7. Get Current User Profile */
export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    const token = getAuthToken();
    if (!token) {
      return rejectWithValue('No authentication token found in cookies.');
    }
    try {
      return await rawAuthApi.getMe();
    } catch (err: any) {
      removeAuthToken();
      return rejectWithValue(err.message || 'Session expired.');
    }
  },
  {
    condition: (_, { getState }) => {
      const state = (getState() as any)?.auth;
      if (state?.loading) return false;
      if (!getAuthToken()) return false;
      return true;
    },
  }
);

/** 8. Logout User */
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await rawAuthApi.logout();
  } catch {
    removeAuthToken();
  }
});

// Backward-compatibility aliases for existing imports
export const forgotPassword = forgotPasswordThunk;
export const resetPassword = resetPasswordThunk;

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload: { oldPassword?: string; prevPass?: string; newPassword?: string; newPass?: string }, { rejectWithValue }) => {
    try {
      const res = await baseApiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.message || 'Password changed successfully';
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to change password.');
    }
  }
);

