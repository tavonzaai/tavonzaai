'use client';

import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { AIChatMessage } from '../types';
import { initialChatMessages, suggestedPromptChips } from '../aiInsightsData';

export const TavonzaAIChatCard: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>(initialChatMessages);
  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const generateAnswer = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('peak') || q.includes('hour')) {
      return 'Peak sales occur between 12:00 PM and 1:00 PM with $2,180 in volume across 58 orders. Counter 02 should be opened by 11:45 AM.';
    }
    if (q.includes('payment') || q.includes('method') || q.includes('popular')) {
      return 'Credit/Debit cards lead at 46% ($4,536), followed by QR digital payments at 35% ($18.50 pass-through), and cash at 19% ($1,873).';
    }
    if (q.includes('upsell') || q.includes('item') || q.includes('recommend')) {
      return 'Craft Beer has an 82% conversion rate on dinner tickets, while Side Salad (+55%) and Tiramisu (+88% for VIPs) have the highest margins.';
    }
    return `Tavonza AI analyzed checkout rush data for "${query}": Staff pacing is currently optimal at 38s/ticket with $9,860 daily revenue pacing +14% above forecast.`;
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-msg-${prev.length + 1}`,
        sender: 'user',
        text: text.trim(),
        timestamp: 'Just now',
      },
    ]);
    setInputVal('');
    setIsThinking(true);

    setTimeout(() => {
      const replyText = generateAnswer(text);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-msg-${prev.length + 1}`,
          sender: 'ai',
          text: replyText,
          timestamp: 'Just now',
        },
      ]);
      setIsThinking(false);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputVal);
  };

  return (
    <div className="rounded-md overflow-hidden border border-white/10 shadow-lg flex flex-col">
      {/* Chat Top Header */}
      <div className="px-3.5 py-3 bg-zinc-900 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-yellow-500/30 to-amber-500/30 rounded-lg flex items-center justify-center text-yellow-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-200 text-sm font-semibold font-['Plus_Jakarta_Sans'] leading-4">
              Tavonza AI Chat
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-yellow-500 text-xs font-normal font-['Plus_Jakarta_Sans'] leading-none">
                Analyzing live data
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Body & History */}
      <div className="p-3.5 bg-stone-950 flex flex-col space-y-2.5 min-h-56 max-h-72 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[90%] px-3 py-2 rounded-lg text-sm leading-4 font-['Plus_Jakarta_Sans'] ${
                msg.sender === 'user'
                  ? 'bg-yellow-500 text-white font-medium'
                  : 'bg-white/5 text-stone-300 border border-white/5'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-yellow-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" />
              <span>Analyzing live registers...</span>
            </div>
          </div>
        )}

        {/* Suggested Prompt Chips */}
        <div className="pt-2 border-t border-zinc-900 space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            {suggestedPromptChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSend(chip)}
                className="px-2 py-1 rounded-md border border-white/10 hover:border-yellow-500/40 bg-white/[0.03] hover:bg-yellow-500/10 text-neutral-400 hover:text-yellow-300 text-xs font-medium font-['Plus_Jakarta_Sans'] transition-colors cursor-pointer text-left"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="pt-1 flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask Tavonza AI..."
            className="flex-1 bg-black border border-white/10 rounded-md px-3 py-1.5 text-sm text-white placeholder:text-neutral-500 focus:outline-yellow-500/50 font-['Plus_Jakarta_Sans']"
          />
          <button
            type="submit"
            className="w-7 h-7 bg-yellow-500 hover:bg-yellow-400 text-white rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
};
