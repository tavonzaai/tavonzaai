'use client';

import React, { useState, useEffect } from 'react';
import { CardMember, CardTier } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Users,
} from 'lucide-react';

interface TavonzaCardTableProps {
  members: CardMember[];
  onViewMember: (member: CardMember) => void;
  onDeleteMember: (memberId: string) => void;
  itemsPerPage?: number;
}

export default function TavonzaCardTable({
  members,
  onViewMember,
  onDeleteMember,
  itemsPerPage = 10,
}: TavonzaCardTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [members.length]);

  const totalPages = Math.ceil(members.length / itemsPerPage) || 1;
  const paginatedMembers = members.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, members.length);

  const getTierBadge = (tier: CardTier) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-400/20 text-purple-400 border border-purple-500/30';
      case 'Gold':
        return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30';
      case 'Silver':
        return 'bg-gray-600/20 text-slate-300 border border-slate-500/30';
      case 'Bronze':
        return 'bg-orange-700/20 text-orange-400 border border-orange-600/30';
    }
  };

  if (members.length === 0) {
    return (
      <div className="w-full py-16 px-6 bg-stone-950 rounded-[10px] outline outline-1 outline-zinc-800 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Users className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-white text-lg font-semibold">No card members found</h3>
          <p className="text-zinc-500 text-sm max-w-sm">
            No loyalty card members match your selected tier filter or search keywords.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="w-full bg-stone-950 rounded-[10px] outline outline-1 outline-zinc-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[950px]">
            {/* Table Header matching Figma */}
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 h-14">
                <th className="px-6 text-white text-sm sm:text-base font-semibold font-['Inter']">
                  Card ID
                </th>
                <th className="px-6 text-white text-sm sm:text-base font-semibold font-['Inter']">
                  Member
                </th>
                <th className="px-6 text-white text-sm sm:text-base font-semibold font-['Inter'] text-center">
                  Tier
                </th>
                <th className="px-6 text-white text-sm sm:text-base font-semibold font-['Inter'] text-right">
                  Points
                </th>
                <th className="px-6 text-white text-sm sm:text-base font-semibold font-['Inter'] text-right">
                  Total Spend
                </th>
                <th className="px-6 text-white text-sm sm:text-base font-semibold font-['Inter'] text-center">
                  Visits
                </th>
                <th className="px-6 text-white text-sm sm:text-base font-semibold font-['Inter']">
                  Last Visit
                </th>
                <th className="px-6 text-white text-sm sm:text-base font-semibold font-['Inter']">
                  Joined
                </th>
                <th className="px-6 text-white text-sm sm:text-base font-semibold font-['Inter'] text-center">
                  Status
                </th>
                <th className="px-6 text-white text-sm sm:text-base font-semibold font-['Inter'] text-right">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-800">
              {paginatedMembers.map((member) => (
                <tr
                  key={member.id}
                  onClick={() => onViewMember(member)}
                  className="hover:bg-zinc-900/60 transition-colors cursor-pointer group h-[58px]"
                >
                  {/* Card ID */}
                  <td className="px-6 py-3.5 text-white text-sm font-semibold font-['Inter'] whitespace-nowrap">
                    {member.cardId}
                  </td>

                  {/* Member info */}
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-semibold font-['Inter'] group-hover:text-amber-400 transition-colors">
                        {member.name}
                      </span>
                      <span className="text-gray-400 text-sm font-normal font-['Inter']">
                        {member.email}
                      </span>
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="px-6 py-3.5 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-sm font-semibold font-['Inter'] leading-4 ${getTierBadge(
                        member.tier
                      )}`}
                    >
                      {member.tier}
                    </span>
                  </td>

                  {/* Points */}
                  <td className="px-6 py-3.5 text-right text-white text-sm font-medium font-['Inter'] whitespace-nowrap">
                    {member.points.toLocaleString()}
                  </td>

                  {/* Total Spend */}
                  <td className="px-6 py-3.5 text-right text-white text-sm font-medium font-['Inter'] whitespace-nowrap">
                    ${member.totalSpend.toLocaleString()}
                  </td>

                  {/* Visits */}
                  <td className="px-6 py-3.5 text-center text-white text-sm font-normal font-['Inter'] whitespace-nowrap">
                    {member.visits}
                  </td>

                  {/* Last Visit */}
                  <td className="px-6 py-3.5 text-white text-sm font-medium font-['Inter'] whitespace-nowrap">
                    {member.lastVisit}
                  </td>

                  {/* Joined */}
                  <td className="px-6 py-3.5 text-white text-sm font-normal font-['Inter'] whitespace-nowrap">
                    {member.joined}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-3.5 text-center whitespace-nowrap">
                    {member.status === 'Active' ? (
                      <span className="inline-block px-2.5 py-0.5 bg-green-950 border border-green-500/30 text-green-500 rounded-[5px] text-sm font-medium font-['Inter'] leading-4">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 bg-neutral-600/20 text-neutral-300 rounded-[5px] text-sm font-medium font-['Inter'] leading-4">
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td
                    className="px-6 py-3.5 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewMember(member)}
                        title="View Loyalty Card & Details"
                        className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteMember(member.id)}
                        title="Delete Member"
                        className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer matching Figma */}
      <div className="py-4 px-6 bg-stone-950 border border-zinc-800 rounded-[10px] flex flex-col sm:flex-row items-center justify-between gap-3 w-full shadow-lg">
        <div className="text-zinc-400 text-sm sm:text-base font-medium font-['Inter']">
          Showing <span className="text-white font-semibold">{startIdx}</span> to{' '}
          <span className="text-white font-semibold">{endIdx}</span> of{' '}
          <span className="text-white font-semibold">{members.length}</span> members
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-sm border border-zinc-600 bg-transparent text-zinc-400 hover:text-white hover:border-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-sm text-base font-medium font-['Inter'] flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'border border-orange-500 text-orange-500 font-bold shadow-sm'
                    : 'border border-zinc-600 text-zinc-500 hover:text-white hover:border-zinc-400'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-sm border border-zinc-600 bg-transparent text-zinc-400 hover:text-white hover:border-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
