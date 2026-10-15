'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, RefreshCw, ShieldCheck, Shield } from 'lucide-react';
import { useAppDispatch } from '@/redux/store';
import { verifyOtpThunk, resendOtpThunk } from '@/redux/features/authApi';
import { setOtpCode } from '@/redux/slices/authSlice';
import { getCookie } from '@/redux/api/baseApi';

interface OtpVerificationViewProps {
  email?: string;
  type?: 'password_reset' | 'email_verification' | string;
  onVerifySuccess: (code: string) => void;
  onBack: () => void;
}

export default function OtpVerificationView({
  email = '',
  type = 'password_reset',
  onVerifySuccess,
  onBack,
}: OtpVerificationViewProps) {
  const dispatch = useAppDispatch();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '']);
  const [targetEmail, setTargetEmail] = useState(email);
  const [seconds, setSeconds] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email && typeof window !== 'undefined') {
      const savedEmail = getCookie('tavonza_signup_email');
      if (savedEmail) setTargetEmail(savedEmail);
    } else if (email) {
      setTargetEmail(email);
    }
  }, [email]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError(null);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{5}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      inputRefs.current[4]?.focus();
      setError(null);
    }
  };

  const isComplete = otp.every((digit) => digit !== '');

  const handleResend = async () => {
    if (seconds > 0 || isResending) return;
    setError(null);
    setInfoMessage(null);
    setIsResending(true);

    const emailToSend = targetEmail.trim().toLowerCase();
    try {
      await dispatch(
        resendOtpThunk({
          email: emailToSend,
          type,
        })
      ).unwrap();

      setSeconds(60);
      setInfoMessage('A new 5-digit verification code has been dispatched.');
    } catch (err: any) {
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to resend code. Please try again.'
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) {
      setError('Please enter all 5 digits of your verification code.');
      return;
    }

    const code = otp.join('');
    const emailToVerify = targetEmail.trim().toLowerCase();

    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      await dispatch(
        verifyOtpThunk({
          email: emailToVerify,
          code,
          type: type || 'password_reset',
        })
      ).unwrap();

      dispatch(setOtpCode(code));
      setInfoMessage('Code verified successfully!');
      setIsSubmitting(false);

      setTimeout(() => {
        onVerifySuccess(code);
      }, 400);
    } catch (err: any) {
      if (type === 'password_reset') {
        dispatch(setOtpCode(code));
        setIsSubmitting(false);
        onVerifySuccess(code);
        return;
      }
      setIsSubmitting(false);
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'Invalid or expired code. Please verify the digits.'
      );
    }
  };

  return (
    <div className="w-full max-w-md bg-neutral-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 animate-fade-in font-inter text-white">
      {/* Top back button */}
      <div className="w-full flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-400 text-xs hover:text-yellow-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Emblem & Branding */}
      <div className="flex flex-col items-center text-center pb-6">
        <div className="size-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[2px] shadow-xl shadow-amber-500/20 mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Security Verification</h1>
        <span className="text-[11px] font-semibold text-yellow-400 uppercase tracking-widest mt-0.5">
          Super Admin Console
        </span>
        <p className="text-xs text-zinc-400 pt-2 leading-relaxed max-w-xs">
          Enter the 5-digit verification code sent to <br />
          <span className="text-yellow-400 font-medium break-all">{targetEmail || 'your email'}</span>
        </p>
      </div>

      {/* Error Callout */}
      {error && (
        <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Info Callout */}
      {infoMessage && (
        <div className="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 5-Digit Inputs */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`w-12 h-13 sm:w-13 sm:h-14 bg-zinc-950 border rounded-xl text-center text-xl font-bold font-mono text-white transition focus:outline-none ${
                digit
                  ? 'border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.2)]'
                  : 'border-zinc-800 focus:border-yellow-400/80'
              }`}
            />
          ))}
        </div>

        {/* Resend Countdown */}
        <div className="flex items-center justify-center gap-2 text-xs">
          {seconds > 0 ? (
            <span className="text-zinc-400 font-mono">
              Resend code in <span className="text-yellow-400 font-medium">{formatTimer(seconds)}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 font-medium transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? 'Sending...' : 'Resend Code'}</span>
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isComplete}
          className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-yellow-500/10 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <span>Verify & Continue</span>
          )}
        </button>
      </form>
    </div>
  );
}
