'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, ChevronDown, Sliders, Activity, Check, Shield } from 'lucide-react';
import { branchManagerService, getActiveBranchId, StaffAssignmentItem } from '../../../redux/features/branchManagerApi';

interface StaffDetailViewProps {
  staffId?: string;
  onBack: () => void;
  onUpdateShift?: (info: string) => void;
}

export default function StaffDetailView({
  staffId,
  onBack,
  onUpdateShift,
}: StaffDetailViewProps) {
  const [staffMember, setStaffMember] = useState<StaffAssignmentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'Active' | 'Break' | 'Off Duty'>('Active');
  const [section, setSection] = useState('Floor Dining Room');
  const [tables, setTables] = useState('Tables T-01, T-02');
  const [shiftSchedule, setShiftSchedule] = useState('Lunch Shift (10:00 AM - 4:00 PM)');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchStaffDetail() {
      try {
        setLoading(true);
        const branchId = getActiveBranchId();
        const member = await branchManagerService.getStaffMember(branchId, staffId!);
        if (isMounted && member) {
          setStaffMember(member);
          setStatus(member.isActive ? 'Active' : 'Break');
        }
      } catch (err) {
        console.warn('Could not load staff detail via findOne:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (staffId) {
      fetchStaffDetail();
    }
    return () => {
      isMounted = false;
    };
  }, [staffId]);

  const handleUpdate = () => {
    setUpdateSuccess(true);
    if (onUpdateShift) {
      onUpdateShift(`Updated schedule for ${staffMember?.name || 'Staff Member'} to ${shiftSchedule}`);
    }
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  const displayName = staffMember?.name || 'Staff Member';
  const displayRole = staffMember?.role ? staffMember.role.replace(/_/g, ' ') : 'Staff Member';
  const displayEmail = staffMember?.email || 'No email provided';
  const displayPhone = staffMember?.phone || 'No phone recorded';

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200 font-['Inter']">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition" />
          <span className="text-xs font-semibold font-['Poppins'] leading-4">Back to staff roster</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-neutral-500 text-sm md:text-base font-medium leading-4">
            Assigned Role:
          </span>
          <div className="px-3 py-1.5 bg-yellow-400/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400/30 flex items-center">
            <span className="text-yellow-400 text-sm font-medium uppercase">{displayRole}</span>
          </div>
        </div>
      </div>

      {/* Staff Profile Card */}
      <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white text-lg font-medium font-['Poppins'] leading-5">
                  {displayName}
                </span>
                <div className="px-2 py-0.5 bg-green-500/10 rounded-md flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-green-500 text-xs font-normal">
                    {status}
                  </span>
                </div>
              </div>
              <span className="text-neutral-400 text-xs font-normal">
                Email: {displayEmail} · Phone: {displayPhone}
              </span>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <span className="text-neutral-500 text-sm font-semibold">Duty Status:</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="px-3 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center gap-2 hover:bg-neutral-800 transition cursor-pointer"
              >
                <span className="text-stone-300 text-sm font-medium">{status}</span>
                <ChevronDown className="w-4 h-4 text-stone-300" />
              </button>

              {showStatusDropdown && (
                <div className="absolute right-0 mt-1 w-32 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20 py-1 text-xs">
                  {(['Active', 'Break', 'Off Duty'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStatus(st);
                        setShowStatusDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-stone-200 hover:bg-neutral-800 hover:text-amber-400 transition"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-neutral-800" />

        {/* 4 Summary Stats Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-black/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-1.5">
            <span className="text-neutral-500 text-xs font-normal">
              Current Shift
            </span>
            <span className="text-stone-300 text-sm font-semibold truncate">
              {shiftSchedule}
            </span>
          </div>

          <div className="p-3 bg-black/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-1.5">
            <span className="text-neutral-500 text-xs font-normal">
              Assigned Station
            </span>
            <span className="text-blue-400 text-sm font-semibold truncate">
              {section}
            </span>
          </div>

          <div className="p-3 bg-black/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-1.5">
            <span className="text-neutral-500 text-xs font-normal">
              Assigned Tables
            </span>
            <span className="text-green-500 text-sm font-semibold truncate">
              {tables}
            </span>
          </div>

          <div className="p-3 bg-black/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-1.5">
            <span className="text-neutral-500 text-xs font-normal">
              Database Staff ID
            </span>
            <span className="text-yellow-400 text-xs font-mono font-semibold truncate">
              {staffMember?.staffId || staffId || 'N/A'}
            </span>
          </div>
        </div>

        {/* Permissions */}
        {staffMember?.permissions && staffMember.permissions.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
              <Shield className="w-3.5 h-3.5 text-yellow-400" />
              <span>Assigned Permissions in Database:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {staffMember.permissions.map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 bg-neutral-800/80 border border-neutral-700/60 rounded-md text-[11px] font-mono text-neutral-300"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Manager Controls & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Controls */}
        <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-white" />
            <h2 className="text-white text-base font-medium font-['Poppins']">
              Manager Operational Controls
            </h2>
          </div>

          <div className="w-full h-px bg-neutral-800" />

          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-normal">
              Reassign Floor Section & Station
            </label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950/60 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm focus:outline-neutral-700"
              placeholder="e.g. Floor Section A"
            />
            <input
              type="text"
              value={tables}
              onChange={(e) => setTables(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950/60 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm focus:outline-neutral-700"
              placeholder="e.g. Tables 01, 04, 12"
            />
          </div>

          <div className="w-full h-px bg-neutral-800" />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3.5">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-white text-sm font-normal">
                Update Shift Schedule
              </label>
              <select
                value={shiftSchedule}
                onChange={(e) => setShiftSchedule(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-sm focus:outline-neutral-600 cursor-pointer"
              >
                <option value="Lunch Shift (10:00 AM - 4:00 PM)">Lunch Shift (10:00 AM - 4:00 PM)</option>
                <option value="Morning Shift (8:00 AM - 3:00 PM)">Morning Shift (8:00 AM - 3:00 PM)</option>
                <option value="Dinner Shift (4:00 PM - 11:00 PM)">Dinner Shift (4:00 PM - 11:00 PM)</option>
                <option value="Closing Shift (6:00 PM - 1:00 AM)">Closing Shift (6:00 PM - 1:00 AM)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleUpdate}
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 font-medium text-sm rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 transition flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
            >
              {updateSuccess ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Update</span>
              )}
            </button>
          </div>
        </div>

        {/* Activity */}
        <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-white" />
            <h2 className="text-white text-base font-medium font-['Poppins']">
              Staff Member Metadata
            </h2>
          </div>

          <div className="w-full h-px bg-neutral-800" />

          <div className="flex flex-col gap-2.5 text-xs text-neutral-400">
            <div className="flex justify-between py-2 border-b border-neutral-800">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-medium">Active System User</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-800">
              <span>Branch ID:</span>
              <span className="font-mono text-neutral-300">{staffMember?.branchId || getActiveBranchId()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-800">
              <span>Assigned Date:</span>
              <span className="text-neutral-300">
                {staffMember?.assignedAt ? new Date(staffMember.assignedAt).toLocaleDateString() : 'Active Assignment'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>Role Privilege:</span>
              <span className="text-yellow-400 font-semibold">{displayRole}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
