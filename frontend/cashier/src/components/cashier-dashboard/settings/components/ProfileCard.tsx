'use client';

import React from 'react';
import { User, CheckCircle2 } from 'lucide-react';
import { CashierProfileSettings } from '../types';
import { availableBranches } from '../settingsData';

interface ProfileCardProps {
  profile: CashierProfileSettings;
  user?: any;
  onChange: (updated: Partial<CashierProfileSettings>) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  user,
  onChange,
}) => {
  const permissions: string[] =
    user?.assignments?.[0]?.permissions ||
    user?.permissions ||
    ['MANAGE_PAYMENTS', 'VIEW_ORDERS', 'APPLY_DISCOUNTS'];

  return (
    <div className="p-5 bg-white/10 rounded-[10px] border border-white/5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-center justify-center text-yellow-500 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-5">
              Cashier Profile
            </h2>
            <p className="text-slate-400 text-xs font-mono">
              ID: {user?.id || '—'}
            </p>
          </div>
        </div>

        {/* Role & Global Role Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
            {user?.role || 'CASHIER'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-400/10 border border-blue-400/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
            {user?.globalRole || 'STAFF'}
          </span>
        </div>
      </div>

      {/* Account Details & Active Permissions Box */}
      <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-2.5 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Branch Name</span>
            <span className="text-amber-300 font-medium">
              {user?.branchName || user?.assignments?.[0]?.branchName || profile.branch || 'Downtown HQ'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Created At</span>
            <span className="text-slate-300 font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Oct 5, 2026'}
            </span>
          </div>
        </div>

        {/* Active Permissions List */}
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block mb-1">Assigned Permissions</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {permissions.map((perm) => (
              <span
                key={perm}
                className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-medium flex items-center gap-1"
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>{perm}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3.5 pt-1">
        {/* Cashier Name */}
        <div className="space-y-1">
          <label className="block text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
            Cashier Name
          </label>
          <input
            type="text"
            value={profile.cashierName}
            onChange={(e) => onChange({ cashierName: e.target.value })}
            className="w-full h-10 px-3 bg-white/5 rounded-lg border border-white/5 text-slate-200 text-sm font-normal font-['Plus_Jakarta_Sans'] focus:outline-yellow-500/50 focus:border-yellow-500/30 transition-colors"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
            Email Address
          </label>
          <input
            type="email"
            disabled
            value={(profile as any).email || user?.email || 'cashier@tavonza.ai'}
            className="w-full h-10 px-3 bg-white/5 rounded-lg border border-white/5 text-slate-400 text-sm font-normal font-['Plus_Jakarta_Sans'] cursor-not-allowed"
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-1">
          <label className="block text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
            Phone / Contact No
          </label>
          <input
            type="text"
            placeholder="Not set"
            value={(profile as any).phone || (profile as any).contactNo || user?.phone || ''}
            onChange={(e) => onChange({ phone: e.target.value } as any)}
            className="w-full h-10 px-3 bg-white/5 rounded-lg border border-white/5 text-slate-200 text-sm font-normal font-['Plus_Jakarta_Sans'] focus:outline-yellow-500/50 focus:border-yellow-500/30 transition-colors"
          />
        </div>

        {/* Branch */}
        <div className="space-y-1">
          <label className="block text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
            Assigned Branch
          </label>
          <select
            value={profile.branch}
            onChange={(e) => onChange({ branch: e.target.value })}
            className="w-full h-10 px-3 bg-white/5 rounded-lg border border-white/5 text-slate-200 text-sm font-normal font-['Plus_Jakarta_Sans'] focus:outline-yellow-500/50 focus:border-yellow-500/30 transition-colors cursor-pointer"
          >
            {availableBranches.map((b) => (
              <option key={b} value={b} className="bg-zinc-900 text-white">
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
