'use client';

import React from 'react';
import { X, BarChart3, TrendingUp, Users, DollarSign, Send, Eye, MousePointer, CheckCircle, Clock } from 'lucide-react';
import { CampaignItem } from '../types';

interface CampaignReportModalProps {
  campaign: CampaignItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CampaignReportModal({
  campaign,
  isOpen,
  onClose,
}: CampaignReportModalProps) {
  if (!isOpen || !campaign) return null;

  const deliveryRate = campaign.deliveryRate ?? 98.6;
  const clickRate = campaign.clickRate ?? 38.4;
  const conversions = campaign.conversionsCount ?? Math.round(campaign.sentCount * 0.18);
  const estimatedROI = campaign.revenue > 0 ? ((campaign.revenue / 32.5) * 10).toFixed(1) : '14.2';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-[30px] overflow-hidden z-10 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold flex items-center gap-2">
                {campaign.name}
                <span className="text-sm px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {campaign.status}
                </span>
              </h2>
              <p className="text-sm text-zinc-500">
                {campaign.channel} Campaign · Launched on {campaign.date} · Target: {campaign.targetAudience}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-white/10 hover:border-amber-500/40 bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Top 4 Performance Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-zinc-400 text-sm mb-1">
                <span>Delivered</span>
                <Send className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-white text-xl font-bold">
                {campaign.sentCount.toLocaleString()}
              </div>
              <span className="text-xs text-emerald-400">{deliveryRate}% success</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-zinc-400 text-sm mb-1">
                <span>Open Rate</span>
                <Eye className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-white text-xl font-bold">
                {campaign.openRate}%
              </div>
              <span className="text-xs text-emerald-400">+12% vs benchmark</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-zinc-400 text-sm mb-1">
                <span>Click Rate</span>
                <MousePointer className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-white text-xl font-bold">
                {clickRate}%
              </div>
              <span className="text-xs text-purple-400">{conversions} orders placed</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-zinc-400 text-sm mb-1">
                <span>Revenue</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-white text-xl font-bold">
                ${campaign.revenue.toLocaleString()}
              </div>
              <span className="text-xs text-emerald-400">{estimatedROI}x ROI</span>
            </div>
          </div>

          {/* Conversion Funnel Breakdown */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Conversion Funnel Analysis
            </h4>
            <div className="space-y-2.5">
              {/* Funnel 1 */}
              <div>
                <div className="flex justify-between text-sm text-zinc-400 mb-1">
                  <span>Messages Dispatched</span>
                  <span className="text-white font-medium">{campaign.sentCount} recipients (100%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-full" />
                </div>
              </div>

              {/* Funnel 2 */}
              <div>
                <div className="flex justify-between text-sm text-zinc-400 mb-1">
                  <span>Opened & Read</span>
                  <span className="text-white font-medium">
                    {Math.round((campaign.sentCount * campaign.openRate) / 100)} recipients ({campaign.openRate}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${campaign.openRate}%` }}
                  />
                </div>
              </div>

              {/* Funnel 3 */}
              <div>
                <div className="flex justify-between text-sm text-zinc-400 mb-1">
                  <span>Clicked CTA / Viewed Menu</span>
                  <span className="text-white font-medium">
                    {Math.round((campaign.sentCount * clickRate) / 100)} clicks ({clickRate}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${clickRate}%` }}
                  />
                </div>
              </div>

              {/* Funnel 4 */}
              <div>
                <div className="flex justify-between text-sm text-zinc-400 mb-1">
                  <span>Orders & Revenue Generated</span>
                  <span className="text-emerald-400 font-medium">
                    {conversions} orders (${campaign.revenue.toLocaleString()})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((conversions / campaign.sentCount) * 100 * 3))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Message Content Box */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-sm text-zinc-400">
              <span className="font-semibold text-zinc-300">Message Content</span>
              <span>{campaign.messageContent.length} chars</span>
            </div>
            <p className="text-sm text-zinc-200 bg-black/40 p-3 rounded-lg border border-white/5 font-mono leading-relaxed">
              {campaign.messageContent}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 flex justify-end bg-black/30">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
