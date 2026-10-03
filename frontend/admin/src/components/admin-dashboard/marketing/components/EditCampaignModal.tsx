'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit3, MessageSquare, Mail, Send, Check } from 'lucide-react';
import { CampaignItem, CampaignStatus } from '../types';
import { AUDIENCE_OPTIONS } from '../marketingData';

interface EditCampaignModalProps {
  campaign: CampaignItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCampaign: CampaignItem) => void;
}

export default function EditCampaignModal({
  campaign,
  isOpen,
  onClose,
  onSave,
}: EditCampaignModalProps) {
  const [name, setName] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Customers');
  const [messageContent, setMessageContent] = useState('');
  const [status, setStatus] = useState<CampaignStatus>('Active');

  useEffect(() => {
    if (campaign && isOpen) {
      setName(campaign.name);
      setTargetAudience(campaign.targetAudience);
      setMessageContent(campaign.messageContent);
      setStatus(campaign.status);
    }
  }, [campaign, isOpen]);

  if (!isOpen || !campaign) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !messageContent.trim()) return;

    onSave({
      ...campaign,
      name: name.trim(),
      targetAudience,
      messageContent: messageContent.trim(),
      status,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-[30px] overflow-hidden z-10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold">Edit Campaign</h2>
              <p className="text-sm text-zinc-500">{campaign.channel} Campaign · {campaign.date}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-white/10 hover:border-yellow-500/50 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Campaign Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-400">Campaign Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-base focus:outline-none focus:border-amber-500 transition-colors"
              required
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-400">Target Audience</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-base focus:outline-none focus:border-amber-500 transition-colors"
            >
              {AUDIENCE_OPTIONS.map((aud) => (
                <option key={aud.id} value={aud.name}>
                  {aud.name} (~{aud.count} recipients)
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-400">Status</label>
            <div className="grid grid-cols-4 gap-2">
              {(['Active', 'Draft', 'Scheduled', 'Completed'] as CampaignStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-1.5 px-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                    status === st
                      ? 'bg-amber-500 text-white border-amber-500 font-semibold'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-zinc-400">Message Content</label>
              <span className="text-xs text-zinc-500">{messageContent.length} / 160 chars</span>
            </div>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white text-base focus:outline-none focus:border-amber-500 transition-colors resize-none"
              required
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer shadow-lg shadow-yellow-500/20"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
