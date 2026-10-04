'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, User, UserPlus, Search, RefreshCw } from 'lucide-react';
import { StaffCardData } from '../types';
import { branchManagerService, getActiveBranchId } from '../../../redux/features/branchManagerApi';
import AddStaffModal from './AddStaffModal';

interface StaffListViewProps {
  onSelectStaff: (staffId: string) => void;
}

const ROLE_TAB_MAP: Record<string, string | undefined> = {
  ALL: undefined,
  Waiters: 'WAITER',
  Kitchen: 'KITCHEN_STAFF',
  Bartenders: 'BARTENDER',
  Cashiers: 'CASHIER',
  'Assistant Manager': 'BRANCH_MANAGER',
};

export default function StaffListView({ onSelectStaff }: StaffListViewProps) {
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [staffList, setStaffList] = useState<StaffCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Debounce search query to prevent unnecessary backend calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      const branchId = getActiveBranchId();
      const mappedRole = ROLE_TAB_MAP[roleFilter];
      const assignments = await branchManagerService.getStaffAssignments(branchId, {
        role: mappedRole,
        search: debouncedSearch,
      });

      if (assignments && assignments.length > 0) {
        const mapped: StaffCardData[] = assignments.map((s: any) => {
          const roleUpper = String(s.role || '').toUpperCase();
          let roleLabel: StaffCardData['role'] = 'Waiters';
          if (roleUpper.includes('KITCHEN') || roleUpper.includes('CHEF')) roleLabel = 'Kitchen';
          else if (roleUpper.includes('CASHIER')) roleLabel = 'Cashiers';
          else if (roleUpper.includes('BARTENDER')) roleLabel = 'Bartenders';
          else if (roleUpper.includes('MANAGER')) roleLabel = 'Assistant Manager';

          const clockIn = s.assignedAt
            ? new Date(s.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '09:00 AM';

          return {
            id: s.staffId || s.id,
            name: s.name || s.staffName || 'Staff Member',
            role: roleLabel,
            status: s.isActive ? 'Active' : 'Break',
            currentShift: 'Morning Shift (09:00 - 17:00)',
            currentAssignment: roleLabel,
            stationTables:
              roleLabel === 'Waiters'
                ? 'Floor Dining Tables'
                : roleLabel === 'Kitchen'
                ? 'Main Prep Line'
                : roleLabel === 'Cashiers'
                ? 'POS Checkout Counter'
                : 'Beverage Bar Counter',
            clockInTime: clockIn,
          };
        });

        setStaffList(mapped);
      } else {
        setStaffList([]);
      }
    } catch (err) {
      console.warn('Could not load live staff:', err);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, debouncedSearch]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleStaffCreated = () => {
    setSuccessToast('New staff member added and credentials created successfully!');
    loadStaff();
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const filterTabs = ['ALL', 'Waiters', 'Kitchen', 'Bartenders', 'Cashiers', 'Assistant Manager'];

  const getStatusBadge = (status: StaffCardData['status']) => {
    if (status === 'Active') {
      return (
        <div className="px-2.5 py-1.5 bg-green-500/10 rounded-md flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          <span className="text-green-500 text-xs font-medium font-['Inter'] leading-4">Active</span>
        </div>
      );
    }
    if (status === 'Break') {
      return (
        <div className="px-2.5 py-1.5 bg-yellow-400/10 rounded-md flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
          <span className="text-yellow-400 text-xs font-medium font-['Inter'] leading-4">Break</span>
        </div>
      );
    }
    return (
      <div className="px-2.5 py-1.5 bg-red-400/10 rounded-md flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
        <span className="text-red-400 text-xs font-medium font-['Inter'] leading-4">Late</span>
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-['Inter'] flex items-center justify-between shadow-lg">
          <span>{successToast}</span>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input (Backend Driven) */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-yellow-400/60 font-['Inter'] transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadStaff}
            disabled={loading}
            title="Refresh Roster from Database"
            className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white hover:border-neutral-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-yellow-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-semibold text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2 font-['Inter']"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Role Filter Chips (Backend-driven) */}
      <div className="flex flex-wrap items-center gap-2">
        {filterTabs.map((tab) => {
          const isActive = roleFilter === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setRoleFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium font-['Poppins'] transition outline outline-1 outline-offset-[-1px] ${
                isActive
                  ? 'bg-yellow-400 text-neutral-900 outline-yellow-400 shadow-sm'
                  : 'bg-transparent text-white outline-neutral-800 hover:bg-neutral-800/60 hover:outline-neutral-700'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 text-neutral-400 text-sm font-['Inter']">
          <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <span>Filtering staff roster from backend database...</span>
        </div>
      )}

      {/* Staff Cards Grid */}
      {!loading && staffList.length === 0 ? (
        <div className="p-12 text-center bg-neutral-900/60 rounded-2xl border border-neutral-800/80 font-['Inter']">
          <User className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-white mb-1">No Staff Members Found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-5">
            {searchQuery || roleFilter !== 'ALL'
              ? 'No staff members matched your filter criteria in the database.'
              : 'No staff members have been assigned to this branch yet.'}
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-semibold text-xs rounded-xl shadow transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create First Staff Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              onClick={() => onSelectStaff(staff.id)}
              className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-3.5 hover:outline-neutral-700 hover:shadow-lg transition cursor-pointer group"
            >
              {/* Header */}
              <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 p-2 bg-zinc-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex justify-center items-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-base font-medium font-['Poppins'] leading-5 group-hover:text-amber-400 transition">
                      {staff.name}
                    </span>
                    <span className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
                      {staff.role}
                    </span>
                  </div>
                </div>

                {getStatusBadge(staff.status)}
              </div>

              <div className="w-full h-px bg-neutral-800" />

              {/* Details */}
              <div className="w-full flex flex-col gap-2.5 font-['Inter']">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-xs font-normal">Current Shift</span>
                  <span className="text-white text-sm font-normal truncate max-w-[210px] text-right">
                    {staff.currentShift}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-xs font-normal">Current Assignment</span>
                  <span className="text-white text-sm font-normal truncate max-w-[210px] text-right">
                    {staff.currentAssignment}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-xs font-normal">Station / Assigned</span>
                  <span className="text-white text-sm font-normal truncate max-w-[210px] text-right">
                    {staff.stationTables}
                  </span>
                </div>
              </div>

              <div className="w-full h-px bg-neutral-800" />

              {/* Footer */}
              <div className="w-full flex justify-between items-center">
                <span className="text-neutral-400 text-sm font-normal font-['Inter']">
                  Clock-in: {staff.clockInTime}
                </span>
                <div className="flex items-center gap-1 text-amber-500 group-hover:text-amber-400">
                  <span className="text-sm font-medium font-['Poppins'] leading-9">
                    View Details
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStaffCreated={handleStaffCreated}
      />
    </div>
  );
}
