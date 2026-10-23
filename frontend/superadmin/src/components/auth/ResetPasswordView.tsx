'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, Check, Lock, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { resetPasswordThunk } from '@/redux/features/authApi';
import { getCookie } from '@/redux/api/baseApi';

interface ResetPasswordViewProps {
  email?: string;
  otp?: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function ResetPasswordView({
  email = '',
  otp = '',
  onComplete,
  onBack,
}: ResetPasswordViewProps) {
  const dispatch = useAppDispatch();
  const reduxState = useAppSelector((state) => state.auth);

  const [targetEmail, setTargetEmail] = useState(
    email || reduxState.pendingEmail || reduxState.forgotEmail || ''
  );
  const [code, setCode] = useState(otp || reduxState.otpCode || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetEmail && typeof window !== 'undefined') {
      const savedEmail = getCookie('tavonza_signup_email');
      if (savedEmail) setTargetEmail(savedEmail);
    }
  }, [targetEmail]);

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = targetEmail.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanEmail) {
      setError('Please provide your administrator email address.');
      return;
    }

    if (!cleanCode || cleanCode.length < 5) {
      setError('Please enter the 5-digit verification code.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must be at least 8 characters, contain at least 1 uppercase letter, and 1 number.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        resetPasswordThunk({
          email: cleanEmail,
          code: cleanCode,
          newPassword: password,
        })
      ).unwrap();

      setIsSuccess(true);
      setIsSubmitting(false);
      toast.success('Security key reset successfully! Please sign in with your new credentials.');

      setTimeout(() => {
        onComplete();
      }, 900);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'Password reset failed. Please verify your OTP code and try again.'
      );
    }
  };

  return (
    <div className="w-full max-w-md bg-neutral-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 animate-fade-in font-inter text-white">
      {/* Top back button */}
      <div className="w-full flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-400 text-xs hover:text-yellow-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Emblem & Branding */}
      <div className="flex flex-col items-center text-center pb-6">
        <div className="size-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[2px] shadow-xl shadow-amber-500/20 mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
            <Lock className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Create New Security Key</h1>
        <span className="text-[11px] font-semibold text-yellow-400 uppercase tracking-widest mt-0.5">
          Super Admin Console
        </span>
        <p className="text-xs text-zinc-400 pt-2 leading-relaxed max-w-xs">
          Set a new strong password for your platform-wide administrator account
        </p>
      </div>

      {/* Error Callout */}
      {error && (
        <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Notification */}
      {isSuccess && (
        <div className="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Credentials updated successfully! Redirecting to login...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field (editable if not passed) */}
        {!email && (
          <div>
            <label className="block text-xs font-medium text-zinc-300 pb-1.5">
              Super Admin Email
            </label>
            <input
              type="email"
              required
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="superadmin@tavonza.ai"
              className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400/80 transition"
            />
          </div>
        )}

        {/* 5-Digit Code (editable if not passed) */}
        {(!otp || code.length < 5) && (
          <div>
            <label className="block text-xs font-medium text-zinc-300 pb-1.5">
              5-Digit Verification Code
            </label>
            <input
              type="text"
              maxLength={5}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="48291"
              className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono tracking-widest text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400/80 transition font-bold"
            />
          </div>
        )}

        {/* New Password */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 pb-1.5">
            New Password / Security Key
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-3 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400/80 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password Strength Checklist */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2">
          <span className="text-[11px] font-medium text-zinc-400">Security Key Requirements:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex items-center gap-1.5 text-[11px]">
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                  hasMinLength ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600'
                }`}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className={hasMinLength ? 'text-emerald-400' : 'text-zinc-500'}>8+ Characters</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                  hasUpperCase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600'
                }`}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className={hasUpperCase ? 'text-emerald-400' : 'text-zinc-500'}>1+ Uppercase</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                  hasNumber ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600'
                }`}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className={hasNumber ? 'text-emerald-400' : 'text-zinc-500'}>1+ Number</span>
            </div>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 pb-1.5">
            Confirm Security Key
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-3 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400/80 transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <span className="text-[11px] text-red-400 mt-1 block">Passwords do not match</span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isSuccess || !isPasswordValid || !passwordsMatch}
          className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2 shadow-lg shadow-yellow-500/10 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Credentials...</span>
            </>
          ) : (
            <span>Update Security Key</span>
          )}
        </button>
      </form>
    </div>
  );
}
