'use client';

import React from 'react';
import { Gift } from 'lucide-react';
import { LoyaltyReward } from '../types';

export interface LoyaltyRewardsGridProps {
  rewards: LoyaltyReward[];
  onSelectReward: (reward: LoyaltyReward) => void;
}

export default function LoyaltyRewardsGrid({
  rewards,
  onSelectReward,
}: LoyaltyRewardsGridProps) {
  return (
    <div className="w-full space-y-3 font-['Inter']">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-base font-bold font-['Plus_Jakarta_Sans'] flex items-center gap-2">
          <Gift className="w-4 h-4 text-amber-400" />
          <span>Active Reward Catalog</span>
        </h3>
        <span className="text-zinc-500 text-sm">{rewards.length} rewards available</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 w-full">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            onClick={() => onSelectReward(reward)}
            className="w-full p-4 bg-white/5 hover:bg-white/[0.08] rounded-[10px] border border-white/10 hover:border-amber-400/40 transition-all duration-200 flex flex-col items-center justify-between text-center gap-1.5 group cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            {/* Emoji Icon */}
            <div className="text-4xl font-normal leading-8 py-1 group-hover:scale-110 transition-transform">
              {reward.icon}
            </div>

            {/* Name */}
            <div className="text-white text-sm font-semibold leading-4 line-clamp-1">
              {reward.name}
            </div>

            {/* Points Cost */}
            <div className="text-indigo-400 text-base font-bold leading-5">
              {reward.pointsCost} pts
            </div>

            {/* Claimed Counter */}
            <div className="text-slate-500 text-xs font-normal leading-4">
              {reward.claimedCount} claimed
            </div>

            {/* Hover Trigger Action */}
            <div className="w-full pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                className="w-full h-7 bg-amber-400 hover:bg-amber-300 text-white text-xs font-bold rounded-md transition-colors flex items-center justify-center cursor-pointer"
              >
                Redeem for Customer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
