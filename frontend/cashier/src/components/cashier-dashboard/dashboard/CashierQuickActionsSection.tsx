'use client';

import React from 'react';
import {
  PlusCircle,
  CreditCard,
  Split,
  Percent,
  RotateCcw,
  Printer,
  Copy,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickActionItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  actionMessage: string;
}

const quickActions: QuickActionItem[] = [
  {
    id: 'new-order',
    name: 'New Order',
    icon: PlusCircle,
    iconBg: 'bg-teal-500/10',
    iconBorder: 'outline-teal-500/20',
    iconColor: 'text-teal-500',
    actionMessage: 'Creating a new checkout order...',
  },
  {
    id: 'process-payment',
    name: 'Process Payment',
    icon: CreditCard,
    iconBg: 'bg-blue-500/10',
    iconBorder: 'outline-blue-500/20',
    iconColor: 'text-blue-500',
    actionMessage: 'Opening payment processing terminal...',
  },
  {
    id: 'split-bill',
    name: 'Split Bill',
    icon: Split,
    iconBg: 'bg-violet-500/10',
    iconBorder: 'outline-violet-500/20',
    iconColor: 'text-violet-500',
    actionMessage: 'Opening split bill modal...',
  },
  {
    id: 'apply-discount',
    name: 'Apply Discount',
    icon: Percent,
    iconBg: 'bg-amber-500/10',
    iconBorder: 'outline-amber-500/20',
    iconColor: 'text-amber-500',
    actionMessage: 'Discount / promo code selector opened.',
  },
  {
    id: 'process-refund',
    name: 'Process Refund',
    icon: RotateCcw,
    iconBg: 'bg-red-500/10',
    iconBorder: 'outline-red-500/20',
    iconColor: 'text-red-500',
    actionMessage: 'Refund verification authorization required.',
  },
  {
    id: 'print-receipt',
    name: 'Print Receipt',
    icon: Printer,
    iconBg: 'bg-gray-500/10',
    iconBorder: 'outline-gray-500/20',
    iconColor: 'text-gray-400',
    actionMessage: 'Printing latest payment receipt...',
  },
  {
    id: 'reprint-receipt',
    name: 'Reprint Receipt',
    icon: Copy,
    iconBg: 'bg-gray-500/10',
    iconBorder: 'outline-gray-500/20',
    iconColor: 'text-gray-400',
    actionMessage: 'Search receipt archive to reprint...',
  },
  {
    id: 'close-shift',
    name: 'Close Shift',
    icon: Lock,
    iconBg: 'bg-orange-500/10',
    iconBorder: 'outline-orange-500/20',
    iconColor: 'text-orange-500',
    actionMessage: 'Initiating cashier drawer count & shift report...',
  },
];

export default function CashierQuickActionsSection() {
  return (
    <div className="space-y-3 font-['Inter']">
      <h2 className="text-white text-lg font-semibold font-['Inter'] leading-tight">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => toast.info(action.actionMessage)}
              className="h-20 px-2.5 py-3 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/10 hover:outline-white/20 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group shadow-sm"
            >
              <div
                className={`size-8 rounded-xl outline outline-1 outline-offset-[-1px] flex items-center justify-center transition-transform group-hover:scale-110 ${action.iconBg} ${action.iconBorder}`}
              >
                <Icon className={`w-4 h-4 ${action.iconColor}`} />
              </div>
              <span className="text-center text-stone-300 group-hover:text-white text-sm font-medium font-['Inter'] leading-tight truncate w-full">
                {action.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
