'use client';

import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  LayoutGrid,
  ChefHat,
  Clock,
  RotateCw,
} from 'lucide-react';
import {
  AIRecommendation,
  InventoryAlert,
  OrderItem,
  TopMenuItem,
} from '../types';

export interface LiveOperationsSectionProps {
  recommendations: AIRecommendation[];
  onApplyRecommendation: (id: string) => void;
  inventoryAlerts: InventoryAlert[];
  orders: OrderItem[];
  orderStatusFilter: 'All' | 'Preparing' | 'Ready';
  setOrderStatusFilter: (filter: 'All' | 'Preparing' | 'Ready') => void;
  topMenuItems: TopMenuItem[];
}

export default function LiveOperationsSection({
  recommendations,
  onApplyRecommendation,
  inventoryAlerts,
  orders,
  orderStatusFilter,
  setOrderStatusFilter,
  topMenuItems,
}: LiveOperationsSectionProps) {
  const statusFilters: ('All' | 'Preparing' | 'Ready')[] = ['All', 'Preparing', 'Ready'];

  const figmaRecommendations = [
    {
      emoji: '🍔',
      title: 'Promote Signature Burgers',
      tag: 'REVENUE',
      tagClass: 'bg-green-500/10 text-green-500',
      description: 'Demand is expected to increase during lunch.',
    },
    {
      emoji: '🧀',
      title: 'Restock Mozzarella Cheese',
      tag: 'URGENT',
      tagClass: 'bg-red-500/10 text-red-500',
      description: "Current inventory will not support tomorrow's forecast.",
    },
    {
      emoji: '👨‍🍳',
      title: 'Assign One More Waiter',
      tag: 'OPERATIONS',
      tagClass: 'bg-indigo-500/10 text-indigo-500',
      description: 'Floor 2 is expected to experience heavy traffic.',
    },
    {
      emoji: '🎯',
      title: 'Launch a Dessert Promotion',
      tag: 'REVENUE',
      tagClass: 'bg-green-500/10 text-green-500',
      description: 'Combo meal customers are likely to add desserts.',
    },
  ];

  const figmaInventoryAlerts = [
    {
      item: 'Mozzarella Cheese',
      status: 'Critical',
      statusClass: 'text-red-500',
      iconClass: 'bg-red-500/10 text-red-500',
      barColor: 'bg-red-500',
      width: '28%',
    },
    {
      item: 'Chicken Breast',
      status: 'Low',
      statusClass: 'text-amber-500',
      iconClass: 'bg-amber-500/10 text-amber-500',
      barColor: 'bg-amber-500',
      width: '48%',
    },
    {
      item: 'Soft Drinks',
      status: 'Restock',
      statusClass: 'text-amber-500',
      iconClass: 'bg-amber-500/10 text-amber-500',
      barColor: 'bg-amber-500',
      width: '36%',
    },
    {
      item: 'Olive Oil',
      status: 'Recommended',
      statusClass: 'text-indigo-500',
      iconClass: 'bg-indigo-500/10 text-indigo-500',
      barColor: 'bg-indigo-500',
      width: '65%',
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-zinc-800" />
        <h3 className="text-lg font-bold text-white uppercase tracking-widest px-2">
          Live Operations
        </h3>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. AI Recommendations */}
        <div className="p-5 bg-white/5 rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[30px] flex flex-col justify-start items-start space-y-3.5">
          <div className="w-full inline-flex justify-start items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-white text-base font-semibold font-heading leading-5">
              AI Recommendations
            </span>
          </div>

          <div className="w-full space-y-3">
            {figmaRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="w-full p-3 bg-slate-950/40 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-800 flex items-start gap-3"
              >
                <div className="text-xl leading-6 flex-shrink-0">{rec.emoji}</div>
                <div className="flex-1 min-w-0 flex flex-col justify-start items-start">
                  <div className="self-stretch inline-flex justify-start items-center gap-2 flex-wrap">
                    <span className="text-white text-sm font-semibold font-['Inter'] leading-4">
                      {rec.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold font-['Inter'] uppercase tracking-tight ${rec.tagClass}`}
                    >
                      {rec.tag}
                    </span>
                  </div>
                  <div className="pt-0.5 text-slate-500 text-sm font-normal font-['Inter'] leading-4">
                    {rec.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Inventory Alerts */}
        <div className="p-5 bg-white/5 rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[30px] flex flex-col justify-start items-start space-y-4">
          <div className="w-full flex items-center justify-between">
            <span className="text-white text-base font-semibold font-heading leading-5">
              Inventory Alerts
            </span>
            <div className="px-2 py-0.5 bg-red-500/10 rounded-[5px] flex items-center justify-center">
              <span className="text-red-500 text-xs font-semibold font-['Inter'] leading-4">
                4 Alerts
              </span>
            </div>
          </div>

          <div className="w-full space-y-4 pt-1">
            {figmaInventoryAlerts.map((inv, idx) => (
              <div key={idx} className="w-full flex items-center gap-3">
                <div
                  className={`size-7 ${inv.iconClass} rounded-xl flex justify-center items-center flex-shrink-0`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-start items-start space-y-1">
                  <div className="self-stretch flex justify-between items-center">
                    <span className="text-white text-sm font-medium font-['Inter'] leading-4 truncate">
                      {inv.item}
                    </span>
                    <span
                      className={`text-xs font-semibold font-['Inter'] leading-4 ${inv.statusClass}`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div className="self-stretch h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: inv.width }}
                      className={`h-1 ${inv.barColor} rounded-full`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Live Restaurant Status */}
        <div className="p-5 bg-white/5 rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[30px] flex flex-col justify-start items-start">
          <div className="w-full flex items-center gap-2 mb-4">
            <div className="size-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-white text-base font-semibold font-heading leading-5">
              Live Restaurant Status
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            {/* Tables Occupied */}
            <div className="p-3 bg-white/5 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[30px] flex flex-col justify-start items-start">
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-green-500 stroke-[2.2]" />
                <span className="text-slate-400 text-xs font-normal font-['Inter'] leading-4">
                  Tables Occupied
                </span>
              </div>
              <div className="pt-2 text-white text-lg font-bold font-heading leading-7">
                22 / 30
              </div>
            </div>

            {/* Kitchen Queue */}
            <div className="p-3 bg-white/5 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[30px] flex flex-col justify-start items-start">
              <div className="flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
                <span className="text-slate-400 text-xs font-normal font-['Inter'] leading-4">
                  Kitchen Queue
                </span>
              </div>
              <div className="pt-2 text-white text-lg font-bold font-heading leading-7">
                18 Orders
              </div>
            </div>

            {/* Avg Wait Time */}
            <div className="p-3 bg-white/5 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[30px] flex flex-col justify-start items-start">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500 stroke-[2.2]" />
                <span className="text-slate-400 text-xs font-normal font-['Inter'] leading-4">
                  Avg Wait Time
                </span>
              </div>
              <div className="pt-2 text-white text-lg font-bold font-heading leading-7">
                14 min
              </div>
            </div>

            {/* Orders in Progress */}
            <div className="p-3 bg-white/5 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[30px] flex flex-col justify-start items-start">
              <div className="flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-pink-500 stroke-[2.2]" />
                <span className="text-slate-400 text-xs font-normal font-['Inter'] leading-4">
                  Orders in Progress
                </span>
              </div>
              <div className="pt-2 text-white text-lg font-bold font-heading leading-7">
                27
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Menu Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Recent Orders Table (w-[694px] h-96 matching Figma) */}
        <div className="lg:col-span-8 p-6 sm:p-7 bg-[#141416] rounded-2xl border border-zinc-800/80 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white text-2xl sm:text-3xl font-bold font-['Inter'] leading-9">
              Recent Orders
            </h4>
          </div>

          <div className="w-full rounded-xl border border-zinc-800/80 bg-neutral-900/40 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[540px]">
                <thead>
                  <tr className="bg-neutral-800/40 border-b border-zinc-800/80 text-white text-base sm:text-lg font-medium font-['Inter']">
                    <th className="py-3.5 px-5">Order</th>
                    <th className="py-3.5 px-5">Table</th>
                    <th className="py-3.5 px-5">Customer</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 text-base sm:text-lg font-normal font-['Inter'] text-white">
                  {/* Row 1 */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5 font-normal">#10482</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 bg-white/20 rounded-[5px] text-white text-sm font-semibold inline-block">
                        T-08
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-normal">Emma Wilson</td>
                    <td className="py-3.5 px-5">
                      <span className="px-3.5 py-1.5 bg-[#361908] rounded-[5px] text-[#FF7A00] text-sm font-medium inline-flex items-center justify-center">
                        Preparing
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-normal">$46.50</td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5 font-normal">#10482</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 bg-white/20 rounded-[5px] text-white text-sm font-semibold inline-block">
                        T-08
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-normal">Emma Wilson</td>
                    <td className="py-3.5 px-5">
                      <span className="px-3.5 py-1.5 bg-[#092B19] rounded-[5px] text-[#10B981] text-sm font-medium inline-flex items-center justify-center">
                        Ready
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-normal">$46.50</td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5 font-normal">#10482</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 bg-white/20 rounded-[5px] text-white text-sm font-semibold inline-block">
                        T-08
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-normal">Emma Wilson</td>
                    <td className="py-3.5 px-5">
                      <span className="px-3.5 py-1.5 bg-[#361908] rounded-[5px] text-[#FF7A00] text-sm font-medium inline-flex items-center justify-center">
                        Preparing
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-normal">$46.50</td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5 font-normal">#10482</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 bg-white/20 rounded-[5px] text-white text-sm font-semibold inline-block">
                        T-08
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-normal">Emma Wilson</td>
                    <td className="py-3.5 px-5">
                      <span className="px-3.5 py-1.5 bg-[#361908] rounded-[5px] text-[#FF7A00] text-sm font-medium inline-flex items-center justify-center">
                        Preparing
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-normal">$46.50</td>
                  </tr>

                  {/* Row 5 */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5 font-normal">#10482</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 bg-white/20 rounded-[5px] text-white text-sm font-semibold inline-block">
                        T-08
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-normal">Emma Wilson</td>
                    <td className="py-3.5 px-5">
                      <span className="px-3.5 py-1.5 bg-[#361908] rounded-[5px] text-[#FF7A00] text-sm font-medium inline-flex items-center justify-center">
                        Preparing
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-normal">$46.50</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 2. Top Menu Items (size-96 matching Figma) */}
        <div className="lg:col-span-4 p-6 sm:p-7 bg-[#141416] rounded-2xl border border-zinc-800/80 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white text-2xl sm:text-3xl font-bold font-['Inter'] leading-9">
              Top Menu Items
            </h4>
            <div className="px-2.5 py-1 bg-indigo-500/10 rounded-[5px] flex items-center justify-center">
              <span className="text-indigo-500 text-xs font-semibold font-['Inter'] uppercase tracking-tight">
                TODAY
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {[
              { rank: '#1', name: 'Classic Burger', revenue: '$2,480', sold: '124 sold', width: '65%' },
              { rank: '#2', name: 'Chicken Pizza', revenue: '$2,156', sold: '98 sold', width: '52%' },
              { rank: '#3', name: 'Alfredo Pasta', revenue: '$1,520', sold: '76 sold', width: '38%' },
              { rank: '#4', name: 'Caesar Salad', revenue: '$975', sold: '65 sold', width: '32%' },
              { rank: '#5', name: 'Chocolate Brownie', revenue: '$660', sold: '44 sold', width: '22%' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 font-['Inter']">
                {/* Rank */}
                <div className="w-5 text-white text-sm sm:text-base font-bold flex-shrink-0">
                  {item.rank}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm sm:text-base font-medium truncate">
                      {item.name}
                    </span>
                    <span className="text-green-500 text-sm sm:text-base font-bold flex-shrink-0">
                      {item.revenue}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: item.width }}
                        className="h-1 bg-yellow-500 rounded-full"
                      />
                    </div>
                    <span className="text-slate-500 text-xs font-normal flex-shrink-0">
                      {item.sold}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

