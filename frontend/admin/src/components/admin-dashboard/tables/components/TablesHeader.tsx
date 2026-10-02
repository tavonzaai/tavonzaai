'use client';

import React from 'react';
import { Plus, Users, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { TableFloorItem } from '../types';

export interface TablesHeaderProps {
  tables: TableFloorItem[];
  onOpenAddModal: () => void;
}

export default function TablesHeader({
  tables,
  onOpenAddModal,
}: TablesHeaderProps) {
  const totalCount = tables.length > 0 ? tables.length : 30;
  const occupiedCount = tables.filter((t) => t.status === 'Occupied').length || 16;
  const availableCount = tables.filter((t) => t.status === 'Available').length || 10;
  const reservedCount = tables.filter((t) => t.status === 'Reserved').length || 4;

  const activeRevenue = tables.reduce((acc, curr) => acc + curr.billAmount, 0) || 1583;

  return (
    <div className="space-y-6 w-full">
      {/* Title & Add CTA Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9 tracking-tight">
            Tables
          </h1>
          <p className="text-slate-400 text-base md:text-lg font-normal font-['Inter'] leading-6 mt-1">
            Live floor plan - monitor occupancy and manage table assignments.
          </p>
        </div>

        {/* Add Table Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="h-10 px-4 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold text-sm font-['Inter'] rounded-[10px] shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Table</span>
        </button>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* 1. Occupied */}
        <div className="p-5 bg-white/5 rounded-2xl border border-white/20 backdrop-blur-[10.20px] flex items-center gap-3.5">
          <div className="size-11 bg-orange-500/20 rounded-[20px] flex items-center justify-center text-orange-500 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-orange-600 text-2xl font-bold font-['Plus_Jakarta_Sans'] leading-tight">
              {occupiedCount}/{totalCount}
            </div>
            <div className="text-zinc-400 text-sm font-medium font-['Inter'] mt-0.5">
              Occupied
            </div>
          </div>
        </div>

        {/* 2. Available */}
        <div className="p-5 bg-white/5 rounded-2xl border border-white/20 backdrop-blur-[10.20px] flex items-center gap-3.5">
          <div className="size-11 bg-green-500/10 rounded-[20px] flex items-center justify-center text-green-500 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-green-500 text-2xl font-bold font-['Plus_Jakarta_Sans'] leading-tight">
              {availableCount < 10 ? `0${availableCount}` : availableCount}
            </div>
            <div className="text-zinc-400 text-sm font-medium font-['Inter'] mt-0.5">
              Available
            </div>
          </div>
        </div>

        {/* 3. Reserved */}
        <div className="p-5 bg-white/5 rounded-2xl border border-white/20 backdrop-blur-[10.20px] flex items-center gap-3.5">
          <div className="size-11 bg-blue-500/10 rounded-[20px] flex items-center justify-center text-blue-500 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-blue-500 text-2xl font-bold font-['Plus_Jakarta_Sans'] leading-tight">
              {reservedCount < 10 ? `0${reservedCount}` : reservedCount}
            </div>
            <div className="text-zinc-400 text-sm font-medium font-['Inter'] mt-0.5">
              Reserved
            </div>
          </div>
        </div>

        {/* 4. Active Revenue */}
        <div className="p-5 bg-white/5 rounded-2xl border border-white/20 backdrop-blur-[10.20px] flex items-center gap-3.5">
          <div className="size-11 bg-purple-500/10 rounded-[20px] flex items-center justify-center text-purple-500 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-purple-400 text-2xl font-bold font-['Plus_Jakarta_Sans'] leading-tight">
              ${Math.round(activeRevenue)}
            </div>
            <div className="text-zinc-400 text-sm font-medium font-['Inter'] mt-0.5">
              Active Revenue
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
