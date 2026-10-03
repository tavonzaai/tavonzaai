'use client';

import React, { useState } from 'react';
import {
  Printer,
  QrCode,
  Check,
  X,
  Clock,
  Sparkles,
  ExternalLink,
  Share2,
} from 'lucide-react';

export interface IncomingQROrder {
  id: string;
  orderNumber: string;
  tableNumber: string;
  placedAgo: string;
  items: string[];
  total: number;
  status: 'Pending' | 'Accepted' | 'Declined';
  tableStatus?: 'Available' | 'Occupied' | 'Food Ready' | 'Waiting for Bill';
}

export const initialQROrdersData: IncomingQROrder[] = [
  {
    id: 'qr-012',
    orderNumber: '#QR-012',
    tableNumber: 'T-05',
    placedAgo: '2 min ago',
    items: ['Iced Tea x2', 'Nachos'],
    total: 24.0,
    status: 'Pending',
    tableStatus: 'Occupied',
  },
  {
    id: 'qr-011',
    orderNumber: '#QR-011',
    tableNumber: 'T-08',
    placedAgo: '8 min ago',
    items: ['Chocolate Lava Cake x2', 'Espresso'],
    total: 38.0,
    status: 'Accepted',
    tableStatus: 'Food Ready',
  },
  {
    id: 'qr-010',
    orderNumber: '#QR-010',
    tableNumber: 'T-12',
    placedAgo: '14 min ago',
    items: ['Sparkling Water x2', 'Truffle Fries'],
    total: 28.5,
    status: 'Accepted',
    tableStatus: 'Occupied',
  },
  {
    id: 'qr-009',
    orderNumber: '#QR-009',
    tableNumber: 'T-15',
    placedAgo: '26 min ago',
    items: ['Tiramisu', 'Cappuccino x2'],
    total: 22.0,
    status: 'Accepted',
    tableStatus: 'Waiting for Bill',
  },
  {
    id: 'qr-008',
    orderNumber: '#QR-008',
    tableNumber: 'T-03',
    placedAgo: '42 min ago',
    items: ['Old Fashioned x2'],
    total: 32.0,
    status: 'Accepted',
    tableStatus: 'Occupied',
  },
];

export default function QROrdersView() {
  const [filter, setFilter] = useState<'All' | 'Available' | 'Occupied' | 'Food Ready' | 'Waiting for Bill'>('All');
  const [qrOrders, setQrOrders] = useState<IncomingQROrder[]>(initialQROrdersData);
  const [selectedQRTable, setSelectedQRTable] = useState<string>('T-05');
  const [isCopied, setIsCopied] = useState(false);

  const availableTables = ['T-03', 'T-05', 'T-08', 'T-12', 'T-15'];

  const filteredOrders = qrOrders.filter((ord) => {
    if (filter === 'All') return true;
    return ord.tableStatus === filter;
  });

  const handleAcceptOrder = (id: string) => {
    setQrOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Accepted' } : o))
    );
  };

  const handleDeclineOrder = (id: string) => {
    setQrOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Declined' } : o))
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`https://tavonza.app/order/${selectedQRTable.toLowerCase()}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* 1. Page Title & Subtitle */}
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9">
          QR Orders
        </h1>
        <p className="text-slate-500 text-lg font-normal font-['Inter'] leading-6 mt-1">
          Guest-initiated orders via table QR codes
        </p>
      </div>

      {/* 2. Filter Tabs Bar */}
      <div className="flex items-center">
        <div className="inline-flex rounded-lg overflow-hidden border border-white/20 bg-zinc-950/60 shadow-lg">
          {(['All', 'Available', 'Occupied', 'Food Ready', 'Waiting for Bill'] as const).map(
            (tabName, idx) => {
              const isActive = filter === tabName;
              return (
                <button
                  key={tabName}
                  type="button"
                  onClick={() => setFilter(tabName)}
                  className={`h-9 px-3.5 py-2 text-base font-normal font-['Inter'] transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap ${
                    idx !== 0 ? 'border-l border-white/20' : ''
                  } ${
                    isActive
                      ? 'bg-yellow-500 text-white font-semibold shadow-inner'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tabName}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* 3. Section Title */}
      <div className="pt-2">
        <h2 className="text-white text-lg font-semibold font-['Inter'] leading-9">
          Incoming QR Orders
        </h2>
      </div>

      {/* 4. Two-Column Grid: Orders List (Left) + Table QR Code Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Orders Cards */}
        <div className="lg:col-span-8 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-white/10 text-center text-slate-500">
              <QrCode className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-base font-medium font-['Inter']">No QR orders in this filter category.</p>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isPending = ord.status === 'Pending';
              const isDeclined = ord.status === 'Declined';
              return (
                <div
                  key={ord.id}
                  className={`p-4 bg-zinc-900 rounded-2xl outline outline-1 outline-offset-[-1px] ${
                    isPending
                      ? 'outline-amber-500/40 shadow-lg shadow-amber-500/5 hover:outline-amber-400'
                      : 'outline-white/10 hover:outline-amber-500'
                  } transition-all duration-200 space-y-2.5`}
                >
                  {/* Top Row: Order ID, Status Tag, Total Price */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200 text-base font-medium font-['DM_Mono'] leading-5">
                        {ord.orderNumber}
                      </span>
                      {isPending ? (
                        <span className="px-2 py-0.5 bg-amber-500/20 rounded-full text-amber-500 text-xs font-semibold font-['DM_Sans'] leading-4">
                          Pending
                        </span>
                      ) : isDeclined ? (
                        <span className="px-2 py-0.5 bg-red-500/20 rounded-full text-red-400 text-xs font-semibold font-['DM_Sans'] leading-4">
                          Declined
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-green-500/10 rounded-full text-green-500 text-xs font-semibold font-['DM_Sans'] leading-4">
                          Accepted
                        </span>
                      )}
                    </div>

                    <div className="text-right text-slate-200 text-base font-medium font-['DM_Mono'] leading-5">
                      ${ord.total.toFixed(2)}
                    </div>
                  </div>

                  {/* Second Row: Table & Elapsed Time */}
                  <div className="text-slate-500 text-sm font-normal font-['DM_Sans'] leading-4">
                    {ord.tableNumber} · {ord.placedAgo}
                  </div>

                  {/* Third Row: Ordered Dish Items Chips + Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    {/* Item Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ord.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 bg-gray-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/5 text-slate-400 text-xs font-normal font-['DM_Sans'] leading-4"
                        >
                          {item}
                        </div>
                      ))}
                    </div>

                    {/* Pending Action Buttons (Accept / Decline) */}
                    {isPending && (
                      <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAcceptOrder(ord.id)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-white text-xs font-semibold font-['DM_Sans'] leading-4 rounded-md transition-all cursor-pointer shadow-sm shadow-amber-500/20"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineOrder(ord.id)}
                          className="px-3 py-1 outline outline-1 outline-offset-[-1px] outline-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-medium font-['DM_Sans'] leading-4 rounded-md transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Table QR Codes Generator Card */}
        <div className="lg:col-span-4 bg-zinc-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 p-5 space-y-4 shadow-xl">
          {/* Card Header */}
          <div className="space-y-0.5">
            <h3 className="text-slate-200 text-base font-semibold font-['Inter'] leading-5">
              Table QR Codes
            </h3>
            <p className="text-slate-500 text-sm font-normal font-['Inter'] leading-4">
              Show QR to guest to order
            </p>
          </div>

          {/* Table Chips Bar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {availableTables.map((tbl) => {
              const isSelected = selectedQRTable === tbl;
              return (
                <button
                  key={tbl}
                  type="button"
                  onClick={() => setSelectedQRTable(tbl)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium font-['DM_Sans'] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-white font-semibold shadow-md shadow-amber-500/20'
                      : 'outline outline-1 outline-offset-[-1px] outline-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tbl}
                </button>
              );
            })}
          </div>

          {/* QR Code Container Box */}
          <div className="p-4 bg-white/5 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-md flex flex-col items-center justify-center space-y-3">
            {/* Crisp QR Code Graphic */}
            <div className="w-40 h-40 bg-white rounded-xl p-2.5 flex items-center justify-center shadow-md">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-black fill-current"
              >
                {/* SVG Pattern Simulation of Crisp QR Matrix with Finder Patterns */}
                <rect x="5" y="5" width="28" height="28" fill="black" rx="3" />
                <rect x="10" y="10" width="18" height="18" fill="white" rx="2" />
                <rect x="14" y="14" width="10" height="10" fill="black" rx="1" />

                <rect x="67" y="5" width="28" height="28" fill="black" rx="3" />
                <rect x="72" y="10" width="18" height="18" fill="white" rx="2" />
                <rect x="76" y="14" width="10" height="10" fill="black" rx="1" />

                <rect x="5" y="67" width="28" height="28" fill="black" rx="3" />
                <rect x="10" y="72" width="18" height="18" fill="white" rx="2" />
                <rect x="14" y="76" width="10" height="10" fill="black" rx="1" />

                {/* Data Points */}
                <rect x="38" y="10" width="8" height="8" />
                <rect x="50" y="10" width="8" height="8" />
                <rect x="38" y="24" width="6" height="6" />
                <rect x="48" y="24" width="10" height="6" />

                <rect x="10" y="38" width="8" height="8" />
                <rect x="22" y="38" width="6" height="14" />
                <rect x="34" y="38" width="12" height="6" />
                <rect x="52" y="38" width="8" height="8" />
                <rect x="66" y="38" width="14" height="6" />
                <rect x="84" y="38" width="8" height="14" />

                <rect x="10" y="52" width="6" height="8" />
                <rect x="34" y="48" width="8" height="12" />
                <rect x="46" y="50" width="16" height="8" />
                <rect x="68" y="50" width="10" height="14" />

                <rect x="38" y="66" width="10" height="6" />
                <rect x="54" y="66" width="8" height="10" />
                <rect x="68" y="70" width="12" height="6" />
                <rect x="84" y="60" width="8" height="14" />

                <rect x="38" y="78" width="6" height="14" />
                <rect x="50" y="80" width="14" height="8" />
                <rect x="68" y="82" width="24" height="10" />
              </svg>
            </div>

            {/* QR Information Text */}
            <div className="text-center space-y-0.5">
              <div className="text-slate-200 text-sm font-semibold font-['DM_Sans'] leading-4">
                {selectedQRTable} — QR Order Link
              </div>
              <div className="text-slate-500 text-xs font-normal font-['DM_Sans'] leading-4">
                tavonza.app/order/{selectedQRTable.toLowerCase()}
              </div>
            </div>

            {/* Actions: Print & Copy Link */}
            <div className="flex items-center gap-2 w-full pt-1">
              <button
                type="button"
                onClick={() => alert(`Printing QR Standee card for ${selectedQRTable}...`)}
                className="flex-1 py-2 px-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 hover:bg-white/5 text-white text-sm font-medium font-['DM_Sans'] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-sm font-medium font-['DM_Sans'] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Copy Guest Order Link"
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>{isCopied ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
