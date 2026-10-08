import { baseApiFetch } from '../api/baseApi';
import { buildQueryString } from '@tavonza/shared';
import { PaginationMeta } from '@tavonza/contracts';

export interface BackendRestaurant {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendBranch {
  id: string;
  restaurantId: string;
  name: string;
  address: {
    line1?: string;
    street?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    [key: string]: any;
  } | string;
  phone?: string;
  timezone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QueryRestaurantParams {
  organizationId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

export interface QueryBranchParams {
  restaurantId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

export interface CreateRestaurantPayload {
  organizationId: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  description?: string;
}

export interface UpdateRestaurantPayload {
  name?: string;
  slug?: string;
  logoUrl?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateBranchPayload {
  restaurantId: string;
  name: string;
  address: {
    line1?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  } | any;
  phone?: string;
  timezone?: string;
}

export interface UpdateBranchPayload {
  name?: string;
  address?: any;
  phone?: string;
  timezone?: string;
  isActive?: boolean;
}

export const restaurantService = {
  getRestaurants: async (
    params?: QueryRestaurantParams
  ): Promise<{ data: BackendRestaurant[]; meta?: PaginationMeta }> => {
    const qs = buildQueryString(params);
    const res = await baseApiFetch<
      BackendRestaurant[] | { data: BackendRestaurant[]; meta: PaginationMeta }
    >(`/restaurants${qs}`, {
      method: 'GET',
    });
    if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as any).data)) {
      return { data: (res as any).data, meta: (res as any).meta };
    }
    if (Array.isArray(res)) {
      return { data: res };
    }
    return { data: [] };
  },

  getRestaurantById: async (id: string): Promise<BackendRestaurant> => {
    const res = await baseApiFetch<BackendRestaurant>(`/restaurants/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  createRestaurant: async (payload: CreateRestaurantPayload): Promise<BackendRestaurant> => {
    const res = await baseApiFetch<BackendRestaurant>('/restaurants', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  updateRestaurant: async (
    id: string,
    payload: UpdateRestaurantPayload
  ): Promise<BackendRestaurant> => {
    const res = await baseApiFetch<BackendRestaurant>(`/restaurants/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  deleteRestaurant: async (id: string): Promise<BackendRestaurant> => {
    const res = await baseApiFetch<BackendRestaurant>(`/restaurants/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return (res as any)?.data || res;
  },

  getBranches: async (
    params?: QueryBranchParams
  ): Promise<{ data: BackendBranch[]; meta?: PaginationMeta }> => {
    const qs = buildQueryString(params);
    const res = await baseApiFetch<
      BackendBranch[] | { data: BackendBranch[]; meta: PaginationMeta }
    >(`/branches${qs}`, {
      method: 'GET',
    });
    if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as any).data)) {
      return { data: (res as any).data, meta: (res as any).meta };
    }
    if (Array.isArray(res)) {
      return { data: res };
    }
    return { data: [] };
  },

  getBranchById: async (id: string): Promise<BackendBranch> => {
    const res = await baseApiFetch<BackendBranch>(`/branches/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  createBranch: async (payload: CreateBranchPayload): Promise<BackendBranch> => {
    const res = await baseApiFetch<BackendBranch>('/branches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  updateBranch: async (id: string, payload: UpdateBranchPayload): Promise<BackendBranch> => {
    const res = await baseApiFetch<BackendBranch>(`/branches/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  deleteBranch: async (id: string): Promise<BackendBranch> => {
    const res = await baseApiFetch<BackendBranch>(`/branches/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return (res as any)?.data || res;
  },

  getBranchStaff: async (
    branchId: string,
    query?: { role?: string; search?: string }
  ): Promise<any[]> => {
    const qs = buildQueryString(query);
    const res = await baseApiFetch<any[]>(`/branches/${encodeURIComponent(branchId)}/staff${qs}`, {
      method: 'GET',
    });
    return (res as any)?.data || res || [];
  },

  createBranchStaff: async (branchId: string, payload: any): Promise<any> => {
    const res = await baseApiFetch<any>(`/branches/${encodeURIComponent(branchId)}/staff`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  deleteBranchStaff: async (branchId: string, staffId: string): Promise<any> => {
    const res = await baseApiFetch<any>(
      `/branches/${encodeURIComponent(branchId)}/staff/${encodeURIComponent(staffId)}`,
      {
        method: 'DELETE',
      }
    );
    return (res as any)?.data || res;
  },

  getOperatingHours: async (branchId: string): Promise<any[]> => {
    const res = await baseApiFetch<any[]>(
      `/branches/${encodeURIComponent(branchId)}/operating-hours`,
      {
        method: 'GET',
      }
    );
    return (res as any)?.data || res || [];
  },

  setOperatingHours: async (branchId: string, hours: any[]): Promise<any> => {
    const res = await baseApiFetch<any>(
      `/branches/${encodeURIComponent(branchId)}/operating-hours`,
      {
        method: 'PUT',
        body: JSON.stringify({ hours }),
      }
    );
    return (res as any)?.data || res;
  },

  getBranchSettings: async (branchId: string): Promise<any> => {
    const res = await baseApiFetch<any>(`/branches/${encodeURIComponent(branchId)}/settings`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  updateBranchSettings: async (branchId: string, payload: any): Promise<any> => {
    const res = await baseApiFetch<any>(`/branches/${encodeURIComponent(branchId)}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  getOrganizations: async (): Promise<any[]> => {
    const res = await baseApiFetch<any[]>('/organizations', {
      method: 'GET',
    });
    return (res as any)?.data || res || [];
  },
};

export const branchService = restaurantService;
