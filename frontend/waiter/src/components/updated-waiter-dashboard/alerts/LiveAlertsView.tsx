'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  BellRing,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Flame,
  Users,
  ShieldAlert,
  Send,
  Plus,
} from 'lucide-react';

export interface FloorAlert {
  id: string;
  tableNumber: number;
  tableName: string;
  title: string;
  badgeLabel: string;
  escalatedText?: string;
  timeAgo: string;
  description: string;
  type: 'delayed' | 'attention' | 'bill' | 'allergy';
  severity: 'critical' | 'warning' | 'normal';
  status: 'active' | 'handled';
  orderId?: string;
  station?: string;
}

const initialAlerts: FloorAlert[] = [
  {
    id: 'alt-1',
    tableNumber: 3,
    tableName: 'Table 3',
    title: 'Order Delayed ( 18 mins )',
    badgeLabel: 'Order Delayed',
    escalatedText: 'Escalated ( 5 Mins )',
    timeAgo: '06 min ago',
    description: 'Wild Mushroom Risotto Ticket elapsed 19 min at station 2 without bump.',
    type: 'delayed',
    severity: 'critical',
    status: 'active',
    orderId: '#TAV-2192',
    station: 'Station 2 (Grill)',
  },
  {
    id: 'alt-2',
    tableNumber: 12,
    tableName: 'Table 12',
    title: 'Chef Allergen Clarification Needed',
    badgeLabel: 'Allergen Hold',
    escalatedText: 'Priority ( 3 Mins )',
    timeAgo: '04 min ago',
    description: 'Guest requested strict gluten-free preparation on Ribeye jus reduction.',
    type: 'allergy',
    severity: 'critical',
    status: 'active',
    orderId: '#TAV-2190',
    station: 'Executive Sous Chef',
  },
  {
    id: 'alt-3',
    tableNumber: 7,
    tableName: 'Table 7',
    title: 'Guest Service Call · Water Refill & Silverware',
    badgeLabel: 'Floor Call',
    timeAgo: '02 min ago',
    description: 'Tavonza Sensor detected empty sparkling water carafe at seat 3 & 4.',
    type: 'attention',
    severity: 'warning',
    status: 'active',
    station: 'Dining Floor Zone B',
  },
  {
    id: 'alt-4',
    tableNumber: 5,
    tableName: 'Table 5',
    title: 'Guest Requesting Check / Split Bill',
    badgeLabel: 'Bill Ready',
    timeAgo: '01 min ago',
    description: 'Guests completed dessert course. Requesting handoff bill terminal.',
    type: 'bill',
    severity: 'normal',
    status: 'active',
    orderId: '#TAV-2184',
    station: 'Cashier / Waiter',
  },
  // Handled items
  {
    id: 'alt-5',
    tableNumber: 2,
    tableName: 'Table 2',
    title: 'Dietary Pairing Recommendation Delivered',
    badgeLabel: 'Handled',
    timeAgo: '28 min ago',
    description: 'AI Sommelier wine pairing dispatched to Table 2 (Barolo 2018).',
    type: 'attention',
    severity: 'normal',
    status: 'handled',
  },
  {
    id: 'alt-6',
    tableNumber: 9,
    tableName: 'Table 9',
    title: 'Extra Truffle Sauce Delivered',
    badgeLabel: 'Handled',
    timeAgo: '45 min ago',
    description: 'Special ramekin delivered to Table 9 guests.',
    type: 'attention',
    severity: 'normal',
    status: 'handled',
  },
];

interface LiveAlertsViewProps {
  onShowToast?: (msg: string) => void;
  onNavigateToOrderStatus?: (orderId?: string) => void;
  onNavigateToFloor?: () => void;
  onNavigateToCheckout?: (orderId?: string, tableNum?: number) => void;
}

export default function LiveAlertsView({
  onShowToast,
  onNavigateToOrderStatus,
  onNavigateToCheckout,
}: LiveAlertsViewProps) {
  const [alerts, setAlerts] = useState<FloorAlert[]>(initialAlerts);
  const [activeTab, setActiveTab] = useState<'active' | 'handled'>('active');

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const handledAlerts = alerts.filter((a) => a.status === 'handled');

  const handleSimulateAlert = () => {
    const tableChoices = [4, 8, 10, 11];
    const chosenTable = tableChoices[Math.floor(Math.random() * tableChoices.length)] ?? 4;
    const newAlert: FloorAlert = {
      id: `alt-sim-${Date.now()}`,
      tableNumber: chosenTable,
      tableName: `Table ${chosenTable}`,
      title: 'Bar BDS Bump Overdue (8 mins)',
      badgeLabel: 'Bar Alert',
      escalatedText: 'Escalated ( 2 Mins )',
      timeAgo: 'Just now',
      description: `Cocktail ticket elapsed 8 min at Bar Station without bump. Hostess notified.`,
      type: 'delayed',
      severity: 'warning',
      status: 'active',
      station: 'Bar Station',
    };
    setAlerts((prev) => [newAlert, ...prev]);
    onShowToast?.(`Simulated incoming live alert created for Table ${chosenTable}!`);
  };

  const handleResolveAlert = (alertId: string, alertTitle: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'handled' as const } : a))
    );
    onShowToast?.(`Resolved alert: "${alertTitle}". Moved to Handled Today.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Box (From Figma) */}
      <div className="w-full bg-zinc-900 rounded-[10px] p-5 sm:p-6 border border-zinc-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-white text-2xl sm:text-3xl font-semibold font-['Inter'] leading-tight">
              Live Waiter Alerts
            </h1>
            {/* 4 Active Pill (From Figma) */}
            <div className="px-2.5 py-1 bg-amber-500/20 rounded-[5px] border border-neutral-700 flex items-center justify-center">
              <span className="text-amber-500 text-xs font-medium font-['DM_Sans']">
                {activeAlerts.length} Active
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm font-normal font-['Inter'] mt-1.5 leading-relaxed">
            Glanceable Floor Notifications · Actionable in 1 tap
          </p>
        </div>

        {/* Simulate Incoming Alert Action (From Figma) */}
        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <button
            onClick={handleSimulateAlert}
            className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 border border-neutral-700 hover:border-green-500/50 rounded-sm text-xs font-normal font-['Inter'] flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Simulate incoming Alert</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs (From Figma: Active Alerts (4) vs Handled Today (2)) */}
      <div className="flex items-center">
        <div className="h-9 inline-flex rounded-lg overflow-hidden border border-white/20 bg-black">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-normal font-['Inter'] transition-all flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-yellow-500 text-black font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <span>Active Alerts ( {activeAlerts.length} )</span>
          </button>
          <button
            onClick={() => setActiveTab('handled')}
            className={`px-4 py-2 text-sm font-normal font-['Inter'] transition-all flex items-center gap-2 ${
              activeTab === 'handled'
                ? 'bg-yellow-500 text-black font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <span>Handled Today ( {handledAlerts.length} )</span>
          </button>
        </div>
      </div>

      {/* Alert Cards Stream */}
      <div className="space-y-4">
        {(activeTab === 'active' ? activeAlerts : handledAlerts).map((alert) => {
          return (
            <div
              key={alert.id}
              className="w-full bg-black rounded-[10px] border border-neutral-600 p-5 shadow-lg relative overflow-hidden transition-all hover:border-neutral-400"
            >
              {/* Header Info Row (From Figma) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Table Badge */}
                  <div className="px-3.5 py-1.5 bg-slate-500/20 rounded-[5px] flex items-center justify-center">
                    <span className="text-amber-500 text-sm font-semibold font-['Inter']">
                      {alert.tableName}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="text-white text-base font-medium font-['Inter'] leading-tight">
                    {alert.title}
                  </div>

                  {/* Category / Badge */}
                  <div
                    className={`px-2.5 py-1 rounded-[5px] border text-xs font-medium font-['DM_Sans'] ${
                      alert.severity === 'critical'
                        ? 'bg-red-500/10 border-neutral-700 text-red-400'
                        : alert.severity === 'warning'
                        ? 'bg-amber-500/10 border-neutral-700 text-amber-400'
                        : 'bg-zinc-800 border-neutral-700 text-zinc-300'
                    }`}
                  >
                    {alert.badgeLabel}
                  </div>

                  {/* Escalation Tag (From Figma: Escalated ( 5 Mins )) */}
                  {alert.escalatedText && (
                    <span className="text-red-500 text-xs font-medium font-['DM_Sans']">
                      {alert.escalatedText}
                    </span>
                  )}
                </div>

                {/* Time Ago (From Figma: 06 min ago with red alert indicator) */}
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 ${
                      alert.severity === 'critical'
                        ? 'text-red-500 animate-pulse'
                        : 'text-amber-500'
                    }`}
                  />
                  <span
                    className={`text-sm sm:text-base font-semibold font-['Inter'] ${
                      alert.severity === 'critical' ? 'text-red-500' : 'text-amber-400'
                    }`}
                  >
                    {alert.timeAgo}
                  </span>
                </div>
              </div>

              {/* Divider (From Figma: outline-neutral-800) */}
              <div className="w-full h-px bg-neutral-800 my-2" />

              {/* Description Box (From Figma) */}
              <div className="w-full bg-zinc-950 rounded-[5px] border border-neutral-800 p-3 my-3 flex items-center justify-between">
                <div className="text-white text-xs font-normal font-['Poppins'] leading-relaxed">
                  {alert.description}
                </div>
                {alert.station && (
                  <span className="text-[10px] text-zinc-500 font-mono hidden md:inline ml-3 shrink-0">
                    Station: {alert.station}
                  </span>
                )}
              </div>

              {/* Bottom Action Button (From Figma: Check Status amber button) */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                {alert.status === 'active' ? (
                  <>
                    <button
                      onClick={() => {
                        if (alert.type === 'delayed') {
                          onNavigateToOrderStatus?.(alert.orderId);
                        } else if (alert.type === 'bill') {
                          onNavigateToCheckout?.(alert.orderId, alert.tableNumber);
                        } else {
                          onNavigateToOrderStatus?.();
                        }
                      }}
                      className="w-full sm:flex-1 h-9 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] rounded-[5px] text-black text-sm font-semibold font-['DM_Sans'] flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Check Status &amp; Expedite</span>
                      <ChevronRight className="w-4 h-4 text-black" />
                    </button>

                    <button
                      onClick={() => handleResolveAlert(alert.id, alert.title)}
                      className="w-full sm:w-auto px-4 h-9 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-neutral-700 rounded-[5px] text-xs font-medium transition-colors"
                    >
                      Mark Handled
                    </button>
                  </>
                ) : (
                  <div className="w-full h-8 bg-zinc-900 rounded-[5px] text-emerald-400 text-xs font-medium flex items-center justify-center gap-2 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Alert Resolved · Station Synchronized</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {(activeTab === 'active' ? activeAlerts : handledAlerts).length === 0 && (
          <div className="text-center py-12 bg-zinc-950 rounded-xl border border-zinc-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
            <div className="text-white text-sm font-medium">No alerts in this category</div>
            <div className="text-zinc-500 text-xs mt-1">
              Floor operations and table tickets are running smoothly.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
