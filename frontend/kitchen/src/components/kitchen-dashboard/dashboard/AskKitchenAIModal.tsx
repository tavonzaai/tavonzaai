'use client';

import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, ChefHat, Flame, Package, Zap } from 'lucide-react';

interface AskKitchenAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export default function AskKitchenAIModal({ isOpen, onClose }: AskKitchenAIModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Hello Chef Michael! I am your Tavonza Kitchen Co-pilot. I monitor line speed, station bottlenecks, and recipe ingredient availability. How can I assist you right now?',
    },
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    'How do we balance Grill Station load?',
    'What is our Mozzarella stock level?',
    'Show allergen notes for Order #20581',
    'Generate prep list for dinner rush',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      let reply = "I've analyzed your kitchen data. Everything looks optimized for the upcoming rush.";
      const lower = query.toLowerCase();

      if (lower.includes('grill') || lower.includes('balance') || lower.includes('load')) {
        reply = 'Grill Station is currently at 88% capacity with 8 tickets. I recommend routing the 2 Gourmet Burgers in Order #20584 to the Fry Station flat-top to reduce queue time by 4 minutes.';
      } else if (lower.includes('mozzarella') || lower.includes('stock') || lower.includes('inventory')) {
        reply = 'Mozzarella is at 2.4kg (critical reorder threshold). The stock runner has been alerted, and 10kg from Sysco is due for delivery at 4:30 PM.';
      } else if (lower.includes('allergen') || lower.includes('20581')) {
        reply = 'Order #20581 (Table T-08): No severe nut allergies flagged. Special instruction: "Gluten-free buns requested for Burger #2".';
      } else if (lower.includes('prep') || lower.includes('dinner')) {
        reply = 'Predicted dinner volume is 142 covers (+18% vs Tuesday avg). Required prep: 48 Dry-Aged Patties, 35 Pizza Dough balls, 18 portions Alfredo Sauce.';
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <div className="fixed top-20 left-0 md:left-72 right-0 bottom-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-zinc-950 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-1.5 font-['Inter']">
                Tavonza Kitchen AI Co-Pilot
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xs text-zinc-400 font-mono">Real-Time Kitchen Intelligence</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                  AI
                </div>
              )}
              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-white font-medium rounded-tr-none'
                    : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none font-normal'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Prompts */}
        <div className="px-6 py-2 bg-zinc-900/40 border-t border-zinc-800/60 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-xs px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-700/60 whitespace-nowrap transition-colors cursor-pointer flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about prep lists, station bottleneck, recipe specs..."
            className="flex-1 h-10 px-4 bg-zinc-900 rounded-xl text-sm text-white placeholder:text-zinc-500 border border-zinc-800 focus:border-amber-500/50 outline-none transition-colors"
          />
          <button
            type="submit"
            className="h-10 px-4 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold text-sm flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-amber-500/20"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
