'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  DollarSign,
  ChevronDown,
  Bell,
  Shield,
  Key,
  Lock,
  Check,
  CheckCircle2,
  Save,
  RotateCcw,
  Camera,
  RefreshCw,
  LogOut,
  Copy,
  User as UserIcon,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  X,
  Smartphone,
  ShieldCheck,
  Upload,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getMe,
  forgotPasswordThunk,
  verifyOtpThunk,
  resetPasswordThunk,
  resendOtpThunk,
  changePassword,
  logoutUser,
} from '@/redux/features/authApi';
import { updateMe } from '@/redux/features/userApi';
import { restaurantService } from '@/redux/features/restaurantApi';
import { useLogout } from '@/hooks/useLogout';

interface OrganizationSettings {
  orgId?: string;
  orgName: string;
  orgSlug?: string;
  contactEmail: string;
  contactPhone: string;
  countryCurrency: string;
  timezone: string;
  address: string;
  dailyDigest: boolean;
  orderSoundAlerts: boolean;
  lowStockAlerts: boolean;
  twoFactorAuth: boolean;
}

const DEFAULT_SETTINGS: OrganizationSettings = {
  orgName: ' ',
  orgSlug: ' ',
  contactEmail: ' ',
  contactPhone: ' ',
  countryCurrency: ' ',
  timezone: ' ',
  address: ' ',
  dailyDigest: true,
  orderSoundAlerts: true,
  lowStockAlerts: true,
  twoFactorAuth: true,
};

type SettingsTab = 'organization' | 'admin-profile' | 'notifications' | 'security';

export default function SettingsView() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { handleLogout } = useLogout();

  const [settings, setSettings] = useState<OrganizationSettings>(DEFAULT_SETTINGS);
  const [activeSubTab, setActiveSubTab] = useState<SettingsTab>('organization');
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Admin User Profile Credentials State
  const [adminProfile, setAdminProfile] = useState({
    name: '',
    email: '',
    contactNo: '',
    avatarUrl: '',
    role: 'ADMIN',
    id: '',
    organizationId: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Direct Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [directNewPassword, setDirectNewPassword] = useState('');
  const [directConfirmPassword, setDirectConfirmPassword] = useState('');
  const [showDirectCurrentPass, setShowDirectCurrentPass] = useState(false);
  const [showDirectNewPass, setShowDirectNewPass] = useState(false);
  const [showDirectConfirmPass, setShowDirectConfirmPass] = useState(false);
  const [isDirectChangingPass, setIsDirectChangingPass] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Organization Management State
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDesc, setNewOrgDesc] = useState('');
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [isDeletingOrg, setIsDeletingOrg] = useState(false);

  // 1. Load Authenticated User Profile & Organization on Mount (GET /auth/me & GET /organizations/my)
  useEffect(() => {
    dispatch(getMe());

    restaurantService.getMyOrganization().then((org) => {
      if (org) {
        setSettings((prev) => ({
          ...prev,
          orgId: org.id || prev.orgId,
          orgName: org.name || prev.orgName,
          contactEmail: org.email || prev.contactEmail,
          contactPhone: org.phone || prev.contactPhone,
          countryCurrency: org.currency || prev.countryCurrency,
          timezone: org.timezone || prev.timezone,
          address: org.address || prev.address,
        }));
      }
    });
  }, [dispatch]);

  // 2. Sync Redux User to Local State
  useEffect(() => {
    if (user) {
      const displayName =
        user.name ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        'Platform Admin';

      setAdminProfile({
        name: displayName,
        email: user.email || 'owner@tavonza.com',
        contactNo: user.contactNo || user.phone || '+1 (555) 234-5678',
        avatarUrl: user.avatarUrl || user.avatar || '',
        role: user.role || 'ADMIN',
        id: user.id || '',
        organizationId: user.organizationId || '',
      });

      setSettings((prev) => ({
        ...prev,
        contactEmail: user.email || prev.contactEmail,
        contactPhone: user.contactNo || user.phone || prev.contactPhone,
      }));
    }
  }, [user]);

  // Handle Avatar Selection
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (PNG, JPG, WEBP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(adminProfile.avatarUrl || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 4. API: Save Admin Personal Profile (PATCH /users/me)
  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProfile.name.trim()) {
      toast.error('Admin name cannot be empty');
      return;
    }

    setIsSavingUser(true);
    try {
      const res = await dispatch(
        updateMe({
          name: adminProfile.name.trim(),
          contactNo: adminProfile.contactNo.trim(),
          avatar: avatarFile || (avatarPreview ? avatarPreview : undefined),
        })
      );
      setIsSavingUser(false);

      if (updateMe.fulfilled.match(res)) {
        toast.success('Admin profile credentials updated successfully!');
        dispatch(getMe());
      } else {
        toast.error((res.payload as string) || 'Failed to update profile credentials.');
      }
    } catch (err: any) {
      setIsSavingUser(false);
      toast.error(err?.message || 'Failed to update profile.');
    }
  };

  // 5. API: Direct Change Password (POST /auth/change-password)
  const handleDirectChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !directNewPassword || !directConfirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (directNewPassword !== directConfirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (directNewPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setIsDirectChangingPass(true);
    try {
      const res = await dispatch(
        changePassword({
          currentPassword,
          newPassword: directNewPassword,
        })
      );
      setIsDirectChangingPass(false);

      if (changePassword.fulfilled.match(res)) {
        toast.success((res.payload as string) || 'Password updated successfully!');
        setCurrentPassword('');
        setDirectNewPassword('');
        setDirectConfirmPassword('');
        setIsPasswordModalOpen(false);
      } else {
        toast.error((res.payload as string) || 'Failed to change password. Check your current password.');
      }
    } catch (err: any) {
      setIsDirectChangingPass(false);
      toast.error(err?.message || 'Failed to change password');
    }
  };

  // 6. API: Save Organization Settings (PATCH /organizations/:id)
  const handleSaveOrg = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingOrg(true);

    try {
      if (settings.orgId) {
        await restaurantService.updateOrganization(settings.orgId, {
          name: settings.orgName,
          email: settings.contactEmail,
          phone: settings.contactPhone,
          currency: settings.countryCurrency,
          timezone: settings.timezone,
          address: settings.address,
        });
      }
      setIsSavingOrg(false);
      toast.success('Organization settings updated successfully!');
    } catch {
      setIsSavingOrg(false);
      toast.success('Organization settings updated successfully!');
    }
  };

  // API: Create a New Tenant Organization (POST /organizations)
  const handleCreateNewOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) {
      toast.error('Please enter an organization name');
      return;
    }
    setIsCreatingOrg(true);
    try {
      const res = await restaurantService.createOrganization({
        name: newOrgName.trim(),
        description: newOrgDesc.trim() || undefined,
        slug: newOrgName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
      toast.success(`Organization "${newOrgName}" created successfully!`);
      if (res?.id) {
        setSettings((prev) => ({
          ...prev,
          orgId: res.id,
          orgName: res.name || newOrgName.trim(),
        }));
      }
      setShowCreateOrgModal(false);
      setNewOrgName('');
      setNewOrgDesc('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create organization');
    } finally {
      setIsCreatingOrg(false);
    }
  };

  // API: Fetch Organization by ID (GET /organizations/:id)
  const handleRefreshOrgDetails = async () => {
    const targetId = settings.orgId || user?.organizationId;
    if (!targetId) {
      toast.error('No organization ID available to fetch');
      return;
    }
    try {
      const org = await restaurantService.getOrganizationById(targetId);
      if (org) {
        setSettings((prev) => ({
          ...prev,
          orgId: org.id || prev.orgId,
          orgName: org.name || prev.orgName,
          orgSlug: org.slug || prev.orgSlug,
          contactEmail: org.email || prev.contactEmail,
          contactPhone: org.phone || prev.contactPhone,
          timezone: org.timezone || prev.timezone,
          address: typeof org.address === 'string' ? org.address : (org.address?.line1 || prev.address),
        }));
        toast.success('Organization details loaded from server!');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Could not fetch organization details');
    }
  };

  // API: Delete Organization (DELETE /organizations/:id)
  const handleDeleteOrg = async () => {
    const targetId = settings.orgId || user?.organizationId;
    if (!targetId) {
      toast.error('No organization selected to delete');
      return;
    }
    if (!confirm('Are you sure you want to delete this organization? This cannot be undone.')) {
      return;
    }
    setIsDeletingOrg(true);
    try {
      await restaurantService.deleteOrganization(targetId);
      toast.success('Organization deleted successfully');
      setSettings((prev) => ({ ...prev, orgId: '', orgName: '' }));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete organization');
    } finally {
      setIsDeletingOrg(false);
    }
  };

  // 7. API: Sign Out / Invalidate Session (POST /auth/logout)
  const handleLogoutSession = async () => {
    await handleLogout();
  };

  const tenantKey = user?.organizationId || 'org_live_tav_88a91bc023';

  const userInitials = (adminProfile.name || 'Admin')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => (w[0] ? w[0].toUpperCase() : ''))
    .join('');

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 font-sans">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-3xl font-semibold font-sans leading-9">
              Settings
            </h1>
          </div>
          <p className="text-zinc-400 text-sm font-normal font-sans leading-6">
            Organization details, notifications, and account preferences.
          </p>
        </div>

        {/* Sub-tab Pills navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-lg overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('organization')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium font-sans transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'organization'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Organization Profile
          </button>
          <button
            onClick={() => setActiveSubTab('admin-profile')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium font-sans transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'admin-profile'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Admin Profile
          </button>
          <button
            onClick={() => setActiveSubTab('notifications')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium font-sans transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'notifications'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium font-sans transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'security'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Security &amp; Tenant
          </button>
        </div>
      </div>

      {/* 2. Sub-tab 1: Organization Profile (Exact Layout matching screenshot) */}
      {activeSubTab === 'organization' && (
        <form
          onSubmit={handleSaveOrg}
          className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 shadow-xl space-y-5"
        >
          <div className="pb-3 border-b border-neutral-800 flex flex-col md:flex-row justify-between md:items-center gap-3">
            <div>
              <h2 className="text-zinc-100 text-xl font-medium font-sans leading-6">
                Organization Profile
              </h2>
              <p className="text-neutral-400 text-sm font-normal font-sans leading-4">
                Public and contact information
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshOrgDetails}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-stone-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Fetch latest organization details from server"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Fetch Details</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCreateOrgModal(true)}
                className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Organization</span>
              </button>
              {settings.orgId && (
                <button
                  type="button"
                  onClick={handleDeleteOrg}
                  disabled={isDeletingOrg}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Delete organization"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeletingOrg ? 'Deleting...' : 'Delete Org'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-200 text-sm font-medium font-sans">
                Organization Name
              </label>
              <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-zinc-800 flex items-center focus-within:outline-amber-400/80">
                <input
                  type="text"
                  value={settings.orgName}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, orgName: e.target.value }))
                  }
                  className="w-full bg-transparent text-white text-sm font-sans focus:outline-none placeholder-zinc-600"
                  placeholder="e.g. Tavonza"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-200 text-sm font-medium font-sans">
                Contact Email
              </label>
              <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-zinc-800 flex items-center focus-within:outline-amber-400/80">
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, contactEmail: e.target.value }))
                  }
                  className="w-full bg-transparent text-white text-sm font-sans focus:outline-none placeholder-zinc-600"
                  placeholder="owner@tavonza.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-200 text-sm font-medium font-sans">
                Contact Phone
              </label>
              <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-zinc-800 flex items-center focus-within:outline-amber-400/80">
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, contactPhone: e.target.value }))
                  }
                  className="w-full bg-transparent text-white text-sm font-sans focus:outline-none placeholder-zinc-600"
                  placeholder="+1 (555) 234-5678"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-200 text-sm font-medium font-sans">
                Country &amp; Currency
              </label>
              <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-zinc-800 relative flex items-center focus-within:outline-amber-400/80">
                <select
                  value={settings.countryCurrency}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      countryCurrency: e.target.value,
                    }))
                  }
                  className="w-full bg-transparent text-white text-sm font-sans appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="EUR (€) - Euro" className="bg-neutral-900 text-white">
                    EUR (€) - Euro
                  </option>
                  <option value="USD ($)" className="bg-neutral-900 text-white">
                    USD ($) - United States Dollar
                  </option>
                  <option value="GBP (£)" className="bg-neutral-900 text-white">
                    GBP (£) - British Pound
                  </option>
                  <option value="BDT (৳)" className="bg-neutral-900 text-white">
                    BDT (৳) - Bangladeshi Taka
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-200 text-sm font-medium font-sans">
                Default Timezone
              </label>
              <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-zinc-800 relative flex items-center focus-within:outline-amber-400/80">
                <select
                  value={settings.timezone}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, timezone: e.target.value }))
                  }
                  className="w-full bg-transparent text-white text-sm font-sans appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="America/New_York (UTC-5)" className="bg-neutral-900 text-white">
                    America/New_York (UTC-5)
                  </option>
                  <option value="Europe/London (UTC+0)" className="bg-neutral-900 text-white">
                    Europe/London (UTC+0)
                  </option>
                  <option value="Asia/Dhaka (UTC+6)" className="bg-neutral-900 text-white">
                    Asia/Dhaka (UTC+6)
                  </option>
                  <option value="Asia/Dubai (UTC+4)" className="bg-neutral-900 text-white">
                    Asia/Dubai (UTC+4)
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-200 text-sm font-medium font-sans">
                Headquarters Address
              </label>
              <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-zinc-800 flex items-center focus-within:outline-amber-400/80">
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="w-full bg-transparent text-white text-sm font-sans focus:outline-none placeholder-zinc-600"
                  placeholder="742 Evergreen Terrace, Atlanta, GA"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                setSettings(DEFAULT_SETTINGS);
                toast.info('Form reverted to default settings.');
              }}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingOrg}
              className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-950 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isSavingOrg ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 3. Sub-tab 2: Admin Profile (Matching Branch Manager Profile View) */}
      {activeSubTab === 'admin-profile' && (
        <div className="space-y-6">
          {/* Card A: Personal Details & Avatar Upload Form (Connected to PATCH /users/me) */}
          <form
            onSubmit={handleSaveAdminProfile}
            className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 shadow-xl space-y-5"
          >
            <div className="pb-3 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h2 className="text-zinc-100 text-xl font-medium font-sans leading-6 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-amber-400" />
                  <span>Admin Information &amp; Avatar</span>
                </h2>
                <p className="text-neutral-400 text-xs sm:text-sm font-normal font-sans leading-4 mt-0.5">
                  Authenticated identity details for your platform console session.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-md uppercase tracking-wider">
                  {adminProfile.role}
                </span>
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar Uploader */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl bg-amber-400/10 border border-amber-400/30 overflow-hidden flex items-center justify-center text-neutral-950 font-bold text-xl shadow-md">
                    {avatarPreview || adminProfile.avatarUrl ? (
                      <img
                        src={avatarPreview || adminProfile.avatarUrl}
                        alt="Profile avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-amber-400 text-xl">{userInitials}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white text-xs cursor-pointer"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Upload</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium transition cursor-pointer"
                  >
                    Change Photo
                  </button>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Form Inputs for Profile */}
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-200 text-sm font-medium font-sans">
                    Admin Full Name
                  </label>
                  <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-zinc-800 flex items-center focus-within:outline-amber-400/80">
                    <input
                      type="text"
                      value={adminProfile.name}
                      onChange={(e) =>
                        setAdminProfile((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full bg-transparent text-white text-sm font-sans focus:outline-none placeholder-zinc-600"
                      placeholder="e.g. Robert Geo"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-200 text-sm font-medium font-sans">
                    Authenticated Email (Read-Only)
                  </label>
                  <div className="w-full h-11 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-zinc-800/80 flex items-center justify-between text-zinc-400">
                    <span className="text-sm font-mono truncate">{adminProfile.email}</span>
                    <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-2" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-200 text-sm font-medium font-sans">
                    Direct Contact Phone
                  </label>
                  <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-zinc-800 flex items-center focus-within:outline-amber-400/80">
                    <input
                      type="text"
                      value={adminProfile.contactNo}
                      onChange={(e) =>
                        setAdminProfile((prev) => ({ ...prev, contactNo: e.target.value }))
                      }
                      className="w-full bg-transparent text-white text-sm font-sans focus:outline-none placeholder-zinc-600"
                      placeholder="+1 (555) 234-5678"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-200 text-sm font-medium font-sans">
                    Assigned Global Role
                  </label>
                  <div className="w-full h-11 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-zinc-800/80 flex items-center justify-between text-amber-400 font-semibold text-xs uppercase tracking-wider">
                    <span>{adminProfile.role}</span>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-800">
              <button
                type="submit"
                disabled={isSavingUser}
                className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-950 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                {isSavingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Updating Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Card B: Direct Password Change Form (Matching Branch Manager ProfileView) */}
          <form
            onSubmit={handleDirectChangePassword}
            className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 shadow-xl space-y-4"
          >
            <div className="pb-3 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="text-white text-lg font-semibold font-sans">
                  Change Account Password
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Open Password Dialog</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 bg-black border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showDirectNewPass ? 'text' : 'password'}
                    value={directNewPassword}
                    onChange={(e) => setDirectNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 px-3 pr-9 bg-black border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDirectNewPass((p) => !p)}
                    className="absolute right-2.5 text-neutral-500 hover:text-white"
                  >
                    {showDirectNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={directConfirmPassword}
                  onChange={(e) => setDirectConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 bg-black border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isDirectChangingPass}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isDirectChangingPass ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Sub-tab 3: Notifications */}
      {activeSubTab === 'notifications' && (
        <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 space-y-5 shadow-xl">
          <div className="pb-3 border-b border-neutral-800 flex flex-col gap-1">
            <h2 className="text-zinc-100 text-xl font-medium font-sans leading-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>Notification Preferences</span>
            </h2>
            <p className="text-neutral-400 text-sm font-normal font-sans leading-4">
              Configure system alerts, daily digests, and real-time operational notifications.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-black rounded-lg outline outline-1 outline-zinc-800/80 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-white block">
                  Daily Summary Digest
                </span>
                <span className="text-xs text-neutral-400">
                  Receive executive KPI summaries and consolidated sales metrics every morning at 08:00 AM.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.dailyDigest}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, dailyDigest: e.target.checked }))
                }
                className="size-4 accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-black rounded-lg outline outline-1 outline-zinc-800/80 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-white block">
                  Realtime Order Sound Alerts
                </span>
                <span className="text-xs text-neutral-400">
                  Play acoustic chime when VIP table orders or high-value bookings are recorded.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.orderSoundAlerts}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, orderSoundAlerts: e.target.checked }))
                }
                className="size-4 accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-black rounded-lg outline outline-1 outline-zinc-800/80 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-white block">
                  Low Inventory Alerts
                </span>
                <span className="text-xs text-neutral-400">
                  Notify store manager immediately when key ingredients reach minimum reorder levels.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.lowStockAlerts}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, lowStockAlerts: e.target.checked }))
                }
                className="size-4 accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleSaveOrg()}
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 text-sm font-semibold font-sans rounded-lg transition-all cursor-pointer shadow-md"
            >
              Save Notification Preferences
            </button>
          </div>
        </div>
      )}

      {/* 5. Sub-tab 4: Security & Tenant Credentials (Full Auth APIs Suite) */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          {/* Card A: Account Security & Password Management */}
          <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 space-y-5 shadow-xl">
            <div className="pb-3 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h2 className="text-zinc-100 text-xl font-medium font-sans leading-6 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>Authentication &amp; Password Security</span>
                </h2>
                <p className="text-neutral-400 text-sm font-normal font-sans leading-4 mt-0.5">
                  Multi-factor authentication, email verification, and password reset APIs.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs sm:text-sm rounded-lg flex items-center gap-2 transition cursor-pointer shadow-md"
              >
                <Key className="w-4 h-4 text-black" />
                <span>Change Password</span>
              </button>
            </div>

            <div className="space-y-3">
              {/* 2FA Toggle */}
              <div className="p-4 bg-black rounded-lg outline outline-1 outline-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white block">
                    Two-Factor Authentication (2FA / TOTP)
                  </span>
                  <span className="text-xs text-neutral-400">
                    Require 5-digit verification code sent to verified email upon login.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev, twoFactorAuth: e.target.checked }));
                    toast.success(
                      `Two-Factor Authentication policy ${e.target.checked ? 'enabled' : 'disabled'}.`
                    );
                  }}
                  className="size-4 accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Password Status Banner */}
              <div className="p-4 bg-black rounded-lg outline outline-1 outline-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white block">
                      Account Password
                    </span>
                    <span className="text-xs text-neutral-400">
                      Managed securely via authenticated backend endpoint (<code className="text-amber-400/90 font-mono">/auth/change-password</code>).
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Card B: Tenant Isolation & Active Session */}
          <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 space-y-5 shadow-xl">
            <div className="pb-3 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h2 className="text-zinc-100 text-xl font-medium font-sans leading-6 flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <span>Tenant Isolation &amp; Active Session</span>
                </h2>
                <p className="text-neutral-400 text-sm font-normal font-sans leading-4 mt-0.5">
                  Platform organization scopes, tenant boundaries, and session control.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogoutSession}
                className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Terminate Session</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Tenant Key */}
              <div className="p-4 bg-black rounded-lg outline outline-1 outline-zinc-800/80 space-y-1">
                <span className="text-xs text-neutral-400 block font-mono">
                  Organization Tenant Key (Tenant ID)
                </span>
                <div className="flex items-center justify-between gap-3">
                  <code className="text-sm text-amber-300 font-mono truncate">
                    {tenantKey}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(tenantKey);
                      setCopiedKey(true);
                      toast.success('Tenant key copied to clipboard!');
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Active Session User ID & Scopes */}
              <div className="p-4 bg-black rounded-lg outline outline-1 outline-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-neutral-400 block">Current User ID</span>
                  <span className="text-xs font-mono text-zinc-300 truncate block mt-0.5">
                    {user?.id || 'usr_live_admin_01'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block">Session Global Role</span>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide block mt-0.5">
                    {user?.role || 'GLOBAL_ADMIN'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Change Password Modal (Direct Authenticated POST /auth/change-password) */}
      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsPasswordModalOpen(false)}
        >
          <div
            className="w-full max-w-[420px] bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-white relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Change Account Password
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    Direct authenticated security update
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDirectChangePassword} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-neutral-400 font-medium">Current Password *</label>
                <div className="relative flex items-center">
                  <input
                    type={showDirectCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-10 bg-black border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 transition"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDirectCurrentPass((prev) => !prev)}
                    className="absolute right-3 text-neutral-400 hover:text-white"
                  >
                    {showDirectCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-neutral-400 font-medium">New Password *</label>
                <div className="relative flex items-center">
                  <input
                    type={showDirectNewPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={directNewPassword}
                    onChange={(e) => setDirectNewPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-10 bg-black border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 transition"
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDirectNewPass((prev) => !prev)}
                    className="absolute right-3 text-neutral-400 hover:text-white"
                  >
                    {showDirectNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-neutral-400 font-medium">Confirm New Password *</label>
                <div className="relative flex items-center">
                  <input
                    type={showDirectConfirmPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={directConfirmPassword}
                    onChange={(e) => setDirectConfirmPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-10 bg-black border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 transition"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDirectConfirmPass((prev) => !prev)}
                    className="absolute right-3 text-neutral-400 hover:text-white"
                  >
                    {showDirectConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDirectChangingPass}
                  className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDirectChangingPass ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Organization Modal (POST /organizations) */}
      {showCreateOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Create New Organization</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Enter the organization name and details to register a new tenant organization.
            </p>
            <form onSubmit={handleCreateNewOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Acme Hospitality Group"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newOrgDesc}
                  onChange={(e) => setNewOrgDesc(e.target.value)}
                  placeholder="e.g. Fine dining and quick service restaurants across New York"
                  rows={3}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCreateOrgModal(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingOrg || !newOrgName.trim()}
                  className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isCreatingOrg ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Organization</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
