'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { TavonzaLogo } from '../TavonzaLogo';
import { useAppDispatch } from '@/redux/store';
import { verifyOtpThunk, resendOtpThunk } from '@/redux/features/authApi';
import { getCookie } from '@/redux/api/baseApi';
import { setOtpCode } from '@/redux/slices/authSlice';
import { toast } from 'sonner';

interface OtpVerificationViewProps {
  email?: string;
  type?: 'email_verification' | 'phone_verification' | 'password_reset';
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
      const savedEmail = getCookie('kitchen_reset_email') || getCookie('kitchen_signup_email');
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

    try {
      await dispatch(
        resendOtpThunk({
          email: targetEmail.trim().toLowerCase(),
          type,
        })
      ).unwrap();

      setSeconds(60);
      setInfoMessage('A fresh 5-digit verification code has been dispatched to your email.');
      toast.success('Code resent successfully!');
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to resend code. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) {
      setError('Please enter all 5 digits.');
      return;
    }

    const code = otp.join('');
    setIsSubmitting(true);
    setError(null);

    try {
      await dispatch(
        verifyOtpThunk({
          email: targetEmail.trim().toLowerCase(),
          code,
          type,
        })
      ).unwrap();

      dispatch(setOtpCode(code));
      setIsSubmitting(false);
      toast.success('Code verified successfully!');
      onVerifySuccess(code);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(typeof err === 'string' ? err : err?.message || 'Verification failed. Please check the code and try again.');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-between min-h-[640px] lg:min-h-[680px] p-4 text-white relative font-sans">
      {/* Back Button */}
      <div className="w-full flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-white text-xs font-['Inter'] hover:text-yellow-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Brand Header */}
      <div className="flex flex-col items-center gap-3">
        <TavonzaLogo size="lg" />
      </div>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 my-auto">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h2 className="text-xl font-bold text-white font-['Inter']">Enter Verification Code</h2>
          <p className="text-xs text-white/60 font-['Inter'] leading-relaxed">
            We have sent a 5-digit verification code to{' '}
            <span className="text-yellow-400 font-semibold">{targetEmail || 'your email'}</span>.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter'] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl text-xs text-yellow-300 font-['Inter'] flex items-start gap-2">
            <span>{infoMessage}</span>
          </div>
        )}

        {/* 5-Digit Inputs */}
        <div className="flex justify-between items-center gap-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={idx === 0 ? handlePaste : undefined}
              className="w-12 h-14 bg-neutral-950 text-center text-xl font-bold text-white rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus:outline-yellow-400 transition"
            />
          ))}
        </div>

        {/* Resend Action */}
        <div className="flex items-center justify-between text-xs font-['Inter'] pt-1">
          <span className="text-white/60">Didn&apos;t receive code?</span>
          {seconds > 0 ? (
            <span className="text-yellow-400 font-medium">Resend in {formatTimer(seconds)}</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-yellow-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>Resend Code</span>
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={!isComplete || isSubmitting}
          className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold font-['Inter'] rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/10 active:scale-[0.99] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Verifying Code…' : 'Verify Code'}
        </button>
      </form>

      {/* Footer Notice */}
      <div className="pt-4 pb-1 text-center">
        <span className="text-slate-400 text-xs font-['Inter']">
          Kitchen Display Terminal &bull; Tavonza AI Station Security
        </span>
      </div>
    </div>
  );
}
