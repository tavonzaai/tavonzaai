'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { TavonzaLogo } from '../TavonzaLogo';
import { loginAction } from '@/app/actions/auth';
import { useAppDispatch } from '@/redux/store';
import { loginUser } from '@/redux/features/authApi';

import { setUser } from '@/redux/slices/authSlice';
import { setAuthToken } from '@/redux/api/baseApi';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
}

export default function LoginView({
  onLoginSuccess,
  onForgotPassword,
  onCreateAccount,
}: LoginViewProps) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickLogin = (customEmail?: string) => {
    const targetEmail = customEmail || email.trim() || 'customer@tavonza.ai';
    const mockUser = {
      id: 'cust_dev_' + Math.random().toString(36).substring(2, 9),
      name: targetEmail.split('@')[0] || 'Customer',
      email: targetEmail,
      role: 'CUSTOMER',
    };
    dispatch(setUser(mockUser));
    setAuthToken('dev_customer_token_' + Date.now());
    onLoginSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const cleanEmail = email.trim();

    /* =========================================================================
     * [DEV MODE]: STRICT AUTHENTICATION DISABLED - ANY USER CAN LOG IN
     * To re-enable strict backend authentication, comment out the bypass below
     * and uncomment the ORIGINAL PRODUCTION AUTHENTICATION BLOCK.
     * ========================================================================= */
    handleQuickLogin(cleanEmail);
    setIsSubmitting(false);

    /* =========================================================================
     * [ORIGINAL PRODUCTION AUTHENTICATION CODE - PRESERVED FOR FUTURE USE]
     * Uncomment the block below to re-enable real backend credential checks:
     * =========================================================================
    try {
      // 1. Authenticate with backend API via Redux so cookies (access_token) are set in browser
      const res: any = await dispatch(loginUser({ email: cleanEmail, password })).unwrap();
      const userProfile = res?.user || res;

      if (userProfile?.role && userProfile.role.toUpperCase() !== 'CUSTOMER') {
        setError('Only customer accounts can sign in here. Please use your customer account.');
        setIsSubmitting(false);
        return;
      }

      // 2. Also keep server action session synchronized
      try {
        await loginAction(cleanEmail, password);
      } catch {
        // non-blocking
      }

      onLoginSuccess();
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err?.message || 'Login failed. Please check your credentials.');
      setIsSubmitting(false);
    }
    * ========================================================================= */
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
          <h2 className="text-xl font-bold text-white font-['Inter']">Welcome</h2>
          <p className="text-sm text-white/80 font-['Inter']">
            Please choose your login option below
          </p>
        </div>

        <form  onSubmit={handleSubmit}  className="w-full flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter']">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-white font-['Inter']">Email</label>
            <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-2.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-100/50 font-['Inter'] focus:outline-none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-white font-['Inter']">Password</label>
            </div>
            <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between gap-2.5">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-100/50 font-['Inter'] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/60 hover:text-white p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-yellow-400 text-xs font-['Inter'] underline hover:text-yellow-300 transition cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Login Button */}
          {error && (
            <div className="flex items-start gap-2 text-xs text-rose-300 leading-relaxed">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-medium font-['Inter'] rounded-[100px] flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/10 active:scale-[0.99] mt-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Signing in…' : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin()}
            className="w-full h-10 border border-yellow-400/40 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 text-xs font-semibold font-['Inter'] rounded-[100px] flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            ⚡ Instant Login (Any User)
          </button>
        </form>

        {/* Or Login With Divider */}
        {/* <div className="w-full flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-white/60" />
          <span className="text-xs text-white font-['Poppins']">Or login with</span>
          <div className="flex-1 h-px bg-white/60" />
        </div> */}

        {/* Social Logins (Authentic SVG vector logos matching Figma spec) */}
        {/* <div className="w-full grid grid-cols-3 gap-2.5">
           <button
            type="button"
            disabled
            title="Social sign-in isn't wired up yet — use your email and password"
            className="h-13 bg-neutral-800/90 border border-white/5 rounded-2xl flex items-center justify-center gap-2 opacity-40 cursor-not-allowed"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#1877F2" />
              <path
                d="M14.5 12.25H12.75V19.5H9.75V12.25H8.5V9.75H9.75V8.25C9.75 6.6 10.75 5.5 12.5 5.5H14.5V8H13.25C12.6 8 12.75 8.35 12.75 8.75V9.75H14.75L14.5 12.25Z"
                fill="white"
              />
            </svg>
            <span className="text-white text-xs font-medium font-['Inter']">Facebook</span>
          </button>

           <button
            type="button"
            disabled
            title="Social sign-in isn't wired up yet — use your email and password"
            className="h-13 bg-neutral-800/90 border border-white/5 rounded-2xl flex items-center justify-center gap-2 opacity-40 cursor-not-allowed"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-white text-xs font-medium font-['Inter']">Gmail</span>
          </button>

           <button
            type="button"
            disabled
            title="Social sign-in isn't wired up yet — use your email and password"
            className="h-13 bg-neutral-800/90 border border-white/5 rounded-2xl flex items-center justify-center gap-2 opacity-40 cursor-not-allowed"
          >
            <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.1-.97.04-2.16.65-2.85 1.46-.62.72-1.16 1.88-1.01 3 .09.01.21.02.32.02 1.08 0 2.18-.56 2.55-1.38z" />
            </svg>
            <span className="text-white text-xs font-medium font-['Inter']">Apple</span>
          </button>
        </div> */}
      </div>

      {/* Bottom Sign Up Link */}
      <div className="pt-6 pb-2 text-center">
        <span className="text-slate-400 text-sm font-['Inter']">Don&apos;t have an account? </span>
        <button
          type="button"
          onClick={onCreateAccount}
          className="text-yellow-400 text-sm font-['Inter'] font-semibold underline hover:text-yellow-300 transition cursor-pointer"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
