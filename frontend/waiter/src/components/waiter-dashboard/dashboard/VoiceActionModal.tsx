'use client';

import React, { useState } from 'react';
import { Mic, X, CornerDownRight, CheckCircle2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

export interface VoiceActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  text: string;
  actionMessage: string;
}

const SUGGESTED_COMMANDS: CommandItem[] = [
  {
    id: 'cmd-1',
    text: 'Serve Order #10582 to Table 12',
    actionMessage: 'Order #10582 marked as served to Table 12.',
  },
  {
    id: 'cmd-2',
    text: 'Request bill for Table 15',
    actionMessage: 'Bill request sent to cashier for Table 15.',
  },
  {
    id: 'cmd-3',
    text: "What's ready to serve right now?",
    actionMessage: '2 orders ready at Kitchen Station 1: Table 4 & Table 12.',
  },
  {
    id: 'cmd-4',
    text: 'Mark Table 6 as available',
    actionMessage: 'Table 6 status updated to Available on Floor Plan.',
  },
  {
    id: 'cmd-5',
    text: 'Check on Table 8',
    actionMessage: 'Table 8 timer reset. Guest requested fresh water.',
  },
  {
    id: 'cmd-6',
    text: 'What should I prioritize next?',
    actionMessage: 'Priority 1: Deliver hot mains to Table 12 before they cool.',
  },
];

export default function VoiceActionModal({ isOpen, onClose }: VoiceActionModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [executedCommand, setExecutedCommand] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleMicToggle = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setExecutedCommand(null);

    // Simulate speech recognition listening and picking a command
    setTimeout(() => {
      setIsListening(false);
      const randomCmd = SUGGESTED_COMMANDS[Math.floor(Math.random() * SUGGESTED_COMMANDS.length)];
      if (randomCmd) {
        setExecutedCommand(randomCmd.text);
        toast.success(`Voice Recognized: "${randomCmd.text}"`);
      }
      setTimeout(() => {
        onClose();
        setExecutedCommand(null);
      }, 1200);
    }, 2400);
  };

  const handleExecuteCommand = (cmd: CommandItem) => {
    setExecutedCommand(cmd.text);
    toast.success(`Voice Action: ${cmd.actionMessage}`);
    setTimeout(() => {
      onClose();
      setExecutedCommand(null);
    }, 700);
  };

  return (
    <div
      className="fixed top-20 left-0 md:left-72 right-0 bottom-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-zinc-950/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching Figma */}
        <div className="px-5 py-3.5 border-b border-white/10 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
              <Mic className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div>
              <div className="text-slate-200 text-sm font-bold font-['DM_Sans'] leading-5">
                Voice Action
              </div>
              <div className="text-slate-500 text-[10px] font-normal font-['DM_Sans'] leading-4">
                Tap the mic or click a command below
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center">
          {/* Central Pulsing Mic Button matching Figma */}
          <div className="pb-6 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={handleMicToggle}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isListening
                  ? 'bg-amber-500/20 outline outline-4 outline-amber-500/60 scale-105 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
                  : 'bg-amber-500/10 outline outline-2 outline-offset-[-2px] outline-amber-500/30 hover:bg-amber-500/20 hover:scale-105 active:scale-95'
              }`}
            >
              {isListening && (
                <span className="absolute inset-0 rounded-full bg-amber-500/30 animate-ping" />
              )}
              <Mic
                className={`w-7 h-7 text-amber-500 transition-transform ${
                  isListening ? 'animate-pulse scale-110' : ''
                }`}
              />
            </button>

            {/* Listening Status Text */}
            <div className="mt-2.5 text-center">
              {isListening ? (
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold font-['DM_Sans'] animate-pulse">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listening... Speak your command</span>
                </div>
              ) : executedCommand ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold font-['DM_Sans']">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Executed: {executedCommand}</span>
                </div>
              ) : (
                <div className="text-slate-400 text-xs font-medium font-['DM_Sans']">
                  Tap mic to start voice listening
                </div>
              )}
            </div>
          </div>

          {/* Suggested Commands Section */}
          <div className="w-full flex flex-col items-start">
            <div className="text-white text-[10px] font-bold font-['DM_Sans'] uppercase leading-4 tracking-wide mb-2.5">
              Suggested commands
            </div>

            <div className="w-full space-y-1.5">
              {SUGGESTED_COMMANDS.map((cmd) => (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => handleExecuteCommand(cmd)}
                  className={`w-full px-3 py-2.5 rounded-xl border border-white/5 hover:border-amber-500/40 bg-zinc-900/60 hover:bg-amber-500/10 inline-flex items-center gap-3 transition-all cursor-pointer text-left group ${
                    executedCommand === cmd.text ? 'border-emerald-500/50 bg-emerald-500/10' : ''
                  }`}
                >
                  <CornerDownRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  <span className="text-gray-400 group-hover:text-white text-xs font-medium font-['DM_Sans'] leading-4">
                    {cmd.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
