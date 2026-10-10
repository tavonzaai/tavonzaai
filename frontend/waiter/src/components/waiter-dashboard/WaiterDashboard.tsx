'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { getCookie, setCookie } from '@/redux/api/baseApi';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar, { waiterNavItems } from './Sidebar';
import {
  WaiterHeader,
  WaiterGreeting,
  AIOperationsHero,
  WaiterStatCardsSection,
  PriorityTasksSection,
  AssignedTablesSection,
  LiveOrdersSection,
  AIRecommendationsSection,
  LiveAlertsSection,
  GuestExperienceSection,
  CheckoutReadySection,
  WaiterQuickActionsSection,
  WaiterAIModal,
  VoiceActionModal,
} from './dashboard';
import DraggableAiButton from '../common/DraggableAiButton';
import {
  mockWaiterProfile,
  mockKPIs,
  mockPriorityTasks,
  mockAssignedTables,
  mockLiveOrders,
  mockAIRecommendations,
  mockLiveAlerts,
  mockGuestReviews,
  mockCheckoutTables,
} from './data';
import { AssignedTable, LiveOrder, LiveAlert, AIRecommendation, PriorityTask } from './types';
import { useAppSelector } from '@/redux/hooks';
import { waiterService, getActiveBranchId, CustomerAlert } from '@/redux/features/waiterApi';

// Tab sub-views
import MyTablesView from './my-tables/MyTablesView';
import OrdersView from './orders/OrdersView';
import QROrdersView from './qr-orders/QROrdersView';
import MenuView from './menu/MenuView';
import GuestRequestsView from './guest-requests/GuestRequestsView';
import NotificationsView from './notifications/NotificationsView';
import AIAssistantView from './ai-assistant/AIAssistantView';
import SettingsView from './settings/SettingsView';

export interface WaiterDashboardProps {
  initialNav?: string;
}

const getInitialNav = (initialNav: string): string => {
  if (initialNav && initialNav !== 'Dashboard') {
    const found = waiterNavItems.find(
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
      const found = waiterNavItems.find(
        (item) => item.name.toLowerCase().replace(/\s+/g, '-') === tabParam.toLowerCase()
      );
      if (found) return found.name;
    }
    const savedNav = getCookie('waiter_active_nav');
    if (savedNav && waiterNavItems.some((item) => item.name === savedNav)) {
      return savedNav;
    }
  }
  return initialNav || 'Dashboard';
};

export default function WaiterDashboard({ initialNav = 'Dashboard' }: WaiterDashboardProps) {
  const [activeNav, setActiveNav] = useState<string>(() => getInitialNav(initialNav));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const { user } = useAppSelector((state) => state.auth);
  const [assignedTables, setAssignedTables] = useState<AssignedTable[]>(mockAssignedTables);
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>(mockLiveOrders);
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>(mockLiveAlerts);

  // Fetch live tables, live orders, and live alerts from backend
  useEffect(() => {
    let mounted = true;
    async function loadLiveOperations() {
      try {
        const branchId = getActiveBranchId();
        const [tablesData, ordersData, alertsData] = await Promise.allSettled([
          waiterService.getMyTables(branchId),
          waiterService.getActiveOrders(branchId),
          waiterService.getMyAlerts(branchId),
        ]);

        if (mounted) {
          if (tablesData.status === 'fulfilled' && Array.isArray(tablesData.value) && tablesData.value.length > 0) {
            const mappedTables: AssignedTable[] = tablesData.value.map((t) => {
              const statusMap: Record<string, AssignedTable['status']> = {
                AVAILABLE: 'Available',
                OCCUPIED: 'Occupied',
                BILLING: 'Billing',
                DINING: 'Dining',
              };
              return {
                id: t.id || t.tableId,
                tableNumber: t.tableNumber ? `Table ${t.tableNumber}` : 'Table',
                guests: 2,
                maxCapacity: t.capacity || 4,
                status: statusMap[t.serviceStatus] || 'Occupied',
                waitMinutes: 12,
                serverName: 'You',
              };
            });
            setAssignedTables(mappedTables);
          }

          if (ordersData.status === 'fulfilled' && Array.isArray(ordersData.value) && ordersData.value.length > 0) {
            const mappedOrders: LiveOrder[] = ordersData.value.map((o) => {
              const statusMap: Record<string, LiveOrder['status']> = {
                READY_TO_SERVE: 'Ready to Serve',
                PREPARING: 'Preparing',
                SERVED: 'Served',
                PLACED: 'New Order',
              };
              const status = statusMap[o.status] || 'Preparing';
              return {
                id: o.id || o.orderId || `ord-${Math.random()}`,
                orderNumber: `#${o.orderNumber || '101'}`,
                tableNumber: o.tableNumber ? `Table ${o.tableNumber}` : 'Table',
                items: Array.isArray(o.items) ? o.items.map((i: any) => i.productName || 'Dish') : ['Main Course'],
                status,
                statusColor: status === 'Ready to Serve' ? 'emerald' : status === 'Preparing' ? 'amber' : 'zinc',
                statusBg: status === 'Ready to Serve' ? 'bg-emerald-500/10' : status === 'Preparing' ? 'bg-amber-500/10' : 'bg-zinc-800',
                statusText: status === 'Ready to Serve' ? 'text-emerald-400' : status === 'Preparing' ? 'text-amber-400' : 'text-zinc-400',
                eta: '8 mins',
                timeAgo: 'Just now',
              };
            });
            setLiveOrders(mappedOrders);
          }

          if (alertsData.status === 'fulfilled' && Array.isArray(alertsData.value) && alertsData.value.length > 0) {
            const mappedAlerts: LiveAlert[] = alertsData.value.map((a: CustomerAlert) => ({
              id: a.id,
              message: a.message || `Customer at Table ${a.tableNumber || ''} requested service.`,
              severity: a.type === 'request_bill' ? 'yellow' : 'red',
              dotColor: a.type === 'request_bill' ? 'bg-amber-400' : 'bg-red-400',
              timeAgo: a.createdAt ? `${Math.max(1, Math.round((Date.now() - new Date(a.createdAt).getTime()) / 60000))}m ago` : 'Just now',
            }));
            setLiveAlerts(mappedAlerts);
          }
        }
      } catch (err) {
        console.warn('Live operations background fetch warning:', err);
      }
    }

    loadLiveOperations();
    return () => {
      mounted = false;
    };
  }, []);

  // Sync active tab from browser back/forward buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam) {
        const found = waiterNavItems.find(
          (item) => item.name.toLowerCase().replace(/\s+/g, '-') === tabParam.toLowerCase()
        );
        if (found) {
          setActiveNav(found.name);
          return;
        }
      }
      setActiveNav('Dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSetActiveNav = (nav: string) => {
    setActiveNav(nav);
    if (typeof window !== 'undefined') {
      setCookie('waiter_active_nav', nav);
      const url = new URL(window.location.href);
      if (nav === 'Dashboard') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', nav.toLowerCase().replace(/\s+/g, '-'));
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'create-manual-order':
        setActiveNav('My Tables');
        break;
      case 'call-kitchen':
        setIsAIModalOpen(true);
        break;
      case 'table-transfer':
        setActiveNav('My Tables');
        break;
      case 'split-bill':
        alert('Split bill window triggered for Mobile POS.');
        break;
      case 'apply-discount':
        alert('Discount code application modal opened.');
        break;
      case 'shift-relief':
        alert('Shift relief request broadcasted to shift manager.');
        break;
      default:
        break;
    }
  };

  return (
    <AuthGuard
      allowedRoles={[
        'WAITER',
        'HOST',
        'BRANCH_MANAGER',
        'REGIONAL_MANAGER',
        'RESTAURANT_OWNER',
        'SUPER_ADMIN',
        'ADMIN',
      ]}
    >
      <div className="h-screen bg-black text-zinc-100 font-sans antialiased flex flex-col md:flex-row overflow-hidden selection:bg-amber-500 selection:text-black">
        {/* 1. Sidebar */}
        <Sidebar
        activeNav={activeNav}
        setActiveNav={handleSetActiveNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Sticky Top Header */}
        <WaiterHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenAIModal={() => setIsAIModalOpen(true)}
        />

        {/* Dynamic Main Body Content */}
        <main className="waiter-dashboard-main flex-1 p-3 sm:p-5 md:p-6 space-y-6 w-full max-w-[1600px] mx-auto">
          {activeNav === 'My Tables' ? (
            <MyTablesView />
          ) : activeNav === 'Orders' ? (
            <OrdersView />
          ) : activeNav === 'QR Orders' ? (
            <QROrdersView />
          ) : activeNav === 'Menu' ? (
            <MenuView />
          ) : activeNav === 'Guest Requests' ? (
            <GuestRequestsView />
          ) : activeNav === 'Notifications' ? (
            <NotificationsView />
          ) : activeNav === 'AI Assistant' ? (
            <AIAssistantView />
          ) : activeNav === 'Settings' ? (
            <SettingsView />
          ) : (
            <>
              {/* Top Greeting & Live Update Badge */}
              <WaiterGreeting waiterName={(user?.name || user?.email?.split('@')[0] || mockWaiterProfile.name).split(' ')[0]} />

              {/* AI Operations Hero Card with Briefing & Shift Status Widget */}
              <AIOperationsHero
                onOpenAIModal={() => setIsAIModalOpen(true)}
                onOpenAIReport={() => setIsAIModalOpen(true)}
                onSelectOrder={(_orderId) => {
                  setActiveNav('Orders');
                }}
              />

              {/* 6 High-Density KPI Metric Cards */}
              <WaiterStatCardsSection stats={mockKPIs} />

              {/* Middle 3-Column Section (Tasks, Tables, Live Orders) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                <PriorityTasksSection
                  tasks={mockPriorityTasks}
                  onViewAll={() => setActiveNav('Orders')}
                  onTaskClick={(task) => {
                    if (task.table) setActiveNav('My Tables');
                  }}
                />

                <AssignedTablesSection
                  tables={assignedTables}
                  onFloorPlanClick={() => setActiveNav('My Tables')}
                  onSelectTable={(_table) => setActiveNav('My Tables')}
                />

                <LiveOrdersSection
                  orders={liveOrders}
                  onViewAll={() => setActiveNav('Orders')}
                  onSelectOrder={(_order) => setActiveNav('Orders')}
                />
              </div>

              {/* Lower 3-Column Section (Recommendations, Alerts, Guest Experience) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                <AIRecommendationsSection
                  recommendations={mockAIRecommendations}
                  onDetailsClick={() => setIsAIModalOpen(true)}
                  onApplyRecommendation={(rec) => {
                    alert(`Recommendation applied: ${rec.title}`);
                  }}
                />

                <LiveAlertsSection
                  alerts={liveAlerts}
                  onViewAll={() => setActiveNav('Notifications')}
                  onSelectAlert={(alertItem) => {
                    if (alertItem.message.includes('Table')) {
                      setActiveNav('My Tables');
                    } else {
                      setActiveNav('Orders');
                    }
                  }}
                />

                <GuestExperienceSection
                  rating={4.9}
                  reviews={mockGuestReviews}
                />
              </div>

              {/* Bottom 2-Column Section (Checkout Ready & Quick Actions) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <CheckoutReadySection
                  checkoutTables={mockCheckoutTables}
                  onSendToCashier={() => {
                    alert('Checkout batches sent to Cashier POS terminal #1.');
                  }}
                  onTablePayment={(tbl) => {
                    alert(`Processing bill payment for ${tbl.tableNumber} ($${tbl.amount.toFixed(2)})`);
                  }}
                />

                <WaiterQuickActionsSection
                  onActionClick={handleQuickAction}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Draggable Floating Ask AI Assistant Button */}
      <DraggableAiButton
        isOpen={isAIModalOpen}
        onToggle={() => setIsAIModalOpen((prev) => !prev)}
        storageKey="waiter_copilot_ask_ai_pos"
      />

      {/* Interactive AI Waiter Copilot Modal */}
      <WaiterAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      {/* Voice Action Modal */}
      <VoiceActionModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </div>
    </AuthGuard>
  );
}
