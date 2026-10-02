'use client';

import React, { useState } from 'react';
import { X, CreditCard, PlusCircle } from 'lucide-react';
import { CardMember, CardTier, CardMemberStatus } from '../types';

interface AddCardMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: Omit<CardMember, 'id'>) => void;
  nextCardId: string;
}

export default function AddCardMemberModal({
  isOpen,
  onClose,
  onAddMember,
  nextCardId,
}: AddCardMemberModalProps) {
  const [cardId, setCardId] = useState(nextCardId);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<CardTier>('Bronze');
  const [points, setPoints] = useState(500);
  const [totalSpend, setTotalSpend] = useState(0);
  const [status, setStatus] = useState<CardMemberStatus>('Active');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onAddMember({
      cardId: cardId || nextCardId,
      name: name.trim(),
      email: email.trim(),
      tier,
      points: Number(points) || 0,
      totalSpend: Number(totalSpend) || 0,
      visits: 1,
      lastVisit: 'Today',
      joined: 'Today',
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#131417] border border-[#242630] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white text-lg sm:text-xl font-bold font-['Inter']">
                Issue New Tavonza Card
              </h2>
              <span className="text-zinc-500 text-sm font-normal font-['Inter']">
                Enroll a guest into the loyalty reward program
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Card ID */}
            <div className="space-y-1">
              <label className="text-zinc-400 text-sm font-semibold block">
                Card ID
              </label>
              <input
                type="text"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                placeholder="e.g. TCV-0015"
                className="w-full h-10 px-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Tier */}
            <div className="space-y-1">
              <label className="text-zinc-400 text-sm font-semibold block">
                Loyalty Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as CardTier)}
                className="w-full h-10 px-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500 cursor-pointer"
              >
                <option value="Platinum">Platinum (10k+ pts)</option>
                <option value="Gold">Gold (5k–9.9k pts)</option>
                <option value="Silver">Silver (1k–4.9k pts)</option>
                <option value="Bronze">Bronze (0–999 pts)</option>
              </select>
            </div>
          </div>

          {/* Member Name */}
          <div className="space-y-1">
            <label className="text-zinc-400 text-sm font-semibold block">
              Member Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eleanor Vance"
              className="w-full h-10 px-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-zinc-400 text-sm font-semibold block">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. eleanor@example.com"
              className="w-full h-10 px-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Initial Points */}
            <div className="space-y-1">
              <label className="text-zinc-400 text-sm font-semibold block">
                Starting Points
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                min={0}
                className="w-full h-10 px-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Initial Total Spend */}
            <div className="space-y-1">
              <label className="text-zinc-400 text-sm font-semibold block">
                Initial Spend ($)
              </label>
              <input
                type="number"
                value={totalSpend}
                onChange={(e) => setTotalSpend(Number(e.target.value))}
                min={0}
                className="w-full h-10 px-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-zinc-400 text-sm font-semibold block">
              Member Status
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStatus('Active')}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                  status === 'Active'
                    ? 'bg-green-500/20 border-green-500/40 text-green-400'
                    : 'bg-neutral-900 border-neutral-800 text-zinc-400'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus('Inactive')}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                  status === 'Inactive'
                    ? 'bg-zinc-800 border-zinc-700 text-white'
                    : 'bg-neutral-900 border-neutral-800 text-zinc-400'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-neutral-900 border border-neutral-800 text-zinc-300 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 bg-yellow-500 hover:bg-yellow-400 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/20 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Issue Card</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
