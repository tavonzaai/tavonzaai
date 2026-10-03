'use client';

import React from 'react';
import Image from 'next/image';
import { TavonzaLogo } from '../TavonzaLogo';
import { Sparkles, Star } from 'lucide-react';

interface AuthDesktopLayoutProps {
  children: React.ReactNode;
}

export default function AuthDesktopLayout({ children }: AuthDesktopLayoutProps) {
  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col justify-center items-center p-3 sm:p-6 lg:p-8 relative font-sans overflow-x-hidden">
      {/* Background Ambient Glow for Desktop */}
      <div className="hidden lg:block absolute top-1/4 left-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="hidden lg:block absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container: Mobile = Single Column, Desktop = 2-Column Split */}
      <div className="w-full max-w-md lg:max-w-6xl lg:min-h-[720px] bg-black lg:bg-neutral-950/90 lg:rounded-3xl lg:shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-10 transition-all duration-300">
        {/* LEFT COLUMN: Visible ONLY on Desktop (hidden lg:flex) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 bg-neutral-900 overflow-hidden select-none">
          {/* Moving Background Image Showcase */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/slide1.jpg"
              alt="Tavonza AI Dining Experience"
              fill
              className="object-cover scale-105"
              priority
            />
            {/* Rich Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
            <div className="absolute inset-0 bg-radial from-transparent via-black/30 to-black/80" />
          </div>

          {/* Top Header: Brand Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <TavonzaLogo size="md" />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Powered Dining</span>
            </div>
          </div>

          {/* Middle: Headline Text */}
          <div className="relative z-10 my-auto py-8">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-['Inter']">
                Taste the future of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
                  Smart Restaurant Dining
                </span>
              </h1>
              <p className="text-sm text-white/70 max-w-md font-['Poppins'] leading-relaxed">
                Order at your table, customize your menu with AI, and checkout effortlessly in seconds.
              </p>
            </div>
          </div>

          {/* Bottom: Social Proof Badge */}
          <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-xs font-semibold text-white ml-1">4.9 / 5</span>
            </div>
            <span className="text-xs text-white/50 font-['Poppins']">Trusted by 10,000+ foodies</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication Form Container (Visible on Mobile & Desktop) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-6 lg:p-10 relative">
          <div className="w-full max-w-sm mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
