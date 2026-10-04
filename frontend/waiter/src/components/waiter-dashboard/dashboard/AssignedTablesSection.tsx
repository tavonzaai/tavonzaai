'use client';

import React from 'react';
import { ChevronRight, Grid } from 'lucide-react';
import { AssignedTable } from '../types';

export interface AssignedTablesSectionProps {
  tables: AssignedTable[];
  onFloorPlanClick?: () => void;
  onSelectTable?: (table: AssignedTable) => void;
}

export default function AssignedTablesSection({
  tables,
  onFloorPlanClick,
  onSelectTable,
}: AssignedTablesSectionProps) {
  const getStatusBadge = (status: AssignedTable['status']) => {
    switch (status) {
      case 'Available':
        return <span className="text-zinc-400">Available</span>;
      case 'Dining':
        return <span className="text-amber-400">Dining</span>;
      case 'Occupied':
        return <span className="text-blue-400">Occupied</span>;
      case 'Billing':
        return <span className="text-emerald-400">Billing</span>;
      default:
        return <span className="text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-white text-lg font-semibold font-['Inter'] leading-tight">
              My Tables
            </h3>
            <p className="text-zinc-400 text-sm font-normal font-['Inter'] mt-0.5">
              Assigned Tables
            </p>
          </div>

          <button
            type="button"
            onClick={onFloorPlanClick}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl inline-flex items-center gap-1 transition-colors cursor-pointer shadow-sm shadow-amber-500/20"
          >
            <Grid className="w-3 h-3 text-white" />
            <span>Floor Plan</span>
            <ChevronRight className="w-3 h-3 text-white" />
          </button>
        </div>

        {/* Tables Matrix */}
        <div className="mt-4 border border-white/10 rounded-xl overflow-hidden bg-neutral-900/40">
          {/* Table Header */}
          <div className="grid grid-cols-4 px-3.5 py-2.5 bg-neutral-800/60 border-b border-white/10 text-xs font-semibold text-white font-['Inter']">
            <div>Table</div>
            <div className="text-center">Guests</div>
            <div className="text-center">Status</div>
            <div className="text-right">Wait</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/5 max-h-[220px] overflow-y-auto custom-scrollbar">
            {tables.slice(0, 5).map((table) => (
              <div
                key={table.id}
                onClick={() => onSelectTable?.(table)}
                className="grid grid-cols-4 px-3.5 py-2.5 text-sm text-slate-200 font-['Inter'] hover:bg-white/[0.04] transition-colors cursor-pointer items-center"
              >
                <div className="font-semibold text-white">{table.tableNumber}</div>
                <div className="text-center text-slate-300">
                  {table.guests < 10 ? `0${table.guests}` : table.guests}
                </div>
                <div className="text-center text-xs">
                  {getStatusBadge(table.status)}
                </div>
                <div className="text-right text-slate-400 text-xs">
                  {table.waitMinutes}min
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 text-xs text-zinc-400 flex items-center justify-between">
        <span>Station 2 Total</span>
        <span className="font-semibold text-white">{tables.length} Tables Assigned</span>
      </div>
    </div>
  );
}
