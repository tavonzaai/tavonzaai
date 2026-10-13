'use client';

import React from 'react';
import {
  Search,
  Mic,
  Sparkles,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { NotificationCenter } from '../../common/NotificationCenter';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onOpenVoice: () => void;
  onOpenAI: () => void;
  onToggleSidebar: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  onOpenVoice,
  onOpenAI,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-20 bg-black/95 backdrop-blur-md border-b border-zinc-800/80 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.15)] flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile Menu Button & Branch Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch Selector (From Figma) */}
        <div className="h-9 px-3 py-1.5 bg-zinc-900 rounded-lg outline outline-1 outline-zinc-800 flex items-center gap-2 hover:bg-zinc-800/80 transition-colors cursor-pointer select-none">
          <span className="w-2 h-2 bg-emerald-500 rounded-full opacity-80 animate-pulse" />
          <span className="text-slate-400 text-xs font-medium font-['Inter'] hidden sm:inline">
            Tavonza Group /
          </span>
          <span className="text-white text-xs sm:text-sm font-medium font-['Inter']">
            Downtown Branch
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      {/* Middle: Search Input (From Figma) */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
        <div className="w-full relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tables, orders, guests…"
            className="w-full h-9 pl-9 pr-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-['DM_Sans']"
          />
        </div>
      </div>

      {/* Right Controls: Voice, AI Alerts, Waiter Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Voice Trigger (From Figma) */}
        <button
          onClick={onOpenVoice}
          className="h-9 px-3 rounded-[5px] outline outline-1 outline-amber-500/30 hover:bg-amber-500/10 flex items-center gap-1.5 transition-all text-amber-500 group cursor-pointer"
          title="Activate Voice Co-Pilot"
        >
          <Mic className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium font-['DM_Sans']">Voice</span>
        </button>

        {/* AI Notification Alert (Purple badge 4 from Figma) */}
        <button
          onClick={onOpenAI}
          className="relative p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="4 AI Operations Alerts"
        >
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md">
            4
          </span>
        </button>

        {/* Waiter Profile Card & Notification Bell (From Figma) */}
        <div className="h-11 sm:h-12 bg-zinc-900 border border-zinc-800/80 rounded-lg pl-2 pr-3 py-1 flex items-center gap-2 sm:gap-3">
          {/* Realtime Notification Center */}
          <NotificationCenter />

          {/* Divider */}
          <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

          {/* Avatar & Waiter Info */}
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-black font-bold text-xs shadow-md">
              MD
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-slate-200 text-xs sm:text-sm font-medium leading-none font-['Plus_Jakarta_Sans']">
                Michael Davis
              </span>
              <span className="text-[10px] font-medium leading-none mt-1">
                <span className="text-slate-400">Waiter </span>
                <span className="text-emerald-500 font-bold">· </span>
                <span className="text-emerald-400 font-semibold">Shift Active</span>
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
}
