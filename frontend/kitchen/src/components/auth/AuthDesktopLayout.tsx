'use client';

import React from 'react';
import Image from 'next/image';
import { TavonzaLogo } from '../TavonzaLogo';
import { Sparkles, ChefHat, CheckCircle2, Flame } from 'lucide-react';

interface AuthDesktopLayoutProps {
  children: React.ReactNode;
}

export default function AuthDesktopLayout({ children }: AuthDesktopLayoutProps) {
  return (
    <div className="w-full min-h-screen bg-[#070709] text-white flex flex-col justify-center items-center p-3 sm:p-6 lg:p-8 relative font-sans overflow-x-hidden">
      {/* Background Ambient Glow for Desktop */}
      <div className="hidden lg:block absolute top-1/4 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="hidden lg:block absolute bottom-1/4 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container: Mobile = Single Column, Desktop = 2-Column Split */}
      <div className="w-full max-w-md lg:max-w-6xl lg:min-h-[720px] bg-neutral-950/95 border border-white/10 lg:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-10 transition-all duration-300">
        {/* LEFT COLUMN: Visible ONLY on Desktop */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 bg-neutral-900/90 overflow-hidden select-none border-r border-white/10">
          {/* Moving Background Image Showcase */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/slide1.jpg"
              alt="Tavonza Kitchen Display Station"
              fill
              className="object-cover scale-105 opacity-40 mix-blend-luminosity"
              priority
            />
            {/* Rich Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-transparent to-neutral-950/60" />
          </div>

          {/* Top Header: Brand Logo & Station Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <TavonzaLogo size="md" />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold backdrop-blur-md">
              <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              <span>Kitchen Display Terminal</span>
            </div>
          </div>

          {/* Middle: Headline Text */}
          <div className="relative z-10 my-auto py-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-xs font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Live Prep Queue & Order Orchestration</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight font-['Inter']">
                Orchestrate your kitchen <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
                  with Intelligent Speed
                </span>
              </h1>
              <p className="text-sm text-zinc-300 max-w-md font-['Inter'] leading-relaxed">
                Real-time ticket routing, live station synchronization, recipe steps, and instant item fulfillment.
              </p>
            </div>
          </div>

          {/* Bottom: Station Stats Badge */}
          <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Auto-synced with POS & Tables</span>
            </div>
            <span className="text-amber-400/80 font-mono font-medium">KDS Station Terminal v2.4</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication Form Container */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative bg-neutral-950/80">
          <div className="w-full max-w-sm mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
