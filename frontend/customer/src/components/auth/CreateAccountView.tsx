'use client';

import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { rawUserApi } from '@/redux/features/userApi';
import { rawAuthApi } from '@/redux/features/authApi';
import { setCookie, setAuthToken } from '@/redux/api/baseApi';
import { useAppDispatch } from '@/redux/store';
import { setUser } from '@/redux/slices/authSlice';

interface CreateAccountViewProps {
  onAccountCreated: () => void;
  onGoBackToLogin: () => void;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptedTerms) {
      setError('Please accept the terms and conditions to continue.');
      return;
    }

    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const contactNo = phone.trim() ? `${countryCode}${phone.trim()}` : undefined;

    // Save basic signup state in cookies (NO localStorage)
    if (typeof window !== 'undefined') {
      setCookie('tavonza_signup_email', email.trim());
      setCookie('tavonza_signup_name', fullName);
      if (contactNo) setCookie('tavonza_signup_phone', contactNo);
    }

    // Validate password
    if (!password) {
      setError('Please create a password for your account.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    /* =========================================================================
     * [DEV MODE]: STRICT REGISTRATION DISABLED - AUTO SUCCESS
     * To re-enable strict backend registration, comment out the bypass below
     * and uncomment the ORIGINAL PRODUCTION REGISTRATION BLOCK.
     * ========================================================================= */
    const devCustomer = {
      id: 'cust_dev_' + Math.random().toString(36).substring(2, 9),
      name: fullName,
      email: email.trim(),
      contactNo,
      role: 'CUSTOMER',
    };
    setAuthToken('dev_customer_token_' + Date.now());
    dispatch(setUser(devCustomer));
    setIsSubmitting(false);
    onAccountCreated();

    /* =========================================================================
     * [ORIGINAL PRODUCTION REGISTRATION CODE - PRESERVED FOR FUTURE USE]
     * Uncomment the block below to re-enable real backend customer creation:
     * =========================================================================
    setIsSubmitting(true);
    try {
      const newUser = await rawUserApi.createCustomer({
        name: fullName,
        email: email.trim(),
        password: password,
        contactNo,
        role: 'CUSTOMER',
        customer: {},
      });

      // Automatically sign in to establish session tokens in cookies
      try {
        await rawAuthApi.login({
          email: email.trim(),
          password: password,
        });
      } catch {
        // Continue if login response already handled
      }

      dispatch(setUser(newUser as any));
      setIsSubmitting(false);
      onAccountCreated();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to create customer account. Please try again.');
    }
    * ========================================================================= */
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col justify-between min-h-[760px] p-4 text-white relative font-sans">
      {/* Back Button Header */}
      <div className="w-full flex items-center justify-between pt-2 pb-4">
        <button
          type="button"
          onClick={onGoBackToLogin}
          className="flex items-center gap-1.5 text-white text-xs font-['Poppins'] hover:text-yellow-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Title Header */}
      <div className="w-full flex flex-col gap-1.5 mb-4">
        <h2 className="text-xl font-semibold text-white font-['Inter']">Create Account</h2>
        <p className="text-xs text-white/50 font-['Poppins'] leading-relaxed">
          Get the best out of Tavonza AI by creating an account
        </p>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 my-auto">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter'] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* First Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-white font-['Inter']">First Name</label>
          <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center">
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              className="w-full bg-transparent text-xs text-white placeholder:text-zinc-100/50 font-['Inter'] focus:outline-none"
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-white font-['Inter']">Last Name</label>
          <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center">
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              className="w-full bg-transparent text-xs text-white placeholder:text-zinc-100/50 font-['Inter'] focus:outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-white font-['Inter']">Email</label>
          <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@gmail.com"
              className="w-full bg-transparent text-xs text-white placeholder:text-zinc-100/50 font-['Inter'] focus:outline-none"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-white font-['Inter']">Phone</label>
          <div className="w-full flex items-center gap-2">
            {/* Country Code Select */}
            <div className="w-24 h-12 px-3 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-transparent text-xs text-white/70 font-['Inter'] focus:outline-none cursor-pointer"
              >
                <option value="+855" className="bg-neutral-900 text-white">
                  +855
                </option>
                <option value="+1" className="bg-neutral-900 text-white">
                  +1
                </option>
                <option value="+880" className="bg-neutral-900 text-white">
                  +880
                </option>
                <option value="+44" className="bg-neutral-900 text-white">
                  +44
                </option>
              </select>
            </div>

            {/* Phone Number Input */}
            <div className="flex-1 h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center">
              <input
                type="number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="123 456 789"
                className="w-full bg-transparent text-xs text-white/80 placeholder:text-white/40 font-['Inter'] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-white font-['Inter']">Password</label>
          <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
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

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-white font-['Inter']">Confirm Password</label>
          <div className="w-full h-12 px-3.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="w-full bg-transparent text-xs text-white placeholder:text-zinc-100/50 font-['Inter'] focus:outline-none"
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
            className={`w-5 h-5 rounded-[4px] outline outline-1 outline-offset-[-1px] outline-white/90 flex items-center justify-center transition cursor-pointer ${
              acceptedTerms ? 'bg-yellow-400 text-black' : 'bg-neutral-950 text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
          <button
            type="button"
            onClick={() => setAcceptedTerms(!acceptedTerms)}
            className="text-xs text-white/80 font-['Poppins'] cursor-pointer hover:text-yellow-300 transition"
          >
            I accept terms and conditions
          </button>
        </div>

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={isSubmitting || !acceptedTerms}
          className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/40 text-black text-sm font-medium font-['Inter'] rounded-[100px] flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/10 active:scale-[0.99] mt-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      {/* Bottom Go Back link */}
      <div className="pt-4 pb-2 text-center">
        <span className="text-slate-400 text-sm font-['Inter']">Already have an account? </span>
        <button
          type="button"
          onClick={onGoBackToLogin}
          className="text-yellow-400 text-sm font-['Inter'] font-semibold hover:text-yellow-300 underline transition cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

