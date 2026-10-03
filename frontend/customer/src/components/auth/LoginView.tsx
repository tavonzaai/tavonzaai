'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TavonzaLogo } from '../TavonzaLogo';
import { useAppDispatch } from '@/redux/store';
import { loginUser } from '@/redux/features/authApi';
import { setCookie, getCookie } from '@/redux/api/baseApi';
import { setPendingEmail } from '@/redux/slices/authSlice';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
  onNavigateToVerify?: (email: string) => void;
  initialEmail?: string;
}

export default function LoginView({
  onLoginSuccess,
  onForgotPassword,
  onCreateAccount,
  onNavigateToVerify,
  initialEmail,
}: LoginViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const getInitialEmail = () => {
    if (initialEmail) return initialEmail;
    const fromQuery = searchParams?.get('email');
    if (fromQuery) return fromQuery;
    if (typeof document !== 'undefined') {
      return getCookie('tavonza_signup_email') || '';
    }
    return '';
  };

  const [email, setEmail] = useState(getInitialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);

  useEffect(() => {
    const nextEmail = getInitialEmail();
    if (nextEmail && !email) {
      setEmail(nextEmail);
    }
  }, [initialEmail, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setIsUnverified(false);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const res: any = await dispatch(
        loginUser({
          email: cleanEmail,
          password,
        })
      ).unwrap();

      // Ensure customer account role verification
      const userProfile = res?.user || res;
      if (userProfile?.role && userProfile.role.toUpperCase() !== 'CUSTOMER') {
        setError('Only customer accounts can sign in here. Please use your customer account.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onLoginSuccess();
    } catch (err: any) {
      setIsSubmitting(false);
      const errMsg = typeof err === 'string' ? err : err?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);

      if (errMsg.toLowerCase().includes('not verified') || errMsg.toLowerCase().includes('verify your email')) {
        setIsUnverified(true);
        setCookie('tavonza_signup_email', cleanEmail);
        dispatch(setPendingEmail(cleanEmail));
      }
    }
  };

  const handleGoToVerification = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (onNavigateToVerify) {
      onNavigateToVerify(cleanEmail);
    } else {
      router.push(`/verify-otp?email=${encodeURIComponent(cleanEmail)}&type=email_verification`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-between min-h-[760px] p-4 text-white relative font-sans">
      {/* Brand Header */}
      <div className="flex flex-col items-center gap-3 pt-6">
        <TavonzaLogo size="lg" />
      </div>

      {/* Main Login Form Box */}
      <div className="w-full flex flex-col items-center gap-6 mt-6">
        <div className="text-center flex flex-col items-center gap-1">
          <h2 className="text-xl font-bold text-white font-['Inter']">Welcome Back</h2>
          <p className="text-sm text-white/70 font-['Inter']">
            Sign in to access your table session and saved preferences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* General Error Alert */}
          {error && !isUnverified && (
            <div className="p-3.5 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter'] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Unverified Account Banner */}
          {isUnverified && (
            <div className="p-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-xs text-amber-200 font-['Inter'] flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Email Verification Required</p>
                  <p className="text-amber-200/80 mt-1 leading-relaxed">
                    Your account has been registered, but your email address has not been verified yet.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGoToVerification}
                className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-semibold rounded-lg transition active:scale-[0.98] cursor-pointer"
              >
                Verify Email with OTP
              </button>
            </div>
          )}

          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/90 font-['Inter'] font-medium">Email Address</label>
            <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center transition">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-['Inter'] focus:outline-none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs text-white/90 font-['Inter'] font-medium">Password</label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-yellow-400 text-xs font-['Inter'] hover:underline transition cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center justify-between transition">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold font-['Inter'] rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/10 active:scale-[0.99] mt-3 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Signing in…' : 'Log In'}
          </button>
        </form>
      </div>

      {/* Bottom Sign Up Link */}
      <div className="pt-6 pb-2 text-center">
        <span className="text-stone-400 text-sm font-['Inter']">Don&apos;t have an account? </span>
        <button
          type="button"
          onClick={onCreateAccount}
          className="text-yellow-400 text-sm font-['Inter'] font-semibold underline hover:text-yellow-300 transition cursor-pointer ml-1"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
