'use client';

import React, { useState } from 'react';
import { X, Award, Plus, Minus, QrCode } from 'lucide-react';
import { CardMember } from '../types';

interface CardMemberDetailsModalProps {
  member: CardMember | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePoints: (memberId: string, delta: number) => void;
}

export default function CardMemberDetailsModal({
  member,
  isOpen,
  onClose,
  onUpdatePoints,
}: CardMemberDetailsModalProps) {
  const [customPoints, setCustomPoints] = useState(100);

  if (!isOpen || !member) return null;

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'from-purple-900 via-indigo-900 to-black border-purple-500/40 text-purple-200';
      case 'Gold':
        return 'from-amber-900 via-yellow-900 to-black border-yellow-500/40 text-yellow-200';
      case 'Silver':
        return 'from-slate-800 via-zinc-800 to-black border-slate-400/40 text-slate-200';
      case 'Bronze':
        return 'from-orange-950 via-amber-950 to-black border-orange-600/40 text-orange-200';
      default:
        return 'from-zinc-900 to-black border-zinc-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#131417] border border-[#242630] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-1">
          <div>
            <h2 className="text-white text-lg sm:text-xl font-bold font-['Inter']">
              Tavonza VIP Card Details
            </h2>
            <span className="text-zinc-500 text-sm font-normal font-['Inter']">
              Member ID: {member.cardId}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Digital Loyalty Card Display */}
        <div
          className={`w-full h-52 rounded-2xl p-6 bg-gradient-to-tr ${getTierGradient(
            member.tier
          )} border shadow-2xl flex flex-col justify-between relative overflow-hidden`}
        >
          {/* Card subtle shine overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

          {/* Top Row: Brand & Tier */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-xl tracking-wider">TAVONZA</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 uppercase tracking-widest text-white/80 font-semibold">
                VIP
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/40 border border-white/10">
              <Award className="w-3.5 h-3.5" />
              <span>{member.tier}</span>
            </div>
          </div>

          {/* Center Points */}
          <div className="relative z-10 space-y-0.5">
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Reward Points Balance
            </div>
            <div className="text-4xl font-black text-white tracking-tight">
              {member.points.toLocaleString()}{' '}
              <span className="text-base font-normal text-white/70">PTS</span>
            </div>
          </div>

          {/* Bottom Row: Member Name & Card ID */}
          <div className="flex items-end justify-between relative z-10">
            <div>
              <div className="text-white text-base font-bold tracking-wide">{member.name}</div>
              <div className="text-white/60 text-sm font-mono">{member.email}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs text-white/60 uppercase">Card No.</div>
                <div className="text-white text-sm font-mono font-bold">{member.cardId}</div>
              </div>
              <div className="w-8 h-8 rounded bg-white p-0.5 flex items-center justify-center">
                <QrCode className="w-7 h-7 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Member Spending Stats */}
        <div className="grid grid-cols-3 gap-3 p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl text-center">
          <div>
            <span className="text-zinc-500 text-xs uppercase font-semibold block">
              Total Spend
            </span>
            <span className="text-white text-base font-bold">
              ${member.totalSpend.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 text-xs uppercase font-semibold block">
              Total Visits
            </span>
            <span className="text-white text-base font-bold">{member.visits} times</span>
          </div>
          <div>
            <span className="text-zinc-500 text-xs uppercase font-semibold block">
              Last Visit
            </span>
            <span className="text-amber-400 text-base font-bold">{member.lastVisit}</span>
          </div>
        </div>

        {/* Quick Points Adjuster */}
        <div className="space-y-2">
          <label className="text-zinc-400 text-sm font-bold uppercase tracking-wider block">
            Quick Points Management
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUpdatePoints(member.id, 500)}
              className="flex-1 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+500 pts</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdatePoints(member.id, 1000)}
              className="flex-1 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+1,000 pts</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdatePoints(member.id, -250)}
              className="flex-1 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>-250 pts</span>
            </button>
          </div>
        </div>

        {/* Close button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-yellow-500 hover:bg-yellow-400 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
