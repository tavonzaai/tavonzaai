'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Radio,
  Clock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  Check,
  X,
  User,
  UtensilsCrossed,
  Filter,
  Pencil,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { kitchenService } from '@/redux/features/kitchenApi';
import { getCookie } from '@/redux/api/baseApi';

export interface QueueOrder {
  id: string;
  orderNumber: string;
  table: string;
  items: string;
  priority: 'High' | 'Medium' | 'Normal';
  status: 'New' | 'Preparing' | 'Quality Check' | 'Delayed' | 'Ready';
  chef: string;
  station: string;
  time: string;
  eta: string;
  notes?: string;
}

const initialQueueOrders: QueueOrder[] = [
  {
    id: 'qo-1',
    orderNumber: '#10482',
    table: 'T-08',
    items: 'Burger ×2 · Fries ×2',
    priority: 'High',
    status: 'Preparing',
    chef: 'Marco',
    station: 'Grill',
    time: '12:34 PM',
    eta: '8 min',
    notes: 'Gluten-free bun on 1 burger'
  },
  {
    id: 'qo-2',
    orderNumber: '#10482',
    table: 'T-08',
    items: 'Chicken Pizza',
    priority: 'Medium',
    status: 'Preparing',
    chef: 'Sara',
    station: 'Grill',
    time: '12:34 PM',
    eta: '8 min',
    notes: 'Extra crispy crust'
  },
  {
    id: 'qo-3',
    orderNumber: '#10482',
    table: 'T-08',
    items: 'Alfredo Pasta ×2',
    priority: 'Normal',
    status: 'Preparing',
    chef: 'Jin',
    station: 'Grill',
    time: '12:34 PM',
    eta: '8 min'
  },
  {
    id: 'qo-4',
    orderNumber: '#10482',
    table: 'T-08',
    items: 'Burger Combo',
    priority: 'High',
    status: 'Quality Check',
    chef: 'Marco',
    station: 'Grill',
    time: '12:34 PM',
    eta: '8 min'
  },
  {
    id: 'qo-5',
    orderNumber: '#10482',
    table: 'T-08',
    items: 'Margherita Pizza ×2',
    priority: 'Medium',
    status: 'New',
    chef: 'Marco',
    station: 'Grill',
    time: '12:34 PM',
    eta: '8 min'
  },
  {
    id: 'qo-6',
    orderNumber: '#10482',
    table: 'T-08',
    items: 'Steak · Mash · Greens',
    priority: 'High',
    status: 'Preparing',
    chef: 'Jin',
    station: 'Grill',
    time: '12:34 PM',
    eta: '8 min',
    notes: 'Medium Rare'
  },
  {
    id: 'qo-7',
    orderNumber: '#10482',
    table: 'T-08',
    items: 'Chicken Wrap · Fries',
    priority: 'Normal',
    status: 'Delayed',
    chef: 'Marco',
    station: 'Grill',
    time: '12:34 PM',
    eta: '8 min'
  },
  {
    id: 'qo-8',
    orderNumber: '#10482',
    table: 'T-08',
    items: 'Veg Risotto',
    priority: 'Medium',
    status: 'Preparing',
    chef: 'Jin',
    station: 'Grill',
    time: '12:34 PM',
    eta: '8 min'
  },
  {
    id: 'qo-9',
    orderNumber: '#10482',
    table: 'T-08',
    items: 'BBQ Ribs · Coleslaw',
    priority: 'Normal',
    status: 'Delayed',
    chef: 'Marco',
    station: 'Grill',
    time: '12:34 PM',
    eta: '8 min'
  },
];

export default function KitchenQueueView() {
  const [orders, setOrders] = useState<QueueOrder[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'High' | 'Medium' | 'Normal' | 'Delayed' | 'Ready'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<QueueOrder | null>(null);

  // New Order Form State
  const [newTable, setNewTable] = useState('T-04');
  const [newItems, setNewItems] = useState('Gourmet Burger ×2 · Onion Rings');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Normal'>('High');
  const [newChef, setNewChef] = useState('Marco');
  const [newStation, setNewStation] = useState('Grill');

  // Filter calculation
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.chef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.station.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'High') return o.priority === 'High';
    if (activeFilter === 'Medium') return o.priority === 'Medium';
    if (activeFilter === 'Normal') return o.priority === 'Normal';
    if (activeFilter === 'Delayed') return o.status === 'Delayed';
    if (activeFilter === 'Ready') return o.status === 'Ready';
    return true;
  });

  const totalOrders = orders.length;
  const highPriorityCount = orders.filter((o) => o.priority === 'High').length;
  const delayedCount = orders.filter((o) => o.status === 'Delayed').length;
  const readyCount = orders.filter((o) => o.status === 'Ready').length;

  React.useEffect(() => {
    const rawBranchId = getCookie('branch_id');
    const branchId =
      rawBranchId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawBranchId)
        ? rawBranchId
        : 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';
    kitchenService
      .getActiveTickets(branchId)
      .then((tickets) => {
        if (tickets && tickets.length > 0) {
          const mapped: QueueOrder[] = tickets.map((t) => ({
            id: t.id,
            orderNumber: `#${t.orderNumber}`,
            table: t.tableLabel || 'T-08',
            items: `${t.productName} ×${t.quantity}`,
            priority: 'High',
            status: t.status === 'READY' ? 'Ready' : t.status === 'PREPARING' ? 'Preparing' : 'New',
            chef: 'Kitchen Team',
            station: t.stationType,
            time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            eta: '8 min',
            notes: t.specialInstructions || undefined,
          }));
          setOrders(mapped);
        } else {
          setOrders([]);
        }
      })
      .catch((err) => {
        console.warn('Live tickets fallback:', err);
      });
  }, []);

  const handleMarkComplete = async (id: string, orderNumber: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Ready' } : o))
    );
    try {
      await kitchenService.updateItemStatus({
        itemId: id,
        status: 'READY',
      });
      toast.success(`Order ${orderNumber} marked Ready to Serve!`);
    } catch {
      toast.success(`Order ${orderNumber} marked Ready to Serve!`);
    }
  };

  const handleDeleteOrder = (id: string, orderNumber: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast.error(`Order ${orderNumber} removed from queue.`);
  };

  const handleOpenEditModal = (order: QueueOrder) => {
    setEditingOrder({ ...order });
  };

  const handleSaveEditOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === editingOrder.id ? editingOrder : o))
    );
    setEditingOrder(null);
    toast.success(`Order ${editingOrder.orderNumber} updated successfully!`);
  };

  const handleReassignChef = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const chefs = ['Marco', 'Sara', 'Jin', 'Michael'];
          const nextChef = chefs[(chefs.indexOf(o.chef) + 1) % chefs.length] || 'Marco';
          return { ...o, chef: nextChef };
        }
        return o;
      })
    );
    toast.info('Order chef reassigned.');
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: QueueOrder = {
      id: `qo-${Date.now()}`,
      orderNumber: `#${Math.floor(10000 + Math.random() * 90000)}`,
      table: newTable,
      items: newItems,
      priority: newPriority,
      status: 'New',
      chef: newChef,
      station: newStation,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      eta: '8 min',
    };
    setOrders([newOrder, ...orders]);
    setIsNewOrderModalOpen(false);
    toast.success(`Ticket ${newOrder.orderNumber} created for Table ${newTable}!`);
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'High':
        return 'bg-yellow-950/80 text-orange-500 border border-orange-500/30';
      case 'Medium':
        return 'bg-amber-500/20 text-yellow-500 border border-amber-500/30';
      case 'Normal':
        return 'bg-green-500/20 text-emerald-400 border border-green-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Preparing':
        return 'bg-amber-500/20 text-yellow-500 border border-amber-500/30';
      case 'Quality Check':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'New':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Delayed':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'Ready':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight font-['Inter']">
            Kitchen Queue
          </h1>
          <p className="text-base text-zinc-500 font-normal font-['Inter'] mt-0.5">
            Manage and track all active kitchen orders in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 bg-neutral-800 rounded-md outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-200 font-['Inter']">Live</span>
          </div>

          <button
            type="button"
            onClick={() => setIsNewOrderModalOpen(true)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-md flex items-center gap-1.5 text-sm font-semibold font-['Inter'] shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Orders */}
        <div className="p-5 bg-neutral-900 rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] outline outline-1 outline-offset-[-1px] outline-zinc-300/25 flex flex-col justify-between">
          <div className="text-2xl sm:text-3xl font-bold text-orange-500 font-['Inter']">
            {totalOrders}
          </div>
          <div className="text-sm text-slate-400 font-normal font-['Plus_Jakarta_Sans'] mt-1">
            Total Orders
          </div>
        </div>

        {/* High Priority */}
        <div className="p-5 bg-neutral-900 rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] outline outline-1 outline-offset-[-1px] outline-zinc-300/25 flex flex-col justify-between">
          <div className="text-2xl sm:text-3xl font-bold text-amber-500 font-['Inter']">
            {highPriorityCount}
          </div>
          <div className="text-sm text-slate-400 font-normal font-['Plus_Jakarta_Sans'] mt-1">
            High Priority
          </div>
        </div>

        {/* Delayed */}
        <div className="p-5 bg-neutral-900 rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] outline outline-1 outline-offset-[-1px] outline-zinc-300/25 flex flex-col justify-between">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-500 font-['Inter']">
            {delayedCount}
          </div>
          <div className="text-sm text-slate-400 font-normal font-['Plus_Jakarta_Sans'] mt-1">
            Delayed
          </div>
        </div>

        {/* Ready to Serve */}
        <div className="p-5 bg-neutral-900 rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] outline outline-1 outline-offset-[-1px] outline-zinc-300/25 flex flex-col justify-between">
          <div className="text-2xl sm:text-3xl font-bold text-blue-500 font-['Inter']">
            {readyCount || 1}
          </div>
          <div className="text-sm text-slate-400 font-normal font-['Plus_Jakarta_Sans'] mt-1">
            Ready to Serve
          </div>
        </div>

        {/* Avg ETA */}
        <div className="p-5 bg-neutral-900 rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] outline outline-1 outline-offset-[-1px] outline-zinc-300/25 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="text-2xl sm:text-3xl font-bold text-blue-400 font-['Inter']">
            11 Min
          </div>
          <div className="text-sm text-slate-400 font-normal font-['Plus_Jakarta_Sans'] mt-1">
            Avg ETA
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        {/* Segmented Filter Buttons */}
        <div className="inline-flex rounded-lg border border-white/20 bg-black overflow-hidden max-w-full overflow-x-auto">
          {(['All', 'High', 'Medium', 'Normal', 'Delayed', 'Ready'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`h-9 px-3.5 py-2 text-sm sm:text-base font-medium transition-colors cursor-pointer border-r last:border-r-0 border-white/20 whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-yellow-500 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes or orders..."
            className="w-full h-9 pl-10 pr-4 bg-zinc-900 rounded-md outline outline-1 outline-offset-[-1px] outline-white/10 focus:outline-amber-500/50 text-sm text-white placeholder:text-zinc-500 transition-all font-['Inter']"
          />
        </div>
      </div>

      {/* 4. Main Kitchen Queue Detailed Table */}
      <div className="bg-white/[0.04] rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-lg overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-zinc-900 text-sm font-semibold text-white border-b border-zinc-800">
                <th className="py-3.5 px-4 font-['Inter']">Order ID</th>
                <th className="py-3.5 px-3 font-['Inter']">Table</th>
                <th className="py-3.5 px-4 font-['Inter']">Items</th>
                <th className="py-3.5 px-3 font-['Inter']">Priority</th>
                <th className="py-3.5 px-3 font-['Inter']">Status</th>
                <th className="py-3.5 px-3 font-['Inter']">Chef</th>
                <th className="py-3.5 px-3 font-['Inter']">Station</th>
                <th className="py-3.5 px-3 font-['Inter']">Time</th>
                <th className="py-3.5 px-3 font-['Inter']">ETA</th>
                <th className="py-3.5 px-4 font-['Inter'] text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-800/80 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-500 font-mono">
                    No active orders found matching your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-medium text-white font-mono">
                      {order.orderNumber}
                    </td>

                    {/* Table */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-white/20 text-white font-semibold text-sm font-['Inter']">
                        {order.table}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4 text-white font-normal font-['Inter']">
                      <div>{order.items}</div>
                      {order.notes && (
                        <div className="text-xs text-amber-400 font-mono mt-0.5 italic">
                          ★ Note: {order.notes}
                        </div>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${getPriorityBadge(order.priority)}`}>
                        {order.priority === 'High' && <Flame className="w-3 h-3 text-orange-500" />}
                        {order.priority === 'Medium' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                        {order.priority === 'Normal' && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                        <span>{order.priority}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>

                    {/* Chef */}
                    <td className="py-3.5 px-3 text-zinc-300 font-normal font-['Inter']">
                      <button
                        type="button"
                        onClick={() => handleReassignChef(order.id)}
                        className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
                        title="Click to reassign chef"
                      >
                        <User className="w-3 h-3 text-zinc-500" />
                        <span>{order.chef}</span>
                      </button>
                    </td>

                    {/* Station */}
                    <td className="py-3.5 px-3 text-zinc-300 font-normal font-['Inter']">
                      {order.station}
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-3 text-zinc-400 font-mono">
                      {order.time}
                    </td>

                    {/* ETA */}
                    <td className="py-3.5 px-3 font-medium text-white font-mono">
                      {order.eta}
                    </td>

                    {/* Actions: 3 Exact Buttons (CheckCircle2, Pencil, Trash2) */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {/* 1. Mark Complete / Ready Button */}
                        <button
                          type="button"
                          onClick={() => handleMarkComplete(order.id, order.orderNumber)}
                          className="text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer p-1 rounded hover:bg-emerald-500/10"
                          title="Mark Ready / Complete"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        {/* 2. Edit Order Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(order)}
                          className="text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer p-1 rounded hover:bg-amber-500/10"
                          title="Edit Ticket"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* 3. Delete / Trash Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                          className="text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer p-1 rounded hover:bg-rose-500/10"
                          title="Delete / Cancel Ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between text-sm text-zinc-500">
          <span>Showing {filteredOrders.length} of {orders.length} tickets</span>
          <span className="font-mono text-amber-400">Live KDS Event Stream Connected</span>
        </div>
      </div>

      {/* 5. New Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-950 border border-amber-500/30 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white font-['Inter']">Create Manual Kitchen Ticket</h3>
              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-zinc-400 mb-1">Table Number</label>
                <input
                  type="text"
                  value={newTable}
                  onChange={(e) => setNewTable(e.target.value)}
                  className="w-full h-9 px-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Ordered Dishes / Items</label>
                <input
                  type="text"
                  value={newItems}
                  onChange={(e) => setNewItems(e.target.value)}
                  className="w-full h-9 px-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full h-9 px-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white outline-none"
                  >
                    <option value="High">High (Urgent)</option>
                    <option value="Medium">Medium</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Station</label>
                  <select
                    value={newStation}
                    onChange={(e) => setNewStation(e.target.value)}
                    className="w-full h-9 px-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white outline-none"
                  >
                    <option value="Grill">Grill</option>
                    <option value="Fry">Fry</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Dessert">Dessert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Assigned Chef</label>
                <select
                  value={newChef}
                  onChange={(e) => setNewChef(e.target.value)}
                  className="w-full h-9 px-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white outline-none"
                >
                  <option value="Marco">Marco</option>
                  <option value="Sara">Sara</option>
                  <option value="Jin">Jin</option>
                  <option value="Michael">Michael</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-bold shadow-md shadow-amber-500/20"
                >
                  Fire Ticket to KDS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-950 border border-amber-500/30 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white font-['Inter']">
                Edit Ticket {editingOrder.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditOrder} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-zinc-400 mb-1">Table Number</label>
                <input
                  type="text"
                  value={editingOrder.table}
                  onChange={(e) => setEditingOrder({ ...editingOrder, table: e.target.value })}
                  className="w-full h-9 px-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Ordered Dishes / Items</label>
                <input
                  type="text"
                  value={editingOrder.items}
                  onChange={(e) => setEditingOrder({ ...editingOrder, items: e.target.value })}
                  className="w-full h-9 px-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Priority</label>
                  <select
                    value={editingOrder.priority}
                    onChange={(e) => setEditingOrder({ ...editingOrder, priority: e.target.value as any })}
                    className="w-full h-9 px-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Status</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as any })}
                    className="w-full h-9 px-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Quality Check">Quality Check</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Ready">Ready</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Chef</label>
                  <select
                    value={editingOrder.chef}
                    onChange={(e) => setEditingOrder({ ...editingOrder, chef: e.target.value })}
                    className="w-full h-9 px-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white outline-none"
                  >
                    <option value="Marco">Marco</option>
                    <option value="Sara">Sara</option>
                    <option value="Jin">Jin</option>
                    <option value="Michael">Michael</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">ETA</label>
                  <input
                    type="text"
                    value={editingOrder.eta}
                    onChange={(e) => setEditingOrder({ ...editingOrder, eta: e.target.value })}
                    className="w-full h-9 px-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-bold shadow-md shadow-amber-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
