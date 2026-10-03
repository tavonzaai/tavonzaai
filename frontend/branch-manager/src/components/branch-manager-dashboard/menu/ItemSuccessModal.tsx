'use client';

import React from 'react';
import { CheckCircle2, Plus } from 'lucide-react';

interface ItemSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAnother: () => void;
  itemData?: {
    name?: string;
    price?: string;
    station?: string;
    category?: string;
  };
}

export default function ItemSuccessModal({
  isOpen,
  onClose,
  onCreateAnother,
  itemData,
}: ItemSuccessModalProps) {
  if (!isOpen) return null;

  const price = itemData?.price || '$65.00';
  const station = itemData?.station || 'Grill';
  const category = itemData?.category || 'Starters';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl flex flex-col items-center gap-5 text-white font-['Inter']">
        {/* Success Icon & Header matching Figma */}
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div className="w-20 h-20 rounded-full border-2 border-green-500/80 flex items-center justify-center text-green-500 shadow-[0_0_24px_rgba(34,197,94,0.3)]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-amber-400 text-sm font-normal font-['Poppins']">
            Item created successfully
          </span>

          <h3 className="text-white text-lg font-medium font-['Inter']">
            Manage Categories
          </h3>

          <p className="text-neutral-400 text-xs font-normal font-['Inter'] max-w-sm">
            The item has been added to {category} and is available on connected ordering channels.
          </p>
        </div>

        {/* 3 Stats Info Pills matching Figma */}
        <div className="w-full flex rounded-lg overflow-hidden border border-zinc-800 bg-stone-950">
          <div className="flex-1 p-3 border-r border-zinc-800 flex flex-col gap-1">
            <span className="text-neutral-500 text-xs font-normal font-['Poppins']">Price</span>
            <span className="text-white text-xs font-medium font-['Inter']">{price}</span>
          </div>

          <div className="flex-1 p-3 border-r border-zinc-800 flex flex-col gap-1">
            <span className="text-neutral-500 text-xs font-normal font-['Poppins']">
              Preparation station
            </span>
            <span className="text-white text-xs font-medium font-['Inter']">{station}</span>
          </div>

          <div className="flex-1 p-3 flex flex-col gap-1">
            <span className="text-neutral-500 text-xs font-normal font-['Poppins']">POS status</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-green-500 text-xs font-normal font-['Inter']">Live</span>
            </div>
          </div>
        </div>

        {/* Next Step Banner matching Figma */}
        <div className="w-full p-3.5 bg-gradient-to-r from-yellow-400/5 to-transparent rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 outline outline-1 outline-yellow-400/60 flex items-center justify-center text-yellow-400 text-base font-light shrink-0">
              1
            </div>
            <div className="flex flex-col">
              <span className="text-yellow-400 text-sm font-normal">Optional next step</span>
              <span className="text-zinc-400 text-xs font-normal">
                Add modifier groups such as size, cooking preference, or extras.
              </span>
            </div>
          </div>

          <button
            type="button"
            className="px-3 py-2 bg-yellow-400/10 rounded-md outline outline-1 outline-offset-[-1px] outline-yellow-400/60 flex items-center gap-1 text-yellow-400 text-sm font-medium hover:bg-yellow-400/20 transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add modifiers</span>
          </button>
        </div>

        {/* Footer Actions matching Figma */}
        <div className="w-full flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCreateAnother}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-base font-medium rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 transition cursor-pointer"
          >
            Create another
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 text-base font-medium rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 transition cursor-pointer"
          >
            View in menu
          </button>
        </div>
      </div>
    </div>
  );
}
