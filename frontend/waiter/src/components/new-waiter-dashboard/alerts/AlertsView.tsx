'use client';

import React, { useState } from 'react';
import { Bell, Clock, AlertTriangle, CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react';
import BottomDock from '../navigation/BottomDock';
import { useNewWaiterShell } from '../navigation/NewWaiterShellContext';
import { toast } from 'sonner';

interface AlertsViewProps {
  onNavigateTab?: (tab: string) => void;
  isStandaloneRoute?: boolean;
}

interface WaiterAlertItem {
  id: string;
  table: string;
  title: string;
  delayText: string;
  escalatedText: string;
  description: string;
  status: 'active' | 'handled';
  buttonLabel: string;
  buttonColor: 'red' | 'amber';
}

export default function AlertsView({
  onNavigateTab,
  isStandaloneRoute = false,
}: AlertsViewProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'handled'>('active');

  const [alerts, setAlerts] = useState<WaiterAlertItem[]>([
    {
      id: 'alert-1',
      table: 'Table 2',
      title: 'Order Delayed (18 min )',
      delayText: 'Order Delayed',
      escalatedText: 'Escalated ( 5 Mins )',
      description: 'Wild Mushroom Risotto Ticket elapsed 19 min at station 2 without bump.',
      status: 'active',
      buttonLabel: 'Check Status',
      buttonColor: 'red',
    },
    {
      id: 'alert-2',
      table: 'Table 2',
      title: 'Order Delayed (18 min )',
      delayText: 'Order Delayed',
      escalatedText: 'Escalated ( 5 Mins )',
      description: 'Wild Mushroom Risotto Ticket elapsed 19 min at station 2 without bump.',
      status: 'active',
      buttonLabel: 'Acknowledge & send to kitchen',
      buttonColor: 'amber',
    },
    {
      id: 'alert-3',
      table: 'Table 2',
      title: 'Order Delayed (18 min )',
      delayText: 'Order Delayed',
      escalatedText: 'Escalated ( 5 Mins )',
      description: 'Wild Mushroom Risotto Ticket elapsed 19 min at station 2 without bump.',
      status: 'active',
      buttonLabel: 'Escalate to Manager',
      buttonColor: 'red',
    },
    {
      id: 'alert-4',
      table: 'Table 5',
      title: 'Water Refill Requested (6 min)',
      delayText: 'Guest Request',
      escalatedText: 'Priority (High)',
      description: 'Customer at Table 5 requested sparkling water with lemon slices.',
      status: 'active',
      buttonLabel: 'Acknowledge & send to kitchen',
      buttonColor: 'amber',
    },
  ]);

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const handledAlerts = alerts.filter((a) => a.status === 'handled');

  const handleAlertAction = (alertId: string, actionLabel: string, table: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'handled' } : a))
    );
    toast.success(`Action: "${actionLabel}" completed for ${table}!`, {
      description: 'Moved to Handled Today tab.',
    });
  };

  const { inShell } = useNewWaiterShell();

  const alertsContent = (
    <div className="flex flex-col gap-4 pb-6 animate-fadeIn">
      {/* Header Banner: Live Waiter Alerts */}
      <div className="w-full px-5 pt-4 pb-5 bg-gradient-to-b from-neutral-900 to-neutral-900/30 border-b border-white/5 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-white text-base font-semibold font-['Inter'] leading-5">
                  Live Waiter Alerts
                </h1>
                <div className="px-2 py-0.5 bg-red-600/10 rounded-[5px] border border-red-500/20">
                  <span className="text-red-500 text-[10px] font-medium font-['Inter']">
                    {activeAlerts.length} Active
                  </span>
                </div>
              </div>
              <span className="text-slate-500 text-xs font-normal font-['Inter'] leading-4">
                Glanceable Floor Notifications
              </span>
            </div>

            {/* Notification Bell Badge Button */}
            <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center relative border border-white/10 shadow-sm">
              <Bell className="w-5 h-5 text-white" />
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center absolute -top-1 -right-1 text-white text-[9px] font-bold">
                {activeAlerts.length}
              </div>
            </div>
          </div>

          {/* Segmented Control Tabs matching Figma */}
          <div className="px-5 pt-4 pb-2">
            <div className="w-full flex items-center select-none">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 h-9 px-3 rounded-tl-lg rounded-bl-lg text-xs font-medium font-['Inter'] flex items-center justify-center transition cursor-pointer border-t border-b border-l border-white/10 ${
                  activeTab === 'active'
                    ? 'bg-yellow-400 text-black font-semibold shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                Active Alerts ( {activeAlerts.length} )
              </button>
              <button
                onClick={() => setActiveTab('handled')}
                className={`flex-1 h-9 px-3 rounded-tr-lg rounded-br-lg text-xs font-medium font-['Inter'] flex items-center justify-center transition cursor-pointer border-t border-b border-r border-white/10 ${
                  activeTab === 'handled'
                    ? 'bg-yellow-400 text-black font-semibold shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                Handled Today ( {handledAlerts.length} )
              </button>
            </div>
          </div>

          {/* Alert Cards List */}
          <div className="px-5 pt-2 flex flex-col gap-4">
            {activeTab === 'active' && activeAlerts.length === 0 && (
              <div className="p-8 text-center bg-neutral-900/50 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <h3 className="text-white text-sm font-semibold">All Caught Up!</h3>
                <p className="text-zinc-500 text-xs">No active alerts requiring floor attention.</p>
              </div>
            )}

            {activeTab === 'active' &&
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="w-full p-3.5 bg-zinc-900 rounded-[12px] outline outline-1 outline-offset-[-1px] outline-white/20 flex flex-col gap-3 shadow-lg shadow-black/40 hover:outline-white/40 transition"
                >
                  {/* Card Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-10 bg-slate-500/20 rounded-[6px] flex items-center justify-center shrink-0 border border-slate-500/30">
                      <span className="text-amber-400 text-sm font-semibold font-['Inter'] leading-5">
                        {alert.table}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-white text-sm font-semibold font-['Inter'] leading-5">
                        {alert.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-0.5 bg-red-500/10 rounded-[5px] outline outline-[0.50px] outline-red-500/30">
                          <span className="text-red-400 text-[10px] font-normal font-['Inter']">
                            {alert.delayText}
                          </span>
                        </div>
                        <span className="text-red-400 text-[10px] font-normal font-['Inter']">
                          {alert.escalatedText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="w-full p-2.5 bg-neutral-800/40 rounded-[6px] outline outline-1 outline-offset-[-1px] outline-zinc-800">
                    <p className="text-neutral-300 text-xs font-normal font-['Poppins'] leading-4">
                      {alert.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleAlertAction(alert.id, alert.buttonLabel, alert.table)}
                    className={`w-full h-10 rounded-[10px] text-white text-sm font-semibold font-['Inter'] flex items-center justify-center transition cursor-pointer shadow-md active:scale-[0.99] ${
                      alert.buttonColor === 'red'
                        ? 'bg-red-500 hover:bg-red-400 shadow-red-500/20'
                        : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20'
                    }`}
                  >
                    {alert.buttonLabel}
                  </button>
                </div>
              ))}

            {/* Handled Alerts List */}
            {activeTab === 'handled' && (
              <div className="flex flex-col gap-3">
                {handledAlerts.length === 0 ? (
                  <div className="p-8 text-center bg-neutral-900/50 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                    <Clock className="w-8 h-8 text-neutral-600" />
                    <h3 className="text-white text-sm font-semibold">No Handled Alerts Yet</h3>
                    <p className="text-zinc-500 text-xs">Resolved alerts during today’s shift will show here.</p>
                  </div>
                ) : (
                  handledAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="w-full p-3 bg-neutral-900/60 rounded-xl border border-white/5 flex items-center justify-between opacity-80"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-xs font-semibold">{alert.table}</span>
                          <span className="text-emerald-400 text-[10px]">✓ Resolved</span>
                        </div>
                        <span className="text-zinc-400 text-xs">{alert.title}</span>
                      </div>
                      <span className="text-zinc-500 text-[11px]">Just now</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
  );

  if (inShell) {
    return alertsContent;
  }

  return (
    <div className="w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 font-sans selection:bg-amber-400 selection:text-black">
      <div className="w-full max-w-[420px] min-h-screen sm:min-h-[868px] sm:max-h-[94vh] sm:rounded-[36px] bg-black relative flex flex-col justify-between overflow-hidden sm:border sm:border-white/10 sm:shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        <div className="flex-1 overflow-y-auto pb-28 custom-scrollbar relative">
          {alertsContent}
        </div>
        <BottomDock
          activeTab="alert"
          onNavigateTab={onNavigateTab}
          showFloorLabel={true}
        />
      </div>
    </div>
  );
}
