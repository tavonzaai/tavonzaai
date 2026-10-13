'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Store,
  Bot,
  CreditCard,
  Shield,
  Bell,
  Check,
  Save,
  Download,
  Key,
  Smartphone,
  Laptop,
  Plus,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  Lock,
  RefreshCw,
  Sliders,
  DollarSign,
  Users,
  MapPin,
  ExternalLink,
  ChevronRight,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getMe } from '@/redux/features/authApi';
import { updateMe } from '@/redux/features/userApi';

export type SettingsTab =
  | 'Profile'
  | 'Branches'
  | 'AI Autonomy'
  | 'Billing'
  | 'Security'
  | 'Notifications';

export default function SettingsView() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState<SettingsTab>('Profile');

  // 1. Organization & Owner Profile State
  const [profile, setProfile] = useState({
    groupName: 'Tavonza Hospitality Group',
    founderName: user?.name || user?.firstName || ' ',
    role: user?.role ? user.role.replace(/_/g, ' ') : ' ',
    email: user?.email || ' ',
    phone: user?.contactNo || user?.phone || ' ',
    headquarters: ' ',
    taxId: ' ',
    currency: ' ',
    timezone: ' ',
    fiscalYearStart: ' ',
  });

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        founderName: user.name || user.firstName || prev.founderName,
        email: user.email || prev.email,
        phone: user.contactNo || user.phone || prev.phone,
        role: user.role ? user.role.replace(/_/g, ' ') : prev.role,
      }));
    }
  }, [user]);

  // 2. Multi-Branch Network Toggles
  const [branchToggles, setBranchToggles] = useState({
    centralizedInventory: true,
    unifiedLoyalty: true,
    sharedGuestProfiles: true,
    masterMenuSync: true,
    consolidatedPnL: true,
  });

  // 3. AI Autonomy State
  const [aiAutonomyLevel, setAiAutonomyLevel] = useState<'advisory' | 'semi' | 'full'>('semi');
  const [aiSettings, setAiSettings] = useState({
    autoPOThreshold: 15,
    autoPOLimitDollars: 500,
    dynamicStaffing: true,
    smartTableYield: true,
    kitchenVoiceAutomation: true,
    preventiveEquipmentAlerts: true,
    autoCustomerVIPFlagging: true,
  });

  // 4. Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState({
    revenuePeakOrDipSMS: true,
    inventoryStockoutPush: true,
    negativeReviewAlert: true,
    dailyMorningExecutiveDigest: true,
    payrollApprovalReminder: false,
    supplierPriceHikeWarning: true,
  });

  // 5. Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await dispatch(updateMe({ name: profile.founderName.trim(), contactNo: profile.phone.trim() }));
      if (updateMe.fulfilled.match(res)) {
        toast.success('Organization profile updated successfully.');
      } else {
        toast.error((res.payload as string) || 'Failed to update profile');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    }
  };

  const handleToggleBranch = (key: keyof typeof branchToggles) => {
    setBranchToggles((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(`Network setting updated.`);
      return next;
    });
  };

  const handleToggleAI = (key: keyof typeof aiSettings) => {
    setAiSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(`AI operational parameter updated.`);
      return next;
    });
  };

  const handleToggleNotif = (key: keyof typeof notifPrefs) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(`Executive alert preference updated.`);
      return next;
    });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl font-semibold font-sans tracking-tight leading-9">
            Settings
          </h1>
          <p className="text-zinc-500 text-base font-normal mt-1 leading-6">
            Configure enterprise organization, multi-branch network, AI autonomy, and billing.
          </p>
        </div>

        {/* Quick Org Badge */}
        <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 rounded-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-left">
            <div className="text-xs font-semibold text-white">Tavonza Enterprise</div>
            <div className="text-[10px] text-zinc-400">4 Branches · US East Region</div>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Tabs Sidebar + Active Tab Content) */}
      <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
        {/* Left Navigation Card */}
        <div className="w-full lg:w-64 bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-3 shadow-xl backdrop-blur-md flex-shrink-0">
          <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider hidden lg:block">
            Owner Controls
          </div>

          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 no-scrollbar py-1 lg:py-0">
            {[
              { id: 'Profile', label: 'Organization & Profile', icon: Building2 },
              { id: 'Branches', label: 'Multi-Branch Network', icon: Store, badge: '4 active' },
              { id: 'AI Autonomy', label: 'AI Autonomy & Ops', icon: Bot, isPro: true },
              { id: 'Billing', label: 'Subscription & Billing', icon: CreditCard },
              { id: 'Security', label: 'Security & Team Access', icon: Shield },
              { id: 'Notifications', label: 'Executive Alerts', icon: Bell },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as SettingsTab)}
                  className={`w-auto lg:w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer group whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-white font-semibold shadow-md shadow-amber-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-zinc-400 group-hover:text-amber-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive ? 'bg-black/25 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.isPro && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      isActive ? 'bg-black/25 text-white' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    AI
                  </span>
                )}
              </button>
            );
          })}
          </div>
        </div>

        {/* Right Active Panel */}
        <div className="flex-1 w-full min-w-0">
          {/* TAB 1: Organization & Profile */}
          {activeTab === 'Profile' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Profile Card */}
              <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <div>
                    <h2 className="text-white text-lg font-bold font-sans">
                      Organization & Owner Profile
                    </h2>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      Brand identity, legal registration, and owner executive details.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Verified Group
                  </span>
                </div>

                {/* Avatar / Brand Logo Row */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-inner border border-amber-300">
                    <span>MS</span>
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-white font-bold text-base flex items-center gap-2">
                      {profile.founderName}
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Owner
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">{profile.groupName} · Founder since 2021</div>
                    <button
                      type="button"
                      onClick={() => toast.info('Photo upload dialog opened.')}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Change Brand Logo / Photo</span>
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        Hospitality Brand Name
                      </label>
                      <input
                        type="text"
                        value={profile.groupName}
                        onChange={(e) => setProfile({ ...profile, groupName: e.target.value })}
                        className="w-full h-10 px-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        Principal Founder Name
                      </label>
                      <input
                        type="text"
                        value={profile.founderName}
                        onChange={(e) => setProfile({ ...profile, founderName: e.target.value })}
                        className="w-full h-10 px-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        Official Owner Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full h-10 px-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        Primary Phone
                      </label>
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full h-10 px-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        Corporate Headquarters Address
                      </label>
                      <input
                        type="text"
                        value={profile.headquarters}
                        onChange={(e) => setProfile({ ...profile, headquarters: e.target.value })}
                        className="w-full h-10 px-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        Tax / EIN Registration
                      </label>
                      <input
                        type="text"
                        value={profile.taxId}
                        onChange={(e) => setProfile({ ...profile, taxId: e.target.value })}
                        className="w-full h-10 px-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        Primary Accounting Currency
                      </label>
                      <select
                        value={profile.currency}
                        onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                        className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                      >
                        <option value="USD ($)">USD ($) - United States Dollar</option>
                        <option value="EUR (€)">EUR (€) - Euro</option>
                        <option value="GBP (£)">GBP (£) - British Pound</option>
                        <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        Primary Timezone
                      </label>
                      <input
                        type="text"
                        value={profile.timezone}
                        onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                        className="w-full h-10 px-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        Fiscal Year Start
                      </label>
                      <select
                        value={profile.fiscalYearStart}
                        onChange={(e) => setProfile({ ...profile, fiscalYearStart: e.target.value })}
                        className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                      >
                        <option value="January">January (Calendar Year)</option>
                        <option value="April">April (Q1 Fiscal)</option>
                        <option value="July">July (Mid-year)</option>
                        <option value="October">October (Q4 Fiscal)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-white" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: Multi-Branch Network */}
          {activeTab === 'Branches' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Active Locations Summary */}
              <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <div>
                    <h2 className="text-white text-lg font-bold font-sans">
                      Active Locations Network
                    </h2>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      Multi-outlet synchronization and consolidated operational rules.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success('Add Branch modal opened.')}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-amber-500/10"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>Add New Outlet</span>
                  </button>
                </div>

                {/* 4 Active Branches Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: 'Downtown Branch',
                      type: 'Flagship Restaurant',
                      tables: 42,
                      staff: 18,
                      status: 'Open',
                      address: '104 Main St, Floor 1',
                    },
                    {
                      name: 'Uptown Bistro',
                      type: 'Casual Dining',
                      tables: 28,
                      staff: 12,
                      status: 'Open',
                      address: '88 Lexington Ave',
                    },
                    {
                      name: 'Seaside Terrace',
                      type: 'Waterfront Dining',
                      tables: 35,
                      staff: 14,
                      status: 'Open',
                      address: '42 Harbor Walk',
                    },
                    {
                      name: 'Airport Lounge',
                      type: 'Express Terminal',
                      tables: 16,
                      staff: 8,
                      status: 'Open',
                      address: 'Terminal 2 Concourse B',
                    },
                  ].map((branch) => (
                    <div
                      key={branch.name}
                      className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/90 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-bold text-sm">{branch.name}</div>
                          <div className="text-zinc-400 text-xs">{branch.type}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          {branch.status}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        <span>{branch.address}</span>
                      </div>
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                        <span>{branch.tables} Tables · {branch.staff} Staff</span>
                        <span className="text-amber-400 font-medium hover:underline cursor-pointer">
                          Configure →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Network Synchronization Toggles */}
              <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
                <h3 className="text-white font-bold text-base border-b border-zinc-800/80 pb-3">
                  Cross-Branch Synchronization Policies
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      key: 'centralizedInventory' as const,
                      title: 'Centralized Stock Balancing',
                      desc: 'Allow nearby branches to automatically transfer high-demand raw ingredients and wine stock during shortages.',
                    },
                    {
                      key: 'unifiedLoyalty' as const,
                      title: 'Unified Customer Loyalty & Gift Cards',
                      desc: 'Members can earn and redeem Tavonza reward points and digital balance at any brand location.',
                    },
                    {
                      key: 'sharedGuestProfiles' as const,
                      title: 'Global VIP & Allergy Preferences',
                      desc: 'VIP dining notes, dietary restrictions, and sommelier history propagate instantly across all outlets.',
                    },
                    {
                      key: 'masterMenuSync' as const,
                      title: 'Master Catalog Price Propagation',
                      desc: 'When a recipe price or ingredient cost changes at HQ, update connected branch POS systems simultaneously.',
                    },
                    {
                      key: 'consolidatedPnL' as const,
                      title: 'Consolidated Real-Time P&L Stream',
                      desc: 'Aggregate real-time sales tickets, labor cost percentages, and margin benchmarks into the Owner dashboard.',
                    },
                  ].map((item) => {
                    const isChecked = branchToggles[item.key];
                    return (
                      <div
                        key={item.key}
                        onClick={() => handleToggleBranch(item.key)}
                        className="flex items-start justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors cursor-pointer gap-4"
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-white">{item.title}</div>
                          <div className="text-xs text-zinc-400">{item.desc}</div>
                        </div>
                        <div
                          className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
                            isChecked ? 'bg-amber-500' : 'bg-zinc-800'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              isChecked ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI Autonomy & Operations */}
          {activeTab === 'AI Autonomy' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Autonomy Level Selector */}
              <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
                <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-white text-lg font-bold font-sans">
                      Tavonza AI Core Intelligence Level
                    </h2>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      Determine how autonomously AI makes purchasing, staffing, and floor routing decisions.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'advisory' as const,
                      title: 'Advisory Mode',
                      subtitle: 'Manual Approval Required',
                      desc: 'AI generates insights, forecasts, and orders but never executes without an authorized manager click.',
                    },
                    {
                      id: 'semi' as const,
                      title: 'Semi-Autonomous',
                      subtitle: 'Recommended Setup',
                      desc: 'Routine tasks (prep balancing, table turnover nudges, stock reorders under limit) execute automatically.',
                      recommended: true,
                    },
                    {
                      id: 'full' as const,
                      title: 'Full Autonomous',
                      subtitle: 'High Velocity',
                      desc: 'AI dispatches supplier orders, dynamically re-allocates staff, and balances tickets end-to-end.',
                    },
                  ].map((mode) => {
                    const isSelected = aiAutonomyLevel === mode.id;
                    return (
                      <div
                        key={mode.id}
                        onClick={() => {
                          setAiAutonomyLevel(mode.id);
                          toast.success(`AI Autonomy set to ${mode.title}`);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                            : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {mode.recommended && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white shadow-sm">
                            RECOMMENDED
                          </span>
                        )}
                        <div className="space-y-1">
                          <div className="text-white font-bold text-sm flex items-center justify-between">
                            <span>{mode.title}</span>
                            {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                          </div>
                          <div className="text-xs text-amber-400/90 font-medium">{mode.subtitle}</div>
                          <div className="text-xs text-zinc-400 pt-1 leading-relaxed">{mode.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Operational Thresholds */}
              <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
                <h3 className="text-white font-bold text-base border-b border-zinc-800/80 pb-3">
                  Autonomous Operation Thresholds & Safeguards
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-zinc-800/80">
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <label className="text-xs font-semibold text-zinc-300">
                      Auto-PO Trigger Threshold (% of Stock)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="5"
                        max="35"
                        value={aiSettings.autoPOThreshold}
                        onChange={(e) =>
                          setAiSettings({ ...aiSettings, autoPOThreshold: Number(e.target.value) })
                        }
                        className="flex-1 accent-amber-500 cursor-pointer"
                      />
                      <span className="text-sm font-bold text-white w-12 text-right">
                        {aiSettings.autoPOThreshold}%
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      When inventory falls below this level, AI drafts an express supplier PO.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <label className="text-xs font-semibold text-zinc-300">
                      Max Auto-Approved PO Limit ($ USD)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-400">$</span>
                      <input
                        type="number"
                        value={aiSettings.autoPOLimitDollars}
                        onChange={(e) =>
                          setAiSettings({
                            ...aiSettings,
                            autoPOLimitDollars: Number(e.target.value),
                          })
                        }
                        className="w-full h-9 px-3 bg-zinc-950 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Orders exceeding this dollar amount require explicit owner/manager sign-off.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {[
                    {
                      key: 'dynamicStaffing' as const,
                      title: 'Predictive Shift Roster Generation',
                      desc: 'AI continuously monitors weather forecasts, reservation booking pace, and local event foot-traffic to schedule optimal floor staff.',
                    },
                    {
                      key: 'smartTableYield' as const,
                      title: 'High-Yield Table Allocation Engine',
                      desc: 'Matches VIP and high-spending guest parties to top revenue generating tables and highest rated servers.',
                    },
                    {
                      key: 'kitchenVoiceAutomation' as const,
                      title: 'Kitchen & Floor Voice Agent Copilot',
                      desc: 'Allows servers and line cooks to verbally fire orders, request bill batches, and call station runner relief.',
                    },
                    {
                      key: 'preventiveEquipmentAlerts' as const,
                      title: 'IoT Equipment Degradation Warnings',
                      desc: 'Monitors walk-in cooler compressor temperatures and fryer cycles to prevent costly breakdown emergencies.',
                    },
                  ].map((item) => {
                    const isChecked = aiSettings[item.key];
                    return (
                      <div
                        key={item.key}
                        onClick={() => handleToggleAI(item.key)}
                        className="flex items-start justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors cursor-pointer gap-4"
                      >
                        <div className="space-y-0.5">
                          <div className="text-sm font-semibold text-white">{item.title}</div>
                          <div className="text-xs text-zinc-400">{item.desc}</div>
                        </div>
                        <div
                          className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
                            isChecked ? 'bg-amber-500' : 'bg-zinc-800'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              isChecked ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Subscription & Billing */}
          {activeTab === 'Billing' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Current Plan Card */}
              <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-white text-xl font-bold font-sans">
                        Tavonza Enterprise Tier
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
                        ANNUAL
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs mt-1">
                      Multi-location license with unlimited AI Copilot agents and unified analytics.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">$499<span className="text-xs text-zinc-400 font-normal"> / month</span></div>
                    <div className="text-xs text-emerald-400">Renews on Oct 1, 2026</div>
                  </div>
                </div>

                {/* Quota Progress Bars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Licensed Branches</span>
                      <span className="text-white font-bold">4 / 10 used</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Staff Seats</span>
                      <span className="text-white font-bold">52 / 100 used</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '52%' }} />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">AI Reasoning Cycles</span>
                      <span className="text-emerald-400 font-bold">Unlimited</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                      VISA
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Visa ending in 4092</div>
                      <div className="text-xs text-zinc-400">Expires 08/2028 · Default method</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info('Update payment method modal triggered.')}
                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Change Card
                  </button>
                </div>
              </div>

              {/* Billing History / Invoices */}
              <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <h3 className="text-white font-bold text-base">Billing History & Invoices</h3>
                  <button
                    type="button"
                    onClick={() => toast.success('All receipts exported to ZIP.')}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    Download All Statements
                  </button>
                </div>

                <div className="divide-y divide-zinc-800/80">
                  {[
                    { id: 'INV-2026-009', date: 'Sep 1, 2026', amount: '$499.00', status: 'Paid' },
                    { id: 'INV-2026-008', date: 'Aug 1, 2026', amount: '$499.00', status: 'Paid' },
                    { id: 'INV-2026-007', date: 'Jul 1, 2026', amount: '$499.00', status: 'Paid' },
                    { id: 'INV-2026-006', date: 'Jun 1, 2026', amount: '$499.00', status: 'Paid' },
                  ].map((inv) => (
                    <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-zinc-500" />
                        <div>
                          <div className="text-white font-semibold">{inv.id}</div>
                          <div className="text-zinc-400">{inv.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-white">{inv.amount}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                          {inv.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => toast.success(`Downloading invoice ${inv.id}`)}
                          className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Security & Team Access */}
          {activeTab === 'Security' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* 2FA & Password */}
              <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
                <h2 className="text-white text-lg font-bold font-sans border-b border-zinc-800/80 pb-4">
                  Account Security & Access Credentials
                </h2>

                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm flex items-center gap-2">
                        Two-Factor Authentication (2FA)
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          ENABLED
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        Protected via Authenticator app (TOTP) and hardware security key.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      toast.info('2FA settings updated.');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
                  >
                    Configure
                  </button>
                </div>

                {/* Change Master Password */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Change Master Owner Password</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="password"
                      placeholder="Current Password"
                      className="h-9 px-3 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="password"
                      placeholder="New Strong Password"
                      className="h-9 px-3 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => toast.success('Password updated successfully.')}
                      className="h-9 px-4 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Device Sessions */}
              <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <h3 className="text-white font-bold text-base">Active Logged-In Sessions</h3>
                  <button
                    type="button"
                    onClick={() => toast.success('All other sessions terminated.')}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    Sign Out Other Devices
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      device: 'MacBook Pro 16" (macOS Sequoia)',
                      location: 'New York, USA · Chrome 128',
                      time: 'Active now (This Device)',
                      icon: Laptop,
                      isCurrent: true,
                    },
                    {
                      device: 'iPad Pro 12.9" (Floor Manager Terminal)',
                      location: 'Downtown Branch · Safari',
                      time: '2 hours ago',
                      icon: Smartphone,
                    },
                    {
                      device: 'iPhone 16 Pro (Tavonza Mobile)',
                      location: 'New York, USA · iOS App',
                      time: 'Yesterday',
                      icon: Smartphone,
                    },
                  ].map((sess, idx) => {
                    const Icon = sess.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-zinc-400" />
                          <div>
                            <div className="text-white font-semibold flex items-center gap-2">
                              {sess.device}
                              {sess.isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                                  CURRENT
                                </span>
                              )}
                            </div>
                            <div className="text-zinc-400">{sess.location}</div>
                          </div>
                        </div>
                        <span className="text-zinc-500">{sess.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Notifications & Executive Alerts */}
          {activeTab === 'Notifications' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <div>
                    <h2 className="text-white text-lg font-bold font-sans">
                      Executive Alerts & Broadcast Subscriptions
                    </h2>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      Configure high-priority notifications sent directly to owner mobile phone and inbox.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Live Channel
                  </span>
                </div>

                <div className="space-y-3.5">
                  {[
                    {
                      key: 'revenuePeakOrDipSMS' as const,
                      title: 'Revenue Surge or Dip SMS Threshold (> 15%)',
                      desc: 'Instant text alert whenever an hourly rush deviates significantly from projected sales models.',
                    },
                    {
                      key: 'inventoryStockoutPush' as const,
                      title: 'Emergency Ingredient Stockout Alert',
                      desc: 'Immediate push notification when high-margin prime steak, fresh seafood, or signature liquor drops to critical zero.',
                    },
                    {
                      key: 'negativeReviewAlert' as const,
                      title: 'Sub-3-Star Guest Review Incident',
                      desc: 'Alerts owner immediately if an in-dining or online review scores below acceptable brand hospitality standards.',
                    },
                    {
                      key: 'dailyMorningExecutiveDigest' as const,
                      title: 'Daily 7:00 AM Executive Performance Digest',
                      desc: 'Email summary delivered every morning with previous day net profit, labor percentage, and AI optimization notes.',
                    },
                    {
                      key: 'supplierPriceHikeWarning' as const,
                      title: 'Supplier Wholesale Price Inflation Flag',
                      desc: 'Triggers an advisory when dairy, meat, or produce purveyors raise wholesale ticket pricing by more than 5%.',
                    },
                    {
                      key: 'payrollApprovalReminder' as const,
                      title: 'Bi-Weekly Payroll Finalization Sign-off',
                      desc: 'Notification 24 hours prior to automated ACH bank payroll disbursement to review overtime spikes.',
                    },
                  ].map((item) => {
                    const isChecked = notifPrefs[item.key];
                    return (
                      <div
                        key={item.key}
                        onClick={() => handleToggleNotif(item.key)}
                        className="flex items-start justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors cursor-pointer gap-4"
                      >
                        <div className="space-y-0.5">
                          <div className="text-sm font-semibold text-white">{item.title}</div>
                          <div className="text-xs text-zinc-400">{item.desc}</div>
                        </div>
                        <div
                          className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
                            isChecked ? 'bg-amber-500' : 'bg-zinc-800'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              isChecked ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
