'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { LiveAlert } from '../types';

export interface LiveAlertsSectionProps {
  alerts: LiveAlert[];
  onViewAll?: () => void;
  onSelectAlert?: (alert: LiveAlert) => void;
}

export default function LiveAlertsSection({
  alerts,
  onViewAll,
  onSelectAlert,
}: LiveAlertsSectionProps) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-slate-200 text-lg font-semibold font-['Inter'] leading-tight">
              Live Alerts
            </h3>
            <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] mt-0.5">
              Notifications
            </p>
          </div>

          <button
            type="button"
            onClick={onViewAll}
            className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/25 text-slate-400 hover:text-white text-sm font-medium font-['DM_Sans'] inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3 mt-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectAlert?.(alert)}
              className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 rounded-xl flex items-start gap-3 transition-all cursor-pointer"
            >
              <div className="pt-1 flex items-center justify-center">
                <span className={`w-2 h-2 rounded-full ${alert.dotColor} flex-shrink-0 animate-pulse`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-slate-200/90 text-sm font-normal font-['DM_Sans'] leading-relaxed">
                  {alert.message}
                </div>
                <div className="text-xs text-zinc-500 mt-1 font-['DM_Sans']">
                  {alert.timeAgo}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2 text-xs text-zinc-500 flex items-center justify-between">
        <span>Station Alerts</span>
        <span className="text-emerald-400 font-medium">All systems monitored</span>
      </div>
    </div>
  );
}
