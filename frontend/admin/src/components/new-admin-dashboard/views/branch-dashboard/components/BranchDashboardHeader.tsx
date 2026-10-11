import React from 'react';
import { ArrowLeft, Pencil, Plus, ChevronDown } from 'lucide-react';
import { BranchItem } from '../../../types';
import { SubTab } from '../types';

interface BranchDashboardHeaderProps {
  branch: BranchItem;
  activeSubTab: SubTab;
  onBack: () => void;
  onTabChange: (tab: SubTab) => void;
  onOpenEditBranch: () => void;
  onOpenAddTable: () => void;
  onOpenAddMenu: () => void;
  onOpenInviteStaff: () => void;
  menuFilterStatus: 'All Items' | 'Active' | 'Disable';
  onMenuFilterStatusChange: (status: 'All Items' | 'Active' | 'Disable') => void;
  staffRoleFilter: string;
  onStaffRoleFilterChange: (role: string) => void;
  staffBranchFilter: string;
  onStaffBranchFilterChange: (branch: string) => void;
}

export const BranchDashboardHeader: React.FC<BranchDashboardHeaderProps> = ({
  branch,
  activeSubTab,
  onBack,
  onTabChange,
  onOpenEditBranch,
  onOpenAddTable,
  onOpenAddMenu,
  onOpenInviteStaff,
  menuFilterStatus,
  onMenuFilterStatusChange,
  staffRoleFilter,
  onStaffRoleFilterChange,
  staffBranchFilter,
  onStaffBranchFilterChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Navigation Row: Back Button */}
      <div className="flex items-center gap-1">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 cursor-pointer group text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4 text-neutral-400 group-hover:text-white transition-colors" />
          <span className="text-neutral-400 group-hover:text-white text-xs font-semibold font-['Poppins'] leading-4">
            Back
          </span>
        </button>
      </div>

      {/* Header Row: Title & Context Action Button matching Figma snippets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col justify-start items-start gap-0.5">
          {activeSubTab === 'Overview' && (
            <>
              <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
                {branch.name}
              </h1>
              <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
                {branch.restaurantName} · Branch dashboard
              </p>
            </>
          )}

          {activeSubTab === 'Tables' && (
            <>
              <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
                Tables
              </h1>
              <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
                Floor configuration for {branch.name}.
              </p>
            </>
          )}

          {activeSubTab === 'Menu' && (
            <>
              <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
                Menu
              </h1>
              <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
                Categories and menu items for {branch.name}.
              </p>
            </>
          )}

          {activeSubTab === 'Staff' && (
            <>
              <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
                Staff
              </h1>
              <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
                Invite team members, assign roles, and manage access.
              </p>
            </>
          )}
        </div>

        <div className="flex justify-end items-center gap-2">
          {activeSubTab === 'Overview' && (
            <button
              onClick={onOpenEditBranch}
              className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-['Inter'] leading-5 shadow-sm cursor-pointer"
            >
              <Pencil className="size-4 stroke-[2.5] text-neutral-900" />
              <span>Edit Branch</span>
            </button>
          )}

          {activeSubTab === 'Tables' && (
            <button
              onClick={onOpenAddTable}
              className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-['Inter'] leading-5 shadow-sm cursor-pointer"
            >
              <Plus className="size-4 stroke-[3] text-neutral-900" />
              <span>Add Table</span>
            </button>
          )}

          {activeSubTab === 'Menu' && (
            <button
              onClick={onOpenAddMenu}
              className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-['Inter'] leading-5 shadow-sm cursor-pointer"
            >
              <Plus className="size-4 stroke-[3] text-neutral-900" />
              <span>Add Menu Item</span>
            </button>
          )}

          {activeSubTab === 'Staff' && (
            <button
              onClick={onOpenInviteStaff}
              className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-['Inter'] leading-5 shadow-sm cursor-pointer"
            >
              <Plus className="size-4 stroke-[3] text-neutral-900" />
              <span>Invite Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Navigation Bar matching Figma snippets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Pills: Overview, Tables, Menu, Staff */}
        <div className="inline-flex flex-wrap justify-start items-center gap-2.5">
          {(['Overview', 'Tables', 'Menu', 'Staff'] as SubTab[]).map((tab) => {
            const isActive = activeSubTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-yellow-400 text-neutral-700 font-medium'
                    : 'bg-transparent hover:bg-neutral-900 text-white font-medium'
                }`}
              >
                <span className="text-center text-sm font-['Poppins'] leading-5">
                  {tab}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Filter Dropdown on Menu sub-tab */}
        {activeSubTab === 'Menu' && (
          <div className="flex items-center gap-3">
            <span className="text-neutral-500 text-lg font-semibold font-['Inter'] leading-4">
              Status:
            </span>
            <div className="relative">
              <select
                value={menuFilterStatus}
                onChange={(e) => onMenuFilterStatusChange(e.target.value as 'All Items' | 'Active' | 'Disable')}
                className="appearance-none px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-base font-medium font-['Inter'] pr-8 focus:outline-none cursor-pointer"
              >
                <option value="All Items">All Items</option>
                <option value="Active">Active</option>
                <option value="Disable">Disabled</option>
              </select>
              <ChevronDown className="size-4 text-stone-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Role & Branch Filters on Staff sub-tab matching exact Figma snippet */}
        {activeSubTab === 'Staff' && (
          <div className="flex flex-wrap items-center gap-3.5">
            {/* Role Filter */}
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 text-lg font-semibold font-['Inter'] leading-4">
                Role:
              </span>
              <div className="relative">
                <select
                  value={staffRoleFilter}
                  onChange={(e) => onStaffRoleFilterChange(e.target.value)}
                  className="appearance-none px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-base font-medium font-['Inter'] pr-8 focus:outline-none cursor-pointer"
                >
                  <option value="All Roles">All Roles</option>
                  <option value="Manager">Manager</option>
                  <option value="Branch Manager">Branch Manager</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Chef">Chef</option>
                  <option value="Cashier">Cashier</option>
                </select>
                <ChevronDown className="size-4 text-stone-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Branch Filter */}
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 text-lg font-semibold font-['Inter'] leading-4">
                Branch:
              </span>
              <div className="relative">
                <select
                  value={staffBranchFilter}
                  onChange={(e) => onStaffBranchFilterChange(e.target.value)}
                  className="appearance-none px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-base font-medium font-['Inter'] pr-8 focus:outline-none cursor-pointer"
                >
                  <option value="All branches">All branches</option>
                  <option value="Georgia Flagship">Georgia Flagship</option>
                  <option value="Florida Flagship">Florida Flagship</option>
                  <option value="Illinois Flagship">Illinois Flagship</option>
                  <option value="Texas Flagship">Texas Flagship</option>
                  <option value="Gulshan Flagship">Gulshan Flagship</option>
                </select>
                <ChevronDown className="size-4 text-stone-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
