'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { TavonzaLogo } from '../TavonzaLogo';
import { useAppDispatch } from '@/redux/store';
import { verifyOtpThunk, resendOtpThunk } from '@/redux/features/authApi';
import { getCookie } from '@/redux/api/baseApi';

interface OtpVerificationViewProps {
  email?: string;
  type?: 'email_verification' | 'phone_verification' | 'password_reset' | string;
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
      setInfoMessage('A new 5-digit verification code has been sent to your email.');
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to resend code. Please try again.');
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

    if (type === 'password_reset') {
      onVerifySuccess(code);
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        verifyOtpThunk({
          email: emailToVerify,
          code,
          type: type || 'password_reset',
        })
      ).unwrap();

      setInfoMessage('Code verified successfully!');
      setIsSubmitting(false);
      onVerifySuccess(code);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(typeof err === 'string' ? err : err?.message || 'Verification failed. Please check the code.');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-between min-h-[640px] lg:min-h-[680px] p-4 text-white relative font-sans">
      <div className="w-full flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-white text-xs font-['Poppins'] hover:text-yellow-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-3">
        <TavonzaLogo size="lg" />
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 my-auto">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h2 className="text-xl font-bold text-white font-['Inter']">Verification Code</h2>
          <p className="text-xs text-neutral-400 font-['Inter'] leading-relaxed">
            Enter the 5-digit verification code sent to{' '}
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
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-['Inter'] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
            <span>{infoMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2.5 my-2">
          {otp.map((digit, idx) => (
            <div
              key={idx}
              className="w-14 h-14 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/20 bg-neutral-900 focus-within:outline-yellow-400 flex items-center justify-center transition shadow-inner"
            >
              <input
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
                placeholder="•"
                className="w-full h-full text-center bg-transparent text-white text-2xl font-bold font-['Poppins'] focus:outline-none placeholder:text-white/20"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs font-['Inter']">
          <span className="text-white/50">Didn&apos;t receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={seconds > 0 || isResending}
            className={`flex items-center gap-1 font-medium transition cursor-pointer ${
              seconds > 0
                ? 'text-yellow-400/60 cursor-not-allowed'
                : 'text-yellow-400 hover:text-yellow-300 hover:underline'
            }`}
          >
            {isResending && <RefreshCw className="w-3 h-3 animate-spin" />}
            {seconds > 0 ? `Resend in (${formatTimer(seconds)})` : 'Resend Code'}
          </button>
        </div>

        <button
          type="submit"
          disabled={!isComplete || isSubmitting}
          className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/30 text-black text-sm font-semibold font-['Inter'] rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/10 active:scale-[0.99] mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Verifying Code…' : 'Verify Code'}
        </button>
      </form>

      <div className="pt-4 pb-2 text-center text-xs text-stone-500 font-['Inter']">
        Cashier Terminal &bull; Tavonza AI Authentication
      </div>
    </div>
  );
}
