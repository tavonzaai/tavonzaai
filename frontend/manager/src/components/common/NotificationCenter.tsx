'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '../../redux/api/baseApi';
import { formatTimeAgo } from '@tavonza/shared';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: countData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 0, // Zero polling: RealtimeBridge invalidates on socket event
  });
  const unreadCount = countData?.unreadCount ?? 0;

  const { data: notificationsData, isLoading } = useGetNotificationsQuery(
    { page: 1, limit: 15 },
    { skip: !isOpen }
  );

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const notifications = notificationsData?.items ?? [];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800 transition focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/90">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-medium bg-red-500/20 text-red-400 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-800/60">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm">
                No notifications right now
              </div>
            ) : (
              notifications.map((n: any) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) markAsRead(n.id);
                  }}
                  className={`p-3.5 transition cursor-pointer flex gap-3 items-start ${
                    n.isRead ? 'bg-gray-900 hover:bg-gray-850' : 'bg-gray-800/40 hover:bg-gray-800/70'
                  }`}
                >
                  <div className="mt-1">
                    {!n.isRead ? (
                      <span className="block w-2 h-2 rounded-full bg-amber-400" />
                    ) : (
                      <span className="block w-2 h-2 rounded-full bg-transparent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold truncate ${n.isRead ? 'text-gray-300' : 'text-white'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
