'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { TavonzaLogo } from '../TavonzaLogo';
import { resetPasswordAction } from '@/app/actions/auth';

interface ResetPasswordViewProps {
  /**
   * Carried from the earlier steps — the API needs the email, the code and the
   * new password together. Optional because this view is also reachable as a
   * standalone route, where the flow state does not exist.
   */
  email?: string;
  otp?: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function ResetPasswordView({ email, otp, onComplete, onBack }: ResetPasswordViewProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !otp) {
      setError('Start again from "Forgot password?" so we can send you a code.');
      return;
    }

    setIsSubmitting(true);

    // The backend checks the code together with the new password in one call —
    // there is no separate "verify code" endpoint.
    const result = await resetPasswordAction({
      email,
      otp,
      password,
      confirmPassword,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    onComplete();
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-between min-h-[760px] p-4 text-white relative font-sans">
      {/* Back Button */}
      <div className="w-full flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
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
          <h2 className="text-sm font-semibold text-white font-['Inter']">Create New Password</h2>
          <p className="text-xs text-white/60 font-['Poppins']">
            Keep your account secure by creating a strong password
          </p>
        </div>

        <div className="w-full flex flex-col gap-2">
          <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-xs text-white placeholder:text-white/40 font-['Inter'] focus:outline-none tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/60 hover:text-white p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xs text-white/50 font-['Poppins']">
            At least 8 characters.
          </p>
        </div>

        <div className="w-full flex flex-col gap-2">
          <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="w-full bg-transparent text-xs text-white placeholder:text-white/40 font-['Inter'] focus:outline-none tracking-widest"
            />
          </div>
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
          {isSubmitting ? 'Updating…' : 'Create New Password'}
        </button>
      </form>

      <div className="pb-6" />
    </div>
  );
}
