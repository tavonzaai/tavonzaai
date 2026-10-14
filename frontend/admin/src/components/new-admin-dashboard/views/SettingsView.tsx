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
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { PaginationBar } from '@/components/common';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '@/redux/api/baseApi';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { useClampPage, useClientPage } from '@/hooks/useListPagination';
import {
  SECTION_TO_TAB,
  TAB_TO_SECTION,
  isSettingsSection,
  type SettingsTab,
} from '../settings-sections';
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
  orgSlug: string;
  contactEmail: string;
  contactPhone: string;
}

const DEFAULT_SETTINGS: OrganizationSettings = {
  orgName: '',
  orgSlug: '',
  contactEmail: '',
  contactPhone: '',
};

interface SettingsViewProps {
  section?: string;
}

export default function SettingsView({ section }: SettingsViewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { handleLogout } = useLogout();
  const activeSubTab: SettingsTab = isSettingsSection(section)
    ? SECTION_TO_TAB[section]
    : 'organization';

  const setActiveSubTab = (tab: SettingsTab) => {
    router.push(`/new-admin-dashboard/settings/${TAB_TO_SECTION[tab]}`, { scroll: false });
  };

  const [settings, setSettings] = useState<OrganizationSettings>(DEFAULT_SETTINGS);
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
  const [showDirectNewPass, setShowDirectNewPass] = useState(false);
  const [isDirectChangingPass, setIsDirectChangingPass] = useState(false);

  // Password Reset / Change Password Authentication Modal State (OTP Flow)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pwdStep, setPwdStep] = useState<'request' | 'verify' | 'new-password'>('request');
  const [pwdEmail, setPwdEmail] = useState('');
  const [pwdOtp, setPwdOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isPwdLoading, setIsPwdLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { page: notificationPage, setPage: setNotificationPage } = useClientPage();
  const {
    data: notificationsData,
    isLoading: loadingNotifications,
    isError: notificationsError,
    refetch: refetchNotifications,
  } = useGetNotificationsQuery(
    { page: notificationPage, limit: DEFAULT_PAGE_SIZE },
    { skip: activeSubTab !== 'notifications' },
  );
  const [markAsRead] = useMarkAsReadMutation();
  useClampPage(
    notificationPage,
    notificationsData?.totalPages,
    setNotificationPage,
  );

  // 1. Load Authenticated User Profile & Organization on Mount (GET /auth/me & GET /organizations/my)
  useEffect(() => {
    dispatch(getMe());

    restaurantService.getMyOrganization().then((org) => {
      if (org) {
        setSettings((prev) => ({
          ...prev,
          orgId: org.id || prev.orgId,
          orgName: org.name || prev.orgName,
          orgSlug: org.slug || prev.orgSlug,
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
        email: user.email || '',
        contactNo: user.contactNo || user.phone || '',
        avatarUrl: user.avatarUrl || user.avatar || '',
        role: user.role || 'ADMIN',
        id: user.id || '',
        organizationId: user.organizationId || '',
      });

      setPwdEmail(user.email || '');

      setSettings((prev) => ({
        ...prev,
        contactEmail: user.email || prev.contactEmail,
        contactPhone: user.contactNo || user.phone || prev.contactPhone,
      }));
    }
  }, [user]);

  // 3. Resend OTP Countdown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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
      } else {
        toast.error((res.payload as string) || 'Failed to change password');
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
      if (!settings.orgId) {
        toast.error('No organization is associated with this account.');
        return;
      }
      if (!settings.orgName.trim()) {
        toast.error('Organization name is required.');
        return;
      }

      await restaurantService.updateOrganization(settings.orgId, {
        name: settings.orgName.trim(),
      });

      const currentPhone = user?.contactNo || user?.phone || '';
      if (settings.contactPhone.trim() !== currentPhone) {
        const res = await dispatch(updateMe({ contactNo: settings.contactPhone.trim() }));
        if (!updateMe.fulfilled.match(res)) {
          toast.error(
            (res.payload as string) ||
              'Organization name saved, but contact phone could not be updated.',
          );
          return;
        }
        dispatch(getMe());
      }

      toast.success('Organization settings updated successfully!');
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || 'Failed to update organization settings.',
      );
    } finally {
      setIsSavingOrg(false);
    }
  };

  // 7. API: Request Password Reset OTP (POST /auth/forgot-password)
  const handleRequestOtp = async () => {
    const targetEmail = (pwdEmail || user?.email || settings.contactEmail).trim();
    if (!targetEmail) {
      toast.error('Please enter an account email.');
      return;
    }

    setIsPwdLoading(true);
    try {
      const res = await dispatch(forgotPasswordThunk({ email: targetEmail }));
      setIsPwdLoading(false);

      if (forgotPasswordThunk.fulfilled.match(res)) {
        toast.success(`Verification OTP sent to ${targetEmail}`);
        setPwdStep('verify');
        setResendCooldown(60);
      } else {
        toast.error((res.payload as string) || 'Failed to send OTP code.');
      }
    } catch (err: any) {
      setIsPwdLoading(false);
      toast.error(err?.message || 'Failed to request OTP code.');
    }
  };

  // 8. API: Verify OTP Code (POST /auth/verify-otp)
  const handleVerifyOtp = async () => {
    if (pwdOtp.trim().length < 4) {
      toast.error('Please enter the verification code.');
      return;
    }

    setIsPwdLoading(true);
    try {
      const targetEmail = (pwdEmail || user?.email || settings.contactEmail).trim();
      const res = await dispatch(
        verifyOtpThunk({
          email: targetEmail,
          code: pwdOtp.trim(),
          type: 'password_reset',
        })
      );
      setIsPwdLoading(false);

      if (verifyOtpThunk.fulfilled.match(res)) {
        toast.success('OTP code verified successfully!');
        setPwdStep('new-password');
      } else {
        toast.error((res.payload as string) || 'Invalid or expired OTP code.');
      }
    } catch (err: any) {
      setIsPwdLoading(false);
      toast.error(err?.message || 'Verification failed.');
    }
  };

  // 9. API: Resend OTP Code (POST /auth/resend-otp)
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    const targetEmail = (pwdEmail || user?.email || settings.contactEmail).trim();

    try {
      const res = await dispatch(
        resendOtpThunk({
          email: targetEmail,
          type: 'password_reset',
        })
      );

      if (resendOtpThunk.fulfilled.match(res)) {
        toast.success('New OTP verification code sent to your email!');
        setResendCooldown(60);
      } else {
        toast.error((res.payload as string) || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend OTP.');
    }
  };

  // 10. API: Set New Password (POST /auth/reset-password)
  const handleSetNewPassword = async () => {
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsPwdLoading(true);
    try {
      const targetEmail = (pwdEmail || user?.email || settings.contactEmail).trim();
      const res = await dispatch(
        resetPasswordThunk({
          email: targetEmail,
          code: pwdOtp.trim(),
          newPassword: newPassword.trim(),
        })
      );
      setIsPwdLoading(false);

      if (resetPasswordThunk.fulfilled.match(res)) {
        toast.success('Password updated successfully! Your new password is now active.');
        setIsPasswordModalOpen(false);
        setPwdStep('request');
        setPwdOtp('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error((res.payload as string) || 'Failed to reset password.');
      }
    } catch (err: any) {
      setIsPwdLoading(false);
      toast.error(err?.message || 'Password update failed.');
    }
  };

  // 11. API: Sign Out / Invalidate Session (POST /auth/logout)
  const handleLogoutSession = async () => {
    await handleLogout();
  };

  const tenantKey = user?.organizationId || settings.orgId || '—';

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
        <div
          data-testid="settings-tabs"
          className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-lg overflow-x-auto"
        >
          <button
            type="button"
            data-testid="settings-tab-org-profile"
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
            type="button"
            data-testid="settings-tab-admin-profile"
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
            type="button"
            data-testid="settings-tab-notifications"
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
            type="button"
            data-testid="settings-tab-security"
            onClick={() => setActiveSubTab('security')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium font-sans transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'security'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Security
          </button>
        </div>
      </div>

      {/* 2. Sub-tab 1: Organization Profile (Exact Layout matching screenshot) */}
      {activeSubTab === 'organization' && (
        <form
          data-testid="settings-section-org-profile"
          onSubmit={handleSaveOrg}
          className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 shadow-xl space-y-5"
        >
          <div className="pb-3 border-b border-neutral-800 flex flex-col gap-1">
            <h2 className="text-zinc-100 text-xl font-medium font-sans leading-6">
              Organization Profile
            </h2>
            <p className="text-neutral-400 text-sm font-normal font-sans leading-4">
              Public and contact information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-200 text-sm font-medium font-sans">
                Organization Name
              </label>
              <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-zinc-800 flex items-center focus-within:outline-amber-400/80">
                <input
                  type="text"
                  data-testid="settings-org-name"
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
              <div className="w-full h-11 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-zinc-800/80 flex items-center justify-between text-zinc-400">
                <span className="text-sm font-mono truncate">
                  {settings.contactEmail || '—'}
                </span>
                <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-2" />
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
                Organization Slug
              </label>
              <div className="w-full h-11 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-zinc-800/80 flex items-center justify-between text-zinc-400">
                <span className="text-sm font-mono truncate">{settings.orgSlug || '—'}</span>
                <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-2" />
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            Organization records store name and slug. Contact phone is saved on your admin profile.
            Currency, timezone, and address are configured per branch, not on the organization.
          </p>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                restaurantService.getMyOrganization().then((org) => {
                  setSettings((prev) => ({
                    ...prev,
                    orgId: org?.id || prev.orgId,
                    orgName: org?.name || '',
                    orgSlug: org?.slug || '',
                    contactEmail: user?.email || prev.contactEmail,
                    contactPhone: user?.contactNo || user?.phone || '',
                  }));
                });
                toast.info('Form reverted to saved organization values.');
              }}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="settings-org-save"
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
        <div className="space-y-6" data-testid="settings-section-admin-profile">
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
                      data-testid="settings-admin-name"
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
                data-testid="settings-admin-save"
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
                onClick={() => {
                  setIsPasswordModalOpen(true);
                  setPwdStep('request');
                }}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Forgot password? Use OTP reset</span>
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
        <div
          data-testid="settings-section-notifications"
          className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 space-y-5 shadow-xl"
        >
          <div className="pb-3 border-b border-neutral-800 flex flex-col gap-1">
            <h2 className="text-zinc-100 text-xl font-medium font-sans leading-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>Notification inbox</span>
            </h2>
            <p className="text-neutral-400 text-sm font-normal font-sans leading-4">
              Delivery preference toggles are not stored on the organization record. This inbox
              lists notifications already persisted for your account.
            </p>
          </div>

          {loadingNotifications && (
            <p className="text-sm text-zinc-500">Loading notifications...</p>
          )}
          {notificationsError && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-red-400">Unable to load notifications.</p>
              <button
                type="button"
                onClick={() => refetchNotifications()}
                className="text-xs text-amber-400 hover:text-amber-300"
              >
                Retry
              </button>
            </div>
          )}
          {!loadingNotifications && (notificationsData?.items?.length ?? 0) === 0 && (
            <p className="text-sm text-zinc-500">No notifications yet.</p>
          )}
          <div className="space-y-2">
            {(notificationsData?.items || []).map((item: any) => (
              <div
                key={item.id}
                className="p-4 bg-black rounded-lg outline outline-1 outline-zinc-800/80 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">{item.title || 'Notification'}</p>
                  <p className="text-xs text-neutral-400 mt-1">{item.body || item.message}</p>
                </div>
                {!item.isRead && (
                  <button
                    type="button"
                    onClick={() => markAsRead(item.id)}
                    className="text-xs text-amber-400 hover:text-amber-300 shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
          <PaginationBar
            meta={{
              page: notificationsData?.page || notificationPage,
              limit: notificationsData?.limit || DEFAULT_PAGE_SIZE,
              total: notificationsData?.total || 0,
              totalPages: notificationsData?.totalPages || 1,
            }}
            onPageChange={setNotificationPage}
          />
        </div>
      )}

      {/* 5. Sub-tab 4: Security & Tenant Credentials (Full Auth APIs Suite) */}
      {activeSubTab === 'security' && (
        <div className="space-y-6" data-testid="settings-section-security">
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
                onClick={() => {
                  setIsPasswordModalOpen(true);
                  setPwdStep('request');
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs sm:text-sm rounded-lg flex items-center gap-2 transition cursor-pointer shadow-md"
              >
                <Key className="w-4 h-4 text-black" />
                <span>Reset / Change Password</span>
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
                    Not available in this release. Password changes use the authenticated change-password and OTP reset endpoints.
                  </span>
                </div>
                <input
                  type="checkbox"
                  disabled
                  checked={false}
                  className="size-4 accent-amber-400 cursor-not-allowed opacity-40"
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
                      Managed via backend OTP reset endpoints (<code className="text-amber-400/90 font-mono">/auth/forgot-password</code> &amp; <code className="text-amber-400/90 font-mono">/auth/reset-password</code>).
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(true);
                    setPwdStep('request');
                  }}
                  className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Manage Password
                </button>
              </div>

              <form onSubmit={handleDirectChangePassword} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      data-testid="settings-current-password"
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
                    <input
                      type="password"
                      data-testid="settings-new-password"
                      value={directNewPassword}
                      onChange={(e) => setDirectNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 px-3 bg-black border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      data-testid="settings-confirm-password"
                      value={directConfirmPassword}
                      onChange={(e) => setDirectConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 px-3 bg-black border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    data-testid="settings-password-save"
                    disabled={isDirectChangingPass}
                    className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {isDirectChangingPass ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>
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
                    {user?.id || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block">Session Global Role</span>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide block mt-0.5">
                    {user?.role || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Authentication Password Modal (Full Forgot / Verify / Reset OTP Flow) */}
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
                    {pwdStep === 'request'
                      ? 'Request Password Reset'
                      : pwdStep === 'verify'
                      ? 'Enter 5-Digit Verification Code'
                      : 'Set New Account Password'}
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    Step {pwdStep === 'request' ? '1' : pwdStep === 'verify' ? '2' : '3'} of 3
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

            {/* Step 1: Send OTP to Email */}
            {pwdStep === 'request' && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-300 leading-relaxed">
                  We will send a 5-digit verification code to your verified email address to confirm your identity.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-400">Account Email</label>
                  <input
                    type="email"
                    value={pwdEmail}
                    onChange={(e) => setPwdEmail(e.target.value)}
                    className="w-full h-10 px-3 bg-black border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 transition"
                    placeholder="owner@tavonza.com"
                  />
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
                    type="button"
                    disabled={isPwdLoading}
                    onClick={handleRequestOtp}
                    className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isPwdLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <span>Send OTP Code</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Verify 5-Digit OTP */}
            {pwdStep === 'verify' && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-300 leading-relaxed">
                  A verification code has been dispatched to{' '}
                  <strong className="text-white">{pwdEmail}</strong>. Please enter the code below.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-400">5-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pwdOtp}
                    onChange={(e) => setPwdOtp(e.target.value)}
                    className="w-full h-11 px-3 bg-black border border-neutral-800 rounded-lg text-base font-mono tracking-widest text-center text-amber-400 focus:outline-none focus:border-amber-400 transition"
                    placeholder="•••••"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleResendOtp}
                    className="text-amber-400 hover:underline disabled:text-neutral-500 cursor-pointer"
                  >
                    {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPwdStep('request')}
                    className="text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Change Email
                  </button>
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
                    type="button"
                    disabled={isPwdLoading}
                    onClick={handleVerifyOtp}
                    className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isPwdLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify Code</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Enter New Password */}
            {pwdStep === 'new-password' && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Code verified. Choose a strong new password with at least 8 characters.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-400">New Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-10 px-3 pr-10 bg-black border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 text-neutral-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-400">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-10 px-3 bg-black border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 transition"
                    placeholder="••••••••"
                  />
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
                    type="button"
                    disabled={isPwdLoading}
                    onClick={handleSetNewPassword}
                    className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isPwdLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
