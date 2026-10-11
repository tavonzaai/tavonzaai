'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { RoleDefinition, PermissionCategory } from './permissions/types';
import {
  INITIAL_ROLES,
  PERMISSION_CATEGORIES,
  TOTAL_PERMISSIONS_COUNT,
  INITIAL_ROLE_PERMISSIONS,
} from './permissions/data';
import {
  PermissionsHeader,
  RoleOverviewCards,
  PermissionsMatrix,
  DeleteRoleModal,
} from './permissions/components';

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
      {/* Header Row */}
      <PermissionsHeader onSaveChanges={handleSaveChanges} />

      {/* Role Overview Cards Row */}
      <RoleOverviewCards
        roles={roles}
        rolePermissions={rolePermissions}
        totalPermissionsCount={TOTAL_PERMISSIONS_COUNT}
      />

      {/* Permissions Matrix Grid Table */}
      <PermissionsMatrix
        roles={roles}
        categories={PERMISSION_CATEGORIES}
        rolePermissions={rolePermissions}
        totalPermissionsCount={TOTAL_PERMISSIONS_COUNT}
        onTogglePermission={handleTogglePermission}
        onToggleCategorySelectAll={handleToggleCategorySelectAll}
        onRequestDeleteRole={(role) => setDeletingRole(role)}
      />

      {/* Delete Custom Role Confirmation Modal */}
      {deletingRole && (
        <DeleteRoleModal
          role={deletingRole}
          onClose={() => setDeletingRole(null)}
          onConfirm={handleConfirmDeleteRole}
        />
      )}
    </div>
  );
}
