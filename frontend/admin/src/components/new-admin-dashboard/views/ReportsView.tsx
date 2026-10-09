'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Calendar,
  Store,
  GitBranch,
  CreditCard,
  TrendingUp,
  TrendingDown,
  X,
  Printer,
  Eye,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  DollarSign,
  ShoppingBag,
  Percent,
} from 'lucide-react';
import { toast } from 'sonner';

interface BranchPerformanceRecord {
  id: string;
  name: string;
  restaurant: string;
  location: string;
  orders: number;
  revenue: number;
  revenueFormatted: string;
  avgOrder: number;
  avgOrderFormatted: string;
  growth: number;
  growthFormatted: string;
  performance: 'Excellent' | 'Strong' | 'Review' | 'Underperforming';
  topItem: string;
  cardSplit: number;
  cashSplit: number;
}

const INITIAL_BRANCH_PERFORMANCE: BranchPerformanceRecord[] = [
  {
    id: 'br-georgia',
    name: 'Georgia Flagship',
    restaurant: 'Tavonza Kitchen',
    location: 'Cusseta, Georgia',
    orders: 1284,
    revenue: 4860000,
    revenueFormatted: '$ 4.86M',
    avgOrder: 3785,
    avgOrderFormatted: '$ 3,785',
    growth: 12.4,
    growthFormatted: '+12.4%',
    performance: 'Excellent',
    topItem: 'Prime Wagyu Ribeye (250g)',
    cardSplit: 74,
    cashSplit: 26,
  },
  {
    id: 'br-florida',
    name: 'Florida Flagship',
    restaurant: 'Tavonza Kitchen',
    location: 'Pompano Beach, Florida',
    orders: 934,
    revenue: 3190000,
    revenueFormatted: '$ 3.19M',
    avgOrder: 3415,
    avgOrderFormatted: '$ 3,415',
    growth: 8.1,
    growthFormatted: '+8.1%',
    performance: 'Strong',
    topItem: 'Pan-Seared Chilean Sea Bass',
    cardSplit: 68,
    cashSplit: 32,
  },
  {
    id: 'br-illinois',
    name: 'Illinois Flagship',
    restaurant: 'Ember & Grain',
    location: 'Pompano Beach, Florida',
    orders: 841,
    revenue: 2870000,
    revenueFormatted: '$ 2.87M',
    avgOrder: 3412,
    avgOrderFormatted: '$ 3,412',
    growth: 6.7,
    growthFormatted: '+6.7%',
    performance: 'Strong',
    topItem: 'Wood-Fired Truffle Margherita',
    cardSplit: 70,
    cashSplit: 30,
  },
  {
    id: 'br-texas',
    name: 'Texas Flagship',
    restaurant: 'Kori Social',
    location: 'Pompano Beach, Florida',
    orders: 612,
    revenue: 1820000,
    revenueFormatted: '$ 1.82M',
    avgOrder: 2973,
    avgOrderFormatted: '$ 2,973',
    growth: -1.2,
    growthFormatted: '-1.2%',
    performance: 'Review',
    topItem: 'Agave Smoked Barbacoa',
    cardSplit: 62,
    cashSplit: 38,
  },
];

export default function ReportsView() {
  const [dateRange, setDateRange] = useState<string>('Last 30 days');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('All Restaurants');
  const [selectedBranch, setSelectedBranch] = useState<string>('All Branches');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('All Methods');

  // Modal inspection state
  const [inspectBranch, setInspectBranch] = useState<BranchPerformanceRecord | null>(null);
  const [showExportPDFModal, setShowExportPDFModal] = useState<boolean>(false);

  // Filter records based on selected dropdowns
  const filteredRecords = useMemo(() => {
    return INITIAL_BRANCH_PERFORMANCE.filter((r) => {
      const matchRestaurant =
        selectedRestaurant === 'All Restaurants' || r.restaurant === selectedRestaurant;
      const matchBranch =
        selectedBranch === 'All Branches' || r.name === selectedBranch;
      return matchRestaurant && matchBranch;
    });
  }, [selectedRestaurant, selectedBranch]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Branch', 'Restaurant', 'Location', 'Orders', 'Revenue', 'Avg Order', 'Growth', 'Performance'];
    const rows = filteredRecords.map((r) => [
      `"${r.name}"`,
      `"${r.restaurant}"`,
      `"${r.location}"`,
      r.orders,
      `"${r.revenueFormatted}"`,
      `"${r.avgOrderFormatted}"`,
      `"${r.growthFormatted}"`,
      r.performance,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_report_${dateRange.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Sales Report exported as CSV successfully.');
  };

  // Export to PDF (preview / print)
  const handleExportPDF = () => {
    setShowExportPDFModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-3xl font-semibold font-sans leading-9">
              Reports
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-medium">
              <BarChart3 className="size-3" />
              Intelligence Hub
            </span>
          </div>
          <p className="text-zinc-500 text-sm font-normal font-sans leading-6">
            Analyze performance across restaurants, branches, staff, menu, and payments.
          </p>
        </div>

        {/* Action Buttons: Export PDF & Export CSV (Exact Figma styling) */}
        <div className="flex items-center gap-2">
          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 text-white text-sm font-medium font-sans flex items-center gap-2 transition-all active:scale-95"
          >
            <FileText className="size-4 text-white" />
            <span>Export PDF</span>
          </button>

          {/* Export CSV Button (Yellow 400 with dark text) */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 text-sm font-semibold font-sans rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Download className="size-4 text-neutral-900 stroke-[2.5]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Filters Bar Card (Date Range, Restaurant, Branch, Payment Method) */}
      <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-xs font-normal font-sans leading-4">
              Date Range
            </label>
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  toast.info(`Timeframe set to: ${e.target.value}`);
                }}
                className="w-full h-11 px-3.5 bg-neutral-900 text-neutral-200 text-sm font-normal font-sans rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 appearance-none focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
              >
                <option value="Last 30 days">Last 30 days</option>
                <option value="Today">Today</option>
                <option value="Last 7 days">Last 7 days</option>
                <option value="This Month">This Month</option>
                <option value="Last Quarter">Last Quarter</option>
                <option value="Year to Date">Year to Date (YTD)</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-300 pointer-events-none" />
            </div>
          </div>

          {/* Restaurant Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-xs font-normal font-sans leading-4">
              Restaurant
            </label>
            <div className="relative">
              <select
                value={selectedRestaurant}
                onChange={(e) => {
                  setSelectedRestaurant(e.target.value);
                  toast.info(`Filtered by restaurant: ${e.target.value}`);
                }}
                className="w-full h-11 px-3.5 bg-neutral-900 text-neutral-200 text-sm font-normal font-sans rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 appearance-none focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
              >
                <option value="All Restaurants">All Restaurants</option>
                <option value="Tavonza Kitchen">Tavonza Kitchen</option>
                <option value="Ember & Grain">Ember & Grain</option>
                <option value="Kori Social">Kori Social</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-300 pointer-events-none" />
            </div>
          </div>

          {/* Branch Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-xs font-normal font-sans leading-4">
              Branch
            </label>
            <div className="relative">
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  toast.info(`Filtered by branch: ${e.target.value}`);
                }}
                className="w-full h-11 px-3.5 bg-neutral-900 text-neutral-200 text-sm font-normal font-sans rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 appearance-none focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
              >
                <option value="All Branches">All Branches</option>
                <option value="Georgia Flagship">Georgia Flagship</option>
                <option value="Florida Flagship">Florida Flagship</option>
                <option value="Illinois Flagship">Illinois Flagship</option>
                <option value="Texas Flagship">Texas Flagship</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-300 pointer-events-none" />
            </div>
          </div>

          {/* Payment Method Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-xs font-normal font-sans leading-4">
              Payment Method
            </label>
            <div className="relative">
              <select
                value={selectedPaymentMethod}
                onChange={(e) => {
                  setSelectedPaymentMethod(e.target.value);
                  toast.info(`Filtered by payment method: ${e.target.value}`);
                }}
                className="w-full h-11 px-3.5 bg-neutral-900 text-neutral-200 text-sm font-normal font-sans rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 appearance-none focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
              >
                <option value="All Methods">All Methods</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="Stripe">Stripe</option>
                <option value="POS Terminal">POS Terminal</option>
                <option value="QR Pay">QR Pay</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-300 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sales Report Section */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-semibold font-sans leading-6">
            Sales Report
          </h2>
          <span className="text-xs text-neutral-400 font-sans">
            Aggregated for {dateRange}
          </span>
        </div>

        {/* 4 Metric KPI Cards (Gross Sales, Net Revenue, Orders, Refund Rate) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Gross Sales */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 hover:border-neutral-700 transition-all">
            <div className="w-full flex justify-between items-center">
              <div className="text-zinc-400 text-base font-semibold font-sans">
                Gross Sales
              </div>
              <span className="p-1 rounded-md bg-neutral-800 text-neutral-400">
                <DollarSign className="size-4" />
              </span>
            </div>
            <div className="w-full flex flex-col justify-start items-start gap-3">
              <div className="w-full flex justify-between items-center">
                <div className="text-white text-xl font-medium font-sans leading-6">
                  $ 8.42M
                </div>
              </div>
              <div className="w-full flex justify-between items-center">
                <div className="text-green-500 text-sm font-normal font-sans leading-4">
                  ↑ 12.4% vs previous period
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Net Revenue */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 hover:border-neutral-700 transition-all">
            <div className="w-full flex justify-between items-center">
              <div className="text-zinc-400 text-base font-semibold font-sans">
                Net Revenue
              </div>
              <span className="p-1 rounded-md bg-neutral-800 text-emerald-400">
                <TrendingUp className="size-4" />
              </span>
            </div>
            <div className="w-full flex flex-col justify-start items-start gap-3">
              <div className="w-full flex justify-between items-center">
                <div className="text-white text-xl font-medium font-sans leading-6">
                  $ 2.62M
                </div>
              </div>
              <div className="w-full flex justify-between items-center">
                <div className="text-green-500 text-sm font-normal font-sans leading-4">
                  91.2% of gross sales
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Orders */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 hover:border-neutral-700 transition-all">
            <div className="w-full flex justify-between items-center">
              <div className="text-zinc-400 text-base font-semibold font-sans">
                Orders
              </div>
              <span className="p-1 rounded-md bg-neutral-800 text-amber-400">
                <ShoppingBag className="size-4" />
              </span>
            </div>
            <div className="w-full flex flex-col justify-start items-start gap-3">
              <div className="w-full flex justify-between items-center">
                <div className="text-white text-xl font-medium font-sans leading-6">
                  $ 5K
                </div>
              </div>
              <div className="w-full flex justify-between items-center">
                <div className="text-green-500 text-sm font-normal font-sans leading-4">
                  Average ৳ 1,721
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Refund Rate */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 hover:border-neutral-700 transition-all">
            <div className="w-full flex justify-between items-center">
              <div className="text-zinc-400 text-base font-semibold font-sans">
                Refund Rate
              </div>
              <span className="p-1 rounded-md bg-neutral-800 text-neutral-400">
                <Percent className="size-4" />
              </span>
            </div>
            <div className="w-full flex flex-col justify-start items-start gap-3">
              <div className="w-full flex justify-between items-center">
                <div className="text-white text-xl font-medium font-sans leading-6">
                  0.8%
                </div>
              </div>
              <div className="w-full flex justify-between items-center">
                <div className="text-green-500 text-sm font-normal font-sans leading-4">
                  ↓ 0.3% improvement
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Branch Performance Comparison Table (Figma Table) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white text-lg font-semibold font-sans">
              Branch Performance Comparison
            </h3>
            <p className="text-neutral-400 text-xs font-sans mt-0.5">
              Comparative order volume, total revenue, average check, and growth momentum.
            </p>
          </div>
          <span className="text-xs text-neutral-500 font-sans">
            Showing {filteredRecords.length} of {INITIAL_BRANCH_PERFORMANCE.length} branches
          </span>
        </div>

        {/* The Exact Figma Styled Table with individual column styling */}
        <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-neutral-950/60 shadow-xl">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-white text-sm font-semibold">
                <th className="px-5 py-3.5">Branch</th>
                <th className="px-5 py-3.5 text-right">Orders</th>
                <th className="px-5 py-3.5 text-right">Revenue</th>
                <th className="px-5 py-3.5 text-right">Avg. order</th>
                <th className="px-5 py-3.5 text-right">Growth</th>
                <th className="px-5 py-3.5 text-center">Performance</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500 text-xs">
                    No branches match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-neutral-900/60 transition-colors group"
                  >
                    {/* 1. Branch Column */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col justify-center items-start gap-1">
                        <span className="text-neutral-200 text-base font-medium font-sans leading-4 group-hover:text-amber-300 transition-colors">
                          {b.name}
                        </span>
                        <span className="text-neutral-400 text-[10px] font-normal leading-4 tracking-tight">
                          {b.location}
                        </span>
                      </div>
                    </td>

                    {/* 2. Orders Column */}
                    <td className="px-5 py-4 text-right">
                      <span className="text-neutral-200 text-base font-medium font-sans leading-4">
                        {b.orders.toLocaleString()}
                      </span>
                    </td>

                    {/* 3. Revenue Column */}
                    <td className="px-5 py-4 text-right">
                      <span className="text-neutral-200 text-base font-medium font-sans leading-4">
                        {b.revenueFormatted}
                      </span>
                    </td>

                    {/* 4. Avg. order Column */}
                    <td className="px-5 py-4 text-right">
                      <span className="text-neutral-200 text-base font-medium font-sans leading-4">
                        {b.avgOrderFormatted}
                      </span>
                    </td>

                    {/* 5. Growth Column */}
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`text-base font-medium font-sans leading-4 ${
                          b.growth >= 0 ? 'text-green-500' : 'text-red-400'
                        }`}
                      >
                        {b.growthFormatted}
                      </span>
                    </td>

                    {/* 6. Performance Badge Column */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-md text-sm font-medium font-sans leading-4 ${
                          b.performance === 'Excellent' || b.performance === 'Strong'
                            ? 'bg-green-500/10 text-green-500'
                            : b.performance === 'Review'
                            ? 'bg-orange-400/10 text-orange-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {b.performance}
                      </span>
                    </td>

                    {/* 7. Action Button Column */}
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setInspectBranch(b)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                        title="View Detailed Branch Breakdown"
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal: Branch Detailed Analytics Breakdown */}
      {inspectBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
                  <BarChart3 className="size-5" />
                </div>
                <div>
                  <h3 className="text-white text-base font-semibold">
                    {inspectBranch.name} Intelligence
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {inspectBranch.restaurant} · {inspectBranch.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectBranch(null)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Top stats summary grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="text-neutral-500 block">Total Revenue</span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">
                    {inspectBranch.revenueFormatted}
                  </span>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="text-neutral-500 block">Total Orders</span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">
                    {inspectBranch.orders.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="text-neutral-500 block">Growth</span>
                  <span
                    className={`text-base font-bold font-mono mt-0.5 block ${
                      inspectBranch.growth >= 0 ? 'text-green-500' : 'text-red-400'
                    }`}
                  >
                    {inspectBranch.growthFormatted}
                  </span>
                </div>
              </div>

              {/* Culinary & Operational Insights */}
              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2.5">
                <div className="text-neutral-300 font-semibold text-xs flex items-center justify-between">
                  <span>Culinary Performance</span>
                  <span className="text-neutral-500 font-normal">Last 30 days</span>
                </div>
                <div className="flex justify-between items-center text-neutral-400">
                  <span>Top Performing Item:</span>
                  <span className="text-amber-300 font-medium">{inspectBranch.topItem}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-400">
                  <span>Average Check / Table:</span>
                  <span className="text-white font-mono font-medium">{inspectBranch.avgOrderFormatted}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-400">
                  <span>Performance Rating:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      inspectBranch.performance === 'Excellent' || inspectBranch.performance === 'Strong'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-orange-400/10 text-orange-400'
                    }`}
                  >
                    {inspectBranch.performance}
                  </span>
                </div>
              </div>

              {/* Payment Split Distribution */}
              <div className="space-y-2">
                <div className="flex justify-between text-neutral-400">
                  <span>Payment Channels</span>
                  <span>Card {inspectBranch.cardSplit}% / Cash {inspectBranch.cashSplit}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${inspectBranch.cardSplit}%` }}
                  />
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${inspectBranch.cashSplit}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
              <button
                onClick={() => {
                  toast.success(`Generated audit report for ${inspectBranch.name}`);
                  setInspectBranch(null);
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Download className="size-3.5 text-neutral-950" />
                <span>Download Audit PDF</span>
              </button>

              <button
                onClick={() => setInspectBranch(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Export PDF Document Preview */}
      {showExportPDFModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <FileText className="size-5 text-amber-400" />
                <h3 className="text-base font-semibold">Executive Sales Report (PDF)</h3>
              </div>
              <button
                onClick={() => setShowExportPDFModal(false)}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-neutral-300">
                Generate and print a certified, publication-grade executive sales & settlement report for the selected period.
              </p>

              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Document:</span>
                  <span className="text-white font-medium">Tavonza Executive Performance Statement</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Timeframe:</span>
                  <span className="text-white font-mono">{dateRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Scope:</span>
                  <span className="text-white">{selectedRestaurant} ({selectedBranch})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Gross Sales Volume:</span>
                  <span className="text-amber-400 font-mono font-bold">$ 8.42M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Net Revenue:</span>
                  <span className="text-emerald-400 font-mono font-bold">$ 2.62M</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowExportPDFModal(false)}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Compiling PDF statement and triggering browser print...');
                  setShowExportPDFModal(false);
                  setTimeout(() => {
                    window.print();
                  }, 300);
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Printer className="size-3.5 text-neutral-950" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
