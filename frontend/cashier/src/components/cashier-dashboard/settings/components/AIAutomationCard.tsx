'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { CashierAutomationSettings } from '../types';

interface AIAutomationCardProps {
  automation: CashierAutomationSettings;
  onChange: (updated: Partial<CashierAutomationSettings>) => void;
}

export const AIAutomationCard: React.FC<AIAutomationCardProps> = ({
  automation,
  onChange,
}) => {
  const items = [
    {
      key: 'aiUpsellSuggestions' as const,
      label: 'AI Upsell Suggestions',
      value: automation.aiUpsellSuggestions,
    },
    {
      key: 'autoPrintReceipt' as const,
      label: 'Auto-Print Receipt',
      value: automation.autoPrintReceipt,
    },
    {
      key: 'darkMode' as const,
      label: 'Dark Mode',
      value: automation.darkMode,
    },
  ];

  return (
    <div className="p-4 md:p-5 bg-zinc-900 rounded-[10px] border border-white/5 space-y-3.5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-yellow-500/20 border border-yellow-500/20 rounded-lg flex items-center justify-center text-amber-500 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <h2 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-4">
          AI & Automation
        </h2>
      </div>

      {/* Toggle List */}
      <div className="divide-y divide-white/5 pt-1">
        {items.map((item) => (
          <div
            key={item.key}
            className="py-3 flex items-center justify-between gap-4"
          >
            <span className="text-white/80 text-sm font-normal font-['Plus_Jakarta_Sans'] leading-4">
              {item.label}
            </span>

            {/* Custom Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={item.value}
              onClick={() => onChange({ [item.key]: !item.value })}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative ${
                item.value ? 'bg-amber-500' : 'bg-gray-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  item.value ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
