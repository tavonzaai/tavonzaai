import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch, ApiResponse } from '../../api/baseApi';

export interface BackendMenuItemSummary {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  basePrice: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  spiceLevel?: number | null;
  stationType?: string;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuCategoryItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  menuItems?: BackendMenuItemSummary[];
}

export interface MenuCategoryQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sort?: string;
  restaurantId?: string;
  isActive?: boolean;
}

// ─────────────────────────────────────────
// 📡 Direct Raw API Handlers
// ─────────────────────────────────────────
export const rawMenuCategoryApi = {
  findAll: async (query: MenuCategoryQuery = {}): Promise<ApiResponse<MenuCategoryItem[]>> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));
    if (query.searchTerm) params.append('searchTerm', query.searchTerm);
    if (query.sort) params.append('sort', query.sort);
    if (query.restaurantId) params.append('restaurantId', query.restaurantId);
    if (query.isActive !== undefined) params.append('isActive', String(query.isActive));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await baseApiFetch<MenuCategoryItem[]>(`/menu-categories${queryString}`, {
      method: 'GET',
    });
  },

  findById: async (id: string): Promise<ApiResponse<MenuCategoryItem>> => {
    return await baseApiFetch<MenuCategoryItem>(`/menu-categories/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
  },
};

// ─────────────────────────────────────────
// ⚡ Async Thunks (Feature API Layer)
// ─────────────────────────────────────────
export const fetchMenuCategories = createAsyncThunk(
  'menuCategories/fetchAll',
  async (query: MenuCategoryQuery = {}, { rejectWithValue }) => {
    try {
      const response = await rawMenuCategoryApi.findAll(query);
      return {
        data: response.data || [],
        meta: response.meta,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch menu categories.');
    }
  }
);

export const fetchMenuCategoryById = createAsyncThunk(
  'menuCategories/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await rawMenuCategoryApi.findById(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch menu category.');
    }
  }
);
