'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TavonzaLogo } from '../TavonzaLogo';
import { rawUserApi } from '@/redux/features/userApi';
import { rawAuthApi } from '@/redux/features/authApi';
import { getCookie } from '@/redux/api/baseApi';
import { useAppDispatch } from '@/redux/store';
import { setUser } from '@/redux/slices/authSlice';

interface CreatePasswordViewProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function CreatePasswordView({ onComplete, onBack }: CreatePasswordViewProps) {
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const email = typeof window !== 'undefined' ? getCookie('tavonza_signup_email') || '' : '';
      const name = typeof window !== 'undefined' ? getCookie('tavonza_signup_name') || 'Customer' : 'Customer';
      const phone = typeof window !== 'undefined' ? getCookie('tavonza_signup_phone') || undefined : undefined;

      if (!email) {
        throw new Error('Registration email missing. Please go back to step 1.');
      }

      const newUser = await rawUserApi.createCustomer({
        name,
        email,
        password,
        contactNo: phone,
        role: 'CUSTOMER',
        customer: {},
      });

      // Automatically sign in to establish HTTP-only session cookies
      try {
        await rawAuthApi.login({
          email,
          password,
        });
      } catch {
        // Continue
      }

      dispatch(setUser(newUser as any));
      setIsSubmitting(false);
      onComplete();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to create customer account. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-between min-h-[720px] p-4 text-white relative font-sans">
      {/* Top Back Navigation */}
      <div className="w-full flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/80 hover:text-yellow-400 text-xs font-poppins transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Brand Header */}
      <div className="flex flex-col items-center gap-3 my-4">
        <TavonzaLogo size="lg" />
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 my-auto">
        <div className="flex flex-col gap-1.5 text-left">
          <h2 className="text-xl font-semibold text-white font-inter">Create Password</h2>
          <p className="text-xs text-white/60 font-poppins leading-relaxed">
            Keep your account secure by creating a strong password
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-inter flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Input */}
        <div className="w-full flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/80 font-inter">New Password</label>
          <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/15 focus-within:outline-yellow-400 flex items-center justify-between transition">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/30 font-inter focus:outline-none tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/60 hover:text-white p-1 cursor-pointer transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-[11px] text-white/40 font-poppins">At least 6 characters.</span>
        </div>

        {/* Confirm Password Input */}
        <div className="w-full flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/80 font-inter">Confirm Password</label>
          <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/15 focus-within:outline-yellow-400 flex items-center justify-between transition">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/30 font-inter focus:outline-none tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-white/60 hover:text-white p-1 cursor-pointer transition"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold font-inter rounded-[100px] flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/10 active:scale-[0.99] mt-3 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Create Password</span>
          )}
        </button>
      </form>

      <div className="pb-4" />
    </div>
  );
}
