'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { TavonzaLogo } from '../TavonzaLogo';
import { useAppDispatch } from '@/redux/store';
import { loginUser } from '@/redux/features/authApi';
import { setUser } from '@/redux/slices/authSlice';
import { loginAdminSession } from '@/lib/auth';
import { isRoleAllowedForAdmin } from '@/redux/ReduxProvider';
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
  const [email, setEmail] = useState('owner@tavonza.ai');
  const [password, setPassword] = useState('Owner@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompleteSession = (
    name: string,
    userEmail: string,
    role = 'SUPER_ADMIN',
    profile?: any
  ) => {
    const logged = loginAdminSession({
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
            id: 'asg-adm-1',
            role: 'SUPER_ADMIN',
            branch: { id: 'br-hq', name: logged.station || 'Global HQ' },
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

      if (!isRoleAllowedForAdmin(userProfile)) {
        removeAuthToken();
        setError('Access denied. Only Administrator and Owner accounts are authorized for this console.');
        return;
      }

      const userName =
        userProfile?.name ||
        `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() ||
        email.split('@')[0] ||
        'Administrator';
      const userRole = userProfile?.role ? String(userProfile.role).toUpperCase() : 'SUPER_ADMIN';

      handleCompleteSession(userName, email.trim(), userRole, userProfile);
    } catch (err: any) {
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'Invalid credentials or unauthorized administrator access.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-between min-h-[640px] lg:min-h-[680px] p-4 text-white relative font-sans">
      <div className="flex flex-col items-center gap-3 pt-2">
        <TavonzaLogo size="lg" />
      </div>

      <div className="w-full flex flex-col items-center gap-6 mt-4">
        <div className="text-center flex flex-col items-center gap-1">
          <h2 className="text-xl font-bold text-white font-['Inter']">Administrator Console</h2>
          <p className="text-sm text-white/80 font-['Inter']">
            Sign in to manage tenants, restaurants, branches, financials, and staff
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter']">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm text-white font-['Inter']">Email Address</label>
            <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-2.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@tavonza.ai"
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-100/50 font-['Inter'] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-white font-['Inter']">Password</label>
              <button
                type="button"
                onClick={onForgotPassword || (() => toast.info('Please contact support to reset credentials.'))}
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
                placeholder="Enter password"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold font-['Inter'] rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/10 active:scale-[0.99] mt-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-black" />}
            <span>{isSubmitting ? 'Logging in...' : 'Log In'}</span>
          </button>
        </form>
      </div>

      <div className="pt-4 pb-1 text-center">
        <span className="text-slate-400 text-xs font-['Inter']">
          Tavonza AI Hospitality &bull; Super Admin & Management Access
        </span>
      </div>
    </div>
  );
}
