'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Layers,
  UtensilsCrossed,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export default function AIAssistantView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Good morning, Michael! I'm Tavonza AI, your personal service assistant. I have real-time visibility into all your tables, orders, and guest preferences. How can I help you deliver exceptional service today?",
      time: '9:14 AM',
    },
    {
      id: 'msg-2',
      sender: 'user',
      text: 'Which table should I prioritize right now?',
      time: '9:15 AM',
    },
    {
      id: 'msg-3',
      sender: 'ai',
      text: "Table 12 is your highest priority right now. Order #10582 (Grilled Salmon + Caesar Salad) has been ready at the pass for 8 minutes — that's past your average service threshold. After that, head to Table 8 to offer dessert: they've been on main for 26 minutes and are likely ready. Table 15 is also waiting on the bill.",
      time: '9:15 AM',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [activePrompt, setActivePrompt] = useState<string>('Which table needs my attention first?');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Which table needs my attention first?',
    'Suggest an upsell for Table 8.',
    'What orders are ready to serve?',
    'Show guests waiting the longest.',
    'What should I do next?',
    'Generate the bill for Table 15.',
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    // Generate Contextual AI Response
    setTimeout(() => {
      let aiResponseText =
        "I've updated your table telemetry. All stations are being monitored in real time.";
      const queryLower = text.toLowerCase();

      if (queryLower.includes('priority') || queryLower.includes('attention') || queryLower.includes('first')) {
        aiResponseText =
          "Table 12 is your #1 priority right now. Order #10582 (Grilled Salmon + Caesar Salad) has been sitting at the pass. Table 5 has also pressed their call button 2 minutes ago.";
      } else if (queryLower.includes('upsell') || queryLower.includes('table 8')) {
        aiResponseText =
          "For Table 8: They just finished the Artisan Margherita Pizza. Recommend the Warm Chocolate Lava Cake paired with a glass of Tawny Port (86% acceptance rate for this profile).";
      } else if (queryLower.includes('ready') || queryLower.includes('orders')) {
        aiResponseText =
          "Currently, 2 orders are ready for pickup: #10582 for Table 12 (Station 2) and #10586 for Table 14.";
      } else if (queryLower.includes('waiting') || queryLower.includes('longest')) {
        aiResponseText =
          "Table 12 has been seated the longest relative to meal progression (18+ min wait on food). Table 18 has been waiting 8 min for their final check ($82.40).";
      } else if (queryLower.includes('bill') || queryLower.includes('table 15')) {
        aiResponseText =
          "Bill generated for Table 15: Subtotal $345.00 for 5 guests (Chef Tasting Menu x5 + Wine Pairing). Sent to POS terminal #2 for payment processing.";
      } else if (queryLower.includes('next') || queryLower.includes('do next')) {
        aiResponseText =
          "Next 3 Actions: 1) Deliver Salmon to Table 12. 2) Respond to Table 5 call light. 3) Present dessert menu to Table 8.";
      }

      const aiMsg: ChatMessage = {
        id: `ai-msg-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  const handlePromptClick = (prompt: string) => {
    setActivePrompt(prompt);
    handleSendMessage(prompt);
  };

  return (
    <div className="w-full pb-12">
      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chat Card (8 cols) */}
        <div className="lg:col-span-8 bg-neutral-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-between overflow-hidden h-[760px] shadow-2xl">
          {/* Card Header */}
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-md flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div>
                <h3 className="text-slate-200 text-base font-bold font-['DM_Sans'] leading-5">
                  Tavonza AI Assistant
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0px_0px_6px_0px_rgba(16,185,129,0.50)]" />
                  <span className="text-slate-500 text-xs font-normal font-['DM_Sans'] leading-4">
                    Active · Monitoring 8 tables
                  </span>
                </div>
              </div>
            </div>

            {/* AI Tags */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-sm outline outline-1 outline-offset-[-1px] outline-white/10 text-zinc-400 text-[10px] font-normal font-['DM_Sans'] leading-3">
                Real-time
              </span>
              <span className="px-2 py-0.5 rounded-sm outline outline-1 outline-offset-[-1px] outline-white/10 text-zinc-400 text-[10px] font-normal font-['DM_Sans'] leading-3">
                Personalized
              </span>
              <span className="px-2 py-0.5 rounded-sm outline outline-1 outline-offset-[-1px] outline-white/10 text-zinc-400 text-[10px] font-normal font-['DM_Sans'] leading-3">
                Context-aware
              </span>
            </div>
          </div>

          {/* Chat Messages Thread */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isAi ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {/* AI Avatar */}
                  {isAi && (
                    <div className="w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-amber-500/20">
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`flex flex-col ${
                      isAi ? 'items-start max-w-xl' : 'items-end max-w-md'
                    }`}
                  >
                    <div
                      className={`px-3.5 py-3 text-base font-normal font-['DM_Sans'] leading-5 ${
                        isAi
                          ? 'bg-neutral-800 text-zinc-300 rounded-tl-2xl rounded-tr-2xl rounded-bl-sm rounded-br-2xl'
                          : 'bg-amber-500 text-white font-medium rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="px-1 pt-1 text-slate-500 text-xs font-normal font-['DM_Sans'] leading-4">
                      {msg.time}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {!isAi && (
                    <div className="w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <User className="w-4 h-4 text-black" />
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="px-5 py-3.5 border-t border-white/5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask Tavonza AI anything about your shift…"
                className="flex-1 h-11 px-4 bg-zinc-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 text-white text-base font-normal font-['DM_Sans'] placeholder-neutral-500 focus:outline-amber-500 transition-colors"
              />
              <button
                type="submit"
                className="h-11 px-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-white font-semibold text-base font-['DM_Sans'] rounded-[10px] flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Widgets (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Widget 1: Quick Prompts */}
          <div className="p-4 bg-neutral-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 space-y-3 shadow-xl">
            <h4 className="text-white text-sm font-bold font-['DM_Sans'] uppercase tracking-wide">
              Quick Prompts
            </h4>

            <div className="space-y-2">
              {quickPrompts.map((prompt, idx) => {
                const isActive = activePrompt === prompt;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptClick(prompt)}
                    className={`w-full text-left p-2.5 rounded-lg text-sm font-medium font-['DM_Sans'] leading-4 transition-all cursor-pointer ${
                      isActive
                        ? 'outline outline-1 outline-offset-[-1px] outline-amber-500 bg-amber-500/10 text-stone-200'
                        : 'outline outline-1 outline-offset-[-1px] outline-white/10 hover:outline-white/20 bg-white/[0.02] text-stone-300 hover:bg-white/5'
                    }`}
                  >
                    {prompt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Widget 2: Live Context */}
          <div className="p-4 bg-neutral-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 space-y-3 shadow-xl">
            <h4 className="text-white text-sm font-bold font-['DM_Sans'] uppercase tracking-wide">
              Live Context
            </h4>

            <div className="space-y-2.5 text-sm font-['DM_Sans']">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Tables Monitored</span>
                <span className="text-blue-400 font-semibold font-['DM_Mono']">8</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Active Orders</span>
                <span className="text-amber-400 font-semibold font-['DM_Mono']">14</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Critical Alerts</span>
                <span className="text-red-400 font-semibold font-['DM_Mono']">2</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Upsell Opportunities</span>
                <span className="text-emerald-400 font-semibold font-['DM_Mono']">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
