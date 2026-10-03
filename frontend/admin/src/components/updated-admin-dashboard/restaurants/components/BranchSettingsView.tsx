'use client';

import React, { useState } from 'react';
import { ChevronLeft, Check, Shield, AlertTriangle } from 'lucide-react';
import { BranchItem, RestaurantBranch } from '../types';

interface BranchSettingsViewProps {
  branch: BranchItem;
  parentRestaurant?: RestaurantBranch;
  onBack: () => void;
  onSave?: (updatedBranch: BranchItem) => void;
  onDeleteBranch?: (branchId: string) => void;
}

type SettingsTab = 'general' | 'notifications' | 'permissions' | 'dangerZone';

export default function BranchSettingsView({
  branch,
  parentRestaurant,
  onBack,
  onSave,
  onDeleteBranch,
}: BranchSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Tab 1: General State
  const [branchName, setBranchName] = useState(branch.name || 'Tavonza Uttara');
  const [branchCode, setBranchCode] = useState('BRN-0101');
  const [timezone, setTimezone] = useState('Asia/Dhaka (UTC+6)');
  const [currency, setCurrency] = useState('BDT — Bangladeshi Taka');
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);

  // Tab 2: Notifications State
  const [newOrdersNotification, setNewOrdersNotification] = useState(true);
  const [staffUpdatesNotification, setStaffUpdatesNotification] = useState(true);
  const [dailyReportsNotification, setDailyReportsNotification] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleSaveGeneral = () => {
    const updated: BranchItem = {
      ...branch,
      name: branchName.trim() || branch.name,
    };
    onSave?.(updated);
    showToast('Branch settings saved successfully!');
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 pb-12">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER WITH BACK BUTTON (Matches Figma Image 2) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Back to Branch"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight leading-tight">
              Branch Settings
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {branch.name} · {parentRestaurant?.name || 'Tavonza Downtown'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB NAVIGATION BAR (General, Notifications, Permissions, Danger Zone) */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-8 border-b border-zinc-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'general', label: 'General' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'permissions', label: 'Permissions' },
          { id: 'dangerZone', label: 'Danger Zone', isDanger: true },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer whitespace-nowrap ${
                isActive
                  ? tab.isDanger
                    ? 'text-rose-400'
                    : 'text-amber-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
              {isActive && (
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                    tab.isDanger ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB CONTENT PANELS */}
      {/* ========================================================================= */}

      {/* TAB 1: GENERAL (Figma Image 2) */}
      {activeTab === 'general' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
          {/* Card 1: Branch Identity */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-md">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-3">
              Branch Identity
            </h3>

            {/* Branch Name */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Branch Name
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Branch Name"
                className="w-full h-11 px-4 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
              />
            </div>

            {/* Branch Code */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Branch Code
              </label>
              <input
                type="text"
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                placeholder="BRN-0101"
                className="w-full h-11 px-4 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-sm font-mono text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
              />
            </div>

            {/* Timezone */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-11 px-4 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-amber-500 cursor-pointer shadow-inner"
              >
                <option value="Asia/Dhaka (UTC+6)">Asia/Dhaka (UTC+6)</option>
                <option value="Asia/Dubai (UTC+4)">Asia/Dubai (UTC+4)</option>
                <option value="Europe/London (UTC+0)">Europe/London (UTC+0)</option>
                <option value="America/New_York (UTC-5)">America/New_York (UTC-5)</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-11 px-4 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-amber-500 cursor-pointer shadow-inner"
              >
                <option value="BDT — Bangladeshi Taka">BDT — Bangladeshi Taka</option>
                <option value="USD — US Dollar">USD — US Dollar</option>
                <option value="EUR — Euro">EUR — Euro</option>
              </select>
            </div>
          </div>

          {/* Card 2: Order Settings */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-md">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-3">
              Order Settings
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Auto-accept orders</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Automatically confirm incoming orders without manual approval
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setAutoAcceptOrders(!autoAcceptOrders)}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                  autoAcceptOrders ? 'bg-amber-500 justify-end' : 'bg-zinc-700 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveGeneral}
            className="w-full h-11 bg-black hover:bg-zinc-950 border border-zinc-700 hover:border-amber-500/60 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
          >
            Save Settings
          </button>
        </div>
      )}

      {/* TAB 2: NOTIFICATIONS (Figma Image 3) */}
      {activeTab === 'notifications' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-md">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-3">
              Notification Preferences
            </h3>

            <div className="divide-y divide-zinc-800/80 space-y-4">
              {/* Toggle 1: New orders */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">New orders</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Get notified when a new order is placed at this branch
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewOrdersNotification(!newOrdersNotification)}
                  className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                    newOrdersNotification ? 'bg-amber-500 justify-end' : 'bg-zinc-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Toggle 2: Staff updates */}
              <div className="pt-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Staff updates</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Alerts when staff check in / check out or go on leave
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStaffUpdatesNotification(!staffUpdatesNotification)}
                  className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                    staffUpdatesNotification ? 'bg-amber-500 justify-end' : 'bg-zinc-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Toggle 3: Daily reports */}
              <div className="pt-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Daily reports</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Receive end-of-day summary report via email
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDailyReportsNotification(!dailyReportsNotification)}
                  className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                    dailyReportsNotification ? 'bg-amber-500 justify-end' : 'bg-zinc-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PERMISSIONS (Figma Image 4) */}
      {activeTab === 'permissions' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-md">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-3">
              Role Permissions
            </h3>

            <div className="divide-y divide-zinc-800/80 text-xs">
              {/* Role: Branch Manager */}
              <div className="py-4 space-y-2">
                <h4 className="font-bold text-white text-xs">Branch Manager</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['View Orders', 'Edit Menu', 'Manage Staff', 'View Reports'].map((perm, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Role: Cashier */}
              <div className="py-4 space-y-2">
                <h4 className="font-bold text-white text-xs">Cashier</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['View Orders', 'Process Payments'].map((perm, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Role: Waiter */}
              <div className="py-4 space-y-2">
                <h4 className="font-bold text-white text-xs">Waiter</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['View Orders', 'Update Order Status'].map((perm, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Role: Kitchen Staff */}
              <div className="py-4 space-y-2">
                <h4 className="font-bold text-white text-xs">Kitchen Staff</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['View Orders', 'Update Order Status'].map((perm, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DANGER ZONE (Figma Image 5) */}
      {activeTab === 'dangerZone' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
          <div className="bg-zinc-900/90 border border-rose-500/30 rounded-2xl p-6 space-y-4 shadow-md">
            <div>
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Danger Zone
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                These actions are irreversible. Proceed with caution.
              </p>
            </div>

            <div className="divide-y divide-zinc-800/80 pt-2 text-xs">
              {/* Action 1: Temporarily close branch */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white">Temporarily close branch</h4>
                  <p className="text-zinc-400 mt-0.5">
                    Mark this branch as temporarily closed. Orders will be paused.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Branch temporarily closed')}
                  className="h-9 px-4 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Close Branch
                </button>
              </div>

              {/* Action 2: Transfer branch ownership */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white">Transfer branch ownership</h4>
                  <p className="text-zinc-400 mt-0.5">
                    Transfer this branch to another restaurant in your network.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Ownership transfer modal opened')}
                  className="h-9 px-4 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Transfer
                </button>
              </div>

              {/* Action 3: Delete this branch */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-rose-400">Delete this branch</h4>
                  <p className="text-zinc-400 mt-0.5">
                    Permanently delete this branch and all its data. This cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteBranch) onDeleteBranch(branch.id);
                    onBack();
                  }}
                  className="h-9 px-4 rounded-xl border border-rose-500/50 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Delete Branch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl font-semibold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
