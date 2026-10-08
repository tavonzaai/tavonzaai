import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch, ApiResponse, getCookie } from '../../api/baseApi';

export function getActiveBranchId(providedBranchId?: string): string {
  if (providedBranchId && providedBranchId.trim()) return providedBranchId.trim();
  const cookieBranchId = getCookie('tavonza_branch_id') || getCookie('branch_id');
  if (cookieBranchId && cookieBranchId.trim()) return cookieBranchId.trim();
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const branchParam = params.get('branchId');
    if (branchParam && branchParam.trim()) return branchParam.trim();
  }
  return '';
}

export interface MenuItemAddOnResponseDto {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemListResponseDto {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  basePrice: number;
  imageUrl?: string | null;
  rating?: number | null;
  ratingCount?: number;
  isPopular?: boolean;
  isAvailable?: boolean;
  dietBadge?: string | null;
  categoryName?: string;
  categoryId: string;
}

export interface MenuItemDetailResponseDto {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  categoryId: string;
  categoryName: string;
  prepTime?: number | null;
  calories?: number | null;
  dietBadge?: string | null;
  allergenDisplay?: string | null;
  allergens?: string[];
  winePairing?: string | null;
  winePairingNote?: string | null;
  rating?: number | null;
  ratingCount?: number;
  isPopular?: boolean;
  isAvailable?: boolean;
  addOns?: MenuItemAddOnResponseDto[];
}

// Unified BackendMenuItem type for state store compatibility
export interface BackendMenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  basePrice: number;
  imageUrl?: string | null;
  rating?: number | null;
  ratingCount?: number;
  isPopular?: boolean;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  spiceLevel?: number | null;
  dietBadge?: string | null;
  categoryName?: string;
  categoryId: string;
  prepTime?: number | null;
  calories?: number | null;
  allergenDisplay?: string | null;
  allergens?: string[];
  winePairing?: string | null;
  winePairingNote?: string | null;
  addOns?: MenuItemAddOnResponseDto[];
  category?: {
    id: string;
    name: string;
  };
  modifierGroups?: any[];
}

export interface MenuItemQuery {
  branchId?: string;
  categoryId?: string;
  searchTerm?: string;
  search?: string;
  popular?: boolean | string;
  isPopular?: boolean;
  page?: number;
  limit?: number;
  restaurantId?: string;
  isAvailable?: boolean;
  isVegetarian?: boolean;
}

// ─────────────────────────────────────────
// 📡 Direct Customer Menu Items API Handlers
// ─────────────────────────────────────────
export const rawMenuItemApi = {
  /**
   * GET /menus/:branchId/items
   * Query params: categoryId, search, searchTerm, popular, page, limit
   */
  findAll: async (query: MenuItemQuery = {}): Promise<ApiResponse<BackendMenuItem[]>> => {
    const branchId = getActiveBranchId(query.branchId);
    if (!branchId || !branchId.trim()) {
      return { success: true, message: 'No branch selected', data: [] };
    }
    const params = new URLSearchParams();

    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));

    if (query.categoryId && query.categoryId !== 'all') {
      params.append('categoryId', query.categoryId);
    }
    const searchVal = query.search || query.searchTerm;
    if (searchVal && searchVal.trim()) {
      params.append('search', searchVal.trim());
      params.append('searchTerm', searchVal.trim());
    }
    if (query.popular !== undefined || query.isPopular !== undefined) {
      const isPop = query.popular === true || query.popular === 'true' || query.isPopular === true;
      params.append('popular', String(isPop));
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await baseApiFetch<BackendMenuItem[]>(
      `/menus/${encodeURIComponent(branchId.trim())}/items${queryString}`,
      { method: 'GET' }
    );
  },

  /**
   * GET /menus/items/:itemId
   * Customer Get menu item detail with add-ons and nutritional info
   */
  findById: async (id: string): Promise<ApiResponse<BackendMenuItem>> => {
    return await baseApiFetch<BackendMenuItem>(
      `/menus/items/${encodeURIComponent(id)}`,
      { method: 'GET' }
    );
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
      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? (response as any)
        : [];
      return {
        data,
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
      return (response as any).data || response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch menu item details.');
    }
  }
);
