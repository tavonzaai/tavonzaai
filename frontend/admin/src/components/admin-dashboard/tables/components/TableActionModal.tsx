'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { TableFloorItem, TableFloorStatus } from '../types';
import { toast } from 'sonner';

export interface TableActionModalProps {
  table: TableFloorItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTable: (table: TableFloorItem) => void;
  onDeleteTable?: (table: TableFloorItem) => void;
}

export default function TableActionModal({
  table,
  isOpen,
  onClose,
  onUpdateTable,
  onDeleteTable,
}: TableActionModalProps) {
  const [status, setStatus] = useState<TableFloorStatus>('Available');
  const [partySize, setPartySize] = useState(0);
  const [server, setServer] = useState('Jake R.');
  const [bill, setBill] = useState('0.00');

  useEffect(() => {
    if (table) {
      setStatus(table.status);
      setPartySize(table.currentPartySize);
      setServer(table.server);
      setBill(table.billAmount.toFixed(2));
    }
  }, [table]);

  if (!isOpen || !table) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTable: TableFloorItem = {
      ...table,
      status,
      currentPartySize: status === 'Available' ? 0 : partySize || 2,
      server,
      billAmount: status === 'Available' ? 0 : parseFloat(bill) || table.billAmount,
      seatedTime:
        status === 'Occupied' && table.seatedTime === '—'
          ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : status === 'Available'
          ? '—'
          : table.seatedTime,
    };

    onUpdateTable(updatedTable);
    toast.success(`Updated table ${table.id} status to ${status}`);
    onClose();
  };

  const handleClearTable = () => {
    const cleared: TableFloorItem = {
      ...table,
      status: 'Available',
      currentPartySize: 0,
      seatedTime: '—',
      billAmount: 0,
    };
    onUpdateTable(cleared);
    toast.success(`Table ${table.id} cleared and marked Available!`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-5 text-white animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 min-w-12 bg-amber-500/20 border border-yellow-500/40 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-yellow-500 text-xl font-bold font-['Inter'] leading-none">
                {table.number || table.id.replace(/\D/g, '') || table.id}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight font-['Inter']">
                Table {table.id}
              </h3>
              <p className="text-sm text-zinc-400 font-normal font-['Inter']">
                {table.capacity} seats · {table.zone}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Status Selector Pills */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
            Current Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStatus('Occupied')}
              className={`h-10 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                status === 'Occupied'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Occupied
            </button>

            <button
              type="button"
              onClick={() => setStatus('Available')}
              className={`h-10 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                status === 'Available'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Available
            </button>

            <button
              type="button"
              onClick={() => setStatus('Reserved')}
              className={`h-10 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                status === 'Reserved'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Reserved
            </button>
          </div>
        </div>

        {/* Details Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Party Size */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Seated Guests
              </label>
              <input
                type="number"
                min="0"
                max={table.capacity}
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value, 10) || 0)}
                className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white focus:outline-none font-['Inter']"
              />
            </div>

            {/* Current Bill */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Live Bill ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={bill}
                onChange={(e) => setBill(e.target.value)}
                className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white focus:outline-none font-['Inter']"
              />
            </div>
          </div>

          {/* Assigned Server */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Assigned Server
            </label>
            <input
              type="text"
              value={server}
              onChange={(e) => setServer(e.target.value)}
              className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white focus:outline-none font-['Inter']"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            {status !== 'Available' && (
              <button
                type="button"
                onClick={handleClearTable}
                className="py-3 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold text-zinc-300 transition cursor-pointer"
              >
                Clear Table
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 rounded-xl text-sm font-bold text-white shadow-lg shadow-yellow-500/20 transition cursor-pointer"
            >
              Update Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
