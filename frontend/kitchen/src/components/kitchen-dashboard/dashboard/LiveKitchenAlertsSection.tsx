'use client';

import React from 'react';
import { mockLiveKitchenAlerts } from '../data';

export default function LiveKitchenAlertsSection() {
  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-500/10 border-red-500/20 text-red-300';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-300';
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-300';
    }
  };

  const getDot = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'success':
        return 'bg-emerald-500';
      default:
        return 'bg-zinc-400';
    }
  };

  return (
    <div className="h-full p-6 bg-white/[0.04] rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="text-base font-semibold text-white font-['Plus_Jakarta_Sans']">
            Live Kitchen Alerts
          </div>
          <span className="px-2.5 py-0.5 bg-red-500/15 text-red-400 rounded-md outline outline-1 outline-offset-[-1px] outline-red-500/30 text-xs font-bold font-mono tracking-wider animate-pulse">
            LIVE
          </span>
        </div>

        {/* Alert List */}
        <div className="mt-4 space-y-2.5">
          {mockLiveKitchenAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border ${getAlertStyle(alert.type)} flex items-start gap-3 transition-all`}
            >
              <div className="pt-1 flex-shrink-0">
                <div className={`w-2 h-2 rounded-full ${getDot(alert.type)} animate-ping`} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-normal font-['Inter'] leading-relaxed">
                  {alert.message}
                </div>
                <div className="text-xs text-zinc-400 mt-1 font-mono">
                  {alert.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
