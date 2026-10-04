'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  GlassWater,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { mockGuestRequests } from '../data';
import { GuestRequest } from '../types';

export default function GuestRequestsView() {
  const [requests, setRequests] = useState<GuestRequest[]>(mockGuestRequests);

  const handleResolve = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Resolved' } : r))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-['Inter']">
            <UserCheck className="w-5 h-5 text-amber-400" />
            Live Guest Assistance Requests
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time button presses and customer requests from table QR scanners
          </p>
        </div>

        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm font-semibold text-amber-400">
          {requests.filter((r) => r.status !== 'Resolved').length} Unresolved
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              req.status === 'Pending'
                ? 'bg-amber-950/20 border-amber-500/40 shadow-xl'
                : req.status === 'In Progress'
                ? 'bg-blue-950/20 border-blue-500/40'
                : 'bg-zinc-950 border-zinc-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-white text-sm font-bold font-['Inter']">
                  {req.tableNumber}
                </span>
                <span className="text-base font-bold text-white font-['Inter']">
                  {req.type}
                </span>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  req.status === 'Pending'
                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                    : req.status === 'In Progress'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {req.status}
              </span>
            </div>

            {req.notes && (
              <p className="text-sm text-zinc-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                &quot;{req.notes}&quot;
              </p>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
              <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Requested {req.timeAgo}</span>
              </div>

              {req.status !== 'Resolved' ? (
                <button
                  type="button"
                  onClick={() => handleResolve(req.id)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Attended</span>
                </button>
              ) : (
                <span className="text-sm text-emerald-400 font-medium">Completed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
