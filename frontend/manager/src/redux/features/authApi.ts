import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  baseApiFetch,
  setAuthTokens,
  removeAuthToken,
  setCookie,
  getCookie,
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
  branchId?: string | null;
  branchName?: string | null;
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

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

// ─── 📡 Raw API Handlers (Exact Backend Endpoints) ───────────────────────────

export const rawAuthApi = {
  /** POST /auth/login — Authenticate branch manager / user */
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
      setCookie('branch_manager_user', JSON.stringify(data.user));
      if (data.user.branchId) {
        setCookie('tavonza_branch_id', data.user.branchId);
        setCookie('branch_id', data.user.branchId);
      }
    }

    return data;
  },

  /** GET /auth/me or /users/me — Fetch current authenticated user */
  getMe: async (): Promise<UserProfile> => {
    let res: any;
    try {
      res = await baseApiFetch<UserProfile>('/auth/me');
    } catch {
      res = await baseApiFetch<UserProfile>('/users/me');
    }

    const user: UserProfile = (res.data || res.user || res) as any;
    if (user) {
      user.name =
        user.name ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.email;
      setCookie('branch_manager_user', JSON.stringify(user));
    }
    return user;
  },

  /** POST /auth/logout — Invalidate backend session */
  logout: async (): Promise<MessageResponse> => {
    try {
      await baseApiFetch('/auth/logout', { method: 'POST' });
    } catch {}
    removeAuthToken();
    return { message: 'Logged out successfully' };
  },

  /** POST /auth/verify-otp */
  verifyOtp: async (payload: VerifyOtpPayload): Promise<MessageResponse> => {
    const res = await baseApiFetch<MessageResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res.data || res) as MessageResponse;
  },

  /** POST /auth/resend-otp */
  resendOtp: async (payload: ResendOtpPayload): Promise<MessageResponse> => {
    const res = await baseApiFetch<MessageResponse>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res.data || res) as MessageResponse;
  },

  /** POST /auth/forgot-password */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<MessageResponse> => {
    const res = await baseApiFetch<MessageResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: payload.email.trim().toLowerCase() }),
    });
    return (res.data || res) as MessageResponse;
  },

  /** POST /auth/reset-password */
  resetPassword: async (payload: ResetPasswordPayload): Promise<MessageResponse> => {
    const res = await baseApiFetch<MessageResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res.data || res) as MessageResponse;
  },

  /** POST /auth/change-password */
  changePassword: async (payload: ChangePasswordPayload): Promise<MessageResponse> => {
    const res = await baseApiFetch<MessageResponse>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res.data || res) as MessageResponse;
  },
};

// ─── 🔄 Redux Async Thunks ─────────────────────────────────────────────────────

export const loginUser = createAsyncThunk<AuthTokensResponse, LoginPayload>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await rawAuthApi.login(credentials);
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Login failed. Please check your credentials.');
    }
  }
);

export const getMe = createAsyncThunk<UserProfile, void>(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      return await rawAuthApi.getMe();
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to authenticate session.');
    }
  }
);

export const logoutUser = createAsyncThunk<MessageResponse, void>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      return await rawAuthApi.logout();
    } catch (err: any) {
      removeAuthToken();
      return rejectWithValue(err?.message || 'Logout failed.');
    }
  }
);

export const verifyOtpThunk = createAsyncThunk<MessageResponse, VerifyOtpPayload>(
  'auth/verifyOtp',
  async (payload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.verifyOtp(payload);
    } catch (err: any) {
      return rejectWithValue(err?.message || 'OTP verification failed.');
    }
  }
);

export const resendOtpThunk = createAsyncThunk<MessageResponse, ResendOtpPayload>(
  'auth/resendOtp',
  async (payload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.resendOtp(payload);
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to resend OTP.');
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk<MessageResponse, ForgotPasswordPayload>(
  'auth/forgotPassword',
  async (payload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.forgotPassword(payload);
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to send reset email.');
    }
  }
);

export const resetPasswordThunk = createAsyncThunk<MessageResponse, ResetPasswordPayload>(
  'auth/resetPassword',
  async (payload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.resetPassword(payload);
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Password reset failed.');
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  'auth/changePassword',
  async (
    payload: {
      email?: string;
      code?: string;
      otp?: string;
      newPassword?: string;
      newPass?: string;
      oldPassword?: string;
    },
    { rejectWithValue, getState }
  ) => {
    try {
      const state: any = getState();
      const userEmail = payload.email || state?.auth?.user?.email;

      const otpCode = payload.code || payload.otp;
      const newPass = payload.newPassword || payload.newPass;

      if (!userEmail) {
        throw new Error('User email not found. Please provide your email address.');
      }

      // If OTP code is provided, execute backend POST /auth/reset-password
      if (otpCode && newPass) {
        const res = await rawAuthApi.resetPassword({
          email: userEmail.trim().toLowerCase(),
          code: otpCode.trim(),
          newPassword: newPass.trim(),
        });
        return res;
      }

      // If no OTP code provided, trigger backend POST /auth/forgot-password to send OTP to email
      const res = await rawAuthApi.forgotPassword({ email: userEmail.trim().toLowerCase() });
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Password change failed.');
    }
  }
);
