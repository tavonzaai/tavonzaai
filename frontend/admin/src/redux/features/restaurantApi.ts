import { baseApiFetch } from '../api/baseApi';
import { buildQueryString } from '@tavonza/shared';
import { PaginationMeta } from '@tavonza/contracts';
import { isValidHttpUrl } from '@/lib/utils';
import { parseBranchAddress } from '@/lib/admin-mappers';

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
  organizationId?: string;
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
    const sanitized: Record<string, any> = { ...payload };
    if ('logoUrl' in sanitized) {
      const val = sanitized.logoUrl;
      if (!val || typeof val !== 'string' || !isValidHttpUrl(val)) {
        delete sanitized.logoUrl;
      } else {
        sanitized.logoUrl = val.trim();
      }
    }
    const res = await baseApiFetch<BackendRestaurant>('/restaurants', {
      method: 'POST',
      body: JSON.stringify(sanitized),
    });
    return (res as any)?.data || res;
  },

  updateRestaurant: async (
    id: string,
    payload: UpdateRestaurantPayload
  ): Promise<BackendRestaurant> => {
    const sanitized: Record<string, any> = { ...payload };
    if ('logoUrl' in sanitized) {
      const val = sanitized.logoUrl;
      if (!val || typeof val !== 'string' || !isValidHttpUrl(val)) {
        delete sanitized.logoUrl;
      } else {
        sanitized.logoUrl = val.trim();
      }
    }
    const res = await baseApiFetch<BackendRestaurant>(`/restaurants/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(sanitized),
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

  createBranch: async (payload: CreateBranchPayload | any): Promise<BackendBranch> => {
    const cleanPayload: Record<string, any> = {
      restaurantId: payload.restaurantId,
      name: typeof payload.name === 'string' ? payload.name.trim() : payload.name,
      address: parseBranchAddress(payload.address),
    };
    const phoneVal = payload.phone || payload.contactNumber;
    if (typeof phoneVal === 'string' && phoneVal.trim()) {
      cleanPayload.phone = phoneVal.trim();
    }
    if (typeof payload.timezone === 'string' && payload.timezone.trim()) {
      cleanPayload.timezone = payload.timezone.trim();
    }
    const res = await baseApiFetch<BackendBranch>('/branches', {
      method: 'POST',
      body: JSON.stringify(cleanPayload),
    });
    return (res as any)?.data || res;
  },

  updateBranch: async (id: string, payload: UpdateBranchPayload | any): Promise<BackendBranch> => {
    const cleanPayload: Record<string, any> = {};
    if (typeof payload.name === 'string' && payload.name.trim()) {
      cleanPayload.name = payload.name.trim();
    }
    if (payload.address) {
      cleanPayload.address = parseBranchAddress(payload.address);
    }
    const phoneVal = payload.phone || payload.contactNumber;
    if (typeof phoneVal === 'string' && phoneVal.trim()) {
      cleanPayload.phone = phoneVal.trim();
    }
    if (typeof payload.timezone === 'string' && payload.timezone.trim()) {
      cleanPayload.timezone = payload.timezone.trim();
    }
    if (typeof payload.isActive === 'boolean') {
      cleanPayload.isActive = payload.isActive;
    }
    const res = await baseApiFetch<BackendBranch>(`/branches/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(cleanPayload),
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

  updateBranchStaff: async (
    branchId: string,
    staffId: string,
    payload: any
  ): Promise<any> => {
    const res = await baseApiFetch<any>(
      `/branches/${encodeURIComponent(branchId)}/staff/${encodeURIComponent(staffId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
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

  createOrganization: async (payload: {
    name: string;
    slug?: string;
    description?: string;
    logoUrl?: string;
  }): Promise<any> => {
    const res = await baseApiFetch<any>('/organizations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  getOrganizationById: async (id: string): Promise<any> => {
    const res = await baseApiFetch<any>(`/organizations/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  getOrganizations: async (): Promise<any[]> => {
    const res = await baseApiFetch<any[]>('/organizations', {
      method: 'GET',
    });
    return (res as any)?.data || res || [];
  },

  getMyOrganization: async (): Promise<any> => {
    try {
      const res = await baseApiFetch<any>('/organizations/my', { method: 'GET' });
      const orgs = (res as any)?.data || res;
      return Array.isArray(orgs) ? orgs[0] : orgs;
    } catch {
      return null;
    }
  },

  updateOrganization: async (id: string, payload: any): Promise<any> => {
    const res = await baseApiFetch<any>(`/organizations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  deleteOrganization: async (id: string): Promise<any> => {
    const res = await baseApiFetch<any>(`/organizations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return (res as any)?.data || res;
  },
};

export const branchService = restaurantService;
