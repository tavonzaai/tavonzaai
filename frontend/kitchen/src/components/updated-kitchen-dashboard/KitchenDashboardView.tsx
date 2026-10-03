"use client";

import React, { useState, useEffect } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Sidebar, { updatedKitchenNavItems } from "./Sidebar";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  Flame,
  UtensilsCrossed,
  Search,
  Check,
  ChevronDown,
  Volume2,
  VolumeX,
  Menu as MenuIcon,
  BookOpen,
  Package,
  FileSpreadsheet,
  Sparkles,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { INITIAL_ORDERS, KITCHEN_STATIONS, INITIAL_INVENTORY, RECIPES, SHIFT_STATS, FLAG_REASONS } from "./data";
import { KitchenOrder, OrderStatus } from "./types";

export interface KitchenDashboardViewProps {
  initialNav?: string;
}

const getInitialNav = (initialNav?: string): string => {
  if (initialNav && initialNav !== "Dashboard") {
    const found = updatedKitchenNavItems.find(
      (item) => item.name.toLowerCase() === initialNav.toLowerCase()
    );
    if (found) return found.name;
    return initialNav;
  }
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam) {
      const found = updatedKitchenNavItems.find(
        (item) => item.name.toLowerCase().replace(/\s+/g, "-") === tabParam.toLowerCase()
      );
      if (found) return found.name;
    }
  }
  return initialNav || "Dashboard";
};

export default function KitchenDashboardView({ initialNav = "Dashboard" }: KitchenDashboardViewProps) {
  const [activeNav, setActiveNav] = useState<string>(() => getInitialNav(initialNav));
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [orders, setOrders] = useState<KitchenOrder[]>(INITIAL_ORDERS);
  const [selectedStation, setSelectedStation] = useState<string>("Grill Station");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTabFilter, setActiveTabFilter] = useState<string>("ALL");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [stationDropdownOpen, setStationDropdownOpen] = useState<boolean>(false);

  // Flag Issue Modal State
  const [flagModalOpen, setFlagModalOpen] = useState<boolean>(false);
  const [selectedOrderForFlag, setSelectedOrderForFlag] = useState<KitchenOrder | null>(null);
  const [selectedFlagReason, setSelectedFlagReason] = useState<string>("Food Quality / Problem");

  // Notification Banner for Ready Orders
  const [readyNotification, setReadyNotification] = useState<string | null>(null);

  // Live Clock
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync active tab to URL
  const handleNavChange = (navName: string) => {
    setActiveNav(navName);
    if (typeof window !== "undefined") {
      const slug = navName.toLowerCase().replace(/\s+/g, "-");
      const newUrl = slug === "dashboard" ? "/updated-kitchen-dashboard/dashboard" : `/updated-kitchen-dashboard/${slug}`;
      window.history.pushState({}, "", newUrl);
    }
  };

  // Counters
  const newCount = orders.filter((o) => o.status === "NEW").length;
  const preparingCount = orders.filter((o) => o.status === "PREPARING").length;
  const readyCount = orders.filter((o) => o.status === "READY").length;
  const overdueCount = orders.filter((o) => o.status === "OVERDUE" || o.flaggedIssue).length;

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (selectedStation !== "All Stations" && order.station !== selectedStation) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(query);
      const matchTable = order.table.toLowerCase().includes(query);
      const matchWaiter = order.waiter.toLowerCase().includes(query);
      const matchItem = order.items.some((i) => i.name.toLowerCase().includes(query));
      if (!matchNumber && !matchTable && !matchWaiter && !matchItem) return false;
    }
    if (activeTabFilter === "NEW") return order.status === "NEW";
    if (activeTabFilter === "PREPARING") return order.status === "PREPARING";
    if (activeTabFilter === "READY") return order.status === "READY";
    if (activeTabFilter === "OVERDUE") return order.status === "OVERDUE" || !!order.flaggedIssue;

    return true;
  });

  // Handlers
  const handleStartPreparing = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "PREPARING" as OrderStatus } : o))
    );
    toast.success("Order status updated to Preparing");
  };

  const handleMarkReady = (order: KitchenOrder) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: "READY" as OrderStatus,
              items: o.items.map((i) => ({ ...i, isCompleted: true })),
            }
          : o
      )
    );
    const notifMsg = `Order ${order.orderNumber} is Ready to Serve Table ${order.table}`;
    setReadyNotification(notifMsg);
    toast.success(notifMsg);
    setTimeout(() => {
      setReadyNotification(null);
    }, 6000);
  };

  const handleToggleItemComplete = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map((item) =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        );
        const allCompleted = updatedItems.every((i) => i.isCompleted);
        return {
          ...order,
          items: updatedItems,
          status: allCompleted ? ("READY" as OrderStatus) : order.status,
        };
      })
    );
  };

  const openFlagModal = (order: KitchenOrder) => {
    setSelectedOrderForFlag(order);
    setSelectedFlagReason(FLAG_REASONS[0] || "Food Quality / Problem");
    setFlagModalOpen(true);
  };

  const submitFlagIssue = () => {
    if (!selectedOrderForFlag) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderForFlag.id
          ? {
              ...o,
              flaggedIssue: selectedFlagReason,
              status: "OVERDUE" as OrderStatus,
            }
          : o
      )
    );
    toast.error(`Escalated issue for Order ${selectedOrderForFlag.orderNumber}: ${selectedFlagReason}`);
    setFlagModalOpen(false);
    setSelectedOrderForFlag(null);
  };

  const handleSimulateOrder = () => {
    const newNum = Math.floor(1000 + Math.random() * 9000);
    const tableNum = `T-0${Math.floor(1 + Math.random() * 9)}`;
    const newOrder: KitchenOrder = {
      id: `ord-sim-${Date.now()}`,
      orderNumber: `#${newNum}`,
      table: tableNum,
      orderType: "Dine-in",
      waiter: "Marco",
      status: "NEW",
      station: selectedStation === "All Stations" ? "Grill Station" : selectedStation,
      timeElapsedMinutes: 0,
      createdAt: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      items: [
        {
          id: `item-sim-1-${Date.now()}`,
          name: "Classic Burger",
          quantity: 1,
          options: ["Medium Well", "No Onions"],
          isCompleted: false,
        },
        {
          id: `item-sim-2-${Date.now()}`,
          name: "Truffle Fries & Dip",
          quantity: 1,
          options: ["Extra Aioli"],
          isCompleted: false,
        },
      ],
    };
    setOrders((prev) => [newOrder, ...prev]);
    toast.info(`Simulated new incoming order ${newOrder.orderNumber} at ${newOrder.table}`);
  };

  return (
    <AuthGuard allowedRoles={["KITCHEN"]}>
      <div className="min-h-screen w-full bg-black text-white font-sans flex flex-col md:flex-row selection:bg-yellow-400 selection:text-black overflow-x-hidden">
        
        {/* Sidebar */}
        <Sidebar
          activeNav={activeNav}
          setActiveNav={handleNavChange}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Workspace */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          
          {/* Header Bar */}
          <header className="w-full min-h-[90px] bg-black border-b border-zinc-900 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 relative z-40">
            
            {/* Left: Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-zinc-300 hover:text-white p-2 rounded-xl bg-zinc-900 border border-zinc-800"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block">
                  Kitchen Terminal • {activeNav}
                </span>
                <h1 className="text-lg lg:text-xl font-bold text-white font-['Inter']">
                  Branch 4 ( Downtown )
                </h1>
              </div>
            </div>

            {/* Middle: Station & Counters */}
            <div className="flex items-center gap-3 py-1 relative z-50">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setStationDropdownOpen(!stationDropdownOpen)}
                  className="h-9 px-3 bg-zinc-900 border border-yellow-400 rounded-lg flex items-center justify-between gap-2 text-xs font-normal text-white uppercase font-['Inter'] min-w-[140px] cursor-pointer hover:bg-zinc-800 transition"
                >
                  <span>{selectedStation}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-300" />
                </button>
                {stationDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={() => setStationDropdownOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-52 bg-zinc-900 border border-amber-500/50 rounded-xl shadow-2xl py-1.5 z-50 space-y-0.5">
                      {["Grill Station", "Fryer Station", "Salad & Cold Prep", "Bar & Beverages", "All Stations"].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setSelectedStation(st);
                            setStationDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-['Inter'] flex items-center justify-between cursor-pointer transition ${
                            selectedStation === st
                              ? "bg-yellow-400/20 text-yellow-400 font-semibold"
                              : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          }`}
                        >
                          <span>{st}</span>
                          {selectedStation === st && <Check className="w-3.5 h-3.5 text-yellow-400" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Stat Counters */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
                  <span className="text-amber-500 font-bold text-sm leading-none block">{newCount}</span>
                  <span className="text-[10px] text-zinc-400 font-medium uppercase">New</span>
                </div>
                <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
                  <span className="text-yellow-400 font-bold text-sm leading-none block">{preparingCount}</span>
                  <span className="text-[10px] text-zinc-400 font-medium uppercase">Prep</span>
                </div>
                <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
                  <span className="text-emerald-400 font-bold text-sm leading-none block">{readyCount}</span>
                  <span className="text-[10px] text-zinc-400 font-medium uppercase">Ready</span>
                </div>
              </div>

              {/* Simulate Button */}
              <button
                type="button"
                onClick={handleSimulateOrder}
                className="h-9 px-3 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-lg shadow-md shadow-amber-500/20 flex items-center gap-1 transition active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Order</span>
              </button>
            </div>

            {/* Right: Sound & Time */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                title={soundEnabled ? "Mute chimes" : "Enable chimes"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
              </button>
              <div className="text-right">
                <span className="text-white text-xs font-bold block">{currentTime || "3:50:07 PM"}</span>
                <span className="text-zinc-500 text-[10px] block">{currentDate || "Sep 23, 2026"}</span>
              </div>
            </div>
          </header>

          {/* Sub-View Component Router */}
          <div className="flex-1 overflow-y-auto">
            {activeNav === "Dashboard" || activeNav === "Kitchen Queue" || activeNav === "Active Orders" ? (
              /* FIGMA KDS CARDS GRID VIEW */
              <div className="p-4 lg:p-8 flex flex-col gap-6">
                
                {/* Search & Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {["ALL", "NEW", "PREPARING", "READY", "OVERDUE"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setActiveTabFilter(t)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wider transition cursor-pointer ${
                          activeTabFilter === t
                            ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/10"
                            : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tickets, table, dish..."
                      className="w-full h-8 pl-8 pr-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Ready Notification Banner */}
                {readyNotification && (
                  <div className="w-full p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-xl flex items-center justify-between text-sm text-white animate-in fade-in duration-200">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>{readyNotification}</span>
                    </div>
                    <button type="button" onClick={() => setReadyNotification(null)} className="text-zinc-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                  {filteredOrders.map((order) => {
                    const isOverdue = order.status === "OVERDUE";
                    const isPreparing = order.status === "PREPARING";
                    const isReady = order.status === "READY";
                    const isNew = order.status === "NEW";

                    return (
                      <div
                        key={order.id}
                        className={`w-full bg-zinc-900 rounded-xl p-5 border flex flex-col justify-between gap-4 transition-all shadow-xl relative overflow-hidden ${
                          isOverdue || order.flaggedIssue
                            ? "border-red-500/80 bg-zinc-900/95"
                            : isReady
                            ? "border-emerald-500/60"
                            : isPreparing
                            ? "border-amber-500/40"
                            : "border-zinc-800"
                        }`}
                      >
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <span className="text-white text-base font-bold font-['Inter'] leading-none block">
                                {order.orderNumber}
                              </span>
                              <span className="text-neutral-400 text-xs font-medium font-['Inter'] block mt-1">
                                {order.table} . {order.orderType} . Waiter: {order.waiter}
                              </span>
                            </div>
                            {isNew && <span className="px-2.5 py-1 bg-amber-400 text-black rounded-lg text-xs font-bold">New Order</span>}
                            {isPreparing && !order.flaggedIssue && <span className="px-2.5 py-1 bg-amber-700 text-white rounded-lg text-xs font-bold">Preparing</span>}
                            {isReady && <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold">Ready</span>}
                            {isOverdue && !order.flaggedIssue && <span className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold">Overdue</span>}
                            {order.flaggedIssue && <span className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold">Issue Flagged</span>}
                          </div>

                          {order.flaggedIssue && (
                            <div className="p-2 bg-red-950/90 border border-red-500/40 rounded-lg text-xs text-white flex items-center gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              <span>Issue: {order.flaggedIssue}</span>
                            </div>
                          )}

                          <div className="flex flex-col gap-2.5 pt-1">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => handleToggleItemComplete(order.id, item.id)}
                                className={`p-2.5 rounded-xl border transition flex flex-col gap-1.5 cursor-pointer ${
                                  item.isCompleted
                                    ? "bg-neutral-800/40 border-emerald-500/30"
                                    : "bg-neutral-900/90 border-zinc-800"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition shrink-0 ${
                                      item.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-500 bg-neutral-800"
                                    }`}
                                  >
                                    {item.isCompleted && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                                  </div>
                                  <span className={`text-xs font-medium ${item.isCompleted ? "text-zinc-400 line-through" : "text-zinc-100"}`}>
                                    {item.quantity}X {item.name}
                                  </span>
                                </div>
                                {item.options && item.options.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pl-5">
                                    {item.options.map((opt, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-300">
                                        {opt}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                          {isNew && (
                            <button
                              type="button"
                              onClick={() => handleStartPreparing(order.id)}
                              className="w-full h-9 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-lg transition active:scale-95"
                            >
                              Start Preparing
                            </button>
                          )}
                          {isPreparing && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleMarkReady(order)}
                                className="flex-1 h-9 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-lg transition active:scale-95"
                              >
                                Mark Ready
                              </button>
                              <button
                                type="button"
                                onClick={() => openFlagModal(order)}
                                className="px-2.5 h-9 bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-zinc-700 text-xs rounded-lg flex items-center gap-1"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Flag</span>
                              </button>
                            </>
                          )}
                          {isReady && (
                            <div className="w-full h-9 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-center gap-2 text-emerald-400 text-xs font-semibold">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Waiter Notified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : activeNav === "Stations" ? (
              /* STATIONS VIEW */
              <div className="p-4 lg:p-8 flex flex-col gap-6">
                <h2 className="text-xl font-bold text-white font-['Inter']">Kitchen Workstation Load</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {KITCHEN_STATIONS.map((st) => (
                    <div key={st.id} className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold text-sm">{st.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${st.status === "BUSY" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                          {st.status}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400">Assigned: {st.chefAssigned}</span>
                      <div className="flex items-center justify-between text-xs text-zinc-300 pt-2 border-t border-zinc-800">
                        <span>Active Tickets:</span>
                        <span className="font-bold text-amber-400">{st.activeTickets}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeNav === "Recipes" ? (
              /* RECIPES VIEW */
              <div className="p-4 lg:p-8 flex flex-col gap-6">
                <h2 className="text-xl font-bold text-white font-['Inter']">Standard Culinary Recipes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {RECIPES.map((rec) => (
                    <div key={rec.id} className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold text-base">{rec.name}</span>
                        <span className="text-xs text-amber-400 font-semibold">{rec.prepTimeMinutes} mins prep</span>
                      </div>
                      <span className="text-xs text-zinc-400">Station: {rec.station}</span>
                      <div className="flex flex-col gap-1 pt-2 border-t border-zinc-800">
                        <span className="text-xs font-semibold text-zinc-300">Ingredients & Spec:</span>
                        <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1">
                          {rec.ingredients.map((ing, i) => (
                            <li key={i}>{ing}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeNav === "Inventory" ? (
              /* INVENTORY VIEW */
              <div className="p-4 lg:p-8 flex flex-col gap-6">
                <h2 className="text-xl font-bold text-white font-['Inter']">Kitchen Ingredient Stock</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-800 text-zinc-300 font-semibold uppercase">
                      <tr>
                        <th className="p-3">Ingredient</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Stock Level</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-zinc-200">
                      {INITIAL_INVENTORY.map((inv) => (
                        <tr key={inv.id}>
                          <td className="p-3 font-medium text-white">{inv.name}</td>
                          <td className="p-3 text-zinc-400">{inv.category}</td>
                          <td className="p-3 font-bold">{inv.stock} {inv.unit}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inv.status === "LOW_STOCK" ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeNav === "Shift Report" ? (
              /* SHIFT REPORT VIEW */
              <div className="p-4 lg:p-8 flex flex-col gap-6">
                <h2 className="text-xl font-bold text-white font-['Inter']">Daily Kitchen Shift Performance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col gap-1">
                    <span className="text-xs text-zinc-400">Tickets Completed</span>
                    <span className="text-2xl font-bold text-white">{SHIFT_STATS.ticketsCompleted}</span>
                  </div>
                  <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col gap-1">
                    <span className="text-xs text-zinc-400">Avg Prep Time</span>
                    <span className="text-2xl font-bold text-amber-400">{SHIFT_STATS.avgPrepTimeMinutes} mins</span>
                  </div>
                  <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col gap-1">
                    <span className="text-xs text-zinc-400">Flagged Issues</span>
                    <span className="text-2xl font-bold text-red-400">{SHIFT_STATS.flaggedIssuesCount}</span>
                  </div>
                  <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col gap-1">
                    <span className="text-xs text-zinc-400">Efficiency Score</span>
                    <span className="text-2xl font-bold text-emerald-400">{SHIFT_STATS.efficiencyScorePct}%</span>
                  </div>
                </div>
              </div>
            ) : activeNav === "AI Insights" ? (
              /* AI INSIGHTS VIEW */
              <div className="p-4 lg:p-8 flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-bold text-white font-['Inter']">AI Culinary Forecasting & Analytics</h2>
                </div>
                <div className="p-6 bg-gradient-to-br from-zinc-900 to-amber-950/30 border border-amber-500/30 rounded-2xl flex flex-col gap-3">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Predictive Peak Demand Alert</span>
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    Based on historical Friday dinner patterns, Tavonza AI forecasts a 34% surge in Grill Station orders between 7:00 PM - 8:30 PM. We recommend pre-searing 20 burger patties and replenishing brioche bun stock.
                  </p>
                </div>
              </div>
            ) : (
              /* SETTINGS VIEW */
              <div className="p-4 lg:p-8 flex flex-col gap-6">
                <h2 className="text-xl font-bold text-white font-['Inter']">KDS Terminal Configuration</h2>
                <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col gap-4 max-w-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-white block">Audio Order Chimes</span>
                      <span className="text-xs text-zinc-400 block">Play sound when new ticket arrives</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${soundEnabled ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400"}`}
                    >
                      {soundEnabled ? "ENABLED" : "MUTED"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Flag Kitchen Issue Modal */}
        {flagModalOpen && selectedOrderForFlag && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden flex flex-col gap-6 p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-red-500 capitalize font-['Inter']">Flag Kitchen Issue</h3>
                </div>
                <button type="button" onClick={() => setFlagModalOpen(false)} className="text-zinc-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed font-['Inter']">
                Flagging order <span className="text-white font-bold">{selectedOrderForFlag.orderNumber}</span> will notify the assistant manager & floor waiter immediately for resolution.
              </p>

              <div className="flex flex-col gap-2.5">
                {FLAG_REASONS.map((reason) => {
                  const isSelected = selectedFlagReason === reason;
                  return (
                    <div
                      key={reason}
                      onClick={() => setSelectedFlagReason(reason)}
                      className={`w-full p-4 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                        isSelected ? "bg-black border-red-600 text-white" : "bg-black/60 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-red-600 bg-red-600/20" : "border-zinc-600"}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-red-600" />}
                      </div>
                      <span className="text-sm font-medium capitalize font-['Inter']">{reason}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFlagModalOpen(false)}
                  className="px-5 h-11 border border-zinc-700 hover:bg-zinc-800 text-white font-semibold text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitFlagIssue}
                  className="px-6 h-11 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-red-600/20"
                >
                  Dispatch Issue Escalation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
