'use client';

import React from 'react';
import { EmployeesKPIs } from '../types';

export interface EmployeesKPICardsProps {
  kpis: EmployeesKPIs;
}

export default function EmployeesKPICards({ kpis }: EmployeesKPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
      {/* 1. Total Staff */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-white/5 flex flex-col justify-center space-y-1">
        <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
          {kpis.totalStaff}
        </div>
        <div className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-4">
          Total Staff
        </div>
      </div>

      {/* 2. On Shift */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-white/5 flex flex-col justify-center space-y-1">
        <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
          {kpis.onShift}
        </div>
        <div className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-4">
          On Shift
        </div>
      </div>

      {/* 3. Avg Rating */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-white/5 flex flex-col justify-center space-y-1">
        <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
          {kpis.avgRating.toFixed(1)}
        </div>
        <div className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-4">
          Avg Rating
        </div>
      </div>

      {/* 4. Tables Served */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-white/5 flex flex-col justify-center space-y-1">
        <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
          {kpis.tablesServed}
        </div>
        <div className="text-stone-300 text-sm font-semibold font-['Inter'] leading-4">
          Tables Served
        </div>
      </div>
    </div>
  );
}
