'use client';

import React from 'react';
import { Crown, Gift, Award, Shield } from 'lucide-react';
import {
  LoyaltyMember,
  TierDistributionItem,
  LTVLeaderboardItem,
  LoyaltyTier,
} from '../../types';

interface OverviewTabProps {
  members: LoyaltyMember[];
  tierDistribution: TierDistributionItem[];
  leaderboard: LTVLeaderboardItem[];
  onSelectMemberForReward: (member: LoyaltyMember) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  members,
  tierDistribution,
  leaderboard,
  onSelectMemberForReward,
}) => {
  const renderTierBadge = (tier: LoyaltyTier) => {
    switch (tier) {
      case 'VIP':
        return (
          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-[5px] inline-flex items-center gap-1 text-xs font-semibold font-['Plus_Jakarta_Sans']">
            <Crown className="w-3 h-3" />
            <span>VIP</span>
          </span>
        );
      case 'Gold':
        return (
          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-[5px] inline-flex items-center gap-1 text-xs font-semibold font-['Plus_Jakarta_Sans']">
            <Award className="w-3 h-3" />
            <span>Gold</span>
          </span>
        );
      case 'Silver':
        return (
          <span className="px-2 py-0.5 bg-slate-400/10 border border-slate-400/20 text-slate-400 rounded-[5px] inline-flex items-center gap-1 text-xs font-semibold font-['Plus_Jakarta_Sans']">
            <Shield className="w-3 h-3" />
            <span>Silver</span>
          </span>
        );
      case 'Bronze':
        return (
          <span className="px-2 py-0.5 bg-orange-400/10 border border-orange-400/20 text-orange-400 rounded-[5px] inline-flex items-center gap-1 text-xs font-semibold font-['Plus_Jakarta_Sans']">
            <Shield className="w-3 h-3" />
            <span>Bronze</span>
          </span>
        );
    }
  };

  const renderTierIcon = (tier: LoyaltyTier) => {
    switch (tier) {
      case 'VIP':
        return <Crown className="w-3 h-3 text-amber-500" />;
      case 'Gold':
        return <Award className="w-3 h-3 text-amber-500" />;
      case 'Silver':
        return <Shield className="w-3 h-3 text-slate-400" />;
      case 'Bronze':
        return <Shield className="w-3 h-3 text-orange-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. All Loyalty Members Section */}
      <div className="space-y-3">
        <h2 className="text-white text-2xl font-semibold font-['Inter'] leading-9">
          All Loyalty Members
        </h2>

        <div className="w-full bg-white/5 rounded-[10px] border border-white/10 backdrop-blur-lg overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-white text-base font-semibold font-['Inter']">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Lifetime Value</th>
                  <th className="py-3 px-4">Avg Order</th>
                  <th className="py-3 px-4">Visits</th>
                  <th className="py-3 px-4">Birthday</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {members.map((member) => {
                  const pointsPercent = Math.min(
                    100,
                    Math.round((member.points / member.nextTierPoints) * 100)
                  );
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-white/[0.04] transition-colors"
                    >
                      {/* Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-white/10 text-white text-sm font-bold flex items-center justify-center font-['Plus_Jakarta_Sans']">
                            {member.initials}
                          </div>
                          <div>
                            <div className="text-white text-sm font-semibold font-['Inter'] leading-5">
                              {member.name}
                            </div>
                            <div className="text-slate-400 text-xs font-normal font-['Inter']">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="py-3.5 px-4">{renderTierBadge(member.tier)}</td>

                      {/* Points */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-slate-900 rounded-full overflow-hidden shrink-0">
                            <div
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${pointsPercent}%` }}
                            />
                          </div>
                          <span className="text-white text-sm font-normal font-['JetBrains_Mono'] leading-4">
                            {member.points.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Lifetime Value */}
                      <td className="py-3.5 px-4 text-white text-sm font-semibold font-['JetBrains_Mono'] leading-4">
                        ${member.lifetimeValue.toLocaleString()}
                      </td>

                      {/* Avg Order */}
                      <td className="py-3.5 px-4 text-white text-sm font-semibold font-['JetBrains_Mono'] leading-4">
                        ${member.avgOrder.toFixed(2)}
                      </td>

                      {/* Visits */}
                      <td className="py-3.5 px-4 text-slate-200 text-sm font-medium font-['JetBrains_Mono'] leading-4">
                        {member.visits}
                      </td>

                      {/* Birthday */}
                      <td className="py-3.5 px-4">
                        {member.isBirthdayToday ? (
                          <span className="text-pink-500 text-sm font-medium font-['Plus_Jakarta_Sans'] leading-4 flex items-center gap-1 animate-pulse">
                            🎂 Today!
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm font-normal font-['Plus_Jakarta_Sans'] leading-4">
                            {member.birthday}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectMemberForReward(member)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-400 hover:text-white text-slate-300 transition-colors cursor-pointer border border-white/10"
                          title={`Send reward to ${member.name}`}
                        >
                          <Gift className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Tier Distribution & LTV Leaderboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tier Distribution Card */}
        <div className="p-4 bg-white/10 rounded-xl border border-white/10 flex flex-col justify-between">
          <div className="border-b border-white/10 pb-2">
            <h3 className="text-slate-200 text-base font-semibold font-['Plus_Jakarta_Sans'] leading-5">
              Tier Distribution
            </h3>
          </div>

          <div className="space-y-3.5 pt-3">
            {tierDistribution.map((item) => (
              <div key={item.tier} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {renderTierIcon(item.tier)}
                    <span
                      className={`text-sm font-semibold font-['Plus_Jakarta_Sans'] ${item.color}`}
                    >
                      {item.tier}
                    </span>
                  </div>
                  <span className="text-white text-sm font-normal font-['Plus_Jakarta_Sans']">
                    {item.membersCount} members · {item.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-700/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LTV Leaderboard Card */}
        <div className="p-4 bg-white/10 rounded-xl border border-white/10 flex flex-col justify-between">
          <div className="border-b border-white/10 pb-2">
            <h3 className="text-slate-200 text-base font-semibold font-['Plus_Jakarta_Sans'] leading-5">
              LTV Leaderboard
            </h3>
            <p className="text-slate-500 text-sm font-normal font-['Plus_Jakarta_Sans'] leading-4">
              Top customers by lifetime value
            </p>
          </div>

          <div className="space-y-2.5 pt-3">
            {leaderboard.map((item) => {
              const maxLTV = 3500;
              const barPercent = Math.min(100, Math.round((item.ltv / maxLTV) * 100));
              return (
                <div key={item.rank} className="flex items-center gap-3">
                  <span
                    className={`w-4 text-sm font-bold font-['Plus_Jakarta_Sans'] ${item.color}`}
                  >
                    #{item.rank}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold font-['Plus_Jakarta_Sans'] shrink-0 border border-amber-500/20">
                    {item.initials}
                  </div>
                  <span className="text-slate-200 text-sm font-normal font-['Plus_Jakarta_Sans'] w-28 truncate">
                    {item.name}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                  <span className="text-right text-white text-sm font-semibold font-['JetBrains_Mono'] leading-4 w-16">
                    ${item.ltv.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
