'use client';

import React from 'react';
import { LoyaltyTab } from '../types';

interface LoyaltyTabsBarProps {
  activeTab: LoyaltyTab;
  onSelectTab: (tab: LoyaltyTab) => void;
}

const TABS: LoyaltyTab[] = [
  'Overview',
  'VIP Customers',
  'Birthday Reminders',
  'Personalized Upsell',
];

export const LoyaltyTabsBar: React.FC<LoyaltyTabsBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onSelectTab(tab)}
            className={`px-6 py-2 rounded-[5px] text-base font-medium font-['Inter'] transition-all cursor-pointer ${
              isActive
                ? 'bg-amber-400 text-white font-semibold shadow-md'
                : 'bg-transparent text-neutral-400 hover:text-white border border-neutral-400/40 hover:border-neutral-300/60'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};
