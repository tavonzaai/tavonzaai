'use client';

import React, { useState } from 'react';
import { X, QrCode, ChevronDown } from 'lucide-react';
import { QRTableItem } from '../types';
import { toast } from 'sonner';

export interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTable: (table: QRTableItem) => void;
}

export default function AddTableModal({
  isOpen,
  onClose,
  onAddTable,
}: AddTableModalProps) {
  const [tableName, setTableName] = useState('');
  const [seats, setSeats] = useState('4 seats');
  const [zone, setZone] = useState('Main Hall');
  const [server, setServer] = useState('Jake R.');

  if (!isOpen) return null;

  const generatedUrl = tableName
    ? `order.tavonza.ai/t/${tableName.toLowerCase().replace(/\s+/g, '-')}`
    : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) {
      toast.error('Please enter a table name or ID');
      return;
    }

    const seatsNumber = parseInt(seats.replace(/\D/g, ''), 10) || 4;

    const newTable: QRTableItem = {
      id: tableName.trim().toUpperCase(),
      number: tableName.trim().replace(/\D/g, '') || '01',
      seats: seatsNumber,
      zone,
      status: 'Free',
      server,
      url: generatedUrl || `order.tavonza.ai/t/${tableName.toLowerCase()}`,
      qrActiveVersion: 'Yes — v3 (Jul 2026)',
      scansToday: 0,
      lastScanTime: 'Just now',
      seatedMinutesAgo: 0,
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          text: `Table ${tableName} created and QR code generated`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'emerald',
        },
      ],
    };

    onAddTable(newTable);
    toast.success(`Table ${newTable.id} added with new QR Code!`);
    setTableName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#141416] border border-zinc-800 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-5 text-white animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight font-['Inter']">
              Add New Table
            </h3>
            <p className="text-sm text-zinc-400 font-normal font-['Inter'] mt-1">
              A QR code will be generated automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Table Name / ID */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Table Name / ID
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="e.g. T-31, Patio-01, Bar-A"
              className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white placeholder:text-zinc-600 focus:outline-none transition"
              autoFocus
            />
          </div>

          {/* Row 2: Capacity & Zone */}
          <div className="grid grid-cols-2 gap-3">
            {/* Seating Capacity */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Seating Capacity
              </label>
              <div className="relative">
                <select
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-sm text-white appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="2 seats">2 seats</option>
                  <option value="4 seats">4 seats</option>
                  <option value="6 seats">6 seats</option>
                  <option value="8 seats">8 seats</option>
                  <option value="10 seats">10 seats</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-4 pointer-events-none" />
              </div>
            </div>

            {/* Zone / Section */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Zone / Section
              </label>
              <div className="relative">
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-sm text-white appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="Main Hall">Main Hall</option>
                  <option value="Patio">Patio</option>
                  <option value="Bar Area">Bar Area</option>
                  <option value="VIP Lounge">VIP Lounge</option>
                  <option value="Rooftop Terrace">Rooftop Terrace</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Assigned Server */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Assigned Server
            </label>
            <div className="relative">
              <select
                value={server}
                onChange={(e) => setServer(e.target.value)}
                className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-sm text-white appearance-none focus:outline-none cursor-pointer"
              >
                <option value="Jake R.">Jake R.</option>
                <option value="Sarah M.">Sarah M.</option>
                <option value="Alex T.">Alex T.</option>
                <option value="Elena K.">Elena K.</option>
                <option value="Unassigned">Unassigned</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-4 pointer-events-none" />
            </div>
          </div>

          {/* QR Code Auto-generated Box */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="size-11 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white leading-tight">
                QR code auto-generated
              </p>
              <p className="text-xs text-amber-400/90 mt-0.5 truncate font-mono">
                {generatedUrl || 'URL will appear after naming the table'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold text-zinc-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-3 bg-amber-400 hover:bg-amber-300 rounded-xl text-sm font-bold text-white shadow-lg shadow-amber-400/20 transition cursor-pointer"
            >
              Add Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
