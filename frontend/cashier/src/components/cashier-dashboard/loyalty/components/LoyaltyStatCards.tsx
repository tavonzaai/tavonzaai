'use client';

import React from 'react';
import { Users, Crown, DollarSign, Cake } from 'lucide-react';
import { LoyaltyStats } from '../types';

interface LoyaltyStatCardsProps {
  stats: LoyaltyStats;
}

export const LoyaltyStatCards: React.FC<LoyaltyStatCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Total Loyalty Members',
      value: stats.totalMembers.toString(),
      icon: Users,
      iconColor: 'text-teal-500',
      iconBg: 'bg-teal-500/10',
      iconBorder: 'border-teal-500/20',
      valColor: 'text-teal-500',
    },
    {
      label: 'VIP Customers',
      value: stats.vipCustomers.toString(),
      icon: Crown,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/10',
      iconBorder: 'border-amber-500/20',
      valColor: 'text-amber-500',
    },
    {
      label: 'Total Lifetime Value',
      value: `$${stats.totalLTV.toLocaleString()}`,
      icon: DollarSign,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
      iconBorder: 'border-blue-500/20',
      valColor: 'text-blue-500',
    },
    {
      label: 'Birthdays This Month',
      value: stats.birthdaysThisMonth.toString(),
      icon: Cake,
      iconColor: 'text-pink-500',
      iconBg: 'bg-pink-500/10',
      iconBorder: 'border-pink-500/20',
      valColor: 'text-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.label}
            className="p-3.5 bg-white/10 hover:bg-white/[0.13] rounded-[5px] border border-white/10 flex items-center gap-3 transition-all"
          >
            <div
              className={`w-8 h-8 ${card.iconBg} rounded-xl border ${card.iconBorder} flex items-center justify-center shrink-0`}
            >
              <IconComponent className={`w-4 h-4 ${card.iconColor}`} />
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className={`text-xl font-bold font-['JetBrains_Mono'] leading-7 ${card.valColor}`}
              >
                {card.value}
              </span>
              <span className="text-white text-xs font-normal font-['Plus_Jakarta_Sans'] leading-3 truncate">
                {card.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
