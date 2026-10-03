'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Check,
  X as XIcon,
} from 'lucide-react';
import { CashierOrder, OrderStatus } from './types';
import { INITIAL_ORDERS, ORDER_STATUS_TABS } from './ordersData';
import OrderDetailModal from './components/OrderDetailModal';
import { toast } from 'sonner';

interface OrdersViewProps {
  onNavigateToPOS?: () => void;
}

export default function OrdersView({ onNavigateToPOS }: OrdersViewProps) {
  const [orders, setOrders] = useState<CashierOrder[]>(INITIAL_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<OrderStatus>('All');
  const [selectedOrder, setSelectedOrder] = useState<CashierOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        activeStatus === 'All' || order.status === activeStatus;
      const matchesSearch =
        !searchQuery ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.method.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, activeStatus, searchQuery]);

  const handleOpenDetail = (order: CashierOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = (orderId: string, newStatus: CashierOrder['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    toast.success(`Order ${orderId} marked as ${newStatus}`);
  };

  const handleQuickComplete = (orderId: string) => {
    handleUpdateStatus(orderId, 'Paid');
  };

  const handleQuickCancel = (orderId: string) => {
    handleUpdateStatus(orderId, 'Cancelled');
  };

  const handleExport = () => {
    toast.success('Exporting orders report to CSV...');
  };

  return (
    <div className="w-full space-y-5 font-['Inter']">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl sm:text-4xl font-semibold leading-tight">
            Orders
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-normal mt-0.5">
            {orders.length} total orders today
          </p>
        </div>

        {/* Action Buttons: Filter, Export, New Order */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => toast.info('Filtering options opened')}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-gray-200/20 text-white text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Filter className="w-3 h-3 text-white/90" />
            <span>Filter</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-gray-200/20 text-white text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-white/90" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToPOS}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-white font-semibold text-sm rounded-[10px] shadow-[0px_1px_3px_0px_rgba(255,214,168,1.00)] flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* 2. Search Orders Bar */}
      <div className="w-full h-10 px-4 bg-zinc-900 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-neutral-800 flex items-center gap-3.5 overflow-hidden transition focus-within:outline-amber-500/60">
        <Search className="w-4 h-4 text-stone-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Orders..."
          className="w-full bg-transparent border-none outline-none text-white placeholder:text-zinc-600 text-base sm:text-lg font-normal font-['Inter']"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-sm text-zinc-500 hover:text-white px-1.5 py-0.5"
          >
            Clear
          </button>
        )}
      </div>

      {/* 3. Status Tabs */}
      <div className="w-full overflow-x-auto custom-scrollbar pb-1">
        <div className="flex items-center gap-2 min-w-max">
          {ORDER_STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveStatus(tab)}
                className={`px-6 sm:px-8 py-2 rounded-[5px] text-base sm:text-lg transition cursor-pointer font-['Inter'] ${
                  isActive
                    ? 'bg-amber-400 text-white font-medium shadow-md'
                    : 'bg-transparent text-neutral-400 hover:text-white hover:bg-white/5 outline outline-1 outline-offset-[-1px] outline-neutral-400/40'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Orders Data Table */}
      <div className="w-full bg-stone-950 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            {/* Table Header */}
            <thead>
              <tr className="h-14 bg-zinc-900 border-b border-zinc-800 text-white text-base sm:text-lg font-semibold font-['Inter']">
                <th className="px-5 py-3">Order</th>
                <th className="px-4 py-3">Table</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3 text-center">Items</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-center">Time</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-800/80 text-sm sm:text-base font-medium text-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="h-14 hover:bg-zinc-900/40 transition-colors"
                  >
                    {/* Order # */}
                    <td className="px-5 py-3 text-white font-medium">
                      {order.orderNumber}
                    </td>

                    {/* Table Badge */}
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-white/20 rounded-[5px] text-white text-sm font-semibold">
                        {order.table}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-3 text-slate-200">
                      {order.customer}
                    </td>

                    {/* Items */}
                    <td className="px-5 py-3 text-center text-slate-300">
                      {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                    </td>

                    {/* Method */}
                    <td className="px-5 py-3 text-slate-300">
                      {order.method}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <span
                        className={`text-sm font-medium ${
                          order.status === 'Paid'
                            ? 'text-emerald-400'
                            : order.status === 'Preparing'
                            ? 'text-teal-400'
                            : order.status === 'Ready'
                            ? 'text-amber-400'
                            : order.status === 'Pending'
                            ? 'text-amber-500'
                            : 'text-rose-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-3 text-right text-slate-200 font-semibold font-['JetBrains_Mono']">
                      ${order.total.toFixed(2)}
                    </td>

                    {/* Time */}
                    <td className="px-5 py-3 text-center text-white text-sm">
                      {order.time}
                    </td>

                    {/* Action icons: View, Check, Cancel */}
                    <td className="px-5 py-3 text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        {/* View details */}
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(order)}
                          className="size-7 rounded hover:bg-white/10 text-white flex items-center justify-center transition cursor-pointer"
                          title="View Order"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick complete */}
                        <button
                          type="button"
                          onClick={() => handleQuickComplete(order.id)}
                          className="size-7 rounded hover:bg-teal-500/20 text-teal-400 flex items-center justify-center transition cursor-pointer"
                          title="Mark as Paid"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        {/* Quick cancel */}
                        <button
                          type="button"
                          onClick={() => handleQuickCancel(order.id)}
                          className="size-7 rounded hover:bg-red-500/20 text-red-400 flex items-center justify-center transition cursor-pointer"
                          title="Cancel Order"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
