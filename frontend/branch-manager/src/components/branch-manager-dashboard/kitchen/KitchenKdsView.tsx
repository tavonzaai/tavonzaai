'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Check, Radio, ChefHat } from 'lucide-react';
import { KdsTicket } from '../types';
import { branchManagerService, getActiveBranchId, LiveOrderItem } from '../../../redux/features/branchManagerApi';

interface KitchenKdsViewProps {
  onTicketPlated?: (ticketId: string) => void;
}

function mapOrderToTicket(order: LiveOrderItem): KdsTicket {
  const createdDate = new Date(order.createdAt);
  const diffMins = !isNaN(createdDate.getTime())
    ? Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / 60000))
    : 0;
  const timeAgo = diffMins === 0 ? 'Just now' : `${diffMins} min ago`;

  return {
    id: order.id || order.orderId,
    table: order.tableNumber || (order.tableId ? `Table` : 'Takeaway'),
    orderNumber: order.orderNumber,
    timeAgo,
    server: order.waiterName || 'Unassigned',
    isPlated: order.status === 'READY_TO_SERVE' || order.status === 'SERVED' || order.status === 'COMPLETED',
    items: (order.items || []).map((it) => ({
      name: `${it.quantity}x ${it.name}`,
      mod: it.notes || '',
      category: 'MAIN',
    })),
  };
}

export default function KitchenKdsView({ onTicketPlated }: KitchenKdsViewProps) {
  const [tickets, setTickets] = useState<KdsTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const branchId = getActiveBranchId();
      const orders = await branchManagerService.getOrders(branchId);
      // Filter orders relevant to kitchen: ACCEPTED, PREPARING, READY_TO_SERVE
      const kitchenOrders = (Array.isArray(orders) ? orders : []).filter(
        (o) => o.status === 'ACCEPTED' || o.status === 'PREPARING' || o.status === 'READY_TO_SERVE'
      );
      setTickets(kitchenOrders.map(mapOrderToTicket));
    } catch (err) {
      console.error('Failed to fetch KDS tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 8000);
    return () => clearInterval(interval);
  }, []);

  const togglePlated = async (ticketId: string) => {
    const target = tickets.find((t) => t.id === ticketId);
    const newPlatedState = !target?.isPlated;

    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, isPlated: newPlatedState } : t))
    );

    try {
      await branchManagerService.updateOrderStatus(
        ticketId,
        newPlatedState ? 'READY_TO_SERVE' : 'PREPARING'
      );
      if (onTicketPlated) {
        onTicketPlated(ticketId);
      }
    } catch (err) {
      console.error('Failed to update ticket plated status:', err);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
            Kitchen Display System (KDS Monitor)
          </h1>
          <p className="text-neutral-500 text-sm font-normal font-['Poppins']">
            Live cook line tickets from Grill, Saute, and Pantry stations connected to backend orders stream.
          </p>
        </div>

        {/* KDS Stream Online Status Badge */}
        <div className="px-3.5 py-2 bg-teal-500/10 rounded-md outline outline-1 outline-offset-[-1px] outline-teal-500/70 flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          <span className="text-teal-400 text-sm font-medium font-['Inter']">
            Live Stream Connected
          </span>
        </div>
      </div>

      {/* Tickets Grid or Empty State */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 text-sm font-['Inter']">
          Fetching live kitchen tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
          <ChefHat className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-white font-medium text-base font-['Inter']">
            No Active Cook Tickets
          </h3>
          <p className="text-neutral-500 text-sm font-['Inter'] max-w-sm mx-auto">
            All kitchen queues are clear. When guests or waiters submit orders, tickets will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] flex flex-col justify-between gap-3.5 transition shadow-sm ${
                ticket.isPlated
                  ? 'outline-green-500/50 bg-neutral-900/90'
                  : 'outline-neutral-800 hover:outline-neutral-700'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5">
                  <span className="text-white text-lg font-medium font-['Poppins'] leading-5">
                    {ticket.table}
                  </span>
                  <span className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
                    {ticket.orderNumber}
                  </span>
                </div>

                <div className="px-2.5 py-1.5 bg-yellow-400/10 rounded-lg flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-medium font-['Inter'] leading-4">
                    {ticket.timeAgo}
                  </span>
                </div>
              </div>

              <div className="w-full h-px bg-neutral-800" />

              {/* Items List */}
              <div className="flex flex-col gap-3.5 flex-1 min-h-[140px]">
                {ticket.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-white text-sm font-normal font-['Inter'] leading-4">
                        {item.name}
                      </span>
                      {item.mod && (
                        <span className="text-yellow-400 text-xs font-normal font-['Inter'] leading-4">
                          {item.mod}
                        </span>
                      )}
                    </div>
                    <span className="text-neutral-400 text-xs font-semibold font-['Inter'] shrink-0 px-1.5 py-0.5 bg-neutral-800 rounded">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>

              <div className="w-full h-px bg-neutral-800" />

              {/* Footer */}
              <div className="flex justify-between items-center gap-2 pt-1">
                <span className="text-neutral-400 text-sm font-normal font-['Inter'] truncate max-w-[150px]">
                  Server: {ticket.server}
                </span>

                <button
                  type="button"
                  onClick={() => togglePlated(ticket.id)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-xs font-medium font-['Inter'] cursor-pointer active:scale-95 ${
                    ticket.isPlated
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-green-500/10 hover:bg-green-500/20 text-green-500 outline outline-1 outline-offset-[-1px] outline-green-500/30'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{ticket.isPlated ? 'Plated & Ready' : 'All Items Plated'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
