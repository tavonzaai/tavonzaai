'use client';

import React from 'react';
import {
  PlusCircle,
  PhoneCall,
  ArrowRightLeft,
  Receipt,
  Tag,
  UserCheck,
} from 'lucide-react';
import { QuickActionItem } from '../types';

export interface WaiterQuickActionsSectionProps {
  actions?: QuickActionItem[];
  onActionClick?: (actionId: string) => void;
}

export default function WaiterQuickActionsSection({
  actions,
  onActionClick,
}: WaiterQuickActionsSectionProps) {
  const defaultActions = [
    {
      id: 'create-manual-order',
      title: 'Create Manual Order',
      icon: PlusCircle,
    },
    {
      id: 'call-kitchen',
      title: 'Call Host / Kitchen',
      icon: PhoneCall,
    },
    {
      id: 'table-transfer',
      title: 'Table Transfer',
      icon: ArrowRightLeft,
    },
    {
      id: 'split-bill',
      title: 'Split / Print Bill',
      icon: Receipt,
    },
    {
      id: 'apply-discount',
      title: 'Apply Discount / Promo',
      icon: Tag,
    },
    {
      id: 'shift-relief',
      title: 'Request Shift Relief',
      icon: UserCheck,
    },
  ];

  const actionList = actions || defaultActions;

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="pb-3 border-b border-white/10">
          <h3 className="text-slate-200 text-base sm:text-lg font-semibold font-['DM_Sans'] leading-tight">
            Quick Actions
          </h3>
          <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] mt-0.5">
            Operational Shortcuts
          </p>
        </div>

        {/* Action Buttons (3 cols x 2 rows) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {actionList.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onActionClick?.(action.id)}
                className="p-3 bg-white/[0.02] hover:bg-white/[0.07] border border-white/5 hover:border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-left transition-all hover:scale-[1.02] cursor-pointer group"
              >
                <div className="w-7 h-7 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-slate-300 group-hover:text-white text-xs font-medium font-['Inter'] leading-snug line-clamp-2">
                    {action.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-2 text-xs text-zinc-500 text-right">
        Tap any shortcut to trigger instant workflow
      </div>
    </div>
  );
}
