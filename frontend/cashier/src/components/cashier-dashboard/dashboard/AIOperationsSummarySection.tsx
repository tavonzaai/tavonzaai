'use client';

import React from 'react';
import { Sparkles, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface AIOperationsSummaryProps {
  onOpenAIModal?: () => void;
  onViewReport?: () => void;
}

export default function AIOperationsSummarySection({
  onOpenAIModal,
  onViewReport,
}: AIOperationsSummaryProps) {
  const chips = [
    { label: 'Complete 3 pending payments', action: 'Filtering pending payments list' },
    { label: 'Verify failed card transaction', action: 'Opening card transaction TX-10579 verification' },
    { label: "Promote today's combo meal", action: 'Combo meal upsell banner highlighted on POS' },
    { label: 'Recommend desserts for orders above $40', action: 'Auto-dessert recommendation prompt activated' },
  ];

  return (
    <div className="w-full bg-white/5 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10.20px] p-6 space-y-4 font-['Inter']">
      {/* Title & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-6 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <h2 className="text-white text-sm font-bold font-['Inter'] leading-5 tracking-tight">
            Tavonza AI Operations Summary
          </h2>
          <span className="px-2 py-0.5 bg-zinc-900 rounded-[5px] text-teal-500 text-sm font-normal font-['Inter'] leading-4">
            AI Assistant
          </span>
        </div>
      </div>

      {/* Narrative Summary */}
      <p className="text-zinc-300 text-sm font-normal font-['Inter'] leading-5 max-w-5xl">
        Today&apos;s checkout operations are running smoothly. Lunch traffic is expected to increase by 20% within the next hour. Three orders are currently waiting for payment, and one card transaction requires verification. Promoting today&apos;s combo meal could increase average order value by 12%.
      </p>

      {/* Action Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {chips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => toast.info(chip.action)}
            className="h-7 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 rounded-sm outline outline-1 outline-offset-[-1px] outline-amber-500/20 text-amber-500/90 text-sm font-medium font-['Inter'] leading-4 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom CTA Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={onOpenAIModal || (() => toast.info('Opening Tavonza AI Assistant'))}
          className="h-7 px-3 py-1.5 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-sm font-semibold font-['Inter'] leading-4 rounded-md transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-white" />
          <span>Ask Tavonza AI</span>
        </button>

        <button
          type="button"
          onClick={onViewReport || (() => toast.info('Navigating to Shift AI Report'))}
          className="h-7 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-slate-200/90 hover:text-white text-sm font-medium font-['Inter'] leading-4 rounded-md outline outline-1 outline-offset-[-1px] outline-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <FileText className="w-3 h-3 text-slate-300" />
          <span>View AI Report</span>
        </button>
      </div>
    </div>
  );
}
