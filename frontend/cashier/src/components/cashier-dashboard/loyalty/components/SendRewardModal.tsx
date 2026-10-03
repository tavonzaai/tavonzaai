'use client';

import React, { useState } from 'react';
import { Gift, X, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { LoyaltyMember } from '../types';

interface SendRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: LoyaltyMember[];
  selectedMember?: LoyaltyMember | null;
  onRewardSent?: (memberId: string, rewardTitle: string) => void;
}

const REWARDS = [
  {
    id: 'rew-1',
    title: '$10 Off Next Bill',
    desc: 'Instant discount voucher applied on next cashier checkout',
    badge: 'Popular',
  },
  {
    id: 'rew-2',
    title: 'Complimentary Beverage',
    desc: 'Free signature craft beer, iced matcha, or artisanal coffee',
    badge: 'Beverage',
  },
  {
    id: 'rew-3',
    title: 'Free Artisan Dessert',
    desc: 'Complimentary house tiramisu or molten chocolate cake',
    badge: 'Dessert',
  },
  {
    id: 'rew-4',
    title: '250 Bonus Loyalty Points',
    desc: 'Instantly credits 250 points towards next reward tier',
    badge: 'Points',
  },
  {
    id: 'rew-5',
    title: "VIP Chef's Tasting Pass",
    desc: 'Exclusive sample pairing during dinner shift for VIP members',
    badge: 'VIP Only',
  },
];

export const SendRewardModal: React.FC<SendRewardModalProps> = ({
  isOpen,
  onClose,
  members,
  selectedMember,
  onRewardSent,
}) => {
  const [memberId, setMemberId] = useState<string>(
    selectedMember?.id || members[0]?.id || ''
  );
  const [selectedRewardId, setSelectedRewardId] = useState<string>('rew-1');
  const [customNote, setCustomNote] = useState<string>(
    'Thank you for dining with Tavonza Downtown! Enjoy this gift on us.'
  );
  const [sendChannels, setSendChannels] = useState({
    sms: true,
    email: true,
    app: true,
  });

  // Keep memberId in sync if selectedMember changes
  const [prevSelected, setPrevSelected] = useState<string | null>(null);
  if (selectedMember && selectedMember.id !== prevSelected) {
    setPrevSelected(selectedMember.id);
    setMemberId(selectedMember.id);
  }

  if (!isOpen) return null;

  const currentMember =
    members.find((m) => m.id === memberId) || selectedMember || members[0];
  const currentReward =
    REWARDS.find((r) => r.id === selectedRewardId) || REWARDS[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember || !currentReward) return;

    toast.success(
      `Reward "${currentReward.title}" successfully dispatched to ${currentMember.name}!`
    );
    if (onRewardSent) {
      onRewardSent(currentMember.id, currentReward.title);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 font-['Inter']">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Inter']">
                Send Loyalty Reward
              </h3>
              <p className="text-sm text-slate-400 font-['Plus_Jakarta_Sans']">
                Surprise VIPs and loyal diners with instant perks
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          {/* Member Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">
              Select Member
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-amber-500/50 cursor-pointer"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id} className="bg-zinc-900 text-white">
                  {m.name} ({m.tier} · {m.points.toLocaleString()} pts) — {m.email}
                </option>
              ))}
            </select>
          </div>

          {/* Reward Options */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">
              Select Reward Perk
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {REWARDS.map((rew) => {
                const isChosen = selectedRewardId === rew.id;
                return (
                  <div
                    key={rew.id}
                    onClick={() => setSelectedRewardId(rew.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isChosen
                        ? 'bg-amber-400/10 border-amber-400/60 shadow-sm'
                        : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">
                          {rew.title}
                        </span>
                        <span className="px-1.5 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-semibold rounded">
                          {rew.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-3">
                        {rew.desc}
                      </p>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isChosen
                          ? 'border-amber-400 bg-amber-400 text-white'
                          : 'border-zinc-500'
                      }`}
                    >
                      {isChosen && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Note */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">
              Personalized Cashier Message
            </label>
            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              rows={2}
              className="w-full bg-black border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-amber-500/50 resize-none"
            />
          </div>

          {/* Delivery Channels */}
          <div className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-300 block">
              Delivery Channels
            </span>
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendChannels.sms}
                  onChange={(e) =>
                    setSendChannels((prev) => ({ ...prev, sms: e.target.checked }))
                  }
                  className="rounded border-zinc-700 bg-zinc-800 text-amber-400 focus:ring-0 cursor-pointer"
                />
                <span>SMS Notification</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendChannels.email}
                  onChange={(e) =>
                    setSendChannels((prev) => ({ ...prev, email: e.target.checked }))
                  }
                  className="rounded border-zinc-700 bg-zinc-800 text-amber-400 focus:ring-0 cursor-pointer"
                />
                <span>Email Voucher</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendChannels.app}
                  onChange={(e) =>
                    setSendChannels((prev) => ({ ...prev, app: e.target.checked }))
                  }
                  className="rounded border-zinc-700 bg-zinc-800 text-amber-400 focus:ring-0 cursor-pointer"
                />
                <span>Mobile App Inbox</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Confirm & Dispatch Reward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
