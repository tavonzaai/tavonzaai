'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DashboardView from './dashboard/DashboardView';
import TablesView from './tables/TablesView';
import TableDetailView from './tables/TableDetailView';
import OrdersListView from './orders/OrdersListView';
import OrderDetailView from './orders/OrderDetailView';
import StaffListView from './staff/StaffListView';
import StaffDetailView from './staff/StaffDetailView';
import KitchenKdsView from './kitchen/KitchenKdsView';
import PaymentsView from './payments/PaymentsView';
import PaymentDetailView from './payments/PaymentDetailView';
import MenuView from './menu/MenuView';
import ReportsView from './reports/ReportsView';
import BranchConfigView from './config/BranchConfigView';
import ReassignWaiterModal from './modals/ReassignWaiterModal';
import AskAiModal from './modals/AskAiModal';
import OtherViews from './other/OtherViews';
import { TableItem } from './types';
import { INITIAL_TABLES } from './data';
import { navToRoute, routeToNav } from './routes';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export interface BranchManagerDashboardProps {
  initialNav?: string;
}

export default function BranchManagerDashboard({
  initialNav = 'Dashboard',
}: BranchManagerDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getNavFromPath = useCallback(
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
  const [tables, setTables] = useState<TableItem[]>(INITIAL_TABLES);

  // Drilldown selection states
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const [tableFilter, setTableFilter] = useState<string>('all');
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Sync with pathname
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

  const showToast = (message: string) => {
    setSuccessNotification(message);
    setTimeout(() => setSuccessNotification(null), 4000);
  };

  const handleSetActiveNav = (nav: string) => {
    setActiveNav(nav);
    setSelectedTableId(null);
    setSelectedOrderId(null);
    setSelectedStaffId(null);
    setSelectedPaymentId(null);
    const targetRoute = navToRoute[nav] || `/branch-manager-dashboard/${nav.toLowerCase().replace(/\s+/g, '-')}`;
    router.push(targetRoute);
  };

  const handleNavigateToTables = (filter?: string) => {
    handleSetActiveNav('Table');
    if (filter) setTableFilter(filter);
  };

  const handleSelectTable = (tableId: string) => {
    setSelectedTableId(tableId);
    handleSetActiveNav('Table');
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    handleSetActiveNav('Orders');
  };

  const handleSelectStaff = (staffId: string) => {
    setSelectedStaffId(staffId);
    handleSetActiveNav('Staff');
  };

  const handleSelectPayment = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    handleSetActiveNav('Payments');
  };

  const currentTable: TableItem =
    tables.find((t) => t.id === selectedTableId) || INITIAL_TABLES[2]!;

  const handleConfirmReassign = (newWaiterName: string) => {
    if (selectedTableId) {
      setTables((prev) =>
        prev.map((t) => (t.id === selectedTableId ? { ...t, waiter: newWaiterName } : t))
      );
    }
    showToast(`Table ${currentTable.number} successfully reassigned to ${newWaiterName}!`);
  };

  return (
    <div className="flex h-screen bg-black text-white font-['Inter'] font-sans overflow-hidden">
      {/* Toast Notification */}
      {successNotification && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-neutral-950 font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="text-xs font-['Inter']">{successNotification}</span>
        </div>
      )}

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
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto w-full relative">
          {activeNav.toLowerCase() === 'dashboard' ? (
            <DashboardView
              onNavigateToTables={handleNavigateToTables}
              onSelectTable={handleSelectTable}
            />
          ) : activeNav.toLowerCase() === 'table' ? (
            selectedTableId ? (
              <TableDetailView
                table={currentTable}
                onBack={() => setSelectedTableId(null)}
                onOpenReassign={() => setIsReassignModalOpen(true)}
                onOpenAskAi={() => setIsAskAiOpen(true)}
              />
            ) : (
              <TablesView
                initialFilter={tableFilter}
                onSelectTable={handleSelectTable}
                tablesData={tables}
              />
            )
          ) : activeNav.toLowerCase() === 'orders' ? (
            selectedOrderId ? (
              <OrderDetailView
                orderId={selectedOrderId}
                onBack={() => setSelectedOrderId(null)}
                onVoidOrder={(id) => showToast(`Order #${id} has been voided & cancelled.`)}
              />
            ) : (
              <OrdersListView onSelectOrder={handleSelectOrder} />
            )
          ) : activeNav.toLowerCase() === 'staff' ? (
            selectedStaffId ? (
              <StaffDetailView
                staffId={selectedStaffId}
                onBack={() => setSelectedStaffId(null)}
                onUpdateShift={(msg) => showToast(msg)}
              />
            ) : (
              <StaffListView onSelectStaff={handleSelectStaff} />
            )
          ) : activeNav.toLowerCase() === 'kitchen' ? (
            <KitchenKdsView
              onTicketPlated={(tId) => showToast(`Ticket ${tId} marked as Plated & Ready!`)}
            />
          ) : activeNav.toLowerCase() === 'payments' ? (
            selectedPaymentId ? (
              <PaymentDetailView
                paymentId={selectedPaymentId}
                onBack={() => setSelectedPaymentId(null)}
                onApprovePayment={(id) => showToast(`Payment record ${id} successfully approved & settled.`)}
              />
            ) : (
              <PaymentsView onSelectPayment={handleSelectPayment} />
            )
          ) : activeNav.toLowerCase() === 'menu' ? (
            <MenuView />
          ) : activeNav.toLowerCase() === 'reports' ? (
            <ReportsView />
          ) : activeNav.toLowerCase() === 'branch config' || activeNav.toLowerCase() === 'branch-config' ? (
            <BranchConfigView />
          ) : (
            <OtherViews tab={activeNav} onSelectTable={handleSelectTable} />
          )}

          {/* Floating Ask AI Button */}
          {!selectedTableId && !selectedOrderId && !selectedStaffId && !selectedPaymentId && (
            <button
              type="button"
              onClick={() => setIsAskAiOpen(true)}
              className="fixed bottom-7 right-8 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-neutral-950 font-semibold text-xs sm:text-sm rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center gap-2 cursor-pointer transition z-20 font-['DM_Sans']"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Ask AI</span>
            </button>
          )}
        </main>
      </div>

      {/* Reassign Waiter Modal */}
      <ReassignWaiterModal
        table={currentTable}
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        onConfirmReassign={handleConfirmReassign}
      />

      {/* Ask AI Assistant Modal */}
      <AskAiModal isOpen={isAskAiOpen} onClose={() => setIsAskAiOpen(false)} />
    </div>
  );
}
