'use client';

import React from 'react';
import { CardSummaryKPIs } from '../types';

interface TavonzaCardKPICardsProps {
  kpis: CardSummaryKPIs;
}

export default function TavonzaCardKPICards({ kpis }: TavonzaCardKPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. Total Members */}
      <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-white/5 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            {kpis.totalMembers}
          </div>
          <div className="text-stone-300 text-sm font-semibold font-['Inter'] leading-5">
            Total Members
          </div>
        </div>
        <div className="text-green-500 text-xs font-bold font-['Inter'] leading-4 flex items-center gap-1">
          <span>●</span>
          <span>{kpis.activeMembers} active</span>
        </div>
      </div>

      {/* 2. Points Issued */}
      <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-white/5 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            {kpis.pointsIssued}
          </div>
          <div className="text-stone-300 text-sm font-semibold font-['Inter'] leading-5">
            Points Issued
          </div>
        </div>
        <div className="text-zinc-400 text-xs font-medium font-['Inter'] leading-4">
          Across all members
        </div>
      </div>

      {/* 3. Member Spend */}
      <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-white/5 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            {kpis.memberSpend}
          </div>
          <div className="text-stone-300 text-sm font-semibold font-['Inter'] leading-5">
            Member Spend
          </div>
        </div>
        <div className="text-zinc-400 text-xs font-medium font-['Inter'] leading-4">
          Lifetime total
        </div>
      </div>

      {/* 4. Tier Breakdown Mini Table matching Figma */}
      <div className="h-32 px-4 py-2.5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-white/5 flex flex-col justify-between">
        <div className="space-y-0.5">
          <div className="flex justify-between items-center text-sm font-['Inter']">
            <span className="text-zinc-300 font-normal">Platinum</span>
            <span className="text-white font-medium">{kpis.tierBreakdown.Platinum || 0}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-['Inter']">
            <span className="text-zinc-300 font-normal">Gold</span>
            <span className="text-white font-medium">{kpis.tierBreakdown.Gold || 0}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-['Inter']">
            <span className="text-zinc-300 font-normal">Silver</span>
            <span className="text-white font-medium">{kpis.tierBreakdown.Silver || 0}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-['Inter']">
            <span className="text-zinc-300 font-normal">Bronze</span>
            <span className="text-white font-medium">{kpis.tierBreakdown.Bronze || 0}</span>
          </div>
        </div>
        <div className="text-zinc-500 text-xs font-medium font-['Inter'] pt-0.5">
          Tier Breakdown
        </div>
      </div>
    </div>
  );
}
