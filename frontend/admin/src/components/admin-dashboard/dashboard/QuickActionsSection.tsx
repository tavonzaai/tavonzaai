'use client';

import React from 'react';
import {
  Plus,
  QrCode,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function QuickActionsSection() {
  const actions = [
    { label: 'New Product', icon: Plus, iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-400' },
    { label: 'QR Codes', icon: QrCode, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
    { label: 'Live Orders', icon: ShoppingBag, iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-400' },
    { label: 'Inventory', icon: Package, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
    { label: 'Add Employee', icon: Users, iconBg: 'bg-pink-500/10', iconColor: 'text-pink-400' },
    { label: 'Finance Report', icon: BarChart3, iconBg: 'bg-violet-500/10', iconColor: 'text-violet-400' },
    { label: 'Marketing / AI', icon: Sparkles, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
  ];

  return (
    <section className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-xl">
      <div className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
        Quick Actions
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={() =>
                toast.success(`Action: ${act.label}`, {
                  description: `Executed quick action for ${act.label}`,
                })
              }
              className="w-full h-28 bg-slate-950/60 hover:bg-slate-900/80 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-800 flex flex-col justify-center items-center gap-2.5 transition-colors cursor-pointer"
            >
              {/* Top Icon Badge: size-9 rounded-xl */}
              <div
                className={`size-9 ${act.iconBg} rounded-xl flex justify-center items-center flex-shrink-0`}
              >
                <Icon className={`w-4 h-4 ${act.iconColor} stroke-[2.2]`} />
              </div>

              {/* Label */}
              <span className="text-center text-white text-sm font-medium font-['Inter'] leading-4">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

