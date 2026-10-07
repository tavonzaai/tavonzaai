'use client';

import React, { useState } from 'react';
import { TableItem, TableStatus } from '../types';
import { Clock, User, QrCode, X, Download, Copy, Check, Printer } from 'lucide-react';
import { buildTableQrCodeUrl } from '../../../redux/features/branchManagerApi';

interface TablesViewProps {
  initialFilter?: string;
  onSelectTable: (tableId: string) => void;
  tablesData: TableItem[];
}

export default function TablesView({
  initialFilter = 'all',
  onSelectTable,
  tablesData,
}: TablesViewProps) {
  const [filter, setFilter] = useState<string>(initialFilter);
  const [selectedQrTable, setSelectedQrTable] = useState<TableItem | null>(null);
  const [copied, setCopied] = useState(false);

  const filterTabs = [
    { id: 'all', label: 'ALL' },
    { id: 'available', label: 'Available' },
    { id: 'occupied', label: 'Occupied' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'need_attention', label: 'Needs Attention' },
    { id: 'payment', label: 'Payment Pending' },
  ];

  const filteredTables = tablesData.filter((table) => {
    if (filter === 'all') return true;
    return table.status === filter;
  });

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Available
          </span>
        );
      case 'occupied':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Occupied
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
            Preparing
          </span>
        );
      case 'ready':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
            Ready
          </span>
        );
      case 'need_attention':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            Needs Attention
          </span>
        );
      case 'payment':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Payment Pending
          </span>
        );
      default:
        return null;
    }
  };

  const getTableQrUrl = (table: TableItem) => {
    if (table.qrCodeUrl) return table.qrCodeUrl;
    const token = table.qrCodeToken || table.id;
    return buildTableQrCodeUrl(token);
  };

  const getCustomerTableUrl = (table: TableItem) => {
    const token = table.qrCodeToken || table.id;
    const base = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `${window.location.protocol}//${window.location.hostname}:3100`
      : 'http://localhost:3100';
    return `${base}?qr=${encodeURIComponent(token)}`;
  };

  const handleCopyLink = (table: TableItem) => {
    const url = getCustomerTableUrl(table);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Filter Tabs matching Figma */}
      <div className="flex flex-wrap items-center gap-2">
        {filterTabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium font-['Poppins'] transition outline outline-1 outline-offset-[-1px] ${
                isActive
                  ? 'bg-yellow-400 text-neutral-900 outline-neutral-700 shadow-sm'
                  : 'bg-transparent text-white outline-neutral-700 hover:bg-neutral-800/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const isAvailable = table.status === 'available';

          return (
            <div
              key={table.id}
              onClick={() => onSelectTable(table.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-48 shadow-sm ${
                isAvailable
                  ? 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700'
                  : 'bg-neutral-900 border-neutral-800 hover:border-amber-400/50 hover:bg-neutral-900/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold text-lg font-['Inter']">
                  {table.number}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="View Table QR Code"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQrTable(table);
                    }}
                    className="p-1 rounded-md bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-amber-400 border border-neutral-700 transition flex items-center justify-center"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                  {getStatusBadge(table.status)}
                </div>
              </div>

              {!isAvailable ? (
                <div className="flex flex-col gap-1 text-xs font-['Inter']">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Waiter: <strong className="text-white font-medium">{table.waiter}</strong></span>
                  </div>
                  <span className="text-amber-400/90 font-medium">
                    {table.orderNumber} ({table.itemsCount} items)
                  </span>
                </div>
              ) : (
                <div className="text-xs text-neutral-400 font-['Inter'] flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Ready for guest seating · QR active</span>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 font-['Inter']">
                <span>Capacity: {table.capacity}p</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQrTable(table);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>View QR</span>
                  </button>
                  {!isAvailable && table.orderTime && (
                    <div className="flex items-center gap-1 text-neutral-400">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      <span>{table.orderTime}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code Modal */}
      {selectedQrTable && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedQrTable(null)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-['Poppins']">
                  {selectedQrTable.number} Access Pass
                </h3>
                <p className="text-xs text-neutral-400">Customer Dine-In & Ordering QR</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQrTable(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl flex items-center justify-center shadow-inner">
              <img
                src={getTableQrUrl(selectedQrTable)}
                alt={`QR code for ${selectedQrTable.number}`}
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-neutral-400">
                <span>Table Token:</span>
                <span className="font-mono text-neutral-200">
                  {selectedQrTable.qrCodeToken ? `${selectedQrTable.qrCodeToken.slice(0, 12)}...` : 'Active'}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Customer Order URL:</span>
                <span className="font-mono text-amber-400 truncate max-w-[180px]">
                  /t/{selectedQrTable.qrCodeToken || selectedQrTable.id}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 pt-1 leading-normal">
                Scanning this QR code automatically routes the guest to this table and logs customer activity to your branch terminal.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCopyLink(selectedQrTable)}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
              <a
                href={getTableQrUrl(selectedQrTable)}
                download={`qr-${selectedQrTable.number}.png`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save QR</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
