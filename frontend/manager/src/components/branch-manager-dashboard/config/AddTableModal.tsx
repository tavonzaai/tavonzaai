'use client';

import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

export interface NewTableData {
  number: string;
  capacity: number;
  zone: string;
}

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTable: (table: NewTableData) => void;
}

export default function AddTableModal({
  isOpen,
  onClose,
  onSaveTable,
}: AddTableModalProps) {
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [zone, setZone] = useState('Indoor Dining');
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);

  if (!isOpen) return null;

  const zoneOptions = ['Indoor Dining', 'VIP Section', 'Patio Terrace', 'Bar Counter'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) return;

    onSaveTable({
      number: tableNumber.trim(),
      capacity: parseInt(capacity, 10) || 4,
      zone,
    });
    setTableNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[560px] bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 p-4 flex flex-col gap-4 text-white font-['Inter'] shadow-2xl">
        {/* Header */}
        <div className="w-full flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h2 className="text-white text-lg font-medium font-['Poppins'] leading-5">
              Add New Table Setup
            </h2>
            <span className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
              Floor Plan & Capacity Configuration
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 px-2.5 py-2 bg-gray-300/10 hover:bg-neutral-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full h-px bg-neutral-800" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
            {/* Table Number / Label */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-xs font-normal leading-4">
                Table Number / Label
              </label>
              <div className="px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex items-center">
                <input
                  type="text"
                  required
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. T-05"
                  className="w-full bg-transparent text-stone-200 placeholder-stone-500 text-sm font-normal focus:outline-none"
                />
              </div>
            </div>

            {/* Capacity (Seats) */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-xs font-normal leading-4">
                Capacity (Seats)
              </label>
              <div className="px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex items-center">
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="4"
                  className="w-full bg-transparent text-stone-200 placeholder-stone-500 text-sm font-normal focus:outline-none"
                />
              </div>
            </div>

            {/* Floor Zone */}
            <div className="flex flex-col gap-2 relative">
              <label className="text-white text-xs font-normal leading-4">Floor Zone</label>
              <button
                type="button"
                onClick={() => setShowZoneDropdown(!showZoneDropdown)}
                className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center text-stone-300 text-sm font-normal hover:bg-neutral-800 transition"
              >
                <span>{zone}</span>
                <ChevronDown className="w-4 h-4 text-stone-300" />
              </button>

              {showZoneDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-30 py-1 text-xs">
                  {zoneOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setZone(opt);
                        setShowZoneDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-stone-200 hover:bg-neutral-800 hover:text-yellow-400 transition"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-['Inter'] leading-5 transition cursor-pointer shadow-md active:scale-95"
            >
              Save Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
