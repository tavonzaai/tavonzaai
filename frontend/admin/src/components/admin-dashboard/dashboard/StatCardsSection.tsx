'use client';

import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Users,
  LayoutGrid,
  ChefHat,
} from 'lucide-react';
import { StatCardData } from '../types';

export interface StatCardsSectionProps {
  stats: StatCardData[];
}

export default function StatCardsSection({ stats }: StatCardsSectionProps) {
  const cardConfigs = [
    {
      shadow: 'shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)]',
      icon: TrendingUp,
      iconColor: 'text-yellow-500',
      badgeColor: 'text-green-600',
    },
    {
      shadow: 'shadow-[0px_0px_2px_0px_rgba(43,127,255,1.00)]',
      icon: ShoppingBag,
      iconColor: 'text-blue-500',
      badgeColor: 'text-blue-500',
    },
    {
      shadow: 'shadow-[0px_0px_2px_0px_rgba(173,70,255,1.00)]',
      icon: CreditCard,
      iconColor: 'text-purple-500',
      badgeColor: 'text-purple-500',
    },
    {
      shadow: 'shadow-[0px_0px_2px_0px_rgba(0,166,62,1.00)]',
      icon: Users,
      iconColor: 'text-green-600',
      badgeColor: 'text-green-600',
    },
    {
      shadow: 'shadow-[0px_0px_2px_0px_rgba(255,255,255,0.70)]',
      icon: LayoutGrid,
      iconColor: 'text-teal-600',
      badgeColor: 'text-teal-600',
    },
    {
      shadow: 'shadow-[0px_0px_2px_0px_rgba(255,255,255,0.70)]',
      icon: ChefHat,
      iconColor: 'text-orange-600',
      badgeColor: 'text-orange-600',
    },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
      {stats.map((stat, i) => {
        const config = cardConfigs[i] || cardConfigs[0];
        const Icon = config.icon;

        return (
          <div
            key={i}
            className={`w-full min-h-[150px] sm:min-h-[160px] p-3.5 sm:p-5 bg-neutral-900 rounded-2xl ${config.shadow} outline outline-1 outline-offset-[-1px] outline-black/5 flex flex-col justify-between select-none`}
          >
            {/* Top Row: Circular Icon (Left) + Clean Badge (Right) */}
            <div className="flex items-center justify-between w-full h-8 sm:h-9">
              {/* Circular Icon Container */}
              <div className="size-8 sm:size-9 bg-zinc-900 rounded-[20px] shadow-[0px_0px_1px_0px_rgba(255,170,68,1.00)] flex justify-center items-center flex-shrink-0">
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${config.iconColor} stroke-[2.2]`} />
              </div>

              {/* Clean Badge on Right: just bg-zinc-900 without shadow artifacts */}
              <div className="px-1.5 sm:px-2 py-0.5 bg-zinc-900 rounded-[5px] flex items-center justify-center">
                <span className={`text-xs sm:text-sm font-semibold font-sans leading-4 ${config.badgeColor}`}>
                  {stat.change}
                </span>
              </div>
            </div>

            {/* Middle: Metric Value and Title */}
            <div className="pt-2">
              <div className="text-white text-xl sm:text-2xl font-bold font-heading leading-tight tracking-tight truncate">
                {stat.value}
              </div>
              <div className="text-gray-400 text-xs sm:text-sm font-medium font-sans leading-4 pt-1 truncate">
                {stat.title}
              </div>
            </div>

            {/* Bottom Row: Subtext or Split Stats */}
            <div className="pt-0.5">
              {stat.breakdown ? (
                <div className="flex items-center gap-3 text-xs font-semibold font-sans leading-4">
                  {stat.breakdown.map((b, bi) => (
                    <span key={bi} className={b.color}>
                      {b.label}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-xs font-normal font-sans leading-4">
                  {stat.subtext}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

