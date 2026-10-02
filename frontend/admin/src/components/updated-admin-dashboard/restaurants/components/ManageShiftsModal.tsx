'use client';

import React, { useState, useEffect } from 'react';
import { Clock, X, Edit2, Trash2, Plus, Check } from 'lucide-react';
import { StaffMember, StaffShift } from '../types';

interface ManageShiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  onSave?: (staffId: string, updatedShifts: StaffShift[]) => void;
}

const DAYS_OF_WEEK = [
  { full: 'Monday', short: 'MON' },
  { full: 'Tuesday', short: 'TUE' },
  { full: 'Wednesday', short: 'WED' },
  { full: 'Thursday', short: 'THU' },
  { full: 'Friday', short: 'FRI' },
  { full: 'Saturday', short: 'SAT' },
  { full: 'Sunday', short: 'SUN' },
] as const;

type DayFull = typeof DAYS_OF_WEEK[number]['full'];
type DayShort = typeof DAYS_OF_WEEK[number]['short'];

// Helper to calculate hours between times like "09:00" and "17:00"
function calculateHours(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  let diff = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
  if (diff < 0) diff += 24 * 60;
  return Math.round((diff / 60) * 10) / 10;
}

export default function ManageShiftsModal({
  isOpen,
  onClose,
  staff,
  onSave,
}: ManageShiftsModalProps) {
  // Shifts state
  const [shifts, setShifts] = useState<StaffShift[]>([]);

  // Form state for adding/editing shift (Figma Image 3)
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayFull>('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync shifts when staff changes or modal opens
  useEffect(() => {
    if (staff) {
      if (staff.shifts && staff.shifts.length > 0) {
        setShifts(staff.shifts);
      } else {
        // Default mock shifts matching Figma Image 2
        setShifts([
          {
            id: 's-mon',
            day: 'Monday',
            shortDay: 'MON',
            startTime: '09:00',
            endTime: '17:00',
            hours: 8.0,
          },
          {
            id: 's-wed',
            day: 'Wednesday',
            shortDay: 'WED',
            startTime: '09:00',
            endTime: '17:00',
            hours: 8.0,
          },
          {
            id: 's-fri',
            day: 'Friday',
            shortDay: 'FRI',
            startTime: '10:00',
            endTime: '18:00',
            hours: 8.0,
          },
        ]);
      }
    }
  }, [staff, isOpen]);

  if (!isOpen || !staff) return null;

  // Total statistics calculations
  const totalHours = shifts.reduce((acc, s) => acc + s.hours, 0);
  const uniqueDays = new Set(shifts.map((s) => s.day)).size;

  // Open inline add/edit shift form
  const handleOpenAddShift = (defaultDay?: DayFull) => {
    setEditingShiftId(null);
    if (defaultDay) {
      setSelectedDay(defaultDay);
    } else {
      // Pick first day without shift
      const existingDays = new Set(shifts.map((s) => s.day));
      const firstAvailable = DAYS_OF_WEEK.find((d) => !existingDays.has(d.full));
      setSelectedDay(firstAvailable ? firstAvailable.full : 'Monday');
    }
    setStartTime('09:00');
    setEndTime('17:00');
    setIsAddingShift(true);
  };

  const handleEditShift = (shift: StaffShift) => {
    setEditingShiftId(shift.id);
    setSelectedDay(shift.day);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setIsAddingShift(true);
  };

  const handleDeleteShift = (shiftId: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
  };

  // Add or update shift in list
  const handleSaveInlineShift = () => {
    const dayConfig = DAYS_OF_WEEK.find((d) => d.full === selectedDay)!;
    const hours = calculateHours(startTime, endTime);

    if (editingShiftId) {
      setShifts((prev) =>
        prev.map((s) =>
          s.id === editingShiftId
            ? {
                ...s,
                day: selectedDay,
                shortDay: dayConfig.short,
                startTime,
                endTime,
                hours,
              }
            : s
        )
      );
    } else {
      // Remove any existing shift for this day to maintain 1 shift per day limit
      const filtered = shifts.filter((s) => s.day !== selectedDay);
      const newShift: StaffShift = {
        id: `s-${Date.now()}`,
        day: selectedDay,
        shortDay: dayConfig.short,
        startTime,
        endTime,
        hours,
      };
      setShifts([...filtered, newShift]);
    }

    setIsAddingShift(false);
    setEditingShiftId(null);
  };

  // Final Save Shifts button action
  const handleSaveAll = () => {
    onSave?.(staff.id, shifts);
    setToastMessage('Weekly shifts updated successfully!');
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#FAF7F2] rounded-3xl overflow-hidden shadow-2xl border border-zinc-800/20 text-zinc-900 animate-in zoom-in-95 duration-200"
      >
        {/* ========================================================================= */}
        {/* 1. TOP HEADER BAR (Matches Figma Image 2 & 3) */}
        {/* ========================================================================= */}
        <div className="bg-[#18181B] text-white p-5 px-6 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3.5">
            {/* Avatar Circle */}
            <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-inner">
              {staff.avatar || staff.name.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <h2 className="text-lg font-serif font-bold text-white tracking-tight leading-tight">
                {staff.name}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {staff.role} · Weekly Shifts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 24h / week Pill Badge */}
            <div className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-mono font-bold">
              {totalHours.toFixed(0)}h / week
            </div>

            {/* Close Icon */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BODY: WEEKLY SHIFTS LIST (MON to SUN - Matches Figma Image 2) */}
        {/* ========================================================================= */}
        <div className="p-6 space-y-3 max-h-[62vh] overflow-y-auto custom-scrollbar">
          {DAYS_OF_WEEK.map((dayObj) => {
            const existingShift = shifts.find((s) => s.day === dayObj.full);
            const isHasShift = !!existingShift;

            return (
              <div key={dayObj.full} className="flex items-center gap-4">
                {/* Day Label (e.g. MON, TUE) */}
                <span
                  className={`w-12 text-xs font-bold font-mono tracking-wider ${
                    isHasShift ? 'text-[#D97706]' : 'text-zinc-400'
                  }`}
                >
                  {dayObj.short}
                </span>

                {/* Shift Item Card or Off Pill */}
                {isHasShift ? (
                  <div className="flex-1 bg-white border border-[#E5E0D8] rounded-2xl p-3 px-4 flex items-center justify-between shadow-sm hover:border-amber-400/50 transition-all group">
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-800">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>
                        {existingShift.startTime} — {existingShift.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-zinc-400 font-medium">
                        {existingShift.hours.toFixed(1)}h
                      </span>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleEditShift(existingShift)}
                        className="text-zinc-400 hover:text-zinc-800 transition-colors p-1"
                        title="Edit Shift"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteShift(existingShift.id)}
                        className="text-zinc-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete Shift"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => handleOpenAddShift(dayObj.full)}
                    className="flex-1 border border-dashed border-[#E5E0D8] bg-[#F4F0E8]/40 hover:bg-[#F4F0E8] rounded-2xl p-3 text-center text-xs font-medium text-zinc-400 cursor-pointer transition-colors"
                  >
                    Off
                  </div>
                )}
              </div>
            );
          })}

          {/* ========================================================================= */}
          {/* 3. INLINE "+ ADD SHIFT" / "NEW SHIFT" FORM (Matches Figma Image 3) */}
          {/* ========================================================================= */}
          {isAddingShift && (
            <div className="mt-4 bg-[#FEF9C3]/60 border-2 border-amber-400/90 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                {editingShiftId ? 'Edit Shift' : 'New Shift'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                {/* Day Select */}
                <div className="sm:col-span-4">
                  <label className="text-[11px] font-semibold text-zinc-500 block mb-1">
                    Day
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value as DayFull)}
                    className="w-full h-10 px-3 bg-white border border-[#E5E0D8] rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:border-amber-500 shadow-sm"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.full} value={d.full}>
                        {d.full}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Time */}
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-semibold text-zinc-500 block mb-1">
                    Start
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="09:00"
                      className="w-full h-10 pl-3 pr-8 bg-white border border-[#E5E0D8] rounded-xl text-xs font-mono font-semibold text-zinc-900 focus:outline-none focus:border-amber-500 shadow-sm"
                    />
                    <Clock className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* End Time */}
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-semibold text-zinc-500 block mb-1">
                    End
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="17:00"
                      className="w-full h-10 pl-3 pr-8 bg-white border border-[#E5E0D8] rounded-xl text-xs font-mono font-semibold text-zinc-900 focus:outline-none focus:border-amber-500 shadow-sm"
                    />
                    <Clock className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="sm:col-span-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSaveInlineShift}
                    className="h-10 px-3 bg-[#18181B] hover:bg-black text-white font-bold text-xs rounded-xl flex-1 transition-all cursor-pointer shadow-sm"
                  >
                    {editingShiftId ? 'Save' : 'Add'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingShift(false);
                      setEditingShiftId(null);
                    }}
                    className="h-10 px-2 bg-white hover:bg-zinc-100 border border-[#E5E0D8] text-zinc-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. FOOTER BAR (Matches Figma Image 2 & 3) */}
        {/* ========================================================================= */}
        <div className="p-5 px-6 bg-white border-t border-[#E5E0D8] flex items-center justify-between gap-4 flex-wrap">
          {/* Summary stats */}
          <div className="text-xs font-mono font-medium text-zinc-400">
            {shifts.length} shifts · {totalHours.toFixed(1)}h total · {uniqueDays} days
          </div>

          <div className="flex items-center gap-3">
            {/* + Add Shift Outline Button */}
            {!isAddingShift && (
              <button
                type="button"
                onClick={() => handleOpenAddShift()}
                className="h-10 px-4 rounded-xl border border-[#E5E0D8] hover:border-zinc-400 bg-white text-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-600" />
                <span>Add Shift</span>
              </button>
            )}

            {/* Save Shifts Solid Button */}
            <button
              type="button"
              onClick={handleSaveAll}
              className="h-10 px-6 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            >
              Save Shifts
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl font-semibold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
