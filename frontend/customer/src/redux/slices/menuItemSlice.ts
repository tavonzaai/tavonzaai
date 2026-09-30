import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  BackendMenuItem,
  fetchMenuItems,
  fetchMenuItemById,
} from '../features/menu-items/menuItemApi';

export interface MenuItemState {
  items: BackendMenuItem[];
  selectedItem: BackendMenuItem | null;
  loading: boolean;
  error: string | null;
  meta: any;
}

const initialState: MenuItemState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  meta: null,
};

const menuItemSlice = createSlice({
  name: 'menuItems',
  initialState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<BackendMenuItem | null>) => {
      state.selectedItem = action.payload;
    },
    clearMenuItemError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch all items
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 2. Fetch item by ID
    builder
      .addCase(fetchMenuItemById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchMenuItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedItem, clearMenuItemError } = menuItemSlice.actions;

export default menuItemSlice.reducer;
