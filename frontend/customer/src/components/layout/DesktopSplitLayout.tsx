'use client';

import React from 'react';
import Image from 'next/image';
import { TavonzaLogo } from '@/components/TavonzaLogo';
import { Sparkles, Star, UtensilsCrossed } from 'lucide-react';

export interface DesktopSplitLayoutProps {
  children: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  badgeText?: string;
  headline?: React.ReactNode;
  subheadline?: string;
  activeTable?: string;
  ratingText?: string;
  reviewsText?: string;
  maxWidth?: string; // defaults to 'max-w-5xl lg:max-w-6xl'
  minHeight?: string; // defaults to 'lg:min-h-[680px]'
  sideFooterExtra?: React.ReactNode;
}

export default function DesktopSplitLayout({
  children,
  imageSrc = '/images/slide1.jpg',
  imageAlt = 'Tavonza Smart Dining',
  badgeText = 'AI Powered Dining',
  headline,
  subheadline = 'Order at your table, customize your menu with AI, and enjoy seamless culinary excellence.',
  activeTable,
  ratingText = '4.9 / 5',
  reviewsText = 'Loved by 10,000+ foodies',
  maxWidth = 'max-w-md lg:max-w-6xl',
  minHeight = 'lg:min-h-[700px]',
  sideFooterExtra,
}: DesktopSplitLayoutProps) {
  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col justify-center items-center p-0 sm:p-4 lg:p-8 relative font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">
      {/* Background Ambient Glows on Desktop */}
      <div className="hidden lg:block absolute top-1/4 left-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="hidden lg:block absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card: Mobile = Single Column, Desktop = 2-Column Split */}
      <div
        className={`w-full ${maxWidth} ${minHeight} bg-black lg:bg-neutral-950/95 lg:border lg:border-white/10 lg:rounded-3xl lg:shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col lg:flex-row relative z-10 transition-all duration-300`}
      >
        {/* LEFT COLUMN: VISIBLE ON DESKTOP & TABLET LANDSCAPE (hidden lg:flex) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 bg-neutral-900/90 overflow-hidden select-none border-r border-white/5">
          {/* Background Image Showcase */}
          <div className="absolute inset-0 z-0">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover opacity-35 scale-105 transition-transform duration-700 hover:scale-110"
              priority
            />
            {/* Dark & Gold Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-black/40" />
            <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-neutral-950/90" />
          </div>

          {/* Top Row: Brand Logo + Table/Status Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <TavonzaLogo size="md" />
            </div>
            <div className="flex items-center gap-2">
              {activeTable && (
                <div className="px-3 py-1 rounded-full bg-neutral-900/80 border border-neutral-700 text-xs font-montserrat text-white/90 backdrop-blur-md">
                  🍽️ {activeTable}
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badgeText}</span>
              </div>
            </div>
          </div>

          {/* Middle: Headline & Highlights */}
          <div className="relative z-10 my-auto py-8 space-y-4">
            <div className="space-y-2.5">
              {headline ? (
                typeof headline === 'string' ? (
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-poppins">
                    {headline}
                  </h1>
                ) : (
                  headline
                )
              ) : (
                <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-poppins">
                  Taste the future of <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
                    Smart Dining
                  </span>
                </h1>
              )}

              <p className="text-sm text-neutral-300/80 max-w-md font-poppins leading-relaxed">
                {subheadline}
              </p>
            </div>

            {sideFooterExtra && (
              <div className="pt-2">
                {sideFooterExtra}
              </div>
            )}
          </div>

          {/* Bottom: Social Proof & Experience Rating */}
          <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-xs font-semibold text-white ml-1">{ratingText}</span>
            </div>
            <span className="text-xs text-neutral-400 font-poppins">{reviewsText}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Content Container */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 xl:p-10 relative overflow-y-auto max-h-[92vh] lg:max-h-none">
          <div className="w-full max-w-md mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
