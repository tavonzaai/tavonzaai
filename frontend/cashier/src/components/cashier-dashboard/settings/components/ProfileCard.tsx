'use client';

import React from 'react';
import { User } from 'lucide-react';
import { CashierProfileSettings } from '../types';
import { availableBranches } from '../settingsData';

interface ProfileCardProps {
  profile: CashierProfileSettings;
  onChange: (updated: Partial<CashierProfileSettings>) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onChange,
}) => {
  return (
    <div className="p-5 bg-white/10 rounded-[10px] border border-white/5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-yellow-500/20 border border-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-500 shrink-0">
          <User className="w-4 h-4" />
        </div>
        <h2 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-4">
          Profile
        </h2>
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

        {/* Branch */}
        <div className="space-y-1">
          <label className="block text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
            Branch
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
