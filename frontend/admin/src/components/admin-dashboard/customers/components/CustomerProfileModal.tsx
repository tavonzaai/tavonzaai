'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  ShoppingBag,
  TrendingUp,
  Star,
  Heart,
  Check,
} from 'lucide-react';
import { Customer } from '../types';

export interface CustomerProfileModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerProfileModal({
  customer,
  isOpen,
  onClose,
}: CustomerProfileModalProps) {
  const [smsSent, setSmsSent] = useState(false);

  if (!isOpen || !customer) return null;

  // Extract initials for the avatar badge
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSendSMS = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-[460px] bg-[#141416] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col font-['Inter'] animate-in zoom-in-95 duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header matching Screenshot 2 */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-white text-lg font-bold font-['Plus_Jakarta_Sans']">
            Customer Profile
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body matching Screenshot 2 */}
        <div className="p-6 space-y-5">
          {/* Profile Header */}
          <div className="flex items-center gap-3.5">
            <div className="size-14 bg-amber-950/70 border border-amber-800/40 rounded-2xl flex items-center justify-center text-amber-500 text-lg font-bold shrink-0 shadow-md">
              {getInitials(customer.name)}
            </div>
            <div>
              <h4 className="text-white text-lg font-bold leading-5">
                {customer.name}
              </h4>
              <p className="text-slate-500 text-sm font-normal mt-0.5">
                Member since {customer.memberSince || 'Mar 2023'}
              </p>
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 bg-amber-950/60 text-amber-500 border border-amber-800/40 text-xs font-semibold rounded-full">
                  {customer.segment}
                </span>
              </div>
            </div>
          </div>

          {/* 6 Metric Tiles (2 Columns x 3 Rows) */}
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Email */}
            <div className="px-3.5 py-2.5 bg-zinc-800/60 rounded-xl border border-white/5 flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="block text-white text-xs font-normal leading-3">
                  Email
                </span>
                <span className="block text-neutral-300 text-sm font-semibold truncate leading-4 mt-0.5">
                  {customer.email}
                </span>
              </div>
            </div>

            {/* 2. Phone */}
            <div className="px-3.5 py-2.5 bg-zinc-800/60 rounded-xl border border-white/5 flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="block text-white text-xs font-normal leading-3">
                  Phone
                </span>
                <span className="block text-neutral-300 text-sm font-semibold truncate leading-4 mt-0.5">
                  {customer.phone}
                </span>
              </div>
            </div>

            {/* 3. Total Visits */}
            <div className="px-3.5 py-2.5 bg-zinc-800/60 rounded-xl border border-white/5 flex items-start gap-2.5">
              <ShoppingBag className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="block text-white text-xs font-normal leading-3">
                  Total Visits
                </span>
                <span className="block text-neutral-300 text-sm font-semibold leading-4 mt-0.5">
                  {customer.visits}
                </span>
              </div>
            </div>

            {/* 4. Total Spent */}
            <div className="px-3.5 py-2.5 bg-zinc-800/60 rounded-xl border border-white/5 flex items-start gap-2.5">
              <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="block text-white text-xs font-normal leading-3">
                  Total Spent
                </span>
                <span className="block text-neutral-300 text-sm font-semibold leading-4 mt-0.5">
                  ${customer.totalSpent.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 5. Rating */}
            <div className="px-3.5 py-2.5 bg-zinc-800/60 rounded-xl border border-white/5 flex items-start gap-2.5">
              <Star className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="block text-white text-xs font-normal leading-3">
                  Rating
                </span>
                <span className="block text-neutral-300 text-sm font-semibold leading-4 mt-0.5">
                  {customer.rating.toFixed(1)} ★
                </span>
              </div>
            </div>

            {/* 6. Last Visit */}
            <div className="px-3.5 py-2.5 bg-zinc-800/60 rounded-xl border border-white/5 flex items-start gap-2.5">
              <Heart className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="block text-white text-xs font-normal leading-3">
                  Last Visit
                </span>
                <span className="block text-neutral-300 text-sm font-semibold leading-4 mt-0.5">
                  {customer.lastVisit}
                </span>
              </div>
            </div>
          </div>

          {/* Notes if available */}
          {customer.notes && (
            <div className="p-3 bg-zinc-800/40 rounded-xl border border-white/5">
              <span className="block text-xs text-zinc-500 font-medium uppercase tracking-wider">
                Internal Notes & Preferences
              </span>
              <p className="text-sm text-neutral-300 mt-1 italic">
                {customer.notes}
              </p>
            </div>
          )}

          {/* Footer Action Buttons matching Screenshot 2 */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-zinc-700/80 bg-zinc-900/60 text-slate-400 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSendSMS}
              className="flex-1 h-10 bg-[#f59e0b] hover:bg-amber-400 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {smsSent ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>SMS Sent!</span>
                </>
              ) : (
                <span>Send SMS</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
