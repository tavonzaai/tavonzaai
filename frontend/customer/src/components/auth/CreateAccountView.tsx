'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAppDispatch } from '@/redux/store';
import { registerCustomer } from '@/redux/features/authApi';
import { setCookie } from '@/redux/api/baseApi';
import { setPendingEmail } from '@/redux/slices/authSlice';

interface CreateAccountViewProps {
  onAccountCreated: (email?: string) => void;
  onGoBackToLogin: (email?: string) => void;
}

export default function CreateAccountView({
  onAccountCreated,
  onGoBackToLogin,
}: CreateAccountViewProps) {
  const dispatch = useAppDispatch();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+855');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictEmail, setConflictEmail] = useState<string | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);

  // Realtime password checks matching backend
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsTimeout(false);

    if (!acceptedTerms) {
      setError('Please accept the terms and conditions to continue.');
      return;
    }

    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }

    if (!lastName.trim()) {
      setError('Please enter your last name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Client-side duplicate check: If this email was already confirmed to exist on the server
    if (conflictEmail && cleanEmail === conflictEmail) {
      return;
    }

    if (!isPasswordValid) {
      setError('Password must be at least 8 characters long, contain an uppercase letter, and a number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    const fullPhone = phone.trim() ? `${countryCode}${phone.trim()}` : undefined;

    setIsSubmitting(true);
    setConflictEmail(null);

    try {
      const res: any = await dispatch(
        registerCustomer({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: cleanEmail,
          phone: fullPhone,
          password,
        })
      ).unwrap();

      setCookie('tavonza_signup_email', cleanEmail);
      dispatch(setPendingEmail(cleanEmail));
      setIsSubmitting(false);
      onAccountCreated(cleanEmail);
    } catch (err: any) {
      setIsSubmitting(false);

      const status = err?.status || err?.statusCode;
      const errorMsg = String(err?.message || (typeof err === 'string' ? err : ''));

      const isConflictError =
        status === 409 ||
        err?.isConflict === true ||
        errorMsg.toLowerCase().includes('already exists') ||
        errorMsg.toLowerCase().includes('conflict');

      const isTimeoutError =
        status === 504 ||
        err?.isTimeout === true ||
        errorMsg.toLowerCase().includes('timeout') ||
        errorMsg.includes('504');

      if (isConflictError) {
        setConflictEmail(cleanEmail);
        setCookie('tavonza_signup_email', cleanEmail);
        setError(null);
        return;
      }

      if (isTimeoutError) {
        setIsTimeout(true);
        setCookie('tavonza_signup_email', cleanEmail);
        setError(null);
        return;
      }

      setError(errorMsg || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col justify-between min-h-[760px] p-4 text-white relative font-sans">
      {/* Back Button Header */}
      <div className="w-full flex items-center justify-between pt-2 pb-4">
        <button
          type="button"
          onClick={() => onGoBackToLogin(conflictEmail || email || undefined)}
          className="flex items-center gap-1.5 text-white text-xs font-['Poppins'] hover:text-yellow-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Log In</span>
        </button>
      </div>

      {/* Main Title Header */}
      <div className="w-full flex flex-col gap-1.5 mb-4">
        <h2 className="text-xl font-semibold text-white font-['Inter']">Create Account</h2>
        <p className="text-xs text-white/60 font-['Poppins'] leading-relaxed">
          Create an account to order from your table, customize dishes, and earn rewards
        </p>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 my-auto">
        {/* 409 Conflict Banner: Duplicate Email Warning */}
        {conflictEmail && (
          <div className="p-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-white font-['Inter'] flex flex-col gap-3 shadow-lg shadow-amber-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-300">ইমেইলটি ইতিমধ্যে ব্যবহৃত হচ্ছে</h4>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  An account with <strong className="text-white underline">{conflictEmail}</strong> already exists. You can log in directly without registering again.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setCookie('tavonza_signup_email', conflictEmail);
                  onGoBackToLogin(conflictEmail);
                }}
                className="flex-1 h-9 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer shadow-md shadow-amber-500/10"
              >
                <span>লগইন করুন (Log In)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setConflictEmail(null);
                  setEmail('');
                }}
                className="px-3 h-9 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-medium rounded-xl transition cursor-pointer"
              >
                অন্য ইমেইল দিন
              </button>
            </div>
          </div>
        )}

        {/* 504 Gateway Timeout Banner */}
        {isTimeout && (
          <div className="p-4 bg-orange-500/15 border border-orange-500/40 rounded-2xl text-white font-['Inter'] flex flex-col gap-3 shadow-lg shadow-orange-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-orange-300">সার্ভার সাড়ায় বিলম্ব হচ্ছে (504 Timeout)</h4>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  The server took longer than expected to confirm. Your account or verification code may already be created. You can try logging in now.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const target = email.trim().toLowerCase();
                  if (target) setCookie('tavonza_signup_email', target);
                  onGoBackToLogin(target);
                }}
                className="flex-1 h-9 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
              >
                <span>লগইন করে দেখুন (Log In)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  setIsTimeout(false);
                  handleSubmit(e);
                }}
                className="px-3 h-9 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-medium rounded-xl transition cursor-pointer"
              >
                পুনরায় চেষ্টা
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter'] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* First & Last Name Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs text-white/90 font-['Inter'] font-medium">First Name</label>
            <div className="w-full h-11 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center transition">
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                style={{ WebkitBoxShadow: '0 0 0px 1000px #0a0a0a inset', WebkitTextFillColor: '#ffffff' }}
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-['Inter'] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs text-white/90 font-['Inter'] font-medium">Last Name</label>
            <div className="w-full h-11 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center transition">
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                style={{ WebkitBoxShadow: '0 0 0px 1000px #0a0a0a inset', WebkitTextFillColor: '#ffffff' }}
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-['Inter'] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/90 font-['Inter'] font-medium">Email Address</label>
          <div
            className={`w-full h-11 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] flex items-center transition ${
              conflictEmail && email.trim().toLowerCase() === conflictEmail
                ? 'outline-amber-400/80'
                : 'outline-white/10 focus-within:outline-yellow-400'
            }`}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (conflictEmail && e.target.value.trim().toLowerCase() !== conflictEmail) {
                  setConflictEmail(null);
                }
              }}
              placeholder="customer@example.com"
              style={{ WebkitBoxShadow: '0 0 0px 1000px #0a0a0a inset', WebkitTextFillColor: '#ffffff' }}
              className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-['Inter'] focus:outline-none"
            />
          </div>
          {/* Client-side Live Duplicate Alert Helper */}
          {conflictEmail && email.trim().toLowerCase() === conflictEmail && (
            <div className="flex items-center justify-between text-[11px] text-amber-400 font-['Inter'] px-1 pt-0.5 animate-in fade-in">
              <span>⚠️ এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হচ্ছে</span>
              <button
                type="button"
                onClick={() => {
                  setCookie('tavonza_signup_email', conflictEmail);
                  onGoBackToLogin(conflictEmail);
                }}
                className="underline hover:text-amber-300 font-semibold cursor-pointer"
              >
                লগইন করুন →
              </button>
            </div>
          )}
        </div>

        {/* Phone Number (Optional) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/90 font-['Inter'] font-medium">Phone</label>
            <span className="text-[10px] text-white/40">Optional</span>
          </div>
          <div className="w-full flex items-center gap-2">
            <div className="shrink-0 w-28 h-11 px-2.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-transparent text-xs text-white/80 font-['Inter'] focus:outline-none cursor-pointer w-full"
              >
                <option value="+855" className="bg-neutral-900 text-white">+855 (KH)</option>
                <option value="+1" className="bg-neutral-900 text-white">+1 (US)</option>
                <option value="+880" className="bg-neutral-900 text-white">+880 (BD)</option>
                <option value="+44" className="bg-neutral-900 text-white">+44 (UK)</option>
                <option value="+61" className="bg-neutral-900 text-white">+61 (AU)</option>
              </select>
            </div>
            <div className="flex-1 min-w-0 h-11 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center transition">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={15}
                name="phone"
                id="phone-number-input"
                autoComplete="off"
                value={phone}
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
                    !e.ctrlKey &&
                    !e.metaKey
                  ) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="phone number"
                style={{ WebkitBoxShadow: '0 0 0px 1000px #0a0a0a inset', WebkitTextFillColor: '#ffffff' }}
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-['Inter'] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/90 font-['Inter'] font-medium">Password</label>
          <div className="w-full h-11 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center justify-between transition">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              style={{ WebkitBoxShadow: '0 0 0px 1000px #0a0a0a inset', WebkitTextFillColor: '#ffffff' }}
              className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-['Inter'] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/60 hover:text-white p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Validation Hints */}
          {password.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[11px] font-['Inter']">
              <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <Check className={`w-3 h-3 ${hasMinLength ? 'stroke-[3]' : 'opacity-40'}`} />
                8+ chars
              </span>
              <span className={`flex items-center gap-1 ${hasUpperCase ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <Check className={`w-3 h-3 ${hasUpperCase ? 'stroke-[3]' : 'opacity-40'}`} />
                1 uppercase
              </span>
              <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <Check className={`w-3 h-3 ${hasNumber ? 'stroke-[3]' : 'opacity-40'}`} />
                1 number
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/90 font-['Inter'] font-medium">Confirm Password</label>
          <div className="w-full h-11 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 focus-within:outline-yellow-400 flex items-center justify-between transition">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              style={{ WebkitBoxShadow: '0 0 0px 1000px #0a0a0a inset', WebkitTextFillColor: '#ffffff' }}
              className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-['Inter'] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-white/60 hover:text-white p-1 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Terms and Condition Checkbox */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setAcceptedTerms(!acceptedTerms)}
            className={`w-5 h-5 rounded-[4px] outline outline-1 outline-offset-[-1px] outline-white/80 flex items-center justify-center transition cursor-pointer ${
              acceptedTerms ? 'bg-yellow-400 text-black' : 'bg-neutral-950 text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
          <button
            type="button"
            onClick={() => setAcceptedTerms(!acceptedTerms)}
            className="text-xs text-white/80 hover:text-yellow-400 font-['Poppins'] cursor-pointer transition text-left"
          >
            I accept the <span className="text-yellow-400 underline">Terms and Conditions</span>
          </button>
        </div>

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={isSubmitting || !acceptedTerms}
          className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/40 text-black text-sm font-semibold font-['Inter'] rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/10 active:scale-[0.99] mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>

      {/* Bottom Go Back link */}
      <div className="pt-4 pb-2 text-center">
        <span className="text-stone-400 text-xs font-['Inter']">Already have an account? </span>
        <button
          type="button"
          onClick={() => onGoBackToLogin(conflictEmail || email || undefined)}
          className="text-yellow-400 text-xs font-['Inter'] font-semibold hover:text-yellow-300 underline transition cursor-pointer ml-1"
        >
          Log In
        </button>
      </div>
    </div>
  );
}
