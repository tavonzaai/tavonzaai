import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  baseApiFetch,
  setAuthTokens,
  removeAuthToken,
  getAuthToken,
  getRefreshToken,
  rtkBaseApi,
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
  globalRole?: string;
  avatar?: string | null;
  avatarUrl?: string | null;
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
  currentPassword?: string;
  oldPassword?: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
  devOtp?: string;
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

  /** POST /auth/change-password — Direct authenticated change password */
  changePassword: async (payload: ChangePasswordPayload): Promise<MessageResponse> => {
    const res = await baseApiFetch<MessageResponse>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: payload.currentPassword || payload.oldPassword,
        oldPassword: payload.oldPassword || payload.currentPassword,
        newPassword: payload.newPassword,
      }),
    });
    return res.data || res;
  },

  /** GET /users/me — Retrieve current profile */
  getMe: async (): Promise<UserProfile> => {
    let res: any;
    try {
      res = await baseApiFetch<UserProfile>('/users/me', {
        method: 'GET',
      });
    } catch (err: any) {
      if (err?.status === 401 || err?.statusCode === 401) {
        throw err;
      }
      try {
        res = await baseApiFetch<UserProfile>('/auth/me', {
          method: 'GET',
        });
      } catch (err2: any) {
        if (err2?.status === 401 || err2?.statusCode === 401) {
          throw err2;
        }
        res = await baseApiFetch<UserProfile>('/auth/get-me', {
          method: 'GET',
        });
      }
    }
    const user: UserProfile = (res?.data && res?.data?.id ? res.data : res) as any;
    if (user) {
      user.name =
        user.name ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.email;
      if (user.avatar && !user.avatarUrl) {
        user.avatarUrl = user.avatar;
      }
    }
    return user;
  },

  /** GET /me/assignments — Retrieve staff assignments */
  getMyAssignments: async () => {
    try {
      let response: any;
      try {
        response = await baseApiFetch('/me/assignments', {
          method: 'GET',
        });
      } catch {
        response = await baseApiFetch('/users/me/assignments', {
          method: 'GET',
        });
      }
      return response?.data || response;
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
          userProfile = {
            ...userProfile,
            ...profile,
            organizationId: profile.organizationId || userProfile.organizationId,
            globalRole: profile.globalRole || userProfile.globalRole,
          };
        }
        try {
          const assignmentsRes = await rawAuthApi.getMyAssignments();
          const mergedAssignments =
            Array.isArray(assignmentsRes?.assignments) && assignmentsRes.assignments.length > 0
              ? assignmentsRes.assignments
              : (userProfile?.assignments || []);

          userProfile = {
            ...userProfile,
            staffId: assignmentsRes?.staffId || userProfile?.staffId || null,
            assignments: mergedAssignments,
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
        const mergedAssignments =
          Array.isArray(assignmentsRes?.assignments) && assignmentsRes.assignments.length > 0
            ? assignmentsRes.assignments
            : (userProfile?.assignments || []);

        userProfile = {
          ...userProfile,
          staffId: assignmentsRes?.staffId || userProfile?.staffId || null,
          assignments: mergedAssignments,
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

/** 8. Change Password (Direct Authenticated POST /auth/change-password) */
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    payload: {
      currentPassword?: string;
      oldPassword?: string;
      newPassword?: string;
      newPass?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const currentPass = payload.currentPassword || payload.oldPassword;
      const nextPass = payload.newPassword || payload.newPass;

      if (!currentPass) {
        throw new Error('Current password is required.');
      }
      if (!nextPass) {
        throw new Error('New password is required.');
      }
      if (nextPass.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }

      const res = await rawAuthApi.changePassword({
        currentPassword: currentPass,
        newPassword: nextPass,
      });
      return res.message || 'Password changed successfully!';
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update password.');
    }
  }
);

// ─── 🔄 RTK Query Endpoints ──────────────────────────────────────────────────

export const authApi = rtkBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    loginMutation: builder.mutation<AuthTokensResponse, LoginPayload>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: {
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        },
      }),
      invalidatesTags: ['AUTH', 'USER'],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = data.accessToken || (data as any).access_token;
          if (token) {
            setAuthTokens({
              accessToken: token,
              refreshToken: data.refreshToken,
            });
          }
        } catch {}
      },
    }),
    logoutMutation: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['AUTH', 'USER'],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          removeAuthToken();
        }
      },
    }),
    getMeQuery: builder.query<UserProfile, void>({
      query: () => '/users/me',
      providesTags: ['USER', 'AUTH'],
    }),
    changePasswordMutation: builder.mutation<MessageResponse, ChangePasswordPayload>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: {
          currentPassword: body.currentPassword || body.oldPassword,
          oldPassword: body.oldPassword || body.currentPassword,
          newPassword: body.newPassword,
        },
      }),
    }),
    forgotPasswordMutation: builder.mutation<MessageResponse, ForgotPasswordPayload>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email: body.email.trim().toLowerCase() },
      }),
    }),
    verifyOtpMutation: builder.mutation<MessageResponse, VerifyOtpPayload>({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: {
          email: body.email.trim().toLowerCase(),
          code: body.code.trim(),
          type: body.type || 'password_reset',
        },
      }),
    }),
    resetPasswordMutation: builder.mutation<MessageResponse, ResetPasswordPayload>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: {
          email: body.email.trim().toLowerCase(),
          code: body.code.trim(),
          newPassword: body.newPassword,
        },
      }),
    }),
    resendOtpMutation: builder.mutation<MessageResponse, ResendOtpPayload>({
      query: (body) => ({
        url: '/auth/resend-otp',
        method: 'POST',
        body: {
          email: body.email.trim().toLowerCase(),
          type: body.type || 'password_reset',
        },
      }),
    }),
  }),
});

export const {
  useLoginMutationMutation: useLoginMutation,
  useLogoutMutationMutation: useLogoutMutation,
  useGetMeQueryQuery: useGetMeQuery,
  useChangePasswordMutationMutation: useChangePasswordMutation,
  useForgotPasswordMutationMutation: useForgotPasswordMutation,
  useVerifyOtpMutationMutation: useVerifyOtpMutation,
  useResetPasswordMutationMutation: useResetPasswordMutation,
  useResendOtpMutationMutation: useResendOtpMutation,
} = authApi;

// Backward-compatibility aliases
export const changePasswordThunk = changePassword;
export const verifyOtp = verifyOtpThunk;
export const resendOtp = resendOtpThunk;
export const forgotPassword = forgotPasswordThunk;
export const resetPassword = resetPasswordThunk;
