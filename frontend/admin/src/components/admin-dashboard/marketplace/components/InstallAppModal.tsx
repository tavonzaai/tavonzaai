'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, DownloadCloud, Star } from 'lucide-react';
import { MarketplaceApp } from '../types';

interface InstallAppModalProps {
  app: MarketplaceApp | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmInstall: (appId: string) => void;
}

export default function InstallAppModal({
  app,
  isOpen,
  onClose,
  onConfirmInstall,
}: InstallAppModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  if (!isOpen || !app) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmInstall(app.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#131417] border border-[#242630] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-yellow-400 font-bold text-xl">
              {app.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-white text-lg sm:text-xl font-bold font-['Inter']">
                {app.name}
              </h2>
              <span className="text-zinc-400 text-sm font-normal font-['Inter']">
                by {app.developer} · {app.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing & Rating banner */}
        <div className="p-3.5 bg-[#18191d] border border-zinc-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-base font-bold">{app.price}</span>
            <span className="text-zinc-500 text-sm font-normal">subscription</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{app.rating.toFixed(1)} / 5.0</span>
            <span className="text-zinc-500 text-xs">({app.reviewsCount || 100}+ reviews)</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-zinc-300 text-sm leading-relaxed">{app.description}</p>

        {/* Permissions Requested */}
        <div className="space-y-2">
          <label className="text-white text-sm font-bold uppercase tracking-wider block">
            Permissions & Data Access
          </label>
          <div className="space-y-1.5 p-3 bg-black/30 border border-zinc-800 rounded-xl">
            {(app.permissions || [
              'Sync POS live menu catalog',
              'Inject orders into kitchen workflow',
              'Access branch sales reporting',
            ]).map((perm, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{perm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Merchant API Key */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-sm font-semibold block">
              Merchant Account ID / API Secret (Optional)
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. pk_live_restaurant_auth_9482"
              className="w-full h-10 px-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-neutral-900 text-yellow-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="terms" className="text-zinc-400 text-sm cursor-pointer">
              I authorize Tavonza POS to establish real-time data sync with {app.name}.
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-neutral-900 border border-neutral-800 text-zinc-300 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!agreeTerms}
              className="flex-1 py-2.5 px-6 bg-yellow-500 hover:bg-yellow-400 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/20 cursor-pointer active:scale-95 disabled:opacity-40"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Connect & Install</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
