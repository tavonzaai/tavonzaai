'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RecentSignup } from '@/redux/features/superadminApi';
import { Search, Building, User, Calendar, ExternalLink, X, Shield, Store } from 'lucide-react';
import { toast } from 'sonner';

interface RecentSignupsTableProps {
  signups: RecentSignup[];
}

export function RecentSignupsTable({ signups }: RecentSignupsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSignup, setSelectedSignup] = useState<RecentSignup | null>(null);

  const filteredSignups = signups.filter((s) =>
    s.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
        {/* Header matching Figma */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div className="flex flex-col">
            <h3 className="text-white text-base font-semibold font-inter leading-5">
              Recent signups
            </h3>
            <span className="text-neutral-400 text-xs font-normal font-inter leading-4 pt-1">
              New tenant accounts created this month.
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search signups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 w-36 sm:w-48 font-inter"
              />
            </div>

            {/* View All Button */}
            <Link
              href="/tenants"
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-700 text-white text-xs font-medium font-inter transition"
            >
              View all
            </Link>
          </div>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            {/* Table Header matching Figma */}
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-xs font-semibold font-inter">
                <th className="py-2.5 px-3.5 w-2/5 font-semibold">Owner / Business</th>
                <th className="py-2.5 px-3.5 w-1/6 font-semibold">Plan</th>
                <th className="py-2.5 px-3.5 w-1/5 font-semibold">Signup date</th>
                <th className="py-2.5 px-3.5 w-1/6 font-semibold">Status</th>
                <th className="py-2.5 px-3.5 w-16 text-right"></th>
              </tr>
            </thead>

            {/* Table Body matching Figma */}
            <tbody className="divide-y divide-zinc-800">
              {filteredSignups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500 text-xs">
                    No matching tenants found.
                  </td>
                </tr>
              ) : (
                filteredSignups.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-zinc-800/30 transition group font-inter"
                  >
                    {/* Owner / Business */}
                    <td className="py-3 px-3.5">
                      <div className="flex flex-col">
                        <span className="text-zinc-100 text-xs font-medium leading-4 group-hover:text-yellow-400 transition-colors">
                          {row.ownerName}
                        </span>
                        <span className="text-neutral-400 text-[10px] font-normal leading-4 pt-0.5">
                          {row.businessName}
                        </span>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="py-3 px-3.5">
                      <span className="text-zinc-300 text-xs font-normal">
                        {row.plan}
                      </span>
                    </td>

                    {/* Signup Date */}
                    <td className="py-3 px-3.5">
                      <span className="text-zinc-300 text-xs font-normal">
                        {row.signupDate}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3.5">
                      {row.status === 'Active' && (
                        <div className="h-6 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-md inline-flex items-center justify-center">
                          <span className="text-green-500 text-[10px] font-medium leading-4">
                            Active
                          </span>
                        </div>
                      )}
                      {row.status === 'Trial' && (
                        <div className="h-6 px-2 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-md inline-flex items-center justify-center">
                          <span className="text-yellow-400 text-[10px] font-medium leading-4">
                            Trial
                          </span>
                        </div>
                      )}
                      {row.status === 'Past Due' && (
                        <div className="h-6 px-2 py-1 bg-red-400/10 border border-red-500/20 rounded-md inline-flex items-center justify-center">
                          <span className="text-red-400 text-[10px] font-medium leading-4">
                            Past Due
                          </span>
                        </div>
                      )}
                    </td>

                    {/* View Action matching Figma (yellow-400 text) */}
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={() => setSelectedSignup(row)}
                        className="text-yellow-400 hover:text-yellow-300 text-xs font-normal hover:underline inline-flex items-center gap-1 transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Detail Drawer / Modal */}
      {selectedSignup && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-zinc-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-fade-in font-inter">
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-lg">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-base">{selectedSignup.businessName}</h4>
                  <p className="text-zinc-400 text-xs">Primary Contact: {selectedSignup.ownerName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSignup(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                  <span className="text-[10px] uppercase text-zinc-500 font-medium tracking-wider">Account Status</span>
                  <div className="text-xs font-semibold text-white mt-0.5">{selectedSignup.status}</div>
                </div>
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                  <span className="text-[10px] uppercase text-zinc-500 font-medium tracking-wider">Subscription Tier</span>
                  <div className="text-xs font-semibold text-yellow-400 mt-0.5">{selectedSignup.plan} Tier</div>
                </div>
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                  <span className="text-[10px] uppercase text-zinc-500 font-medium tracking-wider">Active Locations</span>
                  <div className="text-xs font-semibold text-white mt-0.5">{selectedSignup.branchesCount} Branches</div>
                </div>
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                  <span className="text-[10px] uppercase text-zinc-500 font-medium tracking-wider">Onboarding Date</span>
                  <div className="text-xs font-semibold text-white mt-0.5">{selectedSignup.signupDate}</div>
                </div>
              </div>

              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase text-zinc-500 font-medium tracking-wider">Contact &amp; Domain</span>
                <p className="text-xs text-zinc-300 font-mono">{selectedSignup.email}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  toast.success(`Simulating tenant login for ${selectedSignup.businessName}...`);
                  setSelectedSignup(null);
                }}
                className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl transition flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Impersonate Tenant</span>
              </button>
              <button
                onClick={() => setSelectedSignup(null)}
                className="py-2 px-4 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
