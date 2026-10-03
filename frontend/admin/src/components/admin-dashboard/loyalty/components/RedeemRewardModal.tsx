'use client';

import React, { useState } from 'react';
import { X, Check, Gift, User } from 'lucide-react';
import { LoyaltyReward } from '../types';

export interface RedeemRewardModalProps {
  reward: LoyaltyReward | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmRedeem: (rewardId: string, customerName: string) => void;
}

export default function RedeemRewardModal({
  reward,
  isOpen,
  onClose,
  onConfirmRedeem,
}: RedeemRewardModalProps) {
  const [selectedCustomer, setSelectedCustomer] = useState('James Chen (VIP - 3,200 pts)');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !reward) return null;

  const mockCustomers = [
    { name: 'James Chen', tier: 'VIP', points: 3200 },
    { name: 'Emma Wilson', tier: 'VIP', points: 2850 },
    { name: 'Sarah Miller', tier: 'Regular', points: 940 },
    { name: 'Noah Thompson', tier: 'VIP', points: 4100 },
    { name: 'Ava Johnson', tier: 'Regular', points: 620 },
  ];

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      onConfirmRedeem(reward.id, selectedCustomer.split(' (')[0]);
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-[440px] bg-[#141416] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col font-['Inter'] animate-in zoom-in-95 duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-white text-lg font-bold font-['Plus_Jakarta_Sans'] flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-400" />
            <span>Redeem Reward</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleRedeem} className="p-6 space-y-4 text-sm">
          {/* Selected Reward Summary Card */}
          <div className="p-4 bg-zinc-800/60 rounded-xl border border-white/5 flex items-center gap-3.5">
            <div className="text-4xl">{reward.icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white text-base font-bold truncate">{reward.name}</h4>
              <p className="text-indigo-400 text-sm font-semibold">{reward.pointsCost} pts</p>
              {reward.description && (
                <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">
                  {reward.description}
                </p>
              )}
            </div>
          </div>

          {/* Customer Selection */}
          <div className="space-y-1.5">
            <label className="text-white text-sm font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Select Customer</span>
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full h-10 px-3.5 bg-zinc-800/90 rounded-xl border border-zinc-700/70 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
            >
              {mockCustomers.map((cust) => (
                <option
                  key={cust.name}
                  value={`${cust.name} (${cust.tier} - ${cust.points} pts)`}
                  className="bg-zinc-900 text-white"
                >
                  {cust.name} ({cust.tier} — {cust.points} pts available)
                </option>
              ))}
            </select>
          </div>

          {/* Points Breakdown */}
          <div className="p-3 bg-[#0a0a0c] rounded-xl border border-zinc-800 space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Cost</span>
              <span className="text-red-400 font-semibold font-mono">
                -{reward.pointsCost} pts
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Status</span>
              <span className="text-emerald-400 font-semibold">Eligible</span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-zinc-700/80 bg-zinc-900/60 text-slate-400 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSuccess}
              className="flex-1 h-10 bg-[#f59e0b] hover:bg-amber-400 disabled:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Redeemed Successfully!</span>
                </>
              ) : (
                <span>Confirm Redemption</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
