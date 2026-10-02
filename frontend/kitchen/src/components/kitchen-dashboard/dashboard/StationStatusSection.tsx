'use client';

import React from 'react';
import { Flame, CookingPot, Pizza, Cake } from 'lucide-react';
import { mockKitchenStations } from '../data';

const getStationIcon = (name: string) => {
  switch (name) {
    case 'Grill Station':
      return <Flame className="w-4 h-4 text-orange-400" />;
    case 'Fry Station':
      return <CookingPot className="w-4 h-4 text-yellow-400" />;
    case 'Pizza Station':
      return <Pizza className="w-4 h-4 text-emerald-400" />;
    case 'Dessert Station':
      return <Cake className="w-4 h-4 text-purple-400" />;
    default:
      return <Flame className="w-4 h-4 text-white" />;
  }
};

const getStatusDot = (status: string) => {
  switch (status) {
    case 'Busy':
      return 'bg-red-500 text-red-400 border-red-500/20';
    case 'Normal':
      return 'bg-yellow-500 text-yellow-500 border-yellow-500/20';
    case 'Available':
      return 'bg-emerald-500 text-emerald-500 border-emerald-500/20';
    default:
      return 'bg-zinc-500 text-zinc-400 border-zinc-700';
  }
};

export default function StationStatusSection() {
  return (
    <div className="h-full p-6 bg-white/[0.04] rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between">
      <div>
        <div className="pb-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white font-['Inter']">Station Status</h3>
          <span className="text-xs font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/5 font-mono">
            4 Lines Online
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {mockKitchenStations.map((station) => (
            <div
              key={station.id}
              className="p-3.5 bg-gray-800/40 hover:bg-gray-800/70 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/5 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shadow-inner">
                  {getStationIcon(station.name)}
                </div>
                <div>
                  <div className="text-base font-medium text-gray-200 font-['Outfit']">
                    {station.name}
                  </div>
                  <div className="text-sm text-gray-500 font-normal font-mono">
                    {station.activeOrders} active orders
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-zinc-950/60">
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(station.status).split(' ')[0]}`} />
                <span className={`text-sm font-medium font-mono ${station.statusColor}`}>
                  {station.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-sm text-zinc-500 flex items-center justify-between">
        <span>Load Balancing Auto-Enabled</span>
        <span className="text-amber-400 font-semibold">Tavonza AI Engine</span>
      </div>
    </div>
  );
}
