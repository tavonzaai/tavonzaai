'use client';

import React from 'react';
import { Download, Plus, CreditCard } from 'lucide-react';

interface TavonzaCardHeaderProps {
  onExport: () => void;
  onAddMember: () => void;
}

export default function TavonzaCardHeader({
  onExport,
  onAddMember,
}: TavonzaCardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-3xl sm:text-4xl font-semibold font-['Inter'] tracking-tight">
            Tavonza Card
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-amber-400" />
            VIP Loyalty Program
          </span>
        </div>
        <p className="text-slate-400 text-sm sm:text-base font-normal font-['Inter']">
          Manage your loyalty card members, points, and tiers.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onExport}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white text-sm font-semibold font-['Inter'] rounded-[10px] outline outline-1 outline-white/10 backdrop-blur-[10.20px] inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-zinc-300" />
          <span>Export</span>
        </button>

        <button
          type="button"
          onClick={onAddMember}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 active:scale-95 transition-all text-white font-bold text-sm font-['Inter'] rounded-[10px] shadow-[0px_1px_2px_-1px_rgba(255,214,168,1.00)] inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Member</span>
        </button>
      </div>
    </div>
  );
}
