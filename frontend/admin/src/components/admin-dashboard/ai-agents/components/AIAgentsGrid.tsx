'use client';

import React, { useState, useEffect } from 'react';
import AIAgentCard from './AIAgentCard';
import { AIAgentItem } from '../types';
import { Bot, ChevronLeft, ChevronRight } from 'lucide-react';

interface AIAgentsGridProps {
  agents: AIAgentItem[];
  onToggleStatus: (agent: AIAgentItem) => void;
  onOpenDetails: (agent: AIAgentItem) => void;
  itemsPerPage?: number;
}

export default function AIAgentsGrid({
  agents,
  onToggleStatus,
  onOpenDetails,
  itemsPerPage = 10,
}: AIAgentsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [agents.length]);

  const totalPages = Math.ceil(agents.length / itemsPerPage) || 1;
  const paginatedAgents = agents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, agents.length);

  if (agents.length === 0) {
    return (
      <div className="w-full py-16 px-6 bg-neutral-900 rounded-[10px] outline outline-1 outline-slate-800 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Bot className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-white text-lg font-semibold">No AI Agents found</h3>
          <p className="text-zinc-500 text-sm max-w-sm">
            All configured autonomous agents are running in the background.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-5 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
        {paginatedAgents.map((agent) => (
          <AIAgentCard
            key={agent.id}
            agent={agent}
            onToggleStatus={onToggleStatus}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </div>

      {/* Pagination Footer (when more than itemsPerPage) */}
      {agents.length > itemsPerPage && (
        <div className="py-4 px-6 bg-[#131417] border border-[#22242a] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 w-full shadow-lg">
          <div className="text-zinc-400 text-sm font-medium font-['Inter']">
            Showing <span className="text-white font-semibold">{startIdx}</span> to{' '}
            <span className="text-white font-semibold">{endIdx}</span> of{' '}
            <span className="text-white font-semibold">{agents.length}</span> autonomous agents
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-neutral-900 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-sm font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-yellow-500 text-white font-bold shadow-sm shadow-yellow-500/20'
                      : 'bg-neutral-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
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
              className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-neutral-900 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
