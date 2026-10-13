'use client';

import React, { useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { TavonzaLogo } from '../TavonzaLogo';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(forgotPasswordThunk({ email: cleanEmail })).unwrap();

      setCookie('tavonza_signup_email', cleanEmail);
      dispatch(setPendingEmail(cleanEmail));
      dispatch(setForgotEmail(cleanEmail));
      setIsSubmitting(false);
      onRequestCode(cleanEmail);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(typeof err === 'string' ? err : err?.message || 'Failed to request password reset code.');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-between min-h-[640px] lg:min-h-[680px] p-4 text-white relative font-sans">
      <div className="w-full flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center gap-1.5 text-white text-xs font-['Poppins'] hover:text-yellow-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Log In</span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-3">
        <TavonzaLogo size="lg" />
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 my-auto">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h2 className="text-xl font-bold text-white font-['Inter']">Forgot Password</h2>
          <p className="text-xs text-white/60 font-['Inter'] leading-relaxed">
            Enter the email address associated with your cashier account. We will send you a 5-digit verification code to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter'] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/90 font-['Inter'] font-medium">Email Address</label>
          <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center transition">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cashier@example.com"
              className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-['Inter'] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold font-['Inter'] rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/10 active:scale-[0.99] mt-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Sending Code…' : 'Send Verification Code'}
        </button>
      </form>

      <div className="pt-4 pb-2 text-center">
        <span className="text-stone-400 text-xs font-['Inter']">Remember your password? </span>
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-yellow-400 text-xs font-['Inter'] font-semibold underline hover:text-yellow-300 transition cursor-pointer ml-1"
        >
          Log In
        </button>
      </div>
    </div>
  );
}
