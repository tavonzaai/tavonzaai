import { rtkBaseApi } from '../api/baseApi';
import { unwrapList } from '@/lib/admin-mappers';
import type { BackendBranch, BackendRestaurant } from './restaurantApi';

export const adminApi = rtkBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrganizations: builder.query<any[], void>({
      query: () => '/organizations/my',
      transformResponse: (response: unknown) => unwrapList<any>(response),
      providesTags: ['ORGANIZATION'],
    }),
    getOrganizations: builder.query<any, { page?: number; search?: string } | void>({
      query: (params) => ({ url: '/organizations', params: params || undefined }),
      providesTags: ['ORGANIZATION'],
    }),
    getRestaurants: builder.query<
      { data: BackendRestaurant[]; meta?: any },
      { organizationId?: string; page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({ url: '/restaurants', params }),
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return { data: response as BackendRestaurant[] };
        const body = response as { data?: BackendRestaurant[]; meta?: any };
        return { data: body?.data ?? [], meta: body?.meta };
      },
      providesTags: ['RESTAURANT'],
    }),
    getRestaurant: builder.query<BackendRestaurant, string>({
      query: (id) => `/restaurants/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'RESTAURANT', id }],
    }),
    createRestaurant: builder.mutation<BackendRestaurant, Record<string, unknown>>({
      query: (body) => ({ url: '/restaurants', method: 'POST', body }),
      invalidatesTags: ['RESTAURANT', 'ANALYTICS', 'DASHBOARD'],
    }),
    updateRestaurant: builder.mutation<BackendRestaurant, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/restaurants/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['RESTAURANT', 'ANALYTICS', 'DASHBOARD'],
    }),
    deleteRestaurant: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/restaurants/${id}`, method: 'DELETE' }),
      invalidatesTags: ['RESTAURANT', 'BRANCH', 'ANALYTICS', 'DASHBOARD'],
    }),
    getBranches: builder.query<
      { data: BackendBranch[]; meta?: any },
      { restaurantId?: string; organizationId?: string; page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({ url: '/branches', params }),
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return { data: response as BackendBranch[] };
        const body = response as { data?: BackendBranch[]; meta?: any };
        return { data: body?.data ?? [], meta: body?.meta };
      },
      providesTags: ['BRANCH'],
    }),
    getBranch: builder.query<BackendBranch, string>({
      query: (id) => `/branches/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'BRANCH', id }],
    }),
    createBranch: builder.mutation<BackendBranch, Record<string, unknown>>({
      query: (body) => ({ url: '/branches', method: 'POST', body }),
      invalidatesTags: ['BRANCH', 'RESTAURANT', 'ANALYTICS', 'DASHBOARD'],
    }),
    updateBranch: builder.mutation<BackendBranch, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/branches/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['BRANCH', 'ANALYTICS'],
    }),
    deleteBranch: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/branches/${id}`, method: 'DELETE' }),
      invalidatesTags: ['BRANCH', 'RESTAURANT', 'ANALYTICS', 'DASHBOARD'],
    }),
    getOperatingHours: builder.query<any[], string>({
      query: (branchId) => `/branches/${branchId}/operating-hours`,
      transformResponse: (response: unknown) => unwrapList<any>(response),
      providesTags: (_r, _e, id) => [{ type: 'BRANCH', id }],
    }),
    setOperatingHours: builder.mutation<any, { branchId: string; hours: any[] }>({
      query: ({ branchId, hours }) => ({
        url: `/branches/${branchId}/operating-hours`,
        method: 'PUT',
        body: { hours },
      }),
      invalidatesTags: ['BRANCH'],
    }),
    getBranchSettings: builder.query<any, string>({
      query: (branchId) => `/branches/${branchId}/settings`,
      providesTags: (_r, _e, id) => [{ type: 'BRANCH', id }],
    }),
    updateBranchSettings: builder.mutation<any, { branchId: string; body: Record<string, unknown> }>({
      query: ({ branchId, body }) => ({
        url: `/branches/${branchId}/settings`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['BRANCH'],
    }),
    getBranchStaff: builder.query<
      any[],
      { branchId: string; role?: string; search?: string; status?: 'all' | 'active' | 'inactive' }
    >({
      query: ({ branchId, ...params }) => ({ url: `/branches/${branchId}/staff`, params }),
      transformResponse: (response: unknown) => unwrapList<any>(response),
      providesTags: ['STAFF'],
    }),
    createBranchStaff: builder.mutation<any, { branchId: string; body: Record<string, unknown> }>({
      query: ({ branchId, body }) => ({
        url: `/branches/${branchId}/staff`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['STAFF', 'ANALYTICS'],
    }),
    updateBranchStaff: builder.mutation<
      any,
      { branchId: string; staffId: string; body: Record<string, unknown> }
    >({
      query: ({ branchId, staffId, body }) => ({
        url: `/branches/${branchId}/staff/${staffId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['STAFF'],
    }),
    deleteBranchStaff: builder.mutation<any, { branchId: string; staffId: string }>({
      query: ({ branchId, staffId }) => ({
        url: `/branches/${branchId}/staff/${staffId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['STAFF', 'ANALYTICS'],
    }),
    getTables: builder.query<any[], { branchId: string }>({
      query: ({ branchId }) => ({ url: '/tables', params: { branchId } }),
      transformResponse: (response: unknown) => unwrapList<any>(response),
      providesTags: ['TABLE'],
    }),
    createTable: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({ url: '/tables', method: 'POST', body }),
      invalidatesTags: ['TABLE', 'ANALYTICS'],
    }),
    updateTable: builder.mutation<any, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/tables/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['TABLE'],
    }),
    deleteTable: builder.mutation<any, string>({
      query: (id) => ({ url: `/tables/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TABLE', 'ANALYTICS'],
    }),
    regenerateTableQr: builder.mutation<any, string>({
      query: (id) => ({ url: `/tables/${id}/regenerate-qr`, method: 'POST' }),
      invalidatesTags: ['TABLE'],
    }),
    getMenuCategories: builder.query<any[], string>({
      query: (branchId) => `/menus/${branchId}/categories`,
      transformResponse: (response: unknown) => unwrapList<any>(response),
      providesTags: ['MENU'],
    }),
    getMenuItems: builder.query<any[], string>({
      query: (branchId) => `/menus/${branchId}/items`,
      transformResponse: (response: unknown) => unwrapList<any>(response),
      providesTags: ['MENU'],
    }),
    createMenuCategory: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({ url: '/menus/categories', method: 'POST', body }),
      invalidatesTags: ['MENU'],
    }),
    createMenuItem: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({ url: '/menus/items', method: 'POST', body }),
      invalidatesTags: ['MENU'],
    }),
    updateMenuItem: builder.mutation<any, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/menus/items/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['MENU'],
    }),
    deleteMenuItem: builder.mutation<any, string>({
      query: (id) => ({ url: `/menus/items/${id}`, method: 'DELETE' }),
      invalidatesTags: ['MENU'],
    }),
    getAnalyticsOverview: builder.query<
      any,
      { organizationId?: string; branchId?: string } | void
    >({
      query: (params) => ({ url: '/analytics/overview', params: params || undefined }),
      providesTags: ['ANALYTICS', 'DASHBOARD'],
    }),
    getBranchPerformance: builder.query<any[], { organizationId?: string } | void>({
      query: (params) => ({
        url: '/analytics/reports/branch-performance',
        params: params || undefined,
      }),
      transformResponse: (response: unknown) => unwrapList<any>(response),
      providesTags: ['ANALYTICS'],
    }),
    getPayments: builder.query<
      { data: any[]; meta?: any },
      { organizationId?: string; branchId?: string; status?: string; page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({ url: '/payments', params }),
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return { data: response };
        const body = response as { data?: any[]; meta?: any };
        return { data: body?.data ?? [], meta: body?.meta };
      },
      providesTags: ['PAYMENT'],
    }),
    refundPayment: builder.mutation<any, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/payments/${id}/refund`, method: 'POST', body }),
      invalidatesTags: ['PAYMENT', 'ANALYTICS', 'DASHBOARD'],
    }),
    getUsers: builder.query<
      { data: any[]; meta?: any },
      { page?: number; limit?: number; search?: string; role?: string; status?: string } | void
    >({
      query: (params) => ({ url: '/users', params: params || undefined }),
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return { data: response };
        const body = response as { data?: any[]; meta?: any };
        return { data: body?.data ?? [], meta: body?.meta };
      },
      providesTags: ['USER', 'STAFF'],
    }),
    updateUserStatus: builder.mutation<any, { id: string; status?: string }>({
      query: ({ id, status }) => ({
        url: `/users/status/${id}`,
        method: 'PATCH',
        body: status ? { status } : {},
      }),
      invalidatesTags: ['USER', 'STAFF'],
    }),
  }),
});

export const {
  useGetMyOrganizationsQuery,
  useGetOrganizationsQuery,
  useGetRestaurantsQuery,
  useGetRestaurantQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useGetBranchesQuery,
  useGetBranchQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useGetOperatingHoursQuery,
  useSetOperatingHoursMutation,
  useGetBranchSettingsQuery,
  useUpdateBranchSettingsMutation,
  useGetBranchStaffQuery,
  useCreateBranchStaffMutation,
  useUpdateBranchStaffMutation,
  useDeleteBranchStaffMutation,
  useGetTablesQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
  useRegenerateTableQrMutation,
  useGetMenuCategoriesQuery,
  useGetMenuItemsQuery,
  useCreateMenuCategoryMutation,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useGetAnalyticsOverviewQuery,
  useGetBranchPerformanceQuery,
  useGetPaymentsQuery,
  useRefundPaymentMutation,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
} = adminApi;
