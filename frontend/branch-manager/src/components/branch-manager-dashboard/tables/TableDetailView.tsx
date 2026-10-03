'use client';

import React from 'react';
import { TableItem, OrderDish } from '../types';
import {
  ArrowLeft,
  User,
  Clock,
  UserCheck,
  Sparkles,
  Flame,
  Wine,
  CheckCircle2,
} from 'lucide-react';

interface TableDetailViewProps {
  table: TableItem;
  onBack: () => void;
  onOpenReassign: () => void;
  onOpenAskAi: () => void;
}

const SAMPLE_DISHES: OrderDish[] = [
  {
    id: 'd1',
    name: 'Grilled Chicken',
    station: 'Grill Station',
    status: 'Ready',
    notes: 'Extra garlic butter',
    quantity: 1,
  },
  {
    id: 'd2',
    name: 'Caesar Salad Supreme',
    station: 'Cold Station',
    status: 'preparing',
    notes: 'Dressing on side',
    quantity: 1,
  },
  {
    id: 'd3',
    name: 'Mojito Cocktail',
    station: 'Bar Station',
    status: 'Ready',
    notes: 'Less Ice',
    quantity: 2,
  },
];

export default function TableDetailView({
  table,
  onBack,
  onOpenReassign,
  onOpenAskAi,
}: TableDetailViewProps) {
  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition" />
          <span className="text-xs font-semibold font-['Poppins']">Back to floor</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenReassign}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs sm:text-sm font-medium rounded-lg border border-neutral-800 flex items-center gap-2 transition cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Reassign Waiter</span>
          </button>

          <button
            type="button"
            onClick={onOpenAskAi}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs sm:text-sm rounded-lg flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Table Header Info Card */}
      <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-2xl sm:text-3xl font-bold font-['Inter']">
              {table.number} Overview
            </h1>
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30">
              {table.status.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-neutral-400 font-['Inter']">
            <span>Capacity: {table.capacity || 4} guests</span>
            <span>•</span>
            <span>Current Waiter: <strong className="text-white font-medium">{table.waiter || 'Sara'}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Elapsed: {table.orderTime || '22m'}</span>
            </span>
          </div>
        </div>

        <div className="text-right flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-neutral-800">
          <span className="text-xs text-neutral-500 font-['Inter']">Order Reference</span>
          <span className="text-white text-lg font-semibold font-['Inter']">
            {table.orderNumber || 'Order #1042'}
          </span>
        </div>
      </div>

      {/* Two Column Layout: Station Progress & Dish Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Station Kitchen Routing */}
        <div className="lg:col-span-7 bg-neutral-900 rounded-xl border border-neutral-800 p-5 space-y-4">
          <h2 className="text-white text-lg font-semibold font-['Poppins']">
            Ordered Items & Station Routing
          </h2>

          <div className="divide-y divide-neutral-800/80">
            {SAMPLE_DISHES.map((dish) => (
              <div key={dish.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-neutral-800 rounded-lg border border-neutral-700 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-semibold font-['Inter']">
                      {dish.quantity}X
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium font-['Poppins']">
                      {dish.name}
                    </span>
                    <span className="text-neutral-500 text-xs font-['Inter']">
                      {dish.station}
                    </span>
                    {dish.notes && (
                      <span className="text-yellow-400 text-xs font-['Inter'] mt-0.5">
                        {dish.notes}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {dish.status === 'Ready' ? (
                    <div className="px-2.5 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready</span>
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                      <span>Preparing</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Station Live Monitor Cards */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col gap-3">
            <span className="text-white text-base font-semibold font-['Poppins']">
              Kitchen Station Progress
            </span>

            <div className="space-y-3 pt-1">
              <div className="p-3 bg-neutral-950/60 rounded-lg border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-neutral-300 font-['Inter']">Grill Station</span>
                </div>
                <span className="text-xs text-teal-400 font-medium font-['Inter']">Completed (Ready)</span>
              </div>

              <div className="p-3 bg-neutral-950/60 rounded-lg border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-fuchsia-400" />
                  <span className="text-sm text-neutral-300 font-['Inter']">Cold Prep Station</span>
                </div>
                <span className="text-xs text-fuchsia-400 font-medium font-['Inter']">In Prep (Est 3m)</span>
              </div>

              <div className="p-3 bg-neutral-950/60 rounded-lg border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Wine className="w-4 h-4 text-teal-400" />
                  <span className="text-sm text-neutral-300 font-['Inter']">Bar Station</span>
                </div>
                <span className="text-xs text-teal-400 font-medium font-['Inter']">Served to Table</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
