'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DesktopSplitLayout from '@/components/layout/DesktopSplitLayout';

function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tableNumber } = useCart();

  const activeTable = searchParams.get('table') || tableNumber || 'Table 08';

  return (
    <DesktopSplitLayout
      imageSrc="/images/slide2.jpg"
      imageAlt="Tavonza Hospitality"
      badgeText="Review Recorded"
      activeTable={activeTable}
      headline={
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-poppins">
          Thank You For <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
            Dining With Us!
          </span>
        </h1>
      }
      subheadline="Your honest review helps our kitchen and service team maintain the highest standards of culinary quality."
    >
      <div className="w-full flex flex-col items-center gap-6 text-center">
        {/* Center Graphic */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-yellow-400/10 border-2 border-yellow-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(255,214,10,0.35)] animate-in zoom-in-75 duration-300">
          <Star className="w-10 h-10 text-[#FFD60A] fill-[#FFD60A]" />
        </div>

        <div className="flex flex-col gap-2 max-w-xs">
          <h1 className="text-white text-2xl sm:text-3xl font-bold font-poppins tracking-wide">
            Thank You!
          </h1>
          <p className="text-[#ECE4D1] text-xs sm:text-sm font-montserrat font-normal leading-relaxed">
            Your feedback was successfully received. We look forward to serving you again soon!
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full pt-4">
          <button
            type="button"
            onClick={() => router.push(`/menu?table=${encodeURIComponent(activeTable)}`)}
            className="w-full py-4 bg-[#FFD60A] hover:bg-yellow-300 active:scale-[0.99] text-[#0B0B0B] text-base font-semibold font-montserrat rounded-xl shadow-[0px_8px_20px_rgba(227,172,56,0.35)] transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Back To Order Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </DesktopSplitLayout>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
