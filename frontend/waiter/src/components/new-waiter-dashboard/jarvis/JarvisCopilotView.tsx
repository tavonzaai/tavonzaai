'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Paperclip, Send, Eye, Lightbulb, Mic, Sparkles, CheckCircle2 } from 'lucide-react';
import BottomDock from '../navigation/BottomDock';
import { useNewWaiterShell } from '../navigation/NewWaiterShellContext';
import { toast } from 'sonner';

interface JarvisCopilotViewProps {
  onNavigateTab?: (tab: string) => void;
  isStandaloneRoute?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
}

export default function JarvisCopilotView({
  onNavigateTab,
  isStandaloneRoute = false,
}: JarvisCopilotViewProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Upsell' | 'Needs Attention' | 'Regulars'>('All');
  const [inputMessage, setInputMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'user', text: 'Hello!' },
    { id: '2', sender: 'jarvis', text: 'Hello Alex! How Can I help you today?' },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Recommendations data matching Figma
  const recommendations = [
    {
      id: 'rec-1',
      category: 'Needs Attention',
      categoryType: 'attention',
      table: 'Table 01',
      bannerBg: 'bg-red-600/20 text-red-500',
      text: "Table 09 hasn't been checked on in 12 minutes - consider a quick visit to see if they need anything.",
      actionLabel: 'Check Table',
      actionIcon: Eye,
      tableId: 'T-01',
    },
    {
      id: 'rec-2',
      category: 'Upsell',
      categoryType: 'upsell',
      table: 'Table 02',
      bannerBg: 'bg-blue-500/20 text-blue-400',
      text: 'They ordered a Burger — suggest Loaded Chips or Onion Rings as a side.',
      actionLabel: 'Suggest',
      actionIcon: Lightbulb,
      tableId: 'T-02',
    },
    {
      id: 'rec-3',
      category: 'Regulars',
      categoryType: 'regulars',
      table: 'Table 03',
      bannerBg: 'bg-amber-500/20 text-amber-400',
      text: 'Sarah M. usually orders a Cappuccino after her meal - worth mentioning now.',
      actionLabel: 'Suggest',
      actionIcon: Lightbulb,
      tableId: 'T-03',
    },
  ];

  const filteredRecs = recommendations.filter((r) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Upsell') return r.category === 'Upsell';
    if (activeFilter === 'Needs Attention') return r.category === 'Needs Attention';
    if (activeFilter === 'Regulars') return r.category === 'Regulars';
    return true;
  });

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setIsTyping(true);

    // AI intelligent waiter floor response
    setTimeout(() => {
      let reply = "I've logged this. Kitchen is on schedule and Table 02 is ready for drink refills.";
      const lower = userText.toLowerCase();
      if (lower.includes('table') || lower.includes('status')) {
        reply = 'Table 01 & 03 are occupied. Table 02 just received their main courses.';
      } else if (lower.includes('burger') || lower.includes('menu') || lower.includes('special')) {
        reply = 'Today’s recommended upsell is the Potato Corn Burger with Truffle Aioli.';
      } else if (lower.includes('bill') || lower.includes('check')) {
        reply = 'Table 04 requested their invoice. Pre-bill printout is ready at station.';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'jarvis',
          text: reply,
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleActionClick = (rec: (typeof recommendations)[0]) => {
    toast.success(`${rec.actionLabel} dispatched for ${rec.table}!`, {
      description: rec.text,
    });
  };

  const { inShell } = useNewWaiterShell();

  const jarvisContent = (
    <div className="flex flex-col gap-3 pb-6 animate-fadeIn">
      {/* Top Bar: Ask AI Header Row */}
      <div className="px-5 pt-3 pb-3 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex justify-center items-center shadow-md shadow-orange-500/20">
                <span className="text-base select-none">🤖</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-stone-200 text-base font-semibold font-['Outfit'] leading-5">
                  Ask AI
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-500 text-xs font-normal font-['DM_Mono']">
                    Online
                  </span>
                  <span className="text-amber-500 text-xs font-normal font-['Inter']">
                    · Ready to help
                  </span>
                </div>
              </div>
            </div>

            {/* Voice Audio Waveform Button */}
            <button
              onClick={() => toast.info('Voice Copilot listening...')}
              className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-800 flex items-center justify-center transition cursor-pointer group"
              title="Voice Copilot"
            >
              <div className="flex items-center gap-[2.5px] h-4">
                <div className="w-[2px] h-2 bg-yellow-400 rounded-full animate-pulse" />
                <div className="w-[2px] h-3 bg-yellow-400 rounded-full animate-pulse delay-75" />
                <div className="w-[2px] h-4 bg-yellow-400 rounded-full animate-pulse delay-150" />
                <div className="w-[2px] h-2.5 bg-yellow-400 rounded-full animate-pulse delay-100" />
                <div className="w-[2px] h-1.5 bg-yellow-400 rounded-full" />
              </div>
            </button>
          </div>

          {/* Hero Greeting Section: Robot Mascot + Speech Bubble */}
          <div className="px-5 py-3 flex items-center gap-3">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg shadow-amber-500/10 bg-neutral-900">
              <Image
                src="/images/jarvis-robot.jpg"
                alt="JARVIS AI"
                fill
                className="object-cover"
              />
            </div>

            {/* Speech Bubble */}
            <div className="relative flex-1 bg-gray-900 rounded-2xl p-3.5 border border-white/10 shadow-md">
              <div className="absolute -left-2 top-6 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-gray-900" />
              <p className="text-white text-sm font-medium font-['Inter'] leading-5">
                Good morning, Alex! Ready to kick off the day?
              </p>
            </div>
          </div>

          {/* Section: Recommendations by Table */}
          <div className="px-5 pt-3 pb-2 flex flex-col gap-3">
            <h2 className="text-stone-200 text-lg font-medium font-['Outfit'] leading-6">
              Recommendations by Table
            </h2>

            {/* Filter Pills: All | Upsell | Needs Attention | Regulars */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 select-none">
              {(['All', 'Upsell', 'Needs Attention', 'Regulars'] as const).map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`h-7 px-3 py-1 rounded-[5px] text-xs font-medium font-['Inter'] transition cursor-pointer whitespace-nowrap outline outline-[0.50px] outline-offset-[-0.50px] ${
                      isActive
                        ? 'bg-yellow-400 text-black font-semibold outline-yellow-400 shadow-sm'
                        : 'bg-zinc-900 text-neutral-400 outline-zinc-300/20 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            {/* Recommendation Cards List */}
            <div className="flex flex-col gap-3">
              {filteredRecs.map((rec) => {
                const ActionIcon = rec.actionIcon;
                return (
                  <div
                    key={rec.id}
                    className="w-full bg-zinc-900 rounded-xl flex flex-col border border-white/5 overflow-hidden transition hover:border-white/15"
                  >
                    {/* Header Banner */}
                    <div
                      className={`w-full px-3 py-2 flex justify-between items-center ${rec.bannerBg}`}
                    >
                      <span className="text-sm font-medium font-['Inter'] leading-5">
                        {rec.category === 'Needs Attention' ? 'Need Attention' : rec.category === 'Regulars' ? 'Regular Customer' : rec.category}
                      </span>
                      <span className="text-neutral-400 text-sm font-medium font-['Inter'] leading-5">
                        {rec.table}
                      </span>
                    </div>

                    {/* Recommendation Body Text */}
                    <div className="p-3 flex flex-col gap-3">
                      <p className="text-neutral-200 text-sm font-normal font-['Inter'] leading-5">
                        {rec.text}
                      </p>

                      {/* Action Button */}
                      <button
                        onClick={() => handleActionClick(rec)}
                        className="w-full h-10 px-3 bg-neutral-800 hover:bg-neutral-750 active:bg-neutral-700 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center justify-center gap-2 text-orange-50 text-sm font-medium font-['Inter'] leading-5 transition cursor-pointer"
                      >
                        <ActionIcon className="w-4 h-4 text-orange-50" />
                        <span>{rec.actionLabel}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Chat Box matching Figma */}
          <div className="px-5 pt-3 pb-2 flex flex-col gap-3">
            <div className="w-full p-3.5 bg-stone-950 rounded-xl border border-white/10 flex flex-col gap-3">
              {/* Chat Messages */}
              <div className="flex flex-col gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-tr-[10px] rounded-bl-[10px] text-sm leading-5 max-w-[85%] border ${
                        msg.sender === 'user'
                          ? 'bg-stone-900 border-neutral-700 text-white font-semibold'
                          : 'bg-yellow-950/70 border-yellow-800/40 text-stone-100 font-normal'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="px-3 py-1.5 bg-yellow-950/50 border border-yellow-800/30 rounded-xl text-xs text-yellow-300 animate-pulse">
                      JARVIS is thinking...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Field with Attachment and Send button */}
              <form
                onSubmit={handleSendMessage}
                className="w-full p-2.5 bg-neutral-800 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-yellow-950/60 flex items-center justify-between gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask anything ..."
                  className="flex-1 bg-transparent px-2 text-sm text-white placeholder:text-zinc-400 font-['Inter'] focus:outline-none"
                />

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toast.info('File attachment uploaded to copilot context')}
                    className="p-1.5 text-zinc-400 hover:text-white transition cursor-pointer"
                    title="Attach notes"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="submit"
                    className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition cursor-pointer text-yellow-400 active:scale-95"
                    title="Send message"
                  >
                    <Send className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
  );

  if (inShell) {
    return jarvisContent;
  }

  return (
    <div className="w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 font-sans selection:bg-amber-400 selection:text-black">
      <div className="w-full max-w-[420px] min-h-screen sm:min-h-[868px] sm:max-h-[94vh] sm:rounded-[36px] bg-black relative flex flex-col justify-between overflow-hidden sm:border sm:border-white/10 sm:shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        <div className="flex-1 overflow-y-auto pb-28 custom-scrollbar relative">
          <div className="w-full h-14 px-6 flex items-center justify-between z-30 select-none text-white font-['SF_Pro',-apple-system,sans-serif] shrink-0 sticky top-0 bg-black/90 backdrop-blur-md border-b border-white/5">
            <span className="text-[15px] font-semibold tracking-tight">9:41</span>
          </div>
          {jarvisContent}
        </div>
        <BottomDock
          activeTab="jarvis"
          onNavigateTab={onNavigateTab}
          showFloorLabel={true}
        />
      </div>
    </div>
  );
}
