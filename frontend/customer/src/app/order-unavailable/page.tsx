'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, ArrowRight, Utensils } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DesktopSplitLayout from '@/components/layout/DesktopSplitLayout';

function UnavailableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tableNumber } = useCart();

  const activeTable = searchParams.get('table') || tableNumber || 'Table 08';

  return (
    <DesktopSplitLayout
      imageSrc="/images/slide3.jpg"
      imageAlt="Tavonza Dining"
      badgeText="Item Unavailable"
      activeTable={activeTable}
      headline={
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-poppins">
          Kitchen Stock <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-400 to-yellow-400">
            Temporarily Sold Out
          </span>
        </h1>
      }
      subheadline="This seasonal dish has just sold out for today's service. Our kitchen offers plenty of freshly prepared alternatives."
      sideFooterExtra={
        <div className="p-4 bg-neutral-900/80 border border-neutral-700/60 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-yellow-400 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold font-montserrat">Explore Alternatives</span>
              <span className="text-yellow-400 text-sm font-bold">20+ Hot Gourmet Dishes</span>
            </div>
          </div>
        </div>
      }
    >
      <div className="w-full flex flex-col gap-6">
        {/* Header Back Button */}
        <header className="w-full flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => router.push(`/menu?table=${encodeURIComponent(activeTable)}`)}
            className="w-8 h-8 bg-[#191818] border border-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>

          <span className="text-xs text-zinc-400 font-montserrat">
            {activeTable}
          </span>
        </header>

        {/* Center Content: We are sorry */}
        <div className="flex flex-col items-center gap-6 text-center py-6">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-[#C52225] flex items-center justify-center bg-red-500/10 shadow-[0_0_30px_rgba(197,34,37,0.3)] animate-in zoom-in-75 duration-300">
            <XCircle className="w-10 h-10 text-[#FF0000] stroke-[2.5]" />
          </div>

          <div className="flex flex-col gap-2 max-w-xs">
            <h1 className="text-white text-xl sm:text-2xl font-medium font-poppins tracking-wide">
              We are sorry
            </h1>
            <p className="text-[#828282] text-xs sm:text-sm font-inter font-normal leading-relaxed">
              The item you ordered is currently not available with us for today&apos;s service.
            </p>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTON */}
        <div className="w-full pt-2">
          <button
            type="button"
            onClick={() => router.push(`/menu?table=${encodeURIComponent(activeTable)}`)}
            className="w-full py-4 bg-[#FFD60A] hover:bg-yellow-300 active:scale-[0.99] text-black text-sm sm:text-base font-semibold font-montserrat rounded-xl shadow-[0px_8px_20px_rgba(227,172,56,0.25)] transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Order Something Else</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </DesktopSplitLayout>
  );
}

export default function OrderUnavailablePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#111111] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <UnavailableContent />
    </Suspense>
  );
}
