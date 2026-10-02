'use client';

import React, { useState } from 'react';
import { X, Plus, ChevronDown } from 'lucide-react';
import { StaffMember, StaffRole } from '../types';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStaff: (newStaff: StaffMember) => void;
  restaurantName?: string;
}

export default function AddStaffModal({
  isOpen,
  onClose,
  onAddStaff,
  restaurantName = 'Tavonza Downtown',
}: AddStaffModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('Waiter');
  const [status, setStatus] = useState<'Active' | 'On Leave' | 'Inactive'>('Active');

  if (!isOpen) return null;

  const handleClose = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setRole('Waiter');
    setStatus('Active');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const initials = fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newStaff: StaffMember = {
      id: `st-${Date.now()}`,
      name: fullName.trim(),
      role: role,
      avatar: initials || 'ST',
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '')}@tavonza.com`,
      phone: phone.trim() || '+880 1700-000000',
      status: status,
      restaurantName: restaurantName,
      days: role === 'Bartender' ? ['Fri', 'Sat', 'Sun'] : role === 'Waiter' ? ['Tue', 'Thu', 'Sat'] : ['Mon', 'Wed', 'Fri'],
      shift: 'Morning (09:00 - 17:00)',
    };

    onAddStaff(newStaff);
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#FAF7F2] rounded-3xl overflow-hidden shadow-2xl border border-zinc-300 text-zinc-900 animate-in zoom-in-95 duration-200 my-auto flex flex-col"
      >
        {/* ========================================================================= */}
        {/* 1. MODAL HEADER (Matches Figma Image 2) */}
        {/* ========================================================================= */}
        <div className="bg-[#18181B] text-white p-5 px-6 flex items-center justify-between border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-lg font-serif font-bold text-white tracking-tight leading-tight">
              Add Staff Member
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Fill in details to add a new team member
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. MODAL FORM BODY (Matches Figma Images 2 & 3) */}
        {/* ========================================================================= */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Smith"
              className="w-full h-11 px-4 bg-white border border-[#E5E0D8] rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@tavonza.com"
              className="w-full h-11 px-4 bg-white border border-[#E5E0D8] rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1700-000000"
              className="w-full h-11 px-4 bg-white border border-[#E5E0D8] rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
            />
          </div>

          {/* Role Dropdown (Matches Figma Image 3) */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
              Role
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full h-11 px-4 pr-10 bg-white border border-[#E5E0D8] rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:border-amber-500 cursor-pointer appearance-none shadow-sm"
              >
                <option value="Manager">Manager</option>
                <option value="Assistant Manager">Assistant Manager</option>
                <option value="Cashier">Cashier</option>
                <option value="Waiter">Waiter</option>
                <option value="Kitchen Staff">Kitchen Staff</option>
                <option value="Bartender">Bartender</option>
                <option value="Delivery Staff">Delivery Staff</option>
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status Pills */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-2">
              Status
            </label>
            <div className="flex items-center gap-2">
              {(['Active', 'On Leave', 'Inactive'] as const).map((st) => {
                const isSelected = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-[#18181B] text-white shadow-md'
                        : 'bg-white border border-[#E5E0D8] text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. MODAL FOOTER */}
          {/* ========================================================================= */}
          <div className="pt-4 flex items-center gap-3 border-t border-[#E5E0D8]">
            <button
              type="button"
              onClick={handleClose}
              className="h-11 px-6 bg-white hover:bg-zinc-100 border border-[#E5E0D8] text-zinc-800 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 px-6 bg-[#18181B] hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 flex-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
