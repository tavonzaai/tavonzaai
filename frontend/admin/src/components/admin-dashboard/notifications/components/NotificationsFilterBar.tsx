'use client';

import React from 'react';
import { NotificationCategory } from '../types';
import { NOTIFICATION_CATEGORIES } from '../notificationsData';
import { CheckSquare, Square } from 'lucide-react';

interface NotificationsFilterBarProps {
  selectedCategory: NotificationCategory;
  onSelectCategory: (cat: NotificationCategory) => void;
  unreadOnly: boolean;
  onToggleUnreadOnly: () => void;
  totalNotifications: number;
  categoryCounts: Record<string, number>;
}

export default function NotificationsFilterBar({
  selectedCategory,
  onSelectCategory,
  unreadOnly,
  onToggleUnreadOnly,
  totalNotifications,
  categoryCounts,
}: NotificationsFilterBarProps) {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
      {/* Category Segment Tabs & Unread Toggle */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Segmented Group matching Figma */}
        <div className="inline-flex rounded-lg overflow-hidden border border-white/20 bg-black/40">
          {NOTIFICATION_CATEGORIES.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat];

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`h-9 px-3.5 text-sm sm:text-base font-medium font-['Inter'] transition-colors flex items-center gap-1.5 cursor-pointer ${
                  idx > 0 ? 'border-l border-white/20' : ''
                } ${
                  isSelected
                    ? 'bg-yellow-500 text-white font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{cat}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-white/10 text-zinc-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Unread Only Toggle */}
        <button
          type="button"
          onClick={onToggleUnreadOnly}
          className={`h-9 px-3.5 rounded-sm outline outline-1 transition-all flex items-center gap-2 cursor-pointer ${
            unreadOnly
              ? 'bg-amber-500/20 outline-amber-500/50 text-amber-400'
              : 'bg-zinc-400/10 outline-white/20 text-zinc-400 hover:text-white'
          }`}
        >
          {unreadOnly ? (
            <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Square className="w-3.5 h-3.5 text-zinc-500" />
          )}
          <span className="text-sm sm:text-base font-normal font-['Inter']">
            Unread only
          </span>
        </button>
      </div>

      {/* Counter on Right */}
      <div className="text-stone-300 text-sm sm:text-base font-normal font-['Inter'] flex-shrink-0">
        {totalNotifications} {totalNotifications === 1 ? 'notification' : 'notifications'}
      </div>
    </div>
  );
}
