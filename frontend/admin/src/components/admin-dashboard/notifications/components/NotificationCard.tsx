'use client';

import React from 'react';
import { NotificationItem } from '../types';
import {
  Package,
  ShoppingBag,
  Sparkles,
  MessageSquare,
  Cpu,
  AlertTriangle,
  Check,
  Trash2,
} from 'lucide-react';

interface NotificationCardProps {
  notification: NotificationItem;
  onToggleRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationCard({
  notification,
  onToggleRead,
  onDelete,
}: NotificationCardProps) {
  const getCategoryIcon = () => {
    switch (notification.category) {
      case 'Inventory':
        return {
          icon: Package,
          bg: 'bg-amber-500/20 text-yellow-500',
          pill: 'bg-amber-500/20 text-yellow-500',
        };
      case 'Order':
        return {
          icon: ShoppingBag,
          bg: 'bg-blue-500/20 text-blue-400',
          pill: 'bg-blue-500/20 text-blue-400',
        };
      case 'AI Insight':
        return {
          icon: Sparkles,
          bg: 'bg-orange-500/20 text-amber-500',
          pill: 'bg-orange-500/20 text-amber-500',
        };
      case 'Review':
        return {
          icon: MessageSquare,
          bg: 'bg-purple-500/20 text-purple-400',
          pill: 'bg-purple-500/20 text-purple-400',
        };
      case 'System':
        return {
          icon: Cpu,
          bg: 'bg-zinc-500/20 text-zinc-400',
          pill: 'bg-zinc-500/20 text-zinc-400',
        };
    }
  };

  const { icon: Icon, bg: iconBg, pill: pillBg } = getCategoryIcon();

  const getUnreadDot = () => {
    if (notification.isRead) {
      return null;
    }
    if (notification.priority === 'High') {
      return <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />;
    }
    return <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />;
  };

  return (
    <div
      onClick={() => onToggleRead(notification.id)}
      className={`w-full p-4 rounded-2xl outline outline-1 backdrop-blur-[10.20px] flex items-start gap-4 transition-all duration-150 cursor-pointer group ${
        notification.isRead
          ? 'bg-white/[0.02] outline-neutral-800/80 hover:outline-neutral-700 hover:bg-white/[0.04]'
          : 'bg-white/5 outline-neutral-700 hover:outline-amber-500/40 hover:bg-white/[0.07] shadow-lg'
      }`}
    >
      {/* Category Icon Container */}
      <div
        className={`w-10 h-10 rounded-[20px] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${iconBg}`}
      >
        <Icon className="w-4 h-4 stroke-[2]" />
      </div>

      {/* Content Column */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Top Header: Unread Dot + Title on Left, Category Tag on Right */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {getUnreadDot()}
            <h3
              className={`text-sm sm:text-base font-bold font-['Inter'] leading-5 truncate ${
                notification.isRead ? 'text-zinc-300' : 'text-neutral-50'
              }`}
            >
              {notification.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-['Inter'] leading-4 ${pillBg}`}
            >
              {notification.category}
            </span>
          </div>
        </div>

        {/* Message */}
        <p className="text-zinc-400 text-sm font-normal font-['Inter'] leading-5 pt-0.5">
          {notification.message}
        </p>

        {/* Bottom Meta: Time + Priority Flag + Quick Actions */}
        <div className="flex items-center justify-between pt-1 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 font-['DM_Mono'] text-xs">
              {notification.time}
            </span>

            {notification.priority === 'High' && (
              <div className="flex items-center gap-1 text-red-500 font-bold text-xs font-['Inter']">
                <AlertTriangle className="w-3 h-3" />
                <span>High Priority</span>
              </div>
            )}
          </div>

          {/* Quick Hover Controls */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            <button
              type="button"
              onClick={() => onToggleRead(notification.id)}
              title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
              className="p-1 text-zinc-500 hover:text-white rounded hover:bg-white/10 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(notification.id)}
              title="Delete notification"
              className="p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
