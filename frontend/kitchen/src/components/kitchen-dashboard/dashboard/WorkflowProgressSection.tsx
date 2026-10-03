'use client';

import React from 'react';

export default function WorkflowProgressSection() {
  const newOrders = 8;
  const preparing = 12;
  const qualityCheck = 4;
  const readyToServe = 6;
  const total = newOrders + preparing + qualityCheck + readyToServe;

  const pctNew = (newOrders / total) * 100;
  const pctPrep = (preparing / total) * 100;
  const pctQC = (qualityCheck / total) * 100;
  const pctReady = (readyToServe / total) * 100;

  return (
    <div className="p-4 sm:p-5 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <span className="text-base font-medium text-slate-200 font-['Inter']">Workflow Progress</span>
        <span className="text-sm font-normal text-zinc-400 font-mono">{total} total orders in system</span>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-zinc-800 flex overflow-hidden gap-1 p-0.5 my-2">
        <div
          style={{ width: `${pctNew}%` }}
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          title={`New Orders: ${newOrders}`}
        />
        <div
          style={{ width: `${pctPrep}%` }}
          className="h-full bg-yellow-500 rounded-full transition-all duration-500"
          title={`Preparing: ${preparing}`}
        />
        <div
          style={{ width: `${pctQC}%` }}
          className="h-full bg-purple-500 rounded-full transition-all duration-500"
          title={`Quality Check: ${qualityCheck}`}
        />
        <div
          style={{ width: `${pctReady}%` }}
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          title={`Ready to Serve: ${readyToServe}`}
        />
      </div>

      {/* Legend Row */}
      <div className="pt-3 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-sm text-zinc-400 font-['Inter']">New Orders</span>
          <span className="text-sm font-bold text-blue-400 font-mono ml-auto">{newOrders}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-sm text-zinc-400 font-['Inter']">Preparing</span>
          <span className="text-sm font-bold text-yellow-500 font-mono ml-auto">{preparing}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-sm text-zinc-400 font-['Inter']">Quality Check</span>
          <span className="text-sm font-bold text-purple-400 font-mono ml-auto">{qualityCheck}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm text-zinc-400 font-['Inter']">Ready to Serve</span>
          <span className="text-sm font-bold text-emerald-500 font-mono ml-auto">{readyToServe}</span>
        </div>
      </div>
    </div>
  );
}
