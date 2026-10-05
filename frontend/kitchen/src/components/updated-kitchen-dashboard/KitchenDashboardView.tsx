"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import AuthGuard from "@/components/auth/AuthGuard";
import { TavonzaLogoIcon } from "../TavonzaLogo";
import KitchenAIModal from "./KitchenAIModal";
import Sidebar, { updatedKitchenNavItems } from "./Sidebar";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  Flame,
  Search,
  Check,
  ChevronDown,
  Volume2,
  VolumeX,
  Bell,
  Bot,
  Sparkles,
  Menu as MenuIcon,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { KITCHEN_STATIONS, INITIAL_INVENTORY, RECIPES, SHIFT_STATS, FLAG_REASONS } from "./data";
import { KitchenOrder, OrderStatus } from "./types";
import { kitchenService, getActiveBranchId } from "@/redux/features/kitchenApi";

export interface KitchenDashboardViewProps {
  initialNav?: string;
}

export default function KitchenDashboardView({ initialNav = "Dashboard" }: KitchenDashboardViewProps) {
  const [activeNav, setActiveNav] = useState<string>(initialNav);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("Grill Station");
  const [activeTabFilter, setActiveTabFilter] = useState<string>("ALL");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [stationDropdownOpen, setStationDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const loadKitchenData = async () => {
      try {
        const branchId = getActiveBranchId();
        const rawOrders = await kitchenService.getOrders(branchId);
        if (mounted && Array.isArray(rawOrders)) {
          const mapped: KitchenOrder[] = rawOrders
            .filter(
              (o: any) =>
                o.status === "ACCEPTED" ||
                o.status === "PREPARING" ||
                o.status === "READY_TO_SERVE"
            )
            .map((o: any) => {
              let status: OrderStatus = "NEW";
              if (o.status === "PREPARING") status = "PREPARING";
              else if (o.status === "READY_TO_SERVE") status = "READY";

              const createdDate = new Date(o.createdAt);
              const elapsed = !isNaN(createdDate.getTime())
                ? Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / 60000))
                : 0;

              return {
                id: o.orderId || o.id,
                orderNumber: o.orderNumber,
                table: o.tableLabel || (o.tableId ? `Table` : "Takeaway"),
                orderType: "DINE_IN",
                waiter: o.waiterName || "Staff Assigned",
                status,
                timeElapsedMinutes: elapsed,
                station: "Grill Station",
                createdAt: o.createdAt,
                items: (o.items || []).map((it: any, idx: number) => ({
                  id: it.id || `item-${idx}`,
                  name: it.name,
                  quantity: it.quantity,
                  options: it.notes ? [it.notes] : [],
                  isCompleted: status === "READY",
                })),
              };
            });
          setOrders(mapped);
        }
      } catch (err) {
        console.error("Failed to load kitchen dashboard orders:", err);
      }
    };
    loadKitchenData();
    const interval = setInterval(loadKitchenData, 7000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Flag Issue Modal State
  const [flagModalOpen, setFlagModalOpen] = useState<boolean>(false);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [selectedOrderForFlag, setSelectedOrderForFlag] = useState<KitchenOrder | null>(null);
  const [selectedFlagReason, setSelectedFlagReason] = useState<string>("Food Quality / Problem");

  // Notifications Popover State
  const [alertsOpen, setAlertsOpen] = useState<boolean>(false);
  const [readyNotification, setReadyNotification] = useState<string | null>(null);

  // Live Real-Time Clock
  const [currentTime, setCurrentTime] = useState<string>("3:50:07 PM");
  const [currentDate, setCurrentDate] = useState<string>("SEP 23,2026");

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
        now
          .toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
          .toUpperCase()
          .replace(" ", " ")
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Audio chime player
  const playChime = (type: "new" | "ready" | "alert") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "new") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      } else if (type === "ready") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
      } else {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.18);
      }

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {}
  };

  // Counters
  const newCount = orders.filter((o) => o.status === "NEW").length;
  const preparingCount = orders.filter((o) => o.status === "PREPARING").length;
  const readyCount = orders.filter((o) => o.status === "READY").length;
  const overdueCount = orders.filter((o) => o.status === "OVERDUE" || !!o.flaggedIssue).length;

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (selectedStation !== "All Stations" && order.station !== selectedStation) {
      return false;
    }
    if (activeTabFilter === "NEW") return order.status === "NEW";
    if (activeTabFilter === "PREPARING") return order.status === "PREPARING";
    if (activeTabFilter === "READY") return order.status === "READY";
    if (activeTabFilter === "OVERDUE") return order.status === "OVERDUE" || !!order.flaggedIssue;
    return true;
  });

  // Action Handlers
  const handleStartPreparing = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "PREPARING" as OrderStatus } : o))
    );
    playChime("new");
    toast.success("Order status updated to Preparing");
  };

  const handleToggleItem = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map((item) =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        );
        const allCompleted = updatedItems.every((i) => i.isCompleted);
        const newStatus: OrderStatus = allCompleted
          ? "READY"
          : order.status === "NEW"
          ? "PREPARING"
          : order.status;

        if (allCompleted && order.status !== "READY") {
          playChime("ready");
          const notif = `Ticket ${order.orderNumber} items completed! Table ${order.table} ready.`;
          setReadyNotification(notif);
          toast.success(notif);
        }

        return {
          ...order,
          items: updatedItems,
          status: newStatus,
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
    playChime("alert");
    toast.error(`Escalated issue for Ticket ${selectedOrderForFlag.orderNumber}: ${selectedFlagReason}`);
    setFlagModalOpen(false);
    setSelectedOrderForFlag(null);
  };

  const handleSimulateOrder = () => {
    const newNum = Math.floor(1520 + Math.random() * 80);
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
          id: `item-1-${Date.now()}`,
          name: "Classic Burger",
          quantity: 1,
          options: ["Medium Well", "No Onions"],
          isCompleted: false,
        },
        {
          id: `item-2-${Date.now()}`,
          name: "Classic Burger",
          quantity: 1,
          options: ["Medium Well", "No Onions"],
          isCompleted: false,
        },
      ],
    };
    setOrders((prev) => [newOrder, ...prev]);
    playChime("new");
    toast.info(`New incoming order ${newOrder.orderNumber} for Table ${newOrder.table}`);
  };

  return (
    <AuthGuard allowedRoles={["KITCHEN"]}>
      <div className="min-h-screen w-full bg-black text-white font-sans flex flex-col selection:bg-yellow-400 selection:text-black overflow-x-hidden relative">
        
        {/* Optional Slide-over Sidebar (hidden by default for pure KDS view) */}
        <Sidebar
          activeNav={activeNav}
          setActiveNav={(tab) => {
            setActiveNav(tab);
            setSidebarOpen(false);
          }}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* TOP NAVIGATION BAR MATCHING USER IMAGE */}
        <header className="w-full bg-black border-b border-zinc-900 px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 z-30 shrink-0">
          
          {/* Left: Tavonza Logo & Branch / Staff Info */}
          <div className="flex items-center gap-4 lg:gap-6">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900 border border-zinc-800"
              title="Open Navigation"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            {/* Tavonza Brand Logo */}
            <div className="flex items-center gap-3">
              <TavonzaLogoIcon className="w-10 h-10 shrink-0" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg leading-tight tracking-tight font-['Inter']">
                  Tavonza
                </span>
                <span className="text-[9px] font-bold text-yellow-400 tracking-widest uppercase">
                  AI HOSPITALITY
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-800 hidden sm:block" />

            {/* Branch & Staff Info */}
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm lg:text-base leading-tight font-['Inter']">
                Branch 4 ( Downtown )
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
                <span className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase">
                  STAFF : MARCO VANCE
                </span>
              </div>
            </div>
          </div>

          {/* Center: Section Selector & 4 Stat Cards */}
          <div className="flex flex-wrap items-center gap-3 lg:gap-4">
            
            {/* Section Dropdown */}
            <div className="flex flex-col relative">
              <span className="text-[10px] text-zinc-400 font-medium mb-0.5">Section</span>
              <button
                type="button"
                onClick={() => setStationDropdownOpen(!stationDropdownOpen)}
                className="h-9 px-3 bg-black border border-yellow-400 rounded-md flex items-center justify-between gap-3 text-xs font-semibold text-white uppercase tracking-wider min-w-[145px] hover:bg-zinc-900 transition cursor-pointer"
              >
                <span>
                  {selectedStation === "Grill Station"
                    ? "GRILL SATION"
                    : selectedStation.toUpperCase()}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              </button>

              {/* Station Dropdown Menu */}
              {stationDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setStationDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1.5 w-52 bg-[#121214] border border-yellow-400/50 rounded-xl shadow-2xl py-1.5 z-50 space-y-0.5">
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

            {/* 4 Metric / Counter Cards */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              
              {/* Card 1: 08 New Orders */}
              <button
                type="button"
                onClick={() => setActiveTabFilter(activeTabFilter === "NEW" ? "ALL" : "NEW")}
                className={`px-4 py-1.5 rounded-xl text-center min-w-[80px] transition cursor-pointer border ${
                  activeTabFilter === "NEW"
                    ? "bg-[#27272a] border-yellow-400"
                    : "bg-[#18181b] border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <span className="text-[#f59e0b] font-bold text-base sm:text-lg leading-tight block">
                  {newCount.toString().padStart(2, "0")}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium block">New Orders</span>
              </button>

              {/* Card 2: 04 Preparing */}
              <button
                type="button"
                onClick={() => setActiveTabFilter(activeTabFilter === "PREPARING" ? "ALL" : "PREPARING")}
                className={`px-4 py-1.5 rounded-xl text-center min-w-[80px] transition cursor-pointer border ${
                  activeTabFilter === "PREPARING"
                    ? "bg-[#27272a] border-yellow-400"
                    : "bg-[#18181b] border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <span className="text-[#f59e0b] font-bold text-base sm:text-lg leading-tight block">
                  {preparingCount.toString().padStart(2, "0")}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium block">Preparing</span>
              </button>

              {/* Card 3: 04 Preparing (Ready to Serve) */}
              <button
                type="button"
                onClick={() => setActiveTabFilter(activeTabFilter === "READY" ? "ALL" : "READY")}
                className={`px-4 py-1.5 rounded-xl text-center min-w-[80px] transition cursor-pointer border ${
                  activeTabFilter === "READY"
                    ? "bg-[#27272a] border-yellow-400"
                    : "bg-[#18181b] border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <span className="text-[#f59e0b] font-bold text-base sm:text-lg leading-tight block">
                  {readyCount.toString().padStart(2, "0")}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium block">Preparing</span>
              </button>

              {/* Card 4: 04 Preparing (Overdue) */}
              <button
                type="button"
                onClick={() => setActiveTabFilter(activeTabFilter === "OVERDUE" ? "ALL" : "OVERDUE")}
                className={`px-4 py-1.5 rounded-xl text-center min-w-[80px] transition cursor-pointer border ${
                  activeTabFilter === "OVERDUE"
                    ? "bg-[#27272a] border-yellow-400"
                    : "bg-[#18181b] border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <span className="text-[#f59e0b] font-bold text-base sm:text-lg leading-tight block">
                  {overdueCount.toString().padStart(2, "0")}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium block">Preparing</span>
              </button>
            </div>

            {/* Quick Simulate Order Button */}
            <button
              type="button"
              onClick={handleSimulateOrder}
              className="h-9 px-2.5 bg-zinc-900 border border-zinc-800 hover:border-yellow-400 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              title="Simulate incoming ticket"
            >
              <Plus className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden xl:inline">Simulate</span>
            </button>
          </div>

          {/* Right: Notification Bell, Speaker, Live Clock & Date */}
          <div className="flex items-center gap-3 lg:gap-4">
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAlertsOpen(!alertsOpen)}
                className="w-10 h-10 rounded-xl bg-[#18181b] border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer relative"
                title="Kitchen Alerts"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-black shadow">
                  02
                </span>
              </button>

              {/* Alerts Dropdown */}
              {alertsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setAlertsOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Kitchen Alerts (2)</span>
                      <button
                        onClick={() => setAlertsOpen(false)}
                        className="text-zinc-500 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200">
                        <span className="font-bold block text-red-400">Order #1524 Overdue</span>
                        Table T-01 burger wait time exceeded 15 mins.
                      </div>
                      <div className="p-2.5 rounded-xl bg-yellow-950/60 border border-yellow-500/40 text-yellow-200">
                        <span className="font-bold block text-yellow-400">Special Request: No Onions</span>
                        Verified for Classic Burger on Grill Station.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Volume Speaker Toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                toast.info(soundEnabled ? "Audio alert chimes muted" : "Audio alert chimes enabled");
              }}
              className="w-10 h-10 rounded-xl bg-[#18181b] border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title={soundEnabled ? "Mute chimes" : "Enable chimes"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-zinc-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            {/* Live Clock & Date */}
            <div className="flex flex-col text-right pl-1">
              <span className="text-white font-bold text-sm lg:text-base tracking-tight font-['Inter']">
                {currentTime}
              </span>
              <span className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
                {currentDate}
              </span>
            </div>
          </div>
        </header>

        {/* READY NOTIFICATION TOAST BANNER */}
        {readyNotification && (
          <div className="w-full bg-emerald-950/90 border-b border-emerald-500/50 px-6 py-2.5 flex items-center justify-between text-xs text-white z-20 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">{readyNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setReadyNotification(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MAIN KDS TICKETS WORKSPACE MATCHING USER SCREENSHOT */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 items-start">
            {filteredOrders.map((order, idx) => {
              const isOverdue = order.status === "OVERDUE" || !!order.flaggedIssue;
              const isPreparing = order.status === "PREPARING";
              const isReady = order.status === "READY";
              const isNew = order.status === "NEW";

              return (
                <div
                  key={order.id}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-2xl transition hover:border-zinc-700 min-h-[360px]"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <span className="text-white text-lg font-bold font-['Inter'] leading-none block">
                          {order.orderNumber}
                        </span>
                        <span className="text-zinc-400 text-xs font-medium block mt-1.5">
                          {order.table} . {order.orderType} . Waiter : {order.waiter}
                        </span>
                      </div>

                      {/* Status Badges Matching Mockup */}
                      {isNew && (
                        <span className="px-3 py-1 bg-[#f59e0b] text-black font-bold rounded-md text-xs tracking-wide shadow-sm">
                          New Order
                        </span>
                      )}
                      {isPreparing && (
                        <span className="px-3 py-1 bg-[#d97706] text-white font-bold rounded-md text-xs tracking-wide shadow-sm">
                          Preparing
                        </span>
                      )}
                      {isOverdue && (
                        <span className="px-3 py-1 bg-[#b91c1c] text-white font-bold rounded-md text-xs tracking-wide shadow-sm">
                          OverDue
                        </span>
                      )}
                      {isReady && (
                        <span className="px-3 py-1 bg-[#15803d] text-white font-bold rounded-md text-xs tracking-wide shadow-sm">
                          Ready
                        </span>
                      )}
                    </div>

                    {/* Flagged Issue Sub-banner if any */}
                    {order.flaggedIssue && (
                      <div className="mb-3 p-2 bg-red-950/80 border border-red-500/40 rounded-lg text-xs text-red-200 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>Issue: {order.flaggedIssue}</span>
                      </div>
                    )}

                    {/* Food Items List */}
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItem(order.id, item.id)}
                          className="bg-[#121214] border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2 cursor-pointer transition hover:border-zinc-700"
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkbox Icon */}
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center transition shrink-0 ${
                                item.isCompleted
                                  ? "bg-emerald-500 border-emerald-500 text-black font-bold"
                                  : "border-zinc-600 bg-zinc-900 hover:border-yellow-400"
                              }`}
                            >
                              {item.isCompleted && (
                                <Check className="w-3 h-3 text-black stroke-[3.5]" />
                              )}
                            </div>

                            {/* Item Name */}
                            <span
                              className={`text-xs font-semibold ${
                                item.isCompleted
                                  ? "text-emerald-400 line-through"
                                  : "text-zinc-100"
                              }`}
                            >
                              {item.quantity}X {item.name}
                            </span>
                          </div>

                          {/* Options Pills (e.g. Medium Well, No Onions) */}
                          {item.options && item.options.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pl-7">
                              {item.options.map((opt, i) => (
                                <span
                                  key={i}
                                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium border ${
                                    item.isCompleted
                                      ? "bg-emerald-950/40 text-emerald-400/80 border-emerald-900/60"
                                      : "bg-[#202024] text-zinc-300 border-zinc-700/50"
                                  }`}
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom Action Button */}
                  <div className="pt-4">
                    {isNew && (
                      <button
                        type="button"
                        onClick={() => handleStartPreparing(order.id)}
                        className="w-full bg-[#facc15] hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition text-sm shadow-md flex items-center justify-center cursor-pointer active:scale-98"
                      >
                        Start Preparing
                      </button>
                    )}

                    {(isPreparing || isOverdue) && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openFlagModal(order)}
                          className="flex-1 bg-[#27272a] hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 border border-zinc-700/50 cursor-pointer active:scale-98"
                        >
                          <AlertTriangle className="w-4 h-4 text-zinc-400" />
                          <span>Flag issue</span>
                        </button>
                        {isPreparing && (
                          <button
                            type="button"
                            onClick={() => {
                              // Mark all items complete
                              order.items.forEach((it) => {
                                if (!it.isCompleted) handleToggleItem(order.id, it.id);
                              });
                            }}
                            className="px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition text-xs cursor-pointer"
                            title="Mark ticket ready"
                          >
                            Ready
                          </button>
                        )}
                      </div>
                    )}

                    {isReady && (
                      <div className="w-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Ready to Serve (Waiter Alerted)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* FLOATING AI ROBOT BUTTON IN BOTTOM CORNER MATCHING USER SPEC */}
        <div className="fixed bottom-8 right-8 z-40">
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="w-14 h-14 rounded-full border-2 border-yellow-400 bg-zinc-900 shadow-[0_0_25px_rgba(250,204,21,0.5)] flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
            title="Ask Tavonza AI Kitchen Co-Pilot"
          >
            {/* Robot Image */}
            <Image
              src="/images/jarvis-robot.jpg"
              alt="Tavonza AI Robot"
              width={56}
              height={56}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {/* Fallback Icon */}
            <Bot className="w-7 h-7 text-yellow-400 absolute" />
            
            {/* Sparkling pulse indicator */}
            <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-pulse" />
          </button>
        </div>

        {/* FLAG ISSUE MODAL */}
        {flagModalOpen && selectedOrderForFlag && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setFlagModalOpen(false)}
          >
            <div
              className="w-full max-w-md bg-[#18181b] border border-red-500/40 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-base">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Flag Ticket {selectedOrderForFlag.orderNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFlagModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-zinc-300 text-xs leading-relaxed">
                Select the operational issue for Table {selectedOrderForFlag.table}. This will notify
                the expediter, floor waiter ({selectedOrderForFlag.waiter}), and manager.
              </p>

              <div className="space-y-2">
                {FLAG_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedFlagReason(reason)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                      selectedFlagReason === reason
                        ? "bg-red-950/70 border-red-500 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    <span>{reason}</span>
                    {selectedFlagReason === reason && <Check className="w-4 h-4 text-red-400" />}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFlagModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitFlagIssue}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/20"
                >
                  Submit & Escalate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KITCHEN AI CO-PILOT MODAL CONNECTED TO AI ENGINE */}
        <KitchenAIModal
          isOpen={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          activeStation={selectedStation}
        />

      </div>
    </AuthGuard>
  );
}
