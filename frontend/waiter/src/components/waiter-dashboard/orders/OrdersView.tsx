'use client';

import React, { useState } from 'react';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
  X,
  CheckCircle2,
  Clock,
  Printer,
  UtensilsCrossed,
  DollarSign,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export interface OrderItemRow {
  id: string;
  orderNumber: string;
  tableNumber: string;
  itemsSummary: string;
  itemsDetail: Array<{ name: string; quantity: number; price: number; notes?: string }>;
  status: 'Ready to Serve' | 'Preparing' | 'New Order' | 'Served';
  total: number;
  placedAgo: string;
  serverName?: string;
}

export const initialOrdersList: OrderItemRow[] = [
  {
    id: 'ord-10582',
    orderNumber: '#10582',
    tableNumber: 'T-12',
    itemsSummary: 'Grilled Salmon Risotto, Caesar Salad +1',
    itemsDetail: [
      { name: 'Grilled Salmon Risotto', quantity: 1, price: 34.0, notes: 'Medium well, extra lemon' },
      { name: 'Caesar Salad', quantity: 1, price: 16.5 },
      { name: 'San Pellegrino Sparkling', quantity: 1, price: 14.0 },
    ],
    status: 'Ready to Serve',
    total: 64.5,
    placedAgo: '18 min ago',
    serverName: 'Michael Davis',
  },
  {
    id: 'ord-10583',
    orderNumber: '#10583',
    tableNumber: 'T-05',
    itemsSummary: 'Beef Tenderloin, Truffle Fries, Red Wine x2',
    itemsDetail: [
      { name: 'Beef Tenderloin', quantity: 1, price: 68.0, notes: 'Medium rare' },
      { name: 'Truffle Fries', quantity: 1, price: 18.0 },
      { name: 'Red Wine (Cabernet)', quantity: 2, price: 32.0 },
    ],
    status: 'New Order',
    total: 118.0,
    placedAgo: '12 min ago',
    serverName: 'Michael Davis',
  },
  {
    id: 'ord-10584',
    orderNumber: '#10584',
    tableNumber: 'T-07',
    itemsSummary: 'Grilled Salmon Risotto x2, Pinot Grigio +1',
    itemsDetail: [
      { name: 'Grilled Salmon Risotto', quantity: 2, price: 68.0 },
      { name: 'Pinot Grigio Bottle', quantity: 1, price: 54.0 },
      { name: 'Burrata Caprese', quantity: 1, price: 20.0 },
    ],
    status: 'Preparing',
    total: 142.0,
    placedAgo: '35 min ago',
    serverName: 'Sarah Jenkins',
  },
  {
    id: 'ord-10585',
    orderNumber: '#10585',
    tableNumber: 'T-08',
    itemsSummary: 'Artisan Margherita Pizza, Pasta Carbonara, Aperol Spritz x3',
    itemsDetail: [
      { name: 'Artisan Margherita Pizza', quantity: 1, price: 24.5 },
      { name: 'Pasta Carbonara', quantity: 1, price: 26.0 },
      { name: 'Aperol Spritz', quantity: 3, price: 36.0 },
    ],
    status: 'Preparing',
    total: 86.5,
    placedAgo: '26 min ago',
    serverName: 'Michael Davis',
  },
  {
    id: 'ord-10586',
    orderNumber: '#10586',
    tableNumber: 'T-14',
    itemsSummary: 'Ribeye Steak, Mashed Potatoes, Craft IPA x2',
    itemsDetail: [
      { name: 'Ribeye Steak (14oz)', quantity: 1, price: 62.0, notes: 'Rare, garlic butter' },
      { name: 'Truffle Mashed Potatoes', quantity: 1, price: 14.0 },
      { name: 'Craft IPA Beer', quantity: 2, price: 16.0 },
    ],
    status: 'Ready to Serve',
    total: 92.0,
    placedAgo: '22 min ago',
    serverName: 'Michael Davis',
  },
  {
    id: 'ord-10587',
    orderNumber: '#10587',
    tableNumber: 'T-15',
    itemsSummary: 'Chef Tasting Menu x5, Wine Pairing Selection',
    itemsDetail: [
      { name: 'Chef Tasting Menu 7-Course', quantity: 5, price: 275.0 },
      { name: 'Sommelier Wine Pairing Selection', quantity: 5, price: 70.0 },
    ],
    status: 'Served',
    total: 345.0,
    placedAgo: '55 min ago',
    serverName: 'Michael Davis',
  },
  {
    id: 'ord-10588',
    orderNumber: '#10588',
    tableNumber: 'T-16',
    itemsSummary: 'Dry Martini x2, Oysters Rockefeller (6pcs)',
    itemsDetail: [
      { name: 'Dry Martini (Tanqueray No. Ten)', quantity: 2, price: 32.0 },
      { name: 'Oysters Rockefeller (6 pcs)', quantity: 1, price: 22.0 },
    ],
    status: 'Served',
    total: 54.0,
    placedAgo: '9 min ago',
    serverName: 'David Chen',
  },
  {
    id: 'ord-10589',
    orderNumber: '#10589',
    tableNumber: 'T-18',
    itemsSummary: 'Old Fashioned x3, Charcuterie Board',
    itemsDetail: [
      { name: 'Smoked Bourbon Old Fashioned', quantity: 3, price: 48.0 },
      { name: 'Artisanal Charcuterie Board', quantity: 1, price: 34.4 },
    ],
    status: 'Served',
    total: 82.4,
    placedAgo: '42 min ago',
    serverName: 'Michael Davis',
  },
  {
    id: 'ord-10590',
    orderNumber: '#10590',
    tableNumber: 'T-03',
    itemsSummary: 'Burrata Caprese, Chianti Classico DOCG',
    itemsDetail: [
      { name: 'Burrata Caprese Salad', quantity: 1, price: 22.0 },
      { name: 'Chianti Classico DOCG', quantity: 1, price: 26.0 },
    ],
    status: 'Served',
    total: 48.0,
    placedAgo: '18 min ago',
    serverName: 'Michael Davis',
  },
  {
    id: 'ord-10591',
    orderNumber: '#10591',
    tableNumber: 'T-20',
    itemsSummary: 'Tomahawk Steak (32oz), Lobster Mac & Cheese',
    itemsDetail: [
      { name: 'Prime Tomahawk Steak 32oz', quantity: 1, price: 185.0, notes: 'Medium rare, sliced' },
      { name: 'Lobster Macaroni & Cheese', quantity: 1, price: 38.0 },
      { name: 'Vintage Bordeaux 2018', quantity: 1, price: 72.0 },
    ],
    status: 'Preparing',
    total: 295.0,
    placedAgo: '41 min ago',
    serverName: 'Elena Rostova',
  },
];

export default function OrdersView() {
  const [orders, setOrders] = useState<OrderItemRow[]>(initialOrdersList);
  const [filter, setFilter] = useState<'All' | 'New Order' | 'Preparing' | 'Ready to Serve' | 'Served'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItemRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredOrders = orders.filter((ord) => {
    const matchesFilter = filter === 'All' || ord.status === filter;
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.itemsSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.serverName && ord.serverName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const displayedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleUpdateStatus = (orderId: string, nextStatus: OrderItemRow['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  const renderStatusBadge = (status: OrderItemRow['status']) => {
    switch (status) {
      case 'Ready to Serve':
        return (
          <span className="px-2.5 py-1 bg-green-500/15 border border-green-500/30 rounded-[5px] text-green-400 text-sm font-semibold inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Ready to Serve
          </span>
        );
      case 'Preparing':
        return (
          <span className="px-2.5 py-1 bg-yellow-500/15 border border-yellow-500/30 rounded-[5px] text-yellow-400 text-sm font-semibold inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            Preparing
          </span>
        );
      case 'New Order':
        return (
          <span className="px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 rounded-[5px] text-blue-400 text-sm font-semibold inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            New Order
          </span>
        );
      case 'Served':
        return (
          <span className="px-2.5 py-1 bg-zinc-800/80 border border-zinc-700/60 rounded-[5px] text-zinc-400 text-sm font-semibold inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            Served
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full pb-8">
      {/* 1. Page Title & Subtitle */}
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9">
          Orders
        </h1>
        <p className="text-slate-500 text-lg font-bold font-['Inter'] leading-6 mt-1">
          All active and recent orders · {orders.length} orders today
        </p>
      </div>

      {/* 2. Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Segmented Control */}
        <div className="inline-flex rounded-lg overflow-hidden border border-white/20 bg-zinc-950/60 shadow-lg">
          {(['All', 'New Order', 'Preparing', 'Ready to Serve', 'Served'] as const).map(
            (tabName, idx) => {
              const isActive = filter === tabName;
              return (
                <button
                  key={tabName}
                  type="button"
                  onClick={() => {
                    setFilter(tabName);
                    setCurrentPage(1);
                  }}
                  className={`h-9 px-3.5 py-2 text-base font-bold font-['Inter'] transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap ${
                    idx !== 0 ? 'border-l border-white/20' : ''
                  } ${
                    isActive
                      ? 'bg-yellow-500 text-white font-semibold shadow-inner'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tabName}
                </button>
              );
            }
          )}
        </div>

        {/* Search Input Bar */}
        <div className="w-full md:w-80 h-10 px-4 bg-zinc-900 rounded-[8px] outline outline-1 outline-offset-[-1px] outline-neutral-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Order, Table, Dish..."
            className="w-full bg-transparent border-none text-white text-base font-medium font-['Inter'] placeholder-zinc-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-zinc-500 hover:text-white text-sm cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 3. Standard Unified Table Card (Matching Other Pages) */}
      <div className="w-full bg-white/5 rounded-[10px] border border-white/10 backdrop-blur-lg overflow-hidden flex flex-col shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[850px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-zinc-900 text-white text-base font-semibold font-['Inter'] leading-5 border-b border-zinc-800">
                <th className="py-4 px-5">Order</th>
                <th className="py-4 px-5">Table</th>
                <th className="py-4 px-5">Items</th>
                <th className="py-4 px-5">Placed</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Total</th>
                <th className="py-4 px-5 text-center">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-800/80 text-base font-medium font-['Inter']">
              {displayedOrders.length > 0 ? (
                displayedOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="hover:bg-white/[0.04] transition-colors text-white cursor-pointer group"
                  >
                    {/* Order ID */}
                    <td className="py-4 px-5 font-semibold text-slate-200 font-['DM_Mono']">
                      {ord.orderNumber}
                    </td>

                    {/* Table Pill */}
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded-[5px] text-amber-400 text-sm font-semibold font-['DM_Mono'] inline-block">
                        {ord.tableNumber}
                      </span>
                    </td>

                    {/* Items Summary */}
                    <td className="py-4 px-5 text-slate-300 max-w-xs truncate group-hover:text-white transition-colors">
                      {ord.itemsSummary}
                    </td>

                    {/* Placed Time */}
                    <td className="py-4 px-5 text-slate-400 text-sm font-normal">
                      {ord.placedAgo}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-5">
                      {renderStatusBadge(ord.status)}
                    </td>

                    {/* Total Price */}
                    <td className="py-4 px-5 text-right font-bold text-white font-['DM_Mono']">
                      ${ord.total.toFixed(2)}
                    </td>

                    {/* Action Eye / Chevron */}
                    <td className="py-4 px-5 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(ord);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-amber-500 hover:text-white text-slate-400 transition-colors inline-flex items-center justify-center cursor-pointer"
                        title="View order ticket"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 text-base">
                    <UtensilsCrossed className="w-8 h-8 opacity-30 mx-auto mb-2" />
                    No orders match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Bottom Pagination Bar */}
        <div className="p-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/40">
          <div className="text-zinc-500 text-base font-medium font-['Inter']">
            Showing {filteredOrders.length > 0 ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredOrders.length)}` : '0'} of {filteredOrders.length} results
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-amber-400 text-white shadow-md shadow-amber-400/20'
                    : 'border border-zinc-800 text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Order Detail Ticket Modal */}
      {selectedOrder && (
        <div className="fixed top-20 left-0 md:left-72 right-0 bottom-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-[460px] bg-[#18181b] border border-zinc-700/70 rounded-3xl p-6 shadow-2xl space-y-5 text-white relative my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Order {selectedOrder.orderNumber} — Table {selectedOrder.tableNumber}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-0.5 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Placed {selectedOrder.placedAgo}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            {/* Current Status Banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Current Status:</span>
                {renderStatusBadge(selectedOrder.status)}
              </div>
              <div className="flex items-center gap-1.5">
                {selectedOrder.status !== 'Ready to Serve' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Ready to Serve')}
                    className="px-2.5 py-1 bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25 rounded-lg text-sm font-semibold cursor-pointer"
                  >
                    Set Ready
                  </button>
                )}
                {selectedOrder.status !== 'Served' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Served')}
                    className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 rounded-lg text-sm font-semibold cursor-pointer"
                  >
                    Set Served
                  </button>
                )}
              </div>
            </div>

            {/* Itemized Dishes List */}
            <div className="space-y-3 pt-1">
              <div className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Item Details ({selectedOrder.itemsDetail.length} items)
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {selectedOrder.itemsDetail.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                        {item.quantity}x
                      </span>
                      <div>
                        <div className="text-base font-medium text-zinc-100">{item.name}</div>
                        {item.notes && (
                          <div className="text-xs text-amber-400/80 font-normal italic mt-0.5">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-base font-semibold text-zinc-300 font-['DM_Mono']">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Price & Action Buttons */}
            <div className="pt-3 border-t border-zinc-800 space-y-3">
              <div className="flex justify-between items-center text-base">
                <span className="text-zinc-400">Order Subtotal</span>
                <span className="text-white font-bold text-lg font-['DM_Mono']">
                  ${selectedOrder.total.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => alert(`Print ticket sent for Order ${selectedOrder.orderNumber}`)}
                  className="h-11 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-zinc-700"
                >
                  <Printer className="w-4 h-4 text-zinc-400" />
                  <span>Print Ticket</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 h-11 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-white font-bold text-base rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-400/20 flex items-center justify-center"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
