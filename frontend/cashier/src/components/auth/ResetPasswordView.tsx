'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, Check } from 'lucide-react';
import { TavonzaLogo } from '../TavonzaLogo';
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

  const [targetEmail, setTargetEmail] = useState(email || reduxState.pendingEmail || reduxState.forgotEmail || '');
  const [code, setCode] = useState(otp || reduxState.otpCode || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = targetEmail.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanEmail) {
      setError('Please provide your email address.');
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
      onComplete();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(typeof err === 'string' ? err : err?.message || 'Password reset failed. Please verify your OTP code.');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-between min-h-[640px] lg:min-h-[680px] p-4 text-white relative font-sans">
      <div className="w-full flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-white text-xs font-['Poppins'] hover:text-yellow-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-3">
        <TavonzaLogo size="lg" />
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 my-auto">
        <div className="flex flex-col gap-1.5 text-center sm:text-left">
          <h2 className="text-xl font-bold text-white font-['Inter']">Create New Password</h2>
          <p className="text-xs text-white/60 font-['Poppins'] leading-relaxed">
            Choose a new password for your cashier account
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter'] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {!email && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/90 font-['Inter'] font-medium">Email Address</label>
            <div className="w-full h-11 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center transition">
              <input
                type="email"
                required
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="cashier@example.com"
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-['Inter'] focus:outline-none"
              />
            </div>
          </div>
        )}

        {(!otp || code.length < 5) && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/90 font-['Inter'] font-medium">5-Digit Verification Code</label>
            <div className="w-full h-11 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center transition">
              <input
                type="text"
                maxLength={5}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="48291"
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-['Inter'] tracking-widest font-semibold focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/90 font-['Inter'] font-medium">New Password</label>
          <div className="w-full h-11 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center justify-between transition">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
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

          {password.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[11px] font-['Inter']">
              <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <Check className={`w-3 h-3 ${hasMinLength ? 'stroke-[3]' : 'opacity-40'}`} />
                8+ chars
              </span>
              <span className={`flex items-center gap-1 ${hasUpperCase ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <Check className={`w-3 h-3 ${hasUpperCase ? 'stroke-[3]' : 'opacity-40'}`} />
                1 uppercase
              </span>
              <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <Check className={`w-3 h-3 ${hasNumber ? 'stroke-[3]' : 'opacity-40'}`} />
                1 number
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/90 font-['Inter'] font-medium">Confirm New Password</label>
          <div className="w-full h-11 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center justify-between transition">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
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
          disabled={isSubmitting}
          className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold font-['Inter'] rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/10 active:scale-[0.99] mt-3 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Updating Password…' : 'Reset Password'}
        </button>
      </form>

      <div className="pt-4 pb-2 text-center text-xs text-stone-500 font-['Inter']">
        Remember your password?{' '}
        <button
          type="button"
          onClick={onBack}
          className="text-yellow-400 hover:underline font-semibold ml-1 cursor-pointer"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
