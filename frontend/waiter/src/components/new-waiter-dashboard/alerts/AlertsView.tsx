'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  RefreshCw,
  Plus,
  X,
  PhoneCall,
  Receipt,
  HelpCircle,
  MessageSquare,
  Check,
  CheckCheck,
} from 'lucide-react';
import BottomDock from '../navigation/BottomDock';
import { useNewWaiterShell } from '../navigation/NewWaiterShellContext';
import { toast } from 'sonner';
import { waiterService, CustomerAlert } from '@/redux/features/waiterApi';
import { getCookie } from '@/redux/api/baseApi';

interface AlertsViewProps {
  onNavigateTab?: (tab: string) => void;
  isStandaloneRoute?: boolean;
}

export default function AlertsView({
  onNavigateTab,
  isStandaloneRoute = false,
}: AlertsViewProps) {
  const { inShell } = useNewWaiterShell();
  const [activeTab, setActiveTab] = useState<'active' | 'handled'>('active');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  const [alerts, setAlerts] = useState<CustomerAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});

  // Trigger Alert Modal State (NEW FEATURE)
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [simTable, setSimTable] = useState<string>('Table 2');
  const [simType, setSimType] = useState<'call_waiter' | 'request_bill' | 'need_help' | 'custom'>('call_waiter');
  const [simMessage, setSimMessage] = useState<string>('');
  const [isSubmittingAlert, setIsSubmittingAlert] = useState<boolean>(false);

  const getBranchId = useCallback((): string => {
    const rawBranchId = getCookie('tavonza_branch_id');
    if (rawBranchId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawBranchId)) {
      return rawBranchId;
    }
    return 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';
  }, []);

  // Fetch Alerts from Backend API GET /waiter/alerts?branchId=...
  const loadAlerts = useCallback(async (showIndicator = true) => {
    if (showIndicator) setRefreshing(true);
    try {
      const branchId = getBranchId();
      const apiAlerts = await waiterService.getMyAlerts(branchId);
      if (Array.isArray(apiAlerts)) {
        setAlerts(apiAlerts);
      }
    } catch (err: any) {
      console.warn('Failed to load waiter alerts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getBranchId]);

  useEffect(() => {
    loadAlerts(false);
    const interval = setInterval(() => {
      loadAlerts(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  // Acknowledge Alert (PATCH /waiter/alerts/:id/acknowledge)
  const handleAcknowledgeAlert = async (alertId: string, tableNum: string) => {
    setActionInProgress((prev) => ({ ...prev, [alertId]: true }));
    try {
      await waiterService.ackAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'acknowledged' } : a))
      );
      toast.success(`Alert acknowledged for ${tableNum}!`, {
        description: 'Status updated to Acknowledged.',
      });
    } catch (err: any) {
      toast.error(`Failed to acknowledge alert: ${err.message || 'Error occurred'}`);
    } finally {
      setActionInProgress((prev) => ({ ...prev, [alertId]: false }));
    }
  };

  // Resolve Alert (PATCH /waiter/alerts/:id/resolve)
  const handleResolveAlert = async (alertId: string, tableNum: string) => {
    setActionInProgress((prev) => ({ ...prev, [alertId]: true }));
    try {
      await waiterService.resolveAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' } : a))
      );
      toast.success(`Alert resolved for ${tableNum}!`, {
        description: 'Moved to Handled Today tab.',
      });
    } catch (err: any) {
      toast.error(`Failed to resolve alert: ${err.message || 'Error occurred'}`);
    } finally {
      setActionInProgress((prev) => ({ ...prev, [alertId]: false }));
    }
  };

  // NEW FEATURE: Send Customer Alert Simulation (POST /alerts)
  const handleCreateCustomerAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAlert(true);
    try {
      const branchId = getBranchId();
      await waiterService.createAlert({
        branchId,
        tableId: '34489e98-b165-4f29-bc3e-38be762dedb3',
        tableSessionId: '7f9a8b6c-1d2e-3f4a-5b6c-7d8e9f0a1b2c',
        type: simType,
        message: simMessage.trim() || `Customer alert triggered from ${simTable}`,
      });
      toast.success(`Alert generated for ${simTable}!`, {
        description: 'New live alert sent to waiter station dashboard.',
      });
      setShowSimulateModal(false);
      setSimMessage('');
      loadAlerts(true);
    } catch (err: any) {
      toast.error(`Failed to create alert: ${err.message || 'Error occurred'}`);
    } finally {
      setIsSubmittingAlert(false);
    }
  };

  // Filter alerts by active vs handled and type filter
  const activeAlerts = alerts.filter((a) => a.status === 'pending' || a.status === 'acknowledged');
  const handledAlerts = alerts.filter((a) => a.status === 'resolved');

  const filteredActiveAlerts = activeAlerts.filter((a) => {
    if (selectedTypeFilter === 'all') return true;
    return a.type === selectedTypeFilter;
  });

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'call_waiter':
        return { label: 'Call Waiter', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: PhoneCall };
      case 'request_bill':
        return { label: 'Bill Request', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: Receipt };
      case 'need_help':
        return { label: 'Urgent Help', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: HelpCircle };
      default:
        return { label: 'Custom Alert', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: MessageSquare };
    }
  };

  const alertsContent = (
    <div className="flex flex-col gap-4 pb-6 animate-fadeIn min-h-[500px]">
      {/* Header Banner */}
      <div className="w-full px-5 pt-4 pb-5 bg-gradient-to-b from-neutral-900 to-neutral-900/30 border-b border-white/5 flex justify-between items-center gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
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
            Floor Call Notifications & Customer Requests
          </span>
        </div>

        {/* Action Buttons: Refresh & Simulate New Alert */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadAlerts(true)}
            disabled={refreshing}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg border border-white/10 transition cursor-pointer disabled:opacity-50"
            title="Refresh Alerts"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-yellow-400' : ''}`} />
          </button>
          <button
            onClick={() => setShowSimulateModal(true)}
            className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-md active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Call</span>
          </button>
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="px-5 pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'call_waiter', label: 'Call Waiter' },
          { id: 'request_bill', label: 'Request Bill' },
          { id: 'need_help', label: 'Need Help' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedTypeFilter(filter.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer border ${
              selectedTypeFilter === filter.id
                ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Segmented Control Tabs */}
      <div className="px-5 pt-2">
        <div className="w-full flex items-center select-none">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 h-9 px-3 rounded-tl-lg rounded-bl-lg text-xs font-medium font-['Inter'] flex items-center justify-center transition cursor-pointer border-t border-b border-l border-white/10 ${
              activeTab === 'active'
                ? 'bg-yellow-400 text-black font-semibold shadow-sm'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            Active Alerts ({activeAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('handled')}
            className={`flex-1 h-9 px-3 rounded-tr-lg rounded-br-lg text-xs font-medium font-['Inter'] flex items-center justify-center transition cursor-pointer border-t border-b border-r border-white/10 ${
              activeTab === 'handled'
                ? 'bg-yellow-400 text-black font-semibold shadow-sm'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            Handled Today ({handledAlerts.length})
          </button>
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="px-5 pt-2 flex flex-col gap-4">
        {loading ? (
          <div className="p-8 text-center bg-neutral-900/50 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
            <span className="text-zinc-400 text-xs">Loading live floor alerts...</span>
          </div>
        ) : activeTab === 'active' && filteredActiveAlerts.length === 0 ? (
          <div className="p-8 text-center bg-neutral-900/50 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <h3 className="text-white text-sm font-semibold">All Caught Up!</h3>
            <p className="text-zinc-500 text-xs">No active alerts requiring floor attention.</p>
          </div>
        ) : activeTab === 'active' ? (
          filteredActiveAlerts.map((alert) => {
            const badge = getAlertBadge(alert.type);
            const Icon = badge.icon;
            const isAck = alert.status === 'acknowledged';
            const isBusy = actionInProgress[alert.id];

            return (
              <div
                key={alert.id}
                className={`w-full p-4 bg-zinc-900 rounded-[12px] border transition flex flex-col gap-3 shadow-lg shadow-black/40 ${
                  isAck
                    ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-zinc-900'
                    : 'border-red-500/40 bg-gradient-to-b from-red-500/5 to-zinc-900'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                      <span className="text-amber-400 text-sm font-bold font-mono">
                        {alert.tableNumber || 'Table'}
                      </span>
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold flex items-center gap-1.5 ${badge.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  <span className="text-zinc-500 text-[10px] font-mono">
                    {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                </div>

                {/* Message Box */}
                <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                  <p className="text-zinc-200 text-xs font-medium leading-relaxed">
                    {alert.message || `Customer at ${alert.tableNumber || 'Table'} requested assistance.`}
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {!isAck ? (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id, alert.tableNumber || 'Table')}
                      disabled={isBusy}
                      className="flex-1 h-9 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isBusy ? 'Saving...' : 'Acknowledge Alert'}</span>
                    </button>
                  ) : (
                    <div className="flex-1 px-3 py-1.5 bg-amber-400/10 border border-amber-400/30 rounded-lg text-amber-400 text-xs font-semibold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Acknowledged by You</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleResolveAlert(alert.id, alert.tableNumber || 'Table')}
                    disabled={isBusy}
                    className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>{isBusy ? 'Saving...' : 'Mark Resolved'}</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          /* Handled Alerts List */
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
                  className="w-full p-3.5 bg-neutral-900/60 rounded-xl border border-white/5 flex items-center justify-between opacity-80"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-bold font-mono">{alert.tableNumber || 'Table'}</span>
                      <span className="text-emerald-400 text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        ✓ Resolved
                      </span>
                    </div>
                    <span className="text-zinc-300 text-xs">{alert.message || alert.type}</span>
                  </div>
                  <span className="text-zinc-500 text-[10px] font-mono">
                    {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Done'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* NEW FEATURE MODAL: Trigger Test Customer Alert (POST /alerts) */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-white/10 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-yellow-400" />
                <h3 className="text-white text-base font-semibold">Simulate Customer Alert</h3>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerAlert} className="space-y-3">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold mb-1">Target Table</label>
                <select
                  value={simTable}
                  onChange={(e) => setSimTable(e.target.value)}
                  className="w-full h-10 px-3 bg-black/60 border border-white/10 rounded-lg text-white text-xs font-mono focus:border-yellow-400 focus:outline-none"
                >
                  <option value="Table 1">Table 1</option>
                  <option value="Table 2">Table 2</option>
                  <option value="Table 3">Table 3</option>
                  <option value="Table 4">Table 4</option>
                  <option value="Table 5">Table 5</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold mb-1">Alert Type</label>
                <select
                  value={simType}
                  onChange={(e) => setSimType(e.target.value as any)}
                  className="w-full h-10 px-3 bg-black/60 border border-white/10 rounded-lg text-white text-xs font-mono focus:border-yellow-400 focus:outline-none"
                >
                  <option value="call_waiter">Call Waiter</option>
                  <option value="request_bill">Request Bill</option>
                  <option value="need_help">Need Help / Urgent</option>
                  <option value="custom">Custom Message</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold mb-1">Custom Message / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Bring extra napkins & cutlery"
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="w-full h-10 px-3 bg-black/60 border border-white/10 rounded-lg text-white text-xs focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="flex-1 h-10 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAlert}
                  className="flex-1 h-10 bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isSubmittingAlert ? 'Triggering...' : 'Send Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
