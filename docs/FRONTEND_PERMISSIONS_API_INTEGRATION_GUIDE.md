# Frontend API Integration Guide: Roles & Permissions Matrix

This document is the official integration specification for frontend developers connecting to the **Tavonza AI RBAC & Permissions Engine**.

---

## 1. Architecture Overview

Tavonza AI provides a **live, dynamic permission model**:

1. **Global Roles** (`SUPER_ADMIN`, `ADMIN`, `STAFF`, `CUSTOMER`): High-level system identities.
2. **Dynamic Roles** (`admin`, `branch-manager`, `waiter`, `kitchen-staff`, `cashier`, `host`, custom roles): Configurable in the Admin Dashboard via the **Permission Matrix**.
3. **Branch Staff Assignments**: Staff members assigned to a branch (`staff_assignments`) dynamically inherit their role's permissions plus any extra granular grants attached to their branch assignment.
4. **Canonical Permission Keys**: Standardized as `module:action` (e.g. `orders:read`, `menu:read`, `tables:update`).

---

## 2. Authentication & Headers

Every request to protected authorization endpoints must include the standard Bearer token:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

---

## 3. Endpoints Reference

### 3.1. Current User Capabilities

Use these endpoints to determine what the currently logged-in user is allowed to do.

#### `GET /authorization/me`
Returns the caller's assigned role, effective permissions (combined from global role, dynamic database role, and branch staff assignments), and active scopes.

- **Headers**: `Authorization: Bearer <accessToken>`
- **Response `200 OK`**:
```json
{
  "userId": "ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27",
  "email": "waiter.john@tavonza.ai",
  "globalRole": "STAFF",
  "role": {
    "roleId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "roleName": "Waiter",
    "roleSlug": "waiter",
    "isSystem": true,
    "assignedAt": "2026-10-26T12:00:00.000Z"
  },
  "permissions": [
    "orders:read",
    "orders:write",
    "orders:update",
    "orders:accept",
    "orders:reject",
    "orders:serve",
    "tables:read",
    "tables:update",
    "alerts:read",
    "alerts:acknowledge",
    "alerts:resolve",
    "menu:read"
  ],
  "scopes": [
    {
      "type": "branch",
      "id": "bbbbbbbb-1111-2222-3333-cccccccccccc"
    }
  ]
}
```

> [!NOTE]
> `GET /users/me` and `GET /auth/me` also return `permissions: string[]` and `scopes: Scope[]` on the root user object.

---

### 3.2. Permissions Catalog

#### `GET /authorization/permissions`
Retrieves all available atomic system capabilities grouped by module. Use this to render the permission matrix categories and checkboxes.

- **Required Permission**: `permissions:read`
- **Response `200 OK`**:
```json
{
  "total": 45,
  "grouped": {
    "menu": [
      {
        "id": "11111111-2222-3333-4444-555555555555",
        "moduleName": "menu",
        "action": "read",
        "permissionKey": "menu:read",
        "description": "View menu categories, items, and modifiers"
      },
      {
        "id": "22222222-3333-4444-5555-666666666666",
        "moduleName": "menu",
        "action": "write",
        "permissionKey": "menu:write",
        "description": "Create menu items and categories"
      },
      {
        "id": "33333333-4444-5555-6666-777777777777",
        "moduleName": "menu",
        "action": "update",
        "permissionKey": "menu:update",
        "description": "Update menu pricing and stock availability"
      }
    ],
    "orders": [
      {
        "id": "44444444-5555-6666-7777-888888888888",
        "moduleName": "orders",
        "action": "read",
        "permissionKey": "orders:read",
        "description": "View order history, status, and tickets"
      }
    ]
  },
  "permissions": [
    {
      "id": "11111111-2222-3333-4444-555555555555",
      "moduleName": "menu",
      "action": "read",
      "permissionKey": "menu:read",
      "description": "View menu categories, items, and modifiers"
    }
  ]
}
```

---

### 3.3. Dynamic Roles Management

#### `GET /authorization/roles`
Returns all system and custom roles with assignment and permission counts.

- **Required Permission**: `roles:read`
- **Query Params**: `search` (optional string)
- **Response `200 OK`**:
```json
[
  {
    "id": "role-uuid-1",
    "name": "Waiter",
    "slug": "waiter",
    "description": "Floor staff managing dining sessions",
    "isSystem": true,
    "userCount": 4,
    "permissionCount": 11,
    "createdAt": "2026-10-01T00:00:00.000Z",
    "updatedAt": "2026-10-26T14:00:00.000Z"
  }
]
```

#### `GET /authorization/roles/:id`
Returns detailed role metadata including current permission keys and module-action matrix.

- **Required Permission**: `roles:read`
- **Response `200 OK`**:
```json
{
  "id": "role-uuid-1",
  "name": "Waiter",
  "slug": "waiter",
  "description": "Floor staff managing dining sessions",
  "isSystem": true,
  "userCount": 4,
  "permissionCount": 11,
  "permissions": [
    "orders:read",
    "orders:write",
    "orders:update",
    "tables:read",
    "tables:update"
  ],
  "matrix": {
    "orders": {
      "read": true,
      "write": true,
      "update": true,
      "delete": false
    },
    "tables": {
      "read": true,
      "update": true
    }
  }
}
```

#### `PATCH /authorization/roles/:id`
Updates a role's permissions. When saved, all staff members assigned to this role dynamically inherit the new permissions immediately.

- **Required Permission**: `roles:update`
- **Request Body**:
```json
{
  "name": "Waiter",
  "description": "Floor staff managing dining sessions and orders",
  "permissionKeys": [
    "orders:read",
    "orders:write",
    "orders:update",
    "orders:accept",
    "orders:serve",
    "tables:read",
    "tables:update",
    "menu:read"
  ]
}
```
*(Alternatively, you can supply `matrix: { "menu": { "read": true } }`)*
- **Response `200 OK`**: Role detail object with updated permissions.

#### `POST /authorization/roles`
Creates a new custom role.

- **Required Permission**: `roles:write`
- **Request Body**:
```json
{
  "name": "Senior Sommelier",
  "description": "Wine expert managing bar and beverage catalog",
  "permissionKeys": [
    "menu:read",
    "orders:read",
    "inventory:read"
  ]
}
```

#### `DELETE /authorization/roles/:id`
Deletes a custom role (blocked if users are currently assigned or if it is a system role).

- **Required Permission**: `roles:delete`

---

### 3.4. Direct User Role Assignment

#### `GET /authorization/users/:userId/role`
- **Required Permission**: `roles:read`
- **Response `200 OK`**:
```json
{
  "userId": "user-uuid",
  "role": {
    "roleId": "role-uuid",
    "roleName": "Waiter",
    "roleSlug": "waiter",
    "isSystem": true,
    "assignedAt": "2026-10-26T12:00:00.000Z"
  },
  "permissions": ["orders:read", "tables:read"]
}
```

#### `POST /authorization/users/:userId/role`
Assigns a user to a dynamic role.
- **Required Permission**: `users:assign_role` or `roles:update`
- **Request Body**:
```json
{
  "roleId": "role-uuid"
}
```

#### `DELETE /authorization/users/:userId/role`
Removes a user's assigned dynamic role.

---

### 3.5. Branch Staff Assignment & Extra Grants

When viewing staff under a specific branch (e.g. in Team Directory), admins can attach extra granular permissions to that staff member's branch assignment.

#### `PATCH /branches/:branchId/staff/:staffId`
- **Required Permission**: `staff:update`
- **Request Body**:
```json
{
  "role": "WAITER",
  "permissions": [
    "menu:read",
    "tables:update",
    "discounts:apply"
  ]
}
```
> [!TIP]
> The backend accepts **both** canonical keys (`menu:read`, `tables:update`) and legacy action strings (`MANAGE_MENU`, `VIEW_ORDERS`). The backend automatically normalizes them so they match the catalog checkboxes.

---

## 4. Frontend Integration Examples

### 4.1. RTK Query Endpoints (`roleApi.ts`)

```typescript
import { rtkBaseApi } from '../api/baseApi';

export const roleApi = rtkBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Live Capabilities of Current User
    getMyCapabilities: builder.query<any, void>({
      query: () => '/authorization/me',
      transformResponse: (res: any) => res?.data || res,
      providesTags: ['ROLE', 'PERMISSION', 'USER'],
    }),

    // 2. Full Catalog of Permissions
    getPermissions: builder.query<any, void>({
      query: () => '/authorization/permissions',
      transformResponse: (res: any) => res?.data || res,
      providesTags: ['PERMISSION'],
    }),

    // 3. List of Roles
    getRoles: builder.query<any[], string | void>({
      query: (search) => (search ? `/authorization/roles?search=${encodeURIComponent(search)}` : '/authorization/roles'),
      transformResponse: (res: any) => res?.data || res,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ROLE' as const, id })),
              { type: 'ROLE' as const, id: 'LIST' },
            ]
          : [{ type: 'ROLE' as const, id: 'LIST' }],
    }),

    // 4. Update Role Matrix
    updateRole: builder.mutation<any, { id: string; permissionKeys: string[] }>({
      query: ({ id, permissionKeys }) => ({
        url: `/authorization/roles/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body: { permissionKeys },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ROLE', id },
        { type: 'ROLE', id: 'LIST' },
        'PERMISSION',
        'USER',
      ],
    }),

    // 5. Assign Dynamic Role to User
    assignUserRole: builder.mutation<any, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({
        url: `/authorization/users/${encodeURIComponent(userId)}/role`,
        method: 'POST',
        body: { roleId },
      }),
      invalidatesTags: ['USER', 'ROLE'],
    }),
  }),
});
```

---

### 4.2. `usePermission` Hook Pattern

Use this pattern in your frontend client to check permissions smoothly across all surfaces:

```typescript
import { useAppSelector } from '@/redux/hooks';
import { useGetMyCapabilitiesQuery } from '@/redux/features/roleApi';

export function usePermission() {
  const user = useAppSelector((state) => state.auth.user);
  
  // Query live capabilities from backend
  const { data: myCapabilities, refetch: refetchCapabilities } = useGetMyCapabilitiesQuery(undefined, {
    skip: !user,
  });

  const effectiveRole = (
    myCapabilities?.globalRole ||
    user?.globalRole ||
    user?.role ||
    ''
  ).toUpperCase();

  // Unified permissions from either live capabilities or user profile
  const permissions: string[] =
    myCapabilities?.permissions && myCapabilities.permissions.length > 0
      ? myCapabilities.permissions
      : user?.permissions || [];

  // Super Admin / Tenant Admin Bypass
  const isPrivileged =
    effectiveRole === 'SUPER_ADMIN' ||
    effectiveRole === 'PLATFORM_SUPER_ADMIN' ||
    effectiveRole === 'ADMIN' ||
    effectiveRole === 'RESTAURANT_OWNER' ||
    effectiveRole === 'ORGANIZATION_OWNER';

  /**
   * Check if user holds a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (isPrivileged) return true;
    if (permissions.includes('*') || permissions.includes('*:*')) return true;
    if (permissions.includes(permission)) return true;

    // Check wildcard module matching e.g. "menu:*" matches "menu:read"
    const [moduleName] = permission.split(':');
    if (moduleName && permissions.includes(`${moduleName}:*`)) return true;

    // Check manage implies read/write/update
    if (moduleName && permissions.includes(`${moduleName}:manage`)) return true;

    return false;
  };

  const hasAnyPermission = (...perms: string[]): boolean => {
    if (isPrivileged) return true;
    if (perms.length === 0) return true;
    return perms.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (...perms: string[]): boolean => {
    if (isPrivileged) return true;
    if (perms.length === 0) return true;
    return perms.every((p) => hasPermission(p));
  };

  return {
    user,
    role: effectiveRole,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isPrivileged,
    refetchCapabilities,
  };
}
```

---

### 4.3. Protecting Routes & Components

```tsx
import React from 'react';
import { usePermission } from '@/hooks/usePermission';

export function MenuEditButton({ onClick }: { onClick: () => void }) {
  const { hasPermission } = usePermission();

  if (!hasPermission('menu:update')) {
    return null; // Hide button if user cannot update menu
  }

  return (
    <button onClick={onClick} className="btn-primary">
      Edit Dish
    </button>
  );
}
```

---

## 5. Summary of Best Practices for Frontend Devs

1. **Tag Invalidation**: When modifying roles in the Permission Matrix (`updateRole`) or staff in the directory (`updateBranchStaff`), invalidate `'ROLE'`, `'PERMISSION'`, and `'USER'` RTK tags so the UI automatically updates without manual page refreshes.
2. **Canonical Keys**: Always use canonical colon-separated keys (`orders:read`, `menu:read`, `tables:update`) for permission checks and payload submissions.
3. **Privileged Bypass**: In `usePermission.ts`, ensure `ADMIN` and `RESTAURANT_OWNER` are treated as privileged so owners are never locked out of their own platform features.
4. **Live Capabilities**: Leverage `GET /authorization/me` for live checks to ensure changes made by administrators take effect immediately without requiring users to wait for token expiration.
