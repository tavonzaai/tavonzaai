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
// 📡 Direct Customer Menu Category API Handlers (with deduplication & cache)
// ─────────────────────────────────────────
interface MenuCategoryCacheEntry {
  data: ApiResponse<MenuCategoryResponseDto[]>;
  timestamp: number;
}

const menuCategoriesCache = new Map<string, MenuCategoryCacheEntry>();
const menuCategoriesInFlight = new Map<string, Promise<ApiResponse<MenuCategoryResponseDto[]>>>();
const MENU_CATEGORIES_CACHE_TTL_MS = 120000; // 2 minutes in-memory cache

export function clearMenuCategoriesCache(): void {
  menuCategoriesCache.clear();
  menuCategoriesInFlight.clear();
}

if (typeof window !== 'undefined') {
  window.addEventListener('tavonza:menu_updated', () => clearMenuCategoriesCache());
}

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
    const cacheKey = `${branchId.trim()}:${queryString}`;

    // 1. Check in-memory cache
    const cached = menuCategoriesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < MENU_CATEGORIES_CACHE_TTL_MS) {
      return cached.data;
    }

    // 2. Check active in-flight request to prevent parallel duplicates
    const inFlight = menuCategoriesInFlight.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    // 3. Launch request with deduplication
    const reqPromise = (async () => {
      try {
        const res = await baseApiFetch<MenuCategoryResponseDto[]>(
          `/menus/${encodeURIComponent(branchId.trim())}/categories${queryString}`,
          { method: 'GET' }
        );
        menuCategoriesCache.set(cacheKey, { data: res, timestamp: Date.now() });
        return res;
      } catch (err) {
        const fallback = menuCategoriesCache.get(cacheKey);
        if (fallback) return fallback.data;
        throw err;
      } finally {
        menuCategoriesInFlight.delete(cacheKey);
      }
    })();

    menuCategoriesInFlight.set(cacheKey, reqPromise);
    return reqPromise;
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
