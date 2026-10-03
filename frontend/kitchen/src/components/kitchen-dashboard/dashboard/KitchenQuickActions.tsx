'use client';

import React from 'react';
import {
  Play,
  RefreshCw,
  CheckCircle2,
  PackagePlus,
  BellRing,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface KitchenQuickActionsProps {
  onActionClick?: (actionName: string) => void;
}

export default function KitchenQuickActions({ onActionClick }: KitchenQuickActionsProps) {
  const actions = [
    {
      name: 'Start Preparation',
      icon: Play,
      handler: () => {
        toast.success('Next priority batch started on Grill Station.');
        onActionClick?.('Start Preparation');
      }
    },
    {
      name: 'Update Status',
      icon: RefreshCw,
      handler: () => {
        toast.info('Ticket statuses refreshed across KDS monitors.');
        onActionClick?.('Update Status');
      }
    },
    {
      name: 'Mark as Ready',
      icon: CheckCircle2,
      handler: () => {
        toast.success('Order #20581 marked ready. Floor waiter notified for pickup!');
        onActionClick?.('Mark as Ready');
      }
    },
    {
      name: 'Request Ingredients',
      icon: PackagePlus,
      handler: () => {
        toast.warning('Stock runner dispatched for Mozzarella Cheese & Burger Buns.');
        onActionClick?.('Request Ingredients');
      }
    },
    {
      name: 'Notify Waiter',
      icon: BellRing,
      handler: () => {
        toast.success('Table T-08 server alerted to expedite dessert pickup.');
        onActionClick?.('Notify Waiter');
      }
    },
    {
      name: 'View Recipes',
      icon: BookOpen,
      handler: () => {
        toast.info('Recipe catalog opened: Wagyu Burger & Truffle Alfredo.');
        onActionClick?.('View Recipes');
      }
    }
  ];

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold text-white font-['Inter']">Quick Actions</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.name}
              type="button"
              onClick={act.handler}
              className="h-16 px-3 py-2.5 bg-neutral-900 hover:bg-zinc-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 hover:outline-amber-500/30 flex flex-col justify-center items-center gap-1.5 transition-all cursor-pointer group shadow-sm hover:shadow-md"
            >
              <Icon className="w-4 h-4 text-zinc-300 group-hover:text-amber-400 transition-colors" />
              <span className="text-center text-stone-300 group-hover:text-white text-sm font-medium font-['Inter'] leading-tight">
                {act.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
