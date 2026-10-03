'use client';

import React from 'react';
import { Plus, Sparkles } from 'lucide-react';

interface MarketingHeaderProps {
  onNewCampaign: () => void;
}

export default function MarketingHeader({ onNewCampaign }: MarketingHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-3xl sm:text-4xl font-semibold tracking-tight">
            Marketing
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            AI Enabled
          </span>
        </div>
        <p className="text-zinc-500 text-base sm:text-lg font-normal">
          Create and track SMS, email, and push campaigns.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNewCampaign}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 active:scale-95 transition-all text-white text-sm font-semibold rounded-[10px] shadow-[0px_1px_2px_-1px_rgba(255,214,168,1.00)] shadow-[0px_1px_3px_0px_rgba(255,214,168,1.00)] inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Campaign</span>
        </button>
      </div>
    </div>
  );
}
