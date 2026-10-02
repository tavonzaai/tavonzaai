'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  Store,
  MapPin,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  ShoppingBag,
  User,
  CheckCircle2,
  Edit2,
  Settings,
} from 'lucide-react';
import { RestaurantBranch, BranchItem, StaffMember } from '../types';
import ManageShiftsModal from './ManageShiftsModal';
import EditBranchModal from './EditBranchModal';
import AddStaffModal from './AddStaffModal';
import { Plus } from 'lucide-react';

interface BranchDetailViewProps {
  branch: BranchItem;
  parentRestaurant: RestaurantBranch;
  onBack: () => void;
  onEdit?: (branch: BranchItem) => void;
  onSettings?: (branch: BranchItem) => void;
}

type BranchTab = 'overview' | 'staff' | 'hours' | 'orders';

export default function BranchDetailView({
  branch,
  parentRestaurant,
  onBack,
  onEdit,
  onSettings,
}: BranchDetailViewProps) {
  const [activeTab, setActiveTab] = useState<BranchTab>('overview');
  const [currentBranch, setCurrentBranch] = useState<BranchItem>(branch);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [selectedStaffForShift, setSelectedStaffForShift] = useState<StaffMember | null>(null);

  // Staff list for branch
  const [branchStaff, setBranchStaff] = useState<StaffMember[]>(() => {
    return branch.assignedStaff && branch.assignedStaff.length > 0
      ? branch.assignedStaff
      : [
          {
            id: 'bst-1',
            name: branch.manager?.name || 'Arif Hossain',
            role: 'Branch Manager',
            avatar: 'AH',
            email: 'arif@tavonza.com',
            shift: 'Morning (08:00 - 16:00)',
            status: 'Active',
          },
          {
            id: 'bst-2',
            name: 'Rahim Uddin',
            role: 'Head Chef',
            avatar: 'RU',
            email: 'rahim@tavonza.com',
            shift: 'Full Shift (10:00 - 18:00)',
            status: 'Active',
          },
          {
            id: 'bst-3',
            name: 'Kabir Hossain',
            role: 'Senior Waiter',
            avatar: 'KH',
            email: 'kabir@tavonza.com',
            shift: 'Evening (16:00 - 00:00)',
            status: 'Active',
          },
          {
            id: 'bst-4',
            name: 'Sabrina Islam',
            role: 'Cashier',
            avatar: 'SI',
            email: 'sabrina@tavonza.com',
            shift: 'Morning (08:00 - 16:00)',
            status: 'Active',
          },
        ];
  });

  // Mock orders list for branch
  const mockBranchOrders = [
    { id: '#ORD-9801', table: 'Table 04', items: '2x Ribeye Steak, 1x Red Wine', total: '৳3,450', status: 'Completed', time: '10m ago' },
    { id: '#ORD-9802', table: 'Table 12', items: '1x Margherita Pizza, 2x Lemonade', total: '৳1,800', status: 'Preparing', time: '15m ago' },
    { id: '#ORD-9803', table: 'Table 02', items: '3x Garlic Bread, 3x Pasta', total: '৳2,900', status: 'Ready', time: '22m ago' },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP HEADER WITH BACK BUTTON & ACTIONS (Image 2 Red Box) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Back to Branches"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight leading-tight">
              {currentBranch.name}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Branch of {parentRestaurant.name} • {currentBranch.city}, {currentBranch.country}
            </p>
          </div>
        </div>

        {/* Right Action Buttons (Settings & Edit Branch - Red Box in Image 2) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => (onSettings ? onSettings(currentBranch) : setIsEditModalOpen(true))}
            className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Branch Settings"
          >
            <Settings className="w-4 h-4 text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-black hover:bg-zinc-950 border border-zinc-700 hover:border-amber-400/50 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit Branch</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN BRANCH BANNER (Matches Image 4) */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Store className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-white font-serif">
                {branch.name}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  branch.status === 'Open'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    branch.status === 'Open' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span>{branch.status}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-400 font-normal">
              <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>{branch.address || `${branch.city}, ${branch.country}`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-6 border-b border-zinc-800 overflow-x-auto no-scrollbar">
        {(['overview', 'staff', 'hours', 'orders'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-semibold capitalize transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENT */}

      {/* TAB: OVERVIEW (Matches Image 4) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Left Card: Branch Details */}
          <div className="lg:col-span-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-2 pb-4 border-b border-zinc-800 text-sm font-bold text-white">
              <span className="w-4 h-4 rounded-full border border-zinc-500 flex items-center justify-center text-[10px] text-zinc-400">
                ℹ
              </span>
              <span>Branch Details</span>
            </div>

            <div className="divide-y divide-zinc-800/80 text-xs">
              <div className="py-3.5 flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Branch ID</span>
                <span className="text-white font-mono font-semibold">BRN-0101</span>
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Location</span>
                <span className="text-white font-medium">
                  {branch.city}, {branch.country}
                </span>
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Manager</span>
                <span className="text-white font-semibold">
                  {branch.manager?.name || 'Arif Hossain'}
                </span>
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Staff Count</span>
                <span className="text-white font-medium">{branch.staffCount || 7} Members</span>
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Restaurant</span>
                <span className="text-amber-400 font-semibold">{parentRestaurant.name}</span>
              </div>
            </div>
          </div>

          {/* Right Cards: 3 Metric Cards Stacked Vertically */}
          <div className="lg:col-span-6 space-y-4">
            {/* Card 1: Today's Orders */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between shadow-md">
              <div>
                <div className="text-xs text-zinc-400 font-medium">Today's Orders</div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                  48
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12%</span>
              </div>
            </div>

            {/* Card 2: Revenue Today */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between shadow-md">
              <div>
                <div className="text-xs text-zinc-400 font-medium">Revenue Today</div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                  ৳24,500
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+8%</span>
              </div>
            </div>

            {/* Card 3: Avg. Order Value */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between shadow-md">
              <div>
                <div className="text-xs text-zinc-400 font-medium">Avg. Order Value</div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                  ৳510
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-bold flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>-2%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: STAFF (Matches Figma Design) */}
      {activeTab === 'staff' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-md space-y-0 animate-in fade-in duration-200">
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Staff Members</h3>
              <span className="text-xs font-mono text-zinc-400">
                {branchStaff.length} total
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsAddStaffOpen(true)}
              className="h-9 px-4 rounded-xl bg-black hover:bg-zinc-950 border border-zinc-700/80 hover:border-amber-400/50 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Staff</span>
            </button>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {branchStaff.map((staff) => {
              const member = staff as StaffMember;
              const defaultDays =
                member.days ||
                (member.role === 'Bartender'
                  ? ['Fri', 'Sat', 'Sun']
                  : member.role === 'Waiter'
                  ? ['Tue', 'Thu', 'Sat']
                  : ['Mon', 'Wed', 'Fri']);
              const statusText =
                member.status || (member.role === 'Bartender' ? 'On Leave' : 'Active');

              return (
                <div
                  key={member.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/30 transition-colors"
                >
                  {/* Left: Avatar + Name + Role */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-amber-300 shrink-0">
                      {member.avatar || member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{member.name}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{member.role}</p>
                    </div>
                  </div>

                  {/* Right: Days Chips + Status Badge + Shifts Button */}
                  <div className="flex items-center gap-3.5 flex-wrap sm:flex-nowrap">
                    {/* Shift Days Chips */}
                    <div className="flex items-center gap-1.5">
                      {defaultDays.map((day: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        >
                          {day}
                        </span>
                      ))}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        statusText === 'On Leave'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                      }`}
                    >
                      {statusText}
                    </span>

                    {/* Shifts Action Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedStaffForShift(staff as StaffMember)}
                      className="h-9 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-amber-400/50"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Shifts</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: HOURS (Matches Figma Design Image 2) */}
      {activeTab === 'hours' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-md space-y-0 animate-in fade-in duration-200">
          <div className="p-4 sm:p-5 border-b border-zinc-800">
            <h3 className="text-sm sm:text-base font-bold text-white">Operating Hours</h3>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {[
              { day: 'Monday', time: '09:00 — 22:00', status: 'Open' },
              { day: 'Tuesday', time: '09:00 — 22:00', status: 'Open' },
              { day: 'Wednesday', time: '09:00 — 22:00', status: 'Open' },
              { day: 'Thursday', time: '09:00 — 22:00', status: 'Open' },
              { day: 'Friday', time: '09:00 — 22:00', status: 'Open' },
              { day: 'Saturday', time: '10:00 — 23:00', status: 'Open' },
              { day: 'Sunday', time: '10:00 — 23:00', status: 'Open' },
            ].map((schedule) => (
              <div
                key={schedule.day}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-zinc-800/30 transition-colors text-xs sm:text-sm"
              >
                {/* Left: Day Name */}
                <span className="font-semibold text-white min-w-[100px]">
                  {schedule.day}
                </span>

                {/* Center: Hours in Monospace */}
                <span className="font-mono font-medium text-zinc-300 tracking-wider">
                  {schedule.time}
                </span>

                {/* Right: Open/Closed Status Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    schedule.status === 'Open'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      schedule.status === 'Open' ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />
                  <span>{schedule.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-md space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-white pb-3 border-b border-zinc-800">
            Live & Recent Branch Orders
          </h3>

          <div className="space-y-3">
            {mockBranchOrders.map((ord) => (
              <div key={ord.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-850/60 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{ord.id}</span>
                    <span className="text-xs font-semibold text-amber-400">• {ord.table}</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">{ord.items}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-white">{ord.total}</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT BRANCH MODAL (Image 3) */}
      <EditBranchModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        branch={currentBranch}
        onSave={(updatedBranch) => {
          setCurrentBranch(updatedBranch);
          if (onEdit) onEdit(updatedBranch);
        }}
      />

      {/* MANAGE SHIFTS MODAL (Image 2) */}
      <ManageShiftsModal
        isOpen={!!selectedStaffForShift}
        onClose={() => setSelectedStaffForShift(null)}
        staff={selectedStaffForShift}
        onSave={(staffId, updatedShifts) => {
          setSelectedStaffForShift(null);
        }}
      />

      {/* ADD STAFF MODAL (Figma Images 2 & 3) */}
      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        restaurantName={currentBranch.name}
        onAddStaff={(newStaff) => {
          setBranchStaff((prev) => [newStaff, ...prev]);
        }}
      />
    </div>
  );
}
