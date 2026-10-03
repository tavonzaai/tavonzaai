import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  MenuCategoryItem,
  fetchMenuCategories,
  fetchMenuCategoryById,
} from '../features/menu-category/menuCategoryApi';

export interface MenuCategoryState {
  categories: MenuCategoryItem[];
  selectedCategory: MenuCategoryItem | null;
  loading: boolean;
  error: string | null;
  meta: any;
}

const initialState: MenuCategoryState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
  meta: null,
};

const menuCategorySlice = createSlice({
  name: 'menuCategories',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<MenuCategoryItem | null>) => {
      state.selectedCategory = action.payload;
    },
    clearMenuCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch all categories
    builder
      .addCase(fetchMenuCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchMenuCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 2. Fetch category by ID
    builder
      .addCase(fetchMenuCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchMenuCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCategory, clearMenuCategoryError } = menuCategorySlice.actions;

export default menuCategorySlice.reducer;
