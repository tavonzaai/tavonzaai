'use client';

import React from 'react';
import { ServerPerformanceItem } from '../types';

export interface TopServersCardProps {
  servers: ServerPerformanceItem[];
}

export default function TopServersCard({ servers }: TopServersCardProps) {
  return (
    <div className="w-full bg-neutral-900 rounded-[10px] border border-white/5 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] p-5 md:p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <h3 className="text-white text-lg font-semibold font-['Inter'] leading-6">
          Top Serve
        </h3>
        <p className="text-slate-400 text-sm font-normal font-['Inter'] mt-1">
          Performance ranking by revenue generated.
        </p>

        {/* Server Leaderboard Rows */}
        <div className="space-y-2.5 pt-4 font-['Inter']">
          {servers.map((server) => (
            <div
              key={server.name}
              className="h-9 px-3 bg-zinc-800/80 hover:bg-zinc-800 rounded-[5px] border border-yellow-500/20 flex items-center justify-between transition-colors group"
            >
              {/* Rank & Name */}
              <div className="flex items-center gap-2.5">
                <span className="size-5 rounded bg-yellow-500/10 text-yellow-400 text-xs font-bold flex items-center justify-center">
                  {server.rank}
                </span>
                <span className="text-white text-sm font-medium">
                  {server.name}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-20 md:w-24 h-1.5 bg-neutral-700 rounded-full overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${server.percentage}%` }}
                />
              </div>

              {/* Revenue & Rating */}
              <div className="flex items-center gap-2 text-right">
                <span className="text-white text-sm font-medium">
                  ${server.revenue.toLocaleString()}
                </span>
                <span className="text-yellow-500 text-xs font-bold pl-1.5 border-l border-white/10">
                  ★ {server.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
