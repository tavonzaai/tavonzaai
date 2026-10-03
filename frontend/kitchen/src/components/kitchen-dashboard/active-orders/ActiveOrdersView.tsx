'use client';

import React, { useState } from 'react';
import {
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChefHat,
  Filter,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export interface ActiveTicket {
  id: string;
  orderNumber: string;
  items: string;
  table: string;
  station: string;
  priority: 'High' | 'Medium' | 'Normal';
  status: 'New' | 'Preparing' | 'Quality Check' | 'Delayed' | 'Ready';
  eta: string;
  progressPercent: number;
}

const initialHighPriorityTickets: ActiveTicket[] = [
  {
    id: 'apt-1',
    orderNumber: '#10582',
    items: 'Burger ×2 · Fries ×2',
    table: 'T-12',
    station: 'Grill',
    priority: 'High',
    status: 'Preparing',
    eta: '8 min',
    progressPercent: 75,
  },
  {
    id: 'apt-2',
    orderNumber: '#10579',
    items: 'Burger Combo',
    table: 'Takeaway',
    station: 'Fry',
    priority: 'High',
    status: 'Quality Check',
    eta: '6 min',
    progressPercent: 90,
  },
  {
    id: 'apt-3',
    orderNumber: '#10576',
    items: 'Steak · Mash · Greens',
    table: 'T-11',
    station: 'Grill',
    priority: 'High',
    status: 'Preparing',
    eta: '10 min',
    progressPercent: 65,
  },
  {
    id: 'apt-4',
    orderNumber: '#10571',
    items: 'BBQ Ribs · Coleslaw',
    table: 'T-14',
    station: 'Grill',
    priority: 'High',
    status: 'Delayed',
    eta: 'Delayed',
    progressPercent: 100,
  },
];

const initialMediumPriorityTickets: ActiveTicket[] = [
  {
    id: 'apt-5',
    orderNumber: '#10581',
    items: 'Chicken Pizza',
    table: 'T-08',
    station: 'Pizza',
    priority: 'Medium',
    status: 'Preparing',
    eta: '12 min',
    progressPercent: 60,
  },
  {
    id: 'apt-6',
    orderNumber: '#10577',
    items: 'Margherita Pizza ×2',
    table: 'T-03',
    station: 'Pizza',
    priority: 'Medium',
    status: 'New',
    eta: '18 min',
    progressPercent: 30,
  },
  {
    id: 'apt-7',
    orderNumber: '#10573',
    items: 'Chicken Wrap · Fries',
    table: 'Takeaway',
    station: 'Fry',
    priority: 'Medium',
    status: 'Preparing',
    eta: '9 min',
    progressPercent: 70,
  },
];

const initialNormalPriorityTickets: ActiveTicket[] = [
  {
    id: 'apt-8',
    orderNumber: '#10580',
    items: 'Alfredo Pasta ×2',
    table: 'T-15',
    station: 'Grill',
    priority: 'Normal',
    status: 'Preparing',
    eta: '15 min',
    progressPercent: 50,
  },
  {
    id: 'apt-9',
    orderNumber: '#10578',
    items: 'Caesar Salad · Soup',
    table: 'T-06',
    station: 'Dessert',
    priority: 'Normal',
    status: 'Delayed',
    eta: 'Delayed',
    progressPercent: 100,
  },
  {
    id: 'apt-10',
    orderNumber: '#10575',
    items: 'Fish & Chips',
    table: 'T-09',
    station: 'Fry',
    priority: 'Normal',
    status: 'Delayed',
    eta: 'Delayed',
    progressPercent: 100,
  },
  {
    id: 'apt-11',
    orderNumber: '#10572',
    items: 'Veg Risotto',
    table: 'T-07',
    station: 'Grill',
    priority: 'Normal',
    status: 'New',
    eta: '14 min',
    progressPercent: 40,
  },
];

export default function ActiveOrdersView() {
  const [highTickets, setHighTickets] = useState<ActiveTicket[]>(initialHighPriorityTickets);
  const [mediumTickets, setMediumTickets] = useState<ActiveTicket[]>(initialMediumPriorityTickets);
  const [normalTickets, setNormalTickets] = useState<ActiveTicket[]>(initialNormalPriorityTickets);
  const [stationFilter, setStationFilter] = useState<string>('All');
  const [selectedTicket, setSelectedTicket] = useState<ActiveTicket | null>(null);

  // Combine all active tickets for the Timeline Gantt section
  const allTimelineTickets: ActiveTicket[] = [
    ...highTickets,
    ...mediumTickets,
    ...normalTickets,
  ];

  const filterTickets = (list: ActiveTicket[]) => {
    if (stationFilter === 'All') return list;
    return list.filter((t) => t.station.toLowerCase() === stationFilter.toLowerCase());
  };

  const handleAdvanceStatus = (ticket: ActiveTicket) => {
    const nextStatusMap: Record<ActiveTicket['status'], ActiveTicket['status']> = {
      New: 'Preparing',
      Preparing: 'Quality Check',
      'Quality Check': 'Ready',
      Delayed: 'Quality Check',
      Ready: 'Ready',
    };
    const next = nextStatusMap[ticket.status];

    const updater = (list: ActiveTicket[]) =>
      list.map((t) => (t.id === ticket.id ? { ...t, status: next } : t));

    if (ticket.priority === 'High') setHighTickets(updater);
    else if (ticket.priority === 'Medium') setMediumTickets(updater);
    else setNormalTickets(updater);

    toast.success(`Order ${ticket.orderNumber} status advanced to ${next}!`);
  };

  const getStatusPill = (status: ActiveTicket['status']) => {
    switch (status) {
      case 'Preparing':
        return (
          <span className="px-1.5 py-0.5 bg-amber-500/20 text-yellow-500 rounded-sm border border-amber-500/30 text-xs font-medium font-['Inter']">
            Preparing
          </span>
        );
      case 'Quality Check':
        return (
          <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-sm border border-purple-500/30 text-xs font-medium font-['Inter']">
            Quality Check
          </span>
        );
      case 'New':
        return (
          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-sm border border-blue-500/30 text-xs font-medium font-['Inter']">
            New
          </span>
        );
      case 'Delayed':
        return (
          <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-sm border border-red-500/30 text-xs font-medium font-['Inter']">
            Delayed
          </span>
        );
      case 'Ready':
        return (
          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-sm border border-emerald-500/30 text-xs font-medium font-['Inter']">
            Ready
          </span>
        );
    }
  };

  const getTimelineBarColor = (status: ActiveTicket['status']) => {
    switch (status) {
      case 'Quality Check':
        return 'bg-purple-500';
      case 'Delayed':
        return 'bg-red-500';
      case 'New':
        return 'bg-blue-500';
      default:
        return 'bg-yellow-500/80';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight font-['Inter']">
            Active Orders
          </h1>
          <p className="text-base text-zinc-500 font-normal font-['Inter'] mt-0.5">
            Monitor all orders currently being prepared across all stations.
          </p>
        </div>

        {/* Station Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', 'Grill', 'Fry', 'Pizza', 'Dessert'].map((station) => (
            <button
              key={station}
              type="button"
              onClick={() => setStationFilter(station)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                stationFilter === station
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {station}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top 3 Priority Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: High Priority */}
        <div className="bg-neutral-500/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-500/30 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-black/30">
            <div className="text-slate-200 text-sm font-semibold font-['Inter'] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>High Priority</span>
            </div>
            <div className="px-2 py-0.5 bg-red-500/20 rounded-full text-red-400 text-xs font-bold font-['Inter']">
              {filterTickets(highTickets).length}
            </div>
          </div>

          {/* Cards List */}
          <div className="p-3 space-y-2.5">
            {filterTickets(highTickets).map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => handleAdvanceStatus(ticket)}
                className="p-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/5 hover:outline-amber-500/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 text-sm font-bold font-['Inter'] font-mono">
                    {ticket.orderNumber}
                  </span>
                  {getStatusPill(ticket.status)}
                </div>

                <div className="text-gray-300 text-sm font-normal font-['Inter']">
                  {ticket.items}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                  <span className="text-gray-400 font-medium">
                    {ticket.table} · {ticket.station}
                  </span>
                  <span
                    className={`font-bold font-['Inter'] ${
                      ticket.eta === 'Delayed' ? 'text-red-400' : 'text-yellow-500'
                    }`}
                  >
                    {ticket.eta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Medium Priority */}
        <div className="bg-neutral-500/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-500/30 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-black/30">
            <div className="text-slate-200 text-sm font-semibold font-['Inter'] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Medium Priority</span>
            </div>
            <div className="px-2 py-0.5 bg-amber-500/20 rounded-full text-yellow-500 text-xs font-bold font-['Inter']">
              {filterTickets(mediumTickets).length}
            </div>
          </div>

          {/* Cards List */}
          <div className="p-3 space-y-2.5">
            {filterTickets(mediumTickets).map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => handleAdvanceStatus(ticket)}
                className="p-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/5 hover:outline-amber-500/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 text-sm font-bold font-['Inter'] font-mono">
                    {ticket.orderNumber}
                  </span>
                  {getStatusPill(ticket.status)}
                </div>

                <div className="text-gray-300 text-sm font-normal font-['Inter']">
                  {ticket.items}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                  <span className="text-gray-400 font-medium">
                    {ticket.table} · {ticket.station}
                  </span>
                  <span
                    className={`font-bold font-['Inter'] ${
                      ticket.eta === 'Delayed' ? 'text-red-400' : 'text-yellow-500'
                    }`}
                  >
                    {ticket.eta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Normal Priority */}
        <div className="bg-neutral-500/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-stone-500/30 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-black/30">
            <div className="text-slate-200 text-sm font-semibold font-['Inter'] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Normal Priority</span>
            </div>
            <div className="px-2 py-0.5 bg-green-500/20 rounded-full text-emerald-400 text-xs font-bold font-['Inter']">
              {filterTickets(normalTickets).length}
            </div>
          </div>

          {/* Cards List */}
          <div className="p-3 space-y-2.5">
            {filterTickets(normalTickets).map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => handleAdvanceStatus(ticket)}
                className="p-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/5 hover:outline-amber-500/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 text-sm font-bold font-['Inter'] font-mono">
                    {ticket.orderNumber}
                  </span>
                  {getStatusPill(ticket.status)}
                </div>

                <div className="text-gray-300 text-sm font-normal font-['Inter']">
                  {ticket.items}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                  <span className="text-gray-400 font-medium">
                    {ticket.table} · {ticket.station}
                  </span>
                  <span
                    className={`font-bold font-['Inter'] ${
                      ticket.eta === 'Delayed' ? 'text-red-400' : 'text-yellow-500'
                    }`}
                  >
                    {ticket.eta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: Order Timeline (Gantt-style live progression) */}
      <div className="p-6 sm:p-7 bg-neutral-900 rounded-xl border border-white/10 flex flex-col space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
          <div>
            <h3 className="text-lg font-semibold text-white font-['Inter']">Order Timeline</h3>
            <p className="text-sm text-slate-500 font-normal font-['Inter']">
              Best sellers this shift & live station prep progress
            </p>
          </div>
          <div className="text-sm font-mono text-zinc-400">
            Total In Flight: <span className="text-amber-400 font-bold">{allTimelineTickets.length} orders</span>
          </div>
        </div>

        {/* 11 Horizontal Progress Bars */}
        <div className="space-y-3 pt-2">
          {filterTickets(allTimelineTickets).map((ticket) => (
            <div
              key={`timeline-${ticket.id}`}
              className="w-full h-9 bg-zinc-800 rounded-md flex items-center relative overflow-hidden px-3 gap-3 border border-white/5 group hover:border-white/20 transition-all"
            >
              {/* Left Order # Pill */}
              <div className="w-16 h-7 bg-white/10 rounded px-2 flex items-center justify-center font-bold text-sm text-white font-mono shrink-0">
                {ticket.orderNumber}
              </div>

              {/* Dish Name */}
              <div className="w-48 sm:w-56 text-sm font-medium text-white font-['Inter'] truncate shrink-0">
                {ticket.items}
              </div>

              {/* Progress Bar Track */}
              <div className="flex-1 h-2.5 bg-zinc-700/60 rounded-full relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getTimelineBarColor(
                    ticket.status
                  )}`}
                  style={{ width: `${ticket.progressPercent}%` }}
                />
              </div>

              {/* Right ETA & Status */}
              <div className="flex items-center gap-3 shrink-0">
                <div
                  className={`text-sm font-bold font-mono text-right w-14 ${
                    ticket.eta === 'Delayed' ? 'text-red-400' : 'text-yellow-500'
                  }`}
                >
                  {ticket.eta}
                </div>
                <div className="w-24 text-right">
                  {getStatusPill(ticket.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
