'use client';

import React, { useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle, Mail, Shield, CheckCircle2 } from 'lucide-react';
import { useAppDispatch } from '@/redux/store';
import { forgotPasswordThunk } from '@/redux/features/authApi';
import { setCookie } from '@/redux/api/baseApi';
import { setPendingEmail, setForgotEmail } from '@/redux/slices/authSlice';

interface ForgotPasswordViewProps {
  onRequestCode: (email: string) => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordView({
  onRequestCode,
  onBackToLogin,
}: ForgotPasswordViewProps) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid administrator email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(forgotPasswordThunk({ email: cleanEmail })).unwrap();

      setCookie('tavonza_signup_email', cleanEmail);
      dispatch(setPendingEmail(cleanEmail));
      dispatch(setForgotEmail(cleanEmail));
      setIsSuccess(true);
      setIsSubmitting(false);

      setTimeout(() => {
        onRequestCode(cleanEmail);
      }, 500);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to dispatch password reset code. Please try again.'
      );
    }
  };

  return (
    <div className="w-full max-w-md bg-neutral-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 animate-fade-in font-inter text-white">
      {/* Top back button */}
      <div className="w-full flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center gap-1.5 text-zinc-400 text-xs hover:text-yellow-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>
      </div>

      {/* Emblem & Branding */}
      <div className="flex flex-col items-center text-center pb-6">
        <div className="size-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[2px] shadow-xl shadow-amber-500/20 mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
            <Shield className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">TablePilot</h1>
        <span className="text-[11px] font-semibold text-yellow-400 uppercase tracking-widest mt-0.5">
          Super Admin Console
        </span>
        <p className="text-xs text-zinc-400 pt-2 leading-relaxed max-w-xs">
          Enter your administrator email to receive a 5-digit verification code to reset your security credentials.
        </p>
      </div>

      {/* Error Callout */}
      {error && (
        <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Callout */}
      {isSuccess && (
        <div className="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Verification code generated. Directing to verification...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300 pb-1.5">
            Super Admin Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.morgan@tablepilot.io"
              className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400/80 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2 shadow-lg shadow-yellow-500/10 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Verification Code...</span>
            </>
          ) : (
            <span>Send Verification Code</span>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
        <span>Remember your credentials? </span>
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-yellow-400 hover:text-yellow-300 font-medium cursor-pointer transition ml-1"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
