import React from 'react';
import { RoleDefinition } from '../types';

interface RoleOverviewCardsProps {
  roles: RoleDefinition[];
  rolePermissions: Record<string, string[]>;
  totalPermissionsCount: number;
}

export const RoleOverviewCards: React.FC<RoleOverviewCardsProps> = ({
  roles,
  rolePermissions,
  totalPermissionsCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {roles.map((role) => {
        const granted = rolePermissions[role.id] || [];
        const count = granted.length;
        const pct = Math.round((count / totalPermissionsCount) * 100);

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
                {count}/{totalPermissionsCount} permissions
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
  );
};
