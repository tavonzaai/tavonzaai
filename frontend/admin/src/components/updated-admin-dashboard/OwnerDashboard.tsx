'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { baseApiFetch } from '../../redux/api/baseApi';
import { NotificationCenter } from '../common/NotificationCenter';
import {
  Store,
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  BarChart3,
  Users,
  Menu,
  Bell,
  Search,
  Plus,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  DollarSign,
  Coffee,
  Wine,
  Building,
} from 'lucide-react';
import OwnerSidebar from './Sidebar';
import RestaurantsView from './restaurants/RestaurantsView';
import { INITIAL_RESTAURANTS } from './restaurants/restaurantsData';
import { RestaurantBranch } from './restaurants/types';

export interface OwnerDashboardProps {
  initialTab?: string;
  initialBranchRestaurantId?: string;
}

export default function OwnerDashboard({
  initialTab = 'restaurants',
  initialBranchRestaurantId,
}: OwnerDashboardProps) {
  const [activeNav, setActiveNav] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const tab = p.get('tab');
      if (tab) return tab;
    }
    return initialTab;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All Restaurants');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [liveTables, setLiveTables] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchLiveData = async () => {
      try {
        const branchId = 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';
        const [ordersRes, tablesRes] = await Promise.allSettled([
          baseApiFetch<any[]>(`/orders/branch/${branchId}`),
          baseApiFetch<any[]>(`/tables/branch/${branchId}`),
        ]);
        if (mounted) {
          if (ordersRes.status === 'fulfilled') {
            const raw = (ordersRes.value as any)?.data || ordersRes.value;
            if (Array.isArray(raw)) setLiveOrders(raw);
          }
          if (tablesRes.status === 'fulfilled') {
            const raw = (tablesRes.value as any)?.data || tablesRes.value;
            if (Array.isArray(raw)) setLiveTables(raw);
          }
        }
      } catch {
        // use defaults
      }
    };

    fetchLiveData();
    return () => { mounted = false; };
  }, [refreshing]);

  const activeTablesCount = liveTables.length > 0 
    ? liveTables.filter((t) => t.serviceStatus !== 'AVAILABLE').length 
    : 3;
  const totalTablesCount = liveTables.length > 0 ? liveTables.length : 5;
  const occupancyPct = totalTablesCount > 0 ? Math.round((activeTablesCount / totalTablesCount) * 100) : 60;
  
  const totalRevenue = useMemo(() => {
    if (liveOrders.length === 0) return '$148,250.00';
    const sum = liveOrders.reduce((acc, o) => acc + (Number(o.total || o.totalAmount) || 0), 0);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(sum);
  }, [liveOrders]);

  const displayedOrders = useMemo(() => {
    if (liveOrders.length === 0) {
      return [
        {
          id: 'ORD-1001',
          restaurant: 'Downtown HQ',
          table: 'Table 01',
          items: '2x Potato Corn Burger',
          amount: '$58.76',
          status: 'Submitted',
          time: '5m ago',
        },
        {
          id: 'ORD-1002',
          restaurant: 'Downtown HQ',
          table: 'Table 03',
          items: '1x Salmon, 1x Ribeye, 2x Cocktail',
          amount: '$98.30',
          status: 'Preparing',
          time: '12m ago',
        },
      ];
    }
    return liveOrders.map((o) => {
      const itemsSummary = Array.isArray(o.items) && o.items.length > 0
        ? o.items.map((i: any) => `${i.quantity}x ${i.name || i.productNameSnapshot || 'Item'}`).join(', ')
        : `${o.itemCount || 1} items`;
      const amountVal = Number(o.total || o.totalAmount || 0);
      return {
        id: o.orderNumber || o.id.slice(0, 8),
        restaurant: 'Downtown HQ',
        table: o.tableLabel || (o.tableId ? `Table ${o.tableId.slice(0, 4)}` : 'Dine In'),
        items: itemsSummary,
        amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountVal),
        status: o.status || 'Active',
        time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
      };
    });
  }, [liveOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  // Mock cross-outlet notifications
  const notifications = [
    {
      id: 1,
      title: 'High Dinner Rush at Tavonza Downtown',
      time: '5m ago',
      type: 'rush',
      text: 'Floor occupancy reached 94%. Kitchen expediter requested 2 additional runner staff.',
    },
    {
      id: 2,
      title: 'Branch Revenue Milestone',
      time: '24m ago',
      type: 'milestone',
      text: 'Tavonza Gulshan Bistro surpassed $50,000 gross revenue for today.',
    },
    {
      id: 3,
      title: 'Supply Low Stock Warning',
      time: '1h ago',
      type: 'alert',
      text: 'Wagyu Beef inventory at 12% across 2 locations. Auto-reorder proposal ready.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Owner Sidebar */}
      <OwnerSidebar
        activeNav={activeNav}
        onSelectNav={(navId) => {
          setActiveNav(navId);
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', navId);
            window.history.pushState({}, '', url.toString());
          }
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-20 bg-black/90 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Owner Hub
                </span>
                <span className="hidden sm:inline-block text-xs text-zinc-500">•</span>
                <span className="hidden sm:inline-block text-xs text-zinc-400 font-medium">
                  {selectedBranch}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white capitalize">
                {activeNav === 'restaurants'
                  ? 'Restaurant Portfolio'
                  : activeNav === 'overview'
                  ? 'Executive Overview'
                  : activeNav === 'orders'
                  ? 'Multi-Branch Orders'
                  : activeNav === 'kitchen'
                  ? 'Kitchen & Bar Monitor'
                  : activeNav === 'analytics'
                  ? 'Financial Intelligence'
                  : 'Teams & Leadership'}
              </h1>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Global Search */}
            <div className="relative hidden md:block w-64 lg:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across outlets..."
                className="w-full h-9 pl-9 pr-4 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Sync Refresh Button */}
            <button
              onClick={handleRefresh}
              title="Sync live status"
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* Realtime Notification Center */}
            <NotificationCenter />

            {/* Owner Profile Chip */}
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-bold text-xs shadow-md">
                DM
              </div>
              <div className="text-left leading-tight hidden xl:block">
                <div className="text-xs font-bold text-white">David Miller</div>
                <div className="text-[10px] text-zinc-400">Group Owner</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Main View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeNav === 'restaurants' && (
            <RestaurantsView
              initialBranchRestaurantId={initialBranchRestaurantId}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
            />
          )}

          {activeNav === 'overview' && (
            <div className="space-y-6">
              {/* Executive Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-2xl p-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    All 4 Multi-Brand Locations Live & Synced
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Executive Command Center
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                    Real-time consolidated view of restaurant performance, table turns, food margins,
                    and guest sentiment across all operating brands.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveNav('restaurants')}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-xs rounded-xl shadow-lg shadow-amber-500/15 flex items-center gap-2 transition-all"
                  >
                    <Store className="w-4 h-4" />
                    Manage Restaurants
                  </button>
                </div>
              </div>

              {/* 4 Key Executive Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-400">Total Group Revenue</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-white">{totalRevenue}</div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+18.4% vs last week</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-400">Active Tables</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Coffee className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-white">{activeTablesCount} / {totalTablesCount}</div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-400">
                      <span>{occupancyPct}% network capacity</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-400">Today's Footfall</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-white">1,420 Guests</div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-400">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+142 over yesterday</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-400">Avg Table Turn Time</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-white">42 Mins</div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-purple-400">
                      <span>4 mins faster than target</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Strategic Advisory & Location Pulse */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-white">
                        AI Executive Intelligence
                      </h3>
                    </div>
                    <span className="text-xs text-zinc-500">Updated 2 mins ago</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-zinc-950/80 border border-zinc-800/80 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-400">
                          High Margin Alert
                        </span>
                        <span className="text-[10px] text-zinc-500">Beverage Program</span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                        Cocktail pairings at Tavonza Downtown are driving a 34% increase in per-ticket
                        beverage revenue. Recommend launching the same signature cocktail lineup at
                        Tavonza Gulshan Bistro this weekend.
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-950/80 border border-zinc-800/80 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-400">
                          Table Optimization
                        </span>
                        <span className="text-[10px] text-zinc-500">Café Bistro</span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                        Lunch turnaround time has improved by 6.2 minutes following waiter tablet
                        deployment. Estimated extra daily yield: +$2,400.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Portfolio Status Quick List */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Restaurants Snapshot</h3>
                    <button
                      onClick={() => setActiveNav('restaurants')}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {INITIAL_RESTAURANTS.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{r.name}</div>
                          <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-zinc-500" />
                            {r.address}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            r.status === 'Open'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Live Multi-Branch Orders Feed</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Real-time consolidated stream of incoming dine-in, takeaway, and VIP delivery tickets.
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav('restaurants')}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Branch Filter
                </button>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Active Orders Queue</span>
                  <span className="text-xs text-zinc-400">{displayedOrders.length} orders in progress</span>
                </div>
                <div className="divide-y divide-zinc-800/60">
                  {displayedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{order.id}</span>
                          <span className="text-xs text-zinc-500">•</span>
                          <span className="text-xs font-medium text-amber-400">
                            {order.restaurant}
                          </span>
                          <span className="text-xs text-zinc-500">•</span>
                          <span className="text-xs text-zinc-300">{order.table}</span>
                        </div>
                        <p className="text-xs text-zinc-400">{order.items}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs font-bold text-white">{order.amount}</div>
                          <div className="text-[10px] text-zinc-500">{order.time}</div>
                        </div>
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                            order.status === 'Ready to Serve'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : order.status === 'Served'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeNav === 'kitchen' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Kitchen & Bar Cross-Sync</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Live load and ticket turnaround times across all preparation stations.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-zinc-300 font-medium">All KDS Connected</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    name: 'Tavonza Downtown KDS',
                    load: '92%',
                    status: 'High Load',
                    tickets: '14 Active',
                    avgCook: '14.2 min',
                    color: 'text-amber-400',
                  },
                  {
                    name: 'Café Bistro Counter',
                    load: '45%',
                    status: 'Normal',
                    tickets: '4 Active',
                    avgCook: '6.5 min',
                    color: 'text-emerald-400',
                  },
                  {
                    name: 'Gulshan Bistro Main Line',
                    load: '68%',
                    status: 'Moderate',
                    tickets: '9 Active',
                    avgCook: '11.8 min',
                    color: 'text-blue-400',
                  },
                ].map((station, i) => (
                  <div
                    key={i}
                    className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{station.name}</h4>
                      <span className={`text-[10px] font-semibold ${station.color}`}>
                        {station.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Current Load</span>
                        <span className="font-bold text-white">{station.load}</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: station.load }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                      <span>{station.tickets}</span>
                      <span>Avg: {station.avgCook}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Financial & Growth Analytics</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Multi-unit margins, labor cost distribution, and profitability by outlet.
                  </p>
                </div>
                <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold rounded-xl transition-colors">
                  Export PDF Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4">Location Profitability</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Tavonza Downtown', rev: '$62,400', margin: '28.4%', bar: '85%' },
                      { name: 'Tavonza Gulshan Bistro', rev: '$54,650', margin: '31.2%', bar: '72%' },
                      { name: 'Café Bistro', rev: '$31,200', margin: '22.8%', bar: '45%' },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-200 font-medium">{item.name}</span>
                          <span className="text-white font-bold">
                            {item.rev} ({item.margin} net)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: item.bar }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4">Cost Structure Overview</h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl flex items-center justify-between">
                      <span className="text-zinc-400">Food & Beverage Cost (COGS)</span>
                      <span className="text-emerald-400 font-bold">29.4% (Optimal &lt; 31%)</span>
                    </div>
                    <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl flex items-center justify-between">
                      <span className="text-zinc-400">Labor & Staff Payroll</span>
                      <span className="text-amber-400 font-bold">24.8% (Target: 25%)</span>
                    </div>
                    <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl flex items-center justify-between">
                      <span className="text-zinc-400">Operating Overheads & Utilities</span>
                      <span className="text-blue-400 font-bold">14.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'staff' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Leadership & Outlet Staffing</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Multi-location general managers, supervisors, and on-duty headcounts.
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav('restaurants')}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-xs font-bold transition-colors"
                >
                  View by Restaurant
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    name: 'Chef Marco Rossi',
                    role: 'Executive Chef & Partner',
                    branch: 'Tavonza Downtown',
                    status: 'Active On Duty',
                  },
                  {
                    name: 'Sarah Jenkins',
                    role: 'General Manager',
                    branch: 'Café Bistro',
                    status: 'Active On Duty',
                  },
                  {
                    name: 'Ahmed Tariq',
                    role: 'General Manager',
                    branch: 'Tavonza Gulshan Bistro',
                    status: 'Active On Duty',
                  },
                ].map((member, i) => (
                  <div
                    key={i}
                    className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-xs">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{member.name}</div>
                        <div className="text-[10px] text-zinc-400">{member.role}</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-amber-400 font-medium">{member.branch}</span>
                      <span className="text-emerald-400">{member.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
