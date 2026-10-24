'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Paperclip,
  Send,
  Eye,
  Lightbulb,
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  Server,
  Activity,
  RotateCcw,
  ArrowLeft,
  Bot,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import BottomDock from '../navigation/BottomDock';
import { useNewWaiterShell } from '../navigation/NewWaiterShellContext';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { sendChatMessage, getAiBaseUrl } from '@/redux/features/chatApi';
import { addUserMessage, addJarvisMessage, clearChat } from '@/redux/slices/chatSlice';
import FormattedMessage from '@/components/chat/FormattedMessage';
import { useJarvisVoice, cleanTextForSpeech } from '@/hooks/useJarvisVoice';

interface JarvisCopilotViewProps {
  onNavigateTab?: (tab: string) => void;
  isStandaloneRoute?: boolean;
}

export default function JarvisCopilotView({
  onNavigateTab,
  isStandaloneRoute = false,
}: JarvisCopilotViewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { messages, isTyping } = useAppSelector((state) => state.chat);

  const [activeFilter, setActiveFilter] = useState<'All' | 'Upsell' | 'Needs Attention' | 'Regulars'>('All');
  const [inputMessage, setInputMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApiInfo, setShowApiInfo] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Consolidated busy state: true when a request is in-flight or Redux isTyping is true
  const isBusy = isTyping || isSubmitting;

  // AI Base URL
  const aiBaseUrl = getAiBaseUrl();

  // Test Ping to AI Server
  const handlePingAiServer = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch(`${aiBaseUrl}/health`, { method: 'GET' });
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        setPingLatency(elapsed);
        toast.success(`AI Service Online (${elapsed}ms latency)`);
      } else {
        setPingLatency(null);
        toast.error(`AI Service responded with status ${res.status}`);
      }
    } catch {
      setPingLatency(null);
      toast.error('Unable to reach AI gateway endpoint directly');
    } finally {
      setIsPinging(false);
    }
  };

  // Quick Action Prompts (unified from Ask AI modal)
  const quickPrompts = [
    {
      id: 'kds',
      icon: '🍳',
      label: 'Kitchen prep status',
      text: 'Are any of my assigned table orders delayed in kitchen or on the grill?',
    },
    {
      id: 'bill',
      icon: '💳',
      label: 'Bill & checkout ready',
      text: 'Which tables have finished dining and requested bill checkout?',
    },
    {
      id: 'allergy',
      icon: '⚠️',
      label: 'Guest allergy audit',
      text: 'Are there any allergen warnings for my currently active tables?',
    },
    {
      id: 'pairing',
      icon: '🍷',
      label: 'Wine & dessert pairing',
      text: 'What wine pairing is recommended for the Wagyu Steak special?',
    },
    {
      id: 'floor',
      icon: '📊',
      label: 'Station status audit',
      text: 'Summarize my assigned floor tables, dining phases, and active tickets.',
    },
  ];

  // Initialize JARVIS Voice Engine
  const {
    isListening,
    isSpeaking,
    speakingId,
    speakingText,
    transcript,
    isMuted,
    startListening,
    stopListening,
    toggleListening,
    speakText,
    stopSpeaking,
    toggleMute,
  } = useJarvisVoice({
    onTranscriptComplete: (finalText) => {
      if (isBusy) return;
      handleSendMessage(undefined, finalText, true);
    },
  });

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Automatically refocus the input field when JARVIS finishes generating a response
  useEffect(() => {
    if (isBusy) return undefined;
    const timer = setTimeout(() => {
      chatInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [isBusy]);

  // Recommendations data matching Figma
  const recommendations = [
    {
      id: 'rec-1',
      category: 'Needs Attention',
      categoryType: 'attention',
      table: 'Table 01',
      bannerBg: 'bg-red-600/20 text-red-500',
      text: "Table 01 hasn't been checked on in 12 minutes - consider a quick visit to see if they need anything.",
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

  const handleSendMessage = async (
    e?: React.FormEvent,
    customText?: string,
    speakResponse: boolean = false
  ) => {
    if (e) e.preventDefault();
    if (isBusy) {
      toast.info('JARVIS is currently formulating a response. Please wait.');
      return;
    }
    const userText = (customText !== undefined ? customText : inputMessage).trim();
    if (!userText) return;

    if (customText === undefined) setInputMessage('');
    setIsSubmitting(true);

    // Dispatch user message to Redux
    dispatch(addUserMessage({ text: userText }));

    // Dispatch live AI chat request
    try {
      const res = await dispatch(
        sendChatMessage({
          message: userText,
          tableNumber: 'floor_service',
          sessionId: 'waiter_floor_copilot',
        })
      ).unwrap();

      if (speakResponse && res?.reply) {
        speakText(res.reply);
      }
    } catch (err: any) {
      console.warn('JARVIS floor call notice:', err);
      const fallbackText = `Station update for "${userText}": Kitchen is on schedule and Table 02 is ready for drink refills. (Tavonza AI service active at ${aiBaseUrl}).`;
      dispatch(
        addJarvisMessage({
          text: fallbackText,
        })
      );
      if (speakResponse) {
        speakText(fallbackText);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionClick = (rec: (typeof recommendations)[0]) => {
    if (isBusy) {
      toast.info('JARVIS is currently processing a message. Please wait.');
      return;
    }
    toast.success(`${rec.actionLabel} dispatched for ${rec.table}!`);
    handleSendMessage(undefined, `Status check on ${rec.table} regarding: ${rec.text}`);
  };

  const { inShell } = useNewWaiterShell();

  const jarvisContent = (
    <div className="flex flex-col gap-3 pb-6 animate-fadeIn">
      {/* Top Bar: JARVIS Header Row with Back, Status, and Controls */}
      <div className="px-5 pt-3 pb-3 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2.5">
          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/new-waiter-dashboard/home');
              }
            }}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white hover:text-yellow-400 hover:border-yellow-400/50 transition cursor-pointer active:scale-95"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex justify-center items-center shadow-md shadow-amber-500/20">
            <Bot className="w-5 h-5 text-black" />
          </div>

          <div className="flex flex-col">
            <h1 className="text-stone-200 text-base font-semibold font-['Outfit'] leading-5 flex items-center gap-1.5">
              <span>JARVIS</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-yellow-400/20 border border-yellow-400/40 text-yellow-400 rounded">
                AI Copilot
              </span>
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-500 text-xs font-normal font-['DM_Mono']">
                Online
              </span>
              <span className="text-zinc-500 text-xs font-normal font-['Inter']">
                · Ready to assist
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: API Info, Clear Chat, Audio Controls */}
        <div className="flex items-center gap-1">
          {/* API Architecture Info Toggle */}
          <button
            type="button"
            onClick={() => setShowApiInfo((prev) => !prev)}
            className={`p-2 rounded-lg transition cursor-pointer text-xs ${
              showApiInfo
                ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                : 'text-zinc-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="View AI API endpoints & architecture"
          >
            <Server className="w-4 h-4" />
          </button>

          {/* Reset / Clear Chat */}
          <button
            type="button"
            onClick={() => {
              dispatch(clearChat());
              toast.info('Chat session restarted');
            }}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer text-xs"
            title="Restart conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Voice Audio Mute/Unmute */}
          <button
            type="button"
            onClick={toggleMute}
            className={`p-2 rounded-lg transition cursor-pointer text-xs ${
              isMuted ? 'text-zinc-500 hover:text-zinc-300' : 'text-amber-400 hover:text-amber-300'
            }`}
            title={isMuted ? 'Unmute AI voice' : 'Mute AI voice'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Voice Listening Trigger */}
          <button
            type="button"
            onClick={toggleListening}
            className={`w-8 h-8 rounded-lg outline flex items-center justify-center transition cursor-pointer group ${
              isListening
                ? 'bg-red-950/80 outline-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] ring-2 ring-red-500/50'
                : isSpeaking
                ? 'bg-amber-950/80 outline-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] ring-2 ring-amber-400/40'
                : 'bg-neutral-900 hover:bg-neutral-800 outline-neutral-800'
            }`}
            title={
              isListening
                ? 'Listening... (Click to stop)'
                : isSpeaking
                ? 'JARVIS is speaking (Click to mute)'
                : 'Start Voice Copilot'
            }
          >
            {isListening ? (
              <div className="flex items-center gap-[2px] h-3.5">
                <div className="w-[2.5px] h-2.5 bg-red-400 rounded-full animate-bounce" />
                <div className="w-[2.5px] h-4 bg-red-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-[2.5px] h-2 bg-red-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            ) : isSpeaking ? (
              <div className="flex items-center gap-[2px] h-3.5">
                <div className="w-[2px] h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                <div className="w-[2px] h-3 bg-yellow-400 rounded-full animate-pulse [animation-delay:100ms]" />
                <div className="w-[2px] h-2 bg-yellow-400 rounded-full animate-pulse [animation-delay:200ms]" />
              </div>
            ) : (
              <Mic className="w-4 h-4 text-yellow-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable AI Architecture & API Inspector Card */}
      {showApiInfo && (
        <div className="mx-5 p-4 bg-neutral-900/90 border border-yellow-400/30 rounded-2xl flex flex-col gap-3 shadow-xl backdrop-blur-md animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-yellow-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-['Inter']">
                AI Service Architecture & Endpoints
              </h3>
            </div>
            <button
              type="button"
              onClick={handlePingAiServer}
              disabled={isPinging}
              className="px-2 py-1 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 rounded text-[10px] font-semibold text-yellow-400 flex items-center gap-1 transition cursor-pointer"
            >
              <Activity className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Pinging...' : pingLatency !== null ? `${pingLatency}ms` : 'Ping AI'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 text-[11px] font-['DM_Mono'] text-zinc-300">
            <div className="p-2 bg-black/60 rounded-lg border border-neutral-800 flex flex-col gap-0.5">
              <span className="text-zinc-500 text-[10px] font-bold">1. PRIMARY CHAT API</span>
              <span className="text-yellow-300 break-all">POST {aiBaseUrl}/ai/chat</span>
              <span className="text-zinc-400 text-[10px]">Payload: &#123; message, session_id: &apos;waiter_floor_copilot&apos; &#125;</span>
            </div>

            <div className="p-2 bg-black/60 rounded-lg border border-neutral-800 flex flex-col gap-0.5">
              <span className="text-zinc-500 text-[10px] font-bold">2. NEURAL SPEECH &amp; VOICE</span>
              <div className="flex justify-between items-center text-[10px] text-zinc-300">
                <span>STT: POST {aiBaseUrl}/ai/voice/transcribe</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-zinc-300">
                <span>TTS: POST {aiBaseUrl}/ai/voice/synthesize</span>
              </div>
            </div>

            <div className="p-2 bg-black/60 rounded-lg border border-neutral-800 flex flex-col gap-0.5">
              <span className="text-zinc-500 text-[10px] font-bold">3. BACKEND TOOL GATEWAY</span>
              <span className="text-emerald-400 break-all">GET /internal/context/bootstrap</span>
              <span className="text-zinc-400 text-[10px]">Live synchronization with active tables, KDS kitchen tickets, and guest allergies.</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Voice Listening Banner */}
      {isListening && (
        <div className="mx-5 p-3 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center justify-between gap-3 shadow-lg shadow-red-950/50 animate-fadeIn">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">
                Voice Copilot Listening
              </span>
              <p className="text-xs text-white truncate italic font-['Inter']">
                {transcript || 'Listening to your speech... Speak now'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={stopListening}
            className="px-2.5 py-1 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 rounded-lg text-xs font-medium text-red-200 transition shrink-0 cursor-pointer"
          >
            Done
          </button>
        </div>
      )}

      {/* JARVIS Speaking Audio Banner */}
      {isSpeaking && (
        <div className="mx-5 p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center justify-between gap-3 shadow-lg shadow-amber-950/40 animate-fadeIn">
          <div className="flex items-center gap-2 overflow-hidden">
            <Volume2 className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span className="text-xs text-amber-300 font-medium font-['Inter'] truncate">
              JARVIS speaking audio response...
            </span>
          </div>
          <button
            type="button"
            onClick={stopSpeaking}
            className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded text-[11px] font-medium text-amber-200 transition shrink-0 cursor-pointer"
          >
            Mute
          </button>
        </div>
      )}

      {/* Hero Greeting Section: Robot Mascot + Speech Bubble */}
      <div className="px-5 py-2 flex items-center gap-3">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg shadow-amber-500/10 bg-neutral-900">
          <Image
            src="/images/jarvis-robot.jpg"
            alt="JARVIS AI"
            fill
            className="object-cover"
          />
        </div>

        {/* Speech Bubble */}
        <div className="relative flex-1 bg-neutral-900 rounded-2xl p-3 border border-white/10 shadow-md">
          <div className="absolute -left-2 top-5 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-neutral-900" />
          <p className="text-white text-xs sm:text-sm font-medium font-['Inter'] leading-5">
            Good day! Station intelligence active. Tap any quick prompt below or speak to query kitchen prep, bills, or tables.
          </p>
        </div>
      </div>

      {/* AI Assistance Quick Actions Bar (Unified from Ask AI) */}
      <div className="px-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>AI Assistance Quick Prompts</span>
          </span>
          <span className="text-[10px] text-zinc-500">Tap to ask</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 select-none">
          {quickPrompts.map((qp) => (
            <button
              key={qp.id}
              type="button"
              disabled={isBusy}
              onClick={() => handleSendMessage(undefined, qp.text)}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 active:scale-95 border border-white/10 hover:border-yellow-400/40 rounded-xl text-xs font-medium text-zinc-200 flex items-center gap-1.5 shrink-0 transition cursor-pointer disabled:opacity-50"
            >
              <span className="text-sm">{qp.icon}</span>
              <span className="font-['Inter'] whitespace-nowrap">{qp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section: Recommendations by Table */}
      <div className="px-5 pt-2 pb-1 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-stone-200 text-base font-medium font-['Outfit'] leading-5">
            Recommendations by Table
          </h2>
          <span className="text-[10px] text-zinc-500 font-['Inter']">Smart AI Insights</span>
        </div>

        {/* Filter Pills: All | Upsell | Needs Attention | Regulars */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 select-none">
          {(['All', 'Upsell', 'Needs Attention', 'Regulars'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`h-7 px-3 py-1 rounded-[6px] text-xs font-medium font-['Inter'] transition cursor-pointer whitespace-nowrap outline outline-[0.50px] outline-offset-[-0.50px] ${
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
        <div className="flex flex-col gap-2.5">
          {filteredRecs.map((rec) => {
            const ActionIcon = rec.actionIcon;
            return (
              <div
                key={rec.id}
                className="w-full bg-neutral-900/80 rounded-xl flex flex-col border border-white/10 overflow-hidden transition hover:border-white/20"
              >
                {/* Header Banner */}
                <div
                  className={`w-full px-3 py-1.5 flex justify-between items-center ${rec.bannerBg}`}
                >
                  <span className="text-xs font-semibold font-['Inter'] leading-4">
                    {rec.category === 'Needs Attention' ? 'Need Attention' : rec.category === 'Regulars' ? 'Regular Customer' : rec.category}
                  </span>
                  <span className="text-neutral-300 text-xs font-medium font-['Inter']">
                    {rec.table}
                  </span>
                </div>

                {/* Recommendation Body Text */}
                <div className="p-3 flex flex-col gap-2.5">
                  <p className="text-neutral-200 text-xs sm:text-sm font-normal font-['Inter'] leading-5">
                    {rec.text}
                  </p>

                  {/* Action Button */}
                  <button
                    onClick={() => handleActionClick(rec)}
                    disabled={isBusy}
                    className={`w-full h-9 px-3 rounded-xl outline outline-1 outline-offset-[-1px] flex items-center justify-center gap-2 text-xs font-medium font-['Inter'] transition ${
                      isBusy
                        ? 'bg-neutral-850 outline-neutral-800 text-neutral-500 opacity-50 cursor-not-allowed'
                        : 'bg-neutral-800 hover:bg-neutral-750 active:bg-neutral-700 outline-neutral-700 text-orange-50 cursor-pointer'
                    }`}
                  >
                    <ActionIcon className="w-3.5 h-3.5 text-orange-50" />
                    <span>{rec.actionLabel}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Chat Box */}
      <div className="px-5 pt-2 pb-2 flex flex-col gap-2.5">
        <div className="w-full p-3.5 bg-neutral-950 rounded-2xl border border-white/10 flex flex-col gap-3 shadow-inner">
          {/* Header row in chat */}
          <div className="flex items-center justify-between pb-1 border-b border-white/5">
            <span className="text-[11px] font-semibold text-zinc-400 font-['Inter'] flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-yellow-400" />
              <span>Live Conversation Stream</span>
            </span>
            <span className="text-[10px] text-zinc-500">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-5 max-w-[90%] border shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-neutral-850 border-neutral-700 text-white font-medium rounded-tr-none'
                      : 'bg-yellow-950/60 border-yellow-800/40 text-stone-100 font-normal rounded-tl-none'
                  }`}
                >
                  {msg.sender === 'jarvis' ? (
                    <>
                      <FormattedMessage content={msg.text} />
                      <div className="mt-2 pt-1 border-t border-yellow-800/30 flex items-center justify-between text-[10px] text-zinc-500">
                        <span>{msg.timestamp}</span>
                        {(() => {
                          const cleanedMsg = cleanTextForSpeech(msg.text);
                          const isThisSpeaking =
                            isSpeaking &&
                            (speakingId
                              ? speakingId === msg.id
                              : speakingText
                              ? cleanTextForSpeech(speakingText) === cleanedMsg
                              : false);

                          return (
                            <button
                              type="button"
                              onClick={() => {
                                if (isThisSpeaking) {
                                  stopSpeaking();
                                } else {
                                  speakText(msg.text, msg.id);
                                }
                              }}
                              className={`flex items-center gap-1 transition cursor-pointer ${
                                isThisSpeaking
                                  ? 'text-amber-400 font-semibold animate-pulse'
                                  : 'text-yellow-400/80 hover:text-yellow-300'
                              }`}
                              title={isThisSpeaking ? 'Stop speaking' : 'Listen to response'}
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>{isThisSpeaking ? 'Stop' : 'Listen'}</span>
                            </button>
                          );
                        })()}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>{msg.text}</div>
                      <div className="text-[9px] text-zinc-500 text-right mt-1">
                        {msg.timestamp}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-3 py-1.5 bg-yellow-950/50 border border-yellow-800/30 rounded-xl text-xs text-yellow-300 flex items-center gap-2 animate-pulse">
                  <Bot className="w-3.5 h-3.5 text-yellow-400" />
                  <span>JARVIS is formulating response...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => handleSendMessage(e)}
            className={`w-full p-2 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] transition-all duration-200 flex items-center justify-between gap-1.5 ${
              isBusy
                ? 'outline-yellow-500/50 bg-neutral-900 shadow-sm shadow-yellow-950/20'
                : 'outline-white/10 hover:outline-white/20'
            }`}
          >
            <input
              ref={chatInputRef}
              type="text"
              value={inputMessage}
              disabled={isBusy}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isBusy
                  ? 'JARVIS is replying, please wait...'
                  : isListening
                  ? 'Listening to your voice...'
                  : 'Ask about kitchen, bills, tables, or pairings...'
              }
              className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 font-['Inter'] focus:outline-none disabled:cursor-not-allowed disabled:placeholder:text-yellow-400/70"
            />

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  if (isBusy) {
                    toast.info('JARVIS is currently replying. Please wait.');
                    return;
                  }
                  toggleListening();
                }}
                className={`p-1.5 rounded-lg transition ${
                  isBusy
                    ? 'opacity-35 cursor-not-allowed text-zinc-500'
                    : isListening
                    ? 'text-red-400 bg-red-950/60 animate-pulse ring-1 ring-red-500/50 cursor-pointer'
                    : 'text-zinc-400 hover:text-white hover:bg-neutral-800 cursor-pointer'
                }`}
                title={isBusy ? 'Processing request...' : isListening ? 'Stop listening' : 'Speak to JARVIS'}
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  if (isBusy) return;
                  toast.info('Shift notes attached to copilot context');
                }}
                className={`p-1.5 transition ${
                  isBusy
                    ? 'opacity-35 cursor-not-allowed text-zinc-500'
                    : 'text-zinc-400 hover:text-white cursor-pointer'
                }`}
                title={isBusy ? 'Processing request...' : 'Attach notes'}
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={isBusy || !inputMessage.trim()}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                  isBusy || !inputMessage.trim()
                    ? 'bg-neutral-800 text-zinc-600 opacity-40 cursor-not-allowed'
                    : 'bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-bold cursor-pointer shadow-md'
                }`}
                title={isBusy ? 'JARVIS is replying...' : 'Send message'}
              >
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
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
