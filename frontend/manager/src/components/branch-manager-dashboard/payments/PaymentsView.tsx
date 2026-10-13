'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, CheckCircle2 } from 'lucide-react';
import { PaymentRecord } from '../types';
import { branchManagerService, getActiveBranchId, LiveOrderItem } from '../../../redux/features/branchManagerApi';

interface PaymentsViewProps {
  onSelectPayment: (paymentId: string) => void;
}

export default function PaymentsView({ onSelectPayment }: PaymentsViewProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);

  const statusOptions = ['All', 'Paid', 'Pending', 'Preparing', 'Ready'];
  const methodOptions = ['All', 'Visa Card', 'Cash', 'Digital Wallet'];

  const fetchPayments = async () => {
    try {
      const branchId = getActiveBranchId();
      const liveOrders = await branchManagerService.getOrders(branchId);
      const records: PaymentRecord[] = (Array.isArray(liveOrders) ? liveOrders : []).map((order) => {
        let displayStatus: PaymentRecord['status'] = 'Pending';
        if (order.paymentStatus === 'PAID') {
          displayStatus = 'Ready';
        } else if (order.status === 'PREPARING') {
          displayStatus = 'Preparing';
        } else if (order.status === 'READY_TO_SERVE') {
          displayStatus = 'Payment Pending';
        } else if (order.status === 'CANCELLED') {
          displayStatus = 'Needs Attention';
        }

        return {
          id: order.id || order.orderId || '',
          orderNumber: order.orderNumber,
          table: order.tableNumber || (order.tableId ? `Table` : 'Takeaway'),
          customer: (order as any).customerName || 'Walk-in Guest',
          amount: `$${(Number(order.totalAmount ?? order.total) || 0).toFixed(2)}`,
          rawAmount: Number(order.totalAmount ?? order.total) || 0,
          method: (order as any).paymentMethod || 'Visa Card',
          status: displayStatus,
          isPaid: order.paymentStatus === 'PAID',
          waiter: order.waiterName || 'Staff',
          timeAgo: 'Recently',
        };
      });
      setPayments(records);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    const handleUpdate = () => fetchPayments();
    window.addEventListener('tavonza:payment_status_changed', handleUpdate);
    window.addEventListener('tavonza:payment_requested', handleUpdate);
    return () => {
      window.removeEventListener('tavonza:payment_status_changed', handleUpdate);
      window.removeEventListener('tavonza:payment_requested', handleUpdate);
    };
  }, []);

  // Compute live KPI summaries from real payment records
  const completedRecords = payments.filter((p) => (p as any).isPaid);
  const pendingRecords = payments.filter((p) => !(p as any).isPaid);
  const todaysTotalAmount = completedRecords.reduce((sum, p) => sum + ((p as any).rawAmount || 0), 0);
  const pendingTotalAmount = pendingRecords.reduce((sum, p) => sum + ((p as any).rawAmount || 0), 0);

  const filteredPayments = payments.filter((pay) => {
    if (statusFilter !== 'All') {
      if (statusFilter === 'Paid' && !(pay as any).isPaid) return false;
      if (statusFilter === 'Pending' && (pay as any).isPaid) return false;
      if (statusFilter !== 'Paid' && statusFilter !== 'Pending' && pay.status !== statusFilter) return false;
    }
    if (methodFilter !== 'All' && pay.method !== methodFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrder = pay.orderNumber.toLowerCase().includes(q);
      const matchTable = pay.table.toLowerCase().includes(q);
      const matchCashier = pay.waiter.toLowerCase().includes(q);
      const matchCustomer = pay.customer.toLowerCase().includes(q);
      if (!matchOrder && !matchTable && !matchCashier && !matchCustomer) return false;
    }

    return true;
  });

  const getStatusBadge = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'Preparing':
        return (
          <div className="px-3 py-1.5 bg-fuchsia-500/10 rounded-md inline-flex justify-center items-center">
            <span className="text-fuchsia-400 text-sm font-medium font-['Inter'] leading-4">
              Preparing
            </span>
          </div>
        );
      case 'Ready':
        return (
          <div className="px-3 py-1.5 bg-teal-500/10 rounded-md inline-flex justify-center items-center">
            <span className="text-teal-500 text-sm font-medium font-['Inter'] leading-4">
              Paid / Settled
            </span>
          </div>
        );
      case 'Pending':
        return (
          <div className="px-3 py-1.5 bg-yellow-500/10 rounded-md inline-flex justify-center items-center">
            <span className="text-yellow-500 text-sm font-medium font-['Inter'] leading-4">
              Pending
            </span>
          </div>
        );
      case 'Payment Pending':
        return (
          <div className="px-3 py-1.5 bg-orange-400/10 rounded-md inline-flex justify-center items-center">
            <span className="text-orange-400 text-sm font-medium font-['Inter'] leading-4">
              Awaiting Payment
            </span>
          </div>
        );
      case 'Needs Attention':
        return (
          <div className="px-3 py-1.5 bg-red-400/10 rounded-md inline-flex justify-center items-center">
            <span className="text-red-400 text-sm font-medium font-['Inter'] leading-4">
              Cancelled / Refund
            </span>
          </div>
        );
      default:
        return (
          <div className="px-3 py-1.5 bg-zinc-800 rounded-md inline-flex justify-center items-center">
            <span className="text-neutral-300 text-sm font-medium font-['Inter'] leading-4">
              {status}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
          Branch Payment Monitoring
        </h1>
        <p className="text-neutral-500 text-sm font-normal font-['Poppins']">
          Real-time settlement activity, pending card authorizations, cash tender, and refund oversight.
        </p>
      </div>

      {/* 5 KPI Cards derived from live orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Today's Payments */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5">
          <div className="text-white text-sm font-semibold font-['Inter']">Settled Revenue</div>
          <div className="w-full h-px bg-neutral-800" />
          <div className="flex flex-col gap-1">
            <span className="text-white text-base font-medium font-['Inter'] leading-5">
              ${todaysTotalAmount.toFixed(2)}
            </span>
            <span className="text-neutral-400 text-sm font-normal font-['Inter'] leading-4">
              {completedRecords.length} completed transactions
            </span>
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="p-4 bg-orange-400/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-orange-400/20 flex flex-col justify-start items-start gap-3.5">
          <div className="text-orange-400 text-sm font-semibold font-['Inter']">Pending Balance</div>
          <div className="w-full h-px bg-neutral-800" />
          <div className="flex flex-col gap-1">
            <span className="text-orange-400 text-base font-medium font-['Inter'] leading-5">
              ${pendingTotalAmount.toFixed(2)}
            </span>
            <span className="text-neutral-400 text-sm font-normal font-['Inter'] leading-4">
              {pendingRecords.length} open tab(s)
            </span>
          </div>
        </div>

        {/* Card 3: Completed */}
        <div className="p-4 bg-green-500/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-green-500/20 flex flex-col justify-start items-start gap-3.5">
          <div className="text-green-500 text-sm font-semibold font-['Inter']">Settled Tabs</div>
          <div className="w-full h-px bg-neutral-800" />
          <div className="flex flex-col gap-1">
            <span className="text-green-500 text-base font-medium font-['Inter'] leading-5">
              {completedRecords.length}
            </span>
            <span className="text-neutral-400 text-sm font-normal font-['Inter'] leading-4">
              fully paid
            </span>
          </div>
        </div>

        {/* Card 4: Orders In Progress */}
        <div className="p-4 bg-blue-400/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-blue-400/20 flex flex-col justify-start items-start gap-3.5">
          <div className="text-blue-400 text-sm font-semibold font-['Inter']">Active Orders</div>
          <div className="w-full h-px bg-neutral-800" />
          <div className="flex flex-col gap-1">
            <span className="text-blue-400 text-base font-medium font-['Inter'] leading-5">
              {payments.length}
            </span>
            <span className="text-neutral-400 text-sm font-normal font-['Inter'] leading-4">
              total orders today
            </span>
          </div>
        </div>

        {/* Card 5: Payment Methods */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5">
          <div className="text-white text-sm font-semibold font-['Inter']">Payment Channels</div>
          <div className="w-full h-px bg-neutral-800" />
          <div className="w-full flex flex-col gap-1 text-xs font-normal font-['Inter'] leading-4 text-neutral-400">
            <div className="flex justify-between items-center">
              <span>Card / Online</span>
              <span>{payments.filter((p) => p.method.includes('Card') || p.method.includes('Wallet')).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Cash Tender</span>
              <span>{payments.filter((p) => p.method.includes('Cash')).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          {/* Payment Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowMethodDropdown(false);
              }}
              className="px-3.5 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center gap-2 hover:bg-neutral-800 transition"
            >
              <span className="text-white text-sm font-medium font-['Poppins']">
                {statusFilter === 'All' ? 'Payment status' : statusFilter}
              </span>
              <ChevronDown className="w-4 h-4 text-white" />
            </button>

            {showStatusDropdown && (
              <div className="absolute left-0 mt-1 w-44 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20 py-1 text-xs">
                {statusOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt);
                      setShowStatusDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-stone-200 hover:bg-neutral-800 hover:text-amber-400 transition"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* All Method Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowMethodDropdown(!showMethodDropdown);
                setShowStatusDropdown(false);
              }}
              className="px-3.5 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center gap-2 hover:bg-neutral-800 transition"
            >
              <span className="text-white text-sm font-medium font-['Poppins']">
                {methodFilter === 'All' ? 'All Method' : methodFilter}
              </span>
              <ChevronDown className="w-4 h-4 text-white" />
            </button>

            {showMethodDropdown && (
              <div className="absolute left-0 mt-1 w-40 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20 py-1 text-xs">
                {methodOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setMethodFilter(opt);
                      setShowMethodDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-stone-200 hover:bg-neutral-800 hover:text-amber-400 transition"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="w-full md:w-72 h-9 relative bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 overflow-hidden flex items-center">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order, table, cashier"
            className="w-full pl-9 pr-3 py-1.5 bg-transparent text-white placeholder-neutral-500 text-sm font-['Inter'] focus:outline-none"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 shadow-lg bg-neutral-950/60">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800 text-white text-sm font-semibold font-['Inter']">
              <th className="px-4 py-3 w-28 rounded-tl-lg">Order</th>
              <th className="px-4 py-3 w-28">Table</th>
              <th className="px-4 py-3 w-32">Customer</th>
              <th className="px-4 py-3 w-32">Amount</th>
              <th className="px-4 py-3 w-44">Method</th>
              <th className="px-4 py-3 w-52">Table Status</th>
              <th className="px-4 py-3 w-28">Waiter</th>
              <th className="px-3 py-3 w-24 text-center rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-neutral-500 font-['Inter']">
                  Loading payment records...
                </td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-neutral-500 font-['Inter']">
                  No payment records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredPayments.map((pay) => (
                <tr
                  key={pay.id}
                  onClick={() => onSelectPayment(pay.id)}
                  className="hover:bg-zinc-900/70 transition cursor-pointer group"
                >
                  <td className="px-4 py-4 text-neutral-200 text-base font-medium font-['Inter'] group-hover:text-amber-400 transition">
                    {pay.orderNumber}
                  </td>
                  <td className="px-4 py-4 text-neutral-200 text-base font-medium font-['Inter']">
                    {pay.table}
                  </td>
                  <td className="px-4 py-4 text-neutral-200 text-base font-medium font-['Inter']">
                    {pay.customer}
                  </td>
                  <td className="px-4 py-4 text-neutral-200 text-base font-medium font-['Inter']">
                    {pay.amount}
                  </td>
                  <td className="px-4 py-4 text-neutral-200 text-base font-medium font-['Inter']">
                    {pay.method}
                  </td>
                  <td className="px-4 py-2">
                    {getStatusBadge(pay.status)}
                  </td>
                  <td className="px-4 py-4 text-neutral-200 text-base font-medium font-['Inter']">
                    {pay.waiter}
                  </td>
                  <td className="px-3 py-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPayment(pay.id);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition inline-flex items-center justify-center"
                      title="View Settlement Details"
                    >
                      <div className="w-3.5 h-3 border border-white/80 rounded-sm relative flex items-center justify-center">
                        <div className="w-1 h-1 bg-white/80 rounded-full" />
                      </div>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
