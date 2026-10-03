'use client';

import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Pizza,
  IceCream,
  RotateCw,
  Clock,
  User,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  Gauge,
  Thermometer,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

export interface StationData {
  id: string;
  name: string;
  chefs: string;
  status: 'Busy' | 'Normal' | 'Available';
  statusColor: string;
  capacityPercent: number;
  activeOrders: number;
  chefsAssigned: number;
  icon: any;
  iconColor: string;
  metricColor: string;
  barColor: string;
  currentItems: string[];
  equipment: {
    temp: string;
    condition: string;
    efficiency: string;
    lastCleaned: string;
  };
}

const initialStations: StationData[] = [
  {
    id: 'grill',
    name: 'Grill Station',
    chefs: 'Marco R. · David K.',
    status: 'Busy',
    statusColor: 'border-red-500/50 bg-red-950/20 text-red-400',
    capacityPercent: 92,
    activeOrders: 12,
    chefsAssigned: 2,
    icon: Flame,
    iconColor: 'text-red-400',
    metricColor: 'text-red-400',
    barColor: 'bg-red-500',
    currentItems: ['Burger ×4', 'Steak ×2', 'Ribs ×2', 'Pasta ×2', 'Risotto ×1', 'Steak ×1'],
    equipment: {
      temp: '450°F (Optimal Searing)',
      condition: 'Heavy Load • Peak Burners Active',
      efficiency: '94.2%',
      lastCleaned: '11:00 AM',
    },
  },
  {
    id: 'fry',
    name: 'Fry Station',
    chefs: 'Jin L.',
    status: 'Available',
    statusColor: 'border-emerald-600/50 bg-emerald-950/20 text-emerald-400',
    capacityPercent: 42,
    activeOrders: 6,
    chefsAssigned: 1,
    icon: Zap,
    iconColor: 'text-emerald-400',
    metricColor: 'text-emerald-400',
    barColor: 'bg-[#00e676]',
    currentItems: ['Fish & Chips ×2', 'Fries ×2', 'Chicken Wrap ×1', 'Onion Rings ×1'],
    equipment: {
      temp: '375°F (Canola Oil Level High)',
      condition: 'Normal Circulation',
      efficiency: '98.0%',
      lastCleaned: '09:30 AM',
    },
  },
  {
    id: 'pizza',
    name: 'Pizza Station',
    chefs: 'Sara M.',
    status: 'Normal',
    statusColor: 'border-amber-500/50 bg-amber-950/20 text-yellow-400',
    capacityPercent: 65,
    activeOrders: 4,
    chefsAssigned: 1,
    icon: Pizza,
    iconColor: 'text-yellow-400',
    metricColor: 'text-yellow-400',
    barColor: 'bg-yellow-400',
    currentItems: ['Margherita ×2', 'Chicken Pizza ×1', 'Pepperoni ×1'],
    equipment: {
      temp: '520°F (Stone Hearth Deck)',
      condition: 'Steady Baking Rotation',
      efficiency: '96.5%',
      lastCleaned: '10:15 AM',
    },
  },
  {
    id: 'dessert',
    name: 'Dessert Station',
    chefs: 'Priya N.',
    status: 'Available',
    statusColor: 'border-emerald-600/50 bg-emerald-950/20 text-emerald-400',
    capacityPercent: 22,
    activeOrders: 2,
    chefsAssigned: 1,
    icon: IceCream,
    iconColor: 'text-emerald-400',
    metricColor: 'text-emerald-400',
    barColor: 'bg-[#00e676]',
    currentItems: ['Tiramisu ×1', 'Cheesecake ×1'],
    equipment: {
      temp: '38°F (Chilled Prep Table)',
      condition: 'Plating Cold Desserts & Garnishes',
      efficiency: '99.1%',
      lastCleaned: '11:30 AM',
    },
  },
];

export default function KitchenStationsView() {
  const [stations, setStations] = useState<StationData[]>(initialStations);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStationDetails, setSelectedStationDetails] = useState<StationData | null>(null);
  const [assignStation, setAssignStation] = useState<StationData | null>(null);
  const [newOrderDish, setNewOrderDish] = useState('');
  const [newOrderTable, setNewOrderTable] = useState('T-09');

  const totalActiveOrders = stations.reduce((acc, curr) => acc + curr.activeOrders, 0);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Kitchen station telemetry refreshed in real-time.');
    }, 400);
  };

  const handleAssignOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignStation || !newOrderDish) return;

    setStations((prev) =>
      prev.map((st) => {
        if (st.id === assignStation.id) {
          return {
            ...st,
            activeOrders: st.activeOrders + 1,
            currentItems: [...st.currentItems, `${newOrderDish} (${newOrderTable})`],
            capacityPercent: Math.min(100, st.capacityPercent + 6),
          };
        }
        return st;
      })
    );

    toast.success(`Dispatched ${newOrderDish} to ${assignStation.name}!`);
    setAssignStation(null);
    setNewOrderDish('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight font-['Inter']">
            Kitchen Stations
          </h1>
          <p className="text-base text-zinc-500 font-normal font-['Inter'] mt-0.5">
            Monitor workload, capacity, and assignments across all stations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-md outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 text-slate-200 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium text-slate-200 font-['Inter']">Refresh</span>
        </button>
      </div>

      {/* 2. Kitchen Load Overview Card */}
      <div className="p-4 sm:p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-slate-200 text-base font-medium font-['Inter']">
            Kitchen Load Overview
          </div>
          <div className="text-gray-400 text-sm font-normal font-mono">
            Total: {totalActiveOrders} active orders
          </div>
        </div>

        {/* Multi-Segment Capacity Bar */}
        <div className="h-3 rounded-full flex gap-1 overflow-hidden bg-black/40 p-0.5 border border-white/5">
          <div style={{ width: '50%' }} className="h-full bg-red-500 rounded-l-full" title="Grill (12 orders)" />
          <div style={{ width: '25%' }} className="h-full bg-green-500" title="Fry (6 orders)" />
          <div style={{ width: '17%' }} className="h-full bg-yellow-500" title="Pizza (4 orders)" />
          <div style={{ width: '8%' }} className="h-full bg-emerald-400 rounded-r-full" title="Dessert (2 orders)" />
        </div>

        {/* Stations Legend */}
        <div className="flex flex-wrap items-center gap-6 pt-1">
          {/* Grill */}
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span className="text-gray-400 text-sm font-normal font-['Inter']">Grill</span>
            <span className="text-red-400 text-sm font-bold font-mono">12</span>
          </div>

          {/* Fry */}
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-400 text-sm font-normal font-['Inter']">Fry</span>
            <span className="text-emerald-400 text-sm font-bold font-mono">6</span>
          </div>

          {/* Pizza */}
          <div className="flex items-center gap-1.5">
            <Pizza className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-gray-400 text-sm font-normal font-['Inter']">Pizza</span>
            <span className="text-yellow-500 text-sm font-bold font-mono">4</span>
          </div>

          {/* Dessert */}
          <div className="flex items-center gap-1.5">
            <IceCream className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-400 text-sm font-normal font-['Inter']">Dessert</span>
            <span className="text-emerald-400 text-sm font-bold font-mono">2</span>
          </div>
        </div>
      </div>

      {/* 3. 2x2 Grid of Pixel-Perfect Kitchen Station Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {stations.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.id}
              className="bg-[#101114] rounded-2xl border border-zinc-800/90 p-5 shadow-2xl flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${st.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-['Inter'] leading-tight">
                      {st.name}
                    </h3>
                    <div className="text-sm text-zinc-500 font-normal font-['Inter'] mt-0.5">
                      {st.chefs}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`px-3 py-1 rounded-lg border text-sm font-medium font-['Inter'] ${st.statusColor}`}
                >
                  {st.status}
                </span>
              </div>

              {/* Progress Bar with Right-Aligned Percentage */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${st.barColor}`}
                      style={{ width: `${st.capacityPercent}%` }}
                    />
                  </div>
                  <span className={`text-base font-bold font-mono ${st.metricColor}`}>
                    {st.capacityPercent}%
                  </span>
                </div>
              </div>

              {/* 3 Metrics: Active Orders, Chefs Assigned, Capacity */}
              <div className="grid grid-cols-3 gap-2 text-left">
                <div>
                  <div className="text-zinc-500 text-sm font-normal font-['Inter']">
                    Active Orders
                  </div>
                  <div className={`text-2xl font-bold font-mono mt-0.5 ${st.metricColor}`}>
                    {st.activeOrders}
                  </div>
                </div>

                <div>
                  <div className="text-zinc-500 text-sm font-normal font-['Inter']">
                    Chefs Assigned
                  </div>
                  <div className="text-white text-2xl font-bold font-mono mt-0.5">
                    {st.chefsAssigned}
                  </div>
                </div>

                <div>
                  <div className="text-zinc-500 text-sm font-normal font-['Inter']">
                    Capacity
                  </div>
                  <div className={`text-2xl font-bold font-mono mt-0.5 ${st.metricColor}`}>
                    {st.capacityPercent}%
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-zinc-800/80 pt-3 space-y-2">
                <div className="text-zinc-500 text-xs font-semibold tracking-wider uppercase font-['Inter']">
                  CURRENT ITEMS
                </div>

                {/* Current Items Chips */}
                <div className="flex flex-wrap gap-2">
                  {st.currentItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-zinc-950/80 rounded-lg border border-zinc-800 text-zinc-400 text-sm font-normal font-['Inter']"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Buttons: Assign Order & View Details */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignStation(st)}
                  className="py-2.5 px-4 bg-amber-950/30 hover:bg-amber-950/50 text-amber-500 border border-amber-800/60 rounded-xl text-sm sm:text-base font-semibold text-center transition-all cursor-pointer"
                >
                  Assign Order
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStationDetails(st)}
                  className="py-2.5 px-4 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-sm sm:text-base font-semibold text-center transition-all cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. View Details Modal */}
      {selectedStationDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-950 border border-amber-500/30 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-['Inter']">
                    {selectedStationDetails.name} Telemetry
                  </h3>
                  <div className="text-sm text-zinc-400">Chef Line: {selectedStationDetails.chefs}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStationDetails(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Operating Temp:
                </span>
                <span className="font-bold text-white font-mono">
                  {selectedStationDetails.equipment.temp}
                </span>
              </div>

              <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Equipment Health:
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  {selectedStationDetails.equipment.efficiency}
                </span>
              </div>

              <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Station Hygiene:
                </span>
                <span className="text-zinc-300 font-mono">
                  Cleaned {selectedStationDetails.equipment.lastCleaned}
                </span>
              </div>

              <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
                <div className="text-zinc-400 mb-1">Current State:</div>
                <div className="text-zinc-200 italic font-mono">
                  "{selectedStationDetails.equipment.condition}"
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStationDetails(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Assign Order Modal */}
      {assignStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-950 border border-orange-500/30 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white font-['Inter']">
                Assign Order to {assignStation.name}
              </h3>
              <button
                type="button"
                onClick={() => setAssignStation(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignOrderSubmit} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-zinc-400 mb-1">Select Table #</label>
                <select
                  value={newOrderTable}
                  onChange={(e) => setNewOrderTable(e.target.value)}
                  className="w-full h-9 px-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white outline-none"
                >
                  <option value="T-08">Table 08 (Front Patio)</option>
                  <option value="T-12">Table 12 (Main Dining)</option>
                  <option value="T-03">Table 03 (Window Booth)</option>
                  <option value="T-14">Table 14 (VIP Room)</option>
                  <option value="Takeaway">Takeaway Counter</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Dish Name & Modifiers</label>
                <input
                  type="text"
                  placeholder="e.g. Wagyu Ribeye Steak (Med Rare)"
                  value={newOrderDish}
                  onChange={(e) => setNewOrderDish(e.target.value)}
                  className="w-full h-9 px-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Assigned Station Line</label>
                <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-300 font-mono">
                  {assignStation.name} (Assigned Chef: {assignStation.chefs})
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignStation(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-bold shadow-md shadow-orange-500/20"
                >
                  Confirm Station Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
