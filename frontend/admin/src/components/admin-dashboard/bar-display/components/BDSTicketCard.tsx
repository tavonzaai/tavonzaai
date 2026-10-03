'use client';

import React from 'react';
import { Clock, Play, Check, CheckCheck, Wine } from 'lucide-react';
import { BarOrder } from '../types';

export interface BDSTicketCardProps {
  order: BarOrder;
  onAdvanceStatus: (order: BarOrder) => void;
}

export default function BDSTicketCard({
  order,
  onAdvanceStatus,
}: BDSTicketCardProps) {
  // Format elapsed seconds into mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isQueued = order.status === 'Queued';
  const isMixing = order.status === 'Mixing';
  const isReady = order.status === 'Ready';

  return (
    <div className="w-full h-56 relative bg-white/5 rounded-[10px] border border-white/10 backdrop-blur-[10.20px] overflow-hidden p-3.5 flex flex-col justify-between shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] hover:border-white/20 transition-all duration-200">
      {/* Top Header Row */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {order.isRush && (
              <div className="px-1.5 py-0.5 bg-yellow-500/20 rounded-sm inline-flex items-center">
                <span className="text-yellow-500 text-[10px] font-bold font-['Inter'] uppercase tracking-tight">
                  Rush
                </span>
              </div>
            )}
            <span className="text-white text-base font-medium font-mono">
              {order.id}
            </span>
            <div className="px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-[5px] inline-flex items-center">
              <span className="text-white text-sm font-medium font-['Inter']">
                {order.tableId}
              </span>
            </div>
          </div>

          {/* Elapsed Timer Clock */}
          <div className="flex items-center gap-1">
            <Clock
              className={`w-3.5 h-3.5 ${
                isReady ? 'text-green-400' : 'text-white/50'
              }`}
            />
            <span
              className={`text-sm font-medium font-mono ${
                isReady ? 'text-green-400' : 'text-white/50'
              }`}
            >
              {formatTime(order.elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-b border-neutral-700/80 my-2" />

        {/* Drink Line Items */}
        <div className="space-y-1.5 max-h-24 overflow-y-auto no-scrollbar pr-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="leading-snug">
              <div className="flex items-baseline text-base font-['Inter']">
                <span className="text-yellow-500 font-semibold mr-1.5 shrink-0">
                  ×{item.quantity}
                </span>
                <span className="text-white font-normal truncate">
                  {item.name}
                </span>
              </div>
              {item.note && (
                <div className="pl-5 text-yellow-600/90 text-xs font-normal font-['Inter'] italic">
                  {item.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Server Name & Action Button */}
      <div className="space-y-2 pt-2">
        <div className="text-white/30 text-xs font-normal font-['Inter']">
          Serve: {order.server}
        </div>

        {/* Action Button */}
        {isQueued && (
          <button
            type="button"
            onClick={() => onAdvanceStatus(order)}
            className="w-full h-8 bg-indigo-700 hover:bg-indigo-600 active:scale-[0.99] rounded-[10px] flex items-center justify-center gap-1.5 transition text-white text-sm font-bold font-['Inter'] cursor-pointer shadow-md shadow-indigo-900/30"
          >
            <Wine className="w-3.5 h-3.5" />
            <span>Start Mixing</span>
          </button>
        )}

        {isMixing && (
          <button
            type="button"
            onClick={() => onAdvanceStatus(order)}
            className="w-full h-8 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.99] rounded-[10px] flex items-center justify-center gap-1.5 transition text-white text-sm font-bold font-['Inter'] cursor-pointer shadow-md shadow-yellow-500/20"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Mark Ready</span>
          </button>
        )}

        {isReady && (
          <button
            type="button"
            onClick={() => onAdvanceStatus(order)}
            className="w-full h-8 bg-green-700 hover:bg-green-600 active:scale-[0.99] rounded-[10px] flex items-center justify-center gap-1.5 transition text-white text-sm font-bold font-['Inter'] cursor-pointer shadow-md shadow-green-900/30"
          >
            <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Mark Served</span>
          </button>
        )}
      </div>
    </div>
  );
}
