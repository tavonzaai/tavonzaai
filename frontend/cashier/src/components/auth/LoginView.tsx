'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { TavonzaLogo } from '../TavonzaLogo';
import { useAppDispatch } from '@/redux/store';
import { loginUser } from '@/redux/features/authApi';
import { setUser } from '@/redux/slices/authSlice';
import { loginCashierSession } from '@/lib/auth';
import { removeAuthToken } from '@/redux/api/baseApi';
import { toast } from 'sonner';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onForgotPassword?: () => void;
}

export default function LoginView({
  onLoginSuccess,
  onForgotPassword,
}: LoginViewProps) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('cashier@tavonza.demo');
  const [password, setPassword] = useState('Demo1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompleteSession = (
    name: string,
    userEmail: string,
    role = 'CASHIER',
    profile?: any
  ) => {
    const logged = loginCashierSession({
      id: profile?.id,
      name,
      email: userEmail,
      role,
      assignments: profile?.assignments,
    });
    dispatch(
      setUser({
        id: logged.id,
        name: logged.name,
        email: logged.email,
        role: logged.role,
        assignments: logged.assignments || [
          {
            id: 'asg-1',
            role: 'CASHIER',
            branch: { id: 'br-1', name: logged.station },
          },
        ],
      })
    );
    toast.success(`Welcome back, ${logged.name}!`);
    onLoginSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res: any = await dispatch(loginUser({ email: email.trim(), password })).unwrap();
      const userProfile = res?.user || res;

      const roleUpper = String(userProfile?.role || '').toUpperCase();
      const isCashier =
        roleUpper === 'CASHIER' ||
        userProfile?.assignments?.some((a: any) => String(a.role || '').toUpperCase() === 'CASHIER');

      if (!isCashier) {
        removeAuthToken();
        setError('Access denied. Only Cashier accounts are authorized for this terminal.');
        return;
      }

      const userName =
        userProfile?.name ||
        `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() ||
        email.split('@')[0] ||
        'Cashier';
      const userRole = userProfile?.role ? String(userProfile.role).toUpperCase() : 'CASHIER';

      handleCompleteSession(
        userName,
        email.trim(),
        userRole,
        userProfile
      );
    } catch (err: any) {
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'Invalid credentials or unauthorized cashier access. Please check your email and password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-between min-h-[640px] lg:min-h-[680px] p-4 text-white relative font-sans">
      {/* Brand Header */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <TavonzaLogo size="lg" />
      </div>

      {/* Main Login Form Box */}
      <div className="w-full flex flex-col items-center gap-6 mt-4">
        <div className="text-center flex flex-col items-center gap-1">
          <h2 className="text-xl font-bold text-white font-['Inter']">Welcome Back</h2>
          <p className="text-sm text-white/80 font-['Inter']">
            Sign in to access your table session and saved preferences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter']">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-white font-['Inter']">Email Address</label>
            <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-2.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-100/50 font-['Inter'] focus:outline-none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-white font-['Inter']">Password</label>
              <button
                type="button"
                onClick={onForgotPassword || (() => toast.info('Please contact your administrator to reset credentials.'))}
                className="text-yellow-400 text-xs font-['Inter'] hover:underline transition cursor-pointer"
              >
                Forgot password?
              </button>
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
            className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold font-['Inter'] rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/10 active:scale-[0.99] mt-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Signing in…' : 'Log In'}
          </button>

        </form>
      </div>

      {/* Bottom Terminal Notice */}
      <div className="pt-4 pb-1 text-center">
        <span className="text-slate-400 text-xs font-['Inter']">
          Cashier Terminal &bull; Access managed by Branch Administrator
        </span>
      </div>
    </div>
  );
}
