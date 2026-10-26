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
      text: 'Hello Cashier. I am Tavonza Counter POS & Billing Intelligence Copilot. I monitor table settlements, bill queues, payment methods, cash drawer reconciliation, and invoice splits. How can I assist you?',
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
      label: 'Unsettled bills & queue',
      text: 'Which tables currently have pending bill settlement or cash requests?',
    },
    {
      label: 'Shift & cash drawer totals',
      text: 'What is my current shift cash collected and total sales volume?',
    },
    {
      label: 'Split bill guidance',
      text: 'How do I process split bills or separate check payments?',
    },
    {
      label: 'Payment gateway status',
      text: 'Are credit card terminals and digital wallets synchronizing normally?',
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
      let aiReply = 'I have evaluated your counter POS billing queue. All financial settlement channels are operating normally.';

      const lower = message.toLowerCase();
      if (lower.includes('unsettled') || lower.includes('pending') || lower.includes('queue') || lower.includes('table')) {
        aiReply =
          'Live Table Settlement Queue:\n• Order #10040-9682: Table 02 (2 Guests) — $21.47 [Requesting Cash]\n• Order #10039-6345: Table 04 (2 Guests) — $40.68 [Requesting Cash]\n• Counter Total Pending: $214.70 across 4 active dining sessions.\n\nAll kitchen tickets for these orders are completed. Ready for immediate cash settlement and receipt printout.';
      } else if (lower.includes('cash') || lower.includes('drawer') || lower.includes('shift') || lower.includes('total') || lower.includes('sales')) {
        aiReply =
          'Current Shift Financial Snapshot:\n• Opening Float: $200.00\n• Cash Payments Received: $560.50 (14 transactions)\n• Card / Terminal Payments: $920.00 (22 transactions)\n• Total Shift Sales: $1,480.50 across 36 orders\n• Cash In Drawer (Expected): $760.50\n\nNo discrepancy detected between POS registers and payment gateway.';
      } else if (lower.includes('split') || lower.includes('separate') || lower.includes('divide')) {
        aiReply =
          'Split Payment Workflow:\n1. Select the active table from Table View or Bill Queue.\n2. In the settlement modal, toggle "Split Payment".\n3. Choose either "Equal Split" (enter number of guests) or "Split by Items".\n4. Collect payment for Guest 1 (Cash/Card), then proceed to the remaining balance for Guest 2.\n5. Both receipts can be printed individually or as a combined itemized summary.';
      } else if (lower.includes('gateway') || lower.includes('card') || lower.includes('terminal') || lower.includes('stripe')) {
        aiReply =
          'Payment Gateway Telemetry:\n• Counter Terminal 1 (NFC/Chip): Connected (12ms latency)\n• Counter Terminal 2: Online & Idle\n• Digital Wallets (Apple Pay / Google Pay): Active\n• Average transaction authorization time: 1.8 seconds. 0 dropped payment webhooks.';
      } else if (lower.includes('discount') || lower.includes('promo') || lower.includes('coupon')) {
        aiReply =
          'Discount Authorization Policy:\n• Standard Staff Discount (10%): Select "Apply Discount" and enter authorized cashier code.\n• VIP / Comp Item (100%): Requires Branch Manager authorization pin.\n• Automatic Promotions: Automatically applied at item level if within active campaign hours.';
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
      aria-label="Tavonza Cashier AI Assistant"
      className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-8 z-50 w-[92vw] sm:w-[420px] md:w-[440px] bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-2xl flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden font-sans transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
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
              <h3 className="text-xs sm:text-sm font-semibold text-white">
                Tavonza AI Cashier Assistant
              </h3>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-medium">
                Live
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-neutral-400">
              Counter POS &amp; Billing Copilot
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
                <span>Checking counter POS telemetry &amp; live orders...</span>
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
              placeholder="Ask AI about cash drawer, bills, split payments..."
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
