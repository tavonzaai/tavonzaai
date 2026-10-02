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

            {/* Work Information Card matching Figma Snippet 4 */}
            <div className="w-full bg-stone-950 rounded-[8px] outline outline-1 outline-offset-[-1px] outline-zinc-900 overflow-hidden shadow-sm">
              <div className="w-full px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
                <span className="text-white text-sm font-medium font-['Inter']">
                  Work Information
                </span>
                <Briefcase className="w-4 h-4 text-orange-200" />
              </div>

              <div className="p-3 flex flex-col gap-2.5">
                <div className="flex flex-col gap-1">
                  <span className="text-stone-300 text-xs font-normal">Role</span>
                  <div className="w-full h-10 px-3 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-zinc-800 bg-neutral-900 flex items-center">
                    <span className="text-indigo-100 text-sm font-normal font-['Inter']">
                      Waiter
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-stone-300 text-xs font-normal">Assigned Tables</span>
                  <div className="w-full h-10 px-3 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-zinc-800 bg-neutral-900 flex items-center">
                    <span className="text-indigo-100 text-sm font-normal font-['Inter']">
                      01, 02, 03, 04, 05
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-stone-300 text-xs font-normal">Branch</span>
                  <div className="w-full h-10 px-3 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-zinc-800 bg-neutral-900 flex items-center">
                    <span className="text-indigo-100 text-sm font-normal font-['Inter']">
                      Main Branch
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

  if (inShell) {
    return profileContent;
  }

  return (
    <div className="w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 font-sans selection:bg-amber-400 selection:text-black">
      <div className="w-full max-w-[420px] min-h-screen sm:min-h-[868px] sm:max-h-[94vh] sm:rounded-[36px] bg-black relative flex flex-col justify-between overflow-hidden sm:border sm:border-white/10 sm:shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        <div className="flex-1 overflow-y-auto pb-28 custom-scrollbar relative">
          <div className="w-full h-14 px-6 flex items-center justify-between z-30 select-none text-white font-['SF_Pro',-apple-system,sans-serif] shrink-0 sticky top-0 bg-black/90 backdrop-blur-md border-b border-white/5">
            <span className="text-[15px] font-semibold tracking-tight">9:41</span>
          </div>
          {profileContent}
        </div>
        <BottomDock
          activeTab="profile"
          onNavigateTab={onNavigateTab}
          showFloorLabel={true}
        />
      </div>
    </div>
  );
}
