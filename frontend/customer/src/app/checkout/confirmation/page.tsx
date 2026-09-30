'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Sparkles, Receipt, ThumbsUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DesktopSplitLayout from '@/components/layout/DesktopSplitLayout';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tableNumber } = useCart();

  const amountParam = searchParams.get('amount') || '50.97';
  const holderParam = searchParams.get('holder') || 'Amanda';
  const activeTable = searchParams.get('table') || tableNumber || 'Table 08';

  const todayDate = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  const todayTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <DesktopSplitLayout
      imageSrc="/images/slide1.jpg"
      imageAlt="Tavonza Gourmet Experience"
      badgeText="Payment Confirmed"
      activeTable={activeTable}
      headline={
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-poppins">
          Payment Successful! <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
            Enjoy Your Meal
          </span>
        </h1>
      }
      subheadline="Your payment has been successfully recorded. An official digital receipt has been generated for your table session."
      sideFooterExtra={
        <div className="p-4 bg-neutral-900/80 border border-neutral-700/60 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold font-montserrat">Order Total</span>
              <span className="text-yellow-400 text-base font-bold">${parseFloat(amountParam).toFixed(2)}</span>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Settled
          </div>
        </div>
      }
    >
      <div className="w-full flex flex-col gap-6">
        {/* Header: Back & Title */}
        <header className="w-full flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/menu?table=${encodeURIComponent(activeTable)}`)}
              className="w-8 h-8 bg-[#191818] border border-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <h1 className="text-white text-lg font-semibold font-poppins tracking-wide">
              Confirmation
            </h1>
          </div>

          <span className="text-xs text-zinc-400 font-montserrat">
            {activeTable}
          </span>
        </header>

        {/* Hero Success Badge & Heading */}
        <div className="flex flex-col items-center gap-4 text-center pt-2">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FFD60A] flex items-center justify-center shadow-[0_0_30px_rgba(255,214,10,0.35)] animate-in zoom-in-75 duration-300">
            <Check className="w-10 h-10 text-[#1A1A1A] stroke-[3]" />
          </div>

          <div className="flex flex-col gap-1.5 max-w-xs">
            <h2 className="text-white text-xl sm:text-2xl font-bold font-['SF_Pro']">
              Thank you!
            </h2>
            <p className="text-[#ECE4D1] text-sm font-['SF_Pro'] leading-relaxed">
              Your transaction was successful
            </p>
            <span className="text-zinc-500 text-xs font-mono tracking-tight">
              #ID-22465476578390-3789
            </span>
          </div>
        </div>

        {/* RECEIPT / BILL DETAILS CARD */}
        <div className="w-full bg-[#161616] border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-2xl">
          <div className="flex flex-col gap-3 text-sm font-['SF_Pro'] text-[#F2F2F2]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Date</span>
              <span className="font-medium">{todayDate}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Time</span>
              <span className="font-medium">{todayTime}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">To</span>
              <span className="font-medium">{holderParam}</span>
            </div>

            <div className="w-full h-px bg-neutral-700/50 my-1" />

            <div className="flex items-center justify-between text-base font-bold text-white pt-1">
              <span>Total</span>
              <span className="text-yellow-400 text-xl font-bold">${parseFloat(amountParam).toFixed(2)}</span>
            </div>
          </div>

          {/* Account Banner with PAID Stamp */}
          <div className="w-full p-3.5 bg-neutral-900/90 rounded-xl border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow-400/20 text-yellow-400 font-bold flex items-center justify-center text-sm">
                T
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-semibold font-['SF_Pro']">Tavonza Dining</span>
                <span className="text-zinc-400 text-xs font-['SF_Pro']">amanda@okaxis</span>
              </div>
            </div>

            <div className="px-3 py-1 rounded border border-[#FFD60A] text-[#FFD60A] font-bold text-xs tracking-widest uppercase shadow-sm">
              PAID
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="w-full flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push(`/menu?table=${encodeURIComponent(activeTable)}`)}
            className="w-full py-3.5 bg-[#FFD60A] hover:bg-yellow-300 active:scale-[0.99] text-[#0B0B0B] text-base font-semibold font-inter rounded-xl shadow-[0px_8px_20px_rgba(227,172,56,0.35)] transition cursor-pointer"
          >
            Back to Order
          </button>

          <button
            type="button"
            onClick={() => router.push(`/feedback?table=${encodeURIComponent(activeTable)}`)}
            className="w-full py-3.5 bg-white hover:bg-neutral-100 active:scale-[0.99] text-[#0B0B0B] text-base font-semibold font-inter rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
          >
            <ThumbsUp className="w-4 h-4 text-neutral-900" />
            <span>Submit Review</span>
          </button>
        </div>
      </div>
    </DesktopSplitLayout>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#111111] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
