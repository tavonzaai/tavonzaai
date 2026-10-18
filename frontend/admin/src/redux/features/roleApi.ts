import { rtkBaseApi } from '../api/baseApi';

export interface PermissionItem {
  id: string;
  moduleName: string;
  action: string;
  permissionKey: string;
  description?: string;
}

export interface PermissionsCatalogResponse {
  total: number;
  grouped: Record<string, PermissionItem[]>;
  permissions: PermissionItem[];
}

export interface RoleItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleDetailResponse extends RoleItem {
  matrix: Record<string, Record<string, boolean>>;
  permissions: string[];
}

export interface CreateRolePayload {
  name: string;
  slug?: string;
  description?: string;
  permissionKeys?: string[];
  matrix?: Record<string, Record<string, boolean>>;
}

export interface UpdateRolePayload {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  permissionKeys?: string[];
  matrix?: Record<string, Record<string, boolean>>;
}

export interface UserRoleResponse {
  userId: string;
  role: RoleItem | null;
  permissions: string[];
}

export interface CurrentUserCapabilities {
  userId: string;
  email: string;
  globalRole: string;
  role: RoleItem | null;
  permissions: string[];
}

export const roleApi = rtkBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. GET /authorization/me
    getMyCapabilities: builder.query<CurrentUserCapabilities, void>({
      query: () => '/authorization/me',
      transformResponse: (res: any) => res?.data || res,
      providesTags: ['ROLE', 'PERMISSION'],
    }),

    // 2. GET /authorization/permissions
    getPermissions: builder.query<PermissionsCatalogResponse, void>({
      query: () => '/authorization/permissions',
      transformResponse: (res: any) => {
        const payload = res?.data || res;
        return {
          total: payload?.total || 0,
          grouped: payload?.grouped || {},
          permissions: payload?.permissions || [],
        };
      },
      providesTags: ['PERMISSION'],
    }),

    // 3. GET /authorization/roles
    getRoles: builder.query<RoleItem[], string | void>({
      query: (search) => (search ? `/authorization/roles?search=${encodeURIComponent(search)}` : '/authorization/roles'),
      transformResponse: (res: any) => {
        const payload = res?.data || res;
        return Array.isArray(payload) ? payload : [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ROLE' as const, id })),
              { type: 'ROLE' as const, id: 'LIST' },
            ]
          : [{ type: 'ROLE' as const, id: 'LIST' }],
    }),

    // 4. GET /authorization/roles/:id
    getRoleById: builder.query<RoleDetailResponse, string>({
      query: (id) => `/authorization/roles/${encodeURIComponent(id)}`,
      transformResponse: (res: any) => res?.data || res,
      providesTags: (result, error, id) => [{ type: 'ROLE', id }],
    }),

    // 5. POST /authorization/roles
    createRole: builder.mutation<RoleDetailResponse, CreateRolePayload>({
      query: (body) => ({
        url: '/authorization/roles',
        method: 'POST',
        body,
      }),
      transformResponse: (res: any) => res?.data || res,
      invalidatesTags: [{ type: 'ROLE', id: 'LIST' }],
    }),

    // 6. PATCH /authorization/roles/:id
    updateRole: builder.mutation<RoleDetailResponse, UpdateRolePayload>({
      query: ({ id, ...body }) => ({
        url: `/authorization/roles/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (res: any) => res?.data || res,
      invalidatesTags: (result, error, { id }) => [
        { type: 'ROLE', id },
        { type: 'ROLE', id: 'LIST' },
        'PERMISSION',
      ],
    }),

    // 7. DELETE /authorization/roles/:id
    deleteRole: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/authorization/roles/${encodeURIComponent(id)}`,
        method: 'DELETE',
      }),
      transformResponse: (res: any) => res?.data || res,
      invalidatesTags: [{ type: 'ROLE', id: 'LIST' }],
    }),

    // 8. GET /authorization/users/:userId/role
    getUserRole: builder.query<UserRoleResponse, string>({
      query: (userId) => `/authorization/users/${encodeURIComponent(userId)}/role`,
      transformResponse: (res: any) => res?.data || res,
      providesTags: (result, error, userId) => [{ type: 'USER', id: userId }],
    }),

    // 9. POST /authorization/users/:userId/role
    assignUserRole: builder.mutation<{ id: string; userId: string; roleId: string }, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({
        url: `/authorization/users/${encodeURIComponent(userId)}/role`,
        method: 'POST',
        body: { roleId },
      }),
      transformResponse: (res: any) => res?.data || res,
      invalidatesTags: (result, error, { userId }) => [
        { type: 'USER', id: userId },
        { type: 'ROLE', id: 'LIST' },
      ],
    }),

    // 10. DELETE /authorization/users/:userId/role
    removeUserRole: builder.mutation<{ success: boolean; message: string }, string>({
      query: (userId) => ({
        url: `/authorization/users/${encodeURIComponent(userId)}/role`,
        method: 'DELETE',
      }),
      transformResponse: (res: any) => res?.data || res,
      invalidatesTags: (result, error, userId) => [
        { type: 'USER', id: userId },
        { type: 'ROLE', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetMyCapabilitiesQuery,
  useGetPermissionsQuery,
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetUserRoleQuery,
  useAssignUserRoleMutation,
  useRemoveUserRoleMutation,
} = roleApi;
