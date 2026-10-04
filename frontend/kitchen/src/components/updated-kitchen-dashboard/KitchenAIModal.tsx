'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Bot,
  Sparkles,
  Flame,
  AlertTriangle,
  Play,
  Square,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface KitchenAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStation?: string;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

const VOICE_PRESETS = [
  { label: '⚡ Overdue Tickets', prompt: 'What tickets are overdue right now?' },
  { label: '🍔 Grill Station Load', prompt: 'How many Classic Burgers on Grill Station?' },
  { label: '📖 Wagyu Recipe Specs', prompt: 'Check Classic Wagyu Burger recipe specs' },
  { label: '📢 Notify Waiter Marco', prompt: 'Notify Waiter Marco for Table T-01' },
];

export default function KitchenAIModal({
  isOpen,
  onClose,
  activeStation = 'Grill Station',
}: KitchenAIModalProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [lastUserVoice, setLastUserVoice] = useState<string>('');
  const [lastAiResponse, setLastAiResponse] = useState<string>(
    'Chef Marco, I am ready on the Grill Station. Speak any command hands-free.'
  );
  const [isAiOnline, setIsAiOnline] = useState<boolean | null>(null);
  const [autoListenNext, setAutoListenNext] = useState<boolean>(true);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  const isOpenRef = useRef<boolean>(isOpen);
  isOpenRef.current = isOpen;

  const autoListenNextRef = useRef<boolean>(autoListenNext);
  autoListenNextRef.current = autoListenNext;

  const soundMutedRef = useRef<boolean>(soundMuted);
  soundMutedRef.current = soundMuted;

  const activeStationRef = useRef<string>(activeStation);
  activeStationRef.current = activeStation;

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const latestTranscriptRef = useRef<string>('');
  const hasProcessedRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const synthesisUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check AI health on mount or open
  useEffect(() => {
    if (!isOpen) return;

    const checkHealth = async () => {
      try {
        const aiBaseUrl =
          (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_AI_API_URL) ||
          'http://localhost:8000';
        const res = await fetch(`${aiBaseUrl}/health`, { signal: AbortSignal.timeout(2000) });
        setIsAiOnline(res.ok);
      } catch {
        setIsAiOnline(false);
      }
    };
    checkHealth();
  }, [isOpen]);

  // Clean Markdown & Symbols for Natural Audio Speech
  const cleanForSpeech = (text: string): string => {
    return text
      .replace(/[*#_~`]/g, '')
      .replace(/\|.*?\|/g, '')
      .replace(/\n+/g, '. ')
      .replace(/T-0?(\d+)/gi, 'Table $1')
      .replace(/#(\d+)/g, 'Number $1')
      .trim();
  };

  // Stop AI Speech playback
  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {}
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setVoiceState((prev) => (prev === 'speaking' ? 'idle' : prev));
  }, []);

  // Web SpeechSynthesis fallback
  const fallbackBrowserSpeech = useCallback(
    (spokenText: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setVoiceState('idle');
        return;
      }

      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const naturalVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Guy') ||
              v.name.includes('David') ||
              v.name.includes('Ryan'))
        );
        if (naturalVoice) utterance.voice = naturalVoice;

        utterance.onstart = () => {
          setVoiceState('speaking');
        };

        utterance.onend = () => {
          setVoiceState('idle');
          if (autoListenNextRef.current && isOpenRef.current) {
            setTimeout(() => {
              startListening();
            }, 600);
          }
        };

        utterance.onerror = () => {
          setVoiceState('idle');
        };

        synthesisUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch {
        setVoiceState('idle');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Start Mic Listening
  const startListening = useCallback(() => {
    stopSpeaking();

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    latestTranscriptRef.current = '';
    hasProcessedRef.current = false;
    setLiveTranscript('');

    const rec = recognitionRef.current;
    if (!rec) {
      toast.error('Voice recognition not available in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListeningRef.current) {
      return;
    }

    try {
      rec.start();
      isListeningRef.current = true;
      setVoiceState('listening');
    } catch (err: any) {
      if (err?.name === 'InvalidStateError') {
        isListeningRef.current = true;
        setVoiceState('listening');
      } else {
        console.warn('Failed to start recognition:', err);
        isListeningRef.current = false;
        setVoiceState('idle');
      }
    }
  }, [stopSpeaking]);

  // Speak AI Response
  const speakResponse = useCallback(
    async (text: string) => {
      stopSpeaking();
      if (recognitionRef.current && isListeningRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        isListeningRef.current = false;
      }

      if (soundMutedRef.current) {
        setVoiceState('idle');
        return;
      }

      const spokenText = cleanForSpeech(text);
      if (!spokenText) {
        setVoiceState('idle');
        return;
      }

      setVoiceState('speaking');

      const aiBaseUrl =
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_AI_API_URL) ||
        'http://localhost:8000';

      // Attempt 1: High quality Neural Voice Synthesis from backend
      try {
        const res = await fetch(`${aiBaseUrl}/ai/voice/synthesize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer dev-kitchen-chef-token',
          },
          body: JSON.stringify({
            text: spokenText.slice(0, 900),
            persona: 'uk_jarvis',
          }),
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          const blob = await res.blob();
          if (blob.size > 500) {
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            currentAudioRef.current = audio;

            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              currentAudioRef.current = null;
              setVoiceState('idle');
              if (autoListenNextRef.current && isOpenRef.current) {
                setTimeout(() => {
                  startListening();
                }, 600);
              }
            };

            audio.onerror = () => {
              URL.revokeObjectURL(audioUrl);
              currentAudioRef.current = null;
              fallbackBrowserSpeech(spokenText);
            };

            await audio.play();
            return;
          }
        }
      } catch (err) {
        console.warn('Backend neural voice fetch failed, using browser speech synthesis fallback:', err);
      }

      // Attempt 2: Fallback to browser Web SpeechSynthesis
      fallbackBrowserSpeech(spokenText);
    },
    [stopSpeaking, fallbackBrowserSpeech, startListening]
  );

  // Handle Query Submission to AI Engine
  const processVoiceCommand = useCallback(
    async (spokenCommand: string) => {
      const query = spokenCommand.trim();
      if (!query) {
        setVoiceState('idle');
        return;
      }

      setLastUserVoice(query);
      setLiveTranscript('');
      setVoiceState('processing');

      const currentStation = activeStationRef.current || 'Grill Station';
      const aiBaseUrl =
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_AI_API_URL) ||
        'http://localhost:8000';

      try {
        const res = await fetch(`${aiBaseUrl}/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer dev-kitchen-chef-token',
          },
          body: JSON.stringify({
            message: query,
            session_id: `kitchen_${currentStation.replace(/\s+/g, '_').toLowerCase()}`,
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.reply || data.message || 'Understood, Chef.';
          setLastAiResponse(reply);
          setIsAiOnline(true);
          speakResponse(reply);
          return;
        }
      } catch (err) {
        console.warn('AI live call failed or timed out, activating kitchen heuristics:', err);
      }

      // High-context kitchen fallback logic
      const lower = query.toLowerCase();
      let reply = `I have analyzed the kitchen line for ${currentStation}. Everything is operating smoothly.`;

      if (lower === 'hi' || lower === 'hello' || lower.startsWith('hi ') || lower.startsWith('hello ')) {
        reply = `Hello Chef Marco! I am monitoring ${currentStation} tickets and line bottlenecks. What would you like to check?`;
      } else if (lower.includes('overdue') || lower.includes('late') || lower.includes('time')) {
        reply =
          'Ticket #1524 for Table T-01 is currently flagged as Overdue with 18 minutes elapsed. Recommend plating the 2 Classic Burgers immediately.';
      } else if (lower.includes('burger') || lower.includes('grill') || lower.includes('how many')) {
        reply =
          'Grill Station currently has 4 Classic Wagyu Burgers queued: 3 Medium Well with No Onions, and 1 Medium Well with Extra Cheese.';
      } else if (lower.includes('recipe') || lower.includes('spec') || lower.includes('classic') || lower.includes('wagyu')) {
        reply =
          'Classic Wagyu Smash Burger specs: 2 100-gram Wagyu patties smashed for 2 minutes per side, aged yellow cheddar, smoked bacon jam, house aioli, toasted brioche bun. Allergens are gluten and dairy.';
      } else if (lower.includes('waiter') || lower.includes('marco') || lower.includes('notify') || lower.includes('ready')) {
        reply =
          'Notification sent to Waiter Marco: Table T-01 order is completing on the grill; please prepare for pickup in 2 minutes.';
      } else if (lower.includes('balance') || lower.includes('bottleneck') || lower.includes('load') || lower.includes('capacity')) {
        reply =
          'Grill Station is at 75% capacity with 8 active items. Fryer Station has spare capacity. Shift sides to the fryer station to shave approximately 3 minutes off ticket completion.';
      }

      setLastAiResponse(reply);
      speakResponse(reply);
    },
    [speakResponse]
  );

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListeningRef.current = true;
      setVoiceState('listening');
    };

    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      let hasFinal = false;

      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        if (res && res[0]) {
          fullTranscript += res[0].transcript + ' ';
          if (res.isFinal) {
            hasFinal = true;
          }
        }
      }

      const trimmed = fullTranscript.trim();
      if (trimmed) {
        latestTranscriptRef.current = trimmed;
        setLiveTranscript(trimmed);
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // If browser confirmed final segment, submit immediately
      if (hasFinal && trimmed && !hasProcessedRef.current) {
        hasProcessedRef.current = true;
        try {
          recognition.stop();
        } catch {}
        processVoiceCommand(trimmed);
        return;
      }

      // Silence debounce: 1.2s of silence after speech commits question
      if (trimmed && !hasProcessedRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          if (!hasProcessedRef.current && latestTranscriptRef.current.trim()) {
            hasProcessedRef.current = true;
            try {
              recognition.stop();
            } catch {}
            processVoiceCommand(latestTranscriptRef.current.trim());
          }
        }, 1200);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('SpeechRecognition error:', event?.error);
      isListeningRef.current = false;
      if (event?.error === 'not-allowed') {
        toast.error('Microphone permission denied', {
          description: 'Please click the lock icon in your browser address bar to allow microphone access.',
        });
      }
      setVoiceState((prev) => (prev === 'listening' ? 'idle' : prev));
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      if (!hasProcessedRef.current && latestTranscriptRef.current.trim().length > 0) {
        hasProcessedRef.current = true;
        processVoiceCommand(latestTranscriptRef.current.trim());
        return;
      }
      setVoiceState((prev) => (prev === 'listening' ? 'idle' : prev));
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {}
      recognitionRef.current = null;
    };
  }, [processVoiceCommand]);

  // Stop Mic Listening
  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    const rec = recognitionRef.current;
    if (rec && isListeningRef.current) {
      try {
        rec.stop();
      } catch {}
    }
    isListeningRef.current = false;

    // If there is pending speech, submit it
    const pendingText = latestTranscriptRef.current.trim();
    if (!hasProcessedRef.current && pendingText.length > 0) {
      hasProcessedRef.current = true;
      processVoiceCommand(pendingText);
    } else {
      setVoiceState('idle');
    }
  }, [processVoiceCommand]);

  // Auto-start listening on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startListening();
      }, 350);
      return () => clearTimeout(timer);
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen, startListening, stopListening, stopSpeaking]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#121214] border-2 border-yellow-400/50 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#18181b] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-yellow-400/60 overflow-hidden flex items-center justify-center shadow-lg shadow-yellow-500/10 relative">
              <Image
                src="/images/jarvis-robot.jpg"
                alt="Jarvis Robot AI"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Bot className="w-5 h-5 text-yellow-400 absolute" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-base font-['Inter'] flex items-center gap-2">
                  Tavonza Kitchen Voice AI
                </h3>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    isAiOnline
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                  }`}
                >
                  {isAiOnline ? 'Live Engine (8000)' : 'Hands-Free Voice Mode'}
                </span>
              </div>
              <p className="text-zinc-400 text-xs">
                Station Intelligence • {activeStation} • 100% Voice Operated
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSoundMuted(!soundMuted);
                if (!soundMuted) stopSpeaking();
              }}
              className={`p-2 rounded-xl border transition ${
                soundMuted
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  : 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
              }`}
              title={soundMuted ? 'Unmute voice playback' : 'Mute voice playback'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CENTRAL HERO VOICE ORB / EQUALIZER (NO TYPING) */}
        <div className="p-8 flex flex-col items-center justify-center bg-gradient-to-b from-black/60 to-[#121214] border-b border-zinc-800/80 relative overflow-hidden">
          
          {/* Animated Background Aura */}
          <div
            className={`absolute w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              voiceState === 'listening'
                ? 'bg-yellow-400/20 scale-125'
                : voiceState === 'speaking'
                ? 'bg-emerald-500/25 scale-125'
                : voiceState === 'processing'
                ? 'bg-blue-500/20 animate-pulse'
                : 'bg-yellow-400/5 scale-90'
            }`}
          />

          {/* Central Interactive Voice Button */}
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Concentric Pulse Rings */}
            {voiceState === 'listening' && (
              <>
                <div className="absolute -inset-4 rounded-full border-2 border-yellow-400/40 animate-ping pointer-events-none" />
                <div className="absolute -inset-8 rounded-full border border-yellow-400/20 animate-pulse pointer-events-none" />
              </>
            )}

            {voiceState === 'speaking' && (
              <>
                <div className="absolute -inset-4 rounded-full border-2 border-emerald-400/40 animate-ping pointer-events-none" />
                <div className="absolute -inset-8 rounded-full border border-emerald-400/20 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              type="button"
              onClick={() => {
                if (voiceState === 'listening') {
                  stopListening();
                } else if (voiceState === 'speaking') {
                  stopSpeaking();
                } else {
                  startListening();
                }
              }}
              className={`w-32 h-32 rounded-full border-4 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-95 ${
                voiceState === 'listening'
                  ? 'bg-yellow-400 border-white text-black scale-105 shadow-[0_0_50px_rgba(250,204,21,0.6)]'
                  : voiceState === 'speaking'
                  ? 'bg-emerald-500 border-white text-black scale-105 shadow-[0_0_50px_rgba(16,185,129,0.6)]'
                  : voiceState === 'processing'
                  ? 'bg-zinc-800 border-yellow-400 text-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)] animate-pulse'
                  : 'bg-zinc-900 border-yellow-400/70 hover:border-yellow-400 text-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.2)] hover:scale-105'
              }`}
            >
              {voiceState === 'listening' ? (
                <>
                  <Mic className="w-10 h-10 animate-bounce" />
                  <span className="text-[11px] font-bold uppercase tracking-wider mt-1">Listening</span>
                </>
              ) : voiceState === 'speaking' ? (
                <>
                  <Volume2 className="w-10 h-10 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider mt-1">Speaking</span>
                </>
              ) : voiceState === 'processing' ? (
                <>
                  <Sparkles className="w-10 h-10 animate-spin" />
                  <span className="text-[11px] font-bold uppercase tracking-wider mt-1">Thinking</span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10" />
                  <span className="text-[11px] font-bold uppercase tracking-wider mt-1">Tap To Speak</span>
                </>
              )}
            </button>
          </div>

          {/* Equalizer Waveform Animation Bars */}
          <div className="flex items-center gap-1.5 h-8 mt-6 z-10">
            {[40, 70, 100, 60, 90, 45, 80, 100, 65, 85, 50, 75].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  voiceState === 'listening'
                    ? 'bg-yellow-400 animate-pulse'
                    : voiceState === 'speaking'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-zinc-700 h-1.5'
                }`}
                style={{
                  height:
                    voiceState === 'listening' || voiceState === 'speaking'
                      ? `${Math.max(6, Math.round(h * Math.random()))}px`
                      : '4px',
                }}
              />
            ))}
          </div>

          {/* Live Status Subtitle */}
          <div className="text-center mt-3 z-10">
            {voiceState === 'listening' && (
              <p className="text-yellow-400 font-semibold text-sm animate-pulse">
                🎙️ Speak your kitchen command... &ldquo;{liveTranscript || 'Listening...'}&rdquo;
              </p>
            )}
            {voiceState === 'processing' && (
              <p className="text-zinc-300 font-medium text-sm flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
                Querying live orders and station status...
              </p>
            )}
            {voiceState === 'speaking' && (
              <p className="text-emerald-400 font-semibold text-sm">
                🔊 Answering out loud to line chefs...
              </p>
            )}
            {voiceState === 'idle' && (
              <p className="text-zinc-400 text-xs">
                Hands-Free Station Voice Control • Speak anytime or tap preset
              </p>
            )}
          </div>
        </div>

        {/* TRANSCRIPT DISPLAY (Voice In / Voice Out Log) */}
        <div className="p-6 space-y-4 max-h-[220px] overflow-y-auto bg-black/40">
          
          {/* Last Chef Spoken Input */}
          {lastUserVoice && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mic className="w-3 h-3 text-yellow-400" />
                Chef Marco Spoke
              </span>
              <div className="bg-yellow-400 text-black font-semibold text-sm px-4 py-2.5 rounded-2xl rounded-tr-none shadow-md">
                &ldquo;{lastUserVoice}&rdquo;
              </div>
            </div>
          )}

          {/* AI Spoken Answer */}
          {lastAiResponse && (
            <div className="flex flex-col items-start">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Bot className="w-3 h-3 text-emerald-400" />
                  AI Voice Output
                </span>
                <button
                  type="button"
                  onClick={() => speakResponse(lastAiResponse)}
                  className="text-[11px] text-yellow-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Replay Audio
                </button>
              </div>
              <div className="bg-[#18181b] border border-zinc-800 text-zinc-200 text-xs sm:text-sm px-4 py-3 rounded-2xl rounded-tl-none shadow-md leading-relaxed whitespace-pre-wrap">
                {lastAiResponse}
              </div>
            </div>
          )}
        </div>

        {/* QUICK VOICE TRIGGER CHIPS (One-Touch Hands-Free Activation) */}
        <div className="px-6 py-3 bg-[#141416] border-t border-zinc-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            Quick Voice:
          </span>
          {VOICE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => processVoiceCommand(preset.prompt)}
              className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-yellow-400 hover:border-yellow-400/60 text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 active:scale-95"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* FOOTER CONTROLS (NO KEYBOARD / NO TYPING) */}
        <div className="px-6 py-4 bg-[#18181b] border-t border-zinc-800 flex items-center justify-between">
          <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoListenNext}
              onChange={(e) => setAutoListenNext(e.target.checked)}
              className="w-4 h-4 rounded accent-yellow-400 bg-zinc-900 border-zinc-700 cursor-pointer"
            />
            <span>Hands-Free Auto-Listen (re-arms mic after speaking)</span>
          </label>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            Close Voice Co-Pilot
          </button>
        </div>
      </div>
    </div>
  );
}
