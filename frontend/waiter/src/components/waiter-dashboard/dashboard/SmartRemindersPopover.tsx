'use client';

import React, { useState } from 'react';
import { Sparkles, X, UtensilsCrossed, Wine, Clock, Gift } from 'lucide-react';
import { toast } from 'sonner';

export interface SmartReminderItem {
  id: string;
  table: string;
  badgeColor: string; // e.g. text-purple-500, text-amber-500, text-red-500, text-green-500
  timeSubtitle: string;
  description: string;
  actionText: string;
  actionBg: string; // e.g. bg-purple-500, bg-amber-500, bg-red-500, bg-green-500
  iconBg: string;
  iconColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const INITIAL_REMINDERS: SmartReminderItem[] = [
  {
    id: 'rem-1',
    table: 'T-08',
    badgeColor: 'text-purple-500',
    timeSubtitle: '· 26 min on main course',
    description:
      'This guest group (3 pax) ordered dessert on 2 of 3 previous visits at this stage. Chocolate Lava Cake is the top pick.',
    actionText: 'Offer Dessert',
    actionBg: 'bg-purple-500 hover:bg-purple-400',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    icon: UtensilsCrossed,
  },
  {
    id: 'rem-2',
    table: 'T-03',
    badgeColor: 'text-amber-500',
    timeSubtitle: '· VIP — 18 min dining',
    description:
      'Emma Johnson (returning VIP) previously ordered a second Chianti after ~20 min on each of her last 3 visits.',
    actionText: 'Suggest Wine',
    actionBg: 'bg-amber-500 hover:bg-amber-400',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    icon: Wine,
  },
  {
    id: 'rem-3',
    table: 'T-20',
    badgeColor: 'text-red-500',
    timeSubtitle: '· 41 min — no check-in',
    description:
      'Large group (4 pax), dining 41 min with no server check-in. Standard interval is 15 min. Visit now.',
    actionText: 'Check In Now',
    actionBg: 'bg-red-500 hover:bg-red-400',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
    icon: Clock,
  },
  {
    id: 'rem-4',
    table: 'T-15',
    badgeColor: 'text-green-500',
    timeSubtitle: '· Birthday celebration',
    description:
      'Birthday cake has been ready in the kitchen for 5 minutes. Guest profile shows preference for a surprise tableside delivery.',
    actionText: 'Bring Cake Out',
    actionBg: 'bg-green-500 hover:bg-green-400',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
    icon: Gift,
  },
];

export interface SmartRemindersPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

export default function SmartRemindersPopover({
  isOpen,
  onClose,
  onCountChange,
}: SmartRemindersPopoverProps) {
  const [reminders, setReminders] = useState<SmartReminderItem[]>(INITIAL_REMINDERS);

  if (!isOpen) return null;

  const handleAction = (item: SmartReminderItem) => {
    toast.success(`Action taken: "${item.actionText}" for Table ${item.table}`);
    const next = reminders.filter((r) => r.id !== item.id);
    setReminders(next);
    if (onCountChange) onCountChange(next.length);
  };

  const handleDismiss = (id: string, table: string) => {
    toast.info(`Reminder for ${table} dismissed.`);
    const next = reminders.filter((r) => r.id !== id);
    setReminders(next);
    if (onCountChange) onCountChange(next.length);
  };

  return (
    <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-32px)] bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 flex flex-col justify-start items-start overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Top Header matching Figma */}
      <div className="w-full px-3.5 py-3 border-b border-white/5 flex items-center justify-between gap-2 bg-zinc-900/90">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-slate-200 text-sm font-bold font-['DM_Sans'] leading-5">
            Smart Reminders
          </span>
          <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold font-['DM_Sans'] leading-4 rounded-full">
            {reminders.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Reminders List Body matching Figma */}
      <div className="w-full max-h-[500px] overflow-y-auto custom-scrollbar flex flex-col justify-start items-start">
        {reminders.length === 0 ? (
          <div className="w-full p-6 text-center text-slate-400 text-xs font-['DM_Sans']">
            No active smart reminders right now. All caught up!
          </div>
        ) : (
          reminders.map((item, index) => {
            const IconComponent = item.icon;
            const isLast = index === reminders.length - 1;

            return (
              <div
                key={item.id}
                className={`w-full p-3.5 flex flex-col justify-start items-start ${
                  !isLast ? 'border-b border-white/5' : ''
                }`}
              >
                <div className="w-full flex items-start gap-3">
                  {/* Icon */}
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-7 h-7 ${item.iconBg} rounded-xl flex items-center justify-center`}
                    >
                      <IconComponent className={`w-3.5 h-3.5 ${item.iconColor}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-start items-start">
                    {/* Table Pill and Timing */}
                    <div className="w-full flex items-center gap-1.5">
                      <span className={`text-[10px] font-medium font-['DM_Mono'] ${item.badgeColor}`}>
                        {item.table}
                      </span>
                      <span className="text-slate-500 text-[9px] font-normal font-['DM_Sans'] leading-3">
                        {item.timeSubtitle}
                      </span>
                    </div>

                    {/* Context description */}
                    <div className="pt-1 text-slate-200/80 text-xs font-normal font-['DM_Sans'] leading-4">
                      {item.description}
                    </div>

                    {/* Action Buttons matching Figma */}
                    <div className="w-full h-9 pt-2.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAction(item)}
                        className={`flex-1 py-1.5 ${item.actionBg} rounded-xl text-center text-white text-[10px] font-semibold font-['DM_Sans'] leading-4 transition-colors cursor-pointer shadow-sm`}
                      >
                        {item.actionText}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDismiss(item.id, item.table)}
                        className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-center text-slate-400 hover:text-white text-[10px] font-medium font-['DM_Sans'] leading-4 transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
