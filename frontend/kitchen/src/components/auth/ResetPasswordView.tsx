'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, Check } from 'lucide-react';
import { TavonzaLogo } from '../TavonzaLogo';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { resetPasswordThunk } from '@/redux/features/authApi';
import { getCookie } from '@/redux/api/baseApi';
import { toast } from 'sonner';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetEmail && typeof window !== 'undefined') {
      const savedEmail = getCookie('kitchen_reset_email') || getCookie('kitchen_signup_email');
      if (savedEmail) setTargetEmail(savedEmail);
    }
  }, [targetEmail]);

  // Realtime password checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = targetEmail.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanEmail) {
      setError('Please provide your kitchen staff email address.');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
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

      setIsSubmitting(false);
      toast.success('Password updated successfully! Please log in with your new credentials.');
      onComplete();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(typeof err === 'string' ? err : err?.message || 'Password reset failed. Please verify your OTP code.');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-between min-h-[640px] lg:min-h-[680px] p-4 text-white relative font-sans">
      {/* Back Button */}
      <div className="w-full flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-white text-xs font-['Inter'] hover:text-yellow-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Brand Header */}
      <div className="flex flex-col items-center gap-3">
        <TavonzaLogo size="lg" />
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 my-auto">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h2 className="text-xl font-bold text-white font-['Inter']">Create New Password</h2>
          <p className="text-xs text-white/60 font-['Inter'] leading-relaxed">
            Set a new secure password for{' '}
            <span className="text-yellow-400 font-semibold">{targetEmail || 'your kitchen account'}</span>.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter'] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* OTP Code if not already set */}
        {!otp && !reduxState.otpCode && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/90 font-['Inter'] font-medium">5-Digit Verification Code</label>
            <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center transition">
              <input
                type="text"
                maxLength={5}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="12345"
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-['Inter'] focus:outline-none tracking-widest font-mono"
              />
            </div>
          </div>
        )}

        {/* New Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/90 font-['Inter'] font-medium">New Password</label>
          <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center justify-between gap-2.5 transition">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-['Inter'] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/60 hover:text-white p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password Strength Checklist */}
        <div className="flex flex-col gap-1.5 p-3 bg-neutral-900/60 rounded-xl border border-white/5 text-[11px] font-['Inter']">
          <div className={`flex items-center gap-2 ${hasMinLength ? 'text-amber-400' : 'text-zinc-500'}`}>
            <Check className="w-3.5 h-3.5" />
            <span>At least 8 characters</span>
          </div>
          <div className={`flex items-center gap-2 ${hasUpperCase ? 'text-amber-400' : 'text-zinc-500'}`}>
            <Check className="w-3.5 h-3.5" />
            <span>At least 1 uppercase letter (A-Z)</span>
          </div>
          <div className={`flex items-center gap-2 ${hasNumber ? 'text-amber-400' : 'text-zinc-500'}`}>
            <Check className="w-3.5 h-3.5" />
            <span>At least 1 number (0-9)</span>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/90 font-['Inter'] font-medium">Confirm New Password</label>
          <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center justify-between gap-2.5 transition">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-['Inter'] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-white/60 hover:text-white p-1 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isPasswordValid || password !== confirmPassword || isSubmitting}
          className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold font-['Inter'] rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/10 active:scale-[0.99] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Updating Password…' : 'Reset Password'}
        </button>
      </form>

      {/* Footer Notice */}
      <div className="pt-4 pb-1 text-center">
        <span className="text-slate-400 text-xs font-['Inter']">
          Kitchen Display Terminal &bull; Tavonza AI Station Security
        </span>
      </div>
    </div>
  );
}
