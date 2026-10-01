'use client';

import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { ShiftStats, ShiftInfo, TopPerformingItem } from '../types';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftInfo: ShiftInfo;
  stats: ShiftStats;
  topItems: TopPerformingItem[];
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  shiftInfo,
  stats,
  topItems,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 font-['Inter']">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Printer className="w-4 h-4 text-yellow-500" />
            <span>Shift X-Report Preview</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="bg-white text-black p-5 rounded-xl font-mono text-sm space-y-3 shadow-inner max-h-[60vh] overflow-y-auto">
          {/* Slip Header */}
          <div className="text-center border-b border-dashed border-gray-400 pb-3">
            <div className="font-bold text-base uppercase tracking-wider">
              {shiftInfo.company}
            </div>
            <div className="text-xs text-gray-600">{shiftInfo.branch}</div>
            <div className="text-xs text-gray-500 mt-1">*** SHIFT X-REPORT ***</div>
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-xs border-b border-dashed border-gray-400 pb-2">
            <div className="flex justify-between">
              <span>CASHIER:</span>
              <span className="font-bold">{shiftInfo.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>DATE:</span>
              <span>{shiftInfo.date}</span>
            </div>
            <div className="flex justify-between">
              <span>SHIFT START:</span>
              <span>{shiftInfo.startTime}</span>
            </div>
            <div className="flex justify-between">
              <span>HOURS WORKED:</span>
              <span>{stats.cashierHours}</span>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="space-y-1 text-xs border-b border-dashed border-gray-400 pb-2">
            <div className="flex justify-between font-bold">
              <span>TOTAL REVENUE:</span>
              <span>${stats.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>TOTAL TRANSACTIONS:</span>
              <span>{stats.transactionsCount}</span>
            </div>
            <div className="flex justify-between">
              <span>AVERAGE TICKET:</span>
              <span>${stats.avgSpend.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-1 text-xs border-b border-dashed border-gray-400 pb-2">
            <div className="text-gray-500 font-bold text-xs">PAYMENT TENDERS</div>
            <div className="flex justify-between">
              <span>CASH COLLECTED:</span>
              <span>${stats.cashCollected.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CREDIT / DEBIT:</span>
              <span>${stats.cardPayments.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>QR DIGITAL PAY:</span>
              <span>${stats.qrPayments.toFixed(2)}</span>
            </div>
          </div>

          {/* Top Sellers */}
          <div className="space-y-1 text-xs">
            <div className="text-gray-500 font-bold">TOP SELLERS (THIS SHIFT)</div>
            {topItems.map((item) => (
              <div key={item.rank} className="flex justify-between">
                <span>
                  {item.rank}. {item.name} ({item.quantitySold}x)
                </span>
                <span>${item.revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Slip Footer */}
          <div className="text-center text-xs text-gray-500 pt-2 border-t border-dashed border-gray-400">
            <div>AUDIT CODE: SR-2026-0717-EW</div>
            <div>VERIFIED BY TAVONZA POS SYSTEM</div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Print Report Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
