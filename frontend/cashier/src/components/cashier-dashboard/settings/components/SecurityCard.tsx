'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch } from '@/redux/store';
import { changePassword } from '@/redux/features/authApi';

export const SecurityCard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await dispatch(
        changePassword({
          currentPassword,
          newPassword,
        })
      );
      setIsUpdating(false);

      if (changePassword.fulfilled.match(res)) {
        toast.success((res.payload as string) || 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error((res.payload as string) || 'Failed to update password. Check your current password.');
      }
    } catch (err: any) {
      setIsUpdating(false);
      toast.error(err?.message || 'Failed to update password');
    }
  };

  return (
    <div className="p-5 bg-white/10 rounded-[10px] border border-white/5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
        <div className="w-8 h-8 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-center justify-center text-yellow-500 shrink-0">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-5">
            Security &amp; Password
          </h2>
          <p className="text-slate-400 text-xs font-['Plus_Jakarta_Sans']">
            Change your account password directly via authenticated API
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Current Password */}
        <div className="space-y-1">
          <label className="block text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
            Current Password *
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 px-3 pr-10 bg-white/5 rounded-lg border border-white/5 text-slate-200 text-sm font-normal font-['Plus_Jakarta_Sans'] focus:outline-yellow-500/50 focus:border-yellow-500/30 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1">
          <label className="block text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
            New Password *
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="w-full h-10 px-3 pr-10 bg-white/5 rounded-lg border border-white/5 text-slate-200 text-sm font-normal font-['Plus_Jakarta_Sans'] focus:outline-yellow-500/50 focus:border-yellow-500/30 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="block text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
            Confirm New Password *
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full h-10 px-3 pr-10 bg-white/5 rounded-lg border border-white/5 text-slate-200 text-sm font-normal font-['Plus_Jakarta_Sans'] focus:outline-yellow-500/50 focus:border-yellow-500/30 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full h-10 px-4 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg text-yellow-400 hover:text-yellow-300 font-semibold text-sm font-['Plus_Jakarta_Sans'] flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
