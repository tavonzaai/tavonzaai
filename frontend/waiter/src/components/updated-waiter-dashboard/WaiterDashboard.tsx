'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  Sparkles,
  Users,
  UtensilsCrossed,
  AlertTriangle,
  Receipt,
  Armchair,
  RefreshCw,
  Search,
  FileText,
  CheckCircle2,
  ChevronRight,
  Filter,
  LayoutGrid,
  BellRing,
  ClipboardList,
} from 'lucide-react';
import Sidebar from './Sidebar';
import {
  Header,
  ServeOrderModal,
  AttentionModal,
  ProcessPaymentModal,
  TableDetailsModal,
  TavonzaAIModal,
} from './dashboard';
import { AdHocRequestsView, LiveAlertsView } from './alerts';
import TakingOrderView from './orders';
import OrderStatusView from './order-status';
import BillCheckoutView from './checkout';
import { DashboardTable, ShiftKPIs, TableStatus, OrderTicketItem } from './types';
import { waiterService, getActiveBranchId } from '@/redux/features/waiterApi';

export interface WaiterDashboardProps {
  initialTab?: string;
}

export default function WaiterDashboard({ initialTab = 'floor-view' }: WaiterDashboardProps) {
  // Navigation & Search State
  const [activeNav, setActiveNav] = useState<string>(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tables and KPIs live state
  const [tables, setTables] = useState<DashboardTable[]>([]);
  const [kpis, setKpis] = useState<ShiftKPIs>({
    allTables: 0,
    ready: 0,
    attention: 0,
    bill: 0,
    seated: 0,
    shiftStatus: 'Connecting...',
    ordersInProgress: 0,
    nextPriorityTable: 'None',
    nextPriorityOrder: 'None',
  });
  const [statusFilter, setStatusFilter] = useState<'all' | TableStatus>('all');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Live');

  useEffect(() => {
    let mounted = true;
    const loadWaiterData = async () => {
      try {
        const branchId = getActiveBranchId();
        const [apiTables, apiOrders] = await Promise.all([
          waiterService.getAllTables(branchId).catch(() => []),
          waiterService.getActiveOrders(branchId).catch(() => []),
        ]);

        if (mounted && Array.isArray(apiTables)) {
          const mapped: DashboardTable[] = apiTables.map((t: any, idx: number) => {
            const tableOrder = (apiOrders || []).find(
              (o: any) => o.tableId === t.id || o.tableLabel === t.label
            );
            const isReady = tableOrder?.status === 'READY_TO_SERVE';
            const isPreparing = tableOrder?.status === 'ACCEPTED' || tableOrder?.status === 'PREPARING';
            const isPayment = t.serviceStatus === 'PAYMENT_PENDING' || tableOrder?.paymentStatus === 'UNPAID';
            const isSeated = t.serviceStatus === 'OCCUPIED' || Boolean(t.activeSessionId);

            let status: TableStatus = 'seated';
            let statusLabel = 'Available';
            if (isReady) {
              status = 'ready';
              statusLabel = 'Food Ready';
            } else if (isPayment) {
              status = 'bill';
              statusLabel = 'Waiting for Bill';
            } else if (isPreparing) {
              status = 'preparing';
              statusLabel = 'Preparing';
            } else if (isSeated) {
              status = 'seated';
              statusLabel = 'Dining';
            }

            const num = parseInt(t.label?.replace(/\D/g, '') || String(idx + 1), 10) || idx + 1;

            return {
              id: t.id,
              tableNumber: num,
              tableName: t.label || `Table ${num}`,
              zone: 'Main Dining',
              timeElapsed: tableOrder ? 'Active' : '—',
              status,
              statusLabel,
              guestsCount: `${t.capacity || 4} guests`,
              waiterName: tableOrder?.waiterName || 'Staff Assigned',
              notes: tableOrder?.specialInstructions || 'Standard floor service',
              trayItems: (tableOrder?.items || []).map((it: any, iIdx: number) => ({
                id: `tray-${iIdx}`,
                name: `${it.quantity}x ${it.name}`,
                source: 'KITCHEN',
                verified: isReady,
              })),
              orderId: tableOrder?.orderNumber,
              billAmount: tableOrder?.total ? `$${Number(tableOrder.total).toFixed(2)}` : undefined,
            };
          });

          setTables(mapped);
          setLastSyncTime('Just now');
          setKpis({
            allTables: mapped.length,
            ready: mapped.filter((t) => t.status === 'ready').length,
            attention: mapped.filter((t) => t.status === 'attention').length,
            bill: mapped.filter((t) => t.status === 'bill').length,
            seated: mapped.filter((t) => t.status === 'seated').length,
            shiftStatus: 'Active Operations',
            ordersInProgress: (apiOrders || []).length,
            nextPriorityTable: mapped.find((t) => t.status === 'ready')?.tableName || 'None',
            nextPriorityOrder: mapped.find((t) => t.status === 'ready')?.orderId || 'None',
          });
        }
      } catch (err) {
        console.error('Failed to load live waiter dashboard data:', err);
      }
    };

    loadWaiterData();
    const handleRealtime = () => {
      loadWaiterData();
    };
    window.addEventListener('tavonza:table_status_changed', handleRealtime);
    window.addEventListener('tavonza:table_session_changed', handleRealtime);
    window.addEventListener('tavonza:order_created', handleRealtime);
    window.addEventListener('tavonza:order_status_changed', handleRealtime);
    window.addEventListener('tavonza:order_item_changed', handleRealtime);
    window.addEventListener('tavonza:waiter_called', handleRealtime);
    window.addEventListener('tavonza:payment_status_changed', handleRealtime);

    return () => {
      mounted = false;
      window.removeEventListener('tavonza:table_status_changed', handleRealtime);
      window.removeEventListener('tavonza:table_session_changed', handleRealtime);
      window.removeEventListener('tavonza:order_created', handleRealtime);
      window.removeEventListener('tavonza:order_status_changed', handleRealtime);
      window.removeEventListener('tavonza:order_item_changed', handleRealtime);
      window.removeEventListener('tavonza:waiter_called', handleRealtime);
      window.removeEventListener('tavonza:payment_status_changed', handleRealtime);
    };
  }, []);

  // Modals state
  const [selectedTable, setSelectedTable] = useState<DashboardTable | null>(null);
  const [isServeModalOpen, setIsServeModalOpen] = useState<boolean>(false);
  const [isAttentionModalOpen, setIsAttentionModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [aiMode, setAiMode] = useState<'chat' | 'voice' | 'report'>('chat');

  // Notification toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [takingOrderTableNum, setTakingOrderTableNum] = useState<number>(2);
  const [checkoutTableNum, setCheckoutTableNum] = useState<number>(2);
  const [checkoutOrderId, setCheckoutOrderId] = useState<string>('#TAV-2196');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSelectNav = (navId: string) => {
    setActiveNav(navId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', navId);
      window.history.pushState({}, '', url.toString());
    }
  };

  // Handler for Firing Order from TakingOrderView
  const handleFireOrder = (tblNum: number, items: OrderTicketItem[], total: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.tableNumber === tblNum) {
          return {
            ...t,
            status: 'preparing',
            statusLabel: 'Kitchen Preparing',
            notes: `Fired ${items.length} dishes to Kitchen/Bar (${items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}). Total: $${(total * 1.08875).toFixed(2)}`,
          };
        }
        return t;
      })
    );
    showToast(`Order fired to Kitchen & Bar for Table ${tblNum}! (${items.length} items queued)`);
    handleSelectNav('floor-view');
  };

  // Handler for Serve Order
  const handleOpenServeModal = (table: DashboardTable) => {
    setSelectedTable(table);
    setIsServeModalOpen(true);
  };

  const handleConfirmServed = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status: 'seated',
            statusLabel: 'Dining in Progress',
            notes: 'Course served freshly to guests.',
          };
        }
        return t;
      })
    );
    setKpis((prev) => ({
      ...prev,
      ready: Math.max(0, prev.ready - 1),
      seated: prev.seated + 1,
    }));
    showToast(`Order marked as Served to ${selectedTable?.tableName || 'Table'}! Tray verification complete.`);
  };

  // Handler for Attention Resolve
  const handleOpenAttentionModal = (table: DashboardTable) => {
    setSelectedTable(table);
    setIsAttentionModalOpen(true);
  };

  const handleResolveAttention = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status: 'preparing',
            statusLabel: 'Kitchen Preparing',
            notes: 'Allergen inquiry cleared with Executive Chef. Safe to proceed.',
          };
        }
        return t;
      })
    );
    setKpis((prev) => ({
      ...prev,
      attention: Math.max(0, prev.attention - 1),
    }));
    showToast(`Attention cleared for ${selectedTable?.tableName || 'Table'}! Kitchen notified.`);
  };

  // Handler for Payment
  const handleOpenPaymentModal = (table: DashboardTable) => {
    setSelectedTable(table);
    setIsPaymentModalOpen(true);
  };

  const handleCompletePayment = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status: 'seated',
            statusLabel: 'Settled & Thanked',
            notes: 'Payment settled. Split receipts printed successfully.',
          };
        }
        return t;
      })
    );
    setKpis((prev) => ({
      ...prev,
      bill: Math.max(0, prev.bill - 1),
    }));
    showToast(`Payment successfully completed for ${selectedTable?.tableName || 'Table'}!`);
  };

  // Handler for Details
  const handleOpenDetailsModal = (table: DashboardTable) => {
    setSelectedTable(table);
    setIsDetailsModalOpen(true);
  };

  // Handler for AI Operations trigger
  const handleOpenAI = (mode: 'chat' | 'voice' | 'report' = 'chat') => {
    setAiMode(mode);
    setIsAIModalOpen(true);
  };

  // Filtered tables based on search and status filter
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchesFilter = statusFilter === 'all' || t.status === statusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        t.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.orderId && t.orderId.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [tables, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white relative font-['Inter'] new-dashbord-main flex flex-col">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-amber-500/50 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium font-['DM_Sans']">{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar (w-72) */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Container beside Sidebar */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenVoice={() => handleOpenAI('voice')}
          onOpenAI={() => handleOpenAI('chat')}
          onToggleSidebar={() => setSidebarOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] w-full mx-auto">
          {/* Greeting Row & Station Pulse */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-semibold tracking-tight font-['Inter']">
                Good Morning, Michael
              </h1>
              <p className="text-gray-400 text-sm sm:text-base font-normal mt-1">
                Welcome back! Your shift has started.
              </p>
            </div>

            {/* Station Live Pulse Badge */}
            <div className="self-start sm:self-auto">
              <div className="px-4 py-2 bg-gray-900 rounded-[10px] shadow-[0px_1px_3px_0px_rgba(255,214,168,0.7)] border border-amber-500/20 flex items-center gap-2 select-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 opacity-90 animate-ping" />
                <span className="text-white text-xs font-semibold font-['Inter']">
                  Station Live Pulse
                </span>
              </div>
            </div>
          </div>

          {/* Multi-View Switcher: Floor View vs Taking Order vs Order Status vs Live Alerts vs Ad-Hoc Requests vs Bill Checkout */}
          {/* <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleSelectNav('floor-view')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeNav === 'floor-view'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Floor View</span>
            </button>

            <button
              onClick={() => handleSelectNav('orders')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeNav === 'orders'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Taking Order (Table {takingOrderTableNum})</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeNav === 'orders'
                    ? 'bg-black text-amber-500'
                    : 'bg-stone-900 text-amber-500 border border-amber-500/20'
                }`}
              >
                02
              </span>
            </button>

            <button
              onClick={() => handleSelectNav('order-status')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeNav === 'order-status'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Order Status &amp; KDS</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeNav === 'order-status'
                    ? 'bg-black text-amber-500'
                    : 'bg-stone-900 text-amber-500 border border-amber-500/20'
                }`}
              >
                14
              </span>
            </button>

            <button
              onClick={() => handleSelectNav('alerts')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeNav === 'alerts'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <BellRing className="w-4 h-4" />
              <span>Live Alerts</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeNav === 'alerts'
                    ? 'bg-black text-amber-500'
                    : 'bg-stone-900 text-amber-500 border border-amber-500/20'
                }`}
              >
                04
              </span>
            </button>

            <button
              onClick={() => handleSelectNav('order-requests')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeNav === 'order-requests'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Ad-Hoc Requests</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeNav === 'order-requests'
                    ? 'bg-black text-amber-500'
                    : 'bg-stone-900 text-amber-500 border border-amber-500/20'
                }`}
              >
                14
              </span>
            </button>

            <button
              onClick={() => handleSelectNav('checkout')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeNav === 'checkout'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Bill Checkout (Table {checkoutTableNum})</span>
            </button>
          </div> */}

          {/* Conditional View Rendering */}
          {activeNav === 'orders' ? (
            <TakingOrderView
              tableNumber={takingOrderTableNum}
              onCancel={() => handleSelectNav('floor-view')}
              onFireOrder={handleFireOrder}
              onShowToast={showToast}
            />
          ) : activeNav === 'order-status' ? (
            <OrderStatusView
              onShowToast={showToast}
              onNavigateToFloor={() => handleSelectNav('floor-view')}
              onTakeOrder={(tbl) => {
                setTakingOrderTableNum(tbl);
                handleSelectNav('orders');
              }}
              onNavigateToCheckout={(ordId, tbl) => {
                if (ordId) setCheckoutOrderId(ordId);
                if (tbl) setCheckoutTableNum(tbl);
                handleSelectNav('checkout');
              }}
            />
          ) : activeNav === 'alerts' ? (
            <LiveAlertsView
              onShowToast={showToast}
              onNavigateToOrderStatus={(ordId) => {
                handleSelectNav('order-status');
              }}
              onNavigateToFloor={() => handleSelectNav('floor-view')}
              onNavigateToCheckout={(ordId, tbl) => {
                if (ordId) setCheckoutOrderId(ordId);
                if (tbl) setCheckoutTableNum(tbl);
                handleSelectNav('checkout');
              }}
            />
          ) : activeNav === 'order-requests' ? (
            <AdHocRequestsView onShowToast={showToast} />
          ) : activeNav === 'checkout' ? (
            <BillCheckoutView
              tableNumber={checkoutTableNum}
              orderId={checkoutOrderId}
              onBackToFloor={() => handleSelectNav('floor-view')}
              onShowToast={showToast}
              onCompletePayment={(tbl, ord, amt) => {
                handleCompletePayment(`t-${tbl}`);
                handleSelectNav('floor-view');
              }}
            />
          ) : (
            <>
          {/* AI Operations Summary Hero Banner (From Figma) */}
          <div className="bg-white/5 rounded-[12px] border border-white/10 backdrop-blur-[10.20px] p-5 sm:p-6 shadow-xl flex flex-col lg:flex-row justify-between gap-6 relative overflow-hidden">
            {/* Left AI Text & Controls */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              {/* Header Title + Shift Active Pill */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-white text-sm sm:text-base font-bold font-['Inter']">
                  Tavonza AI Operations Summary
                </h2>

                <div className="px-2.5 py-1 bg-green-500/10 rounded-[5px] border border-green-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-95 animate-pulse" />
                  <span className="text-emerald-500 text-xs font-medium font-['DM_Sans']">
                    Shift Active
                  </span>
                </div>
              </div>

              {/* AI Summary Text */}
              <p className="text-zinc-300 text-xs sm:text-sm font-normal leading-relaxed font-['Inter'] max-w-2xl">
                Good morning, Michael. You are assigned to 8 tables with 14 active orders. Table 12 has been waiting longer than average and should be prioritized. Table 8 has completed the main course and is ready for a dessert recommendation.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={() => handleOpenAI('chat')}
                  className="h-8 sm:h-9 px-3.5 py-1.5 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] rounded-md text-white font-semibold text-xs font-['Plus_Jakarta_Sans'] flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Ask Tavonza AI</span>
                </button>

                <button
                  onClick={() => handleOpenAI('report')}
                  className="h-8 sm:h-9 px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 border border-white/10 rounded-md text-slate-200/90 font-medium text-xs font-['Plus_Jakarta_Sans'] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>View AI Report</span>
                </button>
              </div>
            </div>

            {/* Right Card: Current Shift KPI Mini-Widget (From Figma) */}
            <div className="w-full lg:w-60 bg-neutral-800/90 rounded-lg border border-white/10 backdrop-blur-[30px] p-4 flex flex-col justify-between shrink-0 space-y-3">
              <div className="text-white text-xs font-medium font-['Inter']">
                Current Shift
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Shift Status */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] font-['DM_Sans']">Shift Status</span>
                  <span className="text-green-500 text-xs font-semibold font-['DM_Sans'] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>

                {/* All Tables */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] font-['DM_Sans']">All Tables</span>
                  <span className="text-white text-xs font-semibold font-['DM_Sans'] font-mono">
                    0{kpis.allTables}
                  </span>
                </div>

                {/* Orders in Progress */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] font-['DM_Sans']">Orders in Progress</span>
                  <span className="text-white text-xs font-semibold font-['DM_Sans'] font-mono">
                    {kpis.ordersInProgress}
                  </span>
                </div>

                {/* Next Priority */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] font-['DM_Sans']">Next Priority</span>
                  <span className="text-white text-xs font-semibold font-['DM_Sans']">
                    {kpis.nextPriorityTable}
                  </span>
                </div>
              </div>

              {/* Bottom Priority Quick Action */}
              <div
                onClick={() => {
                  const target = tables.find((t) => t.status === 'ready') || tables[0];
                  if (target) {
                    handleOpenServeModal(target);
                  }
                }}
                className="border-t border-white/10 pt-2.5 flex items-center justify-between cursor-pointer group hover:opacity-90 transition-opacity"
              >
                <span className="text-white text-[11px] font-medium font-['Inter'] group-hover:text-amber-400">
                  Serve Order
                </span>
                <span className="text-amber-500 text-xs font-semibold font-['DM_Sans'] flex items-center gap-1 font-mono">
                  {kpis.nextPriorityOrder}
                  <ChevronRight className="w-3 h-3 text-amber-500" />
                </span>
              </div>
            </div>
          </div>

          {/* Live Sync Active Feed Bar (From Figma) */}
          <div className="h-10 bg-neutral-900 rounded-[10px] border border-zinc-800 shadow-[0px_0px_2px_0px_rgba(75,75,75,1.00)] px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-500 font-semibold font-['Inter']">
                Live Sync Active /
              </span>
              <span className="text-neutral-400 font-normal hidden sm:inline font-['Inter']">
                Auto-Refreshing Station Feed
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-['Inter']">
              <RefreshCw className="w-3 h-3 text-zinc-500 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Update {lastSyncTime}</span>
            </div>
          </div>

          {/* 5 Filter / Status Metric Cards (From Figma) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Card 1: All Table */}
            <div
              onClick={() => setStatusFilter('all')}
              className={`p-4 rounded-2xl bg-neutral-900 border transition-all cursor-pointer select-none relative shadow-sm ${
                statusFilter === 'all'
                  ? 'border-blue-500/80 bg-neutral-900/90 ring-1 ring-blue-500/30'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-white text-2xl font-bold font-['Plus_Jakarta_Sans'] font-mono">
                0{kpis.allTables}
              </div>
              <div className="text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] mt-1">
                All Table
              </div>
              <div className="text-slate-400 text-[11px] font-normal font-['Plus_Jakarta_Sans'] mt-0.5 truncate">
                View table status and orders
              </div>
            </div>

            {/* Card 2: Ready */}
            <div
              onClick={() => setStatusFilter('ready')}
              className={`p-4 rounded-2xl bg-neutral-900 border transition-all cursor-pointer select-none relative shadow-sm ${
                statusFilter === 'ready'
                  ? 'border-emerald-500/80 bg-neutral-900/90 ring-1 ring-emerald-500/30'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div className="text-white text-2xl font-bold font-['Plus_Jakarta_Sans'] font-mono">
                0{kpis.ready}
              </div>
              <div className="text-emerald-500 text-xs font-semibold font-['Plus_Jakarta_Sans'] mt-1">
                Ready
              </div>
              <div className="text-slate-400 text-[11px] font-normal font-['Plus_Jakarta_Sans'] mt-0.5 truncate">
                Orders ready to be served
              </div>
            </div>

            {/* Card 3: Attention */}
            <div
              onClick={() => setStatusFilter('attention')}
              className={`p-4 rounded-2xl bg-neutral-900 border transition-all cursor-pointer select-none relative shadow-sm ${
                statusFilter === 'attention'
                  ? 'border-red-500/80 bg-neutral-900/90 ring-1 ring-red-500/30'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-white text-2xl font-bold font-['Plus_Jakarta_Sans'] font-mono">
                0{kpis.attention}
              </div>
              <div className="text-red-500 text-xs font-semibold font-['Plus_Jakarta_Sans'] mt-1">
                Attention
              </div>
              <div className="text-slate-400 text-[11px] font-normal font-['Plus_Jakarta_Sans'] mt-0.5 truncate">
                Quickly resolve pending issues
              </div>
            </div>

            {/* Card 4: Bill */}
            <div
              onClick={() => setStatusFilter('bill')}
              className={`p-4 rounded-2xl bg-neutral-900 border transition-all cursor-pointer select-none relative shadow-sm ${
                statusFilter === 'bill'
                  ? 'border-purple-500/80 bg-neutral-900/90 ring-1 ring-purple-500/30'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="text-white text-2xl font-bold font-['Plus_Jakarta_Sans'] font-mono">
                0{kpis.bill}
              </div>
              <div className="text-purple-400 text-xs font-semibold font-['Plus_Jakarta_Sans'] mt-1">
                Bill
              </div>
              <div className="text-slate-400 text-[11px] font-normal font-['Plus_Jakarta_Sans'] mt-0.5 truncate">
                Manage and review customer bills
              </div>
            </div>

            {/* Card 5: Seated */}
            <div
              onClick={() => setStatusFilter('seated')}
              className={`p-4 rounded-2xl bg-neutral-900 border transition-all cursor-pointer select-none relative shadow-sm col-span-2 sm:col-span-1 ${
                statusFilter === 'seated'
                  ? 'border-blue-400/80 bg-neutral-900/90 ring-1 ring-blue-400/30'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                <Armchair className="w-4 h-4" />
              </div>
              <div className="text-white text-2xl font-bold font-['Plus_Jakarta_Sans'] font-mono">
                0{kpis.seated}
              </div>
              <div className="text-blue-400 text-xs font-semibold font-['Plus_Jakarta_Sans'] mt-1">
                Seated
              </div>
              <div className="text-slate-400 text-[11px] font-normal font-['Plus_Jakarta_Sans'] mt-0.5 truncate">
                View currently seated guests
              </div>
            </div>
          </div>

          {/* Active Filter Indicator and Search Count */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <span>Showing: </span>
              <span className="text-white font-semibold capitalize">
                {statusFilter === 'all' ? 'All Assigned Tables' : `${statusFilter} Tables`}
              </span>
              <span>({filteredTables.length} tables)</span>
            </div>

            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="text-amber-500 hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Table Cards Grid (From Figma: 2x4 Layout on large displays) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredTables.map((table) => {
              // Determine status banner style
              let bannerStyle = 'bg-green-500/10 text-emerald-500 border-green-500/50';
              if (table.status === 'attention') {
                bannerStyle = 'bg-red-500/10 text-red-500 border-red-500/50';
              } else if (table.status === 'bill') {
                bannerStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/40';
              } else if (table.status === 'seated') {
                bannerStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/40';
              } else if (table.status === 'preparing') {
                bannerStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/40';
              }

              return (
                <div
                  key={table.id}
                  className="bg-white/5 rounded-[12px] border border-white/20 backdrop-blur-[10.20px] p-4 flex flex-col justify-between space-y-3 hover:border-white/40 transition-all shadow-md group"
                >
                  {/* Card Header: Table Name, Zone & Elapsed Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-base font-semibold font-['Inter']">
                        {table.tableName}
                      </span>
                      <span className="px-1.5 py-0.5 bg-white/10 rounded text-white/90 text-[9px] font-semibold font-['DM_Sans'] uppercase tracking-wider">
                        {table.zone}
                      </span>
                    </div>

                    {/* Time Elapsed Pill */}
                    <div className="px-2 py-0.5 bg-amber-500/15 rounded border border-amber-500/30 flex items-center gap-1 text-amber-500">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-semibold font-['DM_Sans'] uppercase">
                        {table.timeElapsed}
                      </span>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div
                    className={`w-full py-1 px-2.5 rounded border text-[11px] font-semibold font-['DM_Sans'] flex items-center justify-between ${bannerStyle}`}
                  >
                    <span>{table.statusLabel}</span>
                    {table.status === 'attention' && (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    )}
                  </div>

                  {/* Guest Count & Waiter Assignment */}
                  <div className="flex items-center justify-between text-[11px] font-medium text-stone-300 font-['DM_Sans']">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      <span>{table.guestsCount}</span>
                    </div>
                    <span className="text-stone-400 truncate max-w-[120px]">
                      {table.waiterName}
                    </span>
                  </div>

                  {/* Special Note Container */}
                  <div className="bg-slate-950/80 rounded-md border border-neutral-800 p-2.5 min-h-[52px] flex items-center">
                    <p className="text-stone-300 text-[11px] font-medium font-['DM_Sans'] leading-snug line-clamp-2">
                      {table.notes}
                    </p>
                  </div>

                  {/* Action Button tailored to Table Status */}
                  <div className="pt-1">
                    {table.status === 'ready' && (
                      <button
                        onClick={() => handleOpenServeModal(table)}
                        className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] rounded-[6px] text-black font-semibold text-xs sm:text-sm font-['DM_Sans'] transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Mark Served Now</span>
                      </button>
                    )}

                    {table.status === 'attention' && (
                      <button
                        onClick={() => handleOpenAttentionModal(table)}
                        className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-500 active:scale-[0.98] rounded-[6px] text-white font-semibold text-xs sm:text-sm font-['DM_Sans'] transition-all shadow-md shadow-red-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>View Request</span>
                      </button>
                    )}

                    {table.status === 'bill' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setCheckoutTableNum(table.tableNumber);
                            setCheckoutOrderId(table.orderId || '#TAV-2196');
                            handleSelectNav('checkout');
                          }}
                          className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] rounded-[6px] text-black font-semibold text-xs sm:text-sm font-['DM_Sans'] transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5 text-black" />
                          <span>Bill Checkout</span>
                        </button>
                        <button
                          onClick={() => handleOpenPaymentModal(table)}
                          className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] rounded-[6px] text-zinc-300 text-xs font-medium border border-zinc-700 cursor-pointer"
                          title="Quick Modal"
                        >
                          Modal
                        </button>
                      </div>
                    )}

                    {table.status === 'seated' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setTakingOrderTableNum(table.tableNumber);
                            handleSelectNav('orders');
                          }}
                          className="flex-1 py-2.5 px-2 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] rounded-[6px] text-black font-semibold text-xs font-['DM_Sans'] transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <ClipboardList className="w-3.5 h-3.5 text-black" />
                          <span>Take Order</span>
                        </button>
                        <button
                          onClick={() => handleOpenDetailsModal(table)}
                          className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] rounded-[6px] text-zinc-300 text-xs font-medium border border-zinc-700 cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    )}

                    {table.status === 'preparing' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSelectNav('order-status')}
                          className="flex-1 py-2.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 active:scale-[0.98] rounded-[6px] text-amber-400 font-semibold text-xs font-['DM_Sans'] transition-all border border-amber-500/30 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>KDS Status</span>
                        </button>
                        <button
                          onClick={() => handleOpenDetailsModal(table)}
                          className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] rounded-[6px] text-white text-xs font-medium border border-zinc-700 cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
            </>
          )}
        </main>
      </div>

      {/* Scoped Modals */}
      <ServeOrderModal
        table={selectedTable}
        isOpen={isServeModalOpen}
        onClose={() => setIsServeModalOpen(false)}
        onConfirmServed={handleConfirmServed}
      />

      <AttentionModal
        table={selectedTable}
        isOpen={isAttentionModalOpen}
        onClose={() => setIsAttentionModalOpen(false)}
        onResolve={handleResolveAttention}
      />

      <ProcessPaymentModal
        table={selectedTable}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentComplete={handleCompletePayment}
      />

      <TableDetailsModal
        table={selectedTable}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <TavonzaAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        mode={aiMode}
      />
    </div>
  );
}
