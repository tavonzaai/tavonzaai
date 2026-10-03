'use client';

import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { mockAIUpsellSuggestions } from '../data';
import { toast } from 'sonner';

export default function AIUpsellSuggestionsSection() {
  const handleApplySuggestions = () => {
    toast.success('AI Upsell suggestions pushed to all active POS registers.');
  };

  return (
    <div className="bg-white/10 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl p-6 font-['Inter'] shadow-lg flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-white text-lg font-semibold font-['Inter'] leading-tight">
              AI Upsell Suggestions
            </h2>
            <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-4 mt-1">
              Increase Order Value
            </p>
          </div>

          <div className="text-amber-500 text-sm font-medium font-['Inter'] flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Powered by AI</span>
          </div>
        </div>

        {/* Suggestion Items */}
        <div className="space-y-2.5">
          {mockAIUpsellSuggestions.map((item) => (
            <div
              key={item.id}
              className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/5 transition-colors flex items-center gap-3.5"
            >
              <div className="text-2xl flex-shrink-0">{item.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="text-white text-sm font-medium font-['Inter'] leading-tight">
                  {item.title}
                </div>
                <div className="text-neutral-400 text-xs font-normal font-['Inter'] leading-4 mt-0.5">
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Button: Apply Suggestions */}
      <div className="pt-4">
        <button
          type="button"
          onClick={handleApplySuggestions}
          className="w-full h-9 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 rounded-lg text-white text-base font-semibold font-['Inter'] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Apply Suggestions</span>
        </button>
      </div>
    </div>
  );
}
