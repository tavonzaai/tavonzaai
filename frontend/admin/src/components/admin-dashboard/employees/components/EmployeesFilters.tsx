'use client';

import React from 'react';
import { Search } from 'lucide-react';

export interface EmployeesFiltersProps {
  selectedRole: string;
  onSelectRole: (role: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
}

export default function EmployeesFilters({
  selectedRole,
  onSelectRole,
  searchQuery,
  onSearchChange,
  totalCount,
}: EmployeesFiltersProps) {
  const roles = [
    { label: `All (${totalCount})`, value: 'All' },
    { label: 'Waiter', value: 'Waiter' },
    { label: 'Chef', value: 'Chef' },
    { label: 'Barista', value: 'Barista' },
    { label: 'Hostess', value: 'Hostess' },
    { label: 'Bartender', value: 'Bartender' },
    { label: 'Manager', value: 'Manager' },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-wrap">
        {roles.map((role) => {
          const isActive = selectedRole === role.value;

          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onSelectRole(role.value)}
              className={`h-9 px-3.5 py-2 text-base font-medium font-['Inter'] rounded-[5px] transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-amber-400 text-white font-semibold shadow-sm'
                  : 'bg-transparent text-neutral-400 hover:text-white border border-neutral-700/60 hover:bg-white/5'
              }`}
            >
              {role.label}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-64">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Employees..."
          className="w-full h-9 pl-9 pr-4 bg-zinc-900 rounded-[5px] border border-neutral-700 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50 transition-colors font-['Inter']"
        />
      </div>
    </div>
  );
}
