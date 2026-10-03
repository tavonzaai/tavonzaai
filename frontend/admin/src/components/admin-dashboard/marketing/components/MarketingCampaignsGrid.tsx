'use client';

import React from 'react';
import CampaignCard from './CampaignCard';
import { CampaignItem } from '../types';
import { Plus, Megaphone } from 'lucide-react';

interface MarketingCampaignsGridProps {
  campaigns: CampaignItem[];
  onViewReport: (campaign: CampaignItem) => void;
  onEdit: (campaign: CampaignItem) => void;
  onDelete?: (campaign: CampaignItem) => void;
  onNewCampaign: () => void;
}

export default function MarketingCampaignsGrid({
  campaigns,
  onViewReport,
  onEdit,
  onDelete,
  onNewCampaign,
}: MarketingCampaignsGridProps) {
  if (campaigns.length === 0) {
    return (
      <div className="w-full py-16 px-6 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Megaphone className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-white text-lg font-semibold">No campaigns found</h3>
          <p className="text-zinc-500 text-sm max-w-sm">
            No marketing campaigns match your search or filter criteria. Try adjusting your filters or create a new campaign.
          </p>
        </div>
        <button
          onClick={onNewCampaign}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Campaign</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onViewReport={onViewReport}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
