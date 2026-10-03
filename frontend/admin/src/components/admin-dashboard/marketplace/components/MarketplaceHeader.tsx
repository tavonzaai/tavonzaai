'use client';

import React from 'react';
import { CheckCircle, Store } from 'lucide-react';

interface MarketplaceHeaderProps {
  installedCount: number;
}

export default function MarketplaceHeader({ installedCount }: MarketplaceHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-3xl sm:text-4xl font-semibold font-['Inter'] tracking-tight">
            Marketplace
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Store className="w-3 h-3 text-amber-400" />
            Integrations Hub
          </span>
        </div>
        <p className="text-slate-400 text-base sm:text-lg font-normal font-['Inter']">
          50+ integrations to streamline operations, boost revenue, and delight customers.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 bg-zinc-800/90 border border-zinc-700/80 rounded-[5px] inline-flex items-center gap-1.5 shadow-sm">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          <span className="text-white text-sm font-bold font-['Inter']">
            {installedCount}
          </span>
          <span className="text-neutral-400 text-sm font-normal font-['Inter']">
            apps installed
          </span>
        </div>
      </div>
    </div>
  );
}
