'use client';

import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { Employee, EmployeeRole, EmployeeShiftType } from '../types';

export interface EmployeeDetailModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Employee) => void;
}

export default function EmployeeDetailModal({
  employee,
  isOpen,
  onClose,
  onSave,
}: EmployeeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'shift' | 'performance'>(
    'profile'
  );

  const [formData, setFormData] = useState<Employee | null>(null);

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
      setActiveTab('profile');
    }
  }, [employee]);

  if (!isOpen || !formData) return null;

  const roleOptions: EmployeeRole[] = [
    'Waiter',
    'Bartender',
    'Chef',
    'Host',
    'Manager',
  ];

  const shiftOptions: EmployeeShiftType[] = [
    'Morning',
    'Evening',
    'Night',
    'Full Day',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-[420px] bg-[#141416] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-['Inter'] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header matching Screenshot 1 */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="size-12 rounded-xl object-cover border border-white/10"
              />
              <span className="size-3.5 absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full border-2 border-[#141416]" />
            </div>
            <div>
              <h3 className="text-white text-lg font-bold leading-5">
                {formData.name}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 bg-amber-950/60 text-amber-500 text-xs font-semibold rounded-md border border-amber-800/40">
                  {formData.role}
                </span>
                <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-500 text-xs font-semibold rounded-md border border-emerald-800/40">
                  {formData.status}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-zinc-800/90 flex items-center gap-6 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'text-amber-400 border-amber-500'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shift')}
            className={`py-2.5 font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'shift'
                ? 'text-amber-400 border-amber-500'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            Shift
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('performance')}
            className={`py-2.5 font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'performance'
                ? 'text-amber-400 border-amber-500'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            Performance
          </button>
        </div>

        {/* Form Body matching Screenshot 1 */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-sm">
          {activeTab === 'profile' && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-zinc-400 text-sm">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-9 px-3.5 bg-zinc-800/80 rounded-lg border border-zinc-700/60 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="text-zinc-400 text-sm">Role</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {roleOptions.map((role) => {
                    const isSelected =
                      formData.role.toLowerCase() === role.toLowerCase() ||
                      (role === 'Waiter' && formData.role.includes('Waiter')) ||
                      (role === 'Host' && formData.role.includes('Host'));

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData({ ...formData, role })}
                        className={`h-8 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-amber-950/50 text-amber-400 border border-amber-500 shadow-sm'
                            : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 hover:text-white hover:bg-zinc-700'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-sm">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-9 px-3 bg-zinc-800/80 rounded-lg border border-zinc-700/60 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-sm">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-9 px-3 bg-zinc-800/80 rounded-lg border border-zinc-700/60 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Rating & Accuracy */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-sm">Rating</label>
                  <div className="w-full h-9 px-3 bg-zinc-800/80 rounded-lg border border-zinc-700/60 flex items-center gap-1 text-white text-sm">
                    <span>{formData.rating.toFixed(1)}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-sm">Accuracy</label>
                  <div className="w-full h-9 px-3 bg-zinc-800/80 rounded-lg border border-zinc-700/60 flex items-center text-white text-sm">
                    <span>{formData.accuracy}%</span>
                  </div>
                </div>
              </div>

              {/* Tables Today & Shift */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-sm">Tables Today</label>
                  <div className="w-full h-9 px-3 bg-zinc-800/80 rounded-lg border border-zinc-700/60 flex items-center text-white text-sm">
                    <span>{formData.tablesToday}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-sm">Shift</label>
                  <div className="w-full h-9 px-3 bg-zinc-800/80 rounded-lg border border-zinc-700/60 flex items-center text-white text-sm">
                    <span>{formData.shiftType}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-400 text-sm">
                    Notes <span className="text-zinc-600 text-xs">(internal only)</span>
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes, allergies, special instructions..."
                  className="w-full p-3 bg-zinc-800/80 rounded-lg border border-zinc-700/60 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none placeholder-zinc-500"
                />
              </div>

              {/* Hire Date Pill */}
              <div className="px-3.5 py-2.5 bg-[#0a0a0c] rounded-lg border border-zinc-800 flex items-center justify-between text-sm">
                <span className="text-zinc-500">Hire Date</span>
                <span className="text-zinc-300 font-mono">
                  {formData.hireDate}
                </span>
              </div>
            </>
          )}

          {activeTab === 'shift' && (
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-zinc-400 text-sm">Shift Schedule</label>
                <div className="grid grid-cols-2 gap-2">
                  {shiftOptions.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormData({ ...formData, shiftType: st })}
                      className={`h-9 px-3 text-sm font-semibold rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                        formData.shiftType === st
                          ? 'bg-amber-950/50 text-amber-400 border-amber-500'
                          : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60 hover:text-white'
                      }`}
                    >
                      <span>{st}</span>
                      {formData.shiftType === st && <span className="text-amber-400">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 text-sm">Working Hours</label>
                <input
                  type="text"
                  value={formData.shiftHours}
                  onChange={(e) => setFormData({ ...formData, shiftHours: e.target.value })}
                  className="w-full h-9 px-3 bg-zinc-800/80 rounded-lg border border-zinc-700/60 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 text-sm">Current Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['On Shift', 'On Duty', 'Off Duty'] as const).map((stat) => (
                    <button
                      key={stat}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: stat })}
                      className={`h-9 px-3 text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                        formData.status === stat
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500'
                          : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60 hover:text-white'
                      }`}
                    >
                      {stat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-3">
              <div className="p-3 bg-zinc-800/80 rounded-lg border border-zinc-700/60 flex items-center justify-between">
                <span className="text-zinc-400 text-sm font-medium">Rating</span>
                <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                  <span>{formData.rating.toFixed(1)}</span>
                  <Star className="w-3 h-3 fill-amber-400" />
                </div>
              </div>

              <div className="p-3 bg-zinc-800/80 rounded-lg border border-zinc-700/60 flex items-center justify-between">
                <span className="text-zinc-400 text-sm font-medium">Tables Served Today</span>
                <span className="text-white font-bold text-sm">{formData.tablesToday}</span>
              </div>

              <div className="p-3 bg-zinc-800/80 rounded-lg border border-zinc-700/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm font-medium">Order Accuracy</span>
                  <span className="text-emerald-400 font-bold text-sm">{formData.accuracy}%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${formData.accuracy}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Action Buttons matching Screenshot 1 */}
          <div className="pt-3 border-t border-zinc-800/90 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-lg border border-zinc-700/70 bg-zinc-900 text-zinc-400 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 px-5 bg-[#f59e0b] hover:bg-amber-400 text-white text-sm font-bold rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
