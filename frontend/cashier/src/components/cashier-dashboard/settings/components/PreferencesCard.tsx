'use client';

import React from 'react';
import { Sliders } from 'lucide-react';
import { CashierPreferencesSettings } from '../types';
import { availableLanguages, availableCurrencies } from '../settingsData';

interface PreferencesCardProps {
  preferences: CashierPreferencesSettings;
  onChange: (updated: Partial<CashierPreferencesSettings>) => void;
}

export const PreferencesCard: React.FC<PreferencesCardProps> = ({
  preferences,
  onChange,
}) => {
  return (
    <div className="p-5 bg-white/10 rounded-[10px] border border-white/5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-yellow-500/20 border border-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-500 shrink-0">
          <Sliders className="w-4 h-4" />
        </div>
        <h2 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-4">
          Preferences
        </h2>
      </div>

      {/* Form Fields */}
      <div className="space-y-3.5 pt-1">
        {/* Language */}
        <div className="space-y-1">
          <label className="block text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
            Language
          </label>
          <select
            value={preferences.language}
            onChange={(e) => onChange({ language: e.target.value })}
            className="w-full h-10 px-3 bg-white/5 rounded-lg border border-white/5 text-slate-200 text-sm font-normal font-['Plus_Jakarta_Sans'] focus:outline-yellow-500/50 focus:border-yellow-500/30 transition-colors cursor-pointer"
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang} className="bg-zinc-900 text-white">
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Currency */}
        <div className="space-y-1">
          <label className="block text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
            Currency
          </label>
          <select
            value={preferences.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
            className="w-full h-10 px-3 bg-white/5 rounded-lg border border-white/5 text-slate-200 text-sm font-normal font-['Plus_Jakarta_Sans'] focus:outline-yellow-500/50 focus:border-yellow-500/30 transition-colors cursor-pointer"
          >
            {availableCurrencies.map((c) => (
              <option key={c.code} value={c.code} className="bg-zinc-900 text-white">
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tax Rate (%) */}
        <div className="space-y-1">
          <label className="block text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
            Tax Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={preferences.taxRate}
            onChange={(e) =>
              onChange({ taxRate: parseFloat(e.target.value) || 0 })
            }
            className="w-full h-10 px-3 bg-white/5 rounded-lg border border-white/5 text-slate-200 text-sm font-normal font-['Plus_Jakarta_Sans'] focus:outline-yellow-500/50 focus:border-yellow-500/30 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
