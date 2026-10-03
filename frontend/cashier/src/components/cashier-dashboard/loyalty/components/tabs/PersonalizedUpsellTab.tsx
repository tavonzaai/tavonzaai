'use client';

import React, { useState } from 'react';
import { Crown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { LoyaltyMember } from '../../types';

interface PersonalizedUpsellTabProps {
  membersWithUpsells: LoyaltyMember[];
  onApplyUpsellToOrder?: (member: LoyaltyMember, itemName: string) => void;
}

export const PersonalizedUpsellTab: React.FC<PersonalizedUpsellTabProps> = ({
  membersWithUpsells,
  onApplyUpsellToOrder,
}) => {
  const [appliedItems, setAppliedItems] = useState<Record<string, boolean>>({});

  const handleApply = (member: LoyaltyMember, itemId: string, itemName: string) => {
    const key = `${member.id}-${itemId}`;
    const alreadyApplied = appliedItems[key];

    if (!alreadyApplied) {
      setAppliedItems((prev) => ({ ...prev, [key]: true }));
      toast.success(
        `Applied recommended upsell "${itemName}" for ${member.name}! Added to active ticket.`
      );
      if (onApplyUpsellToOrder) {
        onApplyUpsellToOrder(member, itemName);
      }
    } else {
      setAppliedItems((prev) => ({ ...prev, [key]: false }));
      toast.info(`Removed "${itemName}" from recommendations for ${member.name}.`);
    }
  };

  return (
    <div className="space-y-4">
      {membersWithUpsells.map((member) => (
        <div
          key={member.id}
          className="p-4 bg-white/10 hover:bg-white/[0.12] rounded-xl border border-white/10 backdrop-blur-md space-y-3.5 transition-all shadow-lg"
        >
          {/* Customer Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-base font-bold font-['Plus_Jakarta_Sans'] shrink-0">
                {member.initials}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-200 text-sm font-bold font-['Plus_Jakarta_Sans']">
                  {member.name}
                </span>
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full inline-flex items-center gap-1 text-xs font-semibold font-['Plus_Jakarta_Sans']">
                  <Crown className="w-3 h-3" />
                  <span>{member.tier}</span>
                </span>
              </div>
            </div>

            <div className="text-slate-400 text-xs font-normal font-['Plus_Jakarta_Sans']">
              Avg ${member.avgOrder.toFixed(2)} / visit · {member.visits} visits
            </div>
          </div>

          {/* Upsell Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {member.upsellSuggestions?.map((item) => {
              const key = `${member.id}-${item.id}`;
              const isApplied = appliedItems[key];

              return (
                <div
                  key={item.id}
                  className="p-3 bg-white/5 hover:bg-white/[0.08] rounded-lg border border-white/10 backdrop-blur-sm flex items-center justify-between gap-3 transition-colors"
                >
                  <span className="text-2xl select-none leading-none shrink-0">
                    {item.emoji}
                  </span>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 text-sm font-semibold font-['Plus_Jakarta_Sans'] truncate">
                        {item.name}
                      </span>
                      <span className="text-amber-400 text-xs font-semibold font-['JetBrains_Mono']">
                        {item.probability}%
                      </span>
                    </div>

                    <div className="text-slate-400 text-xs font-normal font-['Plus_Jakarta_Sans'] truncate">
                      {item.reason}
                    </div>

                    <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.probability}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApply(member, item.id, item.name)}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-medium font-['Plus_Jakarta_Sans'] transition-all cursor-pointer shadow-sm shrink-0 ${
                      isApplied
                        ? 'bg-emerald-500 text-white font-semibold'
                        : 'bg-yellow-500 hover:bg-yellow-400 text-white font-semibold'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>{isApplied ? 'Applied' : 'Apply'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
