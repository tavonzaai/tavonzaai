'use client';

import React, { useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle, Mail, CheckCircle2 } from 'lucide-react';
import { useAppDispatch } from '../../redux/hooks';
import { forgotPasswordThunk } from '../../redux/features/authApi';
import { setCookie } from '../../redux/api/baseApi';
import { setPendingEmail, setForgotEmail } from '../../redux/slices/authSlice';

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
      setError('Please enter a valid work email address.');
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
      }, 600);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to request password reset code. Please check the email and try again.'
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-2xl backdrop-blur-xl font-['Inter'] text-white">
      {/* Top back button */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center gap-1.5 text-neutral-400 text-xs font-['Poppins'] hover:text-yellow-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>
      </div>

      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950 font-bold text-2xl shadow-lg shadow-amber-500/20">
          T
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-['Poppins'] tracking-tight">
            Forgot Password
          </h1>
          <p className="text-neutral-400 text-xs font-['Inter'] leading-relaxed max-w-xs">
            Enter the work email associated with your Branch Manager account. We will send you a 5-digit verification code.
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
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <span>Reset code generated! Redirecting to verification...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-300">Manager Work Email</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@tavonza.ai"
              className="w-full h-11 pl-10 pr-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400/60 transition"
            />
            <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="w-full h-11 mt-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-yellow-400/10 active:scale-98 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
              <span>Sending Reset Code...</span>
            </>
          ) : (
            <span>Send Verification Code</span>
          )}
        </button>
      </form>

      {/* Return to login footer */}
      <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400">
        <span>Remember your password?</span>
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-yellow-400 hover:text-yellow-300 font-medium cursor-pointer transition"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
