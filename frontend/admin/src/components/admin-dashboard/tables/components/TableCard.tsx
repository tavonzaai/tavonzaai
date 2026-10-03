'use client';

import React from 'react';
import { TableFloorItem } from '../types';

export interface TableCardProps {
  table: TableFloorItem;
  onClickTable: (table: TableFloorItem) => void;
}

export default function TableCard({ table, onClickTable }: TableCardProps) {
  const isOccupied = table.status === 'Occupied';
  const isAvailable = table.status === 'Available';
  const isReserved = table.status === 'Reserved';

  // Container styling based on status
  const cardBgClass = isOccupied
    ? 'bg-red-500/10 border-orange-600/30 hover:border-orange-500/80 shadow-[0px_0px_6px_0px_rgba(234,88,12,0.15)]'
    : isAvailable
    ? 'bg-green-700/20 border-emerald-500/30 hover:border-emerald-400/80 shadow-[0px_0px_6px_0px_rgba(16,185,129,0.15)]'
    : 'bg-gray-900/90 border-blue-500/30 hover:border-blue-400/80 shadow-[0px_0px_6px_0px_rgba(59,130,246,0.15)]';

  // Status badge styling
  const statusBadgeClass = isOccupied
    ? 'bg-orange-700/20 text-orange-500'
    : isAvailable
    ? 'bg-green-700/20 text-green-400'
    : 'bg-blue-700/20 text-blue-400';

  return (
    <div
      onClick={() => onClickTable(table)}
      className={`w-full h-56 relative rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[10.20px] overflow-hidden p-3.5 flex flex-col justify-between border transition-all duration-200 hover:scale-[1.02] cursor-pointer group ${cardBgClass}`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-2 bg-amber-500 rounded-full" />
          <h3 className="text-white text-lg font-semibold font-['Inter'] leading-6">
            {table.id}
          </h3>
        </div>

        <div
          className={`px-2 py-0.5 rounded-[5px] inline-flex items-center text-xs font-medium font-['Inter'] leading-4 ${statusBadgeClass}`}
        >
          {table.status}
        </div>
      </div>

      {/* Center Party Size Box */}
      <div className="flex flex-col items-center justify-center my-0.5">
        <div className="w-16 h-10 bg-white/5 rounded-[5px] border border-white/10 backdrop-blur-[10.20px] inline-flex justify-center items-center">
          <span className="text-zinc-300 text-2xl font-bold font-['Inter'] leading-4">
            {table.currentPartySize > 0 ? `${table.currentPartySize}p` : '0p'}
          </span>
        </div>
        <span className="text-stone-300 text-sm font-normal font-['Inter'] leading-4 mt-1">
          Capacity: {table.capacity} seats
        </span>
      </div>

      {/* Bottom Metadata Breakdown */}
      <div className="space-y-1 text-sm font-['Inter']">
        {/* Server */}
        <div className="flex items-center justify-between">
          <span className="text-stone-300 font-normal">Server</span>
          <span className="flex-1 mx-2 border-b border-dashed border-zinc-700/50" />
          <span className="text-white font-semibold">{table.server}</span>
        </div>

        {/* Seated */}
        <div className="flex items-center justify-between">
          <span className="text-stone-300 font-normal">Seated</span>
          <span className="flex-1 mx-2 border-b border-dashed border-zinc-700/50" />
          <span className="text-white font-medium font-mono">
            {table.seatedTime}
          </span>
        </div>

        {/* Bill */}
        <div className="flex items-center justify-between">
          <span className="text-stone-300 font-normal">Bill</span>
          <span className="flex-1 mx-2 border-b border-dashed border-zinc-700/50" />
          <span className="text-yellow-500 font-medium font-mono">
            ${table.billAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
