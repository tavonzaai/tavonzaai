import React from 'react';
import { Lock, Check, Trash2 } from 'lucide-react';
import { RoleDefinition, PermissionCategory } from '../types';

interface PermissionsMatrixProps {
  roles: RoleDefinition[];
  categories: PermissionCategory[];
  rolePermissions: Record<string, string[]>;
  totalPermissionsCount: number;
  onTogglePermission: (roleId: string, permId: string) => void;
  onToggleCategorySelectAll: (roleId: string, category: PermissionCategory) => void;
  onRequestDeleteRole: (role: RoleDefinition) => void;
}

export const PermissionsMatrix: React.FC<PermissionsMatrixProps> = ({
  roles,
  categories,
  rolePermissions,
  totalPermissionsCount,
  onTogglePermission,
  onToggleCategorySelectAll,
  onRequestDeleteRole,
}) => {
  return (
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
                      {count}/{totalPermissionsCount}
                    </span>
                  </div>

                  {/* Delete icon button for non-locked roles (matching Figma red trash icon) */}
                  {!role.isLocked && (
                    <button
                      type="button"
                      onClick={() => onRequestDeleteRole(role)}
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
          {categories.map((category) => {
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
                          onClick={() => onToggleCategorySelectAll(role.id, category)}
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
                            onClick={() => onTogglePermission(role.id, perm.id)}
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
  );
};
