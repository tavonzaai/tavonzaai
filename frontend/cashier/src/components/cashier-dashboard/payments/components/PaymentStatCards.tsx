'use client';

import React from 'react';
import { CreditCard, Clock, RotateCcw, TrendingUp } from 'lucide-react';
import { PaymentStatItem } from '../types';

interface PaymentStatCardsProps {
  stats: PaymentStatItem[];
}

export default function PaymentStatCards({ stats }: PaymentStatCardsProps) {
  const getIcon = (accent: PaymentStatItem['accent']) => {
    switch (accent) {
      case 'teal':
        return <CreditCard className="w-3.5 h-3.5 text-teal-400" />;
      case 'amber':
        return <Clock className="w-3.5 h-3.5 text-amber-400" />;
      case 'red':
        return <RotateCcw className="w-3.5 h-3.5 text-red-400" />;
      case 'blue':
        return <TrendingUp className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4.5 w-full">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className={`h-32 p-5 bg-neutral-900/90 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] outline outline-1 outline-offset-[-1px] ${stat.borderOutline} flex justify-between items-center transition-all hover:bg-neutral-900 group`}
        >
          <div className="flex flex-col justify-start items-start gap-1">
            <div className="space-y-1">
              <div className={`text-2xl font-bold font-['Inter'] leading-tight ${stat.textColor}`}>
                {stat.value}
              </div>
              <div className="text-stone-300 text-sm font-semibold font-['Inter'] leading-tight">
                {stat.title}
              </div>
            </div>
            <div className="text-neutral-500 text-xs font-medium font-['Inter'] pt-1">
              {stat.subtitle}
            </div>
          </div>

          <div
            className={`w-7 h-7 ${stat.iconBg} rounded-lg outline outline-1 outline-offset-[-1px] ${stat.iconBorder} flex justify-center items-center flex-shrink-0 group-hover:scale-110 transition-transform`}
          >
            {getIcon(stat.accent)}
          </div>
        </div>
      ))}
    </div>
  );
}
