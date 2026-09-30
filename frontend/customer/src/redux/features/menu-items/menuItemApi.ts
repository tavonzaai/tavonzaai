import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch, ApiResponse } from '../../api/baseApi';

export interface Modifier {
  id: string;
  modifierGroupId: string;
  name: string;
  priceDelta: number;
  isAvailable: boolean;
}

export interface ModifierGroup {
  id: string;
  menuItemId: string;
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  modifiers: Modifier[];
}

export interface BackendMenuItem {
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
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    restaurantId: string;
    name: string;
    description?: string | null;
    displayOrder: number;
    isActive: boolean;
  };
  modifierGroups?: ModifierGroup[];
}

export interface MenuItemQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sort?: string;
  restaurantId?: string;
  categoryId?: string;
  isAvailable?: boolean;
  isVegetarian?: boolean;
}

// ─────────────────────────────────────────
// 📡 Direct Raw API Handlers
// ─────────────────────────────────────────
export const rawMenuItemApi = {
  findAll: async (query: MenuItemQuery = {}): Promise<ApiResponse<BackendMenuItem[]>> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));
    if (query.searchTerm) params.append('searchTerm', query.searchTerm);
    if (query.sort) params.append('sort', query.sort);
    if (query.restaurantId) params.append('restaurantId', query.restaurantId);
    if (query.categoryId) params.append('categoryId', query.categoryId);
    if (query.isAvailable !== undefined) params.append('isAvailable', String(query.isAvailable));
    if (query.isVegetarian !== undefined) params.append('isVegetarian', String(query.isVegetarian));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await baseApiFetch<BackendMenuItem[]>(`/menu-items${queryString}`, {
      method: 'GET',
    });
  },

  findById: async (id: string): Promise<ApiResponse<BackendMenuItem>> => {
    return await baseApiFetch<BackendMenuItem>(`/menu-items/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
  },
};

// ─────────────────────────────────────────
// ⚡ Async Thunks (Feature API Layer)
// ─────────────────────────────────────────
export const fetchMenuItems = createAsyncThunk(
  'menuItems/fetchAll',
  async (query: MenuItemQuery = {}, { rejectWithValue }) => {
    try {
      const response = await rawMenuItemApi.findAll(query);
      return {
        data: response.data || [],
        meta: response.meta,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch menu items.');
    }
  }
);

export const fetchMenuItemById = createAsyncThunk(
  'menuItems/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await rawMenuItemApi.findById(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch menu item details.');
    }
  }
);
