'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardView from './views/DashboardView';
import RestaurantsView from './views/RestaurantsView';
import BranchesView from './views/BranchesView';
import PermissionsView from './views/PermissionsView';
import PaymentsView from './views/PaymentsView';
import ReportsView from './views/ReportsView';
import SubscriptionView from './views/SubscriptionView';
import SettingsView from './views/SettingsView';
import RestaurantBranchesDetailView from './views/RestaurantBranchesDetailView';
import { MOCK_RESTAURANTS } from './data';
import { AdminNavTab } from './types';

interface NewAdminDashboardProps {
  initialTab?: string;
  initialRestaurantId?: string;
}

export default function NewAdminDashboard({
  initialTab = 'dashboard',
  initialRestaurantId,
}: NewAdminDashboardProps) {
  const router = useRouter();

  // Normalize initialTab
  const normalizedInitial: AdminNavTab = (() => {
    const valid: AdminNavTab[] = [
      'dashboard',
      'restaurants',
      'branches',
      'restaurant-branches',
      'permissions',
      'payments',
      'reports',
      'subscription',
      'settings',
    ];
    const candidate = initialTab.toLowerCase() as AdminNavTab;
    return valid.includes(candidate) ? candidate : 'dashboard';
  })();

  const [activeTab, setActiveTab] = useState<AdminNavTab>(normalizedInitial);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync tab if initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      const candidate = initialTab.toLowerCase() as AdminNavTab;
      const valid: AdminNavTab[] = [
        'dashboard',
        'restaurants',
        'branches',
        'restaurant-branches',
        'permissions',
        'payments',
        'reports',
        'subscription',
        'settings',
      ];
      if (valid.includes(candidate)) {
        setActiveTab(candidate);
      }
    }
  }, [initialTab]);

  const handleTabSelect = (tab: AdminNavTab) => {
    setActiveTab(tab);
    router.push(`/new-admin-dashboard/${tab}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex overflow-x-hidden selection:bg-amber-400 selection:text-black">
      {/* Sidebar (Desktop w-72 fixed, Mobile slide-in) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area (offset by w-72 on desktop) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen min-w-0">
        {/* Top Header */}
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          onSelectTab={handleTabSelect}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView onNavigateTab={handleTabSelect} />
          )}
          {activeTab === 'restaurants' && (
            <RestaurantsView initialRestaurantId={initialRestaurantId} />
          )}
          {activeTab === 'branches' && (
            <BranchesView onBack={() => handleTabSelect('restaurants')} />
          )}
          {activeTab === 'restaurant-branches' && (
            <RestaurantBranchesDetailView
              restaurant={
                (initialRestaurantId
                  ? MOCK_RESTAURANTS.find(
                      (r) =>
                        r.id.toLowerCase() === initialRestaurantId.toLowerCase() ||
                        r.name.toLowerCase().includes(initialRestaurantId.toLowerCase().slice(0, 7))
                    )
                  : null) || MOCK_RESTAURANTS[0]
              }
              onBack={() => handleTabSelect('restaurants')}
              onOpenBranchDashboard={(b) => {
                setActiveTab('branches');
                router.push(`/new-admin-dashboard/branches?branchId=${b.id}`, { scroll: false });
              }}
            />
          )}
          {activeTab === 'permissions' && <PermissionsView />}
          {activeTab === 'payments' && <PaymentsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'subscription' && <SubscriptionView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
