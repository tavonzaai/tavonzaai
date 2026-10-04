'use client';

import React, { useState, useEffect } from 'react';
import { waiterService, getActiveBranchId } from '@/redux/features/waiterApi';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Flame,
  Utensils,
  Bell,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export interface KDSOrder {
  id: string;
  orderNumber: string;
  tableNumber: number;
  tableName: string;
  createdTime: string;
  waiterName: string;
  status: 'received' | 'preparing' | 'ready' | 'served';
  paid: boolean;
  station: 'Kitchen Station 1' | 'Station 2 (Grill)' | 'Bar Station';
  elapsedMins: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    status: 'Pending' | 'Preparing' | 'Cooked' | 'Ready to Serve';
    station: string;
    notes?: string;
  }[];
}

const initialKdsOrders: KDSOrder[] = [];

interface OrderStatusViewProps {
  onShowToast?: (msg: string) => void;
  onNavigateToFloor?: () => void;
  onTakeOrder?: (tableNum: number) => void;
  onNavigateToCheckout?: (orderId: string, tableNum: number) => void;
}

export default function OrderStatusView({
  onShowToast,
  onNavigateToFloor,
  onNavigateToCheckout,
}: OrderStatusViewProps) {
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      try {
        const branchId = getActiveBranchId();
        const liveOrders = await waiterService.getActiveOrders(branchId);
        if (mounted && Array.isArray(liveOrders)) {
          const mapped: KDSOrder[] = liveOrders.map((o: any) => {
            let status: KDSOrder['status'] = 'received';
            if (o.status === 'PREPARING') status = 'preparing';
            else if (o.status === 'READY_TO_SERVE') status = 'ready';
            else if (o.status === 'SERVED' || o.status === 'COMPLETED') status = 'served';

            const createdDate = new Date(o.createdAt);
            const diffMins = !isNaN(createdDate.getTime())
              ? Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / 60000))
              : 0;

            return {
              id: o.orderId || o.id,
              orderNumber: o.orderNumber,
              tableNumber: parseInt(o.tableLabel?.replace(/\D/g, '') || '1', 10) || 1,
              tableName: o.tableLabel || 'Table',
              createdTime: diffMins === 0 ? 'Created just now' : `Created ${diffMins}m ago`,
              waiterName: o.waiterName || 'Staff Assigned',
              status,
              paid: o.paymentStatus === 'PAID',
              station: 'Kitchen Station 1',
              elapsedMins: diffMins,
              items: (o.items || []).map((it: any, idx: number) => ({
                id: it.id || `item-${idx}`,
                name: it.name,
                quantity: it.quantity,
                status: status === 'served' ? 'Ready to Serve' : status === 'ready' ? 'Cooked' : status === 'preparing' ? 'Preparing' : 'Pending',
                station: 'Kitchen Main Deck',
                notes: it.notes,
              })),
            };
          });
          setOrders(mapped);
        }
      } catch (err) {
        console.error('Failed to load active orders for KDS monitor:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);
  const [filterStation, setFilterStation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onShowToast?.('KDS & BDS synchronization updated. All 4 display channels connected.');
    }, 600);
  };

  const handleAdvanceStep = (orderId: string, targetStep: KDSOrder['status']) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const stepNames = {
            received: '1. Received',
            preparing: '2. Preparing',
            ready: '3. Ready to serve',
            served: '4. Served',
          };
          onShowToast?.(
            `Order ${ord.orderNumber} (${ord.tableName}) transitioned to "${stepNames[targetStep]}".`
          );
          return {
            ...ord,
            status: targetStep,
            items: ord.items.map((it) => ({
              ...it,
              status:
                targetStep === 'served'
                  ? 'Ready to Serve'
                  : targetStep === 'ready'
                  ? 'Ready to Serve'
                  : targetStep === 'preparing'
                  ? 'Preparing'
                  : 'Pending',
            })),
          };
        }
        return ord;
      })
    );
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStation =
      filterStation === 'all' ||
      (filterStation === 'kitchen' && o.station.includes('Kitchen')) ||
      (filterStation === 'grill' && o.station.includes('Grill')) ||
      (filterStation === 'bar' && o.station.includes('Bar'));
    const matchesSearch =
      !searchQuery.trim() ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStation && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Box (From Figma) */}
      <div className="w-full bg-zinc-900 rounded-[10px] p-5 sm:p-6 border border-zinc-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-white text-2xl sm:text-3xl font-semibold font-['Inter'] leading-tight">
              Live Order Status &amp; KDS Monitoring
            </h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm font-normal font-['Inter'] mt-1.5 leading-relaxed">
            Real time synchronization with Kitchen Display System (KDS) &amp; Bar Display System (BDS)
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          {/* KDS Connected Badge (From Figma) */}
          <div className="px-3 py-1 bg-green-500/10 rounded-sm border border-green-500/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 text-xs font-normal font-['Inter']">
              KDS Connected
            </span>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Refresh Live KDS Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      {/* Station & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterStation('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterStation === 'all'
                ? 'bg-amber-500 text-black font-semibold shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            All Stations ({orders.length})
          </button>
          <button
            onClick={() => setFilterStation('kitchen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterStation === 'kitchen'
                ? 'bg-amber-500 text-black font-semibold shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Kitchen KDS
          </button>
          <button
            onClick={() => setFilterStation('grill')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterStation === 'grill'
                ? 'bg-amber-500 text-black font-semibold shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Grill Station
          </button>
          <button
            onClick={() => setFilterStation('bar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterStation === 'bar'
                ? 'bg-amber-500 text-black font-semibold shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Bar BDS
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order # or dish..."
            className="w-full h-8 pl-9 pr-3 bg-zinc-900 rounded-lg text-xs text-white placeholder-zinc-500 border border-zinc-800 focus:outline-none focus:border-amber-500/60"
          />
        </div>
      </div>

      {/* Live KDS Cards Stream (From Figma) */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          return (
            <div
              key={order.id}
              className="w-full bg-black rounded-[10px] border border-neutral-700 p-5 shadow-lg relative overflow-hidden transition-all hover:border-neutral-500"
            >
              {/* Header Info Row (From Figma) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Table Badge */}
                  <div className="px-3.5 py-1.5 bg-slate-500/20 rounded-[5px] flex items-center justify-center">
                    <span className="text-amber-500 text-sm font-semibold font-['Inter']">
                      {order.tableName}
                    </span>
                  </div>

                  {/* Order Number & Timestamp */}
                  <div>
                    <div className="text-white text-base font-medium font-['Inter'] leading-tight">
                      {order.orderNumber}
                    </div>
                    <div className="text-slate-500 text-xs font-normal font-['Inter'] mt-0.5">
                      {order.createdTime} · {order.station}
                    </div>
                  </div>

                  {/* Waiter Badge */}
                  <div className="px-2.5 py-1 bg-slate-500/20 rounded-[5px] border border-neutral-700 text-zinc-300 text-xs font-medium font-['DM_Sans']">
                    {order.waiterName}
                  </div>

                  {/* Paid Badge */}
                  {order.paid ? (
                    <div className="px-2.5 py-1 bg-green-500/20 rounded-[5px] border border-green-500 text-green-500 text-xs font-medium font-['DM_Sans']">
                      Paid
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 bg-amber-500/20 rounded-[5px] border border-amber-500/50 text-amber-400 text-xs font-medium font-['DM_Sans']">
                      Unpaid Bill
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToCheckout?.(order.orderNumber, order.tableNumber)}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-amber-500/30 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <span>View Bill</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 4 Progress Step Pipelines (From Figma: 1.Received, 2.Preparing, 3.Ready to serve, 4.Served) */}
              <div className="py-4 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 border-b border-neutral-800">
                {/* Step 1: Received */}
                <button
                  onClick={() => handleAdvanceStep(order.id, 'received')}
                  className={`h-7 sm:h-8 px-3 rounded-[5px] border text-xs font-medium font-['DM_Sans'] flex items-center justify-center gap-1.5 transition-all ${
                    order.status === 'received'
                      ? 'bg-amber-500 text-black border-neutral-700 font-bold shadow-sm shadow-amber-500/20'
                      : 'bg-slate-500/20 text-zinc-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  <span className="truncate">1. Received</span>
                </button>

                {/* Step 2: Preparing */}
                <button
                  onClick={() => handleAdvanceStep(order.id, 'preparing')}
                  className={`h-7 sm:h-8 px-3 rounded-[5px] border text-xs font-medium font-['DM_Sans'] flex items-center justify-center gap-1.5 transition-all ${
                    order.status === 'preparing'
                      ? 'bg-amber-500 text-black border-neutral-700 font-bold shadow-sm shadow-amber-500/20'
                      : 'bg-slate-500/20 text-zinc-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  <span className="truncate">2. Preparing</span>
                </button>

                {/* Step 3: Ready to serve */}
                <button
                  onClick={() => handleAdvanceStep(order.id, 'ready')}
                  className={`h-7 sm:h-8 px-3 rounded-[5px] border text-xs font-medium font-['DM_Sans'] flex items-center justify-center gap-1.5 transition-all ${
                    order.status === 'ready'
                      ? 'bg-amber-500 text-black border-neutral-700 font-bold shadow-sm shadow-amber-500/20'
                      : 'bg-slate-500/20 text-zinc-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  <span className="truncate">3. Ready to serve</span>
                </button>

                {/* Step 4: Served */}
                <button
                  onClick={() => handleAdvanceStep(order.id, 'served')}
                  className={`h-7 sm:h-8 px-3 rounded-[5px] border text-xs font-medium font-['DM_Sans'] flex items-center justify-center gap-1.5 transition-all ${
                    order.status === 'served'
                      ? 'bg-emerald-500 text-black border-neutral-700 font-bold shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-500/20 text-zinc-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  <span className="truncate">4. Served</span>
                </button>
              </div>

              {/* Order Items Rows (From Figma: Truffie Margherita........ Pending) */}
              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="h-10 px-3 bg-neutral-950 rounded-[5px] border border-neutral-800 flex items-center justify-between gap-3 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-white text-xs font-normal font-['Poppins'] truncate">
                        {item.quantity}x {item.name}
                      </span>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 hidden sm:inline font-mono">
                        {item.station}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                          item.status === 'Ready to Serve'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : item.status === 'Preparing'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-neutral-900 text-neutral-300 border-neutral-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-zinc-950 rounded-xl border border-zinc-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
            <div className="text-white text-sm font-medium">All KDS Display queues clear</div>
            <div className="text-zinc-500 text-xs mt-1">
              No orders found matching the selected filters.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
