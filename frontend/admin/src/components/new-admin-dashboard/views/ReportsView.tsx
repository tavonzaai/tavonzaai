'use client';

import React from 'react';
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  PieChart,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

export default function ReportsView() {
  const reportsList = [
    {
      title: 'Executive Revenue & P&L Statement',
      category: 'Financial',
      period: 'Monthly (Sep 2026)',
      fileSize: '2.4 MB PDF',
      generated: 'Today, 06:00 AM',
    },
    {
      title: 'Peak Table Turnaround & Wait Time Metrics',
      category: 'Operations',
      period: 'Last 7 Days',
      fileSize: '840 KB CSV',
      generated: 'Yesterday, 11:30 PM',
    },
    {
      title: 'Menu Item Velocity & Margin Performance',
      category: 'Culinary Intelligence',
      period: 'Q3 2026',
      fileSize: '1.8 MB PDF',
      generated: 'Oct 01, 2026',
    },
    {
      title: 'Staff Labor Cost vs Table Gross Sales',
      category: 'Labor & Payroll',
      period: 'Bi-Weekly',
      fileSize: '512 KB CSV',
      generated: 'Oct 05, 2026',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-semibold font-sans">
            Executive Reports & Intelligence
          </h1>
          <p className="text-neutral-400 text-sm font-sans mt-0.5">
            Automated neural hospitality reports, labor optimization, and culinary performance statements.
          </p>
        </div>

        <button className="h-10 px-4 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-lg inline-flex items-center gap-2 transition-all shadow-md shadow-amber-400/20">
          <Calendar className="size-4 stroke-[2.5]" />
          <span>Generate Custom Audit</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((rep, idx) => (
          <div
            key={idx}
            className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-between gap-5 hover:border-amber-400/40 transition-all shadow-xl group"
          >
            <div>
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                    <FileText className="size-5 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90 font-sans block">
                      {rep.category}
                    </span>
                    <h2 className="text-white text-base font-semibold font-sans leading-5 mt-0.5 group-hover:text-amber-400 transition-colors">
                      {rep.title}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-neutral-400 font-sans mt-4 pt-3 border-t border-neutral-800">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-neutral-500" />
                  <span>Period: {rep.period}</span>
                </div>
                <span>•</span>
                <span>Size: {rep.fileSize}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-neutral-500 font-sans">
                Updated {rep.generated}
              </span>

              <button className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors">
                <Download className="size-3.5" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
