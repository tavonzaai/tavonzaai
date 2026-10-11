'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, X, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react';
import { TavonzaLogo } from '../TavonzaLogo';
import { useAppDispatch } from '@/redux/store';
import {
  loginUser,
  forgotPasswordThunk,
  verifyOtpThunk,
  resetPasswordThunk,
  resendOtpThunk,
} from '@/redux/features/authApi';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'new-password'>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [showForgotNewPass, setShowForgotNewPass] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend OTP Countdown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleCompleteSession = (
    name: string,
    userEmail: string,
    role = 'ADMIN',
    profile?: any
  ) => {
    const logged = loginAdminSession({
      id: profile?.id,
      name,
      email: userEmail,
      role,
      assignments: profile?.assignments || [],
    });
    dispatch(
      setUser({
        id: logged.id,
        name: logged.name,
        email: logged.email,
        role: logged.role,
        assignments: logged.assignments || [],
      })
    );
    toast.success(`Welcome back, ${logged.name}!`);
    onLoginSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide your email and password.');
      return;
    }

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
      const userRole = userProfile?.role ? String(userProfile.role).toUpperCase() : 'ADMIN';

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

  // ─── Forgot Password Handlers ───────────────────────────────────────────────

  const handleOpenForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
      return;
    }
    setForgotEmail(email.trim());
    setForgotStep('request');
    setForgotOtp('');
    setForgotNewPass('');
    setForgotConfirmPass('');
    setForgotError(null);
    setIsForgotModalOpen(true);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your account email address.');
      return;
    }

    setIsForgotLoading(true);
    setForgotError(null);
    try {
      const res: any = await dispatch(
        forgotPasswordThunk({ email: forgotEmail.trim() })
      ).unwrap();
      toast.success(res?.message || `A verification OTP has been sent to ${forgotEmail}`);
      setForgotStep('verify');
      setResendCooldown(60);
    } catch (err: any) {
      setForgotError(typeof err === 'string' ? err : err?.message || 'Failed to request OTP code.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotOtp.trim().length < 4) {
      setForgotError('Please enter the 5-digit verification code.');
      return;
    }

    setIsForgotLoading(true);
    setForgotError(null);
    try {
      await dispatch(
        verifyOtpThunk({
          email: forgotEmail.trim(),
          code: forgotOtp.trim(),
          type: 'password_reset',
        })
      ).unwrap();
      toast.success('Verification code accepted!');
      setForgotStep('new-password');
    } catch (err: any) {
      setForgotError(typeof err === 'string' ? err : err?.message || 'Invalid or expired OTP code.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isForgotLoading) return;
    setIsForgotLoading(true);
    setForgotError(null);
    try {
      await dispatch(
        resendOtpThunk({
          email: forgotEmail.trim(),
          type: 'password_reset',
        })
      ).unwrap();
      toast.success('A new OTP verification code has been sent.');
      setResendCooldown(60);
    } catch (err: any) {
      setForgotError(typeof err === 'string' ? err : err?.message || 'Failed to resend code.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotNewPass || !forgotConfirmPass) {
      setForgotError('Please enter and confirm your new password.');
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setForgotError('Passwords do not match.');
      return;
    }
    if (forgotNewPass.length < 8) {
      setForgotError('Password must be at least 8 characters long.');
      return;
    }

    setIsForgotLoading(true);
    setForgotError(null);
    try {
      const res: any = await dispatch(
        resetPasswordThunk({
          email: forgotEmail.trim(),
          code: forgotOtp.trim(),
          newPassword: forgotNewPass,
        })
      ).unwrap();
      toast.success(res?.message || 'Password reset successfully! You can now log in.');
      setEmail(forgotEmail.trim());
      setPassword('');
      setIsForgotModalOpen(false);
    } catch (err: any) {
      setForgotError(typeof err === 'string' ? err : err?.message || 'Password reset failed.');
    } finally {
      setIsForgotLoading(false);
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
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter'] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
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
                placeholder="admin@tavonza.com"
                autoComplete="email"
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-100/50 font-['Inter'] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-white font-['Inter']">Password</label>
              <button
                type="button"
                onClick={handleOpenForgotPassword}
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
                autoComplete="current-password"
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-100/50 font-['Inter'] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/60 hover:text-white p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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

      {/* ─── Forgot Password / OTP Recovery Modal ────────────────────────────── */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-['Inter'] text-white">Reset Password</h3>
                <p className="text-xs text-neutral-400 font-['Inter']">
                  {forgotStep === 'request' && 'Enter your email to receive a 5-digit verification code'}
                  {forgotStep === 'verify' && 'Enter the 5-digit OTP sent to your email'}
                  {forgotStep === 'new-password' && 'Create your new administrator password'}
                </p>
              </div>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter'] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* Step 1: Request OTP */}
            {forgotStep === 'request' && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-300 font-['Inter']">Account Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@tavonza.com"
                    className="w-full h-11 px-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full h-11 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isForgotLoading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                  <span>Send Verification Code</span>
                </button>
              </form>
            )}

            {/* Step 2: Verify OTP */}
            {forgotStep === 'verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-neutral-300 font-['Inter']">5-Digit Verification Code</label>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isForgotLoading}
                      onClick={handleResendOtp}
                      className="text-amber-400 text-xs hover:underline disabled:text-neutral-500 disabled:no-underline transition flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isForgotLoading ? 'animate-spin' : ''}`} />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.trim())}
                    placeholder="Enter 5-digit code"
                    className="w-full h-11 px-3 bg-neutral-950 border border-neutral-800 rounded-xl text-center text-sm tracking-widest font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full h-11 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isForgotLoading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                  <span>Verify Code</span>
                </button>
              </form>
            )}

            {/* Step 3: New Password */}
            {forgotStep === 'new-password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-300 font-['Inter']">New Password (min 8 chars)</label>
                  <div className="relative">
                    <input
                      type={showForgotNewPass ? 'text' : 'password'}
                      required
                      value={forgotNewPass}
                      onChange={(e) => setForgotNewPass(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full h-11 px-3 pr-10 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPass(!showForgotNewPass)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-white"
                    >
                      {showForgotNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-300 font-['Inter']">Confirm New Password</label>
                  <input
                    type={showForgotNewPass ? 'text' : 'password'}
                    required
                    value={forgotConfirmPass}
                    onChange={(e) => setForgotConfirmPass(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full h-11 px-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full h-11 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isForgotLoading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                  <span>Reset & Save Password</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
