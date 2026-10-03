'use client';

import React from 'react';
import { LoyaltyKPIs } from '../types';

export interface LoyaltyKPICardsProps {
  kpis: LoyaltyKPIs;
}

export default function LoyaltyKPICards({ kpis }: LoyaltyKPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
      {/* 1. Total Members */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,0.70)] border border-white/5 flex flex-col justify-center space-y-1">
        <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
          {kpis.totalMembers}
        </div>
        <div className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-4">
          Total Members
        </div>
      </div>

      {/* 2. Points Issued */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,0.70)] border border-white/5 flex flex-col justify-center space-y-1">
        <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
          {kpis.pointsIssued}
        </div>
        <div className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-4">
          Points Issued
        </div>
      </div>

      {/* 3. Points Redeemed */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,0.70)] border border-white/5 flex flex-col justify-center space-y-1">
        <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
          {kpis.pointsRedeemed}
        </div>
        <div className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-4">
          Points Redeemed
        </div>
      </div>

      {/* 4. Program Revenue */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,0.70)] border border-white/5 flex flex-col justify-center space-y-1">
        <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
          {kpis.programRevenue}
        </div>
        <div className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-4">
          Program Revenue
        </div>
      </div>
    </div>
  );
}
