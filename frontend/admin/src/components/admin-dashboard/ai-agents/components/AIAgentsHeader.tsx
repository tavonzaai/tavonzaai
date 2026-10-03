'use client';

import React from 'react';
import { RotateCcw, Bot } from 'lucide-react';

interface AIAgentsHeaderProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function AIAgentsHeader({
  onRefresh,
  isRefreshing = false,
}: AIAgentsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-3xl sm:text-4xl font-semibold font-['Inter'] tracking-tight">
            AI Agents
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <Bot className="w-3 h-3 text-emerald-400" />
            Autonomous Mesh
          </span>
        </div>
        <p className="text-slate-400 text-base sm:text-lg font-normal font-['Inter']">
          Autonomous AI agents that run your restaurant operations in the background.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white text-sm font-semibold font-['Inter'] rounded-[10px] outline outline-1 outline-white/20 backdrop-blur-[10.20px] inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Analyzing...' : 'Refresh Analysis'}</span>
        </button>
      </div>
    </div>
  );
}
