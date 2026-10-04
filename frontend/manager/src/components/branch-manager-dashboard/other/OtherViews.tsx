'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { NavigationTab } from '../types';

interface OtherViewsProps {
  tab: NavigationTab | string;
  onSelectTable?: (id: string) => void;
}

export default function OtherViews({ tab }: OtherViewsProps) {
  const displayTab = typeof tab === 'string' ? tab : 'Module';

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      <div>
        <h1 className="text-white text-3xl font-semibold font-['Inter'] tracking-tight capitalize">
          {displayTab.replace('-', ' ')}
        </h1>
        <p className="text-neutral-500 text-sm font-['Inter'] mt-0.5">
          Branch #01 Flagship Management and Operations Suite
        </p>
      </div>

      <div className="p-8 bg-neutral-900/80 border border-neutral-800 rounded-xl flex flex-col items-center justify-center text-center gap-3 min-h-[300px]">
        <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-white text-lg font-semibold font-['Poppins']">
          {displayTab.toUpperCase()} Module Active
        </h3>
        <p className="text-neutral-400 text-xs max-w-md">
          Live telemetry and database sync connected to Branch #01. Real-time updates from floor, POS, and kitchen are actively streaming.
        </p>
      </div>
    </div>
  );
}
