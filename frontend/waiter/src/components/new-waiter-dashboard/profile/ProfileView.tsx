'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Briefcase,
  Bell,
  Lock,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Pencil,
  X,
} from 'lucide-react';
import BottomDock from '../navigation/BottomDock';
import { useNewWaiterShell } from '../navigation/NewWaiterShellContext';
import { useLogout } from '@/hooks/useLogout';
import { useAppSelector } from '@/redux/store';
import { toast } from 'sonner';

interface ProfileViewProps {
  onNavigateTab?: (tab: string) => void;
  isStandaloneRoute?: boolean;
}

export default function ProfileView({
  onNavigateTab,
  isStandaloneRoute = false,
}: ProfileViewProps) {
  const router = useRouter();
  const { handleLogout } = useLogout();
  const { user } = useAppSelector((state) => state.auth);

  const [isClockedOut, setIsClockedOut] = useState(false);

  // Dynamic Work Information state
  const [workInfo, setWorkInfo] = useState({
    role: 'Waiter',
    assignedTables: '01, 02, 03, 04, 05',
    branch: 'Main Branch',
  });

  // Modal State
  const [isEditWorkModalOpen, setIsEditWorkModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(workInfo);

  const waiterName = user?.name || user?.firstName || 'John Doe';
  const waiterEmail = user?.email || 'm.chen@tavonza-waiter.com';

  const handleClockOut = () => {
    if (isClockedOut) {
      setIsClockedOut(false);
      toast.success('Clocked in! Shift started.');
    } else {
      setIsClockedOut(true);
      toast.info('Clocked out. Shift summary sent to manager.');
    }
  };

  const { inShell } = useNewWaiterShell();

  const profileContent = (
    <div className="flex flex-col pb-6 animate-fadeIn">
      {/* Profile Hero Header matching Figma */}
      <div className="w-full px-5 pt-3 pb-6 bg-gradient-to-b from-neutral-900 to-neutral-900/30 border-b border-white/5 flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-white/20 rounded-full outline outline-1 outline-neutral-200 flex items-center justify-center shadow-lg shadow-black/50">
              <span className="text-white text-3xl font-normal font-sans select-none">
                {waiterName[0] || 'M'}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <h1 className="text-white text-base font-medium font-['Inter'] leading-6 text-center">
                {waiterName}
              </h1>
              <span className="text-indigo-100 text-xs font-normal text-center">
                {waiterEmail}
              </span>

              {/* Station Tag & Active Indicator */}
              <div className="h-6 px-3 py-1 bg-neutral-950 rounded-[10px] inline-flex items-center gap-2 border border-white/10 mt-1">
                <span className="text-white text-xs font-normal font-['Inter']">
                  Waiter · Main Branch
                </span>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isClockedOut ? 'bg-zinc-500' : 'bg-green-500 animate-pulse'
                    }`}
                  />
                  <span
                    className={`text-xs font-normal font-['Inter'] ${
                      isClockedOut ? 'text-zinc-500' : 'text-green-500'
                    }`}
                  >
                    {isClockedOut ? 'Off Shift' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 pt-4 flex flex-col gap-5">
            {/* Shift in Progress Card matching Figma */}
            <div className="w-full p-3 bg-stone-950 rounded-[8px] outline outline-1 outline-offset-[-1px] outline-zinc-900 flex justify-between items-center shadow-sm">
              <div className="flex flex-col">
                <span className="text-stone-300 text-xs font-normal">
                  {isClockedOut ? 'Shift Ended' : 'Shift in Progress'}
                </span>
                <span className="text-indigo-100 text-sm font-medium font-['Inter']">
                  10:00 AM – 06:00 PM
                </span>
              </div>
              <button
                onClick={handleClockOut}
                className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 rounded-[5px] outline outline-[0.50px] outline-neutral-400 text-black text-[10px] font-medium font-['Inter'] transition cursor-pointer font-semibold shadow-sm"
              >
                {isClockedOut ? 'Clock In' : 'Clock Out'}
              </button>
            </div>

            {/* Personal Information Card matching Figma */}
            <div className="w-full bg-stone-950 rounded-[8px] outline outline-1 outline-offset-[-1px] outline-zinc-900 overflow-hidden shadow-sm">
              <div className="w-full px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
                <span className="text-white text-sm font-medium font-['Inter']">
                  Personal Information
                </span>
                <User className="w-4 h-4 text-white/80" />
              </div>

              <div className="p-3 flex flex-col gap-2.5">
                <div className="flex flex-col gap-1">
                  <span className="text-stone-300 text-xs font-normal">Full Name</span>
                  <div className="w-full h-10 px-3 bg-neutral-900 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-neutral-500/10 flex items-center">
                    <span className="text-indigo-100 text-sm font-normal font-['Inter']">
                      {waiterName}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-stone-300 text-xs font-normal">Email Address</span>
                  <div className="w-full h-10 px-3 bg-neutral-900 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-neutral-500/10 flex items-center">
                    <span className="text-indigo-100 text-sm font-normal font-['Inter']">
                      {waiterEmail}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-stone-300 text-xs font-normal">Phone Number</span>
                  <div className="w-full h-10 px-3 bg-neutral-900 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-neutral-500/10 flex items-center">
                    <span className="text-indigo-100 text-sm font-normal font-['Inter']">
                      +1 (555) 012-3456
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-stone-300 text-xs font-normal">Employee ID</span>
                  <div className="w-full h-10 px-3 bg-neutral-900 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-neutral-500/10 flex items-center">
                    <span className="text-indigo-100 text-sm font-normal font-['Inter']">
                      EMP-00247
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Information Card with Interactive Edit Button */}
            <div className="w-full bg-stone-950 rounded-[8px] outline outline-1 outline-offset-[-1px] outline-zinc-900 overflow-hidden shadow-sm">
              <div className="w-full px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-orange-200" />
                  <span className="text-white text-sm font-medium font-['Inter']">
                    Work Information
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditForm(workInfo);
                    setIsEditWorkModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 hover:border-yellow-400/50 rounded-[6px] text-xs font-medium transition cursor-pointer active:scale-95 group shadow-xs"
                  title="Edit Work Information"
                >
                  <Pencil className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="p-3 flex flex-col gap-2.5">
                <div className="flex flex-col gap-1">
                  <span className="text-stone-300 text-xs font-normal">Role</span>
                  <div className="w-full h-10 px-3 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-zinc-800 bg-neutral-900 flex items-center">
                    <span className="text-indigo-100 text-sm font-normal font-['Inter']">
                      {workInfo.role}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-stone-300 text-xs font-normal">Assigned Tables</span>
                  <div className="w-full h-10 px-3 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-zinc-800 bg-neutral-900 flex items-center">
                    <span className="text-indigo-100 text-sm font-normal font-['Inter']">
                      {workInfo.assignedTables}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-stone-300 text-xs font-normal">Branch</span>
                  <div className="w-full h-10 px-3 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-zinc-800 bg-neutral-900 flex items-center">
                    <span className="text-indigo-100 text-sm font-normal font-['Inter']">
                      {workInfo.branch}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Overview matching Figma */}
            <div className="flex flex-col gap-3">
              <span className="text-white text-sm font-medium font-['Inter']">
                Performance Overview
              </span>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-stone-950 rounded-[8px] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-indigo-100 text-base font-semibold font-['Inter']">
                    124
                  </span>
                  <span className="text-indigo-200/80 text-[10px] font-normal text-center">
                    Orders Served
                  </span>
                </div>

                <div className="p-3 bg-stone-950 rounded-[8px] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-indigo-100 text-base font-semibold font-['Inter']">
                    48
                  </span>
                  <span className="text-indigo-200/80 text-[10px] font-normal text-center">
                    Orders Created
                  </span>
                </div>

                <div className="p-3 bg-stone-950 rounded-[8px] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-indigo-100 text-base font-semibold font-['Inter']">
                    36
                  </span>
                  <span className="text-indigo-200/80 text-[10px] font-normal text-center">
                    Customer Requests
                  </span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="flex flex-col gap-3 pt-1">
                {/* 1. Completion Rate */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-300 font-normal">Completion Rate</span>
                    <span className="text-stone-300 font-semibold">96%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="w-[96%] h-full bg-yellow-400 rounded-full" />
                  </div>
                </div>

                {/* 2. Customer Satisfaction */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-300 font-normal">Customer Satisfaction</span>
                    <span className="text-stone-300 font-semibold">4.8 / 5</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="w-[96%] h-full bg-yellow-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings List matching Figma */}
            <div className="flex flex-col gap-3 pt-1">
              <span className="text-white text-sm font-medium font-['Inter']">
                Account Settings
              </span>

              <div className="flex flex-col gap-2.5">
                {/* 1. Notifications */}
                <div
                  onClick={() => toast.info('Notification preferences updated')}
                  className="p-3 bg-neutral-900 hover:bg-neutral-850 rounded-xl border border-white/5 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-bold font-['Inter']">
                        Notifications
                      </span>
                      <span className="text-neutral-400 text-xs font-normal">
                        Order alerts, shift reminders
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </div>

                {/* 2. Change Password */}
                <div
                  onClick={() => toast.info('Password change link sent to email')}
                  className="p-3 bg-neutral-900 hover:bg-neutral-850 rounded-xl border border-white/5 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-bold font-['Inter']">
                        Change Password
                      </span>
                      <span className="text-neutral-400 text-xs font-normal">
                        Last changed 3 months ago
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </div>

                {/* 3. Language */}
                <div
                  onClick={() => toast.info('Language set to English (US)')}
                  className="p-3 bg-neutral-900 hover:bg-neutral-850 rounded-xl border border-white/5 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-bold font-['Inter']">
                        Language
                      </span>
                      <span className="text-neutral-400 text-xs font-normal">
                        English ( US )
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </div>

                {/* 4. Help & Support */}
                <div
                  onClick={() => toast.info('Connecting to Help Desk...')}
                  className="p-3 bg-neutral-900 hover:bg-neutral-850 rounded-xl border border-white/5 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-bold font-['Inter']">
                        Help &amp; Support
                      </span>
                      <span className="text-neutral-400 text-xs font-normal">
                        FAQ, Contact Support
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </div>

                {/* 5. Log Out button */}
                <button
                  onClick={handleLogout}
                  className="w-full h-11 p-3 bg-stone-950 hover:bg-red-500/10 rounded-[8px] outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-3 transition cursor-pointer mt-2"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span className="text-red-500 text-sm font-normal font-['Inter']">
                    Log Out
                  </span>
                </button>
              </div>
            </div>
          </div>
    </div>
  );

  // Edit Work Information Modal
  const editModalContent = isEditWorkModalOpen && (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={() => setIsEditWorkModalOpen(false)}
    >
      <div
        className="w-full max-w-[390px] bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold">Edit Work Information</h3>
              <p className="text-neutral-400 text-[11px]">Update your station, role, and branch</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditWorkModalOpen(false)}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-3.5">
          {/* 1. Staff Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-stone-300">Staff Role</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full h-10 px-3 bg-neutral-950 border border-white/10 focus:border-yellow-400 rounded-lg text-white text-sm focus:outline-none transition cursor-pointer"
            >
              <option value="Waiter">Waiter</option>
              <option value="Head Waiter">Head Waiter</option>
              <option value="Bartender">Bartender</option>
              <option value="Floor Lead">Floor Lead</option>
              <option value="Server">Server</option>
            </select>
          </div>

          {/* 2. Assigned Tables */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-stone-300">Assigned Tables</label>
              <span className="text-[10px] text-neutral-400">Toggle or type comma-separated</span>
            </div>
            <input
              type="text"
              value={editForm.assignedTables}
              onChange={(e) => setEditForm((prev) => ({ ...prev, assignedTables: e.target.value }))}
              placeholder="e.g. 01, 02, 03, 04, 05"
              className="w-full h-10 px-3 bg-neutral-950 border border-white/10 focus:border-yellow-400 rounded-lg text-white text-sm focus:outline-none transition"
            />
            {/* Quick table toggle chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {['01', '02', '03', '04', '05', '06', '07', '08'].map((tbl) => {
                const isSelected = editForm.assignedTables
                  .split(',')
                  .map((t) => t.trim())
                  .includes(tbl);
                return (
                  <button
                    key={tbl}
                    type="button"
                    onClick={() => {
                      const current = editForm.assignedTables
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean);
                      const next = isSelected
                        ? current.filter((t) => t !== tbl)
                        : [...current, tbl].sort();
                      setEditForm((prev) => ({
                        ...prev,
                        assignedTables: next.join(', '),
                      }));
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-yellow-400 text-black font-semibold shadow-xs'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    T-{tbl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Branch */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-stone-300">Assigned Branch</label>
            <select
              value={editForm.branch}
              onChange={(e) => setEditForm((prev) => ({ ...prev, branch: e.target.value }))}
              className="w-full h-10 px-3 bg-neutral-950 border border-white/10 focus:border-yellow-400 rounded-lg text-white text-sm focus:outline-none transition cursor-pointer"
            >
              <option value="Main Branch">Main Branch</option>
              <option value="Downtown Rooftop">Downtown Rooftop</option>
              <option value="Westside Lounge">Westside Lounge</option>
              <option value="Seaside Terrace">Seaside Terrace</option>
              <option value="VIP Garden">VIP Garden</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setIsEditWorkModalOpen(false)}
            className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!editForm.role.trim() || !editForm.branch.trim()) {
                toast.error('Role and Branch cannot be empty');
                return;
              }
              setWorkInfo(editForm);
              setIsEditWorkModalOpen(false);
              toast.success('Work information updated successfully!', {
                description: `Assigned to ${editForm.branch} (${editForm.role})`,
              });
            }}
            className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-semibold transition cursor-pointer shadow-md shadow-yellow-400/20 active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  if (inShell) {
    return (
      <>
        {profileContent}
        {editModalContent}
      </>
    );
  }

  return (
    <div className="w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 font-sans selection:bg-amber-400 selection:text-black">
      <div className="w-full max-w-[420px] min-h-screen sm:min-h-[868px] sm:max-h-[94vh] sm:rounded-[36px] bg-black relative flex flex-col justify-between overflow-hidden sm:border sm:border-white/10 sm:shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        <div className="flex-1 overflow-y-auto pb-28 custom-scrollbar relative">
          {profileContent}
        </div>
        <BottomDock
          activeTab="profile"
          onNavigateTab={onNavigateTab}
          showFloorLabel={true}
        />
      </div>
      {editModalContent}
    </div>
  );
}
