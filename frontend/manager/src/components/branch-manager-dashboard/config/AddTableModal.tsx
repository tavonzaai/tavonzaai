'use client';

import React, { useState } from 'react';
import { X, ChevronDown, Loader2, QrCode, Users, Layers, AlertCircle, Check } from 'lucide-react';

export interface NewTableData {
  number: string;
  capacity: number;
  zone: string;
  shape?: 'SQUARE' | 'RECTANGLE' | 'CIRCLE' | 'TRIANGLE' | 'HEXAGON';
  floor?: number;
}

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTable: (table: NewTableData) => Promise<any> | void;
  isLoading?: boolean;
}

export default function AddTableModal({
  isOpen,
  onClose,
  onSaveTable,
  isLoading = false,
}: AddTableModalProps) {
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [zone, setZone] = useState('Indoor Dining');
  const [shape, setShape] = useState<'SQUARE' | 'RECTANGLE' | 'CIRCLE' | 'TRIANGLE' | 'HEXAGON'>('SQUARE');
  const [floor, setFloor] = useState('1');
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const [showShapeDropdown, setShowShapeDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const zoneOptions = ['Indoor Dining', 'VIP Section', 'Patio Terrace', 'Bar Counter'];
  const shapeOptions: Array<{ id: 'SQUARE' | 'RECTANGLE' | 'CIRCLE' | 'TRIANGLE' | 'HEXAGON'; label: string }> = [
    { id: 'SQUARE', label: 'Square (Standard)' },
    { id: 'RECTANGLE', label: 'Rectangle (Banquet/Long)' },
    { id: 'CIRCLE', label: 'Circle (Round Table)' },
    { id: 'HEXAGON', label: 'Hexagon (Booth/Cluster)' },
    { id: 'TRIANGLE', label: 'Triangle (Corner Table)' },
  ];
  const quickCapacities = [2, 4, 6, 8, 10];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanLabel = tableNumber.trim();
    if (!cleanLabel) {
      setErrorMessage('Please provide a table label or number (e.g. T-08 or VIP-1).');
      return;
    }

    const capNum = parseInt(capacity, 10);
    if (isNaN(capNum) || capNum < 1) {
      setErrorMessage('Table capacity must be at least 1 guest seat.');
      return;
    }

    if (capNum > 100) {
      setErrorMessage('Table capacity cannot exceed 100 guest seats.');
      return;
    }

    const floorNum = parseInt(floor, 10) || 1;

    try {
      setIsSubmitting(true);
      await onSaveTable({
        number: cleanLabel,
        capacity: capNum,
        zone,
        shape,
        floor: floorNum,
      });

      // Reset form on success
      setTableNumber('');
      setCapacity('4');
      setZone('Indoor Dining');
      setShape('SQUARE');
      setFloor('1');
      onClose();
    } catch (err: any) {
      console.error('Failed to save table:', err);
      setErrorMessage(
        err?.message ||
        err?.data?.message ||
        'Could not create table. Please verify connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeLoading = isSubmitting || isLoading;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => {
        if (!activeLoading) onClose();
      }}
    >
      <div
        className="w-full max-w-[560px] bg-neutral-900 rounded-2xl border border-neutral-800 p-6 flex flex-col gap-5 text-white font-['Inter'] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h2 className="text-white text-xl font-bold font-['Poppins']">
              Add New Dining Table
            </h2>
            <span className="text-neutral-400 text-xs font-normal">
              Floor Plan, Seating Capacity & Contactless QR Provisioning
            </span>
          </div>

          <button
            type="button"
            disabled={activeLoading}
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-700/60 transition disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informational Callout */}
        <div className="p-3.5 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-start gap-3 text-xs text-yellow-200/90 leading-relaxed">
          <QrCode className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-yellow-400 font-semibold block mb-0.5">Automated QR Generation</strong>
            Upon creation, an opaque encrypted QR code token is provisioned instantly for seamless contactless customer ordering.
          </div>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800/90 flex flex-col gap-4">
            {/* Table Number / Label */}
            <div className="flex flex-col gap-1.5">
              <label className="text-neutral-200 text-xs font-medium flex items-center justify-between">
                <span>Table Label / Number <span className="text-amber-400">*</span></span>
                <span className="text-[11px] text-neutral-500">e.g. T-05, Table 12, Patio-2</span>
              </label>
              <input
                type="text"
                required
                disabled={activeLoading}
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. T-05"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Capacity & Quick Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-neutral-200 text-xs font-medium flex items-center justify-between">
                <span>Seating Capacity (Guests) <span className="text-amber-400">*</span></span>
                <span className="text-[11px] text-neutral-500">1 to 100 seats</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  disabled={activeLoading}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="4"
                  className="w-28 px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400 transition"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {quickCapacities.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={activeLoading}
                      onClick={() => setCapacity(String(preset))}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                        capacity === String(preset)
                          ? 'bg-yellow-400 text-neutral-950 border-yellow-400 font-semibold shadow-sm'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {preset}p
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Shape & Floor Level (Two Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Shape Dropdown */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-neutral-200 text-xs font-medium">Table Shape</label>
                <button
                  type="button"
                  disabled={activeLoading}
                  onClick={() => {
                    setShowShapeDropdown(!showShapeDropdown);
                    setShowZoneDropdown(false);
                  }}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg flex justify-between items-center text-neutral-200 text-xs hover:bg-neutral-800/80 transition"
                >
                  <span>{shapeOptions.find((s) => s.id === shape)?.label || shape}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {showShapeDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl z-30 py-1 text-xs">
                    {shapeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setShape(opt.id);
                          setShowShapeDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 transition flex items-center justify-between ${
                          shape === opt.id
                            ? 'bg-yellow-400/10 text-yellow-400 font-semibold'
                            : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {shape === opt.id && <Check className="w-3.5 h-3.5 text-yellow-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Floor Level */}
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-200 text-xs font-medium">Floor Level</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    disabled={activeLoading}
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="1"
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-xs focus:outline-none focus:border-yellow-400 transition"
                  />
                  <div className="flex items-center gap-1">
                    {[1, 2].map((fNum) => (
                      <button
                        key={fNum}
                        type="button"
                        disabled={activeLoading}
                        onClick={() => setFloor(String(fNum))}
                        className={`px-2 py-2 rounded-lg text-xs font-medium border transition ${
                          floor === String(fNum)
                            ? 'bg-neutral-700 text-white border-neutral-600'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                        }`}
                      >
                        F{fNum}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floor Zone */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-neutral-200 text-xs font-medium">Floor Zone / Section</label>
              <button
                type="button"
                disabled={activeLoading}
                onClick={() => {
                  setShowZoneDropdown(!showZoneDropdown);
                  setShowShapeDropdown(false);
                }}
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg flex justify-between items-center text-neutral-200 text-xs hover:bg-neutral-800/80 transition"
              >
                <span>{zone}</span>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </button>

              {showZoneDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl z-30 py-1 text-xs">
                  {zoneOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setZone(opt);
                        setShowZoneDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 transition flex items-center justify-between ${
                        zone === opt
                          ? 'bg-yellow-400/10 text-yellow-400 font-semibold'
                          : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                      }`}
                    >
                      <span>{opt}</span>
                      {zone === opt && <Check className="w-3.5 h-3.5 text-yellow-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-2.5 pt-2 border-t border-neutral-800/80">
            <button
              type="button"
              disabled={activeLoading}
              onClick={onClose}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 hover:text-white text-sm font-medium transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={activeLoading}
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-xl text-neutral-950 text-sm font-bold transition cursor-pointer shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {activeLoading && <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />}
              <span>{activeLoading ? 'Creating Table...' : 'Save & Generate QR'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
