'use client';

import React, { useState } from 'react';
import { Check, Gift } from 'lucide-react';
import { toast } from 'sonner';

interface LoyaltyBirthdayBannerProps {
  customerName?: string;
  tier?: string;
  lifetimeValue?: number;
  initialSent?: boolean;
  onSendGift?: () => void;
}

export const LoyaltyBirthdayBanner: React.FC<LoyaltyBirthdayBannerProps> = ({
  customerName = 'Sarah Johnson',
  tier = 'VIP',
  lifetimeValue = 1840,
  initialSent = true,
  onSendGift,
}) => {
  const [isSent, setIsSent] = useState(initialSent);

  const handleToggle = () => {
    if (!isSent) {
      setIsSent(true);
      toast.success(
        `Sent birthday gift (Free dessert + 20% off) to ${customerName}!`
      );
      if (onSendGift) onSendGift();
    } else {
      toast.info(
        `Birthday perk has already been dispatched to ${customerName}.`
      );
    }
  };

  return (
    <div className="w-full px-4 py-3 bg-white/10 hover:bg-white/[0.12] rounded-xl border border-white/10 backdrop-blur-md flex items-center justify-between gap-3 transition-all shadow-lg">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-3xl leading-none select-none">🎂</span>
        <div className="flex flex-col min-w-0">
          <div className="text-base font-semibold font-['Inter'] leading-5 text-white truncate">
            <span>Today is </span>
            <span className="text-amber-400 font-bold">{customerName}&apos;s </span>
            <span>Birthday!</span>
          </div>
          <div className="text-sm text-gray-300 font-['Plus_Jakarta_Sans'] leading-4 truncate">
            {tier} customer · ${lifetimeValue.toLocaleString()} lifetime value ·
            Send a complimentary gift now
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium font-['Plus_Jakarta_Sans'] transition-all cursor-pointer shadow-sm shrink-0 ${
          isSent
            ? 'bg-yellow-500 hover:bg-yellow-400 text-white font-semibold'
            : 'bg-amber-400 hover:bg-amber-300 text-white font-semibold animate-pulse'
        }`}
      >
        {isSent ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Sent!</span>
          </>
        ) : (
          <>
            <Gift className="w-3.5 h-3.5" />
            <span>Send Gift</span>
          </>
        )}
      </button>
    </div>
  );
};
