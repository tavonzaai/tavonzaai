'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthSuccessModalProps {
  onClose: () => void;
  autoHideMs?: number;
}

export default function AuthSuccessModal({
  onClose,
  autoHideMs = 3000,
}: AuthSuccessModalProps) {
  // Auto-hide after 3 seconds (3000ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, autoHideMs);

    return () => clearTimeout(timer);
  }, [onClose, autoHideMs]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 font-sans">
      <div className="w-full max-w-sm md:max-w-md bg-neutral-900 border border-yellow-400/30 rounded-3xl p-6 shadow-2xl shadow-yellow-500/10 relative flex flex-col items-center justify-center text-center text-white gap-5 animate-in zoom-in-95">
        {/* Glow checkmark icon */}
        <div className="w-16 h-16 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shadow-xl shadow-yellow-500/20">
          <CheckCircle2 className="w-9 h-9 stroke-[2]" />
        </div>

        {/* Headline & Description */}
        <div className="flex flex-col items-center gap-1.5">
          <h2 className="text-xl font-bold font-['Outfit'] text-white">Authenticated!</h2>
          <p className="text-xs text-neutral-300 max-w-xs leading-relaxed font-['Inter']">
            Welcome to <span className="text-yellow-400 font-semibold">Tavonza AI</span>. Your dining preferences and table sessions are ready.
          </p>
        </div>

        {/* Explore Button */}
        <button
          onClick={onClose}
          className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.99] text-black font-semibold text-xs md:text-sm rounded-full flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition"
        >
          <span>Explore Menu & Restaurants</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
