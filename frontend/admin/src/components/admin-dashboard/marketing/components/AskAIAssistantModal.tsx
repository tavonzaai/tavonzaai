'use client';

import React, { useState } from 'react';
import { X, Sparkles, Bot, ArrowRight, Wand2, Check, RefreshCw, Send } from 'lucide-react';
import { CreateCampaignFormData } from '../types';

interface AskAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseCampaignInCreator: (campaignData: Partial<CreateCampaignFormData>) => void;
}

export default function AskAIAssistantModal({
  isOpen,
  onClose,
  onUseCampaignInCreator,
}: AskAIAssistantModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCampaigns, setGeneratedCampaigns] = useState([
    {
      title: 'Rainy Day Warm-Up Special',
      channel: 'SMS' as const,
      audience: 'Recent Visitors',
      estimatedReach: '560 guests',
      predictedConversion: '24.8%',
      message: '🌧️ Cold outside? Cozy up at Tavonza! Enjoy a complimentary hot spiced cider or artisanal soup with any pasta or burger order today. Code: COZYTAVONZA',
    },
    {
      title: 'Mid-Week Secret Chef Tasting',
      channel: 'Email' as const,
      audience: 'VIP Customers',
      estimatedReach: '320 guests',
      predictedConversion: '32.1%',
      message: '✨ Exclusive VIP Secret: Chef Marco is preparing a surprise 4-course truffle dinner this Wednesday only. 12 tables available. Book yours now: tavonza.com/vip-chef',
    },
    {
      title: 'Friday Night Cocktail Rush',
      channel: 'Push' as const,
      audience: 'All Customers',
      estimatedReach: '2,450 guests',
      predictedConversion: '19.4%',
      message: '🍸 Weekend kickoff at Downtown Branch! 2-for-1 signature cocktails from 5 PM - 8 PM with live acoustic sets. Table reservations: tavonza.com/friday',
    },
  ]);

  if (!isOpen) return null;

  const handleGenerate = (customPrompt?: string) => {
    setIsGenerating(true);
    const activeQuery = customPrompt || prompt;

    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedCampaigns([
        {
          title: activeQuery ? `${activeQuery.slice(0, 24)} Campaign` : 'Summer Cocktail Flash Deal',
          channel: 'SMS',
          audience: 'All Customers',
          estimatedReach: '2,450 guests',
          predictedConversion: '28.4%',
          message: `🔥 Tavonza AI Offer: Special promotion tailored for your downtown branch! Enjoy exclusive perks & handcrafted culinary delights. Tap tavonza.com/deal to claim.`,
        },
        ...generatedCampaigns.slice(0, 2),
      ]);
    }, 800);
  };

  const handleUseCampaign = (camp: typeof generatedCampaigns[0]) => {
    onUseCampaignInCreator({
      name: camp.title,
      channel: camp.channel,
      targetAudience: camp.audience,
      messageContent: camp.message,
      status: 'Active',
    });
    onClose();
  };

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
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold flex items-center gap-2">
                Ask Tavonza AI Marketing Assistant
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  GPT-4 Hospitality Engine
                </span>
              </h2>
              <p className="text-sm text-zinc-400">
                Generate high-converting SMS, email, and push campaigns based on your live inventory and customer behaviors.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Quick AI Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300">
              What kind of campaign would you like to run?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. Promote slow Tuesday pasta nights or boost dessert sales..."
                className="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                <span>Generate</span>
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-xs text-zinc-500">Quick ideas:</span>
              {[
                'Rainy day warm-up discount',
                'VIP wine tasting preview',
                'Clear out craft beer stock',
                'Weekend brunch reservation push',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(chip);
                    handleGenerate(chip);
                  }}
                  className="text-xs px-2.5 py-0.5 bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/30 text-zinc-300 hover:text-indigo-300 rounded-full transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* AI Recommended Campaign Options */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                AI Generated Campaign Concepts ({generatedCampaigns.length})
              </h3>
            </div>

            <div className="space-y-3">
              {generatedCampaigns.map((camp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {camp.channel}
                        </span>
                        <h4 className="text-white text-base font-semibold group-hover:text-amber-400 transition-colors">
                          {camp.title}
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Audience: <strong className="text-zinc-200">{camp.audience}</strong> · Reach: {camp.estimatedReach} · Predicted Conv: <strong className="text-emerald-400">{camp.predictedConversion}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleUseCampaign(camp)}
                      className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-yellow-500/20 cursor-pointer flex-shrink-0 active:scale-95"
                    >
                      <span>Use This</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-sm text-zinc-300 font-mono leading-relaxed">
                    {camp.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 flex justify-between items-center bg-black/30 text-sm text-zinc-500">
          <span>Powered by Tavonza Real-Time Operational Intelligence</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-zinc-800 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
