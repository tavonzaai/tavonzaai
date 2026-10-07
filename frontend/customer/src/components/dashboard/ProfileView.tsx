'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Shield,
  LogOut,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { logoutUser, changePassword, getMe } from '@/redux/features/authApi';
import { updateMe } from '@/redux/features/userApi';
import { clearAuthError } from '@/redux/slices/authSlice';

export default function ProfileView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Profile state from API
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFullName(user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim());
      setEmail(user.email || '');
      setPhone(user.contactNo || user.phone || '');
      const u = user as any;
      setAvatarPreview(u.avatarUrl || u.avatar || null);
    }
  }, [user]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await dispatch(
        updateMe({
          name: fullName.trim(),
          contactNo: phone.trim(),
          avatar: avatarFile || avatarPreview || undefined,
        })
      );
      setIsUpdatingProfile(false);
      if (updateMe.fulfilled.match(res)) {
        dispatch(getMe());
        setSavedSuccessMsg(
          avatarFile
            ? 'Profile picture & account details updated successfully!'
            : 'Profile details updated successfully!'
        );
        setAvatarFile(null);
        setTimeout(() => setSavedSuccessMsg(null), 3500);
      } else {
        alert((res.payload as string) || 'Failed to update profile');
      }
    } catch (err: any) {
      setIsUpdatingProfile(false);
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    dispatch(clearAuthError());
    const res = await dispatch(
      changePassword({ oldPassword: currentPassword, newPassword })
    );
    setIsChangingPassword(false);
    if (changePassword.fulfilled.match(res)) {
      setSavedSuccessMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSavedSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto min-h-screen bg-black text-white flex flex-col justify-between relative overflow-x-hidden font-sans pb-24 pt-2">
      <div className="flex flex-col gap-5 px-5 pt-3">
        {/* Header Banner with Back Button */}
        <div className="flex items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white hover:text-yellow-400 hover:border-yellow-400/50 transition cursor-pointer shrink-0 active:scale-95"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4 text-white hover:text-yellow-400 transition" />
            </button>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-xl font-semibold text-white font-['Inter']">User Profile</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-['Inter']">
                Live Profile Information
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-xl text-xs font-medium text-red-300 flex items-center gap-1.5 transition shrink-0 cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter']">
            {error}
          </div>
        )}

        {savedSuccessMsg && (
          <div className="p-3 bg-yellow-400/20 border border-yellow-400/40 rounded-xl text-xs text-yellow-300 flex items-center gap-2 animate-in fade-in duration-300">
            <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        {/* Dynamic API User Profile Card */}
        <div className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-3.5">
              {/* Profile Avatar Image / Initials + Camera Upload Trigger */}
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 text-lg font-bold overflow-hidden shadow-md">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name ? user.name.slice(0, 2).toUpperCase() : (fullName.slice(0, 2).toUpperCase() || 'CU')}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-yellow-400 hover:bg-yellow-300 text-black rounded-full shadow-lg transition cursor-pointer active:scale-95"
                  title="Change profile picture"
                >
                  <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-white font-['Inter']">
                    {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Customer Account'}
                  </h3>
                  {user?.role && (
                    <span className="px-2.5 py-0.5 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                      {user.role}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-['Inter']">
                  User ID: <span className="font-mono text-zinc-300">{user?.id || 'N/A'}</span>
                </p>
                {avatarFile && (
                  <span className="text-[11px] text-yellow-400 font-medium animate-pulse">
                    New photo selected ({avatarFile.name})
                  </span>
                )}
              </div>
            </div>

            {/* Verification Badges */}
            <div className="flex items-center gap-2 flex-wrap text-[11px]">
              <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-medium ${
                user?.isEmailVerified ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                <Shield className="w-3 h-3" />
                <span>Email {user?.isEmailVerified ? 'Verified ✓' : 'Unverified'}</span>
              </div>
              {user?.isPhoneVerified !== undefined && (
                <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-medium ${
                  user?.isPhoneVerified ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}>
                  <Shield className="w-3 h-3" />
                  <span>Phone {user?.isPhoneVerified ? 'Verified ✓' : 'Unverified'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Backend API Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 bg-black/60 rounded-xl border border-neutral-800 text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Role</span>
              <span className="text-amber-300 font-medium">{user?.role || 'CUSTOMER'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Organization</span>
              <span className="text-zinc-300 font-mono truncate block">{user?.organizationId || 'System Default'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Joined Date</span>
              <span className="text-zinc-300 font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Permissions</span>
              <span className="text-emerald-400 font-medium">
                {user?.permissions ? `${user.permissions.length} Granted` : 'Standard User'}
              </span>
            </div>
          </div>

          {/* Dynamic Profile Edit Form */}
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400 font-['Inter']">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white font-['Inter'] focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400 font-['Inter']">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full h-10 px-3 bg-neutral-950/60 border border-neutral-800 rounded-xl text-sm text-zinc-400 font-['Inter'] cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs text-zinc-400 font-['Inter']">Phone / Contact Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter contact number"
                  className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white font-['Inter'] focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-yellow-500/10 cursor-pointer disabled:opacity-50"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile & Picture...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <form onSubmit={handleChangePassword} className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex flex-col gap-0.5 border-b border-neutral-800 pb-3">
            <h3 className="text-base font-semibold text-white font-['Inter']">Change Password</h3>
            <p className="text-xs text-zinc-400 font-['Inter']">
              Update security credentials for {user?.email || 'your account'}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 font-['Inter']">Current Password *</label>
              <div className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-transparent text-sm text-white font-['Inter'] focus:outline-none w-full pr-2"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-zinc-400 hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400 font-['Inter']">New Password *</label>
                <div className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-transparent text-sm text-white font-['Inter'] focus:outline-none w-full pr-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-zinc-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400 font-['Inter']">Confirm Password *</label>
                <div className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-transparent text-sm text-white font-['Inter'] focus:outline-none w-full pr-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-zinc-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full h-11 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
