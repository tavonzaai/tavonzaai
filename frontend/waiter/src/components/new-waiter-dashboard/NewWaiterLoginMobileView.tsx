'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { TavonzaLogoIcon } from '@/components/TavonzaLogo';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { loginUser } from '@/redux/features/authApi';
import { setUser } from '@/redux/slices/authSlice';
import { loginWaiterSession, isWaiterAuthenticated, getStoredWaiterUser } from '@/lib/auth';
import { isRoleAllowedForWaiter } from '@/redux/ReduxProvider';
import { removeAuthToken } from '@/redux/api/baseApi';
import { toast } from 'sonner';

export default function NewWaiterLoginMobileView({
  targetRedirect = '/new-waiter-dashboard',
}: {
  targetRedirect?: string;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Screen view state: 'splash' or 'login'
  const [viewMode, setViewMode] = useState<'splash' | 'login'>('splash');
  const [splashAutoTransitioned, setSplashAutoTransitioned] = useState(false);

  // Form states
  const [email, setEmail] = useState('waiter@tavonza.ai');
  const [password, setPassword] = useState('Waiter@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Check if session already exists
  const activeUser = user || (typeof document !== 'undefined' ? getStoredWaiterUser() : null);
  const hasWaiterRole = activeUser ? isRoleAllowedForWaiter(activeUser) : false;
  const isAuth = isWaiterAuthenticated() && (isAuthenticated || hasWaiterRole);

  // Auto transition from Splash to Login after 2.4 seconds if not yet logged in
  useEffect(() => {
    if (viewMode === 'splash' && !splashAutoTransitioned) {
      const timer = setTimeout(() => {
        if (!isAuth) {
          setViewMode('login');
          setSplashAutoTransitioned(true);
        }
      }, 2400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [viewMode, splashAutoTransitioned, isAuth]);

  const handleCompleteSession = (
    name: string,
    userEmail: string,
    role = 'WAITER',
    profile?: any
  ) => {
    const logged = loginWaiterSession({
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
            id: 'asg-wtr-1',
            role: 'WAITER',
            branch: { id: 'br-1', name: logged.station },
          },
        ],
      })
    );
    toast.success(`Welcome back, ${logged.name}!`);
    router.replace(targetRedirect);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res: any = await dispatch(loginUser({ email: email.trim(), password })).unwrap();
      const userProfile = res?.user || res;

      // Strictly verify that the user has the WAITER role
      if (!isRoleAllowedForWaiter(userProfile)) {
        removeAuthToken();
        setError('Access denied. Only Waiter accounts are authorized to access this terminal.');
        return;
      }

      const userName =
        userProfile?.name ||
        `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() ||
        email.split('@')[0] ||
        'Waiter';
      const userRole = userProfile?.role ? String(userProfile.role).toUpperCase() : 'WAITER';

      handleCompleteSession(userName, email.trim(), userRole, userProfile);
    } catch (err: any) {
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'Invalid credentials or unauthorized station access.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-0 sm:p-4 md:p-8 font-sans relative selection:bg-amber-400 selection:text-black">
      {/* Top Floating Preview Mode Switcher (Desktop Convenience) */}
      <div className="fixed top-4 z-50 hidden md:flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs text-white shadow-xl">
        <span className="text-zinc-400">Preview Screen:</span>
        <button
          onClick={() => setViewMode('splash')}
          className={`px-3 py-1 rounded-full transition font-medium cursor-pointer ${
            viewMode === 'splash' ? 'bg-amber-400 text-black font-semibold' : 'text-zinc-300 hover:text-white'
          }`}
        >
          1. Splash Screen
        </button>
        <button
          onClick={() => setViewMode('login')}
          className={`px-3 py-1 rounded-full transition font-medium cursor-pointer ${
            viewMode === 'login' ? 'bg-amber-400 text-black font-semibold' : 'text-zinc-300 hover:text-white'
          }`}
        >
          2. Login Screen
        </button>
        {isAuth && (
          <button
            onClick={() => router.push(targetRedirect)}
            className="ml-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Main Mobile Screen Container (w-full max-w-[420px] h-screen sm:h-[852px] exact Figma aspect ratio) */}
      <div className="w-full max-w-[420px] h-screen sm:h-[852px] sm:max-h-[92vh] sm:rounded-[44px] bg-black relative overflow-hidden flex flex-col justify-between sm:border sm:border-white/15 sm:shadow-[0_0_60px_rgba(0,0,0,0.9)] sm:ring-1 sm:ring-white/10">
        {/* Background Dark Particle Wave Artwork */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <Image
            src="/images/dark_wave_bg.jpg"
            alt="Tavonza Particle Wave Background"
            fill
            priority
            className="object-cover object-center scale-105"
          />
          {/* Subtle Ambient Radial Overlay & Dark Vignette */}
          <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/90" />
          <div className="w-80 h-96 left-[30px] top-[227px] absolute bg-amber-500/5 rounded-full blur-[100px]" />
        </div>

        {/* Dynamic Screen Content: Splash vs Login */}
        <div className="flex-1 flex flex-col justify-center items-center relative z-10 w-full px-6 pt-6">
          {/* ──────────────── SCREEN 1: SPLASH SCREEN ──────────────── */}
          {viewMode === 'splash' && (
            <div className="w-full flex flex-col items-center justify-center my-auto transition-all duration-500 animate-fadeIn">
              {/* Central Golden Emblem Logo */}
              <div className="relative group cursor-pointer" onClick={() => setViewMode('login')}>
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
                  <TavonzaLogoIcon className="w-20 h-20 sm:w-24 sm:h-24 relative z-10 text-amber-400" />
                </div>
              </div>

              {/* Brand Typography: Tavonza AI */}
              <div className="flex items-center justify-center mt-6 text-center select-none">
                <span className="text-white text-4xl sm:text-5xl font-black font-['Outfit',sans-serif] tracking-tight">
                  Tavonza
                </span>
                <span className="text-amber-400 text-4xl sm:text-5xl font-black font-['Outfit',sans-serif] tracking-tight ml-2">
                  AI
                </span>
              </div>

              {/* Subtitle / Hospitality Caption */}
              <p className="text-xs text-white/60 font-['Inter'] mt-3 tracking-widest uppercase text-center">
                Smart Hospitality Terminal
              </p>

              {/* Tap to Enter Prompt Button */}
              <button
                onClick={() => setViewMode('login')}
                className="mt-16 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 text-xs font-['Inter'] flex items-center gap-2 transition backdrop-blur-md cursor-pointer active:scale-95"
              >
                <span>Tap to continue</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          )}

          {/* ──────────────── SCREEN 2: LOGIN SCREEN ──────────────── */}
          {viewMode === 'login' && (
            <div className="w-full flex flex-col items-center justify-between py-2 transition-all duration-500 animate-fadeIn">
              {/* Top Compact Brand Emblem */}
              <div
                className="flex flex-col items-center justify-center gap-2 cursor-pointer pt-1"
                onClick={() => setViewMode('splash')}
                title="Tap to view splash screen"
              >
                <TavonzaLogoIcon className="w-16 h-16 sm:w-20 sm:h-20 text-amber-400" />
                <div className="flex items-center justify-center text-center">
                  <span className="text-white text-3xl sm:text-4xl font-black font-['Outfit',sans-serif] tracking-tight">
                    Tavonza
                  </span>
                  <span className="text-amber-400 text-3xl sm:text-4xl font-black font-['Outfit',sans-serif] tracking-tight ml-1.5">
                    AI
                  </span>
                </div>
              </div>

              {/* Welcome Heading */}
              <div className="text-center flex flex-col items-center gap-1 mt-6 mb-5">
                <h1 className="text-white text-xl sm:text-2xl font-bold font-['Inter']">Welcome</h1>
                <p className="text-white/80 text-xs font-normal font-['Inter']">
                  Please choose your login option below
                </p>
              </div>

              {/* Active Session Notice if already authenticated */}
              {isAuth && activeUser && (
                <div className="w-full max-w-sm mb-4 p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Signed in as <strong>{activeUser.name}</strong></span>
                  </div>
                  <button
                    onClick={() => router.push(targetRedirect)}
                    className="px-2.5 py-1 rounded-lg bg-amber-400 text-black font-semibold text-[11px] hover:bg-amber-300 transition cursor-pointer"
                  >
                    Enter &rarr;
                  </button>
                </div>
              )}

              {/* Login Form Box */}
              <form onSubmit={handleLoginSubmit} className="w-full max-w-sm flex flex-col gap-4">
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200 font-['Inter'] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-white text-sm font-normal font-['Inter']">Email</label>
                  <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-2.5 focus-within:outline-amber-400 transition">
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

                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-white text-sm font-normal font-['Inter']">Password</label>
                  <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between gap-2.5 focus-within:outline-amber-400 transition">
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
                      className="text-white/60 hover:text-white p-1 cursor-pointer transition"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Golden Rounded Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 mt-2 bg-amber-400 hover:bg-amber-300 text-black text-base font-medium font-['Poppins'] rounded-[100px] flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 active:scale-[0.99] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                  <span>{isSubmitting ? 'Signing in…' : 'Login'}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 3. Bottom iPhone Home Indicator Bar */}
        <div className="w-full h-6 pb-2 flex items-center justify-center z-20 shrink-0">
          <div className="w-32 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
