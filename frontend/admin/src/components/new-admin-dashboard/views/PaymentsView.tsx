'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  Search,
  Building,
} from 'lucide-react';
import { MOCK_PAYMENTS } from '../data';

export default function PaymentsView() {
  const [transactions] = useState(MOCK_PAYMENTS);
  const [filterMethod, setFilterMethod] = useState<string>('All');

  const filtered = transactions.filter((t) => {
    return filterMethod === 'All' || t.method === filterMethod;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-semibold font-sans">
            Payments & Settlements
          </h1>
          <p className="text-neutral-400 text-sm font-sans mt-0.5">
            Cross-branch transactions, Stripe terminal payouts, and merchant settlement status.
          </p>
        </div>

        <button className="h-10 px-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-medium text-sm rounded-lg inline-flex items-center gap-2 transition-all">
          <Download className="size-4" />
          <span>Export Settlement Report</span>
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-gray-300/20 flex flex-col gap-1">
          <span className="text-xs text-neutral-400 font-sans">Total Processed (YTD)</span>
          <span className="text-2xl font-semibold text-white font-sans">$2,000,000</span>
          <span className="text-[10px] text-green-500 font-sans">+12.4% vs last period</span>
        </div>
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-gray-300/20 flex flex-col gap-1">
          <span className="text-xs text-neutral-400 font-sans">Settled Today</span>
          <span className="text-2xl font-semibold text-amber-400 font-sans">$24,850.20</span>
          <span className="text-[10px] text-neutral-400 font-sans">Auto-payout at 11:59 PM</span>
        </div>
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-gray-300/20 flex flex-col gap-1">
          <span className="text-xs text-neutral-400 font-sans">Pending Settlement</span>
          <span className="text-2xl font-semibold text-white font-sans">$3,240.00</span>
          <span className="text-[10px] text-neutral-400 font-sans">4 batch clearances</span>
        </div>
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-gray-300/20 flex flex-col gap-1">
          <span className="text-xs text-neutral-400 font-sans">Payment Success Rate</span>
          <span className="text-2xl font-semibold text-green-400 font-sans">99.8%</span>
          <span className="text-[10px] text-green-500 font-sans">0.02% chargeback rate</span>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-white text-base font-semibold font-sans">
            Recent Processed Transactions
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-sans">Channel:</span>
            {['All', 'Stripe', 'QR Pay', 'POS Terminal', 'Apple Pay'].map((method) => (
              <button
                key={method}
                onClick={() => setFilterMethod(method)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans transition-all ${
                  filterMethod === method
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-3 font-semibold">Transaction ID</th>
                <th className="pb-3 font-semibold">Restaurant & Branch</th>
                <th className="pb-3 font-semibold">Order</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-neutral-950/40 transition-colors">
                  <td className="py-3.5 font-mono text-neutral-300">{t.id}</td>
                  <td className="py-3.5">
                    <span className="text-white font-medium block">{t.restaurant}</span>
                    <span className="text-[10px] text-neutral-400">{t.branch}</span>
                  </td>
                  <td className="py-3.5 text-neutral-300 font-medium">{t.orderNumber}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px]">
                      {t.method}
                    </span>
                  </td>
                  <td className="py-3.5 font-semibold text-white">{t.amount}</td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        t.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right text-neutral-400">{t.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
