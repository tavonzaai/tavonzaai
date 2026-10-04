'use client';

import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, AlertTriangle, TrendingUp, Users } from 'lucide-react';

interface AskAiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AskAiModal({ isOpen, onClose }: AskAiModalProps) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello Manager Nobin. I am Tavonza Branch Intelligence AI. I am monitoring kitchen telemetry, waiter workloads, table turn rates, and bottlenecks. How can I assist you?',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: 'Kitchen bottleneck analysis', text: 'Why is the grill station running behind schedule?' },
    { label: 'Staff workload balancing', text: 'Which waiter has the highest workload right now?' },
    { label: 'Predict dinner peak', text: 'What is our projected rush time and table turn rate?' },
  ];

  const handleSend = (textToSend?: string) => {
    const message = textToSend || prompt;
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: message }]);
    if (!textToSend) setPrompt('');
    setIsTyping(true);

    setTimeout(() => {
      let aiReply = 'I have evaluated current floor data. Operational flow is healthy.';

      const lower = message.toLowerCase();
      if (lower.includes('grill') || lower.includes('bottleneck')) {
        aiReply =
          'Grill station delay: Chef Alex is handling 4 simultaneous Wagyu & Ribeye orders with medium-rare temp requirements. Recommendation: Direct expediter to stage cold sides first and notify Table 04 of a 4-minute delay.';
      } else if (lower.includes('waiter') || lower.includes('workload')) {
        aiReply =
          'Waiter Sara is currently at 90% capacity with 4 active tables (T04, T05, T06, T08). Waiter Alex has 2 tables and is available for reassignment of Table 04.';
      } else if (lower.includes('dinner') || lower.includes('peak') || lower.includes('rush')) {
        aiReply =
          'Projected peak begins in 35 minutes (6:45 PM). 12 reservations confirmed. Recommend prepping extra cutlery sets for Section B and having host hold T01 & T03 for walk-ins.';
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col h-[560px] shadow-2xl overflow-hidden font-['Inter']">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-neutral-950 font-bold shadow-md">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-['Poppins']">
                Tavonza AI Branch Copilot
              </h3>
              <p className="text-[11px] text-neutral-400">
                Live branch telemetry · Real-time operational intelligence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat message history */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-black/40">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-amber-400 text-neutral-950 font-medium rounded-tr-none'
                    : 'bg-neutral-800 text-neutral-200 border border-neutral-700/80 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-neutral-500 text-xs pl-9">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Analyzing live POS & KDS queues...</span>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-4 py-2 bg-neutral-950/60 border-t border-neutral-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(qp.text)}
              className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-full text-neutral-300 hover:text-white shrink-0 transition"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI about floor status, bottlenecks, table turns..."
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="p-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg transition shrink-0 cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
