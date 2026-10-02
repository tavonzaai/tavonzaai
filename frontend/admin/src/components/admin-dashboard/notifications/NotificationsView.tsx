'use client';

import React, { useState, useMemo } from 'react';
import {
  NotificationsHeader,
  NotificationsFilterBar,
  NotificationsList,
} from './components';
import { INITIAL_NOTIFICATIONS } from './notificationsData';
import { NotificationCategory, NotificationItem } from './types';
import { CheckCircle } from 'lucide-react';

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('All');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Dynamic Unread Count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: notifications.length,
      Order: 0,
      Inventory: 0,
      'AI Insight': 0,
      Review: 0,
      System: 0,
    };

    notifications.forEach((n) => {
      if (counts[n.category] !== undefined) {
        counts[n.category]++;
      }
    });

    return counts;
  }, [notifications]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesCategory =
        selectedCategory === 'All' || n.category === selectedCategory;
      const matchesUnread = !unreadOnly || !n.isRead;
      return matchesCategory && matchesUnread;
    });
  }, [notifications, selectedCategory, unreadOnly]);

  // Handlers
  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification removed.');
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read.');
  };

  const handleClearAll = () => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
      showToast('All notifications cleared.');
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-[#18191c] border border-amber-500/50 rounded-xl shadow-2xl text-white text-sm flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header (Title, Unread Subtitle, Mark All Read, Clear All) */}
      <NotificationsHeader
        unreadCount={unreadCount}
        onMarkAllRead={handleMarkAllRead}
        onClearAll={handleClearAll}
      />

      {/* 2. Filter Bar (Segment Tabs: All, Order, Inventory, AI Insight, Review, System + Unread Only) */}
      <NotificationsFilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        unreadOnly={unreadOnly}
        onToggleUnreadOnly={() => setUnreadOnly(!unreadOnly)}
        totalNotifications={filteredNotifications.length}
        categoryCounts={categoryCounts}
      />

      {/* 3. Notifications Feed List */}
      <NotificationsList
        notifications={filteredNotifications}
        onToggleRead={handleToggleRead}
        onDelete={handleDelete}
        itemsPerPage={10}
      />
    </div>
  );
}
