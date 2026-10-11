'use client';

import React, { useState, useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar, { kitchenNavItems } from './Sidebar';
import { getCookie, setCookie } from '@/redux/api/baseApi';
import {
  KitchenHeader,
  WelcomeKitchenHeader,
  AIOperationsSummarySection,
  KitchenStatCardsSection,
  WorkflowProgressSection,
  KitchenQuickActions,
  KitchenLiveOrdersSection,
  StationStatusSection,
  AIBeverageInsightsSection,
  KitchenInventorySection,
  LiveKitchenAlertsSection,
  KitchenPerformanceSection,
  AskKitchenAIModal,
} from './dashboard';
import DraggableAiButton from '../common/DraggableAiButton';
import KitchenQueueView from './kitchen-queue/KitchenQueueView';
import ActiveOrdersView from './active-orders/ActiveOrdersView';
import KitchenStationsView from './stations/KitchenStationsView';
import KitchenRecipesView from './recipes/KitchenRecipesView';
import KitchenInventoryView from './inventory/KitchenInventoryView';
import ShiftReportView from './shift-report/ShiftReportView';
import AIKitchenInsightsView from './ai-insights/AIKitchenInsightsView';
import KitchenSettingsView from './settings/KitchenSettingsView';
import FutureAIView from './future-ai/FutureAIView';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export interface KitchenDashboardProps {
  initialNav?: string;
}

const getInitialNav = (initialNav: string): string => {
  if (initialNav && initialNav !== 'Dashboard') {
    if (initialNav.toLowerCase() === 'settings') return 'Settings';
    if (initialNav.toLowerCase() === 'future-ai' || initialNav.toLowerCase() === 'futureai') return 'Future AI';
    const found = kitchenNavItems.find(
      (item) =>
        item.name.toLowerCase().replace(/\s+/g, '-') === initialNav.toLowerCase() ||
        item.name.toLowerCase() === initialNav.toLowerCase()
    );
    if (found) return found.name;
    return initialNav;
  }

  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      if (tabParam.toLowerCase() === 'settings') return 'Settings';
      if (tabParam.toLowerCase() === 'future-ai' || tabParam.toLowerCase() === 'futureai') return 'Future AI';
      const found = kitchenNavItems.find(
        (item) => item.name.toLowerCase().replace(/\s+/g, '-') === tabParam.toLowerCase()
      );
      if (found) return found.name;
    }
    const savedNav = getCookie('kitchen_active_nav');
    if (savedNav && (savedNav === 'Settings' || kitchenNavItems.some((item) => item.name === savedNav))) {
      return savedNav;
    }
  }
  return initialNav || 'Dashboard';
};

export default function KitchenDashboard({ initialNav = 'Dashboard' }: KitchenDashboardProps) {
  const [activeNav, setActiveNav] = useState<string>(() => getInitialNav(initialNav));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Sync active tab from browser back/forward buttons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handlePopState = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam) {
          if (tabParam.toLowerCase() === 'settings') {
            setActiveNav('Settings');
            return;
          }
          if (tabParam.toLowerCase() === 'future-ai' || tabParam.toLowerCase() === 'futureai') {
            setActiveNav('Future AI');
            return;
          }
          const found = kitchenNavItems.find(
            (item) => item.name.toLowerCase().replace(/\s+/g, '-') === tabParam.toLowerCase()
          );
          if (found) {
            setActiveNav(found.name || "Dashboard");
            return;
          }
        }
        setActiveNav('Dashboard');
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  const handleSetActiveNav = (nav: string) => {
    setActiveNav(nav);
    if (typeof window !== 'undefined') {
      setCookie('kitchen_active_nav', nav);
      const url = new URL(window.location.href);
      if (nav === 'Dashboard') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', nav.toLowerCase().replace(/\s+/g, '-'));
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <AuthGuard allowedRoles={["KITCHEN"]}
    >
      <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
        {/* 1. Fixed Left Sidebar */}
        <Sidebar
        activeNav={activeNav}
        setActiveNav={handleSetActiveNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-black">
        {/* Top Header */}
        <KitchenHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOpenAIModal={() => setIsAIModalOpen(true)}
        />

        {/* Scrollable Main Area */}
        <main className="kitchen-dashboard-main flex-1 overflow-y-auto  px-6 py-4 sm:py-6 space-y-6 custom-scrollbar">
          {activeNav === 'Kitchen Queue' ? (
            <KitchenQueueView />
          ) : activeNav === 'Active Orders' ? (
            <ActiveOrdersView />
          ) : activeNav === 'Stations' ? (
            <KitchenStationsView />
          ) : activeNav === 'Recipes' ? (
            <KitchenRecipesView />
          ) : activeNav === 'Inventory' ? (
            <KitchenInventoryView />
          ) : activeNav === 'Shift Report' ? (
            <ShiftReportView />
          ) : activeNav === 'Future AI' ? (
            <FutureAIView />
          ) : activeNav === 'AI Insights' ? (
            <AIKitchenInsightsView onOpenAIModal={() => setIsAIModalOpen(true)} />
          ) : activeNav === 'Settings' ? (
            <KitchenSettingsView />
          ) : (
            /* Default: Main Executive Kitchen Dashboard */
            <>
              {/* A. Welcome Banner */}
              <WelcomeKitchenHeader />

              {/* B. AI Operations Summary & Kitchen Capacity Gauge */}
              <AIOperationsSummarySection
                onOpenAIModal={() => setIsAIModalOpen(true)}
                onOpenReportModal={() => {
                  handleSetActiveNav('Shift Report');
                }}
              />

              {/* C. Stat Cards Row (6 Glowing Metric Cards) */}
              <KitchenStatCardsSection />

              {/* D. Workflow Progress Multi-Stage Bar */}
              <WorkflowProgressSection />

              {/* E. Quick Actions Grid */}
              <KitchenQuickActions onActionClick={(act) => {
                if (act === 'View Recipes') {
                  handleSetActiveNav('Recipes');
                } else if (act === 'Start Preparation') {
                  handleSetActiveNav('Kitchen Queue');
                }
              }} />

              {/* F. Main Operational Row: Live Orders Table & Station Status */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-8">
                  <KitchenLiveOrdersSection searchQuery={searchQuery} />
                </div>
                <div className="lg:col-span-4">
                  <StationStatusSection />
                </div>
              </div>

              {/* G. AI Insights & Kitchen Inventory */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-6">
                  <AIBeverageInsightsSection onOpenAIModal={() => setIsAIModalOpen(true)} />
                </div>
                <div className="lg:col-span-6">
                  <KitchenInventorySection />
                </div>
              </div>

              {/* H. Live Alerts & Today's Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-12">
                <div className="lg:col-span-5">
                  <LiveKitchenAlertsSection />
                </div>
                <div className="lg:col-span-7">
                  <KitchenPerformanceSection />
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* 3. Draggable Floating "Ask AI" Button (Drag & drop anywhere) */}
      <DraggableAiButton
        isOpen={isAIModalOpen}
        onToggle={() => setIsAIModalOpen((prev) => !prev)}
        defaultBottom={24}
        defaultRight={24}
        storageKey="kitchen_kds_ask_ai_pos"
      />

      {/* 4. Interactive AI Chat Modal */}
      <AskKitchenAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
    </AuthGuard>
  );
}
