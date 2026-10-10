'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from './Sidebar';
import {
  CashierHeader,
  CashierGreeting,
  VIPBirthdayAlertBanner,
  AIOperationsSummarySection,
  CashierStatCardsSection,
  CashierQuickActionsSection,
  LiveTransactionsSection,
  PendingCheckoutSection,
  AIUpsellSuggestionsSection,
  PaymentAlertsSection,
  CheckoutQueueSection,
  PaymentInsightsSection,
  CustomerFeedbackSection,
} from './dashboard';
import { Sparkles } from 'lucide-react';
import POSView from './pos/POSView';
import OrdersView from './orders/OrdersView';
import PaymentsView from './payments/PaymentsView';
import TransactionsView from './transactions/TransactionsView';
import CustomersView from './customers/CustomersView';
import { LoyaltyView } from './loyalty/LoyaltyView';
import { ShiftReportView } from './shift-report/ShiftReportView';
import { AIInsightsView } from './ai-insights/AIInsightsView';
import { SettingsView } from './settings/SettingsView';
import CashierDashboardView from '../updated-cashier-dashboard/CashierDashboardView';
import AskAiModal from '../updated-cashier-dashboard/AskAiModal';
import DraggableAiButton from '../common/DraggableAiButton';
import { navToRoute, routeToNav } from './routes';

export interface CashierDashboardProps {
  initialNav?: string;
}

export default function CashierDashboard({ initialNav = 'Dashboard' }: CashierDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getNavFromPath = React.useCallback(
    (path?: string | null): string => {
      if (!path) return initialNav;
      const parts = path.split('/').filter(Boolean);
      const last = parts[parts.length - 1]?.toLowerCase();
      if (last && routeToNav[last]) {
        return routeToNav[last];
      }
      return initialNav;
    },
    [initialNav]
  );

  const [activeNav, setActiveNav] = useState<string>(() => getNavFromPath(pathname) || initialNav);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Sync active navigation whenever pathname changes
  useEffect(() => {
    if (pathname) {
      const currentNav = getNavFromPath(pathname);
      if (currentNav) {
        setActiveNav(currentNav);
      }
    }
  }, [pathname, getNavFromPath]);

  // Sync if initialNav prop updates
  useEffect(() => {
    if (initialNav) {
      setActiveNav(initialNav);
    }
  }, [initialNav]);

  const handleSetActiveNav = (nav: string) => {
    setActiveNav(nav);
    const targetRoute = navToRoute[nav] || `/cashier-dashboard/${nav.toLowerCase().replace(/\s+/g, '-')}`;
    router.push(targetRoute);
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-black text-white font-['Inter'] font-sans overflow-hidden">
        {/* 1. Left Sidebar */}
        <Sidebar
        activeNav={activeNav}
        setActiveNav={handleSetActiveNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-black font-['Inter']">
        {/* Top Header */}
        <CashierHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOpenAIModal={() => setIsAIModalOpen(true)}
        />

        {/* Scrollable View Area */}
        <main className="cashier-dashboard-main flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-8 py-4 sm:py-6 space-y-6 w-full pb-16 font-['Inter']">
          {activeNav === 'Dashboard' ? (
            <>
              {/* Top Greeting & Running Status */}
              <CashierGreeting />

              {/* VIP Birthday Alert Banner */}
              <VIPBirthdayAlertBanner />

              {/* AI Operations Summary Hero */}
              <AIOperationsSummarySection
                onOpenAIModal={() => setIsAIModalOpen(true)}
                onViewReport={() => handleSetActiveNav('Shift Report')}
              />

              {/* 6 Key Stat Cards */}
              <CashierStatCardsSection />

              {/* 8 Quick Actions Grid */}
              <CashierQuickActionsSection />

              {/* Middle Row: Live Transactions (Table) & Pending Checkout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
                  <LiveTransactionsSection />
                </div>
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
                  <PendingCheckoutSection
                    onOpenPOS={() => handleSetActiveNav('POS')}
                  />
                </div>
              </div>

              {/* Next Row: AI Upsell Suggestions & Payment Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
                  <AIUpsellSuggestionsSection />
                </div>
                <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
                  <PaymentAlertsSection />
                </div>
              </div>

              {/* Bottom Row: Checkout Queue, Payment Insights, Customer Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                <CheckoutQueueSection />
                <PaymentInsightsSection />
                <CustomerFeedbackSection />
              </div>
            </>
          ) : activeNav.toLowerCase() === 'table view' || activeNav.toLowerCase() === 'table-view' || activeNav.toLowerCase() === 'updated-cashier-dashboard' || activeNav.toLowerCase() === 'updated cashier dashboard' ? (
            <CashierDashboardView initialNav="Table View" embedded />
          ) : activeNav.toLowerCase() === 'create order' || activeNav.toLowerCase() === 'create-order' ? (
            <CashierDashboardView initialNav="Create Order" embedded />
          ) : activeNav.toLowerCase() === 'bill queue' || activeNav.toLowerCase() === 'bill-queue' ? (
            <CashierDashboardView initialNav="Bill Queue" embedded />
          ) : activeNav.toLowerCase() === 'pos' ? (
            <POSView />
          ) : activeNav.toLowerCase() === 'orders' ? (
            <OrdersView onNavigateToPOS={() => handleSetActiveNav('POS')} />
          ) : activeNav.toLowerCase() === 'payments' ? (
            <PaymentsView />
          ) : activeNav.toLowerCase() === 'transactions' ? (
            <TransactionsView />
          ) : activeNav.toLowerCase() === 'customers' ? (
            <CustomersView onNavigateToPOS={() => handleSetActiveNav('POS')} />
          ) : activeNav.toLowerCase() === 'loyalty' ? (
            <LoyaltyView
              onNavigateToPOS={() => handleSetActiveNav('POS')}
              onNavigateToCustomers={() => handleSetActiveNav('Customers')}
            />
          ) : activeNav.toLowerCase() === 'shift report' || activeNav.toLowerCase() === 'shift-report' ? (
            <ShiftReportView onShiftClosed={() => handleSetActiveNav('Dashboard')} />
          ) : activeNav.toLowerCase() === 'ai insights' || activeNav.toLowerCase() === 'ai-insights' ? (
            <AIInsightsView
              onNavigateToTransactions={() => handleSetActiveNav('Transactions')}
              onShiftClosed={() => handleSetActiveNav('Dashboard')}
            />
          ) : activeNav.toLowerCase() === 'settings' ? (
            <SettingsView />
          ) : (
            /* Sub-View Placeholder for other sidebar tabs */
            <div className="bg-white/5 rounded-2xl border border-white/10 p-8 text-center space-y-4 max-w-xl mx-auto my-16 backdrop-blur-lg">
              <div className="size-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white font-['Inter']">{activeNav} View</h2>
              <p className="text-base text-zinc-400 font-['Inter']">
                The {activeNav} module for the Cashier Command Center is fully connected and ready for sub-page views.
              </p>
              <button
                type="button"
                onClick={() => handleSetActiveNav('Dashboard')}
                className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer shadow-md font-['Inter']"
              >
                Back to Cashier Dashboard
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Draggable Floating Ask AI Assistant Button */}
      <DraggableAiButton
        isOpen={isAIModalOpen}
        onToggle={() => setIsAIModalOpen((prev) => !prev)}
        storageKey="cashier_pos_ask_ai_pos"
      />

      {/* Ask AI Assistant Floating Chat Modal */}
      <AskAiModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </div>
    </AuthGuard>
  );
}
