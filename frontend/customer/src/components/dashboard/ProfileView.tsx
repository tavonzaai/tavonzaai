'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  Bell,
  Lock,
  CreditCard,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  MapPin,
  Shield,
  SlidersHorizontal,
  LogOut,
  Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { logoutUser, changePassword, getMe } from '@/redux/features/authApi';
import { updateMe } from '@/redux/features/userApi';
import { clearAuthError } from '@/redux/slices/authSlice';

export default function ProfileView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error, successMessage } = useAppSelector(
    (state) => state.auth
  );

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'password' | 'delivery'>('profile');
  
  // Form State
  const [fullName, setFullName] = useState(user?.name || user?.firstName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.contactNo || user?.phone || '');
  const [city, setCity] = useState('London');

  // Toggle Switches
  const [orderStatusNotif, setOrderStatusNotif] = useState(true);
  const [promosNotif, setPromosNotif] = useState(true);

  // Passwords
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delivery & Card
  const [streetAddress, setStreetAddress] = useState('18 Rue du Faubourg');
  const [zipCode, setZipCode] = useState('75008');
  const [cardHolder, setCardHolder] = useState(fullName || 'Avery Morgan');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 8841');
  const [expDate, setExpDate] = useState('12/28');
  const [cvv, setCvv] = useState('•••');

  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      if (user.name || user.firstName) setFullName(user.name || user.firstName || '');
      if (user.email) setEmail(user.email);
      if (user.contactNo || user.phone) setPhone(user.contactNo || user.phone || '');
    }
  }, [user]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    dispatch(clearAuthError());
    const res = await dispatch(
      changePassword({ oldPassword: currentPassword, newPassword })
    );
    if (changePassword.fulfilled.match(res)) {
      setSavedSuccessMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSavedSuccessMsg(null), 3000);
    }
  };

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleSaveChanges = async (sectionName: string) => {
    if (sectionName === 'Profile' || sectionName === 'Personal Information') {
      setIsUpdatingProfile(true);
      try {
        const res = await dispatch(updateMe({ name: fullName, contactNo: phone }));
        setIsUpdatingProfile(false);
        if (updateMe.fulfilled.match(res)) {
          setSavedSuccessMsg('Profile updated successfully!');
          setTimeout(() => setSavedSuccessMsg(null), 3000);
        } else {
          alert((res.payload as string) || 'Failed to update profile');
        }
      } catch (e: any) {
        setIsUpdatingProfile(false);
        alert(e.message || 'Failed to update profile');
      }
      return;
    }
    setSavedSuccessMsg(`${sectionName} updated successfully!`);
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  return (
    <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto min-h-screen bg-black text-white flex flex-col justify-between relative overflow-x-hidden font-sans pb-24 pt-2">

      <div className="flex flex-col gap-5 px-5 pt-3">
        {/* 1. Account Settings Header Banner */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-white font-['Inter']">Account Settings</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-['Inter']">
              Manage your personal details, notification alerts, password, and delivery/card information.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-xl text-xs font-medium text-red-300 flex items-center gap-1.5 transition shrink-0 cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 font-['Inter']">
            {error}
          </div>
        )}

        {savedSuccessMsg && (
          <div className="p-3 bg-yellow-400/20 border border-yellow-400/40 rounded-xl text-xs text-yellow-300 flex items-center gap-2 animate-in fade-in duration-300">
            <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        {/* 2. Top Segmented Sub-Nav Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-['Poppins'] whitespace-nowrap transition border ${
              activeTab === 'profile'
                ? 'bg-amber-50 text-amber-500 border-amber-400 font-semibold shadow-md'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-['Poppins'] whitespace-nowrap transition border ${
              activeTab === 'notifications'
                ? 'bg-amber-50 text-amber-500 border-amber-400 font-semibold shadow-md'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-['Poppins'] whitespace-nowrap transition border ${
              activeTab === 'password'
                ? 'bg-amber-50 text-amber-500 border-amber-400 font-semibold shadow-md'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-['Poppins'] whitespace-nowrap transition border ${
              activeTab === 'delivery'
                ? 'bg-amber-50 text-amber-500 border-amber-400 font-semibold shadow-md'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            Delivery & Card
          </button>
        </div>

        {/* 3. Personal Information Card */}
        <div className="w-full bg-slate-900 border border-blue-950 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 text-lg font-bold shrink-0">
              AM
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-base font-semibold text-white font-['Inter']">Personal Information</h3>
              <p className="text-xs text-zinc-400 font-['Inter']">
                Update your name, contact details, and default location
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 font-['Inter']">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-10 px-3 bg-neutral-800 border border-stone-700 rounded-lg text-sm text-amber-50 font-['Inter'] focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 font-['Inter']">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 bg-neutral-800 border border-stone-700 rounded-lg text-sm text-amber-50 font-['Inter'] focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 font-['Inter']">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 bg-neutral-800 border border-stone-700 rounded-lg text-sm text-amber-50 font-['Inter'] focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* City / Region */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 font-['Inter']">City / Region</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 px-3 bg-neutral-800 border border-stone-700 rounded-lg text-sm text-amber-50 font-['Inter'] focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <button
            onClick={() => handleSaveChanges('Personal Information')}
            className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 text-sm font-semibold rounded-xl flex items-center justify-center transition shadow-md shadow-yellow-500/10 mt-1"
          >
            Save Changes
          </button>
        </div>

        {/* 4. Notification Preferences Card */}
        <div className="w-full bg-slate-900 border border-blue-950 rounded-2xl p-4 flex flex-col gap-3.5 shadow-xl">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-semibold text-white font-['Inter']">Notification Preferences</h3>
            <p className="text-xs text-zinc-400 font-['Inter']">
              Choose which updates you want to receive about your reservations and meals
            </p>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-medium text-white font-['Inter']">
              Order & Reservation Status Updates
            </span>
            <button
              onClick={() => setOrderStatusNotif(!orderStatusNotif)}
              className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                orderStatusNotif ? 'bg-yellow-400 justify-end' : 'bg-neutral-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* 5. Change Password Card */}
        <form onSubmit={handleChangePassword} className="w-full bg-slate-900 border border-blue-950 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-semibold text-white font-['Inter']">Change Password</h3>
            <p className="text-xs text-zinc-400 font-['Inter']">
              Ensure your account is using a strong and secure password
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Current Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 font-['Inter']">Current Password *</label>
              <div className="w-full h-11 px-3 bg-neutral-800 border border-neutral-700 rounded-xl flex items-center justify-between">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-transparent text-sm text-white font-['Hanken_Grotesk'] focus:outline-none w-full pr-2"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-amber-100 hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 font-['Inter']">New Password *</label>
              <div className="w-full h-11 px-3 bg-neutral-800 border border-neutral-700 rounded-xl flex items-center justify-between">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-transparent text-sm text-white font-['Hanken_Grotesk'] focus:outline-none w-full pr-2"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-amber-100 hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 font-['Inter']">Confirm Password *</label>
              <div className="w-full h-11 px-3 bg-neutral-800 border border-neutral-700 rounded-xl flex items-center justify-between">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-transparent text-sm text-white font-['Hanken_Grotesk'] focus:outline-none w-full pr-2"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-amber-100 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-900 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-yellow-500/10 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>

        {/* 6. Delivery Address & Payment Card Information Card */}
        <div className="w-full bg-slate-900 border border-blue-950 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
          {/* Delivery Address Header */}
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-semibold text-white font-['Inter']">Delivery Address</h3>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 font-['Inter']">Street Address*</label>
              <input
                type="text"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full h-11 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white font-['Inter'] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 font-['Inter']">Zip Code*</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full h-11 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white font-['Inter'] focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Card Information Header */}
          <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800">
            <h3 className="text-base font-semibold text-white font-['Inter']">Payment Card Information</h3>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 font-['Inter']">Cardholder Name*</label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="w-full h-11 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white font-['Inter'] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 font-['Inter']">Card Number*</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full h-11 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white font-['Inter'] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400 font-['Inter']">Expiration Date*</label>
                <input
                  type="text"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full h-11 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white font-['Inter'] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400 font-['Inter']">CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full h-11 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white font-['Inter'] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSaveChanges('Delivery & Payment Details')}
            className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 text-sm font-semibold rounded-xl flex items-center justify-center transition shadow-md shadow-yellow-500/10 mt-2"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

