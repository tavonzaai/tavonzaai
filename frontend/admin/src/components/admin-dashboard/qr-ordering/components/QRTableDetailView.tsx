'use client';

import React from 'react';
import {
  ArrowLeft,
  Printer,
  RotateCcw,
  Copy,
  ExternalLink,
  Signal,
  CheckCircle2,
  ChevronRight,
  Utensils,
} from 'lucide-react';
import { QRTableItem } from '../types';
import QRCodeGraphic from './QRCodeGraphic';
import { toast } from 'sonner';

export interface QRTableDetailViewProps {
  table: QRTableItem;
  onBack: () => void;
  onPrint: (table: QRTableItem) => void;
  onRegenerate: (table: QRTableItem) => void;
}

export default function QRTableDetailView({
  table,
  onBack,
  onPrint,
  onRegenerate,
}: QRTableDetailViewProps) {
  const isBusy = table.status === 'Busy';

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(`https://${table.url}`);
    toast.success(`Copied table link: https://${table.url}`);
  };

  const handlePreviewMenu = () => {
    toast.info(`Opening customer scanner preview for ${table.id}...`);
  };

  return (
    <div className="space-y-6 w-full pb-10">
      {/* 1. Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-semibold font-['Inter'] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-amber-400" />
        <span>Back to QR Ordering</span>
      </button>

      {/* 2. Top Header Summary Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-[10.20px]">
        {/* Left: Table Identifier & Meta */}
        <div className="flex items-center gap-4">
          {/* Table Number Circle / Box */}
          <div className="size-14 bg-amber-500/20 border border-yellow-500/40 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-yellow-500 text-2xl font-bold font-['Inter'] leading-none">
              {table.number}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-white text-3xl font-bold font-['Inter']">
                {table.id}
              </h2>

              {/* Status Badge */}
              <div
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                  isBusy
                    ? 'bg-yellow-950/80 border border-orange-600/40'
                    : 'bg-neutral-900 border border-emerald-500/40'
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    isBusy ? 'bg-orange-500' : 'bg-emerald-500'
                  }`}
                />
                <span
                  className={`text-sm font-semibold font-['Inter'] leading-none ${
                    isBusy ? 'text-orange-500' : 'text-green-500'
                  }`}
                >
                  {isBusy ? 'Occupied' : 'Free'}
                </span>
              </div>
            </div>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 font-['Inter']">
              <span className="flex items-center gap-1">
                <Utensils className="w-3 h-3 text-zinc-500" />
                {table.seats} seats
              </span>
              <span>•</span>
              <span>{table.zone}</span>
              <span>•</span>
              <span>
                Server: <strong className="text-white font-medium">{table.server}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 self-start lg:self-center">
          <button
            type="button"
            onClick={() => onPrint(table)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 backdrop-blur-[10.20px] flex items-center gap-1.5 text-white text-sm font-semibold font-['Inter'] transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print QR</span>
          </button>

          <button
            type="button"
            onClick={() => onRegenerate(table)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 backdrop-blur-[10.20px] flex items-center gap-1.5 text-white text-sm font-semibold font-['Inter'] transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* 3. Main Split View: Left Column (QR & Table Details) + Right Column (Orders & Flow) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* LEFT COLUMN: QR Card + Table Details + Link Health (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card A: QR Code Visual & Actions */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/15 backdrop-blur-[10.20px] space-y-4">
            <div className="w-full h-44 bg-neutral-900 rounded-xl border border-white/5 flex items-center justify-center p-3 shadow-inner">
              <QRCodeGraphic size={130} tableId={table.id} />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-white text-lg font-semibold font-['Inter'] leading-tight">
                  {table.id}
                </h4>
                <p className="text-gray-400 text-sm font-normal font-['Inter'] mt-0.5">
                  {table.seats} seats · {table.zone}
                </p>
              </div>

              <div
                className={`px-2 py-0.5 rounded-[5px] text-xs font-semibold font-['Inter'] ${
                  isBusy
                    ? 'bg-yellow-950/80 text-orange-500 border border-orange-600/30'
                    : 'bg-neutral-900 text-green-500 border border-emerald-500/30'
                }`}
              >
                {isBusy ? 'Busy' : 'Free'}
              </div>
            </div>

            <div className="space-y-0.5 text-sm font-['Inter']">
              <div>
                <span className="text-gray-500">Server: </span>
                <span className="text-white font-medium">{table.server}</span>
              </div>
              <div className="text-gray-400 font-mono text-xs">
                {table.url}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-3 bg-neutral-950 hover:bg-zinc-900 rounded-lg border border-white/10 backdrop-blur-[10.20px] flex items-center justify-center gap-1.5 text-white text-sm font-semibold font-['Inter'] transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>

              <button
                type="button"
                onClick={handlePreviewMenu}
                className="py-2 px-3 bg-neutral-950 hover:bg-zinc-900 rounded-lg border border-white/10 backdrop-blur-[10.20px] flex items-center justify-center gap-1.5 text-white text-sm font-semibold font-['Inter'] transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>
          </div>

          {/* Card B: Table Details Specification */}
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-[10.20px] space-y-3">
            <h3 className="text-white text-sm font-bold font-['Inter'] uppercase tracking-wider">
              Table Details
            </h3>

            <div className="divide-y divide-neutral-800 text-sm">
              <div className="py-2 flex justify-between items-center text-white">
                <span className="text-zinc-400">Zone</span>
                <span className="font-semibold">{table.zone}</span>
              </div>
              <div className="py-2 flex justify-between items-center text-white">
                <span className="text-zinc-400">Capacity</span>
                <span className="font-semibold">{table.seats} seats</span>
              </div>
              <div className="py-2 flex justify-between items-center text-white">
                <span className="text-zinc-400">Server</span>
                <span className="font-semibold">{table.server}</span>
              </div>
              <div className="py-2 flex justify-between items-center text-white">
                <span className="text-zinc-400">QR Active</span>
                <span className="font-semibold">{table.qrActiveVersion}</span>
              </div>
              <div className="py-2 flex justify-between items-center text-white">
                <span className="text-zinc-400">Total Scans Today</span>
                <span className="font-semibold text-amber-400">{table.scansToday}</span>
              </div>
            </div>
          </div>

          {/* Card C: QR Link Health Status */}
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-[10.20px] space-y-2">
            <div className="flex items-center gap-2">
              <Signal className="w-3.5 h-3.5 text-emerald-400" />
              <h3 className="text-white text-sm font-bold font-['Inter']">
                QR Link Status
              </h3>
            </div>

            <div className="space-y-1.5 text-sm pt-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Link health</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last scan</span>
                <span className="text-zinc-300 font-semibold">{table.lastScanTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Order + Guest Ordering Flow + Activity Log (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Card 1: Live Order */}
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-[10.20px] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-bold font-['Inter'] leading-tight">
                  Live Order
                </h3>
                <p className="text-gray-400 text-sm font-normal font-['Inter'] mt-0.5">
                  {table.liveOrder
                    ? `${table.liveOrder.itemsCount} items · Seated ~${table.seatedMinutesAgo || 25} min ago`
                    : 'No active items on this table right now'}
                </p>
              </div>

              {table.liveOrder && (
                <button
                  type="button"
                  onClick={() => toast.info(`Viewing live order breakdown for ${table.id}`)}
                  className="text-sm font-semibold text-orange-500 hover:text-orange-400 font-['Inter'] flex items-center gap-1 cursor-pointer"
                >
                  <span>Full Order</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Itemized list */}
            {table.liveOrder ? (
              <div className="space-y-3 pt-2">
                <div className="divide-y divide-neutral-800">
                  {table.liveOrder.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="py-3 flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-6 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-zinc-300 text-xs shrink-0">
                          {item.qty}
                        </div>
                        <span className="text-white font-medium truncate">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-white font-medium">
                          ${item.price.toFixed(2)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            item.status === 'served'
                              ? 'bg-zinc-800 text-slate-400'
                              : item.status === 'ready'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                              : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal Row */}
                <div className="pt-3 border-t border-neutral-800 flex justify-between items-center text-white">
                  <span className="text-sm font-bold font-['Inter']">Subtotal</span>
                  <span className="text-lg font-bold font-['Inter'] text-amber-400">
                    ${table.liveOrder.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-zinc-500 text-sm">
                Table is currently free. Ready for new guests.
              </div>
            )}
          </div>

          {/* Card 2: Guest Ordering Flow */}
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-[10.20px] space-y-4">
            <div>
              <h3 className="text-white text-lg font-bold font-['Inter'] leading-tight">
                Guest Ordering Flow
              </h3>
              <p className="text-gray-400 text-sm font-normal font-['Inter'] mt-0.5">
                Steps a guest completes after scanning the QR code.
              </p>
            </div>

            {/* 4 Steps Grid with arrows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
              {/* Step 1 */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-2 relative">
                <div className="size-7 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  1
                </div>
                <h4 className="text-white text-sm font-bold font-['Inter']">
                  Scan QR
                </h4>
                <p className="text-gray-400 text-xs leading-4">
                  Guest scans code with phone camera
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-2 relative">
                <div className="size-7 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  2
                </div>
                <h4 className="text-white text-sm font-bold font-['Inter']">
                  Browse Menu
                </h4>
                <p className="text-gray-400 text-xs leading-4">
                  Full digital menu with photos
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-2 relative">
                <div className="size-7 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  3
                </div>
                <h4 className="text-white text-sm font-bold font-['Inter']">
                  Add to Cart
                </h4>
                <p className="text-gray-400 text-xs leading-4">
                  Select items, customize, note allergies
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-2">
                <div className="size-7 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  4
                </div>
                <h4 className="text-white text-sm font-bold font-['Inter']">
                  Confirm & Pay
                </h4>
                <p className="text-gray-400 text-xs leading-4">
                  Pay at table or request bill
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Activity Log Timeline */}
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-[10.20px] space-y-4">
            <h3 className="text-white text-lg font-bold font-['Inter']">
              Activity Log
            </h3>

            {table.activityLogs && table.activityLogs.length > 0 ? (
              <div className="space-y-3 divide-y divide-neutral-800/80">
                {table.activityLogs.map((log) => {
                  const dotColor =
                    log.type === 'amber'
                      ? 'bg-amber-400'
                      : log.type === 'emerald'
                      ? 'bg-emerald-400'
                      : log.type === 'blue'
                      ? 'bg-blue-400'
                      : 'bg-zinc-400';

                  return (
                    <div key={log.id} className="pt-3 first:pt-0 flex items-start gap-3">
                      <span className={`size-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white font-['Inter'] leading-tight">
                          {log.text}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {log.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No activity recorded for today yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
