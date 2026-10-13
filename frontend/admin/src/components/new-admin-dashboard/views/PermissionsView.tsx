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
  const [updateStaff] = useUpdateBranchStaffMutation();
  const [draft, setDraft] = useState<Record<string, string[]>>({});

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PermissionsHeader onSaveChanges={handleSaveChanges} />
      <p className="text-zinc-500 text-sm">
        Staff roles are fixed. Extra grants are stored per assignment using the platform permission actions.
      </p>

      <div className="flex flex-col gap-2 max-w-sm">
        <label className="text-white text-sm">Branch</label>
        <select
          value={selectedBranchId}
          onChange={(e) => {
            setBranchId(e.target.value);
            setDraft({});
          }}
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
          description="Invite staff from the branch dashboard, then grant extra capabilities here."
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
