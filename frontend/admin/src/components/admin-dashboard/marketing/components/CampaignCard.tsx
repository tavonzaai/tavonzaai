'use client';

import React from 'react';
import { MessageSquare, Mail, Bell, BarChart2, Edit3, Trash2 } from 'lucide-react';
import { CampaignItem } from '../types';

interface CampaignCardProps {
  campaign: CampaignItem;
  onViewReport: (campaign: CampaignItem) => void;
  onEdit: (campaign: CampaignItem) => void;
  onDelete?: (campaign: CampaignItem) => void;
}

export default function CampaignCard({
  campaign,
  onViewReport,
  onEdit,
  onDelete,
}: CampaignCardProps) {
  const getChannelIcon = () => {
    switch (campaign.channel) {
      case 'SMS':
        return MessageSquare;
      case 'Email':
        return Mail;
      case 'Push':
        return Bell;
      default:
        return MessageSquare;
    }
  };

  const Icon = getChannelIcon();

  const getStatusBadge = () => {
    switch (campaign.status) {
      case 'Active':
        return (
          <div className="px-3 py-1 bg-[#10241b] border border-[#1b4330] rounded-lg inline-flex items-center">
            <span className="text-[#22c55e] text-sm font-semibold font-['Inter'] leading-4">
              Active
            </span>
          </div>
        );
      case 'Draft':
        return (
          <div className="px-3 py-1 bg-zinc-800/80 border border-zinc-700/80 rounded-lg inline-flex items-center">
            <span className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-4">
              Draft
            </span>
          </div>
        );
      case 'Scheduled':
        return (
          <div className="px-3 py-1 bg-blue-950/60 border border-blue-800/60 rounded-lg inline-flex items-center">
            <span className="text-blue-400 text-sm font-semibold font-['Inter'] leading-4">
              Scheduled
            </span>
          </div>
        );
      case 'Completed':
        return (
          <div className="px-3 py-1 bg-purple-950/60 border border-purple-800/60 rounded-lg inline-flex items-center">
            <span className="text-purple-400 text-sm font-semibold font-['Inter'] leading-4">
              Completed
            </span>
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-[#131417] hover:bg-[#16171b] rounded-2xl border border-[#22242a] hover:border-amber-500/30 p-5 flex flex-col justify-between gap-4 transition-all duration-200 shadow-xl group">
      {/* Top Header: Icon + Title/Subtitle + Status Badge */}
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#1d1f27] border border-[#292c38] flex items-center justify-center flex-shrink-0 text-white shadow-inner group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5 text-white stroke-[2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-white text-lg font-semibold font-['Inter'] leading-5 truncate" title={campaign.name}>
              {campaign.name}
            </h3>
            <span className="text-[#6b7280] text-sm font-normal font-['Inter'] leading-4 mt-1 truncate">
              {campaign.channel} · {campaign.date}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0">{getStatusBadge()}</div>
      </div>

      {/* 3 Metric Cards Row (Sent, Open Rate, Revenue) */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {/* Sent */}
        <div className="py-3 px-2 bg-[#191a1e] border border-[#262830] rounded-xl flex flex-col items-center justify-center text-center transition-colors">
          <span className="text-white text-lg font-bold font-['Inter'] leading-5 tracking-tight">
            {campaign.sentCount.toLocaleString()}
          </span>
          <span className="text-[#6b7280] text-sm font-normal font-['Inter'] leading-4 mt-1">
            Sent
          </span>
        </div>

        {/* Open Rate */}
        <div className="py-3 px-2 bg-[#191a1e] border border-[#262830] rounded-xl flex flex-col items-center justify-center text-center transition-colors">
          <span className="text-white text-lg font-bold font-['Inter'] leading-5 tracking-tight">
            {campaign.openRate}%
          </span>
          <span className="text-[#6b7280] text-sm font-normal font-['Inter'] leading-4 mt-1">
            Open Rate
          </span>
        </div>

        {/* Revenue */}
        <div className="py-3 px-2 bg-[#191a1e] border border-[#262830] rounded-xl flex flex-col items-center justify-center text-center transition-colors">
          <span className="text-white text-lg font-bold font-['Inter'] leading-5 tracking-tight">
            ${campaign.revenue.toLocaleString()}
          </span>
          <span className="text-[#6b7280] text-sm font-normal font-['Inter'] leading-4 mt-1">
            Revenue
          </span>
        </div>
      </div>

      {/* Bottom Action Buttons: View Report, Edit, and Delete (Trash Icon) */}
      <div className="flex items-center gap-2 w-full pt-0.5">
        {/* View Report Button */}
        <button
          type="button"
          onClick={() => onViewReport(campaign)}
          className="flex-1 py-2.5 px-3 bg-[#191a1e] border border-[#282a32] text-[#788090] hover:bg-yellow-500 hover:text-white hover:border-yellow-500 rounded-xl text-sm font-medium font-['Inter'] leading-5 flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer group/report active:scale-95 shadow-sm hover:shadow-yellow-500/20"
        >
          <BarChart2 className="w-4 h-4 text-[#636b7b] group-hover/report:text-white transition-colors flex-shrink-0" />
          <span className="group-hover/report:font-semibold truncate">View Report</span>
        </button>

        {/* Edit Button */}
        <button
          type="button"
          onClick={() => onEdit(campaign)}
          className="flex-1 py-2.5 px-3 bg-[#191a1e] border border-[#282a32] text-white hover:bg-yellow-500 hover:text-white hover:border-yellow-500 rounded-xl text-sm font-medium font-['Inter'] leading-5 flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer group/edit active:scale-95 shadow-sm hover:shadow-yellow-500/20"
        >
          <Edit3 className="w-4 h-4 text-white group-hover/edit:text-white transition-colors flex-shrink-0" />
          <span className="group-hover/edit:font-semibold truncate">Edit</span>
        </button>

        {/* Delete (Trash) Button */}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(campaign)}
            title="Delete Campaign"
            className="w-10 h-10 flex-shrink-0 bg-[#191a1e] border border-[#282a32] text-[#788090] hover:bg-rose-500 hover:text-white hover:border-rose-500 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer group/del active:scale-95 shadow-sm hover:shadow-rose-500/20"
          >
            <Trash2 className="w-4 h-4 text-[#636b7b] group-hover/del:text-white transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}
