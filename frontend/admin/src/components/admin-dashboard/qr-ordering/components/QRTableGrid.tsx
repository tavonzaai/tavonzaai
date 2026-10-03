'use client';

import React, { useState } from 'react';
import { Eye, Printer, QrCode, ChevronLeft, ChevronRight } from 'lucide-react';
import { QRTableItem } from '../types';
import QRCodeGraphic from './QRCodeGraphic';
import { toast } from 'sonner';

export interface QRTableGridProps {
  tables: QRTableItem[];
  onSelectTable: (table: QRTableItem) => void;
  onPrintTable: (table: QRTableItem) => void;
}

export default function QRTableGrid({
  tables,
  onSelectTable,
  onPrintTable,
}: QRTableGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(tables.length / itemsPerPage) || 1;

  const currentTables = tables.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCopyLink = (table: QRTableItem) => {
    navigator.clipboard?.writeText?.(`https://${table.url}`);
    toast.success(`Copied QR Link for ${table.id}: https://${table.url}`);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Tables Grid */}
      {tables.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-base">No tables match your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {currentTables.map((table) => {
            const isBusy = table.status === 'Busy';

            return (
              <div
                key={table.id}
                className="w-full h-72 relative bg-white/5 rounded-[10px] border border-white/10 backdrop-blur-[10.20px] overflow-hidden p-3.5 flex flex-col justify-between hover:border-amber-400/40 transition-all duration-200 group"
              >
                {/* QR Code Container */}
                <div className="w-full h-32 bg-white/5 rounded-[10px] backdrop-blur-[10.20px] flex items-center justify-center relative overflow-hidden group-hover:bg-white/10 transition-colors">
                  <QRCodeGraphic size={82} tableId={table.id} color="#ffffff" />
                </div>

                {/* Table Header & Status */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-white text-lg font-semibold font-['Inter'] leading-6">
                      {table.id}
                    </h3>

                    {/* Status Pill */}
                    <div
                      className={`px-2 py-0.5 rounded-[5px] inline-flex items-center gap-1 shrink-0 ${
                        isBusy ? 'bg-yellow-950' : 'bg-neutral-900'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          isBusy ? 'bg-orange-600' : 'bg-emerald-500'
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold font-['Inter'] leading-4 ${
                          isBusy ? 'text-orange-600' : 'text-green-500'
                        }`}
                      >
                        {table.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-xs font-normal font-['Inter'] leading-4">
                    {table.seats} seats · {table.zone}
                  </p>
                </div>

                {/* Server & URL info */}
                <div className="space-y-0.5">
                  <div className="text-sm font-normal font-['Inter'] leading-4">
                    <span className="text-gray-500">Serve: </span>
                    <span className="text-gray-300">{table.server}</span>
                  </div>
                  <div className="text-gray-300 text-xs font-normal font-['Inter'] leading-3 truncate font-mono">
                    {table.url}
                  </div>
                </div>

                {/* Card Action Buttons Row */}
                <div className="flex items-center gap-2 pt-0.5">
                  {/* View Button */}
                  <button
                    type="button"
                    onClick={() => onSelectTable(table)}
                    className="w-14 h-6 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-[5px] border border-yellow-500 inline-flex justify-center items-center gap-1 text-yellow-500 text-sm font-semibold font-['Inter'] leading-4 transition-colors cursor-pointer"
                  >
                    <Eye className="w-2.5 h-2.5" />
                    <span>View</span>
                  </button>

                  {/* Print Button */}
                  <button
                    type="button"
                    onClick={() => onPrintTable(table)}
                    className="w-14 h-6 py-1.5 bg-white/5 hover:bg-white/10 rounded-[5px] border border-white/10 backdrop-blur-[10.20px] inline-flex justify-center items-center gap-1 text-white text-sm font-semibold font-['Inter'] leading-4 transition-colors cursor-pointer"
                  >
                    <Printer className="w-2.5 h-2.5 text-white" />
                    <span>Print</span>
                  </button>

                  {/* Copy Link / QR icon button */}
                  <button
                    type="button"
                    onClick={() => handleCopyLink(table)}
                    title="Copy QR URL"
                    className="w-7 h-6 p-1.5 bg-white/5 hover:bg-white/10 rounded-[5px] border border-white/10 backdrop-blur-[10.20px] inline-flex justify-center items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <QrCode className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-900">
        <div className="text-zinc-500 text-sm sm:text-base font-medium font-['Inter']">
          Showing {currentTables.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
          {Math.min(currentPage * itemsPerPage, tables.length)} of {tables.length} results
        </div>

        {/* Page numbers */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-9 h-9 rounded border border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 flex items-center justify-center transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => {
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded text-sm font-medium font-['Inter'] transition cursor-pointer ${
                  isActive
                    ? 'border border-yellow-500 text-yellow-500 bg-yellow-500/10 shadow-[0px_0px_3px_0px_rgba(255,185,0,0.80)] font-bold'
                    : 'border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-9 h-9 rounded border border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 flex items-center justify-center transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View All Button */}
        <button
          type="button"
          onClick={() => setCurrentPage(1)}
          className="h-9 px-4 bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-semibold font-['Inter'] rounded-[5px] shadow-sm shadow-yellow-500/20 transition cursor-pointer"
        >
          View All
        </button>
      </div>
    </div>
  );
}
