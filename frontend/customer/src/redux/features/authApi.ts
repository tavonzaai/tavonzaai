import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch, setAuthToken, removeAuthToken, getAuthToken } from '../api/baseApi';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterCustomerPayload {
  name: string;
  email: string;
  password: string;
  contactNo?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface SetFCMTokenPayload {
  deviceToken: string;
}

export interface RequestEmailChangePayload {
  newEmail: string;
}

export interface ConfirmEmailChangePayload {
  token: string;
}

// ─────────────────────────────────────────
// 📡 Direct Raw API Handlers
// ─────────────────────────────────────────
export const rawAuthApi = {
  login: async (credentials: LoginPayload) => {
    const response = await baseApiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.data?.access_token) {
      setAuthToken(response.data.access_token);
    }
    return response.data;
  },

  register: async (payload: RegisterCustomerPayload) => {
    const response = await baseApiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        role: 'CUSTOMER',
        customer: {},
      }),
    });
    return response.data;
  },

  getMe: async () => {
    try {
      const response = await baseApiFetch('/auth/get-me', {
        method: 'GET',
      });
      return response.data;
    } catch (err) {
      removeAuthToken();
      throw err;
    }
  },

  forgotPassword: async (payload: ForgotPasswordPayload) => {
    const response = await baseApiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { email: payload.email, message: response.message || 'OTP sent successfully' };
  },

  resetPassword: async (payload: ResetPasswordPayload) => {
    const response = await baseApiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.message || 'Password reset successfully';
  },

  changePassword: async (payload: ChangePasswordPayload) => {
    const response = await baseApiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.message || 'Password changed successfully';
  },

  logout: async () => {
    try {
      const response = await baseApiFetch('/auth/logout', {
        method: 'POST',
      });
      return response.data;
    } finally {
      removeAuthToken();
    }
  },

  setFCMToken: async (payload: SetFCMTokenPayload) => {
    const response = await baseApiFetch('/auth/fcm-token', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  requestEmailChange: async (payload: RequestEmailChangePayload) => {
    const response = await baseApiFetch('/auth/change-email-request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.message || 'Confirmation email sent successfully';
  },

  confirmEmailChange: async (payload: ConfirmEmailChangePayload) => {
    const response = await baseApiFetch('/auth/confirm-email-change', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.message || 'Email updated successfully';
  },
};

// ─────────────────────────────────────────
// ⚡ Async Thunks (Feature API Layer)
// ─────────────────────────────────────────

// 1. Login User (Cookies set automatically by backend + client cookie)
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginPayload, { rejectWithValue }) => {
    try {
      const tokenData = await rawAuthApi.login(credentials);
      // Fetch full user profile immediately
      try {
        const userProfile = await rawAuthApi.getMe();
        return { ...tokenData, user: userProfile };
      } catch {
        return tokenData;
      }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed. Please check your credentials.');
    }
  }
);

// 2. Register Customer
export const registerCustomer = createAsyncThunk(
  'auth/registerCustomer',
  async (payload: RegisterCustomerPayload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.register(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed. Please try again.');
    }
  }
);

// 3. Get Current User Profile (Cookies authenticated)
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
      return rejectWithValue(err.message || 'Session expired.');
    }
  },
  {
    condition: (_, { getState }) => {
      const state = (getState() as any)?.auth;
      // If already loading getMe or if there's no auth token in cookies, skip call
      if (state?.loading) {
        return false;
      }
      if (!getAuthToken()) {
        return false;
      }
      return true;
    },
  }
);

// 4. Forgot Password (Request OTP)
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: ForgotPasswordPayload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.forgotPassword(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to send OTP code.');
    }
  }
);

// 5. Reset Password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (payload: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.resetPassword(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Password reset failed. Check your OTP.');
    }
  }
);

// 6. Change Password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload: ChangePasswordPayload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.changePassword(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Change password failed.');
    }
  }
);

// 7. Logout User (Clears cookies on backend)
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await rawAuthApi.logout();
  } catch (e) {
    // Ignore logout errors
  }
});

// 8. Set FCM Token (Push notifications)
export const setFCMToken = createAsyncThunk(
  'auth/setFCMToken',
  async (payload: SetFCMTokenPayload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.setFCMToken(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update FCM token.');
    }
  }
);

// 9. Request Email Change
export const requestEmailChange = createAsyncThunk(
  'auth/requestEmailChange',
  async (payload: RequestEmailChangePayload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.requestEmailChange(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to request email change.');
    }
  }
);

// 10. Confirm Email Change
export const confirmEmailChange = createAsyncThunk(
  'auth/confirmEmailChange',
  async (payload: ConfirmEmailChangePayload, { rejectWithValue }) => {
    try {
      return await rawAuthApi.confirmEmailChange(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to confirm email change.');
    }
  }
);
