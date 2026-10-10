'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  Minimize2,
  Maximize2,
  Flame,
  ChefHat,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface AskAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStation?: string;
}

const QUICK_KITCHEN_PROMPTS = [
  '🔥 Check Grill Station load',
  '⚡ Overdue Tickets in queue',
  '⚠️ Critical inventory / 86 items',
  '📋 Dinner rush prep suggestions',
];

export default function AskAiModal({
  isOpen,
  onClose,
  activeStation = 'Grill Station',
}: AskAiModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Chef Marco, Tavonza Kitchen Co-pilot is online for ${activeStation}. I am tracking station line speed, order hold times, and ingredient pars. What do you need right now?`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = `Kitchen telemetry checked for ${activeStation}: Line operations are balanced at an average ticket turnover of 11.2 minutes.`;
      const lower = query.toLowerCase();

      if (lower.includes('grill') || lower.includes('load') || lower.includes('capacity')) {
        reply = `Grill Station is currently at 82% line capacity with 6 tickets pending. Suggest firing the 2 Medium-Well Wagyu Burgers on the secondary flat-top to prevent a 4-minute bottleneck for Table T-04.`;
      } else if (lower.includes('overdue') || lower.includes('delay') || lower.includes('ticket')) {
        reply = `Ticket #1522 for Table T-02 is approaching 16 minutes (target: 14 mins). Primary delay: Truffle Fries awaiting fryer basket #2. Prioritize plating now.`;
      } else if (lower.includes('86') || lower.includes('stock') || lower.includes('inventory')) {
        reply = `Inventory Alert: Fresh Mozzarella is down to 2.1kg (reorder threshold). Ribeye Steaks have 14 portions remaining. Sysco delivery batch scheduled for 4:30 PM.`;
      } else if (lower.includes('prep') || lower.includes('rush') || lower.includes('dinner')) {
        reply = `Dinner rush forecast predicts 148 covers (+16% vs normal). Recommended immediate batch prep: 45 pre-portioned burger patties, 30 dough balls, and 12 portions Garlic Herb Compound Butter.`;
      } else if (lower.includes('allergen') || lower.includes('recipe')) {
        reply = `Classic Wagyu Burger specs: Brioche bun (gluten, dairy), 8oz wagyu blend, caramelized onions, aged cheddar (dairy), house aioli (egg). Sub lettuce wrap + oil-only prep for zero dairy/gluten.`;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 550);
  };

  return (
    <div
      className={`fixed bottom-20 right-4 sm:right-6 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] ${
        isMinimized ? 'h-14' : 'h-[560px] max-h-[calc(100vh-7rem)]'
      } bg-neutral-950 border border-neutral-800 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden z-50 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-yellow-400 text-neutral-950 flex items-center justify-center font-bold shadow-md shadow-yellow-400/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-neutral-100 flex items-center gap-1.5 font-sans">
              Kitchen AI Co-Pilot
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-neutral-400 flex items-center gap-1">
              <span>{activeStation}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Telemetry Connected</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-neutral-900/50 border-b border-neutral-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_KITCHEN_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-yellow-400 border border-neutral-800 whitespace-nowrap transition cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 custom-scrollbar bg-neutral-950">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-md bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[84%] p-3 rounded-xl text-xs sm:text-[13px] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-yellow-400 text-neutral-950 font-medium rounded-tr-none shadow-md shadow-yellow-400/10'
                      : 'bg-neutral-900/90 text-neutral-200 border border-neutral-800/80 rounded-tl-none font-normal'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <div
                    className={`mt-1 text-[10px] ${
                      m.sender === 'user' ? 'text-neutral-900/70 text-right' : 'text-neutral-500'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-md bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-neutral-900/90 border border-neutral-800 p-2.5 rounded-xl rounded-tl-none flex items-center gap-1.5 text-neutral-400 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce [animation-delay:0.3s]" />
                  <span className="text-[11px] ml-1">Analyzing line speed...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-neutral-900/90 border-t border-neutral-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ticket bottlenecks, 86'd items..."
              className="flex-1 h-9 px-3 bg-neutral-950 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 border border-neutral-800 focus:border-yellow-400/60 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="h-9 px-3.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:hover:bg-yellow-400 text-neutral-950 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-yellow-400/20 active:scale-95"
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
