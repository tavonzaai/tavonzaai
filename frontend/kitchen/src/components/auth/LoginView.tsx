'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, ChefHat } from 'lucide-react';
import { TavonzaLogo } from '../TavonzaLogo';
import { useAppDispatch } from '@/redux/store';
import { loginUser } from '@/redux/features/authApi';
import { setUser } from '@/redux/slices/authSlice';
import { loginKitchenSession, logoutKitchenSession } from '@/lib/auth';
import { isRoleAllowedForKitchen } from '@/redux/ReduxProvider';
import { toast } from 'sonner';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onForgotPassword?: () => void;
  onNavigateToVerify?: (email: string) => void;
}

export default function LoginView({
  onLoginSuccess,
  onForgotPassword,
  onNavigateToVerify,
}: LoginViewProps) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('kitchen@tavonza.demo');
  const [password, setPassword] = useState('Demo1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompleteSession = (name: string, userEmail: string, role = 'KITCHEN') => {
    const logged = loginKitchenSession({ name, email: userEmail, role });
    dispatch(
      setUser({
        id: logged.id,
        name: logged.name,
        email: logged.email,
        role: logged.role,
        assignments: [
          {
            id: 'asg-ktc-1',
            role: 'KITCHEN',
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

      // Verify the authenticated account has kitchen privileges
      if (!isRoleAllowedForKitchen(userProfile)) {
        logoutKitchenSession();
        dispatch(setUser(null));
        setError('Access denied: Only accounts with the KITCHEN role can access this station.');
        return;
      }

      const userName =
        userProfile?.name ||
        `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() ||
        email.split('@')[0] ||
        'Chef';

      handleCompleteSession(
        userName,
        email.trim(),
        userProfile?.role || 'KITCHEN'
      );
    } catch (err: any) {
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'Login failed. Please check your credentials or use the demo sign-in below.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      handleCompleteSession('Chef Marco', 'kitchen@tavonza.demo', 'KITCHEN');
      setIsSubmitting(false);
    }, 200);
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
          <h2 className="text-xl font-bold text-white font-['Inter']">Kitchen Display Station</h2>
          <p className="text-sm text-white/80 font-['Inter']">
            Sign in to manage live tickets, prep stations, and order fulfillment
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter'] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-white font-['Inter']">Kitchen Staff Email</label>
            <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-2.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kitchen@example.com"
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
                onClick={onForgotPassword || (() => toast.info('Please contact your branch administrator to reset credentials.'))}
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

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold font-['Inter'] rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/10 active:scale-[0.99] mt-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Verifying Kitchen Session…' : 'Access Kitchen Station'}
          </button>

          {/* One-Click Kitchen Sign In */}
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isSubmitting}
            className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-xs text-amber-300 font-medium rounded-xl transition flex items-center justify-center gap-2 cursor-pointer font-['Inter'] border border-amber-500/20"
          >
            <ChefHat className="w-3.5 h-3.5 text-yellow-400" />
            <span>⚡ One-Click Kitchen Sign In (<strong>Chef Marco</strong>)</span>
          </button>

          {/* Admin Provisioning Notice */}
          <div className="text-center pt-2 px-2">
            <span className="text-[11px] text-white/50 font-['Inter'] leading-relaxed">
              Kitchen staff accounts are provisioned by your Restaurant Administrator or Branch Manager.
            </span>
          </div>
        </form>
      </div>

      {/* Bottom Terminal Notice */}
      <div className="pt-4 pb-1 text-center">
        <span className="text-slate-400 text-xs font-['Inter']">
          Kitchen Display Terminal &bull; Access managed by Branch Administrator
        </span>
      </div>
    </div>
  );
}
