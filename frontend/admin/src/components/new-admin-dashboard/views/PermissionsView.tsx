'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';
import { RoleDefinition, PermissionCategory } from './permissions/types';
import { PermissionsHeader, PermissionsMatrix } from './permissions/components';
import {
  useGetBranchesQuery,
  useGetBranchStaffQuery,
  useUpdateBranchStaffMutation,
  useCreateBranchStaffMutation,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
} from '@/redux/features/adminApi';
import { EmptyState, ErrorState, LoadingState } from '@/components/common';

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

const TOTAL = 10;

export default function PermissionsView() {
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
  const { data: usersData, isLoading: loadingUsers, refetch: refetchUsers } = useGetUsersQuery({
    page: 1,
    limit: 50,
  });
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

  const roles: RoleDefinition[] = useMemo(
    () =>
      staffRows.map((row: any) => ({
        id: row.staffId || row.id,
        name: `${row.name} (${row.role})`,
        staffCount: 1,
        isLocked: true,
      })),
    [staffRows],
  );

  const rolePermissions = useMemo(() => {
    const next: Record<string, string[]> = {};
    staffRows.forEach((row: any) => {
      const id = row.staffId || row.id;
      next[id] = draft[id] ?? (Array.isArray(row.permissions) ? row.permissions : []);
    });
    return next;
  }, [staffRows, draft]);

  const handleTogglePermission = (roleId: string, permId: string) => {
    const current = rolePermissions[roleId] || [];
    const updated = current.includes(permId)
      ? current.filter((id) => id !== permId)
      : [...current, permId];
    setDraft((prev) => ({ ...prev, [roleId]: updated }));
  };

  const handleToggleCategorySelectAll = (roleId: string, category: PermissionCategory) => {
    const catPermIds = category.permissions.map((p) => p.id);
    const current = rolePermissions[roleId] || [];
    const allSelected = catPermIds.every((id) => current.includes(id));
    setDraft((prev) => ({
      ...prev,
      [roleId]: allSelected
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PermissionsHeader onSaveChanges={handleSaveChanges} />
      <p className="text-zinc-500 text-sm">
        Staff roles are fixed. Extra grants are stored per assignment using the platform permission actions.
      </p>

      <section className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-4" data-testid="team-directory">
        <div>
          <h2 className="text-white text-lg font-medium">Team directory</h2>
          <p className="text-zinc-500 text-sm">
            Organization users returned by the backend. Status changes persist immediately.
          </p>
        </div>
        {loadingUsers && <LoadingState message="Loading users..." />}
        {!loadingUsers && users.length === 0 && (
          <EmptyState
            title="No users in this organization"
            description="Create a staff account below to add the first team member."
          />
        )}
        {users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-500 text-left">
                <tr>
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 pr-3 font-medium">Role</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium">Access</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-t border-neutral-800 text-stone-200">
                    <td className="py-2 pr-3">{user.name}</td>
                    <td className="py-2 pr-3">{user.email}</td>
                    <td className="py-2 pr-3">{user.role}</td>
                    <td className="py-2 pr-3">{user.status}</td>
                    <td className="py-2">
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
                ))}
              </tbody>
            </table>
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

      <div className="flex flex-col gap-2 max-w-sm">
        <label className="text-white text-sm">Branch</label>
        <select
          value={selectedBranchId}
          onChange={(e) => {
            setBranchId(e.target.value);
            setDraft({});
          }}
          data-testid="permissions-branch"
          className="h-11 px-3.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm"
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {(loadingBranches || isLoading) && <LoadingState message="Loading staff assignments..." />}
      {isError && (
        <ErrorState
          message={(error as any)?.data?.message || 'Unable to load staff permissions.'}
          onRetry={() => refetch()}
        />
      )}
      {!isLoading && selectedBranchId && roles.length === 0 && (
        <EmptyState
          title="No staff at this branch"
          description="Create a staff user above, then grant extra capabilities here."
        />
      )}
      {roles.length > 0 && (
        <PermissionsMatrix
          roles={roles}
          categories={STAFF_PERMISSIONS}
          rolePermissions={rolePermissions}
          totalPermissionsCount={TOTAL}
          onTogglePermission={handleTogglePermission}
          onToggleCategorySelectAll={handleToggleCategorySelectAll}
          onRequestDeleteRole={() => undefined}
        />
      )}
    </div>
  );
}
