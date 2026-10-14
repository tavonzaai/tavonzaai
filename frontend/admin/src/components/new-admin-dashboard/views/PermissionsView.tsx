'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, Search, Settings } from 'lucide-react';
import { PermissionCategory } from './permissions/types';
import { PermissionsHeader } from './permissions/components';
import {
  useGetBranchesQuery,
  useGetBranchStaffQuery,
  useUpdateBranchStaffMutation,
  useCreateBranchStaffMutation,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
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

const STAFF_ROLES = [
  'BRANCH_MANAGER',
  'HOST',
  'WAITER',
  'KITCHEN_STAFF',
  'BARTENDER',
  'CASHIER',
] as const;

export default function PermissionsView() {
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

  const { data: staffRows = [], isLoading, isError, error, refetch } = useGetBranchStaffQuery(
    { branchId: selectedBranchId },
    { skip: !selectedBranchId },
  );
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
  const [draft, setDraft] = useState<Record<string, string[]>>({});
  const [invite, setInvite] = useState({
    name: '',
    email: '',
    password: '',
    role: 'WAITER',
  });

  const staffByUserId = useMemo(() => {
    const map = new Map<string, any>();
    staffRows.forEach((row: any) => {
      const key = row.userId || row.email;
      if (key) map.set(key, row);
    });
    return map;
  }, [staffRows]);

  const rolePermissions = useMemo(() => {
    const next: Record<string, string[]> = {};
    staffRows.forEach((row: any) => {
      const id = row.staffId || row.id;
      next[id] = draft[id] ?? (Array.isArray(row.permissions) ? row.permissions : []);
    });
    return next;
  }, [staffRows, draft]);

  const handleTogglePermission = (staffId: string, permId: string) => {
    const current = rolePermissions[staffId] || [];
    const updated = current.includes(permId)
      ? current.filter((id) => id !== permId)
      : [...current, permId];
    setDraft((prev) => ({ ...prev, [staffId]: updated }));
  };

  const handleToggleCategorySelectAll = (staffId: string, category: PermissionCategory) => {
    const catPermIds = category.permissions.map((p) => p.id);
    const current = rolePermissions[staffId] || [];
    const allSelected = catPermIds.every((id) => current.includes(id));
    setDraft((prev) => ({
      ...prev,
      [staffId]: allSelected
        ? current.filter((id) => !catPermIds.includes(id))
        : Array.from(new Set([...current, ...catPermIds])),
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedBranchId) return;
    try {
      await Promise.all(
        Object.entries(rolePermissions).map(([staffId, permissions]) =>
          updateStaff({
            branchId: selectedBranchId,
            staffId,
            body: { permissions },
          }).unwrap(),
        ),
      );
      toast.success('Staff permission grants saved.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to save permissions.');
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
      setInvite({ name: '', email: '', password: '', role: 'WAITER' });
      refetch();
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
  const permissionDefs = STAFF_PERMISSIONS[0]?.permissions || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PermissionsHeader onSaveChanges={handleSaveChanges} />
      <p className="text-zinc-500 text-sm">
        Staff roles are fixed. Extra grants are stored per assignment using the platform permission actions.
      </p>

      <section className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-4" data-testid="team-directory">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h2 className="text-white text-lg font-medium">Team directory</h2>
            <p className="text-zinc-500 text-sm">
              Organization users returned by the backend. Expand a row to view branch grants without hiding the list.
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
                setDraft({});
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
            description="Create a staff account below to add the first team member."
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
                    <th className="py-3 px-3 font-semibold">Role</th>
                    <th className="py-3 px-3 font-semibold">Branch assignment</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-3 font-semibold">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => {
                    const assignment = staffByUserId.get(user.id) || staffByUserId.get(user.email);
                    const staffId = assignment?.staffId || assignment?.id;
                    const grants = staffId ? rolePermissions[staffId] || [] : [];
                    const expanded = expandedUserId === user.id;
                    return (
                      <React.Fragment key={user.id}>
                        <tr className="border-t border-neutral-800 text-stone-200">
                          <td className="py-2 px-3">
                            <button
                              type="button"
                              data-testid={`user-expand-${user.id}`}
                              aria-expanded={expanded}
                              onClick={() => setExpandedUserId(expanded ? null : user.id)}
                              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                              {expanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="py-2 px-3">{user.name}</td>
                          <td className="py-2 px-3">{user.email}</td>
                          <td className="py-2 px-3">{assignment?.role || user.role}</td>
                          <td className="py-2 px-3 text-zinc-400">
                            {assignment ? 'Assigned to selected branch' : 'Not assigned here'}
                          </td>
                          <td className="py-2 px-3">{user.status}</td>
                          <td className="py-2 px-3">
                            <button
                              type="button"
                              data-testid={`user-status-${user.id}`}
                              onClick={() => handleToggleStatus(user)}
                              className="px-2.5 py-1 rounded-md bg-zinc-800 text-xs text-white hover:bg-zinc-700"
                            >
                              {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="border-t border-neutral-800 bg-black/40">
                            <td colSpan={7} className="p-4">
                              <div data-testid={`user-permissions-${user.id}`} className="space-y-3">
                                {(loadingBranches || isLoading) && (
                                  <LoadingState message="Loading staff assignments..." />
                                )}
                                {isError && (
                                  <ErrorState
                                    message={(error as any)?.data?.message || 'Unable to load staff permissions.'}
                                    onRetry={() => refetch()}
                                  />
                                )}
                                {!assignment && (
                                  <p className="text-sm text-zinc-400">
                                    This user is not assigned to the selected branch. Create a staff
                                    assignment to grant branch capabilities.
                                  </p>
                                )}
                                {assignment && staffId && (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm text-zinc-300">
                                        Extra grants for {assignment.role.replaceAll('_', ' ')} at this branch
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleToggleCategorySelectAll(staffId, STAFF_PERMISSIONS[0])
                                        }
                                        className="text-xs text-amber-400 hover:text-amber-300"
                                      >
                                        Toggle all
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                                      {permissionDefs.map((perm) => {
                                        const checked = grants.includes(perm.id);
                                        return (
                                          <label
                                            key={perm.id}
                                            className="flex items-center gap-2.5 p-3 rounded-lg bg-neutral-900 border border-neutral-800 cursor-pointer"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={checked}
                                              onChange={() => handleTogglePermission(staffId, perm.id)}
                                              className="size-4 accent-amber-400"
                                            />
                                            <span className="text-sm text-stone-200">{perm.label}</span>
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

      <form
        onSubmit={handleInviteStaff}
        className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3"
        data-testid="create-staff-form"
      >
        <h2 className="text-white text-lg font-medium">Create staff user</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <input
            required
            data-testid="create-staff-name"
            placeholder="Full name"
            value={invite.name}
            onChange={(e) => setInvite((prev) => ({ ...prev, name: e.target.value }))}
            className="h-11 px-3.5 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-sm"
          />
          <input
            required
            type="email"
            data-testid="create-staff-email"
            placeholder="Email"
            value={invite.email}
            onChange={(e) => setInvite((prev) => ({ ...prev, email: e.target.value }))}
            className="h-11 px-3.5 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-sm"
          />
          <input
            required
            type="password"
            minLength={8}
            data-testid="create-staff-password"
            placeholder="Temporary password"
            value={invite.password}
            onChange={(e) => setInvite((prev) => ({ ...prev, password: e.target.value }))}
            className="h-11 px-3.5 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-sm"
          />
          <select
            data-testid="create-staff-role"
            value={invite.role}
            onChange={(e) => setInvite((prev) => ({ ...prev, role: e.target.value }))}
            className="h-11 px-3.5 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-sm"
          >
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {role.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={creatingStaff}
            data-testid="create-staff-submit"
            className="h-11 px-3 bg-yellow-400 hover:bg-yellow-300 rounded-lg text-neutral-800 text-sm font-medium disabled:opacity-60"
          >
            {creatingStaff ? 'Creating...' : 'Create user'}
          </button>
        </div>
      </form>
    </div>
  );
}
