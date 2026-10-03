'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { mockPaymentAlerts } from '../data';
import { toast } from 'sonner';

export default function PaymentAlertsSection() {
  const getDotColor = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      case 'info':
        return 'bg-yellow-500';
      case 'success':
        return 'bg-emerald-500';
      default:
        return 'bg-amber-500';
    }
  };

  return (
    <div className="bg-white/10 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl p-6 font-['Inter'] shadow-lg flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-white text-lg font-semibold font-['Inter'] leading-tight">
              Payment Alerts
            </h2>
            <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-4 mt-1">
              Smart Notifications
            </p>
          </div>

          <button
            type="button"
            onClick={() => toast.info('Viewing all cashier notifications')}
            className="text-amber-500 hover:text-amber-400 text-base font-medium font-['Inter'] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-2.5">
          {mockPaymentAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => toast.info(alert.message)}
              className="h-11 px-3.5 bg-white/5 hover:bg-white/10 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/5 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <span className={`size-1.5 rounded-full flex-shrink-0 ${getDotColor(alert.severity)}`} />
              <p className="text-white text-sm font-normal font-['Inter'] leading-tight truncate">
                {alert.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
