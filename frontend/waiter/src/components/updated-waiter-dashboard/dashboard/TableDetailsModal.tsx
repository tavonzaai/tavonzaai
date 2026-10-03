'use client';

import React, { useEffect } from 'react';
import { Clock, Users, Utensils, X } from 'lucide-react';
import { DashboardTable } from '../types';

interface TableDetailsModalProps {
  table: DashboardTable | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TableDetailsModal({
  table,
  isOpen,
  onClose,
}: TableDetailsModalProps) {
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
        className="w-full max-w-[480px] bg-[#16161a] border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col space-y-5 relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white text-xl font-bold font-['Inter']">
                {table.tableName} Overview
              </h3>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded uppercase">
                {table.zone}
              </span>
            </div>
            <p className="text-zinc-400 text-xs mt-1">
              Assigned Waiter: {table.waiterName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#1c1c20] border border-zinc-800/80 rounded-xl p-3 flex flex-col items-center text-center">
            <Clock className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-zinc-400 text-[11px]">Dwell Time</span>
            <span className="text-white font-bold text-sm font-mono">{table.timeElapsed}</span>
          </div>
          <div className="bg-[#1c1c20] border border-zinc-800/80 rounded-xl p-3 flex flex-col items-center text-center">
            <Users className="w-4 h-4 text-blue-400 mb-1" />
            <span className="text-zinc-400 text-[11px]">Guests</span>
            <span className="text-white font-bold text-sm font-mono">{table.guestsCount}</span>
          </div>
          <div className="bg-[#1c1c20] border border-zinc-800/80 rounded-xl p-3 flex flex-col items-center text-center">
            <Utensils className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-zinc-400 text-[11px]">Course Status</span>
            <span className="text-white font-bold text-sm truncate w-full">{table.statusLabel}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-[#18181c] border border-zinc-800/90 rounded-xl p-4 space-y-1.5">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Special Notes / Requests
          </div>
          <p className="text-zinc-300 text-sm font-['Inter']">
            {table.notes}
          </p>
        </div>

        {/* Active Order Items */}
        {table.trayItems.length > 0 && (
          <div className="bg-[#18181c] border border-zinc-800/90 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Active Order Items ({table.orderId || '#10582'})
            </div>
            <div className="space-y-1.5">
              {table.trayItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-zinc-800/50 last:border-b-0">
                  <span className="text-zinc-300">{item.name}</span>
                  <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
                    {item.source}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm rounded-xl transition-colors cursor-pointer"
        >
          Close Overview
        </button>
      </div>
    </div>
  );
}
