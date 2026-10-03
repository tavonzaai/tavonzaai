'use client';

import React from 'react';
import { AIAgentItem } from '../types';
import {
  Brain,
  Pause,
  Play,
} from 'lucide-react';

interface AIAgentCardProps {
  agent: AIAgentItem;
  onToggleStatus: (agent: AIAgentItem) => void;
  onOpenDetails: (agent: AIAgentItem) => void;
}

export default function AIAgentCard({
  agent,
  onToggleStatus,
  onOpenDetails,
}: AIAgentCardProps) {
  const getStatusBadge = () => {
    switch (agent.status) {
      case 'running':
        return (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse flex-shrink-0" />
            <span className="text-[#22c55e] text-sm font-semibold font-['Inter'] leading-4">
              Running
            </span>
          </div>
        );
      case 'paused':
        return (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#eab308] flex-shrink-0" />
            <span className="text-[#eab308] text-sm font-semibold font-['Inter'] leading-4">
              Paused
            </span>
          </div>
        );
      case 'idle':
        return (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#64748b] flex-shrink-0" />
            <span className="text-[#94a3b8] text-sm font-semibold font-['Inter'] leading-4">
              Idle
            </span>
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-[#0f1013] border border-[#1e2026] hover:border-[#2f333e] rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-2xl group">
      <div>
        {/* 1. Header: Purple Brain Icon + Title + Status */}
        <div
          onClick={() => onOpenDetails(agent)}
          className="flex items-center gap-3.5 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#1b1928] border border-[#2e2942] flex items-center justify-center flex-shrink-0 text-[#a855f7] shadow-inner group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6 stroke-[1.75]" />
          </div>

          <div className="flex flex-col min-w-0">
            <h3 className="text-white text-lg font-bold font-['Inter'] leading-snug group-hover:text-amber-400 transition-colors truncate">
              {agent.name}
            </h3>
            <div className="mt-0.5">{getStatusBadge()}</div>
          </div>
        </div>

        {/* 2. Description */}
        <p
          onClick={() => onOpenDetails(agent)}
          className="mt-5 text-[#8b92a5] text-sm sm:text-base font-normal font-['Inter'] leading-relaxed cursor-pointer"
        >
          {agent.description}
        </p>

        {/* 3. Metric Breakdown Rows matching screenshot */}
        <div
          onClick={() => onOpenDetails(agent)}
          className="mt-6 space-y-2.5 cursor-pointer"
        >
          {/* Actions Today */}
          <div className="flex items-center justify-between">
            <span className="text-[#6e7687] text-sm sm:text-base font-normal font-['Inter']">
              Actions Today
            </span>
            <span className="text-white text-sm sm:text-base font-bold font-['Inter']">
              {agent.actionsToday}
            </span>
          </div>

          {/* Last Action */}
          <div className="flex items-center justify-between">
            <span className="text-[#6e7687] text-sm sm:text-base font-normal font-['Inter']">
              Last Action
            </span>
            <span className="text-[#9ca3af] text-sm sm:text-base font-normal font-['Inter']">
              {agent.lastAction}
            </span>
          </div>

          {/* Impact */}
          <div className="flex items-center justify-between">
            <span className="text-[#6e7687] text-sm sm:text-base font-normal font-['Inter']">
              Impact
            </span>
            <span className="text-[#22c55e] text-sm sm:text-base font-bold font-['Inter']">
              {agent.impact}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Action Button (Pause Agent / Resume Agent) matching screenshot */}
      <div className="mt-6 w-full">
        {agent.status === 'running' ? (
          <button
            type="button"
            onClick={() => onToggleStatus(agent)}
            className="w-full h-11 bg-[#241c0e] hover:bg-[#2e2312] border border-[#423214]/60 text-[#f59e0b] rounded-xl inline-flex justify-center items-center gap-2 text-sm sm:text-base font-semibold font-['Inter'] transition-all duration-200 cursor-pointer active:scale-98"
          >
            {/* Custom dual-bar pause icon matching screenshot */}
            <div className="flex items-center gap-[3px]">
              <span className="w-[3px] h-3.5 bg-[#f59e0b] rounded-[1px]" />
              <span className="w-[3px] h-3.5 bg-[#f59e0b] rounded-[1px]" />
            </div>
            <span>Pause Agent</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onToggleStatus(agent)}
            className="w-full h-11 bg-[#0e2417] hover:bg-[#122e1e] border border-[#144226]/60 text-[#22c55e] rounded-xl inline-flex justify-center items-center gap-2 text-sm sm:text-base font-semibold font-['Inter'] transition-all duration-200 cursor-pointer active:scale-98"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume Agent</span>
          </button>
        )}
      </div>
    </div>
  );
}
