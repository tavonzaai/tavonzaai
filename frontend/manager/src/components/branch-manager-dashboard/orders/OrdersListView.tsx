'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { OrderItemRow } from '../types';
import { branchManagerService, getActiveBranchId } from '../../../redux/features/branchManagerApi';

interface OrdersListViewProps {
  onSelectOrder: (orderId: string) => void;
}

export default function OrdersListView({ onSelectOrder }: OrdersListViewProps) {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orders, setOrders] = useState<OrderItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const filterTabs = ['ALL', 'Active', 'Preparing', 'Ready', 'Payment Pending', 'Completed'];

  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      try {
        setIsLoading(true);
        const branchId = getActiveBranchId();

        let backendStatus: string | undefined = undefined;
        if (filter === 'Preparing') backendStatus = 'PREPARING';
        else if (filter === 'Ready') backendStatus = 'READY';
        else if (filter === 'Payment Pending') backendStatus = 'PAYMENT_PENDING';
        else if (filter === 'Completed') backendStatus = 'SERVED';

        const liveOrders = await branchManagerService.getOrders(branchId, {
          status: backendStatus,
          search: searchQuery.trim() || undefined,
        });

        if (isMounted) {
          if (liveOrders && liveOrders.length > 0) {
            const mapped: OrderItemRow[] = liveOrders.map((o: any, idx: number) => {
              const st = String(o.status || '').toUpperCase();
              let uiStatus: OrderItemRow['status'] = 'Pending';
              if (st === 'PREPARING') uiStatus = 'Preparing';
              else if (st === 'READY') uiStatus = 'Ready';
              else if (st === 'SERVED') uiStatus = 'Completed';
              else if (st === 'PAYMENT_PENDING') uiStatus = 'Payment Pending';
              else if (st === 'NEEDS_ATTENTION') uiStatus = 'Needs Attention';

              const formattedTime = o.submittedAt || o.createdAt
                ? new Date(o.submittedAt || o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now';

              const itemsStr = o.items && o.items.length > 0
                ? o.items.map((i: any) => `${i.quantity}x ${i.name || i.productNameSnapshot || i.productName || 'Dish'}`).join(', ')
                : `${o.itemCount || 1} items`;

              return {
                id: o.orderId || o.id,
                orderNumber: o.orderNumber || `#1000${idx + 1}`,
                waiterLocation: o.tableLabel || `Table T-${String(idx + 1).padStart(2, '0')}`,
                items: itemsStr,
                timeElapsed: formattedTime,
                status: uiStatus,
                total: `$${Number(o.total || o.totalAmount || 0).toFixed(2)}`,
              };
            });

            if (filter === 'Active') {
              setOrders(mapped.filter((o) => o.status !== 'Completed'));
            } else {
              setOrders(mapped);
            }
          } else {
            setOrders([]);
          }
        }
      } catch (err) {
        console.warn('Could not load live orders:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    const timer = setTimeout(loadOrders, searchQuery ? 250 : 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [filter, searchQuery]);

  const filteredOrders = orders;

  const getStatusBadge = (status: OrderItemRow['status']) => {
    switch (status) {
      case 'Preparing':
        return (
          <div className="px-3 py-1.5 bg-fuchsia-500/10 rounded-md inline-flex justify-center items-center">
            <span className="text-fuchsia-400 text-sm font-medium font-['Inter'] leading-4">
              Preparing
            </span>
          </div>
        );
      case 'Ready':
        return (
          <div className="px-3 py-1.5 bg-teal-500/10 rounded-md inline-flex justify-center items-center">
            <span className="text-teal-500 text-sm font-medium font-['Inter'] leading-4">
              Ready
            </span>
          </div>
        );
      case 'Pending':
        return (
          <div className="px-3 py-1.5 bg-yellow-500/10 rounded-md inline-flex justify-center items-center">
            <span className="text-yellow-500 text-sm font-medium font-['Inter'] leading-4">
              Pending
            </span>
          </div>
        );
      case 'Payment Pending':
        return (
          <div className="px-3 py-1.5 bg-orange-400/10 rounded-md inline-flex justify-center items-center">
            <span className="text-orange-400 text-sm font-medium font-['Inter'] leading-4">
              Payment Pending
            </span>
          </div>
        );
      case 'Needs Attention':
        return (
          <div className="px-3 py-1.5 bg-red-400/10 rounded-md inline-flex justify-center items-center">
            <span className="text-red-400 text-sm font-medium font-['Inter'] leading-4">
              Needs Attention
            </span>
          </div>
        );
      case 'Ordering':
        return (
          <div className="px-3 py-1.5 bg-blue-400/10 rounded-md inline-flex justify-center items-center">
            <span className="text-blue-400 text-sm font-medium font-['Inter'] leading-4">
              Ordering
            </span>
          </div>
        );
      case 'Completed':
        return (
          <div className="px-3 py-1.5 bg-emerald-500/10 rounded-md inline-flex justify-center items-center">
            <span className="text-emerald-400 text-sm font-medium font-['Inter'] leading-4">
              Completed
            </span>
          </div>
        );
      default:
        return (
          <div className="px-3 py-1.5 bg-zinc-800 rounded-md inline-flex justify-center items-center">
            <span className="text-neutral-300 text-sm font-medium font-['Inter'] leading-4">
              {status}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Filters and Search Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium font-['Poppins'] transition outline outline-1 outline-offset-[-1px] ${
                  isActive
                    ? 'bg-yellow-400 text-neutral-900 outline-neutral-700 shadow-sm'
                    : 'bg-transparent text-white outline-neutral-700 hover:bg-neutral-800/60'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72 h-9 relative bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 overflow-hidden flex items-center">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order, Table, Guest"
            className="w-full pl-9 pr-3 py-1.5 bg-transparent text-white placeholder-neutral-500 text-sm font-['Inter'] focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 shadow-lg bg-neutral-950/60">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800 text-white text-sm font-semibold font-['Inter']">
              <th className="px-5 py-4 w-32 rounded-tl-lg">Order</th>
              <th className="px-5 py-4 w-44">Waiter / Location</th>
              <th className="px-5 py-4">Items</th>
              <th className="px-5 py-4 w-36">Time Elapsed</th>
              <th className="px-5 py-4 w-48 text-center">Status</th>
              <th className="px-5 py-4 w-32 text-center">Total</th>
              <th className="px-5 py-4 w-24 text-center rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 font-['Inter']">
                  No orders found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className="hover:bg-zinc-900/70 transition cursor-pointer group"
                >
                  <td className="px-5 py-4">
                    <span className="text-neutral-200 text-base font-medium font-['Inter'] group-hover:text-amber-400 transition">
                      {order.orderNumber}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-neutral-200 text-base font-medium font-['Inter']">
                      {order.waiterLocation}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-neutral-200 text-base font-medium font-['Inter'] line-clamp-1">
                      {order.items}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`text-base font-medium font-['Inter'] ${
                        order.isUrgent ? 'text-red-400' : 'text-neutral-200'
                      }`}
                    >
                      {order.timeElapsed}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    {getStatusBadge(order.status)}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span className="text-neutral-200 text-base font-medium font-['Inter']">
                      {order.total}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(order.id);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition inline-flex items-center justify-center"
                      title="View Order Details"
                    >
                      <div className="w-4 h-4 relative flex items-center justify-center">
                        <div className="w-3.5 h-3 border border-white/80 rounded-sm" />
                        <div className="w-1 h-1 bg-white/80 rounded-full absolute" />
                      </div>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
