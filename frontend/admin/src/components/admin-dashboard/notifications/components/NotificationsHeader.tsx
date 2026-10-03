'use client';

import React from 'react';
import { CheckCheck, Trash2, Bell } from 'lucide-react';

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export default function NotificationsHeader({
  unreadCount,
  onMarkAllRead,
  onClearAll,
}: NotificationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-3xl sm:text-4xl font-semibold font-['Inter'] tracking-tight">
            Notifications
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Bell className="w-3 h-3 text-amber-400" />
            Live Feed
          </span>
        </div>
        <div className="text-base font-['Inter'] flex items-center gap-1.5">
          <span className="text-amber-500 font-semibold">{unreadCount} unread</span>
          <span className="text-zinc-500">— stay on top of your restaurant operations.</span>
        </div>
      </div>

      {/* Action Buttons matching Figma */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onMarkAllRead}
          className="px-3.5 py-2 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white text-sm font-semibold font-['Inter'] rounded-[10px] outline outline-1 outline-white/10 backdrop-blur-[10.20px] inline-flex items-center gap-1.5 cursor-pointer"
        >
          <CheckCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Mark all read</span>
        </button>

        <button
          type="button"
          onClick={onClearAll}
          className="px-3.5 py-2 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white text-sm font-semibold font-['Inter'] rounded-[10px] outline outline-1 outline-white/10 backdrop-blur-[10.20px] inline-flex items-center gap-1.5 cursor-pointer hover:text-rose-400"
        >
          <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
          <span>Clear all</span>
        </button>
      </div>
    </div>
  );
}
