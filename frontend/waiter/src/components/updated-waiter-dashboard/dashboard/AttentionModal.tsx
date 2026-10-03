'use client';

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, ShieldAlert, X } from 'lucide-react';
import { DashboardTable } from '../types';

interface AttentionModalProps {
  table: DashboardTable | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (tableId: string) => void;
}

export default function AttentionModal({
  table,
  isOpen,
  onClose,
  onResolve,
}: AttentionModalProps) {
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

  return (
    <div
      className="fixed inset-0 new-dashbord-modal-backdrop bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] bg-[#16161a] border border-red-500/30 rounded-2xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col space-y-5 relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold font-['Inter']">
                Table Priority Attention
              </h3>
              <p className="text-red-400 text-xs font-medium">
                {table.tableName} · {table.zone} ({table.guestsCount})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Attention Details */}
        <div className="bg-[#1f1616] border border-red-500/20 rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center gap-2 text-red-300 text-xs font-semibold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-red-400" />
            Guest Request & Allergen Inquiry
          </div>
          <p className="text-zinc-200 text-sm leading-relaxed font-['Inter']">
            {table.attentionReason || table.notes}
          </p>
        </div>

        {/* AI Chef Guidance */}
        <div className="bg-[#1a1a1e] border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="text-amber-400 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Tavonza Kitchen AI Direct Note:
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Chilean Sea Bass is prepared in 100% clarified butter and olive oil (Zero peanut oil used). Kitchen station is certified nut-free. Shellfish broth is optional on request.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm rounded-xl transition-colors"
          >
            Review Later
          </button>
          <button
            onClick={() => {
              onResolve(table.id);
              onClose();
            }}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Acknowledge & Clear
          </button>
        </div>
      </div>
    </div>
  );
}
