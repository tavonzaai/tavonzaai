'use client';

import React from 'react';
import {
  Sparkles,
  CheckCircle,
  CreditCard,
  Building,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function SubscriptionView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-semibold font-sans">
          Subscription & Platform Licensing
        </h1>
        <p className="text-neutral-400 text-sm font-sans mt-0.5">
          Enterprise license status, neural AI tier entitlements, and billing cycles.
        </p>
      </div>

      {/* Main Tier Card */}
      <div className="p-8 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-amber-400/40 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="size-3.5" />
              <span>CURRENT PLAN</span>
            </div>
            <h2 className="text-3xl font-bold text-white font-sans tracking-tight">
              Tavonza AI Enterprise
            </h2>
            <p className="text-neutral-400 text-sm font-sans mt-1 max-w-lg">
              Unlimited dining rooms, neural table co-pilots, real-time KDS mesh, and multi-concept restaurant orchestration.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
            <span className="text-3xl font-bold text-white font-sans">$999<span className="text-sm font-normal text-neutral-400">/month</span></span>
            <span className="text-xs text-emerald-400 font-sans">Billed annually • Renews Jan 15, 2027</span>
            <button className="mt-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-lg shadow-lg shadow-amber-400/20 transition-all">
              Manage Billing Portal
            </button>
          </div>
        </div>

        <div className="h-0 outline outline-1 outline-offset-[-0.5px] outline-neutral-800 my-6 relative z-10" />

        {/* Quota Progress Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800">
            <div className="flex justify-between items-center text-xs text-neutral-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Building className="size-3.5 text-amber-400" />
                <span>Branch Locations</span>
              </span>
              <strong className="text-white">4 / 10</strong>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: '40%' }} />
            </div>
          </div>

          <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800">
            <div className="flex justify-between items-center text-xs text-neutral-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5 text-amber-400" />
                <span>Staff Accounts</span>
              </span>
              <strong className="text-white">48 / 100</strong>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '48%' }} />
            </div>
          </div>

          <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800">
            <div className="flex justify-between items-center text-xs text-neutral-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Zap className="size-3.5 text-amber-400" />
                <span>AI Tool Gateway</span>
              </span>
              <strong className="text-emerald-400">Unlimited</strong>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
