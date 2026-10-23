'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { loginUser } from '@/redux/features/authApi';
import { removeCookie, removeAuthToken } from '@/redux/api/baseApi';
import { Shield, Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, isInitialized } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/superadmin/dashboard');
    }
  }, [isInitialized, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your administrator email.');
      return;
    }
    if (!password) {
      toast.error('Please enter your security key / password.');
      return;
    }

    try {
      removeCookie('superadmin_logged_out');
      const res: any = await dispatch(loginUser({ email: email.trim(), password })).unwrap();
      const user = res?.user || res;
      const role = String(user?.role || user?.globalRole || '').toUpperCase();
      if (role !== 'SUPER_ADMIN') {
        removeAuthToken();
        toast.error('Access denied. This console is strictly reserved for Super Administrators.');
        return;
      }
      toast.success('Welcome back, Super Administrator!');
      router.push('/superadmin/dashboard');
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleFillSuperAdminCredentials = () => {
    setEmail('superadmin@tavonza.ai');
    setPassword('SuperAdmin@1234');
    toast.info('Populated Super Administrator credentials');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative font-inter overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-neutral-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 animate-fade-in">
        {/* Emblem & Branding */}
        <div className="flex flex-col items-center text-center pb-6">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[2px] shadow-xl shadow-amber-500/20 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Tavonza AI</h1>
          <span className="text-[11px] font-semibold text-yellow-400 uppercase tracking-widest mt-0.5">
            Super Admin Console
          </span>
          <p className="text-xs text-zinc-400 pt-2">
            Enter your credentials to access platform-wide control.
          </p>
        </div>

        {/* Quick Demo Credentials Pill */}
        <div className="mb-4 p-3 bg-zinc-950/80 border border-yellow-500/30 rounded-xl flex items-center justify-between gap-2">
          <div className="text-[11px] text-zinc-400 leading-tight">
            <span className="text-yellow-400 font-semibold block">Default Platform Superadmin:</span>
            <span className="text-zinc-300 font-mono text-[10px]">superadmin@tavonza.ai</span>
          </div>
          <button
            type="button"
            onClick={handleFillSuperAdminCredentials}
            className="px-2.5 py-1 text-[11px] font-medium text-black bg-yellow-400 hover:bg-yellow-300 rounded-lg transition shrink-0 cursor-pointer shadow-sm shadow-yellow-500/20"
          >
            Auto-fill
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 pb-1.5">
              Super Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@tavonza.ai"
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400/80 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center pb-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Security Key / Password
              </label>
              <button
                type="button"
                onClick={() => router.push('/superadmin/forgot-password')}
                className="text-[11px] text-yellow-400/80 hover:text-yellow-400 cursor-pointer font-medium transition"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400/80 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2 shadow-lg shadow-yellow-500/10 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign in to Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
