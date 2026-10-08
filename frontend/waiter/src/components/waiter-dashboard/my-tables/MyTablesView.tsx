'use client';

import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Receipt,
  RotateCcw,
  CheckCircle2,
  X,
  ClipboardList,
  AlertCircle,
  Clock,
  DollarSign,
  Layers,
} from 'lucide-react';
import { waiterService, getActiveBranchId } from '@/redux/features/waiterApi';

export interface DetailedTableItem {
  id: string;
  tableNumber: string;
  isMine: boolean;
  zone: 'Window' | 'Main Hall' | 'Bar' | 'Terrace' | 'Private';
  status:
    | 'Available'
    | 'Reserved'
    | 'Occupied'
    | 'Dining'
    | 'Waiting for Order'
    | 'Main Course Served'
    | 'Food Ready'
    | 'Waiting for Bill';
  guests: string;
  timeText: string;
  ordersCount: number;
  isBilled?: boolean;
  orderDetail?: {
    orderNumber: string;
    items: string[];
    status: string;
    placedAgo: string;
    total: number;
  };
}

export const initialTablesData: DetailedTableItem[] = [];

export default function MyTablesView() {
  const [filter, setFilter] = useState<'All' | 'Available' | 'Occupied' | 'Food Ready' | 'Waiting for Bill'>('All');
  const [tables, setTables] = useState<DetailedTableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderTable, setSelectedOrderTable] = useState<DetailedTableItem | null>(null);

  const zones: Array<'Window' | 'Main Hall' | 'Bar' | 'Terrace' | 'Private'> = [
    'Window',
    'Main Hall',
    'Bar',
    'Terrace',
    'Private',
  ];

  useEffect(() => {
    let mounted = true;
    const loadTables = async () => {
      try {
        const branchId = getActiveBranchId();
        const [apiTables, apiOrders] = await Promise.all([
          waiterService.getAllTables(branchId).catch(() => []),
          waiterService.getActiveOrders(branchId).catch(() => []),
        ]);
        if (mounted && Array.isArray(apiTables)) {
          const zoneList: Array<DetailedTableItem['zone']> = ['Window', 'Main Hall', 'Bar', 'Terrace', 'Private'];
          const mapped: DetailedTableItem[] = apiTables.map((t: any, idx: number) => {
            const tableOrder = (apiOrders || []).find(
              (o: any) => o.tableId === t.id || o.tableLabel === t.label
            );
            const isOccupied = t.serviceStatus === 'OCCUPIED' || Boolean(t.activeSessionId);
            const isFoodReady = tableOrder?.status === 'READY_TO_SERVE';
            const isPaymentPending = t.serviceStatus === 'PAYMENT_PENDING' || tableOrder?.paymentStatus === 'UNPAID';

            let status: DetailedTableItem['status'] = 'Available';
            if (isFoodReady) status = 'Food Ready';
            else if (isPaymentPending) status = 'Waiting for Bill';
            else if (isOccupied) status = 'Occupied';

            return {
              id: t.id,
              tableNumber: t.label || `T-${String(idx + 1).padStart(2, '0')}`,
              isMine: true,
              zone: zoneList[idx % zoneList.length] || 'Main Hall',
              status,
              guests: `${t.capacity || 4} guests`,
              timeText: tableOrder ? 'Active' : '—',
              ordersCount: tableOrder ? 1 : 0,
              orderDetail: tableOrder
                ? {
                    orderNumber: tableOrder.orderNumber,
                    items:
                      tableOrder.items?.map((i: any) => `${i.quantity}x ${i.name}`) || [
                        'Live Order Items',
                      ],
                    status: tableOrder.status,
                    placedAgo: 'Recently',
                    total: tableOrder.total || 0,
                  }
                : undefined,
            };
          });
          setTables(mapped);
        }
      } catch (err) {
        console.error('Failed to load waiter tables:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTables();
    const handleRealtime = () => {
      loadTables();
    };
    window.addEventListener('tavonza:table_status_changed', handleRealtime);
    window.addEventListener('tavonza:table_session_changed', handleRealtime);
    window.addEventListener('tavonza:order_created', handleRealtime);
    window.addEventListener('tavonza:order_status_changed', handleRealtime);
    window.addEventListener('tavonza:waiter_called', handleRealtime);
    window.addEventListener('tavonza:payment_status_changed', handleRealtime);

    return () => {
      mounted = false;
      window.removeEventListener('tavonza:table_status_changed', handleRealtime);
      window.removeEventListener('tavonza:table_session_changed', handleRealtime);
      window.removeEventListener('tavonza:order_created', handleRealtime);
      window.removeEventListener('tavonza:order_status_changed', handleRealtime);
      window.removeEventListener('tavonza:waiter_called', handleRealtime);
      window.removeEventListener('tavonza:payment_status_changed', handleRealtime);
    };
  }, []);

  // Filtering Logic
  const getFilteredTablesByZone = (zone: DetailedTableItem['zone']) => {
    return tables.filter((t) => {
      if (t.zone !== zone) return false;
      if (filter === 'All') return true;
      if (filter === 'Available') return t.status === 'Available';
      if (filter === 'Occupied')
        return (
          t.status === 'Occupied' ||
          t.status === 'Dining' ||
          t.status === 'Waiting for Order' ||
          t.status === 'Main Course Served'
        );
      if (filter === 'Food Ready') return t.status === 'Food Ready';
      if (filter === 'Waiting for Bill') return t.status === 'Waiting for Bill';
      return true;
    });
  };

  const handleOpenOrdersModal = (table: DetailedTableItem) => {
    if (table.orderDetail) {
      setSelectedOrderTable(table);
    } else {
      setSelectedOrderTable({
        ...table,
        orderDetail: {
          orderNumber: `#${table.tableNumber}-01`,
          items: ['Table seated - No dishes recorded yet'],
          status: 'No Active Order',
          placedAgo: 'Just now',
          total: 0,
        },
      });
    }
  };

  const handleToggleBill = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          const nextBilled = !t.isBilled;
          return {
            ...t,
            isBilled: nextBilled,
            status: nextBilled ? 'Waiting for Bill' : 'Dining',
          };
        }
        return t;
      })
    );
  };

  const handleClearTable = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status: 'Available',
            guests: '0/4 guests',
            timeText: '—',
            ordersCount: 0,
            isBilled: false,
            orderDetail: undefined,
          };
        }
        return t;
      })
    );
  };

  const renderStatusDot = (status: DetailedTableItem['status']) => {
    switch (status) {
      case 'Available':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 relative bg-green-500 rounded-full shadow-[0px_0px_6px_0px_rgba(34,197,94,0.50)]" />
            <span className="text-green-500 text-xs font-medium font-['DM_Sans']">Available</span>
          </div>
        );
      case 'Reserved':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 relative bg-slate-500 rounded-full shadow-[0px_0px_6px_0px_rgba(122,130,154,0.50)]" />
            <span className="text-slate-500 text-xs font-medium font-['DM_Sans']">Reserved</span>
          </div>
        );
      case 'Dining':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 relative bg-blue-500 rounded-full shadow-[0px_0px_6px_0px_rgba(59,130,246,0.50)]" />
            <span className="text-blue-500 text-xs font-medium font-['DM_Sans']">Dining</span>
          </div>
        );
      case 'Waiting for Order':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 relative bg-yellow-500 rounded-full shadow-[0px_0px_6px_0px_rgba(234,179,8,0.50)]" />
            <span className="text-yellow-500 text-xs font-medium font-['DM_Sans']">Waiting for Order</span>
          </div>
        );
      case 'Main Course Served':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 relative bg-purple-500 rounded-full shadow-[0px_0px_6px_0px_rgba(168,85,247,0.50)]" />
            <span className="text-purple-500 text-xs font-medium font-['DM_Sans']">Main Course Served</span>
          </div>
        );
      case 'Food Ready':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 relative bg-green-500 rounded-full shadow-[0px_0px_6px_0px_rgba(34,197,94,0.50)]" />
            <span className="text-green-500 text-xs font-medium font-['DM_Sans']">Food Ready</span>
          </div>
        );
      case 'Waiting for Bill':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 relative bg-orange-500 rounded-full shadow-[0px_0px_6px_0px_rgba(249,115,22,0.50)]" />
            <span className="text-orange-500 text-xs font-medium font-['DM_Sans']">Waiting for Bill</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full pb-8">
      {/* 1. Page Header Titles */}
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9">
          My Tables
        </h1>
        <p className="text-slate-500 text-lg font-normal font-['Inter'] mt-1">
          {loading ? 'Synchronizing branch floor tables...' : `Managing ${tables.length} live registered tables · Downtown Branch`}
        </p>
      </div>

      {/* 2. Filter Tab Bar */}
      <div className="flex items-center">
        <div className="inline-flex rounded-lg overflow-hidden border border-white/20 bg-zinc-950/60 shadow-lg">
          {(['All', 'Available', 'Occupied', 'Food Ready', 'Waiting for Bill'] as const).map(
            (tabName, idx, arr) => {
              const isActive = filter === tabName;
              return (
                <button
                  key={tabName}
                  type="button"
                  onClick={() => setFilter(tabName)}
                  className={`h-9 px-4 py-2 text-base font-normal font-['Inter'] transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap ${
                    idx !== 0 ? 'border-l border-white/20' : ''
                  } ${
                    isActive
                      ? 'bg-amber-500 text-white font-semibold shadow-inner'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tabName}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* 3. Tables Grouped by Floor Zone */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 font-['Inter']">
          Fetching live tables from database...
        </div>
      ) : tables.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white/5 border border-white/10 rounded-2xl">
          <Layers className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-white font-medium text-base font-['Inter']">No Tables Found</h3>
          <p className="text-neutral-500 text-sm font-['Inter']">
            No tables currently registered for this branch. Create tables in the manager dashboard to view them here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {zones.map((zoneName) => {
            const zoneTables = getFilteredTablesByZone(zoneName);
            if (zoneTables.length === 0) return null;

            return (
              <div key={zoneName} className="space-y-3">
                {/* Zone Section Title */}
                <h2 className="text-white text-lg font-semibold font-['Inter'] leading-7">
                  {zoneName}
                </h2>

                {/* Zone Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {zoneTables.map((table) => {
                    const isAvailable = table.status === 'Available';
                    return (
                      <div
                        key={table.id}
                        className="h-32 bg-white/5 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/10 hover:outline-amber-500 hover:shadow-lg hover:shadow-amber-500/10 backdrop-blur-sm flex flex-col justify-between overflow-hidden transition-all duration-200 group"
                      >
                        {/* Top Card Body */}
                        <div className="px-3 pt-3 pb-2 flex-1 flex flex-col justify-start">
                          {/* Table Header: Name + Mine Tag */}
                          <div className="w-full flex justify-between items-center">
                            <div className="text-slate-200 text-base font-medium font-['DM_Mono'] leading-5">
                              {table.tableNumber}
                            </div>
                            {table.isMine && (
                              <div className="px-1.5 py-0.5 bg-amber-500/20 rounded-sm">
                                <div className="text-amber-500 text-[10px] font-semibold font-['DM_Sans'] leading-3">
                                  Mine
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Status Dot & Label */}
                          <div className="w-full pt-1.5">{renderStatusDot(table.status)}</div>

                          {/* Guest Count & Elapsed Time */}
                          <div className="w-full flex justify-between items-center text-xs font-['DM_Sans'] pt-1">
                            <span className="text-slate-500">{table.guests}</span>
                            <span className={`${table.timeText === 'Ready' ? 'text-green-500 font-medium' : 'text-slate-500 font-medium'}`}>
                              {table.timeText}
                            </span>
                          </div>
                        </div>

                        {/* Bottom 3 Action Buttons */}
                        <div className="w-full border-t border-white/5 flex items-stretch h-9 bg-black/20">
                          {/* Button 1: Orders Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => handleOpenOrdersModal(table)}
                            className="flex-1 py-1.5 border-r border-white/5 flex flex-col justify-center items-center gap-0.5 text-slate-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                            title="View table order tickets"
                          >
                            <UtensilsCrossed className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-medium font-['DM_Sans'] leading-3">
                              {table.ordersCount > 0
                                ? table.ordersCount === 1
                                : `${table.ordersCount} Orders`}
                            </span>
                          </button>

                          {/* Button 2: Bill Status / Action */}
                          <button
                            type="button"
                            disabled={isAvailable}
                            onClick={() => handleToggleBill(table.id)}
                            className={`flex-1 py-1.5 border-r border-white/5 flex flex-col justify-center items-center gap-0.5 transition-colors ${
                              isAvailable
                                ? 'opacity-30 cursor-not-allowed text-slate-500'
                                : table.isBilled
                                ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 cursor-pointer'
                                : 'text-slate-500 hover:text-white hover:bg-white/5 cursor-pointer'
                            }`}
                            title={table.isBilled ? 'Bill requested' : 'Request Bill'}
                          >
                            <Receipt className={`w-3 h-3 ${table.isBilled ? 'text-orange-500' : 'text-slate-500'}`} />
                            <span className="text-[10px] font-medium font-['DM_Sans'] leading-3">
                              {table.isBilled ? 'Billed ✓' : 'Bill'}
                            </span>
                          </button>

                          {/* Button 3: Clear or Open */}
                          <button
                            type="button"
                            disabled={isAvailable}
                            onClick={() => handleClearTable(table.id)}
                            className={`flex-1 py-1.5 flex flex-col justify-center items-center gap-0.5 transition-colors ${
                              isAvailable
                                ? 'opacity-30 cursor-not-allowed text-slate-500'
                                : 'text-slate-500 hover:text-white hover:bg-white/5 cursor-pointer'
                            }`}
                            title="Clear / Reset Table"
                          >
                            <RotateCcw className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-medium font-['DM_Sans'] leading-3">
                              {isAvailable ? 'Open' : 'Clear'}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Interactive Order Detail Modal */}
      {selectedOrderTable && selectedOrderTable.orderDetail && (
        <div className="fixed top-20 left-0 md:left-72 right-0 bottom-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-[420px] bg-[#18181b] border border-zinc-700/70 rounded-3xl p-6 shadow-2xl space-y-5 text-white relative my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Orders — {selectedOrderTable.tableNumber}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    1 order for this table
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderTable(null)}
                className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            {/* Order Items List */}
            <div className="flex items-start justify-between pt-1">
              <div className="space-y-2.5">
                {selectedOrderTable.orderDetail.items.map((dish, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-base text-zinc-200 font-medium">
                      {dish}
                    </span>
                  </div>
                ))}
              </div>

              <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-lg text-amber-400 text-sm font-semibold">
                {selectedOrderTable.orderDetail.status || 'New Order'}
              </span>
            </div>

            {/* Timing & Total Divider Box */}
            <div className="pt-4 border-t border-zinc-800 space-y-2.5 text-sm text-zinc-300">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Placed</span>
                <span className="font-medium text-zinc-200">
                  {selectedOrderTable.orderDetail.placedAgo}
                </span>
              </div>

              <div className="flex justify-between items-center text-base font-semibold">
                <span className="text-zinc-400 font-normal text-sm">Total</span>
                <span className="text-white font-['DM_Mono']">
                  ${selectedOrderTable.orderDetail.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Done Action Button */}
            <button
              type="button"
              onClick={() => setSelectedOrderTable(null)}
              className="w-full h-11 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-white font-bold text-base rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-400/20"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
