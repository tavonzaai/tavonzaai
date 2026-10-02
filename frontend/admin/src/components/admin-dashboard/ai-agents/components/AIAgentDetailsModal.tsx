'use client';

import React from 'react';
import { X, Bot, Play, Pause, Zap, CheckCircle2, AlertTriangle, Info, Clock, Sparkles } from 'lucide-react';
import { AIAgentItem } from '../types';

interface AIAgentDetailsModalProps {
  agent: AIAgentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (agent: AIAgentItem) => void;
  onTriggerInstantRun: (agentId: string) => void;
}

export default function AIAgentDetailsModal({
  agent,
  isOpen,
  onClose,
  onToggleStatus,
  onTriggerInstantRun,
}: AIAgentDetailsModalProps) {
  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#131417] border border-[#242630] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between pb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white text-lg sm:text-xl font-bold font-['Inter']">
                {agent.name}
              </h2>
              <span className="text-zinc-500 text-sm font-normal font-['Inter']">
                Autonomous AI Agent · ID: {agent.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description & Impact Card */}
        <div className="p-4 bg-[#18191d] border border-zinc-800 rounded-xl space-y-2">
          <p className="text-zinc-300 text-sm sm:text-base font-normal leading-relaxed">
            {agent.description}
          </p>
          <div className="flex items-center gap-4 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-sm text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Impact: <strong className="text-green-400">{agent.impact}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-zinc-400">
              <span>Accuracy: <strong className="text-white">{agent.accuracyRate}</strong></span>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col">
            <span className="text-zinc-500 text-xs">Actions Today</span>
            <span className="text-white text-lg font-bold mt-0.5">{agent.actionsToday}</span>
          </div>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col">
            <span className="text-zinc-500 text-xs">Last Run</span>
            <span className="text-white text-sm font-semibold mt-1">{agent.lastAction}</span>
          </div>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col">
            <span className="text-zinc-500 text-xs">Autonomy</span>
            <span className="text-amber-400 text-sm font-semibold mt-1">{agent.autonomyLevel}</span>
          </div>
        </div>

        {/* Live Activity Log Stream */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-sm font-bold uppercase tracking-wider">
              Autonomous Activity Stream
            </h3>
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Live
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {agent.logs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-neutral-900/70 border border-neutral-800/80 rounded-xl flex items-start gap-2.5"
              >
                <div className="mt-0.5">
                  {log.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  ) : log.type === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-300 text-sm leading-relaxed">{log.action}</p>
                  <span className="text-zinc-500 text-xs block mt-0.5">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => onTriggerInstantRun(agent.id)}
            className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span>Trigger Instant Run</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleStatus(agent)}
              className={`py-2.5 px-5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                agent.status === 'running'
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-green-500 hover:bg-green-400 text-white font-bold'
              }`}
            >
              {agent.status === 'running' ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Agent</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Agent</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-neutral-900 border border-neutral-800 text-zinc-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
