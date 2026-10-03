'use client';

import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { CashierCustomer, CustomerTier } from '../types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<CashierCustomer, 'id' | 'visits' | 'totalSpent' | 'lastVisit'>) => void;
  initialCustomer?: CashierCustomer | null;
}

export default function AddCustomerModal({
  isOpen,
  onClose,
  onSave,
  initialCustomer,
}: AddCustomerModalProps) {
  const [name, setName] = useState(initialCustomer?.name || '');
  const [email, setEmail] = useState(initialCustomer?.email || '');
  const [phone, setPhone] = useState(initialCustomer?.phone || '');
  const [tier, setTier] = useState<CustomerTier>(initialCustomer?.tier || 'Bronze');
  const [prevCustomer, setPrevCustomer] = useState(initialCustomer);

  if (initialCustomer !== prevCustomer) {
    setPrevCustomer(initialCustomer);
    setName(initialCustomer?.name || '');
    setEmail(initialCustomer?.email || '');
    setPhone(initialCustomer?.phone || '');
    setTier(initialCustomer?.tier || 'Bronze');
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onSave({
      name,
      email,
      phone: phone || '+1 555-0000',
      tier,
      avatarUrl:
        initialCustomer?.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-[#131315] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 font-['Inter'] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h2 className="text-white text-xl font-bold">
              {initialCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full h-10 px-3 bg-zinc-900 border border-white/10 rounded-lg text-white text-base focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@email.com"
              className="w-full h-10 px-3 bg-zinc-900 border border-white/10 rounded-lg text-white text-base focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555-0199"
              className="w-full h-10 px-3 bg-zinc-900 border border-white/10 rounded-lg text-white text-base focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Membership Tier
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['Bronze', 'Silver', 'Gold'] as CustomerTier[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  className={`py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                    tier === t
                      ? 'bg-amber-400 text-white border-amber-400 shadow-sm'
                      : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-white font-semibold text-base rounded-xl transition-colors cursor-pointer shadow-md shadow-amber-400/20"
            >
              {initialCustomer ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
