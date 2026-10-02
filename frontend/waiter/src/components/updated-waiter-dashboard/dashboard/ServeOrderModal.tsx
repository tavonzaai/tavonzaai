'use client';

import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { DashboardTable } from '../types';

interface ServeOrderModalProps {
  table: DashboardTable | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmServed: (tableId: string) => void;
}

export default function ServeOrderModal({
  table,
  isOpen,
  onClose,
  onConfirmServed,
}: ServeOrderModalProps) {
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (table) {
      const initial: Record<string, boolean> = {};
      table.trayItems.forEach((item) => {
        initial[item.id] = true; // All verified by default as seen in screenshot
      });
      setVerifiedMap(initial);
    }
  }, [table]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !table) return null;

  const toggleVerify = (itemId: string) => {
    setVerifiedMap((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleServe = () => {
    onConfirmServed(table.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 new-dashbord-modal-backdrop bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-[#16161a] border border-zinc-800/90 rounded-2xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col space-y-6 relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white text-xl sm:text-2xl font-bold tracking-tight font-['Inter']">
              Serve Order to {table.tableName}
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm font-normal mt-1">
              Handheld Touch Action.Delivering tray items to guests
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0 ml-3"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4 text-amber-500/90" />
          </button>
        </div>

        {/* Inner Card: Tray items Verification */}
        <div className="bg-[#1a1a1e] border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col space-y-3.5">
          <div className="text-zinc-300 text-sm font-semibold font-['Inter']">
            Tray items Verification
          </div>

          <div className="space-y-2.5">
            {table.trayItems.length > 0 ? (
              table.trayItems.map((item) => {
                const isChecked = verifiedMap[item.id] ?? true;
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleVerify(item.id)}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#222226] border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                          isChecked
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-zinc-800 border-zinc-600 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span className="text-zinc-200 text-xs sm:text-sm font-normal font-['Inter']">
                        {item.name}
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800/90 border border-zinc-700/60 px-2 py-0.5 rounded tracking-wider uppercase">
                      {item.source}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-zinc-400 text-xs">
                No individual tray items registered.
              </div>
            )}
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleServe}
          className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-black font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center"
        >
          Mark All Items Served Now
        </button>
      </div>
    </div>
  );
}
