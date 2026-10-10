'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { getMe } from '@/redux/features/authApi';
import { rawUserApi } from '@/redux/features/userApi';
import { setUser } from '@/redux/slices/authSlice';
import { User, Mail, Phone, Camera, Check, Loader2, Save, ArrowLeft, ChefHat, Building2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileView({ onBack }: { onBack?: () => void }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ');
      setFirstName(user.firstName || parts[0] || '');
      setLastName(user.lastName || parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phone || user.contactNo || '');
      setAvatarPreview(user.avatarUrl || user.avatar || null);
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      // Step 1 & 2: 2-Step Avatar Upload + Profile Update via userApi
      const updatedUser = await rawUserApi.updateMe({
        name: fullName,
        contactNo: phone.trim(),
        avatar: avatarFile || avatarPreview || undefined,
      });

      if (updatedUser) {
        dispatch(setUser({ ...user, ...updatedUser }));
      }

      toast.success('Kitchen Staff profile updated successfully!', {
        description: 'Your profile picture and account information have been saved.',
      });
    } catch (err: any) {
      console.error('Failed to update kitchen profile:', err);
      toast.error(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignedPermissions: string[] =
    user?.assignments?.[0]?.permissions ||
    user?.permissions ||
    ['MANAGE_KITCHEN_STATION', 'VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'MANAGE_INVENTORY'];

  const branchName =
    user?.branchName ||
    user?.assignments?.[0]?.branchName ||
    (user?.assignments?.[0] as any)?.branch?.name ||
    'Active Branch';

  const branchId =
    user?.branchId ||
    user?.assignments?.[0]?.branchId ||
    (user?.assignments?.[0] as any)?.branch?.id ||
    '—';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full animate-fadeIn">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-['Inter'] flex items-center gap-2">
              <ChefHat className="w-7 h-7 text-amber-400" />
              Kitchen Profile & Account
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 font-['Inter']">
              Manage head chef credentials, kitchen display avatar, and contact info
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar & Summary Card */}
        <div className="p-6 bg-zinc-900/90 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center gap-6 shadow-lg">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 overflow-hidden shadow-xl shadow-amber-500/10">
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-amber-400" />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 rounded-full shadow-lg transition cursor-pointer"
              title="Upload new profile picture"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-white font-['Inter']">
              {firstName || lastName ? `${firstName} ${lastName}`.trim() : user?.name || 'Marco Vance'}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="px-2.5 py-0.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                {user?.role || 'KITCHEN_STAFF'}
              </span>
              <span className="px-2.5 py-0.5 bg-blue-400/10 border border-blue-400/20 text-blue-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                {user?.globalRole || 'STAFF'}
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Station Active
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono pt-1">
              ID: <span className="text-zinc-300">{user?.id || '—'}</span>
            </p>
          </div>
        </div>

        {/* Branch & Staff Capabilities Box */}
        <div className="p-6 bg-zinc-900/90 rounded-2xl border border-white/10 space-y-4 shadow-lg">
          <h3 className="text-base font-semibold text-white font-['Inter'] border-b border-white/10 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            Kitchen Station & Branch Assignment
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-zinc-950 rounded-xl border border-white/10 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Branch Name</span>
              <span className="text-amber-300 font-semibold text-sm block">{branchName}</span>
              <span className="text-zinc-500 font-mono text-[10px] truncate block">ID: {branchId}</span>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-white/10 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Account Created</span>
              <span className="text-zinc-200 font-medium text-sm block">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
              </span>
              <span className="text-zinc-500 text-[10px] block">Registered Staff User</span>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-white/10 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Assignment Status</span>
              <span className="text-emerald-400 font-semibold text-sm flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Station Active
              </span>
              <span className="text-zinc-500 font-mono text-[10px] truncate block">
                ID: {user?.assignments?.[0]?.id || '—'}
              </span>
            </div>
          </div>

          {/* Granted Permissions */}
          <div className="pt-2">
            <span className="text-xs font-medium text-zinc-400 block mb-2 font-['Inter']">
              Granted Permissions & Capabilities
            </span>
            <div className="flex flex-wrap gap-2">
              {assignedPermissions.map((perm: string) => (
                <span
                  key={perm}
                  className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium rounded-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{perm}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Form Fields */}
        <div className="p-6 bg-zinc-900/90 rounded-2xl border border-white/10 space-y-5 shadow-lg">
          <h3 className="text-base font-semibold text-white font-['Inter'] border-b border-white/10 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            Chef Personal Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-['Inter']">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                className="w-full h-11 px-4 bg-zinc-950 rounded-xl border border-white/10 text-white text-sm font-['Inter'] focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-['Inter']">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                className="w-full h-11 px-4 bg-zinc-950 rounded-xl border border-white/10 text-white text-sm font-['Inter'] focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-['Inter']">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chef@tavonza.com"
                  className="w-full h-11 pl-10 pr-4 bg-zinc-950 rounded-xl border border-white/10 text-white text-sm font-['Inter'] focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-['Inter']">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+855 12 345 678"
                  className="w-full h-11 pl-10 pr-4 bg-zinc-950 rounded-xl border border-white/10 text-white text-sm font-['Inter'] focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-6 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
