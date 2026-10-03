'use client';

import React, { useState } from 'react';
import { Gift, X } from 'lucide-react';
import { toast } from 'sonner';

export default function VIPBirthdayAlertBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleSendGift = () => {
    toast.success('Complimentary birthday dessert voucher sent to Sarah Johnson (Table 08).');
  };

  return (
    <div className="w-full px-4 py-2.5 bg-white/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-md flex items-center justify-between gap-3 font-['Inter'] transition-all">
      {/* Birthday Emoji & Message */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl flex-shrink-0" role="img" aria-label="Birthday cake">
          🎂
        </span>

        <p className="text-sm leading-4 truncate">
          <span className="text-slate-200 font-semibold font-['Inter']">Sarah Johnson</span>
          <span className="text-slate-500 font-normal font-['Inter']"> — </span>
          <span className="text-slate-400 font-normal font-['Inter']">
            Birthday today! Send a complimentary gift.
          </span>
        </p>
      </div>

      {/* VIP Badge & Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="px-2 py-0.5 bg-white/10 rounded-[5px] outline outline-[0.5px] outline-white/10 text-amber-500 text-xs font-semibold font-['Inter'] leading-4">
          VIP
        </span>

        <button
          type="button"
          onClick={handleSendGift}
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-md transition-colors cursor-pointer shadow-sm font-['Inter']"
        >
          <Gift className="w-3 h-3" />
          <span>Send Gift</span>
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 text-zinc-400 hover:text-white rounded-md cursor-pointer transition-colors"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
