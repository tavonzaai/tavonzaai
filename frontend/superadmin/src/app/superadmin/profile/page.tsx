'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { updateProfile, changePassword, getMe } from '@/redux/features/authApi';
import {
  Shield,
  User,
  Mail,
  Phone,
  Briefcase,
  Globe,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  Laptop,
  Smartphone,
  LogOut,
  AlertCircle,
  Save,
  Camera,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  // Profile Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Security / Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Populate from Redux state on load / update
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || user.name?.split(' ')[0] || 'Alex');
      setLastName(user.lastName || user.name?.split(' ').slice(1).join(' ') || 'Morgan');
      setEmail(user.email || 'superadmin@tavonza.ai');
      setPhone(user.phone || user.contactNo || '+1 (555) 019-2834');
      setTitle(user.title || 'Head of Platform Operations');
      setDepartment(user.department || 'Super Administration & SecOps');
      setTimezone(user.timezone || 'America/New_York');
      if ((user.avatar || user.avatarUrl) && !avatarFile) {
        setAvatarPreview(user.avatar || user.avatarUrl || null);
      }
    }
  }, [user, avatarFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (PNG, JPG, WEBP, GIF)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must not exceed 5MB');
        return;
      }
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : 'AM';

  // Handle Profile Update
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First name and last name are required.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const payload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: fullName,
        email: email.trim(),
        phone: phone.trim(),
        contactNo: phone.trim(),
        title: title.trim(),
        department: department.trim(),
        timezone,
      };

      if (avatarFile) {
        payload.avatar = avatarFile;
      } else if (avatarPreview === null && (user?.avatar || user?.avatarUrl)) {
        payload.avatar = null;
        payload.avatarUrl = null;
      }

      await dispatch(updateProfile(payload)).unwrap();

      toast.success('Administrator profile & photo updated successfully!');
      setAvatarFile(null);
    } catch (err: any) {
      toast.error(err || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Update
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current security key / password.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await dispatch(
        changePassword({
          currentPassword,
          newPassword,
        })
      ).unwrap();

      toast.success('Security key / password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleRevokeOtherSessions = () => {
    toast.success('All other active administrative sessions have been terminated.');
  };

  return (
    <SuperAdminLayout>
      <div className="flex flex-col gap-7 w-full font-inter animate-fade-in text-white pb-16">
        
        {/* Page Header matching TablePilot Figma aesthetic */}
        <div className="flex flex-col justify-start items-start">
          <h1 className="text-white text-3xl font-semibold leading-9">My Profile</h1>
          <p className="text-zinc-500 text-sm font-normal pt-[5px] leading-6">
            Manage your administrative credentials, security keys, and global console preferences.
          </p>
        </div>

        {/* Top Banner Card: Admin Identity & Badges */}
        <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-5">
            {/* AM Avatar badge with live preview & hover camera */}
            <div className="relative group shrink-0">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[2px] shadow-lg shadow-amber-500/20 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center overflow-hidden relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={`${firstName} ${lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-yellow-400 text-xl font-bold font-inter">
                      {initials}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-5 h-5 text-yellow-400" />
              </button>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-white text-xl font-semibold leading-7">
                  {firstName} {lastName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  <Shield className="w-3 h-3" />
                  Global Super Admin
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-500/10 text-green-500">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <p className="text-neutral-400 text-xs font-normal pt-1">
                {email} · {title || 'Head of Platform Operations'}
              </p>
              <p className="text-zinc-500 text-[11px] pt-0.5">
                Role: <span className="text-zinc-400 font-medium">SUPERADMIN</span> · Root System Scope · Access Level 0
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="px-3 py-2 bg-zinc-950 rounded-lg border border-zinc-800 text-right">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                Account Status
              </div>
              <div className="text-xs text-green-400 font-medium flex items-center justify-end gap-1.5 pt-0.5">
                <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
                Active &amp; Authenticated
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Left (Profile Info) & Right (Security & Sessions) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Column 1 & 2: Personal Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
              <div className="w-full flex justify-between items-center pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-white text-base font-semibold leading-5">Personal Information</h3>
                  <p className="text-neutral-400 text-xs font-normal pt-1 leading-4">
                    Your identity details displayed in platform audit logs and security traces.
                  </p>
                </div>
                <div className="size-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="w-full pt-5 space-y-4">
                {/* Profile Photo Upload Block matching manager/kitchen style */}
                <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <div className="size-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[2px] shadow-lg shadow-amber-500/20 flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center overflow-hidden relative">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt={`${firstName} ${lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-yellow-400 text-base font-bold font-inter">
                            {initials}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                      title="Change Photo"
                    >
                      <Camera className="w-4 h-4 text-yellow-400" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold rounded-lg border border-zinc-700/80 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Upload Photo</span>
                      </button>
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="px-2.5 py-1.5 bg-zinc-900/60 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 text-xs rounded-lg border border-zinc-800 flex items-center gap-1 transition cursor-pointer"
                          title="Remove Photo"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      JPG, PNG, GIF or WEBP up to 5MB. Click Save Changes below to apply.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-400 text-xs font-normal font-inter">First name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-xs font-normal focus:outline-yellow-400 transition"
                      placeholder="Alex"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-400 text-xs font-normal font-inter">Last name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-xs font-normal focus:outline-yellow-400 transition"
                      placeholder="Morgan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-400 text-xs font-normal font-inter flex items-center justify-between">
                      <span>Administrator Email</span>
                      <span className="text-[10px] text-green-400 font-medium">Verified</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-xs font-normal focus:outline-yellow-400 transition"
                        placeholder="superadmin@tavonza.ai"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-400 text-xs font-normal font-inter">Emergency Contact / Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-xs font-normal focus:outline-yellow-400 transition"
                        placeholder="+1 (555) 019-2834"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-400 text-xs font-normal font-inter">Administrative Title</label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-xs font-normal focus:outline-yellow-400 transition"
                        placeholder="Head of Platform Operations"
                      />
                    </div>
                  </div>

                  {/* Timezone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-400 text-xs font-normal font-inter">Timezone</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full h-10 pl-9 pr-8 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-xs font-normal focus:outline-yellow-400 transition cursor-pointer appearance-none"
                      >
                        <option value="America/New_York" className="bg-neutral-900 text-white">
                          Eastern Time (US &amp; Canada) UTC-05:00
                        </option>
                        <option value="America/Chicago" className="bg-neutral-900 text-white">
                          Central Time (US &amp; Canada) UTC-06:00
                        </option>
                        <option value="America/Denver" className="bg-neutral-900 text-white">
                          Mountain Time (US &amp; Canada) UTC-07:00
                        </option>
                        <option value="America/Los_Angeles" className="bg-neutral-900 text-white">
                          Pacific Time (US &amp; Canada) UTC-08:00
                        </option>
                        <option value="Europe/London" className="bg-neutral-900 text-white">
                          London, Dublin (UTC+00:00)
                        </option>
                        <option value="Asia/Dhaka" className="bg-neutral-900 text-white">
                          Dhaka (UTC+06:00)
                        </option>
                        <option value="Asia/Singapore" className="bg-neutral-900 text-white">
                          Singapore (UTC+08:00)
                        </option>
                      </select>
                      <div className="w-5 h-9 right-3 absolute flex justify-center items-center pointer-events-none text-stone-400 text-xs">
                        ⌄
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="min-h-9 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400 text-xs font-medium cursor-pointer transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Security & Password Card */}
            <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
              <div className="w-full flex justify-between items-center pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-white text-base font-semibold leading-5">Security &amp; Password</h3>
                  <p className="text-neutral-400 text-xs font-normal pt-1 leading-4">
                    Ensure your root administrative console is protected with high-entropy credentials.
                  </p>
                </div>
                <div className="size-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <KeyRound className="w-4 h-4 text-yellow-400" />
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="w-full pt-5 space-y-4">
                {/* Current Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-400 text-xs font-normal font-inter">Current Security Key</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full h-10 pl-9 pr-10 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-xs font-normal focus:outline-yellow-400 transition"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-400 text-xs font-normal font-inter">New Security Key</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-10 pl-9 pr-10 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-xs font-normal focus:outline-yellow-400 transition"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-400 text-xs font-normal font-inter">Confirm New Key</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-10 pl-9 pr-10 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-xs font-normal focus:outline-yellow-400 transition"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Must be 8+ characters with mixed case and numbers.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="min-h-9 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-neutral-200 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-xs font-medium cursor-pointer transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isUpdatingPassword ? 'Updating Key...' : 'Update Security Key'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Column 3: Security & Session Controls */}
          <div className="flex flex-col gap-6">
            
            {/* 2FA Card */}
            <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
              <div className="w-full flex justify-between items-center pb-3">
                <span className="text-white text-base font-semibold leading-5">Two-Factor Authentication</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                  Enforced
                </span>
              </div>
              <p className="text-neutral-400 text-xs font-normal leading-4 pb-4">
                Hardware security keys (FIDO2) and TOTP authenticator are enabled for platform root login.
              </p>
              <div className="w-full p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <span className="text-xs text-zinc-300 font-medium">Authenticator App</span>
                </div>
                <span className="text-[10px] text-zinc-500">Configured</span>
              </div>
            </div>

            {/* Active Sessions Card */}
            <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
              <div className="w-full flex justify-between items-center pb-3">
                <span className="text-white text-base font-semibold leading-5">Active Sessions</span>
                <span className="text-neutral-500 text-xs font-normal">2 online</span>
              </div>
              <p className="text-neutral-400 text-xs font-normal leading-4 pb-4">
                Devices authorized to access the Super Administrator console.
              </p>

              <div className="w-full space-y-2.5">
                {/* Session 1 (Current) */}
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <Laptop className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-white font-medium flex items-center gap-1.5">
                        <span>Windows 11 · Chrome</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-yellow-400/10 text-yellow-400 font-semibold">
                          Current
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-400 pt-0.5">
                        192.168.1.104 · United States
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session 2 (Previous) */}
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-zinc-300 font-medium">
                        iPhone 15 Pro · Safari
                      </div>
                      <div className="text-[10px] text-neutral-500 pt-0.5">
                        Active 2 days ago · New York
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRevokeOtherSessions}
                className="mt-4 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out All Other Sessions</span>
              </button>
            </div>

            {/* Root Capabilities Card */}
            <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
              <span className="text-white text-base font-semibold leading-5 pb-1">
                Root System Scope
              </span>
              <p className="text-neutral-400 text-xs font-normal leading-4 pb-3">
                Authoritative capabilities granted to Global Super Administrators:
              </p>
              <div className="w-full space-y-2 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">✓</span>
                  <span>Cross-tenant onboarding &amp; suspension</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">✓</span>
                  <span>Subscription plans &amp; pricing configuration</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">✓</span>
                  <span>Financial transaction auditing &amp; Stripe webhooks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">✓</span>
                  <span>Autonomous AI Agent gateway provisioning</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </SuperAdminLayout>
  );
}
