'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, ChevronDown, Store, MapPin, User, CheckCircle2 } from 'lucide-react';
import { BranchItem, Manager } from '../types';
import { MOCK_MANAGERS } from '../restaurantsData';

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: BranchItem | null;
  onSave: (updatedBranch: BranchItem) => void;
}

export default function EditBranchModal({
  isOpen,
  onClose,
  branch,
  onSave,
}: EditBranchModalProps) {
  // Form State
  const [branchName, setBranchName] = useState('');
  const [locationArea, setLocationArea] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'Open' | 'Closed' | 'Opening Soon'>('Open');
  const [selectedManagerName, setSelectedManagerName] = useState('Arif Hossain');
  const [services, setServices] = useState<string[]>(['Dine-In', 'Delivery']);

  // Sync state when branch prop changes
  useEffect(() => {
    if (branch) {
      setBranchName(branch.name || '');
      setLocationArea(branch.address || `${branch.city}, ${branch.country}`);
      setPhone(branch.phone || '+880 1700-000000');
      setEmail(branch.email || 'branch@tavonza.com');
      setStatus(branch.status || 'Open');
      setSelectedManagerName(branch.manager?.name || 'Arif Hossain');
      setServices(branch.services || ['Dine-In', 'Delivery']);
    }
  }, [branch, isOpen]);

  if (!isOpen || !branch) return null;

  const toggleService = (serviceName: string) => {
    setServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleSave = () => {
    const updatedManager: Manager =
      MOCK_MANAGERS.find((m) => m.name === selectedManagerName) || {
        id: branch.manager?.id || 'mgr-def',
        name: selectedManagerName,
        role: 'Branch Manager',
        email: `${selectedManagerName.toLowerCase().replace(/\s+/g, '')}@tavonza.com`,
        avatar: selectedManagerName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      };

    const updatedBranch: BranchItem = {
      ...branch,
      name: branchName.trim() || branch.name,
      address: locationArea.trim() || branch.address,
      phone: phone.trim(),
      email: email.trim(),
      status,
      manager: updatedManager,
      services,
    };

    onSave(updatedBranch);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#FAF7F2] rounded-3xl overflow-hidden shadow-2xl border border-zinc-300 text-zinc-900 max-h-[92vh] flex flex-col my-auto animate-in zoom-in-95 duration-200"
      >
        {/* ========================================================================= */}
        {/* 1. HEADER BAR */}
        {/* ========================================================================= */}
        <div className="bg-[#18181B] text-white p-5 px-6 flex items-center justify-between border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-lg font-serif font-bold text-white tracking-tight leading-tight">
              Edit Branch
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              {branch.name} · Settings & Location
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. BODY CONTENT (Matches Figma Image 3) */}
        {/* ========================================================================= */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E5E0D8] pb-2">
              Basic Information
            </h3>

            {/* Branch Name */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Branch Name
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Branch Name"
                className="w-full h-10 px-3.5 bg-white border border-[#E5E0D8] rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:border-amber-500 shadow-sm"
              />
            </div>

            {/* Location / Area */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Location / Area
              </label>
              <input
                type="text"
                value={locationArea}
                onChange={(e) => setLocationArea(e.target.value)}
                placeholder="Location / Area"
                className="w-full h-10 px-3.5 bg-white border border-[#E5E0D8] rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:border-amber-500 shadow-sm"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1700-000000"
                className="w-full h-10 px-3.5 bg-white border border-[#E5E0D8] rounded-xl text-xs font-mono font-medium text-zinc-900 focus:outline-none focus:border-amber-500 shadow-sm"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="branch@tavonza.com"
                className="w-full h-10 px-3.5 bg-white border border-[#E5E0D8] rounded-xl text-xs font-mono font-medium text-zinc-900 focus:outline-none focus:border-amber-500 shadow-sm"
              />
            </div>
          </div>

          {/* SECTION 2: BRANCH STATUS */}
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E5E0D8] pb-2">
              Branch Status
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {(['Open', 'Closed', 'Opening Soon'] as const).map((st) => {
                const isActive = status === st;
                const label = st === 'Opening Soon' ? 'Temporarily Closed' : st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`h-10 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#18181B] text-white border-[#18181B] shadow-sm'
                        : 'bg-white border-[#E5E0D8] text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: BRANCH MANAGER */}
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E5E0D8] pb-2">
              Branch Manager
            </h3>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                Assigned Manager
              </label>
              <div className="relative">
                <select
                  value={selectedManagerName}
                  onChange={(e) => setSelectedManagerName(e.target.value)}
                  className="w-full h-10 px-3.5 pr-10 bg-white border border-[#E5E0D8] rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:border-amber-500 appearance-none shadow-sm cursor-pointer"
                >
                  <option value="Arif Hossain">Arif Hossain</option>
                  <option value="Sarah Ahmed">Sarah Ahmed</option>
                  <option value="Rafi Islam">Rafi Islam</option>
                  <option value="Nadia Chowdhury">Nadia Chowdhury</option>
                  <option value="Priya Sen">Priya Sen</option>
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* SECTION 4: SERVICES */}
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E5E0D8] pb-2">
              Services
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {['Dine-In', 'Delivery', 'Pickup', 'QR Ordering'].map((service) => {
                const isChecked = services.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`h-11 px-4 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-[#FFF9EE] border-2 border-amber-500 text-zinc-900 shadow-sm'
                        : 'bg-white border-[#E5E0D8] text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-amber-500 text-white'
                          : 'border border-zinc-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{service}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. FOOTER BAR */}
        {/* ========================================================================= */}
        <div className="p-5 px-6 bg-white border-t border-[#E5E0D8] flex items-center justify-between gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl border border-[#E5E0D8] hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="h-10 px-6 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
