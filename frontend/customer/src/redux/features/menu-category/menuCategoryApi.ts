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

export interface MenuCategoryResponseDto {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  itemCount?: number;
}

export type MenuCategoryItem = MenuCategoryResponseDto;

export interface MenuCategoryQuery {
  branchId?: string;
  page?: number;
  limit?: number;
  searchTerm?: string;
  search?: string;
  sort?: string;
  restaurantId?: string;
  isActive?: boolean;
}

// ─────────────────────────────────────────
// 📡 Direct Customer Menu Category API Handlers
// ─────────────────────────────────────────
export const rawMenuCategoryApi = {
  /**
   * GET /menus/:branchId/categories
   * Customer Get active menu categories for branch with search and pagination support
   */
  findAll: async (query: MenuCategoryQuery = {}): Promise<ApiResponse<MenuCategoryResponseDto[]>> => {
    const branchId = getActiveBranchId(query.branchId);
    if (!branchId || !branchId.trim()) {
      return { success: true, message: 'No branch selected', data: [] };
    }
    const params = new URLSearchParams();

    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));

    const searchVal = query.search || query.searchTerm;
    if (searchVal && searchVal.trim()) {
      params.append('searchTerm', searchVal.trim());
      params.append('search', searchVal.trim());
    }
    if (query.sort) params.append('sort', query.sort);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await baseApiFetch<MenuCategoryResponseDto[]>(
      `/menus/${encodeURIComponent(branchId.trim())}/categories${queryString}`,
      { method: 'GET' }
    );
  },

  findById: async (id: string, branchId?: string): Promise<ApiResponse<MenuCategoryResponseDto>> => {
    const res = await rawMenuCategoryApi.findAll({ branchId });
    const list = Array.isArray(res.data) ? res.data : ((res as any) || []);
    const cat = Array.isArray(list) ? list.find((c: MenuCategoryResponseDto) => c.id === id) : null;
    return {
      message: 'Success',
      data: cat || (list[0] as any),
    };
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
