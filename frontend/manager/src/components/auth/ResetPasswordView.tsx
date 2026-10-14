'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, Check, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { resetPasswordThunk } from '../../redux/features/authApi';
import { getCookie } from '../../redux/api/baseApi';

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
      setError('Please provide your work email address.');
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
      toast.success('Password reset successfully! Please sign in with your new password.');

      setTimeout(() => {
        onComplete();
      }, 1000);
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
    <div className="w-full max-w-md mx-auto p-8 bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-2xl backdrop-blur-xl font-['Inter'] text-white">
      {/* Top back button */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-neutral-400 text-xs font-['Poppins'] hover:text-yellow-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950 font-bold text-2xl shadow-lg shadow-amber-500/20">
          <Lock className="w-7 h-7 text-neutral-950" />
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-['Poppins'] tracking-tight">
            Create New Password
          </h1>
          <p className="text-neutral-400 text-xs font-['Inter'] leading-relaxed max-w-xs">
            Set a new secure password for your Branch Manager account
          </p>
        </div>
      </div>

      {/* Error Callout */}
      {error && (
        <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Notification */}
      {isSuccess && (
        <div className="mb-6 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Password updated successfully! Redirecting to login...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email Field (editable if not passed) */}
        {!email && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300">Manager Work Email</label>
            <input
              type="email"
              required
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="manager@tavonza.ai"
              className="w-full h-11 px-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400/60 transition"
            />
          </div>
        )}

        {/* 5-Digit Code (editable if not passed) */}
        {(!otp || code.length < 5) && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300">5-Digit Verification Code</label>
            <input
              type="text"
              maxLength={5}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="48291"
              className="w-full h-11 px-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono tracking-widest text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400/60 transition font-bold"
            />
          </div>
        )}

        {/* New Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-300">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 pl-3.5 pr-10 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400/60 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password Strength Checklist */}
        <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-3 flex flex-col gap-2">
          <span className="text-[11px] font-medium text-neutral-400">Password Requirements:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex items-center gap-1.5 text-[11px]">
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                  hasMinLength ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-600'
                }`}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className={hasMinLength ? 'text-emerald-400' : 'text-neutral-500'}>8+ Characters</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                  hasUpperCase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-600'
                }`}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className={hasUpperCase ? 'text-emerald-400' : 'text-neutral-500'}>1+ Uppercase</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                  hasNumber ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-600'
                }`}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className={hasNumber ? 'text-emerald-400' : 'text-neutral-500'}>1+ Number</span>
            </div>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-300">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 pl-3.5 pr-10 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400/60 transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <span className="text-[11px] text-red-400 mt-0.5">Passwords do not match</span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isSuccess || !isPasswordValid || !passwordsMatch}
          className="w-full h-11 mt-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-yellow-400/10 active:scale-98 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
              <span>Resetting Password...</span>
            </>
          ) : (
            <span>Update Password</span>
          )}
        </button>
      </form>
    </div>
  );
}
