'use client';

import React, { useState } from 'react';
import { getCookie, setCookie } from '@/redux/api/baseApi';
import AuthGuard from '@/components/auth/AuthGuard';
import {
  Sidebar,
  DashboardHeader,
  WelcomeHeader,
  AIDailyBriefing,
  StatCardsSection,
  QuickActionsSection,
  FinancialPulseSection,
  RevenueAndHealthSection,
  AIForecastingSection,
  LiveOperationsSection,
  IntelligenceSection,
  AIReportModal,
  OrdersView,
  POSView,
  QROrderingView,
  MenuView,
  TablesView,
  KitchenDisplayView,
  BarDisplayView,
  InventoryView,
  RecipesView,
  SuppliersView,
  PaymentsView,
  FinanceView,
  AnalyticsView,
  BusinessIntelligenceView,
  EmployeesView,
  CustomersView,
  RestaurantsView,
  LoyaltyView,
  MarketingView,
  ReviewsView,
  DocumentsView,
  AIAgentsView,
  MarketplaceView,
  NotificationsView,
  TavonzaCardView,
  SettingsView,
} from './dashboard';
import {
  mockStatCards,
  mockFinancialPulse,
  mockAIRecommendations,
  mockInventoryAlerts,
  mockRecentOrders,
  mockTopMenuItems,
  mockReservations,
  mockReviews,
  mockMarketingCampaigns,
  mockSuppliers,
  revenueChartData,
  forecastChartData,
  cashflowMonthlyData,
} from './data';
import { navItems } from './Sidebar';
import { AIRecommendation } from './types';

export interface OwnerDashboardProps {
  initialNav?: string;
  initialTab?: string;
  initialBranchRestaurantId?: string;
}

const normalizeTab = (tabStr?: string | null): string | null => {
  if (!tabStr) return null;
  const clean = tabStr.toLowerCase().replace(/\s+/g, '-');
  const found = navItems.find(
    (item) =>
      item.name.toLowerCase() === tabStr.toLowerCase() ||
      item.name.toLowerCase().replace(/\s+/g, '-') === clean
  );
  return found ? found.name : null;
};

const getInitialNav = (initialNav?: string, initialTab?: string): string => {
  // 1. Direct server/prop tab match
  const fromProp = normalizeTab(initialTab) || (initialNav && initialNav !== 'Dashboard' ? normalizeTab(initialNav) : null);
  if (fromProp) return fromProp;

  // 2. Client-side URL search param
  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam) {
        const found = normalizeTab(tabParam);
        if (found) return found;
      }

      // 3. Saved cookie preference
      const savedNav = getCookie('admin_active_nav') || getCookie('owner_active_nav');
      if (savedNav && navItems.some((item) => item.name === savedNav)) {
        return savedNav;
      }
    } catch {
      // Ignore in restricted environments
    }
  }
  return initialNav || 'Dashboard';
};

export default function OwnerDashboard({
  initialNav = 'Dashboard',
  initialTab,
  initialBranchRestaurantId,
}: OwnerDashboardProps) {
  // Initialize directly from URL/localStorage without waiting for post-mount effect
  const [activeNav, setActiveNav] = useState<string>(() => getInitialNav(initialNav, initialTab));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('search') || sp.get('q') || '';
    }
    return '';
  });
  const [timeRange, setTimeRange] = useState<'All' | 'Week' | 'Month' | 'Year'>('Week');
  const [isAIReportOpen, setIsAIReportOpen] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | 'Preparing' | 'Ready'>('All');
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(mockAIRecommendations);
  const [smsSent, setSmsSent] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>(
    initialBranchRestaurantId || 'Downtown Branch'
  );
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  // Sync branch from URL if present
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const branchParam = urlParams.get('branch');
      const restParam = urlParams.get('restaurant');
      if (branchParam) setSelectedBranch(branchParam);
      else if (restParam) setSelectedBranch(restParam);
    }
  }, []);

  // Update route query search param without refreshing
  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (query && query.trim()) {
        url.searchParams.set('search', query.trim());
      } else {
        url.searchParams.delete('search');
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Listen to browser Back/Forward (popstate) navigation
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const handlePopState = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        const resolved = normalizeTab(tabParam) || 'Dashboard';
        setActiveNav(resolved);

        const q = urlParams.get('search') || urlParams.get('q') || '';
        setSearchQuery(q);
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  // Keep URL query param in sync with activeNav if missing
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (!tabParam && activeNav && activeNav !== 'Dashboard') {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', activeNav.toLowerCase().replace(/\s+/g, '-'));
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [activeNav]);


  const handleSetActiveNav = (nav: string) => {
    setActiveNav(nav);
    if (typeof window !== 'undefined') {
      setCookie('admin_active_nav', nav);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', nav.toLowerCase().replace(/\s+/g, '-'));
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleApplyRecommendation = (id: string) => {
    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, applied: true } : rec))
    );
  };

  const handleSendSMS = () => {
    setSmsSent(true);
    setTimeout(() => {
      alert('12 SMS review invites dispatched with direct Google review link.');
    }, 400);
  };

  const filteredOrders = mockRecentOrders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.table.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentRevenueData = revenueChartData[timeRange];

  return (
    <AuthGuard>
      <div className="h-screen bg-black text-zinc-100 font-sans antialiased flex flex-col md:flex-row overflow-hidden selection:bg-amber-500 selection:text-black">
        {/* 1. Sidebar */}
        <Sidebar
        activeNav={activeNav}
        setActiveNav={handleSetActiveNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* 2. Main Content (Scrolls independently, except POS which has its own fixed viewport) */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen ${activeNav === 'POS' ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
        {/* Top Sticky Header */}
        <DashboardHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          branchDropdownOpen={branchDropdownOpen}
          setBranchDropdownOpen={setBranchDropdownOpen}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchQueryChange}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          onOpenSettings={() => handleSetActiveNav('Settings')}
        />

        {/* Dashboard Main Content Area */}
        <main className={`admin-dashboard-main owner-dashboard-main flex-1 ${activeNav === 'POS' ? 'p-3 sm:p-5 md:p-6 flex flex-col min-h-0 overflow-hidden' : 'p-3 sm:p-5 md:p-6 space-y-6'} w-full relative`}>
          {activeNav === 'Orders' ? (
            <OrdersView />
          ) : activeNav === 'POS' ? (
            <POSView />
          ) : activeNav === 'QR Ordering' ? (
            <QROrderingView />
          ) : activeNav === 'Menu' ? (
            <MenuView
              globalSearchQuery={searchQuery}
              onGlobalSearchChange={handleSearchQueryChange}
            />
          ) : activeNav === 'Tables' ? (
            <TablesView />
          ) : activeNav === 'Kitchen Display' ? (
            <KitchenDisplayView />
          ) : activeNav === 'Bar Display' ? (
            <BarDisplayView />
          ) : activeNav === 'Inventory' ? (
            <InventoryView />
          ) : activeNav === 'Recipes' ? (
            <RecipesView />
          ) : activeNav === 'Suppliers' ? (
            <SuppliersView />
          ) : activeNav === 'Payments' ? (
            <PaymentsView />
          ) : activeNav === 'Finance' ? (
            <FinanceView />
          ) : activeNav === 'Analytics' ? (
            <AnalyticsView />
          ) : activeNav === 'Business Intelligence' ? (
            <BusinessIntelligenceView />
          ) : activeNav === 'Employees' ? (
            <EmployeesView />
          ) : activeNav === 'Customers' ? (
            <CustomersView />
          ) : activeNav === 'Restaurants' ? (
            <RestaurantsView
              initialBranchRestaurantId={initialBranchRestaurantId}
              setSelectedBranch={setSelectedBranch}
              selectedBranch={selectedBranch}
            />
          ) : activeNav === 'Loyalty' ? (
            <LoyaltyView />
          ) : activeNav === 'Marketing' ? (
            <MarketingView />
          ) : activeNav === 'Reviews' ? (
            <ReviewsView />
          ) : activeNav === 'Documents' ? (
            <DocumentsView />
          ) : activeNav === 'AI Agents' ? (
            <AIAgentsView />
          ) : activeNav === 'Marketplace' ? (
            <MarketplaceView />
          ) : activeNav === 'Notifications' ? (
            <NotificationsView />
          ) : activeNav === 'Tavonza Card' ? (
            <TavonzaCardView />
          ) : activeNav === 'Settings' ? (
            <SettingsView />
          ) : (
            <>
              {/* Welcome Greeting & CTA */}
              <WelcomeHeader onOpenAIReport={() => setIsAIReportOpen(true)} />

              {/* AI Daily Briefing Hero Card */}
              <AIDailyBriefing onOpenAIReport={() => setIsAIReportOpen(true)} />

              {/* Top 6 KPI Stat Cards */}
              <StatCardsSection stats={mockStatCards} />

              {/* Quick Action Button Cards */}
              <QuickActionsSection />

              {/* Section 1: Financial Pulse */}
              <FinancialPulseSection metrics={mockFinancialPulse} />

              {/* Section 2: Revenue Overview Chart & Business Health Score */}
              <RevenueAndHealthSection
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                revenueData={currentRevenueData}
              />

              {/* Section 3: AI Forecasting, Cash Flow & Reservations */}
              <AIForecastingSection
                forecastData={forecastChartData}
                cashflowData={cashflowMonthlyData}
                reservations={mockReservations}
              />

              {/* Section 4: Live Operations, AI Recommendations, Inventory & Orders */}
              <LiveOperationsSection
                recommendations={recommendations}
                onApplyRecommendation={handleApplyRecommendation}
                inventoryAlerts={mockInventoryAlerts}
                orders={filteredOrders}
                orderStatusFilter={orderStatusFilter}
                setOrderStatusFilter={setOrderStatusFilter}
                topMenuItems={mockTopMenuItems}
              />

              {/* Section 5: Intelligence, Reviews, Marketing & Supply Chain */}
              <IntelligenceSection
                reviews={mockReviews}
                smsSent={smsSent}
                onSendSMS={handleSendSMS}
                campaigns={mockMarketingCampaigns}
                suppliers={mockSuppliers}
              />
            </>
          )}
        </main>
      </div>

        {/* AI Daily Briefing Diagnostic Report Modal */}
        <AIReportModal isOpen={isAIReportOpen} onClose={() => setIsAIReportOpen(false)} />
      </div>
    </AuthGuard>
  );
}
