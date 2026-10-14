'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { AddTenantModal } from '@/components/tenants/AddTenantModal';
import { useGetAllTenantsQuery, TenantItem, DEFAULT_TENANTS } from '@/redux/features/superadminApi';

export const dynamic = 'force-dynamic';

function TenantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get('search') || '';
  const shouldOpenModal = searchParams?.get('openModal') === 'true';

  const { data: tenants = DEFAULT_TENANTS } = useGetAllTenantsQuery();
  const [localTenants, setLocalTenants] = useState<TenantItem[]>(tenants);

  // Filter States matching Figma
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [planFilter, setPlanFilter] = useState('All plans');
  const [cycleFilter, setCycleFilter] = useState('All cycles');
  const [isAddModalOpen, setIsAddModalOpen] = useState(shouldOpenModal);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filteredTenants = useMemo(() => {
    return localTenants.filter((tenant) => {
      const matchesSearch =
        tenant.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'All statuses' ||
        tenant.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesPlan =
        planFilter === 'All plans' ||
        tenant.plan.toLowerCase() === planFilter.toLowerCase();

      const matchesCycle =
        cycleFilter === 'All cycles' ||
        tenant.billingCycle.toLowerCase() === cycleFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPlan && matchesCycle;
    });
  }, [localTenants, searchTerm, statusFilter, planFilter, cycleFilter]);

  const totalCount = 128; // Display total 128 tenants as in Figma
  const paginatedTenants = filteredTenants.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleTenantCreated = (newTenant: TenantItem) => {
    setLocalTenants((prev) => [newTenant, ...prev]);
  };

  return (
    <SuperAdminLayout>
      <div className="flex flex-col justify-start items-start w-full animate-fade-in font-inter text-white">
        
        {/* Page Header matching Figma */}
        <div className="self-stretch min-h-16 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col justify-start items-start">
            <h1 className="text-white text-3xl font-semibold leading-9">
              Tenants
            </h1>
            <p className="text-zinc-500 text-sm font-normal leading-6 pt-[5px]">
              Manage restaurant owners and their subscriptions.
            </p>
          </div>

          {/* + Add tenant button matching Figma */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="min-h-9 px-3 py-2 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400 flex justify-center items-center cursor-pointer transition shadow-sm"
          >
            <span className="text-center text-neutral-800 text-xs font-medium leading-5">
              + Add tenant
            </span>
          </button>
        </div>

        {/* Filter Controls matching Figma */}
        <div className="w-full pt-7 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          {/* Search Box matching Figma */}
          <div className="w-full sm:w-80 h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center overflow-hidden focus-within:outline-zinc-500 transition">
            <input
              type="text"
              placeholder="Search owner or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white text-xs font-normal placeholder-stone-300/50 focus:outline-none"
            />
          </div>

          {/* 3 Dropdowns matching Figma */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0">
            {/* Status Dropdown */}
            <div className="w-32 h-10 min-w-32 relative bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 overflow-hidden flex items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-full bg-transparent text-stone-300 text-xs font-normal pl-4 pr-7 focus:outline-none cursor-pointer appearance-none"
              >
                <option value="All statuses" className="bg-neutral-900 text-white">All statuses</option>
                <option value="Active" className="bg-neutral-900 text-white">Active</option>
                <option value="Trial" className="bg-neutral-900 text-white">Trial</option>
                <option value="Past Due" className="bg-neutral-900 text-white">Past Due</option>
                <option value="Suspended" className="bg-neutral-900 text-white">Suspended</option>
                <option value="Cancelled" className="bg-neutral-900 text-white">Cancelled</option>
              </select>
              <div className="w-5 h-9 right-2 absolute flex justify-center items-center pointer-events-none">
                <span className="text-stone-300 text-xs">⌄</span>
              </div>
            </div>

            {/* Plans Dropdown */}
            <div className="w-32 h-10 min-w-32 relative bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 overflow-hidden flex items-center">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="w-full h-full bg-transparent text-stone-300 text-xs font-normal pl-4 pr-7 focus:outline-none cursor-pointer appearance-none"
              >
                <option value="All plans" className="bg-neutral-900 text-white">All plans</option>
                <option value="Starter" className="bg-neutral-900 text-white">Starter</option>
                <option value="Basic" className="bg-neutral-900 text-white">Basic</option>
                <option value="Growth" className="bg-neutral-900 text-white">Growth</option>
                <option value="Pro" className="bg-neutral-900 text-white">Pro</option>
                <option value="Enterprise" className="bg-neutral-900 text-white">Enterprise</option>
              </select>
              <div className="w-5 h-9 right-2 absolute flex justify-center items-center pointer-events-none">
                <span className="text-stone-300 text-xs">⌄</span>
              </div>
            </div>

            {/* Cycles Dropdown */}
            <div className="w-32 h-10 min-w-32 relative bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 overflow-hidden flex items-center">
              <select
                value={cycleFilter}
                onChange={(e) => setCycleFilter(e.target.value)}
                className="w-full h-full bg-transparent text-stone-300 text-xs font-normal pl-4 pr-7 focus:outline-none cursor-pointer appearance-none"
              >
                <option value="All cycles" className="bg-neutral-900 text-white">All cycles</option>
                <option value="Monthly" className="bg-neutral-900 text-white">Monthly</option>
                <option value="Yearly" className="bg-neutral-900 text-white">Yearly</option>
              </select>
              <div className="w-5 h-9 right-2 absolute flex justify-center items-center pointer-events-none">
                <span className="text-stone-300 text-xs">⌄</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tenants Table Container matching Figma */}
        <div className="self-stretch pt-4 flex flex-col justify-start items-start w-full">
          <div className="self-stretch bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start overflow-hidden">
            
            {/* Table wrapper */}
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[980px]">
                {/* Table Header matching exact Figma widths */}
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-xs font-semibold leading-4">
                    <th className="w-60 h-12 px-3.5 py-2.5">Owner / Business</th>
                    <th className="w-28 h-12 px-3.5 py-2.5">Plan</th>
                    <th className="w-40 h-12 px-3.5 py-2.5">Billing cycle</th>
                    <th className="w-40 h-12 px-3.5 py-2.5">Restaurants</th>
                    <th className="w-32 h-12 px-3.5 py-2.5">Branches</th>
                    <th className="w-44 h-12 px-3.5 py-2.5">Status</th>
                    <th className="w-44 h-12 px-3.5 py-2.5">Joined</th>
                    <th className="w-28 h-12 px-3.5 py-2.5 text-right sm:text-left">Action</th>
                  </tr>
                </thead>

                {/* Table Body matching exact Figma rows */}
                <tbody className="divide-y divide-zinc-800">
                  {paginatedTenants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500 text-xs">
                        No tenants match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedTenants.map((tenant) => (
                      <tr
                        key={tenant.id}
                        className="hover:bg-zinc-800/30 transition group font-inter"
                      >
                        {/* Owner / Business */}
                        <td className="w-60 h-14 px-3.5 py-2.5 border-b border-zinc-800">
                          <div className="w-52 flex flex-col justify-start items-start">
                            <Link
                              href={`/superadmin/tenants/${tenant.id}`}
                              className="text-zinc-100 text-xs font-medium leading-4 group-hover:text-yellow-400 transition-colors"
                            >
                              {tenant.ownerName}
                            </Link>
                            <span className="text-neutral-400 text-[10px] font-normal leading-4 pt-1">
                              {tenant.businessName || tenant.name}
                            </span>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="w-28 h-14 px-3.5 py-2.5 border-b border-zinc-800">
                          <span className="text-zinc-300 text-xs font-normal leading-4">
                            {tenant.plan}
                          </span>
                        </td>

                        {/* Billing cycle */}
                        <td className="w-40 h-14 px-3.5 py-2.5 border-b border-zinc-800">
                          <span className="text-zinc-300 text-xs font-normal leading-4">
                            {tenant.billingCycle}
                          </span>
                        </td>

                        {/* Restaurants */}
                        <td className="w-40 h-14 px-3.5 py-2.5 border-b border-zinc-800">
                          <span className="text-zinc-300 text-xs font-normal leading-4">
                            {tenant.restaurantsCount}
                          </span>
                        </td>

                        {/* Branches */}
                        <td className="w-32 h-14 px-3.5 py-2.5 border-b border-zinc-800">
                          <span className="text-zinc-300 text-xs font-normal leading-4">
                            {tenant.branchesCount}
                          </span>
                        </td>

                        {/* Status Badge matching Figma */}
                        <td className="w-44 h-14 px-3.5 py-2.5 border-b border-zinc-800">
                          {tenant.status === 'Active' && (
                            <div className="h-6 min-h-6 px-2 py-1 bg-green-500/10 rounded-md inline-flex justify-center items-center">
                              <span className="text-green-500 text-[10px] font-medium leading-4">
                                Active
                              </span>
                            </div>
                          )}
                          {tenant.status === 'Trial' && (
                            <div className="h-6 min-h-6 px-2 py-1 bg-yellow-400/10 rounded-md inline-flex justify-center items-center">
                              <span className="text-yellow-400 text-[10px] font-medium leading-4">
                                Trial
                              </span>
                            </div>
                          )}
                          {tenant.status === 'Past Due' && (
                            <div className="h-6 min-h-6 px-2 py-1 bg-red-400/10 rounded-md inline-flex justify-center items-center">
                              <span className="text-red-400 text-[10px] font-medium leading-4">
                                Past Due
                              </span>
                            </div>
                          )}
                          {tenant.status === 'Suspended' && (
                            <div className="h-6 min-h-6 px-2 py-1 bg-amber-500/10 rounded-md inline-flex justify-center items-center">
                              <span className="text-amber-500 text-[10px] font-medium leading-4">
                                Suspended
                              </span>
                            </div>
                          )}
                          {tenant.status === 'Cancelled' && (
                            <div className="h-6 min-h-6 px-2 py-1 bg-neutral-400/10 rounded-md inline-flex justify-center items-center">
                              <span className="text-neutral-400 text-[10px] font-medium leading-4">
                                Cancelled
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="w-44 h-14 px-3.5 py-2.5 border-b border-zinc-800">
                          <span className="text-zinc-300 text-xs font-normal leading-4">
                            {tenant.joinedDate}
                          </span>
                        </td>

                        {/* View Action matching Figma */}
                        <td className="w-28 h-14 px-3.5 py-2.5 border-b border-zinc-800 text-right sm:text-left">
                          <Link
                            href={`/superadmin/tenants/${tenant.id}`}
                            className="text-yellow-400 hover:text-yellow-300 text-xs font-normal leading-4 inline-flex items-center gap-1 hover:underline transition"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer matching Figma */}
            <div className="self-stretch px-4 py-3.5 border-t border-zinc-800 flex justify-between items-center w-full">
              <span className="text-neutral-400 text-xs font-normal leading-4">
                Showing {paginatedTenants.length} of {totalCount} tenants
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="min-h-9 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center transition cursor-pointer"
                >
                  <span className="text-center text-neutral-200 text-xs font-medium leading-5">
                    Previous
                  </span>
                </button>
                <button
                  disabled={paginatedTenants.length < pageSize}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="min-h-9 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center transition cursor-pointer"
                >
                  <span className="text-center text-neutral-200 text-xs font-medium leading-5">
                    Next
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Tenant Modal */}
      <AddTenantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTenantCreated={handleTenantCreated}
      />
    </SuperAdminLayout>
  );
}

export default function SuperAdminTenantsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-zinc-500 flex items-center justify-center">Loading tenants...</div>}>
      <TenantsContent />
    </Suspense>
  );
}
