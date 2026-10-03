'use client';

import React, { useState } from 'react';
import {
  CheckCheck,
  Check,
  Bell,
  Trash2,
  AlertTriangle,
  Clock,
  Sparkles,
  Utensils,
  Receipt,
  UserCheck,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  isNew: boolean;
  severity: 'critical' | 'ready' | 'warning' | 'normal';
  category?: string;
  tableNumber?: string;
}

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Table 12 waiting 18+ minutes',
    description: 'Food has been waiting at the pass. Serve immediately.',
    timeAgo: '2 min ago',
    isNew: true,
    severity: 'critical',
    tableNumber: 'T-12',
  },
  {
    id: 'notif-2',
    title: 'Order #10582 ready for pickup',
    description: 'Grilled Salmon, Caesar Salad — T-12',
    timeAgo: '5 min ago',
    isNew: true,
    severity: 'ready',
    tableNumber: 'T-12',
  },
  {
    id: 'notif-3',
    title: 'Table 5 assistance button pressed',
    description: 'Guest at T-05 requires immediate attention.',
    timeAgo: '12 min ago',
    isNew: true,
    severity: 'warning',
    tableNumber: 'T-05',
  },
  {
    id: 'notif-4',
    title: 'Table 15 requested the bill',
    description: '$82.40 — 5 guests. Ready for checkout.',
    timeAgo: '2 min ago',
    isNew: false,
    severity: 'normal',
    tableNumber: 'T-15',
  },
  {
    id: 'notif-5',
    title: 'AI Insight: Upsell opportunity at T-08',
    description: 'Main course finished. Recommend Chocolate Lava Cake.',
    timeAgo: '2 min ago',
    isNew: false,
    severity: 'normal',
    tableNumber: 'T-08',
  },
  {
    id: 'notif-6',
    title: 'VIP guest seated at T-03',
    description: 'Returning VIP — Emma Johnson. Priority service recommended.',
    timeAgo: '2 min ago',
    isNew: false,
    severity: 'normal',
    tableNumber: 'T-03',
  },
  {
    id: 'notif-7',
    title: 'Order #10579 received from T-05',
    description: 'New order placed. Sent to kitchen.',
    timeAgo: '2 min ago',
    isNew: false,
    severity: 'normal',
    tableNumber: 'T-05',
  },
  {
    id: 'notif-8',
    title: 'T-18 has been waiting for bill 8 min',
    description: 'Send bill or alert cashier.',
    timeAgo: '2 min ago',
    isNew: false,
    severity: 'normal',
    tableNumber: 'T-18',
  },
];

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');

  const unreadCount = notifications.filter((n) => n.isNew).length;

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'Unread') return item.isNew;
    return true;
  });

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isNew: false })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isNew: !n.isNew } : n))
    );
  };

  const renderDot = (severity: NotificationItem['severity'], isNew: boolean) => {
    if (!isNew) {
      return (
        <div className="w-2 h-2 rounded-full border border-zinc-600 flex-shrink-0 mt-1" />
      );
    }
    switch (severity) {
      case 'critical':
        return (
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0px_0px_6px_0px_rgba(239,68,68,0.50)] flex-shrink-0 mt-1 animate-pulse" />
        );
      case 'ready':
        return (
          <div className="w-2 h-2 rounded-full bg-amber-600 shadow-[0px_0px_6px_0px_rgba(217,119,6,0.50)] flex-shrink-0 mt-1" />
        );
      case 'warning':
        return (
          <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0px_0px_6px_0px_rgba(234,179,8,0.50)] flex-shrink-0 mt-1" />
        );
      default:
        return (
          <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1" />
        );
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* 1. Header with Title, Unread Count & Mark All Read Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9">
            Notifications
          </h1>
          <p className="text-zinc-500 text-lg font-normal font-['Inter'] leading-6 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10.20px] text-white text-sm font-semibold font-['Inter'] leading-5 flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
          >
            <CheckCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* 2. Filter Tabs: All vs Unread */}
      <div className="flex items-center">
        <div className="inline-flex rounded-lg overflow-hidden border border-white/20 bg-zinc-950/60 shadow-lg">
          {(['All', 'Unread'] as const).map((tabName, idx) => {
            const isActive = filter === tabName;
            return (
              <button
                key={tabName}
                type="button"
                onClick={() => setFilter(tabName)}
                className={`h-9 px-4 py-2 text-base font-normal font-['Inter'] transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap ${
                  idx !== 0 ? 'border-l border-white/20' : ''
                } ${
                  isActive
                    ? 'bg-yellow-500 text-white font-semibold shadow-inner'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tabName} {tabName === 'Unread' && unreadCount > 0 && `(${unreadCount})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Notifications List */}
      <div className="space-y-3.5">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white/5 rounded-2xl border border-white/10">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-base font-medium font-['Inter']">
              {filter === 'Unread' ? 'No unread notifications.' : 'No notifications to display.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleToggleRead(notif.id)}
              className={`p-4 rounded-2xl outline outline-1 outline-offset-[-1px] ${
                notif.isNew
                  ? 'bg-white/5 outline-neutral-800'
                  : 'bg-zinc-500/5 outline-neutral-800/60'
              } hover:outline-amber-500 hover:shadow-lg hover:shadow-amber-500/10 backdrop-blur-[10.20px] transition-all duration-200 cursor-pointer flex items-start gap-3.5 group`}
            >
              {/* Left Indicator Dot */}
              <div className="pt-0.5">{renderDot(notif.severity, notif.isNew)}</div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col justify-start">
                {/* Title Row + Optional NEW Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-neutral-50 text-sm font-bold font-['Inter'] leading-5 group-hover:text-white transition-colors">
                    {notif.title}
                  </h3>
                  {notif.isNew && (
                    <div className="px-1.5 py-0.5 bg-amber-500/20 rounded-sm">
                      <span className="text-amber-500 text-[10px] font-medium font-['Plus_Jakarta_Sans'] leading-3">
                        NEW
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-5 mt-0.5">
                  {notif.description}
                </p>

                {/* Timestamp */}
                <div className="text-zinc-600 text-sm font-normal font-['DM_Mono'] leading-4 mt-1.5">
                  {notif.timeAgo}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
