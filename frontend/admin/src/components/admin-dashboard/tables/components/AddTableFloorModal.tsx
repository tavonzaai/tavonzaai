'use client';

import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { TableFloorItem, TableFloorStatus } from '../types';
import { toast } from 'sonner';

export interface AddTableFloorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTable: (table: TableFloorItem) => void;
}

export default function AddTableFloorModal({
  isOpen,
  onClose,
  onAddTable,
}: AddTableFloorModalProps) {
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState('4 seats');
  const [zone, setZone] = useState('Main Hall');
  const [initialStatus, setInitialStatus] = useState<TableFloorStatus>('Available');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) {
      toast.error('Please enter a table name or number');
      return;
    }

    const seatsNumber = parseInt(capacity.replace(/\D/g, ''), 10) || 4;

    const newTable: TableFloorItem = {
      id: tableName.trim().toUpperCase(),
      number: tableName.trim().replace(/\D/g, '') || '01',
      capacity: seatsNumber,
      currentPartySize: initialStatus === 'Occupied' ? seatsNumber : initialStatus === 'Reserved' ? 2 : 0,
      zone,
      status: initialStatus,
      server: 'Jake R.',
      seatedTime: initialStatus === 'Occupied' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : initialStatus === 'Reserved' ? '7:30 PM' : '—',
      billAmount: 0.0,
    };

    onAddTable(newTable);
    toast.success(`Table "${newTable.id}" added to floor plan!`);

    // Reset and close
    setTableName('');
    setCapacity('4 seats');
    setZone('Main Hall');
    setInitialStatus('Available');
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
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight font-['Inter']">
              Add New Table
            </h3>
            <p className="text-sm text-zinc-400 font-normal font-['Inter'] mt-1">
              Table will appear on the floor plan immediately.
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
          {/* Table Name / Number */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Table Name / Number
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="e.g. T-31, Patio-A, Bar-01"
              className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white placeholder:text-zinc-600 focus:outline-none transition font-['Inter']"
              autoFocus
            />
          </div>

          {/* Row: Capacity & Zone */}
          <div className="grid grid-cols-2 gap-3">
            {/* Seating Capacity */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Seating Capacity
              </label>
              <div className="relative">
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
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
                  <option value="Rooftop">Rooftop</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Initial Status Selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Initial Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setInitialStatus('Available')}
                className={`h-11 rounded-xl text-sm font-semibold font-['Inter'] transition cursor-pointer flex items-center justify-center ${
                  initialStatus === 'Available'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Available
              </button>

              <button
                type="button"
                onClick={() => setInitialStatus('Reserved')}
                className={`h-11 rounded-xl text-sm font-semibold font-['Inter'] transition cursor-pointer flex items-center justify-center ${
                  initialStatus === 'Reserved'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Reserved
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold text-zinc-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-3 bg-yellow-500 hover:bg-yellow-400 rounded-xl text-sm font-bold text-white shadow-lg shadow-yellow-500/20 transition cursor-pointer"
            >
              Add Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
