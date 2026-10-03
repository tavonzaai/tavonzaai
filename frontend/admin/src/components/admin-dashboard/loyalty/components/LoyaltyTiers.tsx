'use client';

import React from 'react';
import { Award, Shield, Crown, Sparkles } from 'lucide-react';
import { LoyaltyTier } from '../types';

export interface LoyaltyTiersProps {
  tiers: LoyaltyTier[];
}

export default function LoyaltyTiers({ tiers }: LoyaltyTiersProps) {
  const getTierIcon = (name: LoyaltyTier['name']) => {
    switch (name) {
      case 'Bronze':
        return <Award className="w-4 h-4 stroke-[2]" />;
      case 'Silver':
        return <Shield className="w-4 h-4 stroke-[2]" />;
      case 'Gold':
        return <Crown className="w-4 h-4 stroke-[2]" />;
      case 'Platinum':
        return <Sparkles className="w-4 h-4 stroke-[2]" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full font-['Inter']">
      {tiers.map((tier) => (
        <div
          key={tier.id}
          className={`h-36 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border ${tier.borderTheme} flex items-start justify-between transition-all hover:scale-[1.01] duration-200`}
        >
          <div className="flex flex-col justify-between h-full flex-1 pr-3">
            {/* Title & Range/Growth */}
            <div className="space-y-1">
              <div className={`text-2xl font-bold leading-5 ${tier.textColor}`}>
                {tier.name}
              </div>

              {tier.name === 'Bronze' ? (
                <div className="text-slate-500 text-xs font-normal leading-4 pt-1">
                  {tier.pointsRange}
                </div>
              ) : (
                <div className="text-neutral-400 text-sm font-semibold leading-5 pt-0.5">
                  {tier.metricLabel}
                </div>
              )}
            </div>

            {/* Bottom Content / Perks / Growth Indicator */}
            {tier.name === 'Bronze' ? (
              <div className="space-y-1 pt-1">
                {tier.perks.map((perk, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-sm text-slate-400">
                    <span className="size-1 rounded-full bg-amber-600 shrink-0" />
                    <span className="truncate text-xs">{perk}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pt-2">
                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  {tier.growth || 'Active Tier'}
                </span>
                <span className="text-slate-500 text-xs block mt-0.5">
                  {tier.pointsRange}
                </span>
              </div>
            )}
          </div>

          {/* Icon Badge */}
          <div
            className={`size-9 rounded-[20px] flex items-center justify-center shrink-0 ${tier.iconBg}`}
          >
            {getTierIcon(tier.name)}
          </div>
        </div>
      ))}
    </div>
  );
}
