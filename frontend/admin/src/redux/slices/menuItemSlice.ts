import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  BackendMenuItem,
  fetchMenuItems,
  fetchMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
} from '../features/menu-items/menuItemApi';

export interface MenuItemState {
  items: BackendMenuItem[];
  selectedItem: BackendMenuItem | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  meta: any;
}

const initialState: MenuItemState = {
  items: [],
  selectedItem: null,
  loading: false,
  actionLoading: false,
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
    // Local optimistic update
    optimisticToggleAvailability: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        item.isAvailable = !item.isAvailable;
      }
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

    // 3. Create menu item
    builder
      .addCase(createMenuItem.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) {
          state.items = [action.payload, ...state.items];
        }
      })
      .addCase(createMenuItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // 4. Update menu item
    builder
      .addCase(updateMenuItem.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) {
          const index = state.items.findIndex((i) => i.id === action.payload.id);
          if (index !== -1) {
            state.items[index] = { ...state.items[index], ...action.payload };
          }
          if (state.selectedItem?.id === action.payload.id) {
            state.selectedItem = { ...state.selectedItem, ...action.payload };
          }
        }
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // 5. Toggle availability
    builder
      .addCase(toggleMenuItemAvailability.fulfilled, (state, action) => {
        if (action.payload) {
          const item = state.items.find((i) => i.id === action.payload.id);
          if (item) {
            item.isAvailable = action.payload.isAvailable;
          }
        }
      });

    // 6. Delete menu item
    builder
      .addCase(deleteMenuItem.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = state.items.filter((i) => i.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedItem, clearMenuItemError, optimisticToggleAvailability } =
  menuItemSlice.actions;

export default menuItemSlice.reducer;
