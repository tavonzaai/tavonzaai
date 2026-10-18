'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Trash2,
  Save,
  QrCode,
  Building2,
  AlertTriangle,
  Check,
  ChevronDown,
  Layers,
  Users,
} from 'lucide-react';
import { TableItem } from '../types';
import { branchManagerService, buildTableQrCodeUrl } from '../../../redux/features/branchManagerApi';
import { confirmDeleteTable, showDeleteSuccess, showDeleteError } from '../../../lib/swal';

interface EditTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableItem | null;
  onTableUpdated?: (updatedTable: TableItem) => void;
  onTableDeleted?: (deletedTableId: string) => void;
}

export default function EditTableModal({
  isOpen,
  onClose,
  table,
  onTableUpdated,
  onTableDeleted,
}: EditTableModalProps) {
  const [label, setLabel] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [shape, setShape] = useState<'SQUARE' | 'RECTANGLE' | 'CIRCLE' | 'TRIANGLE' | 'HEXAGON'>('SQUARE');
  const [floor, setFloor] = useState('1');
  const [serviceStatus, setServiceStatus] = useState<string>('AVAILABLE');
  const [operationalFlag, setOperationalFlag] = useState<string>('NORMAL');

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showShapeDropdown, setShowShapeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showFlagDropdown, setShowFlagDropdown] = useState(false);

  useEffect(() => {
    if (table) {
      setLabel(table.number || table.label || '');
      setCapacity(String(table.capacity || 4));
      setShape((table.shape as any) || 'SQUARE');
      setFloor(String(table.floor || 1));
      setServiceStatus((table.serviceStatus || table.status || 'AVAILABLE').toUpperCase());
      setOperationalFlag((table.operationalFlag || 'NORMAL').toUpperCase());
      setShowDeleteConfirm(false);
      setErrorMessage(null);
    }
  }, [table]);

  if (!isOpen || !table) return null;

  const quickCapacities = [2, 4, 6, 8, 10];

  const shapeOptions: Array<{ id: 'SQUARE' | 'RECTANGLE' | 'CIRCLE' | 'TRIANGLE' | 'HEXAGON'; label: string }> = [
    { id: 'SQUARE', label: 'Square (Standard)' },
    { id: 'RECTANGLE', label: 'Rectangle (Long Banquet)' },
    { id: 'CIRCLE', label: 'Circle (Round Table)' },
    { id: 'HEXAGON', label: 'Hexagon (Booth/Cluster)' },
    { id: 'TRIANGLE', label: 'Triangle (Corner Table)' },
  ];

  const serviceStatusOptions = [
    { id: 'AVAILABLE', label: 'Available (Empty)' },
    { id: 'OCCUPIED', label: 'Occupied (Seated)' },
    { id: 'ORDERING', label: 'Ordering (Browsing Menu)' },
    { id: 'PREPARING', label: 'Preparing (Kitchen Active)' },
    { id: 'SERVING', label: 'Serving (Food Plated)' },
    { id: 'PAYMENT_PENDING', label: 'Payment Pending (Bill Issued)' },
    { id: 'CLOSING', label: 'Closing (Table Bused)' },
  ];

  const operationalFlagOptions = [
    { id: 'NORMAL', label: 'Normal Floor Operations' },
    { id: 'RESERVED', label: 'Reserved for Guests' },
    { id: 'CLEANING', label: 'Cleaning / Sanitation' },
    { id: 'OUT_OF_SERVICE', label: 'Out of Service (Maintenance)' },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanLabel = label.trim();
    if (!cleanLabel) {
      setErrorMessage('Please provide a table label or number.');
      return;
    }

    const capNum = parseInt(capacity, 10);
    if (isNaN(capNum) || capNum < 1 || capNum > 100) {
      setErrorMessage('Capacity must be between 1 and 100 guests.');
      return;
    }

    const floorNum = parseInt(floor, 10) || 1;

    try {
      setIsSaving(true);
      const updatePayload: any = {
        label: cleanLabel,
        capacity: capNum,
        shape,
        floor: floorNum,
        serviceStatus,
        operationalFlag,
      };

      const res = await branchManagerService.updateTable(table.id, updatePayload);
      const updated: TableItem = {
        ...table,
        ...res,
        number: res.label || cleanLabel,
        capacity: res.capacity || capNum,
        shape: res.shape || shape,
        floor: res.floor || floorNum,
        serviceStatus: res.serviceStatus || serviceStatus,
        status: (res.serviceStatus?.toLowerCase() || serviceStatus.toLowerCase()) as any,
      };

      if (onTableUpdated) {
        onTableUpdated(updated);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to update table:', err);
      setErrorMessage(err?.message || 'Failed to update table details. Please check connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!table) return;
    const confirmed = await confirmDeleteTable(table.number || table.label || 'this table');
    if (!confirmed) return;
    setErrorMessage(null);
    try {
      setIsDeleting(true);
      await branchManagerService.deleteTable(table.id);
      await showDeleteSuccess(table.number || table.label || 'Table');
      if (onTableDeleted) {
        onTableDeleted(table.id);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to delete table:', err);
      await showDeleteError(err?.message || 'Failed to delete table. Make sure no active orders or payments are pending.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold font-['Poppins']">
                Edit Table {table.number || table.label}
              </h2>
              <p className="text-neutral-400 text-xs font-mono font-['Inter']">
                ID: {table.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Label / Number & Floor Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 text-xs font-semibold uppercase mb-1.5 font-['Inter']">
                Table Label / Number *
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. T-01, VIP-1"
                className="w-full h-10 px-3.5 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition font-['Inter']"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-300 text-xs font-semibold uppercase mb-1.5 font-['Inter']">
                Floor Level
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full h-10 px-3.5 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition font-['Inter']"
              />
            </div>
          </div>

          {/* Seating Capacity */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-neutral-300 text-xs font-semibold uppercase font-['Inter']">
                Seating Capacity (Guests) *
              </label>
              <div className="flex items-center gap-1.5">
                {quickCapacities.map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setCapacity(String(cap))}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition cursor-pointer ${
                      capacity === String(cap)
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {cap}p
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min="1"
              max="100"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full h-10 px-3.5 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-white text-sm outline-none transition font-['Inter']"
              required
            />
          </div>

          {/* Table Shape Dropdown */}
          <div className="relative">
            <label className="block text-neutral-300 text-xs font-semibold uppercase mb-1.5 font-['Inter']">
              Table Shape
            </label>
            <button
              type="button"
              onClick={() => {
                setShowShapeDropdown(!showShapeDropdown);
                setShowStatusDropdown(false);
                setShowFlagDropdown(false);
              }}
              className="w-full h-10 px-3.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm flex items-center justify-between transition hover:border-neutral-700 cursor-pointer"
            >
              <span>{shapeOptions.find((s) => s.id === shape)?.label || shape}</span>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </button>
            {showShapeDropdown && (
              <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl shadow-xl overflow-hidden py-1">
                {shapeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setShape(opt.id);
                      setShowShapeDropdown(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs transition flex items-center justify-between cursor-pointer ${
                      shape === opt.id
                        ? 'bg-amber-400/10 text-amber-400 font-semibold'
                        : 'text-neutral-300 hover:bg-neutral-900'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {shape === opt.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service Status Dropdown */}
          <div className="relative">
            <label className="block text-neutral-300 text-xs font-semibold uppercase mb-1.5 font-['Inter']">
              Service Status
            </label>
            <button
              type="button"
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowShapeDropdown(false);
                setShowFlagDropdown(false);
              }}
              className="w-full h-10 px-3.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm flex items-center justify-between transition hover:border-neutral-700 cursor-pointer"
            >
              <span>{serviceStatusOptions.find((s) => s.id === serviceStatus)?.label || serviceStatus}</span>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </button>
            {showStatusDropdown && (
              <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl shadow-xl overflow-hidden py-1">
                {serviceStatusOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setServiceStatus(opt.id);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs transition flex items-center justify-between cursor-pointer ${
                      serviceStatus === opt.id
                        ? 'bg-amber-400/10 text-amber-400 font-semibold'
                        : 'text-neutral-300 hover:bg-neutral-900'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {serviceStatus === opt.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Operational Flag Dropdown */}
          <div className="relative">
            <label className="block text-neutral-300 text-xs font-semibold uppercase mb-1.5 font-['Inter']">
              Operational Flag
            </label>
            <button
              type="button"
              onClick={() => {
                setShowFlagDropdown(!showFlagDropdown);
                setShowShapeDropdown(false);
                setShowStatusDropdown(false);
              }}
              className="w-full h-10 px-3.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm flex items-center justify-between transition hover:border-neutral-700 cursor-pointer"
            >
              <span>{operationalFlagOptions.find((s) => s.id === operationalFlag)?.label || operationalFlag}</span>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </button>
            {showFlagDropdown && (
              <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl shadow-xl overflow-hidden py-1">
                {operationalFlagOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setOperationalFlag(opt.id);
                      setShowFlagDropdown(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs transition flex items-center justify-between cursor-pointer ${
                      operationalFlag === opt.id
                        ? 'bg-amber-400/10 text-amber-400 font-semibold'
                        : 'text-neutral-300 hover:bg-neutral-900'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {operationalFlag === opt.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Inline Delete Confirmation or Delete Trigger Button */}
          {showDeleteConfirm ? (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5 text-xs text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>
                  Are you sure you want to delete <strong>Table {table.number || table.label}</strong>?
                  This action takes the table permanently out of floor service.
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition cursor-pointer py-1"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Delete Table from Floor</span>
              </button>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isDeleting}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isDeleting}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm rounded-xl flex items-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
