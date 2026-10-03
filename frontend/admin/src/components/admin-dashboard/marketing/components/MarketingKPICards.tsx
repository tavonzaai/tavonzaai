'use client';

import React from 'react';
import { MarketingKPI } from '../types';
import { Megaphone, Send, Flame, DollarSign, TrendingUp } from 'lucide-react';

interface MarketingKPICardsProps {
  kpis: MarketingKPI[];
}

export default function MarketingKPICards({ kpis }: MarketingKPICardsProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case 'kpi-1':
        return Megaphone;
      case 'kpi-2':
        return Send;
      case 'kpi-3':
        return Flame;
      case 'kpi-4':
        return DollarSign;
      default:
        return TrendingUp;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
      {kpis.map((kpi) => {
        const Icon = getIcon(kpi.id);
        return (
          <div
            key={kpi.id}
            className="h-20 px-5 py-4 relative bg-neutral-900/90 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-amber-500/20 flex items-center justify-between transition-all duration-200 hover:border-amber-500/40 hover:shadow-[0px_0px_8px_0px_rgba(255,185,0,0.30)] group backdrop-blur-sm"
          >
            <div className="flex flex-col justify-between h-full">
              <div className="text-white text-2xl font-bold font-['Inter'] leading-5 tracking-tight group-hover:text-amber-400 transition-colors">
                {kpi.value}
              </div>
              <div className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-5">
                {kpi.subtext}
              </div>
            </div>

            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Icon className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
