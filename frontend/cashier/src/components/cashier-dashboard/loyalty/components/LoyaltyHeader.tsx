'use client';

import React from 'react';
import { Download, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { LoyaltyMember } from '../types';

interface LoyaltyHeaderProps {
  members: LoyaltyMember[];
  onOpenSendReward: () => void;
}

export const LoyaltyHeader: React.FC<LoyaltyHeaderProps> = ({
  members,
  onOpenSendReward,
}) => {
  const handleExportCSV = () => {
    const headers = [
      'Member ID',
      'Name',
      'Email',
      'Tier',
      'Points',
      'Lifetime Value',
      'Avg Order',
      'Visits',
      'Birthday',
    ];

    const rows = members.map((m) => [
      m.id,
      `"${m.name}"`,
      m.email,
      m.tier,
      m.points,
      `$${m.lifetimeValue.toFixed(2)}`,
      `$${m.avgOrder.toFixed(2)}`,
      m.visits,
      `"${m.birthday}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `loyalty_members_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Exported loyalty roster to CSV successfully!');
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9">
          Loyalty Program
        </h1>
        <p className="text-slate-500 text-lg font-normal font-['Inter'] leading-6 mt-0.5">
          Manage VIP customers, birthdays, and personalized experiences
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Export Button */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold font-['Inter'] rounded-[10px] border border-gray-200/20 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-white" />
          <span>Export</span>
        </button>

        {/* Send Reward Button */}
        <button
          type="button"
          onClick={onOpenSendReward}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-white text-sm font-semibold font-['Inter'] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(255,214,168,1.00)] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Gift className="w-4 h-4 text-white" />
          <span>Send Reward</span>
        </button>
      </div>
    </div>
  );
};
