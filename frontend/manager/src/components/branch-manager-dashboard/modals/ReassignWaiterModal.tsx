'use client';

import React, { useState, useEffect } from 'react';
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
import { branchManagerService, getActiveBranchId } from '../../../redux/features/branchManagerApi';

interface ReassignWaiterModalProps {
  table: TableItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReassign: (newWaiterName: string) => void;
}

export default function ReassignWaiterModal({
  table,
  isOpen,
  onClose,
  onConfirmReassign,
}: ReassignWaiterModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [reason, setReason] = useState<string>('Workload balancing');
  const [waiters, setWaiters] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadWaiters() {
      try {
        setLoading(true);
        const branchId = getActiveBranchId();
        const staffList = await branchManagerService.getStaffAssignments(branchId, { role: 'WAITER' });

        if (isMounted) {
          const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
          const mapped: StaffMember[] = (Array.isArray(staffList) ? staffList : []).map((s, idx) => ({
            id: s.staffId || s.id,
            name: s.name || s.staffName || 'Waiter',
            role: 'Floor Server / Waiter',
            activeTables: 2,
            avatarColor: colors[idx % colors.length],
            isCurrent: s.name === table.waiter,
          }));
          setWaiters(mapped);
        }
      } catch (err) {
        console.warn('Could not load waiters for reassignment:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadWaiters();
    return () => {
      isMounted = false;
    };
  }, [isOpen, table.waiter]);

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
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden font-['Inter']">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-['Poppins']">
                Reassign Table Waiter
              </h3>
              <p className="text-xs text-neutral-400">
                {table.number} · Currently assigned to <strong className="text-white">{table.waiter || 'Unassigned'}</strong>
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

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {step === 1 ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">
                  Select available waiter from roster:
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  {waiters.length} Waiters Online
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-neutral-400">Loading waiters from database...</div>
              ) : waiters.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400">No waiters found in database.</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {waiters.map((staff) => {
                    const isSelected = selectedStaff?.id === staff.id;

                    return (
                      <div
                        key={staff.id}
                        onClick={() => handleSelectStaff(staff)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'bg-amber-400/10 border-amber-400/40 text-white'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${staff.avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
                            {staff.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{staff.name}</span>
                            <span className="text-xs text-neutral-500">{staff.role}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                            isSelected ? 'bg-amber-400 border-amber-400 text-neutral-950' : 'border-neutral-700'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedStaff}
                  onClick={handleNext}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-neutral-950 font-semibold text-xs rounded-xl flex items-center gap-2 transition"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Reason & Confirm */}
              <div className="p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-start gap-3 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Reassigning <strong>{table.number}</strong> to <strong>{selectedStaff?.name}</strong> will update floor assignments and notify staff terminals.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Reason for reassignment:
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="Workload balancing">Workload balancing (high table turn)</option>
                  <option value="Break coverage">Scheduled break coverage</option>
                  <option value="VIP table request">VIP guest specific assignment</option>
                  <option value="Shift handover">Shift rotation / handover</option>
                </select>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs rounded-xl shadow-lg transition"
                >
                  Confirm Reassignment
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
