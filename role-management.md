# Role & Permission Management Guide

This document is the authoritative developer guide for creating roles, assigning permissions, and integrating Role-Based Access Control (RBAC) across the **Tavonza AI** frontend applications (Admin Dashboard, Manager, Cashier, Waiter, Kitchen).

---

## 1. Architectural Foundation & Mental Model

### Core Concepts

In Tavonza AI, authorization follows a capability- and scope-based model:
$$\text{Actor} + \text{Permission} + \text{Scope} + \text{Resource} + \text{Domain Rules}$$

1. **Backend is the Sole Security Authority**:
   - Client-side checks (hidden buttons, disabled inputs, route guards) are strictly for **User Experience (UX)**.
   - The backend validates the user's token and verifies their database-assigned capabilities on every single request using `PermissionsGuard` and `@RequirePermissions(Permission.KEY)`.
   - Even if a malicious user bypasses frontend hiding, the backend will reject the request with HTTP `403 Forbidden`.

2. **Database Tables & Invariants** (defined in `packages/database/src/schema/rbac.ts`):
   - `roles`: Dynamic roles (`id`, `name`, `slug`, `description`, `is_system`).
   - `permissions`: Atomic capabilities formatted as `module_name:action` (`id`, `module_name`, `action`, `permission_key`).
   - `role_permissions`: Join table linking roles to permissions.
   - `user_roles`: Maps a user to their dynamic role. **Invariant**: Enforced by a unique constraint on `user_id`—every user has **at most one dynamic role**.
   - `staff_assignments`: For staff working inside branches (`branch_id`, `role: staffRoleEnum`, `permissions: text[]`).

3. **Two Formats for Permissions**:
   - **Array format (Flat keys)**: `["orders:read", "orders:write", "tables:read"]`
   - **Matrix format (Nested checkboxes)**:
     ```json
     {
       "orders": { "read": true, "write": true, "update": true, "delete": false },
       "tables": { "read": true, "write": false, "update": true, "delete": false }
     }
     ```
   The backend API accepts **either** or **both** formats seamlessly when creating or updating roles!

---

## 2. Backend API Reference for Role Management

All endpoints require `Bearer <token>` authentication.

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/authorization/me` | *Authenticated* | Get caller's dynamic role & resolved permissions array |
| `GET` | `/authorization/permissions` | `permissions:read` | List all available permissions grouped by module |
| `GET` | `/authorization/roles` | `roles:read` | List all roles with user & permission counts |
| `GET` | `/authorization/roles/:id` | `roles:read` | Get role detail with pre-computed matrix representation |
| `POST` | `/authorization/roles` | `roles:write` | Create a new role with permissions |
| `PATCH` | `/authorization/roles/:id` | `roles:update` | Update role metadata and/or permission matrix |
| `DELETE` | `/authorization/roles/:id` | `roles:delete` | Delete custom role (system roles & assigned roles blocked) |
| `GET` | `/authorization/users/:userId/role`| `roles:read` | Get assigned role & permissions for a specific user |
| `POST` | `/authorization/users/:userId/role`| `users:assign_role` | Assign or switch role for a user (enforces 1 role) |
| `DELETE`| `/authorization/users/:userId/role`| `users:assign_role` | Revoke assigned role from user |

---

## 3. Concrete API Usage Examples

### Step 1: Fetch Available Permissions Catalog

Before displaying a creation form, the frontend fetches all declared system permissions:

```http
GET /api/v1/authorization/permissions HTTP/1.1
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200 OK):**
```json
{
  "total": 32,
  "grouped": {
    "orders": [
      { "id": "uuid-1", "moduleName": "orders", "action": "read", "permissionKey": "orders:read" },
      { "id": "uuid-2", "moduleName": "orders", "action": "write", "permissionKey": "orders:write" },
      { "id": "uuid-3", "moduleName": "orders", "action": "update", "permissionKey": "orders:update" },
      { "id": "uuid-4", "moduleName": "orders", "action": "delete", "permissionKey": "orders:delete" }
    ],
    "tables": [
      { "id": "uuid-5", "moduleName": "tables", "action": "read", "permissionKey": "tables:read" },
      { "id": "uuid-6", "moduleName": "tables", "action": "update", "permissionKey": "tables:update" }
    ],
    "menu": [
      { "id": "uuid-7", "moduleName": "menu", "action": "read", "permissionKey": "menu:read" },
      { "id": "uuid-8", "moduleName": "menu", "action": "write", "permissionKey": "menu:write" }
    ]
  }
}
```

---

### Step 2: Create a New Role & Assign Permissions

You can create a role using **either** the UI Matrix format or the Flat Permission Keys array.

#### Option A: Using the Checkbox Matrix (Recommended for UI)

```http
POST /api/v1/authorization/roles HTTP/1.1
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "name": "Shift Floor Supervisor",
  "slug": "shift-floor-supervisor",
  "description": "Floor supervisor who oversees dining tables and order statuses",
  "matrix": {
    "orders": {
      "read": true,
      "write": true,
      "update": true,
      "delete": false
    },
    "tables": {
      "read": true,
      "write": false,
      "update": true,
      "delete": false
    },
    "menu": {
      "read": true,
      "write": false,
      "update": false,
      "delete": false
    }
  }
}
```

#### Option B: Using Flat Permission Keys

```http
POST /api/v1/authorization/roles HTTP/1.1
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "name": "Shift Floor Supervisor",
  "description": "Floor supervisor who oversees dining tables and order statuses",
  "permissionKeys": [
    "orders:read",
    "orders:write",
    "orders:update",
    "tables:read",
    "tables:update",
    "menu:read"
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "c1f7b920-802c-4958-8683-1250392f44ad",
  "name": "Shift Floor Supervisor",
  "slug": "shift-floor-supervisor",
  "description": "Floor supervisor who oversees dining tables and order statuses",
  "isSystem": false,
  "userCount": 0,
  "permissionCount": 6,
  "matrix": {
    "orders": { "read": true, "write": true, "update": true, "delete": false },
    "tables": { "read": true, "write": false, "update": true, "delete": false },
    "menu": { "read": true, "write": false, "update": false, "delete": false }
  },
  "permissions": [
    "orders:read",
    "orders:write",
    "orders:update",
    "tables:read",
    "tables:update",
    "menu:read"
  ],
  "createdAt": "2026-10-15T04:20:00.000Z",
  "updatedAt": "2026-10-15T04:20:00.000Z"
}
```

---

### Step 3: Assign the Role to a User

To assign or change a user's role:

```http
POST /api/v1/authorization/users/8e0fd45e-a6a9-46f4-90aa-9a5c7eb1dfbb/role HTTP/1.1
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "roleId": "c1f7b920-802c-4958-8683-1250392f44ad"
}
```

**Response (200 OK):**
```json
{
  "id": "7b0b6863-1234-5678-90ab-cdef12345678",
  "userId": "8e0fd45e-a6a9-46f4-90aa-9a5c7eb1dfbb",
  "roleId": "c1f7b920-802c-4958-8683-1250392f44ad",
  "assignedAt": "2026-10-15T04:22:15.000Z"
}
```

*(Note: Because of the single-role invariant, assigning a new `roleId` automatically replaces any previously assigned role for that user).*

---

## 4. Frontend Developer Integration Guide

### 4.1 How Frontend Knows What the Current User Can Do

When a user logs in, their profile contains:
- `user.role` (e.g., `'ADMIN'`, `'STAFF'`, `'SUPER_ADMIN'`)
- `user.permissions` (e.g., `['orders:read', 'orders:write', 'tables:read']`)

Additionally, on application load or profile refresh, the client calls `GET /api/v1/authorization/me` to get the fresh authoritative role and permission list:

```typescript
// GET /api/v1/authorization/me
interface CurrentUserCapabilities {
  userId: string;
  email: string;
  globalRole: string;
  role: {
    id: string;
    name: string;
    slug: string;
    description: string;
    isSystem: boolean;
  } | null;
  permissions: string[]; // e.g. ["orders:read", "orders:write", "*"]
}
```

---

### 4.2 Permission Checking Hook: `usePermission`

Frontend developers should use a clean React hook to verify permissions without hardcoding checks everywhere:

```tsx
// frontend/admin/src/hooks/usePermission.ts
import { useAppSelector } from '../redux/store';

export function usePermission() {
  const user = useAppSelector((state) => state.auth.user);
  const permissions = user?.permissions || [];
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  /**
   * Check if current user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  };

  /**
   * Check if current user has ANY of the specified permissions
   */
  const hasAnyPermission = (...perms: string[]): boolean => {
    if (isSuperAdmin) return true;
    if (permissions.includes('*')) return true;
    return perms.some((p) => permissions.includes(p));
  };

  /**
   * Check if current user has ALL specified permissions
   */
  const hasAllPermissions = (...perms: string[]): boolean => {
    if (isSuperAdmin) return true;
    if (permissions.includes('*')) return true;
    return perms.every((p) => permissions.includes(p));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
  };
}
```

---

### 4.3 Declarative UI Gating: `<PermissionGate />`

Instead of cluttering JSX with `if/else`, wrap protected buttons, tabs, and menus in a gate component:

```tsx
// frontend/admin/src/components/auth/PermissionGate.tsx
import React from 'react';
import { usePermission } from '../../hooks/usePermission';

interface PermissionGateProps {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  let isAllowed = true;

  if (permission && !hasPermission(permission)) {
    isAllowed = false;
  }
  if (anyOf && !hasAnyPermission(...anyOf)) {
    isAllowed = false;
  }
  if (allOf && !hasAllPermissions(...allOf)) {
    isAllowed = false;
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
```

#### How to use in JSX:

```tsx
// Example 1: Hide/show a button
<PermissionGate permission="orders:write">
  <button onClick={handleCreateOrder} className="btn-primary">
    + Create Order
  </button>
</PermissionGate>

// Example 2: Show disabled button with tooltip if not permitted
<PermissionGate 
  permission="roles:delete" 
  fallback={<button disabled title="You do not have permission to delete roles">Delete</button>}
>
  <button onClick={() => deleteRole(role.id)} className="btn-danger">
    Delete Role
  </button>
</PermissionGate>
```

---

### 4.4 Next.js Page & Route Guard

Protect entire admin pages using a route wrapper or Next.js layout:

```tsx
// frontend/admin/src/components/auth/RouteGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermission } from '../../hooks/usePermission';

export function RequirePermissionPage({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const { hasPermission, permissions } = usePermission();
  const router = useRouter();

  const allowed = hasPermission(permission);

  useEffect(() => {
    if (!allowed && permissions.length > 0) {
      router.replace('/admin-dashboard/unauthorized');
    }
  }, [allowed, permissions, router]);

  if (!allowed) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-500">Access Denied</h2>
        <p className="text-gray-400 mt-2">You do not have permission ({permission}) to view this section.</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

### 4.5 Building the Role Management UI Screens

The frontend developer needs 3 primary views for role management:

#### 1. Roles Overview Table (`/admin-dashboard/roles`)
- **Columns**: Name, Slug, Description, User Count, Permission Count, Type (`System` vs `Custom`), Actions.
- **Controls**:
  - `Create New Role` button (gated by `roles:write`).
  - `Edit` button (gated by `roles:update`).
  - `Delete` button (gated by `roles:delete`). Disabled if `isSystem === true` or `userCount > 0`.

#### 2. Create / Edit Role Form (`/admin-dashboard/roles/create` or Modal)
- **Fields**:
  - `Name` (Text input, e.g. "Kitchen Supervisor")
  - `Slug` (Text input or auto-generated, e.g. "kitchen-supervisor")
  - `Description` (Textarea)
- **Interactive Permission Matrix Grid**:
  - Rows: Modules fetched from `GET /authorization/permissions` (e.g. `orders`, `tables`, `menu`, `staff`, `billing`, `inventory`).
  - Columns: Actions (`read`, `write`, `update`, `delete`).
  - "Select All for Module" checkbox row toggle.
  - Submitting sends the `matrix` object directly to `POST /authorization/roles` or `PATCH /authorization/roles/:id`.

#### 3. Assign Role Modal (`/admin-dashboard/users`)
- Triggered from User Management table.
- Fetches all roles via `GET /authorization/roles`.
- Displays dropdown showing current role and allowing selection of a new role.
- Submits `POST /authorization/users/:userId/role` with `{ roleId }`.

---

### 4.6 Redux RTK Query Slice for Role Management

To connect the UI to the backend effortlessly, add this feature API to `frontend/admin/src/redux/features/roleApi.ts`:

```typescript
// frontend/admin/src/redux/features/roleApi.ts
import { rtkBaseApi } from '../api/baseApi';

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoleDetail extends Role {
  matrix: Record<string, Record<string, boolean>>;
  permissions: string[];
}

export interface PermissionsCatalog {
  total: number;
  grouped: Record<string, Array<{ id: string; moduleName: string; action: string; permissionKey: string }>>;
  permissions: Array<{ id: string; moduleName: string; action: string; permissionKey: string }>;
}

export const roleApi = rtkBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query<PermissionsCatalog, void>({
      query: () => '/authorization/permissions',
    }),
    getRoles: builder.query<Role[], string | void>({
      query: (search) => (search ? `/authorization/roles?search=${encodeURIComponent(search)}` : '/authorization/roles'),
      providesTags: ['Roles'],
    }),
    getRoleById: builder.query<RoleDetail, string>({
      query: (id) => `/authorization/roles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Roles', id }],
    }),
    createRole: builder.mutation<RoleDetail, { name: string; slug?: string; description?: string; matrix?: any; permissionKeys?: string[] }>({
      query: (body) => ({
        url: '/authorization/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Roles'],
    }),
    updateRole: builder.mutation<RoleDetail, { id: string; name?: string; slug?: string; description?: string; matrix?: any; permissionKeys?: string[] }>({
      query: ({ id, ...body }) => ({
        url: `/authorization/roles/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['Roles', { type: 'Roles', id }],
    }),
    deleteRole: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/authorization/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),
    assignUserRole: builder.mutation<{ id: string; userId: string; roleId: string }, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({
        url: `/authorization/users/${userId}/role`,
        method: 'POST',
        body: { roleId },
      }),
      invalidatesTags: ['Users', 'Roles'],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignUserRoleMutation,
} = roleApi;
```

---

## 5. Summary Checklist for Frontend Developer

- [ ] **Auth State**: Ensure `user.permissions` is stored in Redux on login or refreshed via `GET /authorization/me`.
- [ ] **Gating Elements**: Use `<PermissionGate permission="xxx">` to hide or disable buttons/tabs.
- [ ] **Handling 403 Errors**: In `baseApiFetch` or RTK Query error handlers, catch status `403` and display a user-friendly notification: *"You do not have permission to perform this action."*
- [ ] **Matrix Checkbox UX**: When creating or editing a role, render a grid of modules vs actions so administrators can easily toggle permissions.
- [ ] **Single-Role UI**: When managing user assignments, present a single selectable role (not multi-select) because the database strictly enforces 1 dynamic role per user.
