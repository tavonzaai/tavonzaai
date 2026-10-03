'use client';

import React from 'react';
import { TrendingUp, Sparkles, AlertCircle, HeartHandshake } from 'lucide-react';
import { BIPredictiveCard } from '../types';

export interface BIPredictiveCardsProps {
  cards: BIPredictiveCard[];
}

export default function BIPredictiveCards({ cards }: BIPredictiveCardsProps) {
  const getIcon = (category: BIPredictiveCard['category']) => {
    switch (category) {
      case 'revenue':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'menu':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'staffing':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'behavior':
        return <HeartHandshake className="w-4 h-4 text-pink-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
      {cards.map((card) => (
        <div
          key={card.id}
          className="p-4 bg-white/5 hover:bg-white/[0.07] rounded-2xl border border-white/20 hover:border-white/30 backdrop-blur-lg flex flex-col justify-between transition-all duration-200 shadow-lg min-h-[170px]"
        >
          {/* Icon Badge */}
          <div
            className="size-8 rounded-2xl flex items-center justify-center mb-3"
            style={{ backgroundColor: card.iconBg }}
          >
            {getIcon(card.category)}
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5 flex-1">
            <h4 className="text-white text-base font-semibold font-['Inter'] leading-5">
              {card.title}
            </h4>
            <p className="text-slate-400 text-sm font-normal font-['Inter'] leading-5">
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
