'use client';

import React, { useState } from 'react';
import { X, Settings, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { MarketplaceApp } from '../types';

interface ConfigureAppModalProps {
  app: MarketplaceApp | null;
  isOpen: boolean;
  onClose: () => void;
  onUninstall: (appId: string) => void;
  onSaveConfig: (appId: string, updatedDetails: Partial<MarketplaceApp>) => void;
}

export default function ConfigureAppModal({
  app,
  isOpen,
  onClose,
  onUninstall,
  onSaveConfig,
}: ConfigureAppModalProps) {
  const [syncInterval, setSyncInterval] = useState('Real-time (Instant)');
  const [statusActive, setStatusActive] = useState(true);

  if (!isOpen || !app) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(app.id, {
      badge: statusActive ? '● On Shift' : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#131417] border border-[#242630] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-yellow-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white text-lg sm:text-xl font-bold font-['Inter']">
                {app.name} Settings
              </h2>
              <span className="text-zinc-500 text-sm font-normal font-['Inter']">
                Status: {app.isInstalled ? 'Connected & Active' : 'Not Installed'}
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

        <form onSubmit={handleSave} className="space-y-4">
          {/* Status Toggle Card */}
          <div className="p-4 bg-[#18191d] border border-zinc-800 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-white text-sm font-semibold">Live Integration State</span>
              <span className="text-zinc-500 text-xs mt-0.5">
                {statusActive ? 'Receiving orders & syncing data' : 'Temporarily paused'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStatusActive(!statusActive)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                statusActive
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {statusActive ? 'Active (On Shift)' : 'Paused'}
            </button>
          </div>

          {/* Sync Frequency */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-sm font-semibold block">
              Data Synchronization Frequency
            </label>
            <select
              value={syncInterval}
              onChange={(e) => setSyncInterval(e.target.value)}
              className="w-full h-10 px-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500 cursor-pointer"
            >
              <option value="Real-time (Instant)">Real-time (Instant Webhook)</option>
              <option value="Every 5 minutes">Every 5 minutes</option>
              <option value="Every 15 minutes">Every 15 minutes</option>
              <option value="Hourly batch">Hourly batch</option>
            </select>
          </div>

          {/* Last Sync Info */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-zinc-400">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Last Health Check & Sync:</span>
            </div>
            <span className="text-white font-medium">{app.lastSync || 'Just now'}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-800">
            {app.isInstalled && (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.confirm(`Are you sure you want to disconnect ${app.name}?`)) {
                    onUninstall(app.id);
                    onClose();
                  }
                }}
                className="py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-neutral-900 border border-neutral-800 text-zinc-300 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 bg-yellow-500 hover:bg-yellow-400 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-all shadow-lg shadow-yellow-500/20 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
