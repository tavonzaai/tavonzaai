'use client';

import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export interface AskAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AskAIModal({ isOpen, onClose }: AskAIModalProps) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; action?: string }[]
  >([
    {
      role: 'assistant',
      text: 'Hello Chef! I am your Tavonza Culinary & Recipe AI. Ask me to engineer food costs, suggest seasonal ingredient substitutions, or optimize menu margins.',
    },
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    'How can I increase the Classic Burger margin above 80%?',
    'Suggest dairy-free substitutions for Truffle Mushroom Pizza',
    'Calculate target sale price for a $5.20 food cost dish',
  ];

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg = userText.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setPrompt('');

    // Generate intelligent response
    setTimeout(() => {
      let aiReply = '';
      if (userMsg.toLowerCase().includes('margin') || userMsg.toLowerCase().includes('burger')) {
        aiReply =
          '💡 **Margin Optimization Plan for Classic Burger**:\n• Current food cost: $4.20, Selling price: $18.90 (77% margin).\n• By switching to local bulk brioche buns (-$0.35) and streamlining house sauce prep (-$0.15), food cost drops to $3.70.\n• New estimated profit margin: **80.4%** (+$1,420 monthly revenue boost).';
      } else if (userMsg.toLowerCase().includes('substitut') || userMsg.toLowerCase().includes('dairy')) {
        aiReply =
          '🌿 **Dairy-Free Substitutions for Truffle Mushroom Pizza**:\n• Replace Mozzarella with Cashew-based artisan melt.\n• Retain Portobello Mushrooms and White Truffle Oil (inherently vegan).\n• Substitute parmesan finish with nutritional yeast flakes and toasted pine nuts.';
      } else {
        aiReply =
          '✨ Based on your current 75-80% target margin standard across Tavonza Group, for a $5.20 food cost we recommend a retail menu price of **$22.50 to $24.00** (giving 77-78.3% gross margin).';
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: aiReply }]);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#141416] border border-white/20 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-white animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Inter'] flex items-center gap-2">
                Tavonza Recipe Intelligence
              </h3>
              <p className="text-sm text-zinc-400 font-normal">
                AI food cost engineering & culinary assistant
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conversation Box */}
        <div className="h-64 overflow-y-auto space-y-3 p-3 bg-zinc-950/70 rounded-2xl border border-zinc-800/80 text-sm font-['Inter']">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <Bot className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              )}
              <div
                className={`p-3 rounded-xl max-w-[85%] whitespace-pre-line leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-amber-500 text-white font-medium'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-1.5">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            Quick Inquiries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(qp)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition text-left cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(prompt);
          }}
          className="flex items-center gap-2 pt-1"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI about ingredient costs, margins, or recipe steps..."
            className="flex-1 h-10 px-3.5 bg-zinc-900 rounded-xl border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            className="h-10 px-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl flex items-center justify-center transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
