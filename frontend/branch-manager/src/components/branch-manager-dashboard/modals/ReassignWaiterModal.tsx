'use client';

import React, { useState } from 'react';
import { TableItem, StaffMember } from '../types';
import {
  X,
  User,
  ArrowRight,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';

interface ReassignWaiterModalProps {
  table: TableItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReassign: (newWaiterName: string) => void;
}

const AVAILABLE_WAITERS: StaffMember[] = [
  {
    id: 's1',
    name: 'Alex',
    role: 'Senior Waiter',
    activeTables: 2,
    avatarColor: 'bg-emerald-500',
  },
  {
    id: 's2',
    name: 'Sara',
    role: 'Senior Waiter',
    activeTables: 4,
    avatarColor: 'bg-amber-500',
    isCurrent: true,
  },
  {
    id: 's3',
    name: 'Mello',
    role: 'Waiter',
    activeTables: 3,
    avatarColor: 'bg-blue-500',
  },
  {
    id: 's4',
    name: 'Poni',
    role: 'Senior Waiter',
    activeTables: 5,
    avatarColor: 'bg-purple-500',
  },
];

export default function ReassignWaiterModal({
  table,
  isOpen,
  onClose,
  onConfirmReassign,
}: ReassignWaiterModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [reason, setReason] = useState<string>('Workload balancing');

  if (!isOpen) return null;

  const handleSelectStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
  };

  const handleNext = () => {
    if (selectedStaff) {
      setStep(2);
    }
  };

  const handleConfirm = () => {
    if (selectedStaff) {
      onConfirmReassign(selectedStaff.name);
      onClose();
      setStep(1);
      setSelectedStaff(null);
    }
  };

  const handleCancel = () => {
    setStep(1);
    setSelectedStaff(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-white font-['Inter']">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-['Poppins']">
                Reassign Table {table.number}
              </h3>
              <p className="text-xs text-neutral-400">
                {step === 1 ? 'Step 1 of 2: Select Replacement Waiter' : 'Step 2 of 2: Confirm Reassignment'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Selection */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <span>Current Table: <strong className="text-white">{table.number}</strong></span>
              <span>Current Waiter: <strong className="text-amber-400">{table.waiter || 'Sara'}</strong></span>
            </div>

            <span className="text-xs font-medium text-neutral-300">
              Available Staff on Floor
            </span>

            <div className="space-y-2">
              {AVAILABLE_WAITERS.map((staff) => {
                const isSelected = selectedStaff?.id === staff.id;
                const isCurrent = staff.name === (table.waiter || 'Sara');

                return (
                  <div
                    key={staff.id}
                    onClick={() => !isCurrent && handleSelectStaff(staff)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      isCurrent
                        ? 'opacity-40 border-neutral-800 bg-neutral-950 cursor-not-allowed'
                        : isSelected
                        ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                        : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${staff.avatarColor} flex items-center justify-center text-neutral-950 font-bold text-xs`}>
                        {staff.name.slice(0, 1)}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{staff.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                              Current
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-neutral-500">{staff.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-400 font-medium">
                        {staff.activeTables} active tables
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400 text-neutral-950'
                            : 'border-neutral-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-medium rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedStaff}
                onClick={handleNext}
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && selectedStaff && (
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-amber-400/5 rounded-xl border border-amber-400/20 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>Reassignment Details</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-neutral-500">From Waiter:</span>
                  <p className="text-white font-medium">{table.waiter || 'Sara'}</p>
                </div>
                <div>
                  <span className="text-neutral-500">To New Waiter:</span>
                  <p className="text-amber-400 font-semibold">{selectedStaff.name}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Table:</span>
                  <p className="text-white font-medium">{table.number}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Active Order:</span>
                  <p className="text-white font-medium">{table.orderNumber || '#1042'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-neutral-400 font-medium">
                Reason for Reassignment
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Workload balancing">Workload balancing (Heavy floor rush)</option>
                <option value="Waiter break scheduled">Waiter break scheduled</option>
                <option value="VIP Guest handling">VIP Guest requested senior server</option>
                <option value="Shift changeover">Shift changeover handover</option>
              </select>
            </div>

            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 flex items-center gap-2 text-xs text-neutral-400">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Both {table.waiter || 'Sara'} and {selectedStaff.name} will receive real-time POS notifications.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-medium rounded-lg transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 transition shadow-lg cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Reassign</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
