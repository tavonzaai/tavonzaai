'use client';

import React from 'react';
import { Crown, Gift, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { LoyaltyMember } from '../../types';

interface VIPCustomersTabProps {
  vipMembers: LoyaltyMember[];
  nearVipMembers: LoyaltyMember[];
  onOpenSendRewardForMember: (member: LoyaltyMember) => void;
  onViewProfile?: (member: LoyaltyMember) => void;
}

export const VIPCustomersTab: React.FC<VIPCustomersTabProps> = ({
  vipMembers,
  nearVipMembers,
  onOpenSendRewardForMember,
  onViewProfile,
}) => {
  const handleNudge = (member: LoyaltyMember) => {
    toast.success(
      `Sent VIP upgrade nudge & 150 bonus point booster to ${member.name}!`
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. VIP Customer Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {vipMembers.map((member) => {
          const pointsPercent = Math.min(
            100,
            Math.round((member.points / member.nextTierPoints) * 100)
          );

          return (
            <div
              key={member.id}
              className="p-4 bg-white/10 hover:bg-white/[0.12] rounded-xl border border-white/10 backdrop-blur-md transition-all flex flex-col justify-between space-y-4 shadow-lg"
            >
              {/* Top Row: Avatar + Name + Tier + Tags */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 bg-gradient-to-br from-amber-500/25 to-red-500/20 rounded-2xl border-2 border-amber-500/30 flex items-center justify-center text-amber-500 text-lg font-bold font-['Plus_Jakarta_Sans'] shrink-0 shadow-inner">
                  {member.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-200 text-base font-bold font-['Plus_Jakarta_Sans'] leading-5 truncate">
                      {member.name}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full inline-flex items-center gap-1 text-xs font-semibold font-['Plus_Jakarta_Sans']">
                      <Crown className="w-3 h-3" />
                      <span>VIP</span>
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs font-normal font-['Plus_Jakarta_Sans'] leading-4 mt-0.5 truncate">
                    {member.email} · Joined {member.joinDate}
                  </p>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {member.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-normal font-['Plus_Jakarta_Sans'] rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3 Metric Boxes */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-center">
                  <div className="text-blue-500 text-base font-bold font-['JetBrains_Mono'] leading-5">
                    ${member.lifetimeValue.toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-xs font-normal font-['Plus_Jakarta_Sans'] leading-4">
                    Lifetime Value
                  </div>
                </div>

                <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-center">
                  <div className="text-teal-500 text-base font-bold font-['JetBrains_Mono'] leading-5">
                    ${member.avgOrder.toFixed(2)}
                  </div>
                  <div className="text-slate-400 text-xs font-normal font-['Plus_Jakarta_Sans'] leading-4">
                    Avg Order
                  </div>
                </div>

                <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-center">
                  <div className="text-violet-400 text-base font-bold font-['JetBrains_Mono'] leading-5">
                    {member.visits}
                  </div>
                  <div className="text-slate-400 text-xs font-normal font-['Plus_Jakarta_Sans'] leading-4">
                    Visits
                  </div>
                </div>
              </div>

              {/* Points Progress Section */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-normal font-['JetBrains_Mono'] text-zinc-200">
                  <span>{member.points.toLocaleString()} pts</span>
                  <span>{member.nextTierPoints.toLocaleString()} pts</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${pointsPercent}%` }}
                  />
                </div>
                <div className="text-white text-xs font-normal font-['Plus_Jakarta_Sans'] leading-4">
                  {pointsPercent}% to next reward
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenSendRewardForMember(member)}
                  className="px-3 py-2 rounded-lg border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium font-['Plus_Jakarta_Sans'] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5 text-slate-300" />
                  <span>Send Reward</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onViewProfile) {
                      onViewProfile(member);
                    } else {
                      toast.info(`Viewing profile for ${member.name}`);
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-medium font-['Plus_Jakarta_Sans'] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md font-semibold"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>View Profile</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Close to VIP Upgrade Section */}
      <div className="p-4 bg-white/10 rounded-xl border border-white/10 space-y-3.5 shadow-md">
        <div className="border-b border-white/10 pb-2">
          <h3 className="text-slate-200 text-base font-semibold font-['Plus_Jakarta_Sans'] leading-5">
            Close to VIP Upgrade
          </h3>
          <p className="text-slate-500 text-sm font-normal font-['Plus_Jakarta_Sans'] leading-4">
            Customers who need a little push
          </p>
        </div>

        <div className="space-y-2.5">
          {nearVipMembers.map((member) => {
            const needed = member.nextTierPoints - member.points;
            return (
              <div
                key={member.id}
                className="p-3 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between gap-3 hover:bg-white/[0.13] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-bold font-['Plus_Jakarta_Sans'] flex items-center justify-center shrink-0">
                    {member.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-slate-200 text-sm font-semibold font-['Plus_Jakarta_Sans'] leading-4 truncate">
                      {member.name}
                    </div>
                    <div className="text-slate-400 text-xs font-normal font-['Plus_Jakarta_Sans'] leading-4 truncate">
                      {member.points.toLocaleString()} pts · needs ~
                      {needed.toLocaleString()} more pts for VIP
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleNudge(member)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-400/50 bg-white/5 hover:bg-amber-400 hover:text-white text-slate-200 text-sm font-medium font-['Plus_Jakarta_Sans'] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Nudge</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
