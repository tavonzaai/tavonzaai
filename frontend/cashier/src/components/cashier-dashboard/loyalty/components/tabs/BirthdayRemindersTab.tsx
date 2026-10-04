'use client';

import React, { useState } from 'react';
import { Crown, Mail, MessageSquare, Check, Send } from 'lucide-react';
import { toast } from 'sonner';
import { LoyaltyMember } from '../../types';

interface BirthdayRemindersTabProps {
  birthdayMembers: LoyaltyMember[];
}

export const BirthdayRemindersTab: React.FC<BirthdayRemindersTabProps> = ({
  birthdayMembers,
}) => {
  const [sentStatus, setSentStatus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    birthdayMembers.forEach((m) => {
      initial[m.id] = !!m.birthdayOfferSent;
    });
    return initial;
  });

  const handleSendEmail = (member: LoyaltyMember) => {
    toast.success(`Birthday greeting & voucher emailed to ${member.email}!`);
    setSentStatus((prev) => ({ ...prev, [member.id]: true }));
  };

  const handleSendSMS = (member: LoyaltyMember) => {
    toast.success(`Birthday SMS perk delivered to ${member.name}!`);
    setSentStatus((prev) => ({ ...prev, [member.id]: true }));
  };

  const handleToggleSent = (member: LoyaltyMember) => {
    const current = sentStatus[member.id];
    setSentStatus((prev) => ({ ...prev, [member.id]: !current }));
    if (!current) {
      toast.success(`Marked birthday offer for ${member.name} as dispatched.`);
    } else {
      toast.info(`Offer status reset for ${member.name}.`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {birthdayMembers.map((member) => {
          const isSent = sentStatus[member.id];
          const offer =
            member.suggestedBirthdayOffer ||
            '🎂 Free dessert + 20% off entire bill';

          return (
            <div
              key={member.id}
              className="p-4 bg-white/10 hover:bg-white/[0.12] rounded-xl border border-white/10 backdrop-blur-md flex flex-col justify-between space-y-3.5 shadow-lg transition-all"
            >
              {/* Header with Emoji & Info */}
              <div className="flex items-start gap-3">
                <span className="text-4xl select-none leading-none">🎂</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-200 text-base font-bold font-['Plus_Jakarta_Sans'] leading-5 truncate">
                      {member.name}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full inline-flex items-center gap-1 text-xs font-semibold font-['Plus_Jakarta_Sans']">
                      <Crown className="w-3 h-3" />
                      <span>{member.tier}</span>
                    </span>
                  </div>

                  <div className="text-slate-400 text-sm font-normal font-['Plus_Jakarta_Sans'] leading-4 mt-0.5 truncate">
                    {member.email}
                  </div>

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-pink-500 text-sm font-medium font-['Plus_Jakarta_Sans'] leading-4">
                      {member.isBirthdayToday ? '🎉 Today!' : `🎂 ${member.birthday}`}
                    </span>
                    <span className="text-white text-xs font-normal font-['Plus_Jakarta_Sans'] leading-4">
                      · LTV ${member.lifetimeValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Suggested Birthday Offer Box */}
              <div className="p-2.5 bg-white/5 rounded-lg border border-white/5 space-y-1">
                <div className="text-slate-400 text-sm font-medium font-['Plus_Jakarta_Sans'] leading-4">
                  Suggested Birthday Offer
                </div>
                <div className="text-slate-200 text-sm font-normal font-['Plus_Jakarta_Sans'] leading-4">
                  {offer}
                </div>
              </div>

              {/* Actions Row */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSendEmail(member)}
                  className="h-9 px-2 py-1 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium font-['Plus_Jakarta_Sans'] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-300" />
                  <span>Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendSMS(member)}
                  className="h-9 px-2 py-1 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium font-['Plus_Jakarta_Sans'] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-300" />
                  <span>SMS</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleSent(member)}
                  className={`h-9 px-2 py-1 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium font-['Plus_Jakarta_Sans'] transition-all cursor-pointer font-semibold shadow-sm ${
                    isSent
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-white'
                      : 'bg-amber-400 hover:bg-amber-300 text-white'
                  }`}
                >
                  {isSent ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Sent</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
