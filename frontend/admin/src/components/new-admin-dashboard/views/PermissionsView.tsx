'use client';

import React, { useState } from 'react';
import {
  Lock,
  Check,
  Trash2,
  LayoutDashboard,
  UtensilsCrossed,
  Building2,
  Grid,
  BookOpen,
  Users,
  CreditCard,
  FileText,
  Settings,
  X,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

interface RoleDefinition {
  id: string;
  name: string;
  staffCount: number;
  isLocked?: boolean;
}

interface PermissionItem {
  id: string;
  label: string;
  category: string;
}

interface PermissionCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: PermissionItem[];
}

const INITIAL_ROLES: RoleDefinition[] = [
  { id: 'admin', name: 'Admin', staffCount: 1, isLocked: true },
  { id: 'manager', name: 'Manager', staffCount: 2 },
  { id: 'waiter', name: 'Waiter', staffCount: 4 },
  { id: 'chef', name: 'Chef', staffCount: 6 },
  { id: 'cashier', name: 'Cashier', staffCount: 8 },
];

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    permissions: [
      { id: 'dash_view', label: 'View Dashboard', category: 'dashboard' },
      { id: 'dash_analytics', label: 'View Analytics Summary', category: 'dashboard' },
    ],
  },
  {
    id: 'restaurants',
    title: 'Restaurants',
    icon: UtensilsCrossed,
    permissions: [
      { id: 'rest_view', label: 'View Restaurants', category: 'restaurants' },
      { id: 'rest_create', label: 'Create Restaurant', category: 'restaurants' },
      { id: 'rest_edit', label: 'Edit Restaurant', category: 'restaurants' },
      { id: 'rest_delete', label: 'Delete Restaurant', category: 'restaurants' },
    ],
  },
  {
    id: 'branches',
    title: 'Branches',
    icon: Building2,
    permissions: [
      { id: 'branch_view', label: 'View Branches', category: 'branches' },
      { id: 'branch_create', label: 'Create Branch', category: 'branches' },
      { id: 'branch_edit', label: 'Edit Branch', category: 'branches' },
      { id: 'branch_config', label: 'Manage Configuration', category: 'branches' },
    ],
  },
  {
    id: 'tables',
    title: 'Tables',
    icon: Grid,
    permissions: [
      { id: 'table_view', label: 'View Tables', category: 'tables' },
      { id: 'table_manage', label: 'Add, Edit & Delete Tables', category: 'tables' },
    ],
  },
  {
    id: 'menu',
    title: 'Menu',
    icon: BookOpen,
    permissions: [
      { id: 'menu_view', label: 'View Menu', category: 'menu' },
      { id: 'menu_cats', label: 'Manage Categories', category: 'menu' },
      { id: 'menu_items', label: 'Manage Menu Items', category: 'menu' },
      { id: 'menu_delete', label: 'Disable or Delete Items', category: 'menu' },
    ],
  },
  {
    id: 'staff',
    title: 'Staff',
    icon: Users,
    permissions: [
      { id: 'staff_view', label: 'View Staff', category: 'staff' },
      { id: 'staff_invite', label: 'Invite Staff', category: 'staff' },
      { id: 'staff_role', label: 'Change Staff Role', category: 'staff' },
      { id: 'staff_deactivate', label: 'Deactivate Staff', category: 'staff' },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: CreditCard,
    permissions: [
      { id: 'pay_view', label: 'View Payments', category: 'payments' },
      { id: 'pay_config', label: 'Configure Payments', category: 'payments' },
      { id: 'pay_refund', label: 'Process Refunds', category: 'payments' },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: FileText,
    permissions: [
      { id: 'rep_view', label: 'View Reports', category: 'reports' },
      { id: 'rep_export', label: 'Export Reports', category: 'reports' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    permissions: [
      { id: 'set_view', label: 'View Settings', category: 'settings' },
      { id: 'set_edit', label: 'Edit Organization', category: 'settings' },
    ],
  },
];

// All permission IDs flattened (27 total)
const ALL_PERMISSION_IDS = PERMISSION_CATEGORIES.flatMap((c) => c.permissions.map((p) => p.id));
const TOTAL_PERMISSIONS_COUNT = ALL_PERMISSION_IDS.length; // 27

// Initial granted permissions mapping per role (matching exact values: Admin 27/27, Manager 25/27, Waiter 5/27, Chef 4/27, Cashier 5/27)
const INITIAL_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [...ALL_PERMISSION_IDS],
  manager: [
    'dash_view',
    'dash_analytics',
    'rest_view',
    'rest_create',
    'rest_edit',
    // 'rest_delete' is unchecked
    'branch_view',
    'branch_create',
    'branch_edit',
    'branch_config',
    'table_view',
    'table_manage',
    'menu_view',
    'menu_cats',
    'menu_items',
    'menu_delete',
    'staff_view',
    'staff_invite',
    'staff_role',
    'staff_deactivate',
    'pay_view',
    'pay_config',
    'pay_refund',
    'rep_view',
    'rep_export',
    'set_view',
    // 'set_edit' or 25 total
  ],
  waiter: [
    'dash_view',
    'rest_view',
    'branch_view',
    'table_view',
    'menu_view',
  ],
  chef: [
    'dash_view',
    'branch_view',
    'menu_view',
    'menu_items',
  ],
  cashier: [
    'dash_view',
    'branch_view',
    'menu_view',
    'pay_view',
    'pay_refund',
  ],
};

export default function PermissionsView() {
  const [roles, setRoles] = useState<RoleDefinition[]>(INITIAL_ROLES);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(INITIAL_ROLE_PERMISSIONS);
  const [deletingRole, setDeletingRole] = useState<RoleDefinition | null>(null);

  // Toggle single permission for a role
  const handleTogglePermission = (roleId: string, permId: string) => {
    if (roleId === 'admin') return; // Admin is locked

    setRolePermissions((prev) => {
      const current = prev[roleId] || [];
      const hasPerm = current.includes(permId);
      const updated = hasPerm ? current.filter((id) => id !== permId) : [...current, permId];
      return { ...prev, [roleId]: updated };
    });
  };

  // Toggle "Select All" for a category on a role
  const handleToggleCategorySelectAll = (roleId: string, category: PermissionCategory) => {
    if (roleId === 'admin') return; // Admin is locked

    const catPermIds = category.permissions.map((p) => p.id);
    const current = rolePermissions[roleId] || [];
    const allSelected = catPermIds.every((id) => current.includes(id));

    setRolePermissions((prev) => {
      const existing = prev[roleId] || [];
      let updated: string[];
      if (allSelected) {
        // Deselect all in category
        updated = existing.filter((id) => !catPermIds.includes(id));
      } else {
        // Select all in category
        const toAdd = catPermIds.filter((id) => !existing.includes(id));
        updated = [...existing, ...toAdd];
      }
      return { ...prev, [roleId]: updated };
    });
  };

  // Save changes handler
  const handleSaveChanges = () => {
    toast.success('Permissions matrix saved successfully!');
  };

  // Confirm delete custom role
  const handleConfirmDeleteRole = () => {
    if (!deletingRole) return;
    const name = deletingRole.name;
    setRoles((prev) => prev.filter((r) => r.id !== deletingRole.id));
    setRolePermissions((prev) => {
      const next = { ...prev };
      delete next[deletingRole.id];
      return next;
    });
    toast.success(`Role "${name}" deleted.`);
    setDeletingRole(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Row matching Figma snippet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col justify-start items-start gap-0.5">
          <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
            Permissions
          </h1>
          <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
            Control what each role can view and manage across your organization.
          </p>
        </div>

        <div className="flex justify-end items-center gap-2">
          <button
            type="button"
            onClick={handleSaveChanges}
            className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-['Inter'] leading-5 shadow-sm cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Role Overview Cards Row (Matching exact Figma cards layout: Admin, Manager, Waiter, Chef, Cashier) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {roles.map((role) => {
          const granted = rolePermissions[role.id] || [];
          const count = granted.length;
          const pct = Math.round((count / TOTAL_PERMISSIONS_COUNT) * 100);

          return (
            <div
              key={role.id}
              className="h-24 p-3.5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-between items-start shadow-lg hover:border-zinc-700 transition-all"
            >
              {/* Card Header: Dot + Name and Staff Badge */}
              <div className="self-stretch flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 bg-amber-400 rounded-full" />
                  <span className="text-zinc-100 text-sm font-semibold font-['Inter'] leading-4">
                    {role.name}
                  </span>
                </div>
                <div className="px-2 py-[3px] bg-neutral-800 rounded-lg">
                  <span className="text-gray-400 text-xs font-normal font-['Inter'] leading-4">
                    {role.staffCount} staff
                  </span>
                </div>
              </div>

              {/* Counts & Percentage */}
              <div className="self-stretch flex justify-between items-center">
                <span className="text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                  {count}/{TOTAL_PERMISSIONS_COUNT} permissions
                </span>
                <span className="text-amber-400 text-xs font-medium font-['Inter'] leading-4">
                  {pct}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="self-stretch h-1.5 bg-zinc-800 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-lg transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix Grid Table matching Figma Snippet */}
      <div className="w-full overflow-x-auto rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 bg-neutral-900 shadow-2xl">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          {/* Table Role Headers */}
          <thead>
            <tr className="border-b border-zinc-800 bg-neutral-900">
              {/* Permission Column Header */}
              <th className="w-72 px-4 py-4 text-zinc-100 text-sm font-medium font-['Inter'] leading-5 border-r border-zinc-800">
                Permission
              </th>

              {/* Role Columns */}
              {roles.map((role) => {
                const granted = rolePermissions[role.id] || [];
                const count = granted.length;

                return (
                  <th
                    key={role.id}
                    className="relative px-4 py-4 text-center border-r border-zinc-800 min-w-[130px]"
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-zinc-100 text-base font-medium font-['Inter'] leading-4">
                        {role.name}
                      </span>
                      <span className="text-neutral-400 text-[10px] font-normal font-['Inter'] leading-4">
                        {count}/{TOTAL_PERMISSIONS_COUNT}
                      </span>
                    </div>

                    {/* Delete icon button for non-locked roles (matching Figma red trash icon) */}
                    {!role.isLocked && (
                      <button
                        type="button"
                        onClick={() => setDeletingRole(role)}
                        className="absolute right-2 top-2 p-1 text-red-400/80 hover:text-red-400 transition-colors cursor-pointer"
                        title={`Delete role ${role.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body with Categories and Permission Items */}
          <tbody>
            {PERMISSION_CATEGORIES.map((category) => {
              const CategoryIcon = category.icon;

              return (
                <React.Fragment key={category.id}>
                  {/* Category Header Row (e.g. Dashboard (2), Restaurants (4), etc.) */}
                  <tr className="bg-neutral-800 border-t border-b border-zinc-800">
                    {/* Category Label */}
                    <td className="px-4 py-3 border-r border-zinc-800">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="size-4 text-amber-400 shrink-0" />
                        <span className="text-gray-200 text-base font-normal font-['Inter'] leading-6">
                          {category.title}{' '}
                        </span>
                        <span className="text-neutral-400 text-base font-normal font-['Inter'] leading-6">
                          ({category.permissions.length})
                        </span>
                      </div>
                    </td>

                    {/* Category Action per Role */}
                    {roles.map((role) => {
                      if (role.id === 'admin') {
                        return (
                          <td
                            key={role.id}
                            className="px-4 py-3 text-center border-r border-zinc-800"
                          >
                            <div className="inline-flex items-center justify-center gap-1 text-amber-400 text-xs font-normal font-['Inter']">
                              <Lock className="size-3 text-amber-400" />
                              <span>Locked</span>
                            </div>
                          </td>
                        );
                      }

                      // Check if all permissions in this category are active
                      const catPermIds = category.permissions.map((p) => p.id);
                      const current = rolePermissions[role.id] || [];
                      const allSelected = catPermIds.every((id) => current.includes(id));

                      return (
                        <td
                          key={role.id}
                          className="px-4 py-3 text-center border-r border-zinc-800"
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleCategorySelectAll(role.id, category)}
                            className="inline-flex items-center justify-center gap-1.5 group cursor-pointer"
                          >
                            <div
                              className={`size-3.5 rounded flex items-center justify-center transition-colors ${
                                allSelected
                                  ? 'bg-yellow-400 text-neutral-900'
                                  : 'border border-zinc-600 bg-neutral-900 group-hover:border-zinc-400'
                              }`}
                            >
                              {allSelected && <Check className="size-2.5 stroke-[3]" />}
                            </div>
                            <span className="text-zinc-400 text-xs font-normal font-['Inter'] leading-4 group-hover:text-zinc-300">
                              Select All
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Individual Permission Items in Category */}
                  {category.permissions.map((perm) => (
                    <tr
                      key={perm.id}
                      className="bg-neutral-900 border-t border-zinc-800 hover:bg-neutral-800/40 transition-colors"
                    >
                      {/* Permission Label */}
                      <td className="px-4 py-3.5 text-zinc-300 text-sm font-normal font-['Inter'] leading-5 border-r border-zinc-800 pl-8">
                        {perm.label}
                      </td>

                      {/* Role Checkboxes */}
                      {roles.map((role) => {
                        const isGranted = (rolePermissions[role.id] || []).includes(perm.id);

                        return (
                          <td
                            key={role.id}
                            className="px-4 py-3.5 text-center border-r border-zinc-800"
                          >
                            <button
                              type="button"
                              disabled={role.isLocked}
                              onClick={() => handleTogglePermission(role.id, perm.id)}
                              className={`size-5 rounded mx-auto flex items-center justify-center transition-all ${
                                role.isLocked
                                  ? 'cursor-not-allowed bg-yellow-400 text-neutral-900'
                                  : isGranted
                                  ? 'bg-yellow-400 text-neutral-900 hover:bg-yellow-300 cursor-pointer shadow-sm'
                                  : 'border border-neutral-700 bg-neutral-900/60 hover:border-neutral-500 cursor-pointer'
                              }`}
                            >
                              {isGranted && <Check className="size-3.5 stroke-[3]" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Custom Role Confirmation Modal */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[452px] max-w-full px-5 py-6 bg-neutral-900 rounded-[10px] flex flex-col justify-start items-center gap-6 shadow-2xl animate-in fade-in scale-95 duration-150">
            <div className="self-stretch flex flex-col justify-center items-center gap-5">
              <div className="self-stretch flex flex-col justify-start items-center gap-4">
                <div className="px-4 py-3 bg-red-400/20 rounded-md outline outline-1 outline-offset-[-1px] outline-red-400/40 inline-flex justify-center items-center gap-1.5">
                  <Trash2 className="size-8 text-red-400 stroke-[1.75]" />
                </div>

                <div className="self-stretch flex flex-col justify-start items-center gap-2.5">
                  <h3 className="self-stretch text-center text-white text-lg font-medium font-['Inter'] leading-5">
                    Delete role &ldquo;{deletingRole.name}&rdquo;?
                  </h3>
                  <p className="w-80 text-center text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                    Staff members assigned to this role will need to be reassigned to another role.
                  </p>
                </div>
              </div>
            </div>

            <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

            <div className="self-stretch inline-flex justify-center items-start gap-2">
              <button
                type="button"
                onClick={() => setDeletingRole(null)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRole}
                className="px-4 py-2.5 bg-red-400/10 hover:bg-red-400/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-red-400/40 text-red-400 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
