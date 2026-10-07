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
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { getMe, changePasswordThunk } from '../../../redux/features/authApi';
import { updateMe } from '../../../redux/features/userApi';

export default function ProfileView() {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);

  const [fullName, setFullName] = useState(reduxUser?.name || reduxUser?.firstName || '');
  const [email, setEmail] = useState(reduxUser?.email || '');
  const [phone, setPhone] = useState(reduxUser?.contactNo || reduxUser?.phone || '');
  const [role, setRole] = useState(reduxUser?.role ? reduxUser.role.replace(/_/g, ' ') : 'Branch Manager');
  const [branch, setBranch] = useState(reduxUser?.branchName || 'Main Branch');

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (reduxUser) {
      setFullName(reduxUser.name || reduxUser.firstName || '');
      setEmail(reduxUser.email || '');
      setPhone(reduxUser.contactNo || reduxUser.phone || '');
      if (reduxUser.role) setRole(reduxUser.role.replace(/_/g, ' '));
      if (reduxUser.branchName) setBranch(reduxUser.branchName);
      if (reduxUser.avatar && !avatarPreview) {
        setAvatarPreview(reduxUser.avatar);
      }
    }
  }, [reduxUser]);

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
    setAvatarPreview(reduxUser?.avatar || null);
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
        dispatch(getMe());
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
    if (newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters', type: 'error' });
      return;
    }
    setIsChangingPass(true);
    setMessage(null);
    try {
      const res = await dispatch(changePasswordThunk({ oldPassword: currentPassword, newPassword }));
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

  const initials = (fullName || 'Manager')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => (w[0] ? w[0].toUpperCase() : ''))
    .join('');

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-5xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-white text-3xl font-semibold font-['Inter'] tracking-tight">
            Manager Profile & Security
          </h1>
          <p className="text-neutral-400 text-sm font-['Inter'] mt-0.5">
            Manage your manager credentials, avatar photo, personal details, and account password
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Role: {role}</span>
        </div>
      </div>

      {/* Alert banner */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-['Inter'] ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <form onSubmit={handleUpdateProfile} className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6 space-y-5 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="text-white text-base font-semibold font-['Poppins']">Personal Information & Avatar</h3>
          </div>

          {/* Avatar Upload Block */}
          <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl flex items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-amber-400 flex items-center justify-center text-neutral-950 font-bold text-xl shadow-md">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Manager Avatar" className="w-full h-full object-cover" />
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
                JPG, PNG or WEBP up to 5MB. Click Save Changes below to upload.
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

          <div className="space-y-3.5">
            <div>
              <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full h-10 px-3 bg-neutral-950/60 border border-neutral-800/60 text-neutral-500 text-sm rounded-lg cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">Phone / Contact Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">Assigned Branch</label>
              <input
                type="text"
                disabled
                value={branch}
                className="w-full h-10 px-3 bg-neutral-950/60 border border-neutral-800/60 text-neutral-400 text-sm rounded-lg cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full h-10 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading & Saving...</span>
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
        <form onSubmit={handleChangePassword} className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
            <Lock className="w-5 h-5 text-amber-400" />
            <h3 className="text-white text-base font-semibold font-['Poppins']">Change Password</h3>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs font-semibold uppercase mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full h-10 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>{isChangingPass ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
