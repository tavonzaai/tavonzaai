'use client';

import React, { useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { TavonzaLogo } from '../TavonzaLogo';
import { forgotPasswordAction } from '@/app/actions/auth';

interface ForgotPasswordViewProps {
  onRequestCode: (email: string) => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordView({
  onRequestCode,
  onBackToLogin,
}: ForgotPasswordViewProps) {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // The API only accepts an email here — the copy says "email or phone", but
    // there is no SMS provider to deliver a code to.
    if (!emailOrPhone.includes('@')) {
      setError('Enter the email address on your account — codes are sent by email.');
      return;
    }

    setIsSubmitting(true);
    const result = await forgotPasswordAction(emailOrPhone);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    onRequestCode(emailOrPhone.trim());
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-between min-h-[760px] p-4 text-white relative font-sans">
      {/* Back Button & Header */}
      <div className="w-full flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center gap-1 text-white text-xs font-['Poppins'] hover:text-yellow-400 transition cursor-pointer"
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
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 my-auto">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter']">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-white font-['Inter']">Forgot password</h2>
          <p className="text-xs text-white/60 font-['Inter'] leading-relaxed">
            Enter your email address and we will send a verification OTP code to reset your password.
          </p>
        </div>

        <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center">
          <input
            type="email"
            required
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="info@gmail.com"
            className="w-full bg-transparent text-xs text-white/90 placeholder:text-white/40 font-['Inter'] focus:outline-none"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs text-rose-300 leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-medium font-['Inter'] rounded-[100px] flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/10 active:scale-[0.99] mt-4 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Sending…' : 'Request code'}
        </button>
      </form>

      {/* Footer Back link */}
      <div className="pb-6 text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
        >
          Remembered password?{' '}
          <span className="text-yellow-400 font-semibold underline">Sign in</span>
        </button>
      </div>
    </div>
  );
}
