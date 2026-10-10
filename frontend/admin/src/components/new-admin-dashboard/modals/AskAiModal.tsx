'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Bot, Minus, ChevronDown } from 'lucide-react';

interface AskAiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AskAiModal({ isOpen, onClose }: AskAiModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; timestamp?: string }>>([
    {
      sender: 'ai',
      text: 'Hello Platform Admin. I am Tavonza Operations & Platform Copilot. I monitor consolidated multi-unit revenue, branch operational telemetry, staff shifts, and subscription capacity limits. How can I assist you?',
      timestamp: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      label: 'Workspace capacity & limits',
      text: 'Analyze my current workspace capacity and subscription resource utilization.',
    },
    {
      label: 'Revenue & sales anomalies',
      text: 'Summarize today consolidated revenue and flag any irregular transaction patterns.',
    },
    {
      label: 'Branch bottleneck audit',
      text: 'Are any branches experiencing kitchen delays or order backlogs right now?',
    },
    {
      label: 'Staff allocation overview',
      text: 'What is the current staff distribution across all active venues?',
    },
  ];

  const handleSend = (textToSend?: string) => {
    const message = textToSend || prompt;
    if (!message.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: message, timestamp: timeStr }]);
    if (!textToSend) setPrompt('');
    setIsTyping(true);

    setTimeout(() => {
      let aiReply = 'I have evaluated your cross-organization telemetry. System flow is performing within standard operating thresholds.';

      const lower = message.toLowerCase();
      if (lower.includes('capacity') || lower.includes('subscription') || lower.includes('limit') || lower.includes('plan')) {
        aiReply =
          'Workspace Capacity Audit (Pro Plan — $499/mo):\n• Restaurants: 2/5 active (60% remaining)\n• Branches: 6/20 active (70% remaining)\n• Staff members: 24/50 provisioned (52% remaining)\n\nRecommendation: Your capacity headroom is healthy. If you expand past 20 branches, the Enterprise Plan ($599/mo) provides unlimited locations and dedicated API bandwidth.';
      } else if (lower.includes('revenue') || lower.includes('sales') || lower.includes('anomal')) {
        aiReply =
          'Revenue & Financial Summary (Live):\n• Daily Gross Volume: $14,820 across 6 active branches (+8.4% vs last week)\n• Average Order Value: $48.50\n• Refund Rate: 0.28% (Well below the 1.0% alert threshold)\n• Highest Velocity Branch: Gulshan Bistro ($4,210 gross today). No transaction anomalies detected.';
      } else if (lower.includes('bottleneck') || lower.includes('delay') || lower.includes('kitchen') || lower.includes('backlog')) {
        aiReply =
          'Live Venue Diagnostics:\n• Downtown Bistro: 8 active orders in kitchen queue, average ticket prep time is 14 minutes (optimal).\n• Uptown Grill: 12 orders active, slight spike on Grill Station #2 (medium-rare steaks). Average prep time is 19 minutes.\n• All KDS & Waiter WebSockets are connected and synchronizing with 0 dropped frames.';
      } else if (lower.includes('staff') || lower.includes('shift') || lower.includes('workload')) {
        aiReply =
          'Staff Allocation & Shift Telemetry:\n• Active On-Duty: 24 staff members clocked in across 6 venues.\n• Floor Servers: 14 waiters managing 38 active dining sessions.\n• Kitchen Crew: 8 line cooks & 2 expediters active on stations.\n• All assigned roles possess valid RBAC capabilities without permission escalation flags.';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 750);
  };

  return (
    <aside
      aria-label="Tavonza AI Assistant"
      className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-8 z-50 w-[92vw] sm:w-[420px] md:w-[440px] bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-2xl flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden font-['Inter'] transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
        isMinimized ? 'h-[64px]' : 'h-[560px] max-h-[calc(100vh-120px)]'
      }`}
    >
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/90 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-yellow-500/10">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-semibold text-white font-['Poppins']">
                Tavonza AI Platform Assistant
              </h3>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-medium">
                Live
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-neutral-400">
              Multi-brand operations &amp; telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Minimize / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="w-7 h-7 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            title={isMinimized ? 'Expand' : 'Minimize'}
            aria-label={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5 rotate-180" /> : <Minus className="w-3.5 h-3.5" />}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Close Assistant"
            aria-label="Close Assistant"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat message history */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-black/40 text-xs sm:text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex gap-2 max-w-[88%] ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {m.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-lg bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-yellow-400 text-neutral-950 font-medium rounded-tr-none'
                        : 'bg-neutral-800/95 text-neutral-200 border border-neutral-700/80 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
                {m.timestamp && (
                  <span className="text-[10px] text-neutral-500 px-8 mt-1">
                    {m.timestamp}
                  </span>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-neutral-400 text-xs pl-8 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                <span>Analyzing telemetry &amp; live metrics...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt suggestions */}
          <div className="px-3.5 py-2 bg-neutral-950/70 border-t border-neutral-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp.text)}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-full text-neutral-300 hover:text-white shrink-0 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <span>{qp.label}</span>
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
              placeholder="Ask AI about capacity, branches, revenue..."
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400 transition"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="p-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:hover:bg-yellow-400 text-neutral-950 rounded-xl transition shrink-0 cursor-pointer shadow-md shadow-yellow-500/10 active:scale-95"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </aside>
  );
}
