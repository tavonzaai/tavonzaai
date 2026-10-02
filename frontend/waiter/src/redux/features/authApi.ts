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
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string | null;
  contactNo?: string | null;
  role: string;
  permissions?: string[];
  scopes?: any[];
  organizationId?: string | null;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt?: string;
  assignments?: any[];
  staffId?: string | null;
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

export interface VerifyOtpPayload {
  email: string;
  code: string;
  type?: 'email_verification' | 'phone_verification' | 'password_reset' | string;
}

export interface ResendOtpPayload {
  email: string;
  type?: 'email_verification' | 'phone_verification' | 'password_reset' | string;
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
  /** POST /auth/login — Authenticate cashier / user */
  login: async (credentials: LoginPayload): Promise<AuthTokensResponse> => {
    const res = await baseApiFetch<AuthTokensResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
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
      data.user.name =
        data.user.name ||
        `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() ||
        data.user.email;
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
        type: payload.type || 'password_reset',
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
        type: payload.type || 'password_reset',
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
    let res: any;
    try {
      res = await baseApiFetch<UserProfile>('/auth/me', {
        method: 'GET',
      });
    } catch (err: any) {
      if (err?.message && (err.message.includes('404') || err.message.includes('Cannot GET'))) {
        res = await baseApiFetch<UserProfile>('/auth/get-me', {
          method: 'GET',
        });
      } else {
        throw err;
      }
    }
    const user: UserProfile = (res.data && res.data.id ? res.data : res) as any;
    if (user) {
      user.name =
        user.name ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.email;
    }
    return user;
  },

  /** GET /me/assignments — Retrieve staff assignments */
  getMyAssignments: async () => {
    try {
      const response = await baseApiFetch('/me/assignments', {
        method: 'GET',
      });
      return response.data || response;
    } catch {
      return { staffId: null, assignments: [] };
    }
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
    const accessToken = data.accessToken || (data as any).access_token;
    if (accessToken) {
      setAuthTokens({
        accessToken,
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

/** 1. Login User */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginPayload, { rejectWithValue }) => {
    try {
      const authData = await rawAuthApi.login(credentials);
      let userProfile: any = authData.user || null;
      try {
        const profile = await rawAuthApi.getMe();
        if (profile) {
          userProfile = { ...userProfile, ...profile };
        }
        try {
          const assignmentsRes = await rawAuthApi.getMyAssignments();
          userProfile = {
            ...userProfile,
            staffId: assignmentsRes?.staffId,
            assignments: assignmentsRes?.assignments || [],
          };
        } catch {}
      } catch {
        // Fallback to user profile returned in authData
      }
      return { ...authData, user: userProfile };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed. Please check your credentials.');
    }
  }
);

/** 2. Verify OTP */
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

/** 3. Resend OTP */
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

/** 4. Forgot Password */
export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: ForgotPasswordPayload, { rejectWithValue }) => {
    try {
      const res = await rawAuthApi.forgotPassword(payload);
      return { email: payload.email, message: res.message || 'Password reset OTP sent to your email.' };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to request password reset code.');
    }
  }
);

/** 5. Reset Password */
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

/** 6. Get Current User Profile */
export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    const token = getAuthToken();
    if (!token) {
      return rejectWithValue('No authentication token found in cookies.');
    }
    try {
      let userProfile = await rawAuthApi.getMe();
      try {
        const assignmentsRes = await rawAuthApi.getMyAssignments();
        userProfile = {
          ...userProfile,
          staffId: assignmentsRes?.staffId,
          assignments: assignmentsRes?.assignments || [],
        };
      } catch {}
      return userProfile;
    } catch (err: any) {
      removeAuthToken();
      return rejectWithValue(err.message || 'Session expired.');
    }
  }
);

/** 7. Logout User */
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await rawAuthApi.logout();
  } catch {
    removeAuthToken();
  }
});

/** 8. Change Password */
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

// Backward-compatibility aliases
export const verifyOtp = verifyOtpThunk;
export const resendOtp = resendOtpThunk;
export const forgotPassword = forgotPasswordThunk;
export const resetPassword = resetPasswordThunk;
