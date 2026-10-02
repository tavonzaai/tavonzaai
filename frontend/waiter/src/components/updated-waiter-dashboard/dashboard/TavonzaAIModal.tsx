'use client';

import React, { useEffect, useState } from 'react';
import { Bot, Mic, Sparkles, X, Volume2, ArrowRight } from 'lucide-react';

interface TavonzaAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'chat' | 'voice' | 'report';
}

export default function TavonzaAIModal({
  isOpen,
  onClose,
  mode = 'chat',
}: TavonzaAIModalProps) {
  const [listening, setListening] = useState(mode === 'voice');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setListening(mode === 'voice');
  }, [mode]);

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

  return (
    <div
      className="fixed inset-0 new-dashbord-modal-backdrop bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] bg-[#16161a] border border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col space-y-5 relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold font-['Inter'] flex items-center gap-2">
                Tavonza AI Co-Pilot
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Live Voice & AI
                </span>
              </h3>
              <p className="text-zinc-400 text-xs font-normal">
                Autonomous station intelligence & recommendations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Insight Pill */}
        <div className="bg-[#1c1a16] border border-amber-500/20 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-amber-400 text-xs font-semibold flex items-center gap-1.5">
              <Bot className="w-4 h-4" />
              Live Operations Recommendation
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">Updated just now</span>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed">
            &ldquo;Michael, Table 12 has waited 14m past average for their second course. Kitchen line has prioritized their tickets. Table 8 is finished with mains—suggest the Valrhona Lava Cake paired with dessert wine.&rdquo;
          </p>
        </div>

        {/* Action Quick Prompts */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-400">Quick Voice Commands & Queries:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setMessage('Check ETA on Table 12 Wagyu Steaks')}
              className="p-2.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-left transition-colors flex items-center justify-between"
            >
              <span>Check Table 12 kitchen ETA</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
            </button>
            <button
              onClick={() => setMessage('Recommend pairing for Table 8')}
              className="p-2.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-left transition-colors flex items-center justify-between"
            >
              <span>Table 8 dessert pairings</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Voice listening status or text input */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
          <button
            onClick={() => setListening(!listening)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              listening
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40 animate-pulse'
                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
          >
            {listening ? <Volume2 className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={listening ? 'Listening to speech command...' : 'Type or speak question to Tavonza AI...'}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          {message && (
            <button
              onClick={() => setMessage('')}
              className="text-xs text-amber-400 hover:underline px-2"
            >
              Ask
            </button>
          )}
        </div>

        {/* Close / Action footer */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm rounded-xl transition-colors"
        >
          Dismiss AI Assistant
        </button>
      </div>
    </div>
  );
}
