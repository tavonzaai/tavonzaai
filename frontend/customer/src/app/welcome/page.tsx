'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { TavonzaLogoIcon } from '@/components/TavonzaLogo';

import { getCookie, setCookie } from '@/redux/api/baseApi';

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tableName, setTableName] = useState('Table 08');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      const formatted = tableParam.toLowerCase().startsWith('table')
        ? tableParam
        : `Table ${tableParam.padStart(2, '0')}`;
      setTableName(formatted);
      if (typeof window !== 'undefined') {
        setCookie('tavonza_table', formatted);
      }
    } else if (typeof window !== 'undefined') {
      const saved = getCookie('tavonza_table');
      if (saved) {
        setTableName(saved);
      }
    }
  }, [searchParams]);

  const handleViewMenu = () => {
    const tableParam = searchParams.get('table') || tableName.replace(/[^0-9]/g, '');
    router.push(tableParam ? `/menu?table=${tableParam}` : '/menu');
  };

  return (
    <div className="w-full min-h-screen relative flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black text-white px-4 py-8 sm:p-6 lg:p-10 select-none">
      {/* Background Restaurant Image with Deep Ambient Overlays */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/slide1.jpg"
          alt="Restaurant Ambiance"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25 scale-105 filter blur-[2px]"
        />
        {/* Figma Gradients: from-black/70 via-black/40 to-black/90 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/95" />
        {/* Radial ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-amber-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-[100px] hidden md:block" />
      </div>

      {/* Main Responsive Card Container: Perfect for Mobile, Tablet & Desktop */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center justify-between min-h-[640px] sm:min-h-[700px] bg-black/65 sm:bg-neutral-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-500">
        
        {/* TOP SECTION: Logo + Title + Subtitle + Decorative Lines */}
        <div className="w-full flex flex-col items-center gap-5 sm:gap-6 pt-2">
          
          {/* Brand Logo / Emblem */}
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl flex items-center justify-center p-1.5 transition-transform hover:scale-105 duration-300">
            {!imageError ? (
              <Image
                src="/images/image 11.png"
                alt="Tavonza Logo"
                width={86}
                height={85}
                className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(250,204,21,0.25)]"
                priority
                onError={() => setImageError(true)}
              />
            ) : (
              <TavonzaLogoIcon className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_4px_12px_rgba(250,204,21,0.3)]" />
            )}
          </div>

          {/* Title & Subtitle block */}
          <div className="w-full flex flex-col items-center gap-3">
            <h1 className="text-center text-white text-3xl sm:text-4xl lg:text-[42px] font-normal font-poppins leading-tight tracking-wide">
              Welcome to <br />
              <span className="font-semibold tracking-wider">TAVONZA</span>
            </h1>

            <div className="text-center text-orange-400 text-xs sm:text-sm font-semibold font-montserrat tracking-[0.25em] uppercase">
              BAR &amp; RESTAURANT
            </div>

            {/* Geometric Divider: Two horizontal lines with a center dot */}
            <div className="w-24 h-3 relative flex items-center justify-center my-0.5">
              <div className="w-9 h-[1.5px] bg-orange-400 rounded-full" />
              <div className="w-1.5 h-1.5 mx-2 bg-orange-400 rounded-full shrink-0 shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
              <div className="w-9 h-[1.5px] bg-orange-400 rounded-full" />
            </div>
          </div>

          {/* Description */}
          <p className="text-center text-stone-200 text-sm sm:text-base font-normal font-montserrat leading-relaxed tracking-wide max-w-[280px] sm:max-w-xs px-2">
            Scan complete! Explore our digital menu and place your order in just a few taps.
          </p>

          {/* Table Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-white rounded-lg shadow-md transition-colors duration-200">
            {/* Table icon with golden outline matching Figma specs */}
            <div className="w-3.5 h-3.5 relative flex items-center justify-center shrink-0">
              <svg
                className="w-3.5 h-3.5 text-yellow-500"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="2" y="2" width="10" height="7" rx="1" stroke="#EAB308" strokeWidth="1.2" />
                <path d="M4 9V12M10 9V12" stroke="#EAB308" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="7" cy="5.5" r="1" fill="#EAB308" />
              </svg>
            </div>
            <span className="text-black text-sm font-medium font-montserrat leading-5">
              {tableName}
            </span>
          </div>
        </div>

        {/* BOTTOM SECTION: CTA Button + Footer Note */}
        <div className="w-full flex flex-col items-center gap-5 pt-8 pb-2">
          {/* Primary View Menu CTA Button */}
          <button
            type="button"
            onClick={handleViewMenu}
            className="w-full max-w-xs sm:max-w-sm py-3.5 sm:py-4 px-6 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-neutral-950 text-base sm:text-lg font-semibold font-montserrat rounded-xl shadow-[0px_8px_20px_0px_rgba(227,172,56,0.35)] hover:shadow-[0px_10px_25px_0px_rgba(227,172,56,0.5)] transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <span>View Menu</span>
          </button>

          {/* Footer Branding */}
          <p className="text-center text-neutral-400 hover:text-neutral-300 transition-colors text-xs font-normal font-montserrat tracking-wider">
            Powered by Tavonza Digital Ordering
          </p>
        </div>

      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WelcomeContent />
    </Suspense>
  );
}
