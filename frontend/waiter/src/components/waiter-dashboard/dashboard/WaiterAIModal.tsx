'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  Mic,
  Volume2,
  CheckCircle2,
  Flame,
  Wine,
} from 'lucide-react';

export interface WaiterAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaiterAIModal({ isOpen, onClose }: WaiterAIModalProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: "Hello Michael! I'm your Tavonza Waiter Copilot. Table 12 has been waiting 18 minutes for mains. Table 8 is finishing entrees — recommend the Warm Chocolate Lava Cake! How can I assist you right now?",
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  if (!isOpen) return null;

  const handleSend = (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim()) return;

    const newMsg = {
      role: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    setTimeout(() => {
      let botReply = "I've checked the kitchen queue: Chef Marco just plated the Wagyu Burger for Table 12! Ready for pickup at station 1.";
      const lower = textToSend.toLowerCase();
      if (lower.includes('wine') || lower.includes('pairing')) {
        botReply = "For the Grilled Salmon at Table 04, I recommend pairing with the 2022 Marlborough Sauvignon Blanc (Bin #42).";
      } else if (lower.includes('table 8') || lower.includes('dessert')) {
        botReply = "Table 8 has 2 chocolate lovers based on past visits. The Warm Chocolate Lava Cake with vanilla bean gelato has a 94% satisfaction rate.";
      } else if (lower.includes('bill') || lower.includes('check')) {
        botReply = "Printed receipt copy sent to Mobile POS Terminal #3 for Table 15.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  const handleVoiceToggle = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      handleSend("What wine pairs best with Table 4's Salmon?");
    }, 1500);
  };

  return (
    <div className="fixed top-20 left-0 md:left-72 right-0 bottom-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[580px] my-auto">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                Tavonza AI Waiter Copilot
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  LIVE
                </span>
              </div>
              <div className="text-xs text-zinc-400">Shift Assistant · Michael Davis</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-zinc-900/30 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto custom-scrollbar flex-shrink-0">
          <button
            type="button"
            onClick={() => handleSend("What is the status of Table 12's order?")}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white whitespace-nowrap border border-zinc-700/50 flex items-center gap-1.5 cursor-pointer"
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Check Table 12 Order</span>
          </button>
          <button
            type="button"
            onClick={() => handleSend("What wine pairs with Table 4's Salmon?")}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white whitespace-nowrap border border-zinc-700/50 flex items-center gap-1.5 cursor-pointer"
          >
            <Wine className="w-3 h-3 text-purple-400" />
            <span>Wine Pairing for Salmon</span>
          </button>
          <button
            type="button"
            onClick={() => handleSend("Recommend dessert for Table 8")}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white whitespace-nowrap border border-zinc-700/50 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Dessert for Table 8</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-amber-400" />
                </div>
              )}
              <div
                className={`max-w-[82%] p-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-amber-400 text-white font-medium rounded-tr-sm'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm'
                }`}
              >
                <div>{m.text}</div>
                <div className={`text-xs mt-1 ${m.role === 'user' ? 'text-black/60' : 'text-zinc-500'}`}>
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {isListening && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 text-sm animate-pulse">
              <Mic className="w-4 h-4" />
              <span>Listening to voice command...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isListening
                ? 'bg-amber-500 text-white border-amber-400'
                : 'bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700'
            }`}
            title="Voice Command"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI anything about your shift, dishes, or tables..."
            className="flex-1 h-10 px-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            className="h-10 px-4 bg-amber-400 hover:bg-amber-300 text-white font-semibold text-sm rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
