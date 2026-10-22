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
// 📡 Direct Customer Menu Items API Handlers (with deduplication & cache)
// ─────────────────────────────────────────
interface MenuItemCacheEntry {
  data: ApiResponse<BackendMenuItem[]>;
  timestamp: number;
}

const menuItemsCache = new Map<string, MenuItemCacheEntry>();
const menuItemsInFlight = new Map<string, Promise<ApiResponse<BackendMenuItem[]>>>();
const MENU_ITEMS_CACHE_TTL_MS = 60000; // 60s in-memory cache

export function clearMenuItemsCache(): void {
  menuItemsCache.clear();
  menuItemsInFlight.clear();
}

if (typeof window !== 'undefined') {
  window.addEventListener('tavonza:menu_updated', () => clearMenuItemsCache());
}

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
    const cacheKey = `${branchId.trim()}:${queryString}`;

    // 1. Check in-memory cache
    const cached = menuItemsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < MENU_ITEMS_CACHE_TTL_MS) {
      return cached.data;
    }

    // 2. Check active in-flight request to prevent parallel duplicates
    const inFlight = menuItemsInFlight.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    // 3. Launch request with deduplication
    const reqPromise = (async () => {
      try {
        const res = await baseApiFetch<BackendMenuItem[]>(
          `/menus/${encodeURIComponent(branchId.trim())}/items${queryString}`,
          { method: 'GET' }
        );
        menuItemsCache.set(cacheKey, { data: res, timestamp: Date.now() });
        return res;
      } catch (err) {
        const fallback = menuItemsCache.get(cacheKey);
        if (fallback) return fallback.data;
        throw err;
      } finally {
        menuItemsInFlight.delete(cacheKey);
      }
    })();

    menuItemsInFlight.set(cacheKey, reqPromise);
    return reqPromise;
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
