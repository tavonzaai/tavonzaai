'use client';

import React, { useState } from 'react';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { toast } from 'sonner';

interface TenantIncome {
  id: string;
  tenant: string;
  plan: string;
  billingCycle: 'Yearly' | 'Monthly';
  incomeThisMonth: number;
  lifetimeRevenue: number;
  contribution: string;
}

interface Transaction {
  id: string;
  tenant: string;
  plan: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Failed' | 'Refunded';
}

const INITIAL_TENANT_INCOME: TenantIncome[] = [
  {
    id: 't-1',
    tenant: 'Saffron Table Co.',
    plan: 'Pro',
    billingCycle: 'Yearly',
    incomeThisMonth: 2148,
    lifetimeRevenue: 21480,
    contribution: '7.6%',
  },
  {
    id: 't-2',
    tenant: 'Juniper Hospitality',
    plan: 'Pro',
    billingCycle: 'Yearly',
    incomeThisMonth: 1790,
    lifetimeRevenue: 17900,
    contribution: '6.3%',
  },
  {
    id: 't-3',
    tenant: 'Basil & Stone',
    plan: 'Growth',
    billingCycle: 'Yearly',
    incomeThisMonth: 1490,
    lifetimeRevenue: 13410,
    contribution: '5.2%',
  },
  {
    id: 't-4',
    tenant: 'Oak & Ember Group',
    plan: 'Growth',
    billingCycle: 'Monthly',
    incomeThisMonth: 149,
    lifetimeRevenue: 8046,
    contribution: '0.5%',
  },
  {
    id: 't-5',
    tenant: 'Common Ground Dining',
    plan: 'Growth',
    billingCycle: 'Monthly',
    incomeThisMonth: 149,
    lifetimeRevenue: 5513,
    contribution: '0.5%',
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    tenant: 'Oak & Ember Group',
    plan: 'Growth',
    amount: 149.0,
    date: 'Jun 12, 2024',
    status: 'Paid',
  },
  {
    id: 'tx-2',
    tenant: 'Common Ground Dining',
    plan: 'Growth',
    amount: 149.0,
    date: 'Jun 11, 2024',
    status: 'Failed',
  },
  {
    id: 'tx-3',
    tenant: 'Saffron Table Co.',
    plan: 'Pro',
    amount: 2148.0,
    date: 'Jun 10, 2024',
    status: 'Paid',
  },
  {
    id: 'tx-4',
    tenant: 'Juniper Hospitality',
    plan: 'Pro',
    amount: 179.0,
    date: 'Jun 9, 2024',
    status: 'Failed',
  },
  {
    id: 'tx-5',
    tenant: 'Mesa Verde Foods',
    plan: 'Starter',
    amount: 49.0,
    date: 'Jun 8, 2024',
    status: 'Refunded',
  },
];

export default function BillingPage() {
  const [period, setPeriod] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [failedOnly, setFailedOnly] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  const filteredTransactions = failedOnly
    ? transactions.filter((t) => t.status === 'Failed')
    : transactions;

  const handleRetryPayment = (tx: Transaction) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 900)),
      {
        loading: `Retrying payment for ${tx.tenant}...`,
        success: () => {
          setTransactions((prev) =>
            prev.map((item) =>
              item.id === tx.id ? { ...item, status: 'Paid' as const } : item
            )
          );
          return `Payment successfully re-authorized for ${tx.tenant}!`;
        },
        error: 'Failed to process payment retry.',
      }
    );
  };

  const handleDownloadInvoice = (tenant: string, date: string) => {
    toast.success(`Downloading PDF invoice for ${tenant} (${date})`);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Tenant,Plan,Billing Cycle,Income This Month,Lifetime Revenue,Contribution']
        .concat(
          INITIAL_TENANT_INCOME.map(
            (t) =>
              `"${t.tenant}","${t.plan}","${t.billingCycle}",$${t.incomeThisMonth.toLocaleString()},$${t.lifetimeRevenue.toLocaleString()},"${t.contribution}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tenant-billing-report-${period.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Billing report exported to CSV successfully.');
  };

  return (
    <SuperAdminLayout>
      <div className="flex flex-col gap-7 w-full font-inter animate-fade-in text-white pb-12">
        {/* Page Header */}
        <div className="min-h-16 flex flex-col justify-start items-start">
          <h1 className="text-white text-3xl font-semibold leading-9">Billing</h1>
          <p className="text-zinc-500 text-sm font-normal pt-[5px] leading-6">
            Monitor platform revenue, invoices, and payment issues.
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Revenue this month */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
            <div className="text-neutral-400 text-xs font-medium uppercase leading-4 tracking-wide">
              Revenue this month
            </div>
            <div className="w-full pt-5 flex flex-col justify-start items-start">
              <div className="w-full pt-4 border-t border-zinc-800 flex flex-col justify-start items-start">
                <div className="text-white text-2xl font-medium leading-9">
                  {period === 'Monthly' ? '$28,420' : '$341,040'}
                </div>
              </div>
            </div>
            <div className="w-64 h-6 pt-2 flex flex-col justify-start items-start">
              <div className="text-green-500 text-xs font-normal leading-4">
                +8.2% vs May
              </div>
            </div>
          </div>

          {/* Card 2: Top plan */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
            <div className="text-neutral-400 text-xs font-medium uppercase leading-4 tracking-wide">
              Top plan
            </div>
            <div className="w-full pt-5 flex flex-col justify-start items-start">
              <div className="w-full pt-4 border-t border-zinc-800 flex flex-col justify-start items-start">
                <div className="text-white text-2xl font-medium leading-9">Growth</div>
              </div>
            </div>
            <div className="w-64 h-6 pt-2 flex flex-col justify-start items-start">
              <div className="text-green-500 text-xs font-normal leading-4">
                48% of plan revenue
              </div>
            </div>
          </div>

          {/* Card 3: Failed payments */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-red-400/30 flex flex-col justify-start items-start">
            <div className="text-neutral-400 text-xs font-medium uppercase leading-4 tracking-wide">
              Failed payments
            </div>
            <div className="w-full pt-5 flex flex-col justify-start items-start">
              <div className="w-full pt-4 border-t border-zinc-800 flex flex-col justify-start items-start">
                <div className="text-white text-2xl font-medium leading-9">
                  {transactions.filter((t) => t.status === 'Failed').length}
                </div>
              </div>
            </div>
            <div className="w-64 h-6 pt-2 flex flex-col justify-start items-start">
              <div className="text-red-400 text-xs font-normal leading-4">
                $596 outstanding
              </div>
            </div>
          </div>

          {/* Card 4: Upcoming renewals */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
            <div className="text-neutral-400 text-xs font-medium uppercase leading-4 tracking-wide">
              Upcoming renewals
            </div>
            <div className="w-full pt-5 flex flex-col justify-start items-start">
              <div className="w-full pt-4 border-t border-zinc-800 flex flex-col justify-start items-start">
                <div className="text-white text-2xl font-medium leading-9">18</div>
              </div>
            </div>
            <div className="w-64 h-6 pt-2 flex flex-col justify-start items-start">
              <div className="text-neutral-400 text-xs font-normal leading-4">
                In the next 7 days
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Analytics Header & Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
          <div>
            <h2 className="text-white text-base font-semibold leading-5">Revenue analytics</h2>
            <p className="text-neutral-400 text-xs font-normal pt-1 leading-4">
              See which plans and tenants contribute the most revenue.
            </p>
          </div>
          <div className="inline-flex rounded-md overflow-hidden">
            <button
              onClick={() => setPeriod('Monthly')}
              className={`px-3 py-2 text-xs font-normal transition-colors cursor-pointer rounded-l-md outline outline-1 outline-offset-[-1px] outline-neutral-700 ${
                period === 'Monthly'
                  ? 'bg-yellow-500/30 text-white'
                  : 'bg-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod('Yearly')}
              className={`px-3 py-2 text-xs font-normal transition-colors cursor-pointer rounded-r-md outline outline-1 outline-offset-[-1px] outline-neutral-700 ${
                period === 'Yearly'
                  ? 'bg-yellow-500/30 text-white'
                  : 'bg-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* 2-Column Analytics: Revenue by Plan & Top Tenant Income */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue by Plan */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start pb-4">
                <div>
                  <h3 className="text-white text-base font-semibold leading-5">Revenue by plan</h3>
                  <p className="text-neutral-400 text-xs font-normal pt-1 leading-4">
                    Based on successful subscription payments.
                  </p>
                </div>
                <div className="px-2 py-1 bg-green-500/10 rounded-md flex items-center justify-center">
                  <span className="text-green-500 text-[10px] font-medium leading-4">
                    Growth leads
                  </span>
                </div>
              </div>

              {/* Progress bars list */}
              <div className="flex flex-col gap-5 pt-2">
                {/* Growth */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-2 bg-yellow-400 rounded-sm" />
                      <div>
                        <div className="text-white text-sm font-normal leading-5">Growth</div>
                        <div className="text-neutral-400 text-[10px] font-normal leading-4">
                          58 active tenants
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-xs font-medium leading-5">
                        {period === 'Monthly' ? '$13,642' : '$163,704'}
                      </div>
                      <div className="text-neutral-400 text-[10px] font-medium leading-4">48%</div>
                    </div>
                  </div>
                  <div className="w-full h-[5px] bg-neutral-700 rounded-sm overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-sm" style={{ width: '48%' }} />
                  </div>
                </div>

                {/* Pro */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-2 bg-indigo-500 rounded-sm" />
                      <div>
                        <div className="text-white text-sm font-normal leading-5">Pro</div>
                        <div className="text-neutral-400 text-[10px] font-normal leading-4">
                          24 active tenants
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-xs font-medium leading-5">
                        {period === 'Monthly' ? '$9,318' : '$111,816'}
                      </div>
                      <div className="text-neutral-400 text-[10px] font-medium leading-4">33%</div>
                    </div>
                  </div>
                  <div className="w-full h-[5px] bg-neutral-700 rounded-sm overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-sm" style={{ width: '33%' }} />
                  </div>
                </div>

                {/* Starter */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-2 bg-green-500 rounded-sm" />
                      <div>
                        <div className="text-white text-sm font-normal leading-5">Starter</div>
                        <div className="text-neutral-400 text-[10px] font-normal leading-4">
                          46 active tenants
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-xs font-medium leading-5">
                        {period === 'Monthly' ? '$5,460' : '$65,520'}
                      </div>
                      <div className="text-neutral-400 text-[10px] font-medium leading-4">19%</div>
                    </div>
                  </div>
                  <div className="w-full h-[5px] bg-neutral-700 rounded-sm overflow-hidden">
                    <div className="h-full bg-green-500 rounded-sm" style={{ width: '19%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Footer */}
            <div className="pt-6 mt-4 border-t border-zinc-800 flex justify-between items-center">
              <span className="text-neutral-400 text-xs font-normal leading-4">
                Total plan revenue
              </span>
              <span className="text-white text-base font-normal leading-6">
                {period === 'Monthly' ? '$28,420' : '$341,040'}
              </span>
            </div>
          </div>

          {/* Top Tenant Income */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start pb-2">
                <div>
                  <h3 className="text-white text-base font-semibold leading-5">Top tenant income</h3>
                  <p className="text-neutral-400 text-xs font-normal pt-1 leading-4">
                    Highest revenue-generating tenant accounts.
                  </p>
                </div>
                <button
                  onClick={() => toast.info('Displaying all active revenue contributors')}
                  className="px-3 py-1.5 bg-zinc-800 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-700 text-white text-xs font-medium cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                  View all
                </button>
              </div>

              {/* Ranked items list */}
              <div className="divide-y divide-zinc-800 pt-2">
                {/* 1 */}
                <div className="min-h-14 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-5 bg-neutral-800 rounded-md flex justify-center items-center">
                      <span className="text-neutral-400 text-[10px] font-normal">1</span>
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium leading-4">
                        Saffron Table Co.
                      </div>
                      <div className="text-neutral-400 text-[9px] font-normal leading-3">
                        Pro · Yearly
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 text-xs font-medium leading-4">$2,148</div>
                    <div className="text-neutral-400 text-[9px] font-medium leading-3">this month</div>
                  </div>
                </div>

                {/* 2 */}
                <div className="min-h-14 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-5 bg-neutral-800 rounded-md flex justify-center items-center">
                      <span className="text-neutral-400 text-[10px] font-normal">2</span>
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium leading-4">
                        Juniper Hospitality
                      </div>
                      <div className="text-neutral-400 text-[9px] font-normal leading-3">
                        Pro · Yearly
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 text-xs font-medium leading-4">$1,790</div>
                    <div className="text-neutral-400 text-[9px] font-medium leading-3">this month</div>
                  </div>
                </div>

                {/* 3 */}
                <div className="min-h-14 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-5 bg-neutral-800 rounded-md flex justify-center items-center">
                      <span className="text-neutral-400 text-[10px] font-normal">3</span>
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium leading-4">
                        Basil &amp; Stone
                      </div>
                      <div className="text-neutral-400 text-[9px] font-normal leading-3">
                        Growth · Yearly
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 text-xs font-medium leading-4">$1,490</div>
                    <div className="text-neutral-400 text-[9px] font-medium leading-3">this month</div>
                  </div>
                </div>

                {/* 4 */}
                <div className="min-h-14 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-5 bg-neutral-800 rounded-md flex justify-center items-center">
                      <span className="text-neutral-400 text-[10px] font-normal">4</span>
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium leading-4">
                        Oak &amp; Ember Group
                      </div>
                      <div className="text-neutral-400 text-[9px] font-normal leading-3">
                        Growth · Monthly
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 text-xs font-medium leading-4">$149</div>
                    <div className="text-neutral-400 text-[9px] font-medium leading-3">this month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Income by Tenant Table */}
        <div className="bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 overflow-hidden flex flex-col">
          {/* Card Header */}
          <div className="px-4 py-4 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-white text-base font-semibold leading-5">Income by tenant</h3>
              <p className="text-neutral-400 text-xs font-normal pt-1 leading-4">
                Subscription income and lifetime value for each tenant.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-zinc-800 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-700 text-white text-xs font-medium cursor-pointer hover:bg-zinc-700 transition-colors"
            >
              Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800">
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold">Tenant</th>
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold">Plan</th>
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold">Billing cycle</th>
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold">Income this month</th>
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold">Lifetime revenue</th>
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {INITIAL_TENANT_INCOME.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-3.5 py-3.5 text-zinc-100 text-xs font-medium">
                      {row.tenant}
                    </td>
                    <td className="px-3.5 py-3.5 text-zinc-300 text-xs font-normal">
                      {row.plan}
                    </td>
                    <td className="px-3.5 py-3.5 text-zinc-300 text-xs font-normal">
                      {row.billingCycle}
                    </td>
                    <td className="px-3.5 py-3.5 text-zinc-100 text-xs font-medium">
                      ${row.incomeThisMonth.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-3.5 text-zinc-300 text-xs font-normal">
                      ${row.lifetimeRevenue.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-3.5">
                      <span className="inline-block px-1.5 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-medium rounded-[5px]">
                        {row.contribution}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transactions Section Header & Checkbox Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
          <div>
            <h2 className="text-white text-base font-semibold leading-5">Transactions</h2>
            <p className="text-neutral-400 text-xs font-normal pt-1 leading-4">
              Latest subscription payments and refunds.
            </p>
          </div>

          {/* Interactive Checkbox matching Figma */}
          <button
            type="button"
            onClick={() => setFailedOnly((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div
              className={`size-3.5 rounded-[3px] border transition-colors flex items-center justify-center ${
                failedOnly
                  ? 'bg-yellow-400 border-yellow-400 text-black'
                  : 'bg-zinc-900 border-zinc-600 group-hover:border-zinc-400'
              }`}
            >
              {failedOnly && (
                <svg className="w-2.5 h-2.5 stroke-black" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6L4.8 8.5L9.5 3.5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="text-neutral-400 text-xs font-normal leading-4 group-hover:text-neutral-200 transition-colors">
              Failed payments only
            </span>
          </button>
        </div>

        {/* Transactions Table Card */}
        <div className="bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 overflow-hidden flex flex-col">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800">
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold">Tenant</th>
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold">Plan</th>
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold">Amount</th>
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold">Date</th>
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold">Status</th>
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold">Invoice / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-3.5 py-3.5 text-zinc-100 text-xs font-medium">
                      {tx.tenant}
                    </td>
                    <td className="px-3.5 py-3.5 text-zinc-300 text-xs font-normal">
                      {tx.plan}
                    </td>
                    <td className="px-3.5 py-3.5 text-zinc-300 text-xs font-normal">
                      ${tx.amount.toFixed(2)}
                    </td>
                    <td className="px-3.5 py-3.5 text-zinc-300 text-xs font-normal">
                      {tx.date}
                    </td>
                    <td className="px-3.5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium leading-4 ${
                          tx.status === 'Paid'
                            ? 'bg-green-500/10 text-green-500'
                            : tx.status === 'Failed'
                            ? 'bg-red-400/10 text-red-400'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-3.5">
                      {tx.status === 'Failed' ? (
                        <button
                          onClick={() => handleRetryPayment(tx)}
                          className="text-yellow-400 text-xs font-normal cursor-pointer hover:underline transition"
                        >
                          Retry
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownloadInvoice(tx.tenant, tx.date)}
                          className="text-yellow-400 text-xs font-normal cursor-pointer hover:underline transition"
                        >
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
