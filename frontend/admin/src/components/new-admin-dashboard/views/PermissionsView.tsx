'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Settings,
  Shield,
  Users as UsersIcon,
  UserPlus,
  Building2,
  UtensilsCrossed,
  Grid,
  BookOpen,
  CreditCard,
  FileText,
  Package,
  Clock,
  Bell,
  BarChart3,
  Briefcase,
  Layers,
  UserCheck,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  PermissionsHeader,
  RoleOverviewCards,
  PermissionsMatrix,
  DeleteRoleModal,
  CreateRoleModal,
  AssignUserRoleModal,
  EditTeamStaffModal,
  DeleteTeamStaffModal,
  type EditTeamStaffMember,
  type DeleteTeamStaffMember,
} from './permissions/components';
import { PermissionCategory, RoleDefinition } from './permissions/types';
import {
  roleApi,
  useGetRolesQuery,
  useGetPermissionsQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/redux/features/roleApi';
import { useAppDispatch } from '@/redux/hooks';
import {
  useGetBranchesQuery,
  useGetBranchStaffQuery,
  useUpdateBranchStaffMutation,
  useCreateBranchStaffMutation,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteBranchStaffMutation,
  useDeleteUserMutation,
} from '@/redux/features/adminApi';
import { EmptyState, ErrorState, LoadingState, PaginationBar } from '@/components/common';
import { useClampPage, useListPagination } from '@/hooks/useListPagination';

const STAFF_PERMISSIONS: PermissionCategory[] = [
  {
    id: 'operations',
    title: 'Branch capabilities',
    icon: Settings,
    permissions: [
      { id: 'MANAGE_MENU', label: 'Manage menu', category: 'operations' },
      { id: 'MANAGE_TABLES', label: 'Manage tables', category: 'operations' },
      { id: 'MANAGE_STAFF', label: 'Manage staff', category: 'operations' },
      { id: 'MANAGE_RESERVATIONS', label: 'Manage reservations', category: 'operations' },
      { id: 'VIEW_ORDERS', label: 'View orders', category: 'operations' },
      { id: 'UPDATE_ORDER_STATUS', label: 'Update order status', category: 'operations' },
      { id: 'MANAGE_PAYMENTS', label: 'Manage payments', category: 'operations' },
      { id: 'APPLY_DISCOUNTS', label: 'Apply discounts', category: 'operations' },
      { id: 'VIEW_REPORTS', label: 'View reports', category: 'operations' },
      { id: 'MANAGE_BRANCH_SETTINGS', label: 'Manage branch settings', category: 'operations' },
    ],
  },
];

const getCategoryIcon = (moduleName: string) => {
  switch (moduleName.toLowerCase()) {
    case 'roles':
    case 'permissions':
      return Shield;
    case 'users':
      return UsersIcon;
    case 'organizations':
    case 'branches':
    case 'branch_settings':
      return Building2;
    case 'restaurants':
      return UtensilsCrossed;
    case 'staff':
      return Briefcase;
    case 'orders':
      return FileText;
    case 'tables':
      return Grid;
    case 'reservations':
      return Clock;
    case 'menu':
      return BookOpen;
    case 'payments':
    case 'discounts':
      return CreditCard;
    case 'inventory':
    case 'suppliers':
      return Package;
    case 'shifts':
      return Clock;
    case 'alerts':
      return Bell;
    case 'reports':
    case 'audit':
      return BarChart3;
    case 'settings':
    case 'integrations':
      return Settings;
    default:
      return Layers;
  }
};

export default function PermissionsView() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'directory' | 'create-staff'>('matrix');

  // Modals state
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [selectedRoleToDelete, setSelectedRoleToDelete] = useState<RoleDefinition | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [selectedStaffToEdit, setSelectedStaffToEdit] = useState<EditTeamStaffMember | null>(null);
  const [selectedStaffToDelete, setSelectedStaffToDelete] = useState<DeleteTeamStaffMember | null>(null);

  // Dynamic RBAC API Hooks
  const {
    data: dbRoles = [],
    isLoading: loadingRoles,
    isError: rolesError,
    refetch: refetchRoles,
  } = useGetRolesQuery();

  console.log('Dynamic Roles from API (useGetRolesQuery):', dbRoles);
  const {
    data: permissionsCatalog,
    isLoading: loadingPerms,
    isError: permsError,
    refetch: refetchPerms,
  } = useGetPermissionsQuery();

  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: isDeletingRole }] = useDeleteRoleMutation();

  const dispatch = useAppDispatch();

  // Role Permissions Draft State (for matrix checkboxes)
  const [rolePermissionsDraft, setRolePermissionsDraft] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (dbRoles.length > 0) {
      dbRoles.forEach((r) => {
        // If already loaded in draft, skip
        if (rolePermissionsDraft[r.id]) return;

        // If backend already included permissions, use them
        if (Array.isArray(r.permissions)) {
          setRolePermissionsDraft((prev) => ({
            ...prev,
            [r.id]: r.permissions!,
          }));
          return;
        }

        // Fetch individual role details via GET /authorization/roles/:id
        dispatch(roleApi.endpoints.getRoleById.initiate(r.id))
          .unwrap()
          .then((detail) => {
            if (detail?.permissions) {
              setRolePermissionsDraft((prev) => ({
                ...prev,
                [r.id]: detail.permissions,
              }));
            }
          })
          .catch(() => {
            // Ignore error or fallback
          });
      });
    }
  }, [dbRoles, dispatch]);

  // Transform dbRoles to RoleDefinition[]
  const roleDefs: RoleDefinition[] = useMemo(() => {
    return dbRoles.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      staffCount: r.userCount,
      isSystem: r.isSystem,
      isLocked: r.slug === 'admin' || r.id === 'admin',
    }));
  }, [dbRoles]);

  // Transform catalog to PermissionCategory[]
  const categories: PermissionCategory[] = useMemo(() => {
    if (!permissionsCatalog?.grouped) return [];
    return Object.entries(permissionsCatalog.grouped).map(([moduleName, perms]) => ({
      id: moduleName,
      title: moduleName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: getCategoryIcon(moduleName),
      permissions: perms.map((p) => ({
        id: p.permissionKey,
        label: p.description || `${p.moduleName}:${p.action}`,
        category: moduleName,
      })),
    }));
  }, [permissionsCatalog]);

  const totalPermissionsCount = permissionsCatalog?.total || 0;

  // Matrix handlers
  const handleToggleRolePermission = (roleId: string, permKey: string) => {
    setRolePermissionsDraft((prev) => {
      const current = prev[roleId] || dbRoles.find((r) => r.id === roleId)?.permissions || [];
      const updated = current.includes(permKey)
        ? current.filter((k) => k !== permKey)
        : [...current, permKey];
      return { ...prev, [roleId]: updated };
    });
  };

  const handleToggleRoleCategorySelectAll = (roleId: string, category: PermissionCategory) => {
    const catPermKeys = category.permissions.map((p) => p.id);
    setRolePermissionsDraft((prev) => {
      const current = prev[roleId] || dbRoles.find((r) => r.id === roleId)?.permissions || [];
      const allSelected = catPermKeys.every((k) => current.includes(k));
      const updated = allSelected
        ? current.filter((k) => !catPermKeys.includes(k))
        : Array.from(new Set([...current, ...catPermKeys]));
      return { ...prev, [roleId]: updated };
    });
  };

  const handleSaveRoleChanges = async () => {
    try {
      const updates = Object.entries(rolePermissionsDraft).map(([roleId, permissionKeys]) => {
        return updateRole({
          id: roleId,
          permissionKeys,
        }).unwrap();
      });

      await Promise.all(updates);
      toast.success('Dynamic role permissions saved successfully.');
      refetchRoles();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to save role permissions.');
    }
  };

  const handleConfirmDeleteRole = async () => {
    if (!selectedRoleToDelete) return;
    try {
      await deleteRole(selectedRoleToDelete.id).unwrap();
      toast.success(`Role "${selectedRoleToDelete.name}" deleted successfully.`);
      setSelectedRoleToDelete(null);
      refetchRoles();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete role.');
    }
  };

  // ── Team Directory & Branch Staff State ─────────────────────────────────────
  const { page, limit, setPage, resetPage } = useListPagination();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const { data: branchesData, isLoading: loadingBranches } = useGetBranchesQuery({
    page: 1,
    limit: 100,
  });
  const branches = branchesData?.data || [];
  const [branchId, setBranchId] = useState<string>('');
  const selectedBranchId = branchId || branches[0]?.id || '';

  const {
    data: staffRows = [],
    isLoading: loadingStaff,
    isError: staffError,
    error: staffErrorObj,
    refetch: refetchStaff,
  } = useGetBranchStaffQuery({ branchId: selectedBranchId }, { skip: !selectedBranchId });

  const {
    data: usersData,
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = useGetUsersQuery({
    page,
    limit,
    search: searchQuery.trim() || undefined,
  });
  useClampPage(page, usersData?.meta?.totalPages, setPage);

  const [updateStaff] = useUpdateBranchStaffMutation();
  const [createStaff, { isLoading: creatingStaff }] = useCreateBranchStaffMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [branchDraft, setBranchDraft] = useState<Record<string, string[]>>({});
  const [invite, setInvite] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  // Automatically select the default role from dynamic dbRoles once loaded
  useEffect(() => {
    if (dbRoles.length > 0 && !invite.role) {
      const defaultRole = dbRoles.find((r) => r.slug === 'waiter') || dbRoles[0];
      const defaultVal = defaultRole.slug
        ? defaultRole.slug.toUpperCase().replace(/-/g, '_')
        : defaultRole.name;
      setInvite((prev) => ({ ...prev, role: defaultVal }));
    }
  }, [dbRoles, invite.role]);

  const staffByUserId = useMemo(() => {
    const map = new Map<string, any>();
    staffRows.forEach((row: any) => {
      const key = row.userId || row.email;
      if (key) map.set(key, row);
    });
    return map;
  }, [staffRows]);

  const branchRolePermissions = useMemo(() => {
    const next: Record<string, string[]> = {};
    staffRows.forEach((row: any) => {
      const id = row.staffId || row.id;
      next[id] = branchDraft[id] ?? (Array.isArray(row.permissions) ? row.permissions : []);
    });
    return next;
  }, [staffRows, branchDraft]);

  const handleToggleBranchPermission = (staffId: string, permId: string) => {
    const current = branchRolePermissions[staffId] || [];
    const updated = current.includes(permId)
      ? current.filter((id) => id !== permId)
      : [...current, permId];
    setBranchDraft((prev) => ({ ...prev, [staffId]: updated }));
  };

  const handleToggleBranchCategorySelectAll = (staffId: string, category: PermissionCategory) => {
    const catPermIds = category.permissions.map((p) => p.id);
    const current = branchRolePermissions[staffId] || [];
    const allSelected = catPermIds.every((id) => current.includes(id));
    setBranchDraft((prev) => ({
      ...prev,
      [staffId]: allSelected
        ? current.filter((id) => !catPermIds.includes(id))
        : Array.from(new Set([...current, ...catPermIds])),
    }));
  };

  const handleSaveBranchChanges = async () => {
    if (!selectedBranchId) return;
    try {
      await Promise.all(
        Object.entries(branchRolePermissions).map(([staffId, permissions]) =>
          updateStaff({
            branchId: selectedBranchId,
            staffId,
            body: { permissions },
          }).unwrap(),
        ),
      );
      toast.success('Branch staff permission grants saved.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to save branch permissions.');
    }
  };

  const handleInviteStaff = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedBranchId) {
      toast.error('Select a branch before creating a staff account.');
      return;
    }
    if (invite.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    try {
      await createStaff({
        branchId: selectedBranchId,
        body: {
          name: invite.name.trim(),
          email: invite.email.trim(),
          password: invite.password,
          role: invite.role,
        },
      }).unwrap();
      toast.success(`Staff account created for ${invite.name.trim()}.`);
      const defaultRole = dbRoles.find((r) => r.slug === 'waiter') || dbRoles[0];
      const defaultVal = defaultRole
        ? (defaultRole.slug ? defaultRole.slug.toUpperCase().replace(/-/g, '_') : defaultRole.name)
        : '';
      setInvite({ name: '', email: '', password: '', role: defaultVal });
      refetchStaff();
      refetchUsers();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to create staff user.');
    }
  };

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateUserStatus({ id: user.id, status: nextStatus }).unwrap();
      toast.success(`${user.name} is now ${nextStatus.toLowerCase()}.`);
      refetchUsers();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to update user status.');
    }
  };

  const users = usersData?.data || [];
  const branchPermissionDefs = STAFF_PERMISSIONS[0]?.permissions || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <PermissionsHeader
        onSaveChanges={activeTab === 'matrix' ? handleSaveRoleChanges : handleSaveBranchChanges}
        onCreateRole={() => setIsCreateRoleOpen(true)}
        isSaving={isUpdatingRole}
      />

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-amber-400 text-neutral-900 shadow-md font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Shield className="size-4" />
          Dynamic Role Matrix
          {roleDefs.length > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-mono ${
                activeTab === 'matrix' ? 'bg-neutral-900 text-amber-400' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {roleDefs.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'directory'
              ? 'bg-amber-400 text-neutral-900 shadow-md font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <UsersIcon className="size-4" />
          Team Directory & Role Assignment
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('create-staff')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'create-staff'
              ? 'bg-amber-400 text-neutral-900 shadow-md font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <UserPlus className="size-4" />
          Create Staff User
        </button>
      </div>

      {/* ── TAB 1: DYNAMIC ROLES & PERMISSIONS MATRIX ───────────────────────── */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {(loadingRoles || loadingPerms) && (
            <LoadingState message="Loading dynamic roles & system permissions catalog from database..." />
          )}

          {(rolesError || permsError) && (
            <ErrorState
              message="Failed to load roles or permissions catalog from PostgreSQL."
              onRetry={() => {
                refetchRoles();
                refetchPerms();
              }}
            />
          )}

          {!loadingRoles && !loadingPerms && (
            <>
              {/* Role Cards Overview */}
              <RoleOverviewCards
                roles={roleDefs}
                rolePermissions={rolePermissionsDraft}
                totalPermissionsCount={totalPermissionsCount}
              />

              {/* Main RBAC Permission Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-white text-lg font-medium font-['Inter']">
                    Module Capability Matrix
                  </h2>
                  <span className="text-xs text-neutral-400 font-['Inter']">
                    {totalPermissionsCount} atomic system capabilities across {categories.length} modules
                  </span>
                </div>

                <PermissionsMatrix
                  roles={roleDefs}
                  categories={categories}
                  rolePermissions={rolePermissionsDraft}
                  totalPermissionsCount={totalPermissionsCount}
                  onTogglePermission={handleToggleRolePermission}
                  onToggleCategorySelectAll={handleToggleRoleCategorySelectAll}
                  onRequestDeleteRole={(role) => setSelectedRoleToDelete(role)}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB 2: TEAM DIRECTORY & USER DYNAMIC ROLE ASSIGNMENT ────────────────── */}
      {activeTab === 'directory' && (
        <section
          className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-4"
          data-testid="team-directory"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h2 className="text-white text-lg font-medium">Team directory</h2>
              <p className="text-zinc-500 text-sm">
                Assign single dynamic roles directly to users, or expand a row to manage branch capabilities.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="size-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  data-testid="permissions-user-search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (page !== 1) resetPage();
                  }}
                  placeholder="Search users..."
                  className="w-full h-11 pl-9 pr-3 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                />
              </div>
              <select
                value={selectedBranchId}
                onChange={(e) => {
                  setBranchId(e.target.value);
                  setBranchDraft({});
                }}
                data-testid="permissions-branch"
                className="h-11 px-3.5 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-sm min-w-[180px]"
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingUsers && <LoadingState message="Loading users..." />}
          {!loadingUsers && users.length === 0 && (
            <EmptyState
              title="No users in this organization"
              description="Create a staff account or invite team members to assign roles."
            />
          )}

          {users.length > 0 && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-900 text-white text-left">
                    <tr>
                      <th className="py-3 px-3 font-semibold w-10" />
                      <th className="py-3 px-3 font-semibold">Name</th>
                      <th className="py-3 px-3 font-semibold">Email</th>
                      <th className="py-3 px-3 font-semibold">Global Role</th>
                      <th className="py-3 px-3 font-semibold">Dynamic Role</th>
                      <th className="py-3 px-3 font-semibold">Branch Assignment</th>
                      <th className="py-3 px-3 font-semibold">Status</th>
                      <th className="py-3 px-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => {
                      const assignment =
                        staffByUserId.get(user.id) || staffByUserId.get(user.email);
                      const staffId = assignment?.staffId || assignment?.id;
                      const grants = staffId ? branchRolePermissions[staffId] || [] : [];
                      const expanded = expandedUserId === user.id;

                      return (
                        <React.Fragment key={user.id}>
                          <tr className="border-t border-neutral-800 text-stone-200 hover:bg-neutral-800/30 transition-colors">
                            <td className="py-2.5 px-3">
                              <button
                                type="button"
                                data-testid={`user-expand-${user.id}`}
                                aria-expanded={expanded}
                                onClick={() => setExpandedUserId(expanded ? null : user.id)}
                                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                              >
                                {expanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-white">{user.name}</td>
                            <td className="py-2.5 px-3 text-neutral-400 font-mono text-xs">
                              {user.email}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-neutral-800 border border-neutral-700 text-amber-400 font-mono">
                                {user.role}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedUserForRole({
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-amber-400/20 text-neutral-300 hover:text-amber-300 border border-neutral-700 hover:border-amber-400/40 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <UserCheck className="size-3.5 text-amber-400" />
                                <span>Assign Dynamic Role</span>
                              </button>
                            </td>
                            <td className="py-2.5 px-3 text-zinc-400 text-xs">
                              {assignment ? (
                                <span className="text-emerald-400">Assigned to branch</span>
                              ) : (
                                <span className="text-neutral-500">Not assigned here</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  user.status === 'ACTIVE'
                                    ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {user.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  data-testid={`staff-edit-${user.id}`}
                                  onClick={() => {
                                    const currentBranch = branches.find((b) => b.id === selectedBranchId);
                                    setSelectedStaffToEdit({
                                      userId: user.id,
                                      staffId: assignment?.staffId || assignment?.id,
                                      name: user.name,
                                      email: user.email,
                                      role: assignment?.role || user.role,
                                      status: user.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
                                      branchId: selectedBranchId,
                                      branchName: currentBranch?.name,
                                    });
                                  }}
                                  className="px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer border border-neutral-700 flex items-center gap-1"
                                >
                                  <Edit2 className="size-3 text-amber-400" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  data-testid={`user-status-${user.id}`}
                                  onClick={() => handleToggleStatus(user)}
                                  className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer border border-neutral-700/60"
                                >
                                  {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  type="button"
                                  data-testid={`staff-delete-${user.id}`}
                                  onClick={() => {
                                    const currentBranch = branches.find((b) => b.id === selectedBranchId);
                                    setSelectedStaffToDelete({
                                      userId: user.id,
                                      staffId: assignment?.staffId || assignment?.id,
                                      name: user.name,
                                      email: user.email,
                                      role: assignment?.role || user.role,
                                      branchId: selectedBranchId,
                                      branchName: currentBranch?.name,
                                    });
                                  }}
                                  className="px-2 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer border border-red-500/30 flex items-center gap-1"
                                >
                                  <Trash2 className="size-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Branch Capabilities Accordion */}
                          {expanded && (
                            <tr className="border-t border-neutral-800 bg-black/40">
                              <td colSpan={8} className="p-4">
                                <div
                                  data-testid={`user-permissions-${user.id}`}
                                  className="space-y-3"
                                >
                                  {(loadingBranches || loadingStaff) && (
                                    <LoadingState message="Loading staff assignments..." />
                                  )}
                                  {staffError && (
                                    <ErrorState
                                      message={
                                        (staffErrorObj as any)?.data?.message ||
                                        'Unable to load staff permissions.'
                                      }
                                      onRetry={() => refetchStaff()}
                                    />
                                  )}
                                  {!assignment && (
                                    <p className="text-sm text-zinc-400">
                                      This user is not assigned to the selected branch. Create a
                                      staff assignment below to grant branch-specific capabilities.
                                    </p>
                                  )}
                                  {assignment && staffId && (
                                    <>
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm text-zinc-300">
                                          Extra operational grants for {assignment.role?.replaceAll('_', ' ')} at this branch
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleToggleBranchCategorySelectAll(
                                              staffId,
                                              STAFF_PERMISSIONS[0],
                                            )
                                          }
                                          className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
                                        >
                                          Toggle all branch capabilities
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                                        {branchPermissionDefs.map((perm) => {
                                          const checked = grants.includes(perm.id);
                                          return (
                                            <label
                                              key={perm.id}
                                              className="flex items-center gap-2.5 p-3 rounded-lg bg-neutral-900 border border-neutral-800 cursor-pointer hover:border-zinc-700 transition-colors"
                                            >
                                              <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                  handleToggleBranchPermission(staffId, perm.id)
                                                }
                                                className="size-4 accent-amber-400"
                                              />
                                              <span className="text-sm text-stone-200">
                                                {perm.label}
                                              </span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationBar meta={usersData?.meta} onPageChange={setPage} />
            </div>
          )}
        </section>
      )}

      {/* ── TAB 3: CREATE STAFF USER FORM ────────────────────────────────────── */}
      {activeTab === 'create-staff' && (
        <form
          onSubmit={handleInviteStaff}
          className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-4 max-w-3xl"
          data-testid="create-staff-form"
        >
          <div>
            <h2 className="text-white text-lg font-medium font-['Inter']">Create Staff User</h2>
            <p className="text-xs text-neutral-400 font-['Inter']">
              Onboard a new staff member with branch credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              required
              data-testid="create-staff-name"
              placeholder="Full name"
              value={invite.name}
              onChange={(e) => setInvite((prev) => ({ ...prev, name: e.target.value }))}
              className="h-11 px-3.5 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400"
            />
            <input
              required
              type="email"
              data-testid="create-staff-email"
              placeholder="Email address"
              value={invite.email}
              onChange={(e) => setInvite((prev) => ({ ...prev, email: e.target.value }))}
              className="h-11 px-3.5 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400"
            />
            <input
              required
              type="password"
              minLength={8}
              data-testid="create-staff-password"
              placeholder="Temporary password (min 8 chars)"
              value={invite.password}
              onChange={(e) => setInvite((prev) => ({ ...prev, password: e.target.value }))}
              className="h-11 px-3.5 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400"
            />
            <select
              data-testid="create-staff-role"
              value={invite.role}
              onChange={(e) => setInvite((prev) => ({ ...prev, role: e.target.value }))}
              className="h-11 px-3.5 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {loadingRoles ? (
                <option value="">Loading roles from API...</option>
              ) : dbRoles.length === 0 ? (
                <option value="">No roles available</option>
              ) : (
                dbRoles.map((role) => {
                  const roleValue = role.slug
                    ? role.slug.toUpperCase().replace(/-/g, '_')
                    : role.name;
                  return (
                    <option key={role.id} value={roleValue}>
                      {role.name}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={creatingStaff}
              data-testid="create-staff-submit"
              className="h-11 px-6 bg-yellow-400 hover:bg-yellow-300 rounded-lg text-neutral-900 text-sm font-semibold disabled:opacity-60 transition-colors cursor-pointer shadow-md"
            >
              {creatingStaff ? 'Creating...' : 'Create staff account'}
            </button>
          </div>
        </form>
      )}

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}

      {/* Create Dynamic Role Modal */}
      {isCreateRoleOpen && (
        <CreateRoleModal
          onClose={() => setIsCreateRoleOpen(false)}
          onSuccess={() => refetchRoles()}
        />
      )}

      {/* Delete Role Modal */}
      {selectedRoleToDelete && (
        <DeleteRoleModal
          role={selectedRoleToDelete}
          onClose={() => setSelectedRoleToDelete(null)}
          onConfirm={handleConfirmDeleteRole}
        />
      )}

      {/* Single Dynamic Role Assignment Modal */}
      {selectedUserForRole && (
        <AssignUserRoleModal
          user={selectedUserForRole}
          onClose={() => setSelectedUserForRole(null)}
          onSuccess={() => refetchUsers()}
        />
      )}

      {/* Edit Staff Modal */}
      {selectedStaffToEdit && (
        <EditTeamStaffModal
          member={selectedStaffToEdit}
          onClose={() => setSelectedStaffToEdit(null)}
          onSuccess={() => {
            refetchStaff();
            refetchUsers();
          }}
        />
      )}

      {/* Delete Staff Modal */}
      {selectedStaffToDelete && (
        <DeleteTeamStaffModal
          member={selectedStaffToDelete}
          onClose={() => setSelectedStaffToDelete(null)}
          onSuccess={() => {
            refetchStaff();
            refetchUsers();
          }}
        />
      )}
    </div>
  );
}
