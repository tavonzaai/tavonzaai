'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Clock, CheckCircle2, AlertTriangle, Users, RefreshCw } from 'lucide-react';
import { DataTable, ColumnDef, LoadingState, EmptyState } from '../common';
import { kitchenService, getActiveBranchId } from '@/redux/features/kitchenApi';

interface ShiftRecord {
  id: string;
  staffName: string;
  role: string;
  station: string;
  startTime: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export default function KitchenShiftReportView({ onBack }: { onBack: () => void }) {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    completedTickets: 0,
    avgPrepTimeMinutes: 0,
    flaggedIssuesCount: 0,
  });

  const loadShifts = async () => {
    setIsLoading(true);
    try {
      const branchId = getActiveBranchId();
      const [rawShifts, analytics, rawOrders] = await Promise.all([
        kitchenService.getShifts(branchId).catch(() => []),
        kitchenService.getKitchenDashboardAnalytics(branchId).catch(() => null),
        kitchenService.getOrders(branchId).catch(() => []),
      ]);

      if (Array.isArray(rawShifts) && rawShifts.length > 0) {
        const mapped: ShiftRecord[] = rawShifts.map((s: any, idx: number) => ({
          id: s.id || `shift-${idx}`,
          staffName: s.staffName || s.user?.name || s.name || 'Staff Member',
          role: s.role || 'Kitchen Staff',
          station: s.station || '',
          startTime: s.startTime
            ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          status: s.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE',
        }));
        setShifts(mapped);
      } else {
        setShifts([]);
      }

      const ordersList = Array.isArray(rawOrders) ? rawOrders : [];
      const readyOrders = ordersList.filter((o: any) => o.status === 'READY' || o.status === 'READY_TO_SERVE');
      const flaggedOrders = ordersList.filter((o: any) => !!o.flaggedIssue);
      const avgPrep = ordersList.length > 0
        ? Math.round(ordersList.reduce((acc: number, o: any) => acc + (Number(o.estimatedPrepTime) || 0), 0) / ordersList.length)
        : 0;

      setStats({
        completedTickets: analytics?.readyOrders ?? readyOrders.length,
        avgPrepTimeMinutes: avgPrep,
        flaggedIssuesCount: flaggedOrders.length,
      });
    } catch {
      setShifts([]);
      setStats({
        completedTickets: 0,
        avgPrepTimeMinutes: 0,
        flaggedIssuesCount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const columns: ColumnDef<ShiftRecord>[] = [
    {
      key: 'staffName',
      header: 'Crew Member',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-white block">{item.staffName}</span>
          <span className="text-[11px] text-zinc-500">{item.role}</span>
        </div>
      ),
    },
    {
      key: 'station',
      header: 'Assigned Station',
      render: (item) => <span className="text-zinc-200">{item.station || '—'}</span>,
    },
    {
      key: 'startTime',
      header: 'Clock In',
      render: (item) => <span className="text-zinc-300 font-mono text-xs">{item.startTime || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Shift Status',
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
            item.status === 'ACTIVE'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
          {item.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-yellow-400" />
            Kitchen Shift Report
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Current shift throughput, active kitchen staff, and ticket resolution statistics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadShifts}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-750 text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
          >
            Back to Queue
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#18181b] border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Completed Tickets</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white block">{stats.completedTickets}</span>
          <span className="text-[11px] text-zinc-400 font-medium">Ready to serve</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Avg. Prep Time</span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <span className="text-2xl font-bold text-white block">
            {stats.avgPrepTimeMinutes > 0 ? `${stats.avgPrepTimeMinutes}m` : '—'}
          </span>
          <span className="text-[11px] text-zinc-400">Target: &lt; 15 mins</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Flagged Issues</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-bold text-white block">{stats.flaggedIssuesCount}</span>
          <span className="text-[11px] text-zinc-400 font-medium">Needs attention</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Active Crew</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-white block">{shifts.length}</span>
          <span className="text-[11px] text-zinc-400">Clocked in staff</span>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading shift details..." />
      ) : (
        <DataTable
          data={shifts}
          columns={columns}
          emptyState={
            <EmptyState
              icon={<Users className="w-6 h-6 text-zinc-500" />}
              title="No active shifts"
              description="No crew members are currently clocked in."
            />
          }
        />
      )}
    </div>
  );
}
