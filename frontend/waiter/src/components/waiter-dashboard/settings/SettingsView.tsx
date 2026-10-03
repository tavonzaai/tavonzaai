'use client';

import React, { useState } from 'react';
import {
  User,
  Bell,
  Clock,
  Shield,
  LogOut,
  Camera,
  Edit2,
  Key,
  Smartphone,
  Laptop,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';
import { useAppSelector } from '@/redux/hooks';

export default function SettingsView() {
  const { user } = useAppSelector((state) => state.auth);
  const { handleLogout } = useLogout();
  const [activeTab, setActiveTab] = useState<'Profile' | 'Notifications' | 'Shift' | 'Security'>('Profile');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    fullName: user?.name || user?.email?.split('@')[0] || 'Michael Davis',
    employeeId: user?.id?.substring(0, 8).toUpperCase() || 'TVZ-2041',
    role: user?.assignments?.[0]?.role?.replace(/_/g, ' ') || 'Senior Waiter',
    branch: user?.assignments?.[0]?.branch?.name || 'Downtown Branch',
    email: user?.email || 'michael.davis@tavonza.com',
    phone: user?.phone || '+1 (555) 012-3456',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState({
    orderReady: true,
    guestRequests: true,
    aiInsights: true,
    billRequests: true,
    soundAlerts: true,
    shiftSummaryEmail: false,
  });

  // Shift Preferences State
  const [shiftPrefs, setShiftPrefs] = useState({
    defaultSection: 'Main Hall + Window',
    maxTables: '8 tables',
    shiftDuration: '8 hours',
    breakReminder: 'Every 3 hours',
    summaryEmail: 'Receive end-of-shift performance summary',
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const toggleNotif = (key: keyof typeof notifPrefs) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9">
            Settings
          </h1>
          <p className="text-zinc-500 text-lg font-normal font-['Inter'] leading-6 mt-1">
            Manage your account and preferences
          </p>
        </div>
      </div>

      {/* 2. Main Two-Column Layout: Left Navigation + Right Content */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Left Side Navigation Card */}
        <div className="w-full md:w-56 p-3 bg-white/5 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10.20px] flex flex-col justify-between flex-shrink-0">
          <div className="space-y-1">
            {(['Profile', 'Notifications', 'Shift', 'Security'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium font-['DM_Sans'] transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-amber-500 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab}</span>
                  {tab === 'Notifications' && (
                    <span
                      className={`text-xs px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-black/20 text-white' : 'bg-white/10 text-zinc-400'
                      }`}
                    >
                      5
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sign Out Button */}
          <div className="pt-3.5 mt-3.5 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to sign out?')) {
                  handleLogout();
                }
              }}
              className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-base font-medium font-['DM_Sans'] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 w-full space-y-6">
          {/* TAB 1: Profile Information */}
          {activeTab === 'Profile' && (
            <div className="space-y-6">
              {/* Profile Details Card */}
              <div className="p-5 bg-white/5 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10.20px] space-y-5">
                <h3 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-4">
                  Profile Information
                </h3>

                {/* Avatar Row */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                      alt="Michael Davis"
                      className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-slate-200 text-lg font-bold font-['DM_Sans'] leading-6">
                      {profileData.fullName}
                    </h4>
                    <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Waiter · 4 years at Tavonza
                    </p>
                    <button
                      type="button"
                      onClick={() => alert('Change photo dialog opened.')}
                      className="text-amber-500 text-xs font-medium font-['DM_Sans'] flex items-center gap-1 hover:underline cursor-pointer pt-0.5"
                    >
                      <Camera className="w-3 h-3 text-amber-500" />
                      <span>Change Photo</span>
                    </button>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase leading-4 tracking-wide">
                        Full Name
                      </label>
                      <div className="h-10 px-3 bg-white/5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, fullName: e.target.value })
                          }
                          className="bg-transparent border-none text-slate-200 text-base font-normal font-['DM_Sans'] w-full focus:outline-none"
                        />
                        <Edit2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Employee ID */}
                    <div className="space-y-1">
                      <label className="text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase leading-4 tracking-wide">
                        Employee ID
                      </label>
                      <div className="h-10 px-3 bg-white/5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
                        <input
                          type="text"
                          value={profileData.employeeId}
                          readOnly
                          className="bg-transparent border-none text-slate-400 text-base font-normal font-['DM_Sans'] w-full focus:outline-none cursor-not-allowed"
                        />
                        <span className="text-xs text-zinc-500">Locked</span>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-1">
                      <label className="text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase leading-4 tracking-wide">
                        Role
                      </label>
                      <div className="h-10 px-3 bg-white/5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
                        <input
                          type="text"
                          value={profileData.role}
                          onChange={(e) =>
                            setProfileData({ ...profileData, role: e.target.value })
                          }
                          className="bg-transparent border-none text-slate-200 text-base font-normal font-['DM_Sans'] w-full focus:outline-none"
                        />
                        <Edit2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Branch */}
                    <div className="space-y-1">
                      <label className="text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase leading-4 tracking-wide">
                        Branch
                      </label>
                      <div className="h-10 px-3 bg-white/5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
                        <input
                          type="text"
                          value={profileData.branch}
                          onChange={(e) =>
                            setProfileData({ ...profileData, branch: e.target.value })
                          }
                          className="bg-transparent border-none text-slate-200 text-base font-normal font-['DM_Sans'] w-full focus:outline-none"
                        />
                        <Edit2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase leading-4 tracking-wide">
                        Email
                      </label>
                      <div className="h-10 px-3 bg-white/5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({ ...profileData, email: e.target.value })
                          }
                          className="bg-transparent border-none text-slate-200 text-base font-normal font-['DM_Sans'] w-full focus:outline-none"
                        />
                        <Edit2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase leading-4 tracking-wide">
                        Phone
                      </label>
                      <div className="h-10 px-3 bg-white/5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
                        <input
                          type="text"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({ ...profileData, phone: e.target.value })
                          }
                          className="bg-transparent border-none text-slate-200 text-base font-normal font-['DM_Sans'] w-full focus:outline-none"
                        />
                        <Edit2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-white text-sm font-bold font-['Plus_Jakarta_Sans'] leading-4 rounded-md transition-all cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      Save Changes
                    </button>
                    {savedSuccess && (
                      <span className="text-emerald-400 text-sm flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Saved successfully!
                      </span>
                    )}
                  </div>
                </form>
              </div>

              {/* Performance This Month Section */}
              <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 space-y-4 shadow-xl">
                <h3 className="text-slate-200 text-lg font-semibold font-['DM_Sans'] leading-5">
                  Performance This Month
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Tables Served */}
                  <div className="p-4 bg-neutral-400/5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10.20px] space-y-1">
                    <div className="text-blue-500 text-3xl font-bold font-['Plus_Jakarta_Sans'] leading-tight">
                      284
                    </div>
                    <div className="text-zinc-500 text-sm font-medium font-['Inter'] leading-4">
                      Tables Served
                    </div>
                  </div>

                  {/* Avg. Rating */}
                  <div className="p-4 bg-neutral-400/5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10.20px] space-y-1">
                    <div className="text-orange-500 text-3xl font-bold font-['Plus_Jakarta_Sans'] leading-tight">
                      4.9
                    </div>
                    <div className="text-zinc-500 text-sm font-medium font-['Inter'] leading-4">
                      Avg. Rating
                    </div>
                  </div>

                  {/* Upsells Made */}
                  <div className="p-4 bg-neutral-400/5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10.20px] space-y-1">
                    <div className="text-green-500 text-3xl font-bold font-['Plus_Jakarta_Sans'] leading-tight">
                      47
                    </div>
                    <div className="text-zinc-500 text-sm font-medium font-['Inter'] leading-4">
                      Upsells Made
                    </div>
                  </div>

                  {/* Avg. Service */}
                  <div className="p-4 bg-neutral-400/5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10.20px] space-y-1">
                    <div className="text-purple-500 text-3xl font-bold font-['Plus_Jakarta_Sans'] leading-tight">
                      11 min
                    </div>
                    <div className="text-zinc-500 text-sm font-medium font-['Inter'] leading-4">
                      Avg. Service
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Notification Preferences */}
          {activeTab === 'Notifications' && (
            <div className="p-5 bg-[#0D0D0D] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 space-y-4 shadow-xl">
              <h3 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-4">
                Notification Preferences
              </h3>

              <div className="divide-y divide-white/5">
                {/* 1. Order Ready Alerts */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Order Ready Alerts
                    </h4>
                    <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Notify when food is ready at the pass
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotif('orderReady')}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      notifPrefs.orderReady ? 'bg-amber-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notifPrefs.orderReady ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Guest Requests */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Guest Requests
                    </h4>
                    <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Instant alerts for guest assistance calls
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotif('guestRequests')}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      notifPrefs.guestRequests ? 'bg-amber-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notifPrefs.guestRequests ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. AI Insights */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      AI Insights
                    </h4>
                    <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Smart suggestions from Tavonza AI
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotif('aiInsights')}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      notifPrefs.aiInsights ? 'bg-amber-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notifPrefs.aiInsights ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Bill Requests */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Bill Requests
                    </h4>
                    <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Alert when guests request their bill
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotif('billRequests')}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      notifPrefs.billRequests ? 'bg-amber-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notifPrefs.billRequests ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 5. Sound Alerts */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Sound Alerts
                    </h4>
                    <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Play audio for critical notifications
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotif('soundAlerts')}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      notifPrefs.soundAlerts ? 'bg-amber-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notifPrefs.soundAlerts ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 6. Shift Summary Email */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Shift Summary Email
                    </h4>
                    <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Receive end-of-shift performance summary
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotif('shiftSummaryEmail')}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      notifPrefs.shiftSummaryEmail ? 'bg-amber-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notifPrefs.shiftSummaryEmail ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Shift Preferences */}
          {activeTab === 'Shift' && (
            <div className="p-5 bg-[#0D0D0D] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 space-y-4 shadow-xl">
              <h3 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-4">
                Shift Preferences
              </h3>

              <div className="divide-y divide-white/5">
                {/* Default Section */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Default Section
                    </h4>
                    <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      {shiftPrefs.defaultSection}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const val = prompt('Edit Default Section:', shiftPrefs.defaultSection);
                      if (val) setShiftPrefs({ ...shiftPrefs, defaultSection: val });
                    }}
                    className="text-amber-500 text-sm font-medium font-['DM_Sans'] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                {/* Max Tables */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Max Tables
                    </h4>
                    <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      {shiftPrefs.maxTables}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const val = prompt('Edit Max Tables:', shiftPrefs.maxTables);
                      if (val) setShiftPrefs({ ...shiftPrefs, maxTables: val });
                    }}
                    className="text-amber-500 text-sm font-medium font-['DM_Sans'] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                {/* Shift Duration */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Shift Duration
                    </h4>
                    <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      {shiftPrefs.shiftDuration}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const val = prompt('Edit Shift Duration:', shiftPrefs.shiftDuration);
                      if (val) setShiftPrefs({ ...shiftPrefs, shiftDuration: val });
                    }}
                    className="text-amber-500 text-sm font-medium font-['DM_Sans'] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                {/* Break Reminder */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Break Reminder
                    </h4>
                    <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      {shiftPrefs.breakReminder}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const val = prompt('Edit Break Reminder:', shiftPrefs.breakReminder);
                      if (val) setShiftPrefs({ ...shiftPrefs, breakReminder: val });
                    }}
                    className="text-amber-500 text-sm font-medium font-['DM_Sans'] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                {/* Shift Summary Email */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Shift Summary Email
                    </h4>
                    <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      {shiftPrefs.summaryEmail}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const val = prompt('Edit Summary Email preference:', shiftPrefs.summaryEmail);
                      if (val) setShiftPrefs({ ...shiftPrefs, summaryEmail: val });
                    }}
                    className="text-amber-500 text-sm font-medium font-['DM_Sans'] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Security Settings */}
          {activeTab === 'Security' && (
            <div className="p-5 bg-[#0D0D0D] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 space-y-4 shadow-xl">
              <h3 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-4">
                Security Settings
              </h3>

              <div className="divide-y divide-white/5">
                {/* 1. Change PIN */}
                <div
                  onClick={() => alert('Change 4-Digit Login PIN dialog triggered.')}
                  className="py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer rounded-lg px-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 flex-shrink-0">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                        Change PIN
                      </h4>
                      <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                        Update your 4-digit login PIN
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>

                {/* 2. Two-Factor Auth */}
                <div
                  onClick={() => alert('Two-Factor Authentication configuration opened.')}
                  className="py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer rounded-lg px-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 flex-shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                        Two-Factor Auth
                      </h4>
                      <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                        Add extra security to your account
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>

                {/* 3. Active Sessions */}
                <div
                  onClick={() => alert('Active Sessions: 1 POS Handheld, 1 iPad Terminal active.')}
                  className="py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer rounded-lg px-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 flex-shrink-0">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                        Active Sessions
                      </h4>
                      <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                        View and manage active logins
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
