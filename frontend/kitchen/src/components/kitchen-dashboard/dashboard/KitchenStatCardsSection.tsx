'use client';

import React from 'react';
import {
  UtensilsCrossed,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Timer
} from 'lucide-react';
import { mockKitchenStatCards } from '../data';

const getIcon = (id: string) => {
  switch (id) {
    case 'stat-1':
      return <UtensilsCrossed className="w-4 h-4 text-blue-400" />;
    case 'stat-2':
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    case 'stat-3':
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'stat-4':
      return <Clock className="w-4 h-4 text-amber-400" />;
    case 'stat-5':
      return <Zap className="w-4 h-4 text-orange-400" />;
    case 'stat-6':
      return <Timer className="w-4 h-4 text-red-400" />;
    default:
      return <Clock className="w-4 h-4 text-white" />;
  }
};

const getBadgeBg = (type: string) => {
  switch (type) {
    case 'blue':
      return 'bg-blue-500/10 border-blue-500/20';
    case 'red':
      return 'bg-red-500/10 border-red-500/20';
    case 'green':
      return 'bg-emerald-500/10 border-emerald-500/20';
    case 'amber':
      return 'bg-amber-500/10 border-amber-500/20';
    case 'orange':
      return 'bg-orange-500/10 border-orange-500/20';
    default:
      return 'bg-zinc-800 border-zinc-700';
  }
};

export default function KitchenStatCardsSection() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {mockKitchenStatCards.map((card) => (
        <div
          key={card.id}
          className={`p-3.5 sm:p-5 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 ${card.glowShadow} flex flex-col justify-between transition-all hover:scale-[1.02] duration-200 shadow-lg`}
        >
          {/* Icon Badge */}
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getBadgeBg(card.type)}`}>
              {getIcon(card.id)}
            </div>
          </div>

          {/* Number Value */}
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-['Plus_Jakarta_Sans'] tracking-tight truncate">
              {card.value}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-400 mt-1 font-['Inter'] truncate">
              {card.label}
            </div>
            <div className="text-[10px] sm:text-xs text-zinc-500 font-normal mt-0.5 font-['Inter'] truncate">
              {card.subtext}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
