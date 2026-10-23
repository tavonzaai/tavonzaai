'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  ShieldCheck,
  CheckCircle2,
  Camera,
  Upload,
  X,
  Loader2,
  Building2,
  Calendar,
  BadgeCheck,
  KeyRound,
  Copy,
  Check,
  Code,
  Layers,
  Activity,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowRightLeft,
  UserCheck,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { getMe, changePasswordThunk, UserProfile, UserAssignment } from '../../../redux/features/authApi';
import { updateMe } from '../../../redux/features/userApi';
import { baseApiFetch } from '../../../redux/api/baseApi';
import { setActiveBranchIdMemory } from '../../../lib/auth';
import { getActiveBranchId } from '../../../redux/features/branchManagerApi';
import { setUser } from '../../../redux/slices/authSlice';

export default function ProfileView() {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);

  // Live profile data strictly from GET /users/me
  const [liveUser, setLiveUser] = useState<UserProfile | null>(null);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeBranchId, setActiveBranchId] = useState<string>(() => getActiveBranchId());

  /**
   * Authoritative Call to GET /users/me
   */
  const fetchProfile = async (silent = false) => {
    if (!silent) setIsLoadingProfile(true);
    try {
      const res = await baseApiFetch<UserProfile>('/users/me');
      const data = (res.data || (res as any).user || res) as UserProfile;
      setRawApiResponse(res.data ? res.data : res);

      if (data && data.id) {
        setLiveUser(data);
        dispatch(setUser(data));
        setFullName(data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email || '');
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setEmail(data.email || '');
        setPhone(data.contactNo || data.phone || '');
        if (data.avatar) {
          setAvatarPreview(data.avatar);
        }
        if (data.branchId) {
          setActiveBranchId(data.branchId);
        }
      }
    } catch (err: any) {
      console.error('[ProfileView] Error fetching /users/me:', err);
      setMessage({ text: err?.message || 'Failed to fetch user profile from /users/me', type: 'error' });
    } finally {
      if (!silent) setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    dispatch(getMe());
  }, [dispatch]);

  // Sync state if reduxUser changes
  useEffect(() => {
    if (reduxUser && !liveUser) {
      setLiveUser(reduxUser);
      setFullName(reduxUser.name || `${reduxUser.firstName || ''} ${reduxUser.lastName || ''}`.trim() || reduxUser.email || '');
      setFirstName(reduxUser.firstName || '');
      setLastName(reduxUser.lastName || '');
      setEmail(reduxUser.email || '');
      setPhone(reduxUser.contactNo || reduxUser.phone || '');
      if (reduxUser.avatar && !avatarPreview) {
        setAvatarPreview(reduxUser.avatar);
      }
      if (reduxUser.branchId) {
        setActiveBranchId(reduxUser.branchId);
      }
    }
  }, [reduxUser, liveUser, avatarPreview]);

  const activeUser = liveUser || reduxUser;

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleSwitchBranch = (branchId: string, branchName?: string) => {
    setActiveBranchIdMemory(branchId);
    setActiveBranchId(branchId);
    if (reduxUser) {
      dispatch(setUser({ ...reduxUser, branchId } as any));
    }
    setMessage({
      text: `Active session branch switched to "${branchName || branchId}". Page will reload to apply context.`,
      type: 'success',
    });
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ text: 'Please select a valid image file (PNG, JPG, WEBP)', type: 'error' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: 'Image size should not exceed 5MB', type: 'error' });
        return;
      }
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      setMessage(null);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(activeUser?.avatar || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setMessage({ text: 'Full Name is required', type: 'error' });
      return;
    }
    setIsSavingProfile(true);
    setMessage(null);
    try {
      const payload: any = {
        name: fullName.trim(),
        contactNo: phone.trim(),
      };
      if (avatarFile) {
        payload.avatar = avatarFile;
      }
      const res = await dispatch(updateMe(payload));
      setIsSavingProfile(false);
      if (updateMe.fulfilled.match(res)) {
        setMessage({ text: 'Manager profile and avatar updated successfully!', type: 'success' });
        await fetchProfile(true);
      } else {
        setMessage({ text: (res.payload as string) || 'Failed to update profile', type: 'error' });
      }
    } catch (err: any) {
      setIsSavingProfile(false);
      setMessage({ text: err?.message || 'Failed to update profile', type: 'error' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ text: 'Please fill in all password fields', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ text: 'New password must be at least 8 characters', type: 'error' });
      return;
    }
    setIsChangingPass(true);
    setMessage(null);
    try {
      const res = await dispatch(changePasswordThunk({ currentPassword, newPassword }));
      setIsChangingPass(false);
      if (changePasswordThunk.fulfilled.match(res)) {
        setMessage({ text: 'Password updated successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ text: (res.payload as string) || 'Failed to change password', type: 'error' });
      }
    } catch (err: any) {
      setIsChangingPass(false);
      setMessage({ text: err?.message || 'Failed to change password', type: 'error' });
    }
  };

  const initials = (fullName || activeUser?.name || 'BM')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => (w[0] ? w[0].toUpperCase() : ''))
    .join('');

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Current effective session branch ID
  const effectiveBranchId = activeBranchId || activeUser?.branchId || '';

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-6xl animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-white text-3xl font-semibold font-['Inter'] tracking-tight">
              User Profile & Identity
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-400">
              GET /users/me
            </span>
          </div>
          <p className="text-neutral-400 text-sm font-['Inter'] mt-1">
            Authoritative authenticated profile, active branch assignments, and granted capabilities returned directly from <code className="text-amber-400/90 text-xs">https://api.tavonza.com/users/me</code>.
          </p>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchProfile(false)}
            disabled={isLoadingProfile}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-stone-200 text-xs font-medium rounded-lg flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            title="Reload profile from /users/me"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoadingProfile ? 'animate-spin' : ''}`} />
            <span>{isLoadingProfile ? 'Refreshing...' : 'Refresh Profile'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRawJson(!showRawJson)}
            className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-stone-300 text-xs font-mono rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            title="Inspect live /users/me JSON payload"
          >
            <Code className="w-3.5 h-3.5 text-amber-400" />
            <span>{showRawJson ? 'Hide JSON' : 'View API JSON'}</span>
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-['Inter'] shadow-lg ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Raw JSON Inspector Drawer */}
      {showRawJson && (
        <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 border-b border-neutral-800/80 pb-2">
            <span className="flex items-center gap-2 text-amber-400 font-semibold">
              <Code className="w-4 h-4" />
              <span>LIVE PAYLOAD: GET https://api.tavonza.com/users/me</span>
            </span>
            <button
              type="button"
              onClick={() => handleCopy(JSON.stringify(rawApiResponse || activeUser, null, 2), 'raw-json')}
              className="text-neutral-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              {copiedKey === 'raw-json' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedKey === 'raw-json' ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="p-3 bg-black/80 rounded-lg text-emerald-400 text-xs font-mono overflow-x-auto max-h-80 border border-neutral-900 leading-relaxed">
            {JSON.stringify(rawApiResponse || activeUser, null, 2)}
          </pre>
        </div>
      )}

      {/* Hero Identity Overview Card */}
      {isLoadingProfile && !activeUser ? (
        <div className="p-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl animate-pulse flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-neutral-800 shrink-0" />
          <div className="space-y-3 flex-1">
            <div className="h-6 bg-neutral-800 rounded w-1/3" />
            <div className="h-4 bg-neutral-800 rounded w-1/2" />
            <div className="h-4 bg-neutral-800 rounded w-1/4" />
          </div>
        </div>
      ) : (
        <div className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900/60 border border-neutral-800 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with Status Pulse */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-amber-400 flex items-center justify-center text-neutral-950 font-bold text-2xl shadow-lg">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div
                className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-neutral-900 flex items-center justify-center ${
                  activeUser?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                title={`Status: ${activeUser?.status || 'ACTIVE'}`}
              >
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-white text-2xl font-bold font-['Poppins']">
                  {activeUser?.name || `${activeUser?.firstName || ''} ${activeUser?.lastName || ''}`.trim() || 'Authenticated User'}
                </h2>
                {activeUser?.role && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                    {activeUser.role}
                  </span>
                )}
                {activeUser?.globalRole && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-400/10 text-blue-400 border border-blue-400/30">
                    Global: {activeUser.globalRole}
                  </span>
                )}
                {activeUser?.status && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      activeUser.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/30'
                    }`}
                  >
                    {activeUser.status}
                  </span>
                )}
                {activeUser?.isEmailVerified && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>Email Verified</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-['Inter']">
                {activeUser?.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-stone-300">{activeUser.email}</span>
                  </span>
                )}
                {(activeUser?.contactNo || activeUser?.phone) && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-stone-300">{activeUser.contactNo || activeUser.phone}</span>
                  </span>
                )}
                {activeUser?.branchName && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-white font-medium">{activeUser.branchName}</span>
                  </span>
                )}
              </div>

              {/* User UUID Badge */}
              {activeUser?.id && (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[11px] font-mono text-neutral-500">USER ID:</span>
                  <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-stone-300 border border-neutral-800">
                    {activeUser.id}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeUser.id, 'user-id')}
                    className="p-1 text-neutral-400 hover:text-white transition cursor-pointer"
                    title="Copy User ID"
                  >
                    {copiedKey === 'user-id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps & Account Metadata Pill */}
          <div className="w-full md:w-auto p-3.5 bg-neutral-950/80 rounded-xl border border-neutral-800/80 text-xs space-y-2 font-['Inter'] self-stretch md:self-auto min-w-[240px]">
            <div className="flex items-center justify-between gap-3 text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>Created:</span>
              </span>
              <span className="text-stone-300 font-mono text-[11px]">{formatDate(activeUser?.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span>Last Updated:</span>
              </span>
              <span className="text-stone-300 font-mono text-[11px]">{formatDate(activeUser?.updatedAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-neutral-400 border-t border-neutral-900 pt-1.5">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-neutral-500" />
                <span>Customer Profile:</span>
              </span>
              <span className="text-stone-400 text-[11px]">
                {activeUser?.customer ? 'Linked' : 'None (Staff)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Personal Details & Password Change */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <form onSubmit={handleUpdateProfile} className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6 space-y-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-amber-400" />
                <h3 className="text-white text-base font-semibold font-['Poppins']">Personal Information & Avatar</h3>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">PATCH /users/me</span>
            </div>

            {/* Avatar Upload Block */}
            <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl flex items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-amber-400 flex items-center justify-center text-neutral-950 font-bold text-xl shadow-md">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                  title="Change Photo"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Photo</span>
                  </button>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="p-1.5 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                      title="Cancel Photo Selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500">
                  JPG, PNG or WEBP up to 5MB. Click Save Changes to commit to backend.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">First Name</label>
                <input
                  type="text"
                  disabled
                  value={firstName || activeUser?.firstName || ''}
                  placeholder="First name"
                  className="w-full h-10 px-3 bg-neutral-950/60 border border-neutral-800/60 text-neutral-400 text-sm rounded-lg cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">Last Name</label>
                <input
                  type="text"
                  disabled
                  value={lastName || activeUser?.lastName || ''}
                  placeholder="Last name"
                  className="w-full h-10 px-3 bg-neutral-950/60 border border-neutral-800/60 text-neutral-400 text-sm rounded-lg cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">Full Display Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-neutral-400 text-xs font-semibold uppercase">Email Address (Read-only)</label>
                {activeUser?.isEmailVerified && (
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <input
                type="email"
                disabled
                value={email || activeUser?.email || ''}
                className="w-full h-10 px-3 bg-neutral-950/60 border border-neutral-800/60 text-neutral-400 text-sm rounded-lg cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">Phone / Contact Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full h-10 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
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

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="text-white text-base font-semibold font-['Poppins']">Security & Password</h3>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">POST /auth/change-password</span>
            </div>

            <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-lg text-xs text-neutral-400 font-['Inter'] leading-5">
              To update your account password, enter your existing password followed by your new password (minimum 8 characters).
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">Current Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-3 pr-10 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute right-3 text-neutral-400 hover:text-white transition-colors"
                    title={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">New Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-3 pr-10 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 text-neutral-400 hover:text-white transition-colors"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">Confirm New Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-3 pr-10 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 text-neutral-400 hover:text-white transition-colors"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800">
            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full h-10 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>{isChangingPass ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Staff Assignments & Branch Capabilities Section */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-white text-lg font-semibold font-['Poppins']">
                Branch Assignments & Permissions ({activeUser?.assignments?.length || 0})
              </h3>
              <p className="text-neutral-400 text-xs font-['Inter'] mt-0.5">
                Assigned restaurant branches, roles, and capability permissions returned in <code className="text-amber-400/90 text-[11px]">assignments[]</code> from `/users/me`.
              </p>
            </div>
          </div>

          {activeUser?.branchName && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-neutral-950 text-amber-400 border border-amber-400/30">
                Primary: {activeUser.branchName}
              </span>
            </div>
          )}
        </div>

        {/* Assignments Cards List */}
        <div className="grid grid-cols-1 gap-4">
          {(!activeUser?.assignments || activeUser.assignments.length === 0) ? (
            <div className="p-8 text-center bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-500 text-sm">
              No branch assignments returned for this account.
            </div>
          ) : (
            activeUser.assignments.map((assignment: UserAssignment, idx: number) => {
              const isCurrentSession = assignment.branchId === effectiveBranchId;
              const hasPermissions = Array.isArray(assignment.permissions) && assignment.permissions.length > 0;

              return (
                <div
                  key={assignment.id || idx}
                  className={`p-5 rounded-xl border transition flex flex-col gap-4 ${
                    isCurrentSession
                      ? 'bg-neutral-950/90 border-amber-400/60 shadow-md ring-1 ring-amber-400/20'
                      : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  {/* Assignment Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-white font-semibold text-base font-['Poppins']">
                          {assignment.branchName || `Branch ${assignment.branchId}`}
                        </span>
                        {isCurrentSession && (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-black tracking-wide">
                            ACTIVE SESSION BRANCH
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            assignment.isActive !== false
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {assignment.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-900 text-neutral-300 border border-neutral-700">
                          Role: <strong className="text-amber-400">{assignment.role}</strong>
                        </span>
                      </div>

                      {/* Identifiers Row with copy buttons */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-400 font-mono pt-1">
                        {assignment.branchId && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-neutral-500">Branch ID:</span>
                            <span className="text-stone-300">{assignment.branchId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(assignment.branchId!, `b-${idx}`)}
                              className="p-0.5 text-neutral-500 hover:text-white transition cursor-pointer"
                              title="Copy Branch ID"
                            >
                              {copiedKey === `b-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        )}

                        {assignment.staffId && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-neutral-500">Staff ID:</span>
                            <span className="text-stone-400">{assignment.staffId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(assignment.staffId!, `s-${idx}`)}
                              className="p-0.5 text-neutral-500 hover:text-white transition cursor-pointer"
                              title="Copy Staff ID"
                            >
                              {copiedKey === `s-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        )}

                        {assignment.id && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-neutral-500">Assignment ID:</span>
                            <span className="text-stone-400">{assignment.id}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(assignment.id!, `a-${idx}`)}
                              className="p-0.5 text-neutral-500 hover:text-white transition cursor-pointer"
                              title="Copy Assignment ID"
                            >
                              {copiedKey === `a-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Switch Session Branch Button */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {!isCurrentSession && assignment.branchId && (
                        <button
                          type="button"
                          onClick={() => handleSwitchBranch(assignment.branchId!, assignment.branchName)}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-400/50 text-stone-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                          title="Switch active branch session to this location"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                          <span>Switch Session</span>
                        </button>
                      )}
                      <span className="text-xs text-neutral-500 font-mono">#{idx + 1}</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-neutral-800/60" />

                  {/* Permissions Chips */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
                      <span>Granted Capabilities ({assignment.permissions?.length || 0}):</span>
                    </div>

                    {hasPermissions ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {assignment.permissions!.map((perm) => (
                          <span
                            key={perm}
                            className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-neutral-900 border border-neutral-700/80 text-amber-300/90 shadow-sm flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3 h-3 text-amber-400" />
                            <span>{perm}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-neutral-900/40 rounded-lg border border-neutral-800/60 text-xs text-neutral-500 italic">
                        No specific branch permissions assigned for this location.
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
