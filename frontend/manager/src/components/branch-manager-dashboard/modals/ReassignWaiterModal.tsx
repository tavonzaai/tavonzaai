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
  UserPlus,
  Loader2,
  Calendar,
} from 'lucide-react';
import { branchManagerService, getActiveBranchId } from '../../../redux/features/branchManagerApi';

interface ReassignWaiterModalProps {
  table: TableItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReassign: (newWaiterName: string, waiterId?: string) => void;
}

const SHIFT_OPTIONS = [
  {
    id: 'lunch',
    label: 'Lunch Shift',
    timeRange: '11:00 AM - 04:00 PM',
    startHour: 11,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
  },
  {
    id: 'dinner',
    label: 'Dinner Shift',
    timeRange: '04:00 PM - 11:00 PM',
    startHour: 16,
    startMinute: 0,
    endHour: 23,
    endMinute: 0,
  },
  {
    id: 'fullday',
    label: 'Full Day Shift',
    timeRange: '10:00 AM - 11:00 PM',
    startHour: 10,
    startMinute: 0,
    endHour: 23,
    endMinute: 0,
  },
  {
    id: 'custom',
    label: 'Custom Operating Hours',
    timeRange: 'Custom Hours',
    startHour: 9,
    startMinute: 0,
    endHour: 17,
    endMinute: 0,
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
  const [selectedShift, setSelectedShift] = useState<string>('lunch');
  const [customStartTime, setCustomStartTime] = useState<string>('10:00');
  const [customEndTime, setCustomEndTime] = useState<string>('18:00');

  const [waiters, setWaiters] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick waiter creation form toggle
  const [showAddWaiter, setShowAddWaiter] = useState(false);
  const [newWaiterName, setNewWaiterName] = useState('');
  const [newWaiterEmail, setNewWaiterEmail] = useState('');
  const [newWaiterPhone, setNewWaiterPhone] = useState('');
  const [creatingWaiter, setCreatingWaiter] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedStaff(null);
      setError(null);
      setShowAddWaiter(false);
      return;
    }

    loadBranchWaiters();
  }, [isOpen, table.waiter]);

  async function loadBranchWaiters() {
    try {
      setLoading(true);
      setError(null);
      const branchId = getActiveBranchId();
      let staffList = await branchManagerService.getStaffAssignments(branchId, { role: 'WAITER' });

      // If no dedicated waiters found, fallback to all branch staff
      if (!Array.isArray(staffList) || staffList.length === 0) {
        staffList = await branchManagerService.getStaffAssignments(branchId);
      }

      const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
      const mapped: StaffMember[] = (Array.isArray(staffList) ? staffList : []).map((s, idx) => ({
        id: s.staffId || s.id,
        name: s.name || s.staffName || 'Waiter',
        role: s.role ? `${s.role.toUpperCase()} · Floor` : 'Floor Server / Waiter',
        activeTables: 2,
        avatarColor: colors[idx % colors.length],
        isCurrent: s.name === table.waiter,
      }));
      setWaiters(mapped);
    } catch (err: any) {
      console.warn('Could not load waiters for reassignment:', err);
      setError('Unable to load branch staff list. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaiterName.trim() || !newWaiterEmail.trim()) {
      setError('Name and email are required to create a waiter.');
      return;
    }
    try {
      setCreatingWaiter(true);
      setError(null);
      const branchId = getActiveBranchId();
      const created = await branchManagerService.createStaff(branchId, {
        name: newWaiterName.trim(),
        email: newWaiterEmail.trim().toLowerCase(),
        password: 'Password123!',
        phone: newWaiterPhone.trim() || undefined,
        role: 'WAITER',
        permissions: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'MANAGE_TABLES'],
      });

      const newMember: StaffMember = {
        id: created.staffId || created.id,
        name: created.name || newWaiterName.trim(),
        role: 'Floor Server / Waiter',
        activeTables: 0,
        avatarColor: 'bg-emerald-500',
        isCurrent: false,
      };

      setWaiters((prev) => [newMember, ...prev]);
      setSelectedStaff(newMember);
      setShowAddWaiter(false);
      setNewWaiterName('');
      setNewWaiterEmail('');
      setNewWaiterPhone('');
    } catch (err: any) {
      setError(err?.message || 'Failed to create waiter profile.');
    } finally {
      setCreatingWaiter(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedStaff) return;

    try {
      setSubmitting(true);
      setError(null);
      const branchId = getActiveBranchId();

      // Compute session operating hours
      const today = new Date();
      let start = new Date(today);
      let end = new Date(today);
      let shiftLabel = 'Shift';

      if (selectedShift === 'custom') {
        const [sH, sM] = customStartTime.split(':').map(Number);
        const [eH, eM] = customEndTime.split(':').map(Number);
        start.setHours(sH || 9, sM || 0, 0, 0);
        end.setHours(eH || 17, eM || 0, 0, 0);
        shiftLabel = `Custom Hours (${customStartTime} - ${customEndTime})`;
      } else {
        const shiftCfg = SHIFT_OPTIONS.find((s) => s.id === selectedShift) ?? SHIFT_OPTIONS[0]!;
        start.setHours(shiftCfg.startHour, shiftCfg.startMinute, 0, 0);
        end.setHours(shiftCfg.endHour, shiftCfg.endMinute, 0, 0);
        shiftLabel = `${shiftCfg.label} (${shiftCfg.timeRange})`;
      }

      await branchManagerService.assignWaiterToTable({
        branchId,
        tableId: table.id,
        waiterId: selectedStaff.id,
        sessionStart: start.toISOString(),
        sessionEnd: end.toISOString(),
        shiftLabel,
      });

      onConfirmReassign(selectedStaff.name, selectedStaff.id);
      onClose();
      setStep(1);
      setSelectedStaff(null);
    } catch (err: any) {
      console.error('Failed to assign waiter:', err);
      setError(err?.message || 'Failed to assign waiter to table. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
                Assign Waiter & Operating Hours
              </h3>
              <p className="text-xs text-neutral-400">
                {table.number} · Currently: <strong className="text-white">{table.waiter || 'Unassigned'}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {step === 1 ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">
                  Select available waiter from branch roster:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddWaiter(!showAddWaiter)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{showAddWaiter ? 'Hide New Waiter Form' : '+ Add New Waiter'}</span>
                </button>
              </div>

              {/* Inline Quick Add Waiter Form */}
              {showAddWaiter && (
                <form onSubmit={handleCreateWaiter} className="p-4 bg-neutral-950/90 border border-amber-400/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 font-['Poppins']">
                    <UserPlus className="w-4 h-4" />
                    <span>Quick Create Waiter Profile</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="Full Name (e.g. Liam Smith)"
                      value={newWaiterName}
                      onChange={(e) => setNewWaiterName(e.target.value)}
                      required
                      className="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="email"
                      placeholder="Email (e.g. liam@restaurant.com)"
                      value={newWaiterEmail}
                      onChange={(e) => setNewWaiterEmail(e.target.value)}
                      required
                      className="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <input
                      type="tel"
                      placeholder="Phone (optional)"
                      value={newWaiterPhone}
                      onChange={(e) => setNewWaiterPhone(e.target.value)}
                      className="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 flex-1"
                    />
                    <button
                      type="submit"
                      disabled={creatingWaiter}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                    >
                      {creatingWaiter ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Create Waiter</span>
                    </button>
                  </div>
                </form>
              )}

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-neutral-400">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  <span>Loading waiters from branch database...</span>
                </div>
              ) : waiters.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <p className="text-xs text-neutral-400">No waiters found in this branch roster.</p>
                  <button
                    type="button"
                    onClick={() => setShowAddWaiter(true)}
                    className="text-xs text-amber-400 underline font-medium cursor-pointer"
                  >
                    Click here to create the first waiter
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {waiters.map((staff) => {
                    const isSelected = selectedStaff?.id === staff.id;
                    return (
                      <div
                        key={staff.id}
                        onClick={() => setSelectedStaff(staff)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
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
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                              isSelected ? 'bg-amber-400 border-amber-400 text-neutral-950' : 'border-neutral-700'
                            }`}
                          >
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
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedStaff}
                  onClick={() => setStep(2)}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-neutral-950 font-semibold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
                >
                  <span>Select Operating Hours</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Operating Hours / Shift & Confirm */}
              <div className="p-3.5 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-start gap-3 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Assigning <strong>{table.number}</strong> to <strong>{selectedStaff?.name}</strong>. Please select the operational shift and operating hours.
                </span>
              </div>

              {/* Operating Hours / Shift Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-300">
                  Select Operating Hours / Shift:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SHIFT_OPTIONS.map((shift) => (
                    <button
                      key={shift.id}
                      type="button"
                      onClick={() => setSelectedShift(shift.id)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col transition cursor-pointer ${
                        selectedShift === shift.id
                          ? 'bg-amber-400/10 border-amber-400 text-white'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{shift.label}</span>
                        {selectedShift === shift.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <span className="text-[11px] text-neutral-400 mt-0.5">{shift.timeRange}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Operating Hours Inputs */}
              {selectedShift === 'custom' && (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 animate-in fade-in">
                  <span className="text-xs font-medium text-neutral-300">Specify Custom Operating Hours:</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1">Start Time</label>
                      <input
                        type="time"
                        value={customStartTime}
                        onChange={(e) => setCustomStartTime(e.target.value)}
                        className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1">End Time</label>
                      <input
                        type="time"
                        value={customEndTime}
                        onChange={(e) => setCustomEndTime(e.target.value)}
                        className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Reason Selector */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Reason for table assignment:
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Workload balancing">Workload balancing (high table turn)</option>
                  <option value="Break coverage">Scheduled break coverage</option>
                  <option value="VIP table request">VIP guest specific assignment</option>
                  <option value="Shift handover">Shift rotation / handover</option>
                </select>
              </div>

              {/* Bottom Buttons */}
              <div className="pt-3 border-t border-neutral-800 flex justify-between items-center">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirm}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-semibold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Assignment...</span>
                    </>
                  ) : (
                    <span>Confirm & Assign</span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
