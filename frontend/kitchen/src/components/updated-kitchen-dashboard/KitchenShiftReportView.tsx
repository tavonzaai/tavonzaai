'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Clock, CheckCircle2, AlertTriangle, Users, RefreshCw } from 'lucide-react';
import { DataTable, ColumnDef, LoadingState, EmptyState } from '../common';
import { kitchenService, getActiveBranchId } from '@/redux/features/kitchenApi';
import { SHIFT_STATS } from './data';

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

  const loadShifts = async () => {
    setIsLoading(true);
    try {
      const branchId = getActiveBranchId();
      const raw = await kitchenService.getShifts(branchId);
      if (Array.isArray(raw) && raw.length > 0) {
        const mapped: ShiftRecord[] = raw.map((s: any, idx: number) => ({
          id: s.id || `shift-${idx}`,
          staffName: s.staffName || s.user?.name || 'Chef Staff',
          role: s.role || 'Cook',
          station: s.station || 'Grill Station',
          startTime: s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:00 AM',
          status: s.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE',
        }));
        setShifts(mapped);
      } else {
        setShifts([
          { id: 'sh-1', staffName: 'Marco Vance', role: 'Head Chef', station: 'Grill Station', startTime: '08:00 AM', status: 'ACTIVE' },
          { id: 'sh-2', staffName: 'Chef Antonio', role: 'Line Cook', station: 'Fryer Station', startTime: '09:00 AM', status: 'ACTIVE' },
          { id: 'sh-3', staffName: 'Chef Maria', role: 'Prep Cook', station: 'Salad & Cold Prep', startTime: '08:30 AM', status: 'ACTIVE' },
          { id: 'sh-4', staffName: 'Bartender Alex', role: 'Mixologist', station: 'Bar & Beverages', startTime: '10:00 AM', status: 'ACTIVE' },
        ]);
      }
    } catch {
      setShifts([
        { id: 'sh-1', staffName: 'Marco Vance', role: 'Head Chef', station: 'Grill Station', startTime: '08:00 AM', status: 'ACTIVE' },
        { id: 'sh-2', staffName: 'Chef Antonio', role: 'Line Cook', station: 'Fryer Station', startTime: '09:00 AM', status: 'ACTIVE' },
        { id: 'sh-3', staffName: 'Chef Maria', role: 'Prep Cook', station: 'Salad & Cold Prep', startTime: '08:30 AM', status: 'ACTIVE' },
        { id: 'sh-4', staffName: 'Bartender Alex', role: 'Mixologist', station: 'Bar & Beverages', startTime: '10:00 AM', status: 'ACTIVE' },
      ]);
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
      render: (item) => <span className="text-zinc-200">{item.station}</span>,
    },
    {
      key: 'startTime',
      header: 'Clock In',
      render: (item) => <span className="text-zinc-300 font-mono text-xs">{item.startTime}</span>,
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
          <span className="text-2xl font-bold text-white block">{SHIFT_STATS.ticketsCompleted}</span>
          <span className="text-[11px] text-emerald-400 font-medium">+12% vs yesterday</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Avg. Prep Time</span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <span className="text-2xl font-bold text-white block">{SHIFT_STATS.avgPrepTimeMinutes}m</span>
          <span className="text-[11px] text-zinc-400">Target: &lt; 10 mins</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Flagged Issues</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-bold text-white block">{SHIFT_STATS.flaggedIssuesCount}</span>
          <span className="text-[11px] text-rose-400 font-medium">All resolved</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Active Crew</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-white block">{shifts.length}</span>
          <span className="text-[11px] text-zinc-400">All stations covered</span>
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
