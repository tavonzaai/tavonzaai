'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
    }
  }, [reduxUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setMessage({ text: 'Full Name is required', type: 'error' });
      return;
    }
    setIsSavingProfile(true);
    setMessage(null);
    try {
      const res = await dispatch(updateMe({ name: fullName.trim(), contactNo: phone.trim() }));
      setIsSavingProfile(false);
      if (updateMe.fulfilled.match(res)) {
        setMessage({ text: 'Manager profile updated successfully!', type: 'success' });
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

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-5xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-white text-3xl font-semibold font-['Inter'] tracking-tight">
            Manager Profile & Security
          </h1>
          <p className="text-neutral-400 text-sm font-['Inter'] mt-0.5">
            Manage your manager credentials, personal details, and account password
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
        <form onSubmit={handleUpdateProfile} className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <User className="w-5 h-5 text-amber-400" />
              <h3 className="text-white text-base font-semibold font-['Poppins']">Personal Information</h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2.5 py-0.5 rounded-full border font-medium ${
                reduxUser?.isEmailVerified ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                Email {reduxUser?.isEmailVerified ? 'Verified ✓' : 'Unverified'}
              </span>
            </div>
          </div>

          {/* Account Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 bg-neutral-950/80 rounded-lg border border-neutral-800 text-xs">
            <div>
              <span className="text-neutral-500 text-[10px] uppercase font-semibold block">User ID</span>
              <span className="text-neutral-300 font-mono text-[11px] truncate block">{reduxUser?.id || 'N/A'}</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] uppercase font-semibold block">Organization ID</span>
              <span className="text-neutral-300 font-mono text-[11px] truncate block">{reduxUser?.organizationId || 'N/A'}</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] uppercase font-semibold block">Capabilities</span>
              <span className="text-amber-400 font-medium text-[11px]">{reduxUser?.permissions ? `${reduxUser.permissions.length} Permissions` : 'Full Manager'}</span>
            </div>
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
              <Save className="w-4 h-4" />
              <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
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
              className="w-full h-10 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-semibold text-sm border border-amber-400/30 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isChangingPass ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
