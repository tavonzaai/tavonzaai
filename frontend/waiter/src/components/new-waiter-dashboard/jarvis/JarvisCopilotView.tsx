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
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import BottomDock from '../navigation/BottomDock';
import { useNewWaiterShell } from '../navigation/NewWaiterShellContext';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { sendChatMessage } from '@/redux/features/chatApi';
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
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Consolidated busy state: true when a request is in-flight or Redux isTyping is true
  const isBusy = isTyping || isSubmitting;

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
    if (isBusy) {
      return undefined;
    }
    const timer = setTimeout(() => {
      chatInputRef.current?.focus();
    }, 100);
    return () => {
      clearTimeout(timer);
    };
  }, [isBusy]);

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
      console.warn('JARVIS floor call error:', err);
      const fallbackText = `Station update for "${userText}": Kitchen is on schedule and Table 02 is ready for drink refills. (Live service note: Ensure AI service is running on port 8000).`;
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
    toast.success(`${rec.actionLabel} dispatched for ${rec.table}!`, {
      description: rec.text,
    });
    handleSendMessage(undefined, `Status check on ${rec.table} regarding: ${rec.text}`);
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

            {/* Voice Audio Controls */}
            <div className="flex items-center gap-1.5">
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

              <button
                type="button"
                onClick={toggleListening}
                className={`w-10 h-10 rounded-lg outline flex items-center justify-center transition cursor-pointer group ${
                  isListening
                    ? 'bg-red-950/80 outline-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] ring-2 ring-red-500/50'
                    : isSpeaking
                    ? 'bg-amber-950/80 outline-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] ring-2 ring-amber-400/40'
                    : 'bg-gray-900 hover:bg-gray-800 outline-slate-800'
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
                  <div className="flex items-center gap-[2.5px] h-4">
                    <div className="w-[3px] h-3 bg-red-400 rounded-full animate-bounce" />
                    <div className="w-[3px] h-5 bg-red-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <div className="w-[3px] h-2.5 bg-red-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    <div className="w-[3px] h-4 bg-red-400 rounded-full animate-bounce [animation-delay:450ms]" />
                  </div>
                ) : isSpeaking ? (
                  <div className="flex items-center gap-[2.5px] h-4">
                    <div className="w-[2.5px] h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <div className="w-[2.5px] h-4 bg-yellow-400 rounded-full animate-pulse [animation-delay:100ms]" />
                    <div className="w-[2.5px] h-3 bg-yellow-400 rounded-full animate-pulse [animation-delay:200ms]" />
                    <div className="w-[2.5px] h-1.5 bg-yellow-400 rounded-full" />
                  </div>
                ) : (
                  <div className="flex items-center gap-[2.5px] h-4">
                    <div className="w-[2px] h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <div className="w-[2px] h-3 bg-yellow-400 rounded-full animate-pulse delay-75" />
                    <div className="w-[2px] h-4 bg-yellow-400 rounded-full animate-pulse delay-150" />
                    <div className="w-[2px] h-2.5 bg-yellow-400 rounded-full animate-pulse delay-100" />
                    <div className="w-[2px] h-1.5 bg-yellow-400 rounded-full" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Live Listening Banner */}
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

          {/* JARVIS Speaking Banner */}
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
                        disabled={isBusy}
                        className={`w-full h-10 px-3 rounded-xl outline outline-1 outline-offset-[-1px] flex items-center justify-center gap-2 text-sm font-medium font-['Inter'] leading-5 transition ${
                          isBusy
                            ? 'bg-neutral-850 outline-neutral-800 text-neutral-500 opacity-50 cursor-not-allowed'
                            : 'bg-neutral-800 hover:bg-neutral-750 active:bg-neutral-700 outline-neutral-700 text-orange-50 cursor-pointer'
                        }`}
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
              <div className="flex flex-col gap-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-tr-[10px] rounded-bl-[10px] text-sm leading-5 max-w-[88%] border ${
                        msg.sender === 'user'
                          ? 'bg-stone-900 border-neutral-700 text-white font-semibold'
                          : 'bg-yellow-950/70 border-yellow-800/40 text-stone-100 font-normal'
                      }`}
                    >
                      {msg.sender === 'jarvis' ? (
                        <>
                          <FormattedMessage content={msg.text} />
                          <div className="mt-2 pt-1 border-t border-yellow-800/30 flex items-center justify-end">
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
                                  className={`text-[11px] flex items-center gap-1 transition cursor-pointer ${
                                    isThisSpeaking
                                      ? 'text-amber-400 font-semibold animate-pulse'
                                      : 'text-yellow-400/80 hover:text-yellow-300'
                                  }`}
                                  title={isThisSpeaking ? "Stop speaking" : "Listen to response"}
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>{isThisSpeaking ? "Stop" : "Listen"}</span>
                                </button>
                              );
                            })()}
                          </div>
                        </>
                      ) : (
                        msg.text
                      )}
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
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Field with Attachment, Mic, and Send button */}
              <form
                onSubmit={(e) => handleSendMessage(e)}
                className={`w-full p-2.5 bg-neutral-800 rounded-[20px] outline outline-1 outline-offset-[-1px] transition-all duration-200 flex items-center justify-between gap-2 ${
                  isBusy
                    ? 'outline-yellow-500/50 bg-neutral-800/90 shadow-sm shadow-yellow-950/20'
                    : 'outline-yellow-950/60'
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
                      : 'Ask anything ...'
                  }
                  className="flex-1 bg-transparent px-2 text-sm text-white placeholder:text-zinc-400 font-['Inter'] focus:outline-none disabled:cursor-not-allowed disabled:placeholder:text-yellow-400/70"
                />

                <div className="flex items-center gap-1.5">
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
                        : 'text-zinc-400 hover:text-white hover:bg-neutral-700 cursor-pointer'
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
                      toast.info('File attachment uploaded to copilot context');
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
                        ? 'bg-zinc-800 text-zinc-600 opacity-40 cursor-not-allowed'
                        : 'bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-yellow-400 cursor-pointer'
                    }`}
                    title={isBusy ? 'JARVIS is replying...' : 'Send message'}
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
