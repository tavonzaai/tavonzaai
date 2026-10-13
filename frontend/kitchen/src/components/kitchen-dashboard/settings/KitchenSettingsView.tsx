'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  ChefHat,
  Bell,
  Sparkles,
  Palette,
  ShieldCheck,
  LogOut,
  Camera,
  Edit2,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Volume2,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import { useLogout } from '@/hooks/useLogout';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { getMe, changePassword } from '@/redux/features/authApi';
import { updateMe } from '@/redux/features/userApi';

type SettingsTab = 'Profile' | 'Kitchen' | 'Notifications' | 'AI Assistant' | 'Appearance' | 'Security';

export default function KitchenSettingsView() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const { handleLogout } = useLogout();
  const [activeTab, setActiveTab] = useState<SettingsTab>('Profile');

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  // --- Profile State ---
  const [profileData, setProfileData] = useState({
    fullName: user?.name || user?.email?.split('@')[0] || 'Kitchen Staff',
    shift: 'AM (6:00 AM – 2:00 PM)',
    role: user?.role ? user.role.replace(/_/g, ' ') : user?.assignments?.[0]?.role?.replace(/_/g, ' ') || 'Chef',
    branch: user?.assignments?.[0]?.branch?.name || 'Main Branch',
    email: user?.email || '',
    phone: user?.contactNo || user?.phone || '',
    employeeId: user?.id ? `#${user.id.substring(0, 8).toUpperCase()}` : '#CHF-0042',
  });

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        fullName: user.name || user.firstName || prev.fullName,
        email: user.email || prev.email,
        phone: user.contactNo || user.phone || prev.phone,
        role: user.role ? user.role.replace(/_/g, ' ') : prev.role,
        branch: user.assignments?.[0]?.branch?.name || prev.branch,
        employeeId: user.id ? `#${user.id.substring(0, 8).toUpperCase()}` : prev.employeeId,
      }));
    }
  }, [user]);

  // --- Kitchen Config State ---
  const [kitchenConfig, setKitchenConfig] = useState({
    targetPrepTime: '15 min',
    highPriorityThreshold: '15 min',
    stationCapacityAlert: '85%',
    inventoryLowStockThreshold: '20%',
  });

  // --- Notification Toggles ---
  const [notifications, setNotifications] = useState({
    highPriorityAlerts: true,
    stationCapacityAlerts: true,
    inventoryLowStockAlerts: true,
    aiInsights: true,
    shiftReminders: false,
    customerFeedback: true,
  });

  // --- AI Assistant Toggles ---
  const [aiConfig, setAiConfig] = useState({
    enableAI: true,
    autoPrioritize: true,
    proactiveRestock: true,
    demandForecasting: true,
    stationLoadBalancing: true,
  });

  // --- Appearance State ---
  const [appearanceConfig, setAppearanceConfig] = useState({
    theme: 'dark', // 'dark' | 'contrast' | 'dim'
    density: 'comfortable', // 'compact' | 'comfortable' | 'expanded'
    soundChime: true,
    rushAlarm: true,
    tempUnit: 'C', // 'C' | 'F'
  });

  // --- Password State ---
  const [passwordData, setPasswordData] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- Danger Zone Modal ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await dispatch(
        updateMe({
          name: profileData.fullName.trim(),
          contactNo: profileData.phone.trim(),
        })
      );
      if (updateMe.fulfilled.match(res)) {
        toast.success('Profile information updated successfully!');
      } else {
        toast.error((res.payload as string) || 'Failed to update profile');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    }
  };

  const handleSaveKitchen = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Kitchen configuration thresholds saved!');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.current || !passwordData.newPass || !passwordData.confirmPass) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordData.newPass !== passwordData.confirmPass) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPass.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    try {
      const res = await dispatch(
        changePassword({
          oldPassword: passwordData.current,
          newPassword: passwordData.newPass,
        })
      );
      if (changePassword.fulfilled.match(res)) {
        toast.success('Password updated successfully!');
        setPasswordData({ current: '', newPass: '', confirmPass: '' });
      } else {
        toast.error((res.payload as string) || 'Failed to update password');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update password');
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.info(`Notification setting updated: ${!prev[key] ? 'Enabled' : 'Disabled'}`);
      return next;
    });
  };

  const toggleAi = (key: keyof typeof aiConfig) => {
    setAiConfig((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.info(`AI setting updated: ${!prev[key] ? 'Enabled' : 'Disabled'}`);
      return next;
    });
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'Profile', label: 'Profile', icon: User },
    { id: 'Kitchen', label: 'Kitchen', icon: ChefHat },
    { id: 'Notifications', label: 'Notifications', icon: Bell },
    { id: 'AI Assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'Appearance', label: 'Appearance', icon: Palette },
    { id: 'Security', label: 'Security', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9 tracking-tight">
            Settings
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg font-normal font-['Inter'] leading-6 mt-0.5">
            Manage your account and preferences
          </p>
        </div>
      </div>

      {/* Main Settings Grid: Sub-Nav on Left + Active Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sub-Navigation Menu */}
        <div className="lg:col-span-3 bg-white/5 border border-white/5 rounded-[12px] p-3 shadow-lg">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-white font-semibold shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="font-['DM_Sans'] tracking-wide">{tab.label}</span>
                </button>
              );
            })}

            {/* Separator and Sign Out Button */}
            <div className="pt-3.5 mt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to sign out?')) {
                    handleLogout();
                  }
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span className="font-['DM_Sans']">Sign Out</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Right Active Panel */}
        <div className="lg:col-span-9 min-w-0">
          {/* TAB 1: PROFILE */}
          {activeTab === 'Profile' && (
            <div className="bg-zinc-900/90 border border-white/10 rounded-[12px] p-6 shadow-xl space-y-6">
              <div className="border-b border-white/5 pb-3">
                <h2 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-4">
                  Profile Information
                </h2>
              </div>

              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="relative size-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src="/assets/costomerpages/customer-page-icon.svg"
                      alt="Chef Michael"
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/icon.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-1">
                      <span className="text-[10px] font-bold text-amber-300">HEAD</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-slate-200 text-lg font-bold font-['DM_Sans'] leading-snug">
                      Chef Michael Torres
                    </h3>
                    <p className="text-slate-400 text-sm font-normal font-['DM_Sans']">
                      Head Chef · Downtown Branch
                    </p>
                    <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      <span className="text-amber-400 text-xs font-medium font-['DM_Sans']">
                        Employee ID: {profileData.employeeId}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => toast.info('Photo upload dialog opened.')}
                    className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-white/10 text-slate-200 text-sm font-medium font-['Inter'] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    Change Photo
                  </button>
                </div>
              </div>

              {/* Form Fields: 2 Columns */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="w-full h-10 px-3 pr-9 bg-white/5 hover:bg-white/10 focus:bg-zinc-800 border border-white/10 focus:border-amber-500/50 rounded-lg text-slate-200 text-base font-normal font-['DM_Sans'] outline-none transition-colors"
                      />
                      <Edit2 className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Shift */}
                  <div className="space-y-1.5">
                    <label className="text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
                      Shift
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileData.shift}
                        onChange={(e) => setProfileData({ ...profileData, shift: e.target.value })}
                        className="w-full h-10 px-3 pr-9 bg-white/5 hover:bg-white/10 focus:bg-zinc-800 border border-white/10 focus:border-amber-500/50 rounded-lg text-slate-200 text-base font-normal font-['DM_Sans'] outline-none transition-colors"
                      />
                      <Edit2 className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
                      Role
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileData.role}
                        onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                        className="w-full h-10 px-3 pr-9 bg-white/5 hover:bg-white/10 focus:bg-zinc-800 border border-white/10 focus:border-amber-500/50 rounded-lg text-slate-200 text-base font-normal font-['DM_Sans'] outline-none transition-colors"
                      />
                      <Edit2 className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Branch */}
                  <div className="space-y-1.5">
                    <label className="text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
                      Branch
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileData.branch}
                        onChange={(e) => setProfileData({ ...profileData, branch: e.target.value })}
                        className="w-full h-10 px-3 pr-9 bg-white/5 hover:bg-white/10 focus:bg-zinc-800 border border-white/10 focus:border-amber-500/50 rounded-lg text-slate-200 text-base font-normal font-['DM_Sans'] outline-none transition-colors"
                      />
                      <Edit2 className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full h-10 px-3 pr-9 bg-white/5 hover:bg-white/10 focus:bg-zinc-800 border border-white/10 focus:border-amber-500/50 rounded-lg text-slate-200 text-base font-normal font-['DM_Sans'] outline-none transition-colors"
                      />
                      <Edit2 className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
                      Phone
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full h-10 px-3 pr-9 bg-white/5 hover:bg-white/10 focus:bg-zinc-800 border border-white/10 focus:border-amber-500/50 rounded-lg text-slate-200 text-base font-normal font-['DM_Sans'] outline-none transition-colors"
                      />
                      <Edit2 className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-sm font-semibold font-['Plus_Jakarta_Sans'] rounded-lg shadow-md hover:shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-white" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: KITCHEN CONFIGURATION */}
          {activeTab === 'Kitchen' && (
            <div className="bg-zinc-900/90 border border-white/10 rounded-[12px] p-6 shadow-xl space-y-5">
              <div className="border-b border-white/5 pb-3">
                <h2 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-4">
                  Kitchen Configuration
                </h2>
              </div>

              <form onSubmit={handleSaveKitchen} className="space-y-4">
                {/* 1. Target Average Prep Time */}
                <div className="py-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Target Average Prep Time
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Alert when orders exceed this threshold
                    </div>
                  </div>
                  <input
                    type="text"
                    value={kitchenConfig.targetPrepTime}
                    onChange={(e) => setKitchenConfig({ ...kitchenConfig, targetPrepTime: e.target.value })}
                    className="w-28 h-8 px-3 py-1 bg-neutral-800 rounded-lg border border-white/10 text-right text-slate-200 text-base font-normal font-['Inter'] focus:border-amber-500/50 outline-none"
                  />
                </div>

                {/* 2. High Priority Threshold */}
                <div className="py-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      High Priority Threshold
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      ETA remaining before order is flagged high priority
                    </div>
                  </div>
                  <input
                    type="text"
                    value={kitchenConfig.highPriorityThreshold}
                    onChange={(e) => setKitchenConfig({ ...kitchenConfig, highPriorityThreshold: e.target.value })}
                    className="w-28 h-8 px-3 py-1 bg-neutral-800 rounded-lg border border-white/10 text-right text-slate-200 text-base font-normal font-['Inter'] focus:border-amber-500/50 outline-none"
                  />
                </div>

                {/* 3. Station Capacity Alert */}
                <div className="py-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Station Capacity Alert
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Alert when station load exceeds this percentage
                    </div>
                  </div>
                  <input
                    type="text"
                    value={kitchenConfig.stationCapacityAlert}
                    onChange={(e) => setKitchenConfig({ ...kitchenConfig, stationCapacityAlert: e.target.value })}
                    className="w-28 h-8 px-3 py-1 bg-neutral-800 rounded-lg border border-white/10 text-right text-slate-200 text-base font-normal font-['Inter'] focus:border-amber-500/50 outline-none"
                  />
                </div>

                {/* 4. Inventory Low Stock Threshold */}
                <div className="py-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Inventory Low Stock Threshold
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Alert when stock drops below this percentage
                    </div>
                  </div>
                  <input
                    type="text"
                    value={kitchenConfig.inventoryLowStockThreshold}
                    onChange={(e) => setKitchenConfig({ ...kitchenConfig, inventoryLowStockThreshold: e.target.value })}
                    className="w-28 h-8 px-3 py-1 bg-neutral-800 rounded-lg border border-white/10 text-right text-slate-200 text-base font-normal font-['Inter'] focus:border-amber-500/50 outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-sm font-semibold font-['Plus_Jakarta_Sans'] rounded-lg shadow-md hover:shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-white" />
                    Save Kitchen Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: NOTIFICATION PREFERENCES */}
          {activeTab === 'Notifications' && (
            <div className="bg-zinc-900/90 border border-white/10 rounded-[12px] p-6 shadow-xl space-y-4">
              <div className="border-b border-white/5 pb-3">
                <h2 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-4">
                  Notification Preferences
                </h2>
              </div>

              <div className="divide-y divide-white/5">
                {/* 1. High Priority Order Alerts */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      High Priority Order Alerts
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Notify when orders are marked high priority
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotification('highPriorityAlerts')}
                    className={`w-10 h-5 relative rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      notifications.highPriorityAlerts ? 'bg-amber-500' : 'bg-gray-800'
                    }`}
                  >
                    <span
                      className={`inline-block size-4 bg-white rounded-full shadow-md transform transition-transform duration-200 top-0.5 absolute ${
                        notifications.highPriorityAlerts ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Station Capacity Alerts */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Station Capacity Alerts
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Notify when stations exceed capacity threshold
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotification('stationCapacityAlerts')}
                    className={`w-10 h-5 relative rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      notifications.stationCapacityAlerts ? 'bg-amber-500' : 'bg-gray-800'
                    }`}
                  >
                    <span
                      className={`inline-block size-4 bg-white rounded-full shadow-md transform transition-transform duration-200 top-0.5 absolute ${
                        notifications.stationCapacityAlerts ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Inventory Low Stock Alerts */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Inventory Low Stock Alerts
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Notify when ingredients fall below par levels
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotification('inventoryLowStockAlerts')}
                    className={`w-10 h-5 relative rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      notifications.inventoryLowStockAlerts ? 'bg-amber-500' : 'bg-gray-800'
                    }`}
                  >
                    <span
                      className={`inline-block size-4 bg-white rounded-full shadow-md transform transition-transform duration-200 top-0.5 absolute ${
                        notifications.inventoryLowStockAlerts ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* 4. AI Insights & Recommendations */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      AI Insights & Recommendations
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Receive proactive AI-generated suggestions
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotification('aiInsights')}
                    className={`w-10 h-5 relative rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      notifications.aiInsights ? 'bg-amber-500' : 'bg-gray-800'
                    }`}
                  >
                    <span
                      className={`inline-block size-4 bg-white rounded-full shadow-md transform transition-transform duration-200 top-0.5 absolute ${
                        notifications.aiInsights ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* 5. Shift Start/End Reminders */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Shift Start/End Reminders
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Receive reminders at the start and end of shifts
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotification('shiftReminders')}
                    className={`w-10 h-5 relative rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      notifications.shiftReminders ? 'bg-amber-500' : 'bg-gray-800'
                    }`}
                  >
                    <span
                      className={`inline-block size-4 bg-white rounded-full shadow-md transform transition-transform duration-200 top-0.5 absolute ${
                        notifications.shiftReminders ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* 6. Customer Feedback Alerts */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Customer Feedback Alerts
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Notify when customer feedback is received
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotification('customerFeedback')}
                    className={`w-10 h-5 relative rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      notifications.customerFeedback ? 'bg-amber-500' : 'bg-gray-800'
                    }`}
                  >
                    <span
                      className={`inline-block size-4 bg-white rounded-full shadow-md transform transition-transform duration-200 top-0.5 absolute ${
                        notifications.customerFeedback ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI ASSISTANT CONFIGURATION */}
          {activeTab === 'AI Assistant' && (
            <div className="bg-zinc-900/90 border border-white/10 rounded-[12px] p-6 shadow-xl space-y-4">
              <div className="border-b border-white/5 pb-3 flex items-center justify-between gap-4">
                <h2 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-4">
                  Tavonza AI Configuration
                </h2>
                <div className="px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 text-xs font-mono leading-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Model v2.1 Active
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {/* 1. Enable Tavonza AI */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Enable Tavonza AI
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      Master switch for all AI-powered features and recommendations
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAi('enableAI')}
                    className={`w-10 h-5 relative rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      aiConfig.enableAI ? 'bg-amber-500' : 'bg-gray-800'
                    }`}
                  >
                    <span
                      className={`inline-block size-4 bg-white rounded-full shadow-md transform transition-transform duration-200 top-0.5 absolute ${
                        aiConfig.enableAI ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Auto-Prioritize Orders */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Auto-Prioritize Orders
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      AI automatically adjusts order priority based on ETA and station load
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAi('autoPrioritize')}
                    className={`w-10 h-5 relative rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      aiConfig.autoPrioritize ? 'bg-amber-500' : 'bg-gray-800'
                    }`}
                  >
                    <span
                      className={`inline-block size-4 bg-white rounded-full shadow-md transform transition-transform duration-200 top-0.5 absolute ${
                        aiConfig.autoPrioritize ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Proactive Restock Alerts */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Proactive Restock Alerts
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      AI predicts and alerts inventory needs before they become critical
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAi('proactiveRestock')}
                    className={`w-10 h-5 relative rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      aiConfig.proactiveRestock ? 'bg-amber-500' : 'bg-gray-800'
                    }`}
                  >
                    <span
                      className={`inline-block size-4 bg-white rounded-full shadow-md transform transition-transform duration-200 top-0.5 absolute ${
                        aiConfig.proactiveRestock ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Demand Forecasting */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Demand Forecasting
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      AI analyzes historical data to forecast upcoming demand
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAi('demandForecasting')}
                    className={`w-10 h-5 relative rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      aiConfig.demandForecasting ? 'bg-amber-500' : 'bg-gray-800'
                    }`}
                  >
                    <span
                      className={`inline-block size-4 bg-white rounded-full shadow-md transform transition-transform duration-200 top-0.5 absolute ${
                        aiConfig.demandForecasting ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* 5. Station Load Balancing */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans'] leading-5">
                      Station Load Balancing
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                      AI suggests order reassignments to balance station workload
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAi('stationLoadBalancing')}
                    className={`w-10 h-5 relative rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      aiConfig.stationLoadBalancing ? 'bg-amber-500' : 'bg-gray-800'
                    }`}
                  >
                    <span
                      className={`inline-block size-4 bg-white rounded-full shadow-md transform transition-transform duration-200 top-0.5 absolute ${
                        aiConfig.stationLoadBalancing ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: APPEARANCE */}
          {activeTab === 'Appearance' && (
            <div className="bg-zinc-900/90 border border-white/10 rounded-[12px] p-6 shadow-xl space-y-6">
              <div className="border-b border-white/5 pb-3">
                <h2 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-4">
                  Appearance & Display Preferences
                </h2>
              </div>

              {/* Theme Selector */}
              <div className="space-y-2">
                <label className="text-white text-sm font-semibold font-['Inter'] uppercase tracking-wide">
                  Display Theme
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'dark', title: 'OLED Midnight', desc: 'True black background for low light kitchens' },
                    { id: 'contrast', title: 'High Contrast', desc: 'Bold borders for steam & high distance' },
                    { id: 'dim', title: 'Studio Dim', desc: 'Warm ambient dark charcoal tones' },
                  ].map((thm) => (
                    <button
                      key={thm.id}
                      type="button"
                      onClick={() => {
                        setAppearanceConfig({ ...appearanceConfig, theme: thm.id });
                        toast.success(`Theme set to ${thm.title}`);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        appearanceConfig.theme === thm.id
                          ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base font-semibold text-white font-['Inter']">{thm.title}</span>
                        {appearanceConfig.theme === thm.id && (
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 font-['Inter']">{thm.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* KDS Density */}
              <div className="space-y-2">
                <label className="text-white text-sm font-semibold font-['Inter'] uppercase tracking-wide">
                  KDS Card Density
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['compact', 'comfortable', 'expanded'].map((dens) => (
                    <button
                      key={dens}
                      type="button"
                      onClick={() => {
                        setAppearanceConfig({ ...appearanceConfig, density: dens });
                        toast.success(`Density updated to ${dens}`);
                      }}
                      className={`py-2 px-3 rounded-lg border text-center text-sm font-medium capitalize font-['Inter'] transition-colors cursor-pointer ${
                        appearanceConfig.density === dens
                          ? 'bg-amber-500 text-white font-bold border-amber-500'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {dens}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Settings */}
              <div className="border-t border-white/5 pt-4 divide-y divide-white/5">
                <div className="py-2.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans']">
                      Ticket Bell Chime
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans']">
                      Audible bell ring whenever a new ticket enters queue
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppearanceConfig((prev) => ({ ...prev, soundChime: !prev.soundChime }));
                      toast.info(`Ticket bell ${!appearanceConfig.soundChime ? 'enabled' : 'disabled'}`);
                    }}
                    className={`w-10 h-5 relative rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      appearanceConfig.soundChime ? 'bg-amber-500' : 'bg-gray-800'
                    }`}
                  >
                    <span
                      className={`inline-block size-4 bg-white rounded-full shadow-md transform transition-transform duration-200 top-0.5 absolute ${
                        appearanceConfig.soundChime ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="py-2.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-200 text-base font-medium font-['DM_Sans']">
                      Rush Hour Alarm
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['DM_Sans']">
                      Pulsing visual & audio alert when queue exceeds threshold
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppearanceConfig((prev) => ({ ...prev, rushAlarm: !prev.rushAlarm }));
                      toast.info(`Rush hour alarm ${!appearanceConfig.rushAlarm ? 'enabled' : 'disabled'}`);
                    }}
                    className={`w-10 h-5 relative rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      appearanceConfig.rushAlarm ? 'bg-amber-500' : 'bg-gray-800'
                    }`}
                  >
                    <span
                      className={`inline-block size-4 bg-white rounded-full shadow-md transform transition-transform duration-200 top-0.5 absolute ${
                        appearanceConfig.rushAlarm ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY */}
          {activeTab === 'Security' && (
            <div className="space-y-6">
              {/* Card 1: Change Password */}
              <div className="bg-zinc-900/90 border border-white/10 rounded-[12px] p-6 shadow-xl space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <h2 className="text-slate-200 text-base font-semibold font-['Inter'] leading-5">
                    Change Password
                  </h2>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-2xl">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 text-sm font-medium font-['Inter'] uppercase tracking-wide">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        className="w-full h-10 px-3 pr-10 bg-neutral-800 border border-white/10 focus:border-amber-500/50 rounded-lg text-slate-200 text-base font-normal font-['Inter'] outline-none transition-colors placeholder:text-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-white cursor-pointer"
                      >
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 text-sm font-medium font-['Inter'] uppercase tracking-wide">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={passwordData.newPass}
                        onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })}
                        className="w-full h-10 px-3 pr-10 bg-neutral-800 border border-white/10 focus:border-amber-500/50 rounded-lg text-slate-200 text-base font-normal font-['Inter'] outline-none transition-colors placeholder:text-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-white cursor-pointer"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 text-sm font-medium font-['Inter'] uppercase tracking-wide">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={passwordData.confirmPass}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPass: e.target.value })}
                        className="w-full h-10 px-3 pr-10 bg-neutral-800 border border-white/10 focus:border-amber-500/50 rounded-lg text-slate-200 text-base font-normal font-['Inter'] outline-none transition-colors placeholder:text-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-white cursor-pointer"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="text-gray-400 text-sm font-normal font-['Inter'] leading-5 pt-1">
                    Password strength tips: at least 12 characters, mix of uppercase, lowercase, numbers, and symbols.
                  </div>

                  {/* Update Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="h-9 px-4 bg-amber-500 hover:bg-amber-400 text-white rounded-lg inline-flex items-center gap-2 font-semibold text-base font-['Inter'] transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-white" />
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 2: Danger Zone */}
              <div className="bg-zinc-900/90 border border-red-500/20 rounded-[12px] p-6 shadow-xl space-y-4">
                <div className="border-b border-red-500/20 pb-3">
                  <h2 className="text-red-400 text-base font-semibold font-['Inter'] leading-5 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Danger Zone
                  </h2>
                </div>

                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="text-slate-200 text-base font-medium font-['Inter']">
                      Delete Account
                    </div>
                    <div className="text-gray-400 text-sm font-normal font-['Inter'] max-w-xl leading-4">
                      Permanently remove your account and all associated data. This cannot be undone.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium font-['Inter'] transition-colors flex-shrink-0 cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-red-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Delete Kitchen Account?</h3>
            </div>
            <p className="text-base text-zinc-400 leading-relaxed">
              Are you sure you want to delete Chef Michael Torres&apos;s kitchen credentials? All active shifts, station logs, and recipe notes will be archived and irreversible.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  toast.error('Account deletion request queued for restaurant administrator approval.');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
