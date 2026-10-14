'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { useGetTenantByIdQuery, DEFAULT_TENANTS } from '@/redux/features/superadminApi';
import { toast } from 'sonner';

export default function SuperAdminTenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.id as string) || 't-1';

  const { data: tenant = DEFAULT_TENANTS[0] } = useGetTenantByIdQuery(tenantId);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Subscription' | 'Activity'>('Overview');
  const [isSuspended, setIsSuspended] = useState(tenant.status === 'Suspended');

  const toggleSuspend = () => {
    if (isSuspended) {
      setIsSuspended(false);
      toast.success(`${tenant.name} has been reactivated.`);
    } else {
      setIsSuspended(true);
      toast.error(`${tenant.name} has been suspended.`);
    }
  };

  const branchesRatio = Math.min(100, Math.round((tenant.branchesCount / tenant.branchesMax) * 100));

  return (
    <SuperAdminLayout>
      <div className="flex flex-col justify-start items-start w-full animate-fade-in font-inter text-white">
        
        {/* Back Link matching Figma */}
        <div className="self-stretch h-9 relative">
          <Link
            href="/superadmin/tenants"
            className="text-neutral-400 hover:text-white text-xs font-semibold font-poppins leading-4 flex items-center gap-1 transition"
          >
            ← Back to tenants
          </Link>
        </div>

        {/* Tenant Header matching Figma */}
        <div className="self-stretch min-h-16 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col justify-start items-start">
            <h1 className="text-white text-3xl font-semibold leading-9">
              {tenant.name}
            </h1>
            <p className="text-zinc-500 text-sm font-normal leading-6 pt-[5px]">
              Tenant since {tenant.joinedDate}
            </p>
          </div>

          {/* Status Badge & Suspend Button matching Figma */}
          <div className="flex items-center gap-2.5">
            <div
              className={`min-h-6 px-2 py-1 rounded-md flex justify-center items-center ${
                isSuspended
                  ? 'bg-amber-500/10 text-amber-500'
                  : tenant.status === 'Active'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-yellow-400/10 text-yellow-400'
              }`}
            >
              <span className="text-[10px] font-medium leading-4">
                {isSuspended ? 'Suspended' : tenant.status}
              </span>
            </div>

            <button
              onClick={toggleSuspend}
              className={`min-h-9 px-3 py-2 rounded-lg outline outline-1 outline-offset-[-1px] text-xs font-medium leading-5 transition cursor-pointer ${
                isSuspended
                  ? 'bg-emerald-500/20 outline-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                  : 'bg-red-400/20 outline-red-400/40 text-red-400 hover:bg-red-400/30'
              }`}
            >
              {isSuspended ? 'Reactivate' : 'Suspend'}
            </button>
          </div>
        </div>

        {/* 4 Stat Cards Row matching Figma */}
        <div className="self-stretch pt-7 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            
            {/* Card 1: Plan */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
              <span className="text-neutral-400 text-xs font-medium uppercase leading-4 tracking-wide">
                Plan
              </span>
              <div className="h-12 pt-4 flex flex-col justify-start items-start">
                <span className="text-white text-xl font-medium leading-8">
                  {tenant.plan}
                </span>
              </div>
            </div>

            {/* Card 2: Billing cycle */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
              <span className="text-neutral-400 text-xs font-medium uppercase leading-4 tracking-wide">
                Billing cycle
              </span>
              <div className="h-12 pt-4 flex flex-col justify-start items-start">
                <span className="text-white text-xl font-medium leading-8">
                  {tenant.billingCycle}
                </span>
              </div>
            </div>

            {/* Card 3: Next billing date */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
              <span className="text-neutral-400 text-xs font-medium uppercase leading-4 tracking-wide">
                Next billing date
              </span>
              <div className="h-12 pt-4 flex flex-col justify-start items-start">
                <span className="text-white text-xl font-medium leading-8">
                  {tenant.nextBillingDate}
                </span>
              </div>
            </div>

            {/* Card 4: Branches used with yellow progress bar */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
              <span className="text-neutral-400 text-xs font-medium uppercase leading-4 tracking-wide">
                Branches used
              </span>
              <div className="h-12 pt-4 flex flex-col justify-start items-start w-full">
                <span className="text-white text-xl font-medium leading-8">
                  {tenant.branchesCount} of {tenant.branchesMax}
                </span>
              </div>
              <div className="self-stretch pt-4 flex flex-col justify-start items-start w-full">
                <div className="self-stretch h-1 bg-neutral-700 rounded-sm overflow-hidden flex flex-col justify-start items-start">
                  <div
                    className="h-1 bg-yellow-400 transition-all duration-500"
                    style={{ width: `${branchesRatio}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation matching Figma */}
        <div className="self-stretch pt-6 flex flex-col justify-start items-start w-full">
          <div className="self-stretch h-12 border-b border-zinc-800 flex justify-start items-start gap-7">
            {(['Overview', 'Subscription', 'Activity'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 transition-colors text-sm font-normal leading-5 border-b-2 cursor-pointer ${
                    isActive
                      ? 'border-yellow-400 text-white font-medium'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Contents matching Figma */}
        <div className="self-stretch pt-4 w-full">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              
              {/* Left Card: Owner information matching Figma */}
              <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
                <h3 className="text-white text-base font-semibold leading-5 pb-5">
                  Owner information
                </h3>

                <div className="self-stretch flex flex-col gap-3">
                  <div className="flex flex-col">
                    <span className="text-neutral-400 text-sm font-normal leading-5">Name</span>
                    <span className="text-neutral-200 text-sm font-normal leading-5 pt-0.5">{tenant.ownerName}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-neutral-400 text-sm font-normal leading-5">Email</span>
                    <span className="text-neutral-200 text-sm font-normal leading-5 pt-0.5">{tenant.email}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-neutral-400 text-sm font-normal leading-5">Phone</span>
                    <span className="text-neutral-200 text-sm font-normal leading-5 pt-0.5">{tenant.phone}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-neutral-400 text-sm font-normal leading-5">Company</span>
                    <span className="text-neutral-200 text-sm font-normal leading-5 pt-0.5">{tenant.company}</span>
                  </div>
                </div>
              </div>

              {/* Right Card: Restaurants & branches matching Figma */}
              <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
                <h3 className="text-white text-base font-semibold leading-5 pb-1">
                  Restaurants &amp; branches
                </h3>

                <div className="self-stretch divide-y divide-zinc-800 pt-2">
                  {tenant.restaurants.map((rest) => (
                    <div
                      key={rest.id}
                      className="h-12 min-h-12 flex justify-between items-center"
                    >
                      <span className="text-white text-sm font-normal leading-5">
                        {rest.name}
                      </span>
                      <span className="text-neutral-400 text-xs font-normal leading-4">
                        {rest.branchesCount} {rest.branchesCount === 1 ? 'branch' : 'branches'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. SUBSCRIPTION TAB matching Figma */}
          {activeTab === 'Subscription' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              
              {/* Left Card: Subscription matching Figma */}
              <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
                <div className="self-stretch flex justify-between items-center pb-5">
                  <h3 className="text-white text-base font-semibold leading-5">
                    Subscription
                  </h3>
                  <button
                    onClick={() => toast.info('Plan upgrade modal opened.')}
                    className="min-h-9 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-200 text-xs font-medium leading-5 transition cursor-pointer"
                  >
                    Change plan
                  </button>
                </div>

                <div className="self-stretch flex flex-col gap-3">
                  <div className="flex flex-col">
                    <span className="text-neutral-400 text-sm font-normal leading-5">Current plan</span>
                    <span className="text-neutral-200 text-sm font-normal leading-5 pt-0.5">
                      {tenant.plan} &bull; ${tenant.mrr}/month
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-neutral-400 text-sm font-normal leading-5">Payment method</span>
                    <span className="text-neutral-200 text-sm font-normal leading-5 pt-0.5">
                      {tenant.paymentMethod}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-neutral-400 text-sm font-normal leading-5">Renewal</span>
                    <span className="text-neutral-200 text-sm font-normal leading-5 pt-0.5">
                      {tenant.nextBillingDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Card: Invoice history matching Figma */}
              <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
                <h3 className="text-white text-base font-semibold leading-5 pb-1">
                  Invoice history
                </h3>

                <div className="self-stretch divide-y divide-zinc-800 pt-2">
                  {tenant.invoices.length === 0 ? (
                    <div className="py-6 text-center text-zinc-500 text-xs">
                      No invoices recorded yet (Tenant on Trial).
                    </div>
                  ) : (
                    tenant.invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="h-12 min-h-12 flex justify-between items-center"
                      >
                        <span className="text-white text-sm font-normal leading-5">
                          {inv.date} &bull; ${inv.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => toast.success(`Receipt ${inv.id} downloaded.`)}
                          className="text-yellow-400 hover:text-yellow-300 text-xs font-normal leading-4 cursor-pointer hover:underline"
                        >
                          Download
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. ACTIVITY TAB */}
          {activeTab === 'Activity' && (
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start w-full">
              <h3 className="text-white text-base font-semibold leading-5 pb-4">
                Platform Activity &amp; Audit Trail
              </h3>

              <div className="self-stretch divide-y divide-zinc-800">
                <div className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-white font-medium">New location provisioned</span>
                    <span className="text-zinc-500 block text-[11px]">Branch: Midtown Downtown &bull; 10 mins ago</span>
                  </div>
                  <span className="text-emerald-400 font-medium">Success</span>
                </div>

                <div className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-white font-medium">Monthly billing renewal processed</span>
                    <span className="text-zinc-500 block text-[11px]">Stripe Charge #ch_89128 &bull; Jun 12, 2024</span>
                  </div>
                  <span className="text-emerald-400 font-medium">$149.00</span>
                </div>

                <div className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-white font-medium">AI Barista &amp; Waiter module enabled</span>
                    <span className="text-zinc-500 block text-[11px]">Branch: The Ember Room &bull; May 28, 2024</span>
                  </div>
                  <span className="text-amber-400 font-medium">Configured</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
}
