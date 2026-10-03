import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  createCustomerUser,
  updateMe,
  createAdminUser,
  getUserById,
  changeUserStatus,
  getUsersList,
  UserResponse,
} from '../features/userApi';

export interface UserState {
  currentUser: UserResponse | null;
  selectedUser: UserResponse | null;
  usersList: UserResponse[];
  usersMeta: {
    page: number;
    limit: number;
    total: number;
    totalPage?: number;
  } | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: UserState = {
  currentUser: null,
  selectedUser: null,
  usersList: [],
  usersMeta: null,
  loading: false,
  error: null,
  successMessage: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<UserResponse | null>) => {
      state.currentUser = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Create Customer User
    builder
      .addCase(createCustomerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
        state.successMessage = 'Customer account created successfully!';
      })
      .addCase(createCustomerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 2. Update Current User Profile (Me)
    builder
      .addCase(updateMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMe.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
        state.successMessage = 'Profile updated successfully!';
      })
      .addCase(updateMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 3. Create Admin User
    builder
      .addCase(createAdminUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdminUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.successMessage = 'Admin created successfully!';
      })
      .addCase(createAdminUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 4. Get User Details
    builder
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 5. Change User Status
    builder
      .addCase(changeUserStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(changeUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
        state.usersList = state.usersList.map((u) =>
          u.id === action.payload.id ? action.payload : u
        );
        state.successMessage = 'User status updated successfully!';
      })
      .addCase(changeUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 6. Get Users List
    builder
      .addCase(getUsersList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUsersList.fulfilled, (state, action) => {
        state.loading = false;
        state.usersList = action.payload.data;
        state.usersMeta = action.payload.meta || null;
      })
      .addCase(getUsersList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentUser, clearUserError, clearUserSuccessMessage } = userSlice.actions;

export default userSlice.reducer;
