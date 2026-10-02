'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { QRTableItem } from '../types';

export interface QRHeaderProps {
  tables: QRTableItem[];
  onOpenGenerateModal: () => void;
}

export default function QRHeader({
  tables,
  onOpenGenerateModal,
}: QRHeaderProps) {
  const totalCount = tables.length > 0 ? tables.length : 30;
  const occupiedCount = tables.filter((t) => t.status === 'Busy').length || 22;
  const availableCount = tables.filter((t) => t.status === 'Free').length || 8;

  return (
    <div className="space-y-6 w-full">
      {/* Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9 tracking-tight">
            QR Ordering
          </h1>
          <p className="text-slate-400 text-base md:text-lg font-normal font-['Inter'] leading-6 mt-1">
            Generate, print, and manage QR codes for every table.
          </p>
        </div>

        {/* Generate QR Codes CTA */}
        <button
          type="button"
          onClick={onOpenGenerateModal}
          className="h-10 px-4 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold text-sm font-['Inter'] rounded-[10px] shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Generate QR Codes</span>
        </button>
      </div>

      {/* 3 KPI Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {/* Total Tables */}
        <div className="p-5 bg-neutral-900/90 rounded-[10px] border border-white/5 shadow-[0px_0px_2px_0px_rgba(255,185,0,0.50)] flex flex-col justify-center">
          <div className="text-white text-3xl font-bold font-['Inter'] leading-tight">
            {totalCount < 10 ? `0${totalCount}` : totalCount}
          </div>
          <div className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-5 mt-1">
            Total Tables
          </div>
        </div>

        {/* Occupied */}
        <div className="p-5 bg-neutral-900/90 rounded-[10px] border border-white/5 shadow-[0px_0px_2px_0px_rgba(255,185,0,0.50)] flex flex-col justify-center">
          <div className="text-white text-3xl font-bold font-['Inter'] leading-tight">
            {occupiedCount < 10 ? `0${occupiedCount}` : occupiedCount}
          </div>
          <div className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-5 mt-1">
            Occupied
          </div>
        </div>

        {/* Available */}
        <div className="p-5 bg-neutral-900/90 rounded-[10px] border border-white/5 shadow-[0px_0px_2px_0px_rgba(255,185,0,0.50)] flex flex-col justify-center">
          <div className="text-green-500 text-3xl font-bold font-['Inter'] leading-tight">
            {availableCount < 10 ? `0${availableCount}` : availableCount}
          </div>
          <div className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-5 mt-1">
            Available
          </div>
        </div>
      </div>
    </div>
  );
}
