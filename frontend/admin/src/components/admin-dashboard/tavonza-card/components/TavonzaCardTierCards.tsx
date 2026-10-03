'use client';

import React from 'react';
import { CardTier } from '../types';

interface TavonzaCardTierCardsProps {
  tierCounts: Record<CardTier, number>;
  onSelectTier?: (tier: CardTier) => void;
  selectedTier?: CardTier | 'All Tiers';
}

export default function TavonzaCardTierCards({
  tierCounts,
  onSelectTier,
  selectedTier,
}: TavonzaCardTierCardsProps) {
  const tiers: Array<{
    tier: CardTier;
    criteria: string;
    badgeColor: string;
    borderHighlight: string;
  }> = [
    {
      tier: 'Platinum',
      criteria: '10,000+ pts',
      badgeColor: 'text-purple-400',
      borderHighlight: 'hover:border-purple-500/50',
    },
    {
      tier: 'Gold',
      criteria: '5,000–9,999 pts',
      badgeColor: 'text-yellow-400',
      borderHighlight: 'hover:border-yellow-500/50',
    },
    {
      tier: 'Silver',
      criteria: '1,000–4,999 pts',
      badgeColor: 'text-slate-300',
      borderHighlight: 'hover:border-slate-400/50',
    },
    {
      tier: 'Bronze',
      criteria: '0–999 pts',
      badgeColor: 'text-amber-500',
      borderHighlight: 'hover:border-amber-600/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {tiers.map((t) => {
        const count = tierCounts[t.tier] || 0;
        const isSelected = selectedTier === t.tier;

        return (
          <div
            key={t.tier}
            onClick={() => onSelectTier && onSelectTier(t.tier)}
            className={`h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border transition-all cursor-pointer flex flex-col justify-between ${
              isSelected
                ? 'border-yellow-500 shadow-md shadow-yellow-500/10'
                : `border-white/5 ${t.borderHighlight}`
            }`}
          >
            <div className="space-y-0.5">
              <div className={`text-lg font-bold font-['Inter'] ${t.badgeColor}`}>
                {t.tier}
              </div>
              <div className="text-stone-400 text-sm font-medium font-['Inter']">
                {t.criteria}
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-white text-3xl font-bold font-['Plus_Jakarta_Sans'] leading-tight">
                {count}
              </span>
              <span className="text-stone-400 text-xs font-medium font-['Inter']">
                members
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
