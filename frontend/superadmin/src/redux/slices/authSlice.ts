import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  loginUser,
  getMe,
  logoutUser,
  updateProfile,
  changePassword,
  forgotPasswordThunk,
  verifyOtpThunk,
  resendOtpThunk,
  resetPasswordThunk,
  UserProfile,
  DEMO_SUPERADMIN_USER,
} from '../features/authApi';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  isInitialized: boolean;
  error: string | null;
  successMessage: string | null;
  forgotEmail: string | null;
  pendingEmail: string | null;
  otpCode: string | null;
}

const initialState: AuthState = {
  user: DEMO_SUPERADMIN_USER,
  isAuthenticated: true,
  loading: false,
  isInitialized: false,
  error: null,
  successMessage: null,
  forgotEmail: null,
  pendingEmail: null,
  otpCode: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isInitialized = true;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setForgotEmail: (state, action: PayloadAction<string | null>) => {
      state.forgotEmail = action.payload;
      state.pendingEmail = action.payload;
    },
    setPendingEmail: (state, action: PayloadAction<string | null>) => {
      state.pendingEmail = action.payload;
      state.forgotEmail = action.payload;
    },
    setOtpCode: (state, action: PayloadAction<string | null>) => {
      state.otpCode = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Authentication failed.';
      })

      // Get Me Profile
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.isInitialized = true;
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Profile update failed.';
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Password change failed.';
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      })

      // Forgot Password
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload.message || 'Reset code sent to your email!';
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Verify OTP
      .addCase(verifyOtpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload.message || 'OTP verified!';
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Resend OTP
      .addCase(resendOtpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtpThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload.message || 'OTP resent!';
      })
      .addCase(resendOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reset Password
      .addCase(resetPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload.message || 'Password reset successfully!';
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setUser,
  setInitialized,
  setForgotEmail,
  setPendingEmail,
  setOtpCode,
  clearAuthError,
  clearSuccessMessage,
  logout,
} = authSlice.actions;
export default authSlice.reducer;
