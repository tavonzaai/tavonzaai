import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  loginUser,
  registerCustomer,
  verifyOtpThunk,
  resendOtpThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  getMe,
  logoutUser,
  UserProfile,
} from '../features/authApi';
import { updateMe } from '../features/userApi';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  isInitialized: boolean;
  error: string | null;
  successMessage: string | null;
  pendingEmail: string | null;
  forgotEmail: string | null;
  otpCode: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  isInitialized: false,
  error: null,
  successMessage: null,
  pendingEmail: null,
  forgotEmail: null,
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
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      state.isInitialized = true;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setPendingEmail: (state, action: PayloadAction<string | null>) => {
      state.pendingEmail = action.payload;
    },
    setForgotEmail: (state, action: PayloadAction<string | null>) => {
      state.forgotEmail = action.payload;
    },
    setOtpCode: (state, action: PayloadAction<string | null>) => {
      state.otpCode = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 1. Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
        state.successMessage = 'Login successful!';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'object' && action.payload && 'message' in action.payload
            ? (action.payload as any).message
            : (action.payload as string);
      });

    // 2. Register
    builder
      .addCase(registerCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.pendingEmail = action.payload.email;
        state.successMessage = action.payload.message || 'Account created! Please verify your email with the OTP code.';
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'object' && action.payload && 'message' in action.payload
            ? (action.payload as any).message
            : (action.payload as string);
      });

    // 3. Verify OTP
    builder
      .addCase(verifyOtpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload.message || 'Verification successful!';
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 4. Resend OTP
    builder
      .addCase(resendOtpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtpThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload.message || 'Verification code resent successfully!';
      })
      .addCase(resendOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 5. Forgot Password
    builder
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.forgotEmail = action.payload.email;
        state.pendingEmail = action.payload.email;
        state.successMessage = action.payload.message;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 6. Reset Password
    builder
      .addCase(resetPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || 'Password reset successfully!';
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 7. Get Me
    builder
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });

    // 8. Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    });

    // 9. Update Profile (updateMe)
    builder.addCase(updateMe.fulfilled, (state, action: any) => {
      if (action.payload) {
        state.user = {
          ...state.user,
          ...action.payload,
          name: action.payload.name || state.user?.name,
          contactNo: action.payload.contactNo || state.user?.contactNo,
          phone: action.payload.contactNo || state.user?.phone,
        };
      }
    });
  },
});

export const {
  setUser,
  setAuthenticated,
  setInitialized,
  clearAuthError,
  clearSuccessMessage,
  setPendingEmail,
  setForgotEmail,
  setOtpCode,
} = authSlice.actions;

export default authSlice.reducer;
