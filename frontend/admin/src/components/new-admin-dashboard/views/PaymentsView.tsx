'use client';

import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Banknote,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  Search,
  Building,
  ArrowUpRight,
  RefreshCw,
  Printer,
  X,
  FileSpreadsheet,
  ChevronDown,
  RotateCcw,
  Receipt,
  Eye,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

export interface PaymentItem {
  id: string;
  orderNumber: string;
  restaurant: string;
  branch: string;
  tableNumber: string;
  server: string;
  amount: number;
  formattedAmount: string;
  method: 'Card' | 'Cash' | 'Stripe' | 'POS Terminal' | 'QR Pay' | 'Apple Pay';
  cardLast4?: string;
  cardBrand?: string;
  authCode?: string;
  status: 'Completed' | 'Pending' | 'Refunded';
  timestamp: string;
  date: string;
  items?: { name: string; qty: number; price: number }[];
}

const INITIAL_TRANSACTIONS: PaymentItem[] = [
  {
    id: '#TX-8291',
    orderNumber: '#1048',
    restaurant: 'Tavonza Kitchen',
    branch: 'Gulshan Flagship',
    tableNumber: 'Table T-04',
    server: 'Rahim Al-Amin',
    amount: 54.0,
    formattedAmount: '$ 54.00',
    method: 'Card',
    cardLast4: '4242',
    cardBrand: 'Visa',
    authCode: 'AUTH-82910',
    status: 'Completed',
    timestamp: 'Today, 12:40 PM',
    date: '2026-10-09',
    items: [
      { name: 'Prime Wagyu Ribeye (250g)', qty: 1, price: 38.0 },
      { name: 'House Truffle Herb Fries', qty: 1, price: 9.0 },
      { name: 'Sparkling San Pellegrino (750ml)', qty: 1, price: 7.0 },
    ],
  },
  {
    id: '#TX-8290',
    orderNumber: '#1047',
    restaurant: 'Tavonza Kitchen',
    branch: 'Gulshan Flagship',
    tableNumber: 'Table T-02',
    server: 'Nusrat Jahan',
    amount: 54.0,
    formattedAmount: '$ 54.00',
    method: 'Card',
    cardLast4: '8821',
    cardBrand: 'Mastercard',
    authCode: 'AUTH-82901',
    status: 'Completed',
    timestamp: 'Today, 12:40 PM',
    date: '2026-10-09',
    items: [
      { name: 'Pan-Seared Chilean Sea Bass', qty: 1, price: 42.0 },
      { name: 'Organic Matcha Green Tea', qty: 2, price: 12.0 },
    ],
  },
  {
    id: '#TX-8289',
    orderNumber: '#1046',
    restaurant: 'Tavonza Kitchen',
    branch: 'Gulshan Flagship',
    tableNumber: 'Table T-09',
    server: 'Tanvir Hossain',
    amount: 54.0,
    formattedAmount: '$ 54.00',
    method: 'Card',
    cardLast4: '1094',
    cardBrand: 'Amex',
    authCode: 'AUTH-82892',
    status: 'Completed',
    timestamp: 'Today, 12:40 PM',
    date: '2026-10-09',
    items: [
      { name: 'Handmade Truffle Tagliatelle', qty: 1, price: 34.0 },
      { name: 'Tiramisu Della Nonna', qty: 1, price: 12.0 },
      { name: 'Double Espresso', qty: 1, price: 8.0 },
    ],
  },
  {
    id: '#TX-8288',
    orderNumber: '#1045',
    restaurant: 'Tavonza Kitchen',
    branch: 'Gulshan Flagship',
    tableNumber: 'Table T-01',
    server: 'Robert Geo',
    amount: 54.0,
    formattedAmount: '$ 54.00',
    method: 'Card',
    cardLast4: '3318',
    cardBrand: 'Visa',
    authCode: 'AUTH-82883',
    status: 'Completed',
    timestamp: 'Today, 12:40 PM',
    date: '2026-10-09',
    items: [
      { name: 'Wood-Fired Margherita D.O.P.', qty: 1, price: 24.0 },
      { name: 'Burrata Pugliese Salad', qty: 1, price: 18.0 },
      { name: 'Craft Ginger Ale', qty: 2, price: 12.0 },
    ],
  },
  {
    id: '#TX-8287',
    orderNumber: '#1044',
    restaurant: 'Tavonza Kitchen',
    branch: 'Gulshan Flagship',
    tableNumber: 'Bar Stool 03',
    server: 'Tanvir Hossain',
    amount: 210.0,
    formattedAmount: '$ 210.00',
    method: 'Cash',
    authCode: 'CASH-DRAWER-01',
    status: 'Completed',
    timestamp: 'Today, 11:55 AM',
    date: '2026-10-09',
    items: [
      { name: 'Chef Omakase Tasting Course', qty: 2, price: 180.0 },
      { name: 'Yuzu Botanical Spritz', qty: 2, price: 30.0 },
    ],
  },
  {
    id: '#TX-8286',
    orderNumber: '#1043',
    restaurant: 'Tavonza Kitchen',
    branch: 'Gulshan Flagship',
    tableNumber: 'Table T-07',
    server: 'Rahim Al-Amin',
    amount: 45.0,
    formattedAmount: '$ 45.00',
    method: 'QR Pay',
    authCode: 'QRPAY-99014',
    status: 'Pending',
    timestamp: 'Today, 11:32 AM',
    date: '2026-10-09',
    items: [
      { name: 'Artisan Sourdough Garlic Bread', qty: 1, price: 14.0 },
      { name: 'Classic Carbonara Guanciale', qty: 1, price: 26.0 },
      { name: 'Acqua Panna Still (500ml)', qty: 1, price: 5.0 },
    ],
  },
  {
    id: '#TX-8285',
    orderNumber: '#1042',
    restaurant: 'Tavonza Kitchen',
    branch: 'Gulshan Flagship',
    tableNumber: 'Table T-05',
    server: 'Nusrat Jahan',
    amount: 148.5,
    formattedAmount: '$ 148.50',
    method: 'Stripe',
    cardLast4: '5501',
    cardBrand: 'Visa',
    authCode: 'ch_3M4k9e2eZvKYlo2C1',
    status: 'Completed',
    timestamp: 'Today, 11:15 AM',
    date: '2026-10-09',
    items: [
      { name: 'Tomahawk Ribeye Steak (900g)', qty: 1, price: 120.0 },
      { name: 'Grilled Asparagus Hollandaise', qty: 1, price: 16.0 },
      { name: 'Mineral Sparkling Water', qty: 2, price: 12.5 },
    ],
  },
  {
    id: '#TX-8284',
    orderNumber: '#1041',
    restaurant: 'Tavonza Kitchen',
    branch: 'Gulshan Flagship',
    tableNumber: 'Table T-08',
    server: 'Robert Geo',
    amount: 72.0,
    formattedAmount: '$ 72.00',
    method: 'Card',
    cardLast4: '9924',
    cardBrand: 'Mastercard',
    authCode: 'AUTH-82844',
    status: 'Refunded',
    timestamp: 'Yesterday, 09:40 PM',
    date: '2026-10-08',
    items: [
      { name: 'Dry-Aged Beef Carpaccio', qty: 2, price: 44.0 },
      { name: 'House Berry Panna Cotta', qty: 2, price: 28.0 },
    ],
  },
];

export default function PaymentsView() {
  const [transactions, setTransactions] = useState<PaymentItem[]>(INITIAL_TRANSACTIONS);
  const [selectedBranch, setSelectedBranch] = useState<string>('Gulshan Flagship');
  const [timeframe, setTimeframe] = useState<string>('This Month');
  const [filterMethod, setFilterMethod] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentItem | null>(null);
  const [refundTarget, setRefundTarget] = useState<PaymentItem | null>(null);
  const [refundReason, setRefundReason] = useState<string>('Customer Request');
  const [isRefunding, setIsRefunding] = useState<boolean>(false);
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);

  // Filtered transactions for the ledger table
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchMethod = filterMethod === 'All' || t.method === filterMethod;
      const matchStatus = filterStatus === 'All' || t.status === filterStatus;
      const matchSearch =
        searchQuery.trim() === '' ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.server.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMethod && matchStatus && matchSearch;
    });
  }, [transactions, filterMethod, filterStatus, searchQuery]);

  // Handle Refund submission
  const handleConfirmRefund = () => {
    if (!refundTarget) return;
    setIsRefunding(true);

    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === refundTarget.id
            ? { ...item, status: 'Refunded' }
            : item
        )
      );
      if (selectedTransaction?.id === refundTarget.id) {
        setSelectedTransaction((curr) => curr ? { ...curr, status: 'Refunded' } : null);
      }
      setIsRefunding(false);
      toast.success(`Refund of ${refundTarget.formattedAmount} issued for ${refundTarget.id}`);
      setRefundTarget(null);
    }, 450);
  };

  // Handle Batch Settlement Payout
  const handleSettleBatch = () => {
    const pendingItems = transactions.filter((t) => t.status === 'Pending');
    if (pendingItems.length === 0) {
      toast.info('No pending transactions to settle at this time.');
      setShowBatchModal(false);
      return;
    }

    setTransactions((prev) =>
      prev.map((t) => (t.status === 'Pending' ? { ...t, status: 'Completed' } : t))
    );
    setShowBatchModal(false);
    toast.success(`Batch settlement executed! Settled $ 5K across 24 transactions into SCB Operating Account.`);
  };

  // Export CSV Settlement Report
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Branch', 'Order', 'Table', 'Server', 'Method', 'Amount', 'Status', 'Timestamp'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.branch,
      t.orderNumber,
      t.tableNumber,
      `"${t.server}"`,
      t.method,
      t.formattedAmount.replace('$', '').trim(),
      t.status,
      `"${t.timestamp}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `settlement_report_${selectedBranch.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Settlement CSV Report downloaded successfully.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-3xl font-semibold font-sans leading-9">
              Payments
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Gateway Online
            </span>
          </div>
          <p className="text-zinc-500 text-sm font-normal font-sans leading-6">
            Payment overview and settlement activity for {selectedBranch}.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Branch Pill Selector */}
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                toast.info(`Switched view to ${e.target.value}`);
              }}
              className="appearance-none h-10 pl-3.5 pr-8 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-colors focus:outline-none cursor-pointer"
            >
              <option value="Gulshan Flagship">Gulshan Flagship</option>
              <option value="Georgia Flagship">Georgia Flagship</option>
              <option value="Florida Flagship">Florida Flagship</option>
              <option value="Illinois Flagship">Illinois Flagship</option>
              <option value="All Branches">All Branches</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-neutral-500 pointer-events-none" />
          </div>

          {/* Settle Pending Batch Button */}
          <button
            onClick={() => setShowBatchModal(true)}
            className="h-10 px-3.5 bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-medium text-xs rounded-lg inline-flex items-center gap-2 transition-all shadow-sm"
          >
            <RotateCcw className="size-3.5" />
            <span>Settle Batch ($ 5K)</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={handleExportCSV}
            className="h-10 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs rounded-lg inline-flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Download className="size-3.5 text-neutral-950" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metrics Row (Exact 4 Cards as per Figma Specification) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Revenue */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-4 hover:border-neutral-700 transition-all">
          <div className="w-full flex justify-between items-center">
            <div className="text-white text-lg font-semibold font-sans">Total Revenue</div>
            <span className="p-1.5 rounded-lg bg-neutral-800/80 text-amber-400">
              <DollarSign className="size-4" />
            </span>
          </div>
          <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <div className="w-full flex justify-between items-center">
              <div className="text-white text-2xl font-medium font-sans leading-7">
                $ 2.84M
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-green-500 text-sm font-normal font-sans leading-4">
                ↑ 11.2% this month
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Completed */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-4 hover:border-neutral-700 transition-all">
          <div className="w-full flex justify-between items-center">
            <div className="text-white text-lg font-semibold font-sans">Completed</div>
            <span className="p-1.5 rounded-lg bg-neutral-800/80 text-emerald-400">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <div className="w-full flex justify-between items-center">
              <div className="text-white text-2xl font-medium font-sans leading-7">
                $ 2.62M
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-green-500 text-sm font-normal font-sans leading-4">
                1,842 transactions
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-4 hover:border-neutral-700 transition-all">
          <div className="w-full flex justify-between items-center">
            <div className="text-white text-lg font-semibold font-sans">Pending</div>
            <span className="p-1.5 rounded-lg bg-neutral-800/80 text-amber-400">
              <Clock className="size-4" />
            </span>
          </div>
          <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <div className="w-full flex justify-between items-center">
              <div className="text-white text-2xl font-medium font-sans leading-7">
                $ 5K
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-green-500 text-sm font-normal font-sans leading-4">
                24 transactions
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Refunded */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-4 hover:border-neutral-700 transition-all">
          <div className="w-full flex justify-between items-center">
            <div className="text-white text-lg font-semibold font-sans">Refunded</div>
            <span className="p-1.5 rounded-lg bg-neutral-800/80 text-rose-400">
              <AlertCircle className="size-4" />
            </span>
          </div>
          <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <div className="w-full flex justify-between items-center">
              <div className="text-white text-2xl font-medium font-sans leading-7">
                $ 2K
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-green-500 text-sm font-normal font-sans leading-4">
                18 transactions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mid Section (Payment Methods + Recent Transactions Side-by-Side as per Figma) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (lg:col-span-7): Payment Methods */}
        <div className="lg:col-span-7 p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-5">
          {/* Section Header */}
          <div className="py-1 border-b border-zinc-900 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className="text-white text-lg font-semibold font-sans">
                Payment Methods
              </div>
              <div className="text-neutral-400 text-xs font-normal font-sans leading-5">
                Revenue distribution this month
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Gulshan POS & Terminals</span>
            </div>
          </div>

          {/* Method 1: Card */}
          <div className="flex items-center gap-3.5 py-1">
            <div className="w-12 text-zinc-100 text-sm font-normal font-sans leading-4 tracking-tight flex items-center gap-1.5">
              <CreditCard className="size-3.5 text-neutral-400" />
              <span>Card</span>
            </div>

            {/* Progress Bar Container */}
            <div className="flex-1 h-1.5 relative bg-neutral-700/60 rounded-[999px] overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-[999px] transition-all duration-500"
                style={{ width: '70%' }}
              />
            </div>

            {/* Stats */}
            <div className="w-28 flex justify-between items-center shrink-0">
              <div className="text-zinc-100 text-sm font-bold font-sans leading-4 tracking-tight">
                $ 1.22M
              </div>
              <div className="text-neutral-400 text-xs font-normal font-sans leading-4 tracking-tight">
                70%
              </div>
            </div>
          </div>

          <div className="h-0 outline outline-1 outline-offset-[-0.50px] outline-zinc-900" />

          {/* Method 2: Cash */}
          <div className="flex items-center gap-3.5 py-1">
            <div className="w-12 text-zinc-100 text-sm font-normal font-sans leading-4 tracking-tight flex items-center gap-1.5">
              <Banknote className="size-3.5 text-neutral-400" />
              <span>Cash</span>
            </div>

            {/* Progress Bar Container */}
            <div className="flex-1 h-1.5 relative bg-neutral-700/60 rounded-[999px] overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-[999px] transition-all duration-500"
                style={{ width: '30%' }}
              />
            </div>

            {/* Stats */}
            <div className="w-28 flex justify-between items-center shrink-0">
              <div className="text-zinc-100 text-sm font-bold font-sans leading-4 tracking-tight">
                $ 20K
              </div>
              <div className="text-neutral-400 text-xs font-normal font-sans leading-4 tracking-tight">
                30%
              </div>
            </div>
          </div>

          {/* Subtle Additional Analytics Summary Callout */}
          <div className="mt-2 pt-3 border-t border-zinc-900/80 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Card Settlement: <strong>T+1 Payout</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Cash Reconciled: <strong>$20,000 Verified</strong></span>
              </div>
            </div>
            <button
              onClick={() => {
                setFilterMethod('All');
                toast.info('Viewing all payment methods');
              }}
              className="text-amber-400 hover:text-amber-300 font-medium text-xs flex items-center gap-1 transition-colors"
            >
              <span>View Channel Ledger</span>
              <ArrowUpRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (lg:col-span-5): Recent Transactions */}
        <div className="lg:col-span-5 px-6 py-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
          {/* Section Header */}
          <div className="flex flex-col gap-1 border-b border-zinc-900 pb-3">
            <div className="text-white text-lg font-semibold font-sans">
              Recent Transactions
            </div>
            <div className="text-neutral-400 text-xs font-normal font-sans leading-5">
              Latest completed payments
            </div>
          </div>

          {/* List of 4 Figma Specified Transactions */}
          <div className="flex flex-col gap-3">
            {transactions.slice(0, 4).map((tx, idx) => (
              <React.Fragment key={tx.id}>
                <div
                  onClick={() => setSelectedTransaction(tx)}
                  className="group flex justify-between items-center py-1 hover:bg-neutral-800/40 px-2 rounded-lg -mx-2 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-100 text-base font-bold font-sans leading-5 group-hover:text-amber-300 transition-colors">
                        {tx.id}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                        {tx.tableNumber}
                      </span>
                    </div>
                    <div className="text-neutral-500 text-xs font-normal font-sans leading-4">
                      {tx.method} · {tx.timestamp}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-white text-base font-medium font-sans leading-5">
                      {tx.formattedAmount}
                    </div>
                    <Eye className="size-4 text-neutral-500 group-hover:text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {idx < 3 && (
                  <div className="h-0 outline outline-1 outline-offset-[-0.50px] outline-zinc-900" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Lower Section: Comprehensive All Transactions Ledger & Settlements Table */}
      <div className="bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 p-6 space-y-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div>
            <h2 className="text-white text-lg font-semibold font-sans">
              All Transactions Ledger
            </h2>
            <p className="text-neutral-400 text-xs font-sans mt-0.5">
              Audited payment records, card authorizations, and cash drawer reconciliations.
            </p>
          </div>

          {/* Search Input */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search TX ID, order, table, server..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter by Method */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-xs text-neutral-500 hidden sm:inline">Method:</span>
              {['All', 'Card', 'Cash', 'Stripe', 'QR Pay'].map((method) => (
                <button
                  key={method}
                  onClick={() => setFilterMethod(method)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium font-sans transition-all shrink-0 ${
                    filterMethod === method
                      ? 'bg-amber-400 text-neutral-950 font-semibold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-500 hidden sm:inline">Status:</span>
              {['All', 'Completed', 'Pending', 'Refunded'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium font-sans transition-all shrink-0 ${
                    filterStatus === st
                      ? 'bg-neutral-100 text-neutral-950 font-semibold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-3 font-semibold">Transaction ID</th>
                <th className="pb-3 font-semibold">Branch & Table</th>
                <th className="pb-3 font-semibold">Order</th>
                <th className="pb-3 font-semibold">Server</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-500">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-neutral-950/40 transition-colors group"
                  >
                    <td className="py-3.5">
                      <button
                        onClick={() => setSelectedTransaction(t)}
                        className="font-mono text-zinc-100 font-bold hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
                      >
                        <span>{t.id}</span>
                      </button>
                    </td>
                    <td className="py-3.5">
                      <span className="text-white font-medium block">{t.branch}</span>
                      <span className="text-[10px] text-neutral-400">{t.tableNumber}</span>
                    </td>
                    <td className="py-3.5 text-neutral-300 font-medium">
                      {t.orderNumber}
                    </td>
                    <td className="py-3.5 text-neutral-300">
                      {t.server}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 font-mono text-[10px] inline-flex items-center gap-1">
                        {t.method === 'Card' ? (
                          <CreditCard className="size-3 text-neutral-400" />
                        ) : t.method === 'Cash' ? (
                          <Banknote className="size-3 text-emerald-400" />
                        ) : (
                          <DollarSign className="size-3 text-amber-400" />
                        )}
                        <span>{t.method}</span>
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-white">
                      {t.formattedAmount}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                          t.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : t.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.status === 'Completed'
                              ? 'bg-emerald-400'
                              : t.status === 'Pending'
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        />
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-neutral-400">
                      {t.timestamp}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTransaction(t)}
                          title="View Receipt"
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                        >
                          <Receipt className="size-3.5" />
                        </button>
                        {t.status === 'Completed' && (
                          <button
                            onClick={() => setRefundTarget(t)}
                            title="Issue Refund"
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-950/60 hover:text-rose-400 text-neutral-400 transition-colors"
                          >
                            <RotateCcw className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Ledger Footer */}
        <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div>
            Showing <span className="text-white font-medium">{filteredTransactions.length}</span> of <span className="text-white font-medium">{transactions.length}</span> recorded transactions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.info('Navigating to previous page')}
              className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
            >
              Previous
            </button>
            <span className="text-neutral-500 px-1">Page 1 of 1</span>
            <button
              onClick={() => toast.info('Navigating to next page')}
              className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 5. Modal: Digital Receipt & Transaction Details */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                  <Receipt className="size-5" />
                </div>
                <div>
                  <h3 className="text-white text-base font-semibold">Payment Receipt</h3>
                  <p className="text-xs text-neutral-400">{selectedTransaction.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
              {/* Brand and Branch Header */}
              <div className="text-center pb-4 border-b border-dashed border-neutral-700 space-y-1">
                <div className="text-lg font-bold text-white tracking-wide">
                  {selectedTransaction.restaurant}
                </div>
                <div className="text-xs text-neutral-400">
                  {selectedTransaction.branch}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  Order {selectedTransaction.orderNumber} · {selectedTransaction.tableNumber}
                </div>
              </div>

              {/* Server and Timestamp Details */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-b border-neutral-800">
                <div>
                  <span className="text-neutral-500 block">Server</span>
                  <span className="text-neutral-200 font-medium">{selectedTransaction.server}</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 block">Date & Time</span>
                  <span className="text-neutral-200 font-medium">{selectedTransaction.timestamp}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Payment Method</span>
                  <span className="text-neutral-200 font-medium">{selectedTransaction.method}</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 block">Status</span>
                  <span
                    className={`font-semibold ${
                      selectedTransaction.status === 'Completed'
                        ? 'text-emerald-400'
                        : selectedTransaction.status === 'Pending'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="space-y-2 py-2">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Ordered Items
                </div>
                <div className="space-y-1.5">
                  {(selectedTransaction.items || [
                    { name: 'Standard Chef Special', qty: 1, price: selectedTransaction.amount },
                  ]).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-neutral-300">
                        {item.qty}x {item.name}
                      </span>
                      <span className="text-white font-mono">
                        $ {(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="pt-3 border-t border-dashed border-neutral-700 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-neutral-300">
                    $ {selectedTransaction.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Tax & VAT (Included)</span>
                  <span className="font-mono text-neutral-300">$ 0.00</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-neutral-800">
                  <span>Total Paid</span>
                  <span className="font-mono text-amber-400">
                    {selectedTransaction.formattedAmount}
                  </span>
                </div>
              </div>

              {/* Authorization Info */}
              <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>Auth Code:</span>
                  <span className="font-mono text-neutral-300">
                    {selectedTransaction.authCode || 'N/A'}
                  </span>
                </div>
                {selectedTransaction.cardLast4 && (
                  <div className="flex justify-between">
                    <span>Card Account:</span>
                    <span className="font-mono text-neutral-300">
                      {selectedTransaction.cardBrand} •••• {selectedTransaction.cardLast4}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Terminal:</span>
                  <span className="font-mono text-neutral-300">POS-01 / Gulshan Front Desk</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  toast.success('Sending print command to receipt printer POS-01');
                }}
                className="flex-1 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="size-3.5" />
                <span>Print Receipt</span>
              </button>

              {selectedTransaction.status === 'Completed' && (
                <button
                  onClick={() => {
                    setRefundTarget(selectedTransaction);
                    setSelectedTransaction(null);
                  }}
                  className="py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Refund</span>
                </button>
              )}

              <button
                onClick={() => setSelectedTransaction(null)}
                className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Issue Refund Confirmation */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="size-5" />
                <h3 className="text-white text-base font-semibold">Issue Refund</h3>
              </div>
              <button
                onClick={() => setRefundTarget(null)}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-neutral-300">
                Are you sure you want to refund this transaction? The amount will be reversed to the customer’s payment method.
              </p>

              <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Transaction ID:</span>
                  <span className="text-white font-mono font-bold">{refundTarget.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Amount to Refund:</span>
                  <span className="text-rose-400 font-mono font-bold">{refundTarget.formattedAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Method:</span>
                  <span className="text-white">{refundTarget.method}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-400 font-medium">Select Refund Reason</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full h-9 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="Customer Request">Customer Request</option>
                  <option value="Incorrect Charge / Duplication">Incorrect Charge / Duplication</option>
                  <option value="Item Unavailable (86)">Item Unavailable (86)</option>
                  <option value="Manager Goodwill Comp">Manager Goodwill Comp</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setRefundTarget(null)}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRefund}
                disabled={isRefunding}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isRefunding ? 'Processing...' : `Confirm Refund (${refundTarget.formattedAmount})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Settle Batch Payout */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                  <RotateCcw className="size-5" />
                </div>
                <div>
                  <h3 className="text-white text-base font-semibold">Execute Batch Settlement</h3>
                  <p className="text-xs text-neutral-400">Gulshan Flagship Daily Cutoff</p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-neutral-300">
                Trigger an on-demand payout clearance for un-settled card authorizations and online QR payments.
              </p>

              <div className="p-3.5 bg-neutral-950 rounded-lg border border-neutral-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Pending Amount:</span>
                  <span className="text-amber-400 font-mono font-bold text-sm">$ 5,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Batched Transactions:</span>
                  <span className="text-white font-medium">24 authorizations</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Destination Account:</span>
                  <span className="text-white font-mono">Standard Chartered Bank (SCB) •••• 8821</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Est. Arrival:</span>
                  <span className="text-emerald-400 font-medium">Within 30 minutes (Fast Payout)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowBatchModal(false)}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSettleBatch}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="size-3.5 text-neutral-950" />
                <span>Confirm Settlement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
