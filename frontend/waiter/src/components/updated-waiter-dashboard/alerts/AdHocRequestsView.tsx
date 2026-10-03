'use client';

import React, { useState } from 'react';
import {
  Mic,
  Send,
  Sparkles,
  Droplets,
  Layers,
  Utensils,
  AlertTriangle,
  ShieldAlert,
  PhoneCall,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { SpeedPreset, AdHocRequest } from '../types';
import { initialSpeedPresets, initialAdHocRequests } from '../data';

interface AdHocRequestsViewProps {
  onShowToast: (message: string) => void;
}

const sampleSpeeches = [
  'Table 4 Spilled Wine on the Tablecloth, send busser Immediately.',
  'Table 2 allergy clarification: guest asking about peanuts in Chilean Sea Bass.',
  'Table 1 needs extra water refill and clean linen napkins.',
  'Table 3 requests restaurant manager to discuss reserve wine pairing.',
  'Table 6 requesting extra cutlery and parmesan cheese for pasta course.',
  'Table 8 main courses finished, guests requesting dessert menu & espresso.',
];

export default function AdHocRequestsView({ onShowToast }: AdHocRequestsViewProps) {
  const [selectedTableNum, setSelectedTableNum] = useState<number>(1);
  const [presets] = useState<SpeedPreset[]>(initialSpeedPresets);
  const [requestQueue, setRequestQueue] = useState<AdHocRequest[]>(initialAdHocRequests);
  const [speechInput, setSpeechInput] = useState<string>(
    'Table 4 Spilled Wine on the Tablecloth, send busser Immediately.'
  );
  const [speechIndex, setSpeechIndex] = useState<number>(0);

  // Cycle simulated speech prompts
  const handleSimulateSpeech = () => {
    const nextIdx = (speechIndex + 1) % sampleSpeeches.length;
    const text = sampleSpeeches[nextIdx] || '';
    setSpeechInput(text);
    onShowToast?.(`Simulated speech prompt: "${text}"`);
  };

  // Dispatch from Speed Preset click
  const handlePresetClick = (preset: SpeedPreset) => {
    const newReq: AdHocRequest = {
      id: `req-${Date.now()}`,
      tableName: `Table ${selectedTableNum}`,
      department: preset.department,
      priority: preset.priority,
      timestamp: 'Just Now',
      message: `${preset.title} requested by guest at Table ${selectedTableNum}. Dispatched to ${preset.department}.`,
      completed: false,
    };

    setRequestQueue((prev) => [newReq, ...prev]);
    onShowToast(`Dispatched "${preset.title}" for Table ${selectedTableNum} to ${preset.department}!`);
  };

  // Parse & Dispatch from NLP text input
  const handleParseAndDispatch = () => {
    if (!speechInput.trim()) return;

    // Detect Table from text
    const tableMatch = speechInput.match(/Table\s*(\d+)/i);
    const targetTable = tableMatch ? `Table ${tableMatch[1]}` : `Table ${selectedTableNum}`;

    // Detect department
    let dept: 'Kitchen' | 'Busser' | 'Manager' | 'Bar' = 'Busser';
    let priority: 'Normal' | 'High' | 'Urgent' = 'Normal';

    const lower = speechInput.toLowerCase();
    if (lower.includes('manager') || lower.includes('owner')) {
      dept = 'Manager';
      priority = 'Urgent';
    } else if (
      lower.includes('kitchen') ||
      lower.includes('allergy') ||
      lower.includes('bass') ||
      lower.includes('cook') ||
      lower.includes('condiment')
    ) {
      dept = 'Kitchen';
      priority = lower.includes('allergy') || lower.includes('immediately') ? 'Urgent' : 'High';
    } else if (lower.includes('spill') || lower.includes('napkin') || lower.includes('water')) {
      dept = 'Busser';
      priority = lower.includes('immediately') || lower.includes('spill') ? 'High' : 'Normal';
    }

    const newReq: AdHocRequest = {
      id: `req-${Date.now()}`,
      tableName: targetTable,
      department: dept,
      priority: priority,
      timestamp: 'Just Now',
      message: speechInput.trim(),
      completed: false,
    };

    setRequestQueue((prev) => [newReq, ...prev]);
    onShowToast(`AI parsed & routed request for ${targetTable} to ${dept} (${priority})!`);
  };

  // Mark request handled
  const handleMarkHandled = (reqId: string) => {
    setRequestQueue((prev) => prev.filter((r) => r.id !== reqId));
    onShowToast('Request marked as handled & archived from station queue!');
  };

  const pendingCount = requestQueue.filter((r) => !r.completed).length;

  return (
    <div className="space-y-6">
      {/* 1. Top Banner: Title & Auto-Routing Badge (From Figma) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[12px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-white text-xl sm:text-2xl font-semibold font-['Inter'] tracking-tight">
            Handle Ad-Hoc Customer Requests
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-bold font-['Inter'] mt-1">
            Quick-Tap Presets &amp; Tavonza AI Voice Parser
          </p>
        </div>

        <div className="px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-center gap-2 select-none self-start md:self-auto">
          <span className="text-white text-xs font-medium font-['Inter']">Routing:</span>
          <span className="text-amber-400 text-xs font-semibold font-['Inter']">
            Auto-Dispatch To KDS / BDS / Manager
          </span>
        </div>
      </div>

      {/* 2. Main Two-Column Grid: Presets & Parser on Left, Active Queue on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Table Selector, Presets & AI Parser */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Target Table Selector Box (From Figma) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-[12px] p-4 sm:p-5 shadow-sm space-y-3">
            <div className="text-slate-400 text-xs sm:text-sm font-medium font-['Inter']">
              Select Target Table :
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const isActive = selectedTableNum === num;
                return (
                  <button
                    key={num}
                    onClick={() => setSelectedTableNum(num)}
                    className={`h-9 px-4 rounded-[6px] font-semibold text-xs sm:text-sm font-['DM_Sans'] transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    Table-{num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speed Presets Box (From Figma) */}
          <div className="bg-zinc-900 border border-neutral-700/80 rounded-[12px] p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-sm sm:text-base font-medium font-['Inter']">
                Speed Presets For Table {selectedTableNum}
              </h3>
              <span className="text-xs text-zinc-400 font-normal">
                Tap preset to dispatch instant ticket
              </span>
            </div>

            {/* Presets Grid: 4 columns x 2 rows */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {presets.map((preset) => {
                // Determine icon
                let Icon = Utensils;
                if (preset.iconType === 'droplet') Icon = Droplets;
                if (preset.iconType === 'layers') Icon = Layers;
                if (preset.iconType === 'alert') Icon = AlertTriangle;
                if (preset.iconType === 'shield') Icon = ShieldAlert;
                if (preset.iconType === 'phone') Icon = PhoneCall;
                if (preset.iconType === 'zap') Icon = Flame;

                const isUrgent = preset.priority === 'Urgent';
                const isHigh = preset.priority === 'High';

                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    className="h-20 bg-neutral-900 hover:bg-neutral-800/90 active:scale-[0.98] border border-white/10 hover:border-amber-500/40 rounded-lg p-2.5 flex flex-col justify-between text-left transition-all group cursor-pointer shadow-sm"
                  >
                    <div className="flex items-start justify-between w-full">
                      <span className="text-white text-xs font-semibold font-['Inter'] line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {preset.title}
                      </span>
                      <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400 transition-colors shrink-0 ml-1" />
                    </div>

                    <div className="flex items-center justify-between w-full text-[10px] font-['Inter']">
                      <span className="text-neutral-400 capitalize">{preset.department}</span>
                      <span
                        className={`font-medium uppercase tracking-wider ${
                          isUrgent
                            ? 'text-red-400 font-bold'
                            : isHigh
                            ? 'text-amber-500 font-bold'
                            : 'text-amber-400'
                        }`}
                      >
                        {preset.priority}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* AI Natural Language Parser Container (From Figma) */}
            <div className="bg-black/60 border border-neutral-700/90 rounded-[10px] p-4 space-y-3 mt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-500 text-xs sm:text-sm font-medium font-['Inter']">
                    Tavonza AI Natural Language Parser
                  </span>
                </div>

                {/* Simulate Speech Action Button */}
                <button
                  onClick={handleSimulateSpeech}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded flex items-center gap-1.5 text-zinc-200 text-[11px] font-normal font-['Inter'] transition-colors cursor-pointer"
                >
                  <Mic className="w-3 h-3 text-amber-400" />
                  <span>Simulate Waiter Speech</span>
                </button>
              </div>

              {/* Input + Action row */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="flex-1 w-full bg-zinc-900 border border-neutral-700 rounded-[6px] px-3 py-2 flex items-center">
                  <input
                    type="text"
                    value={speechInput}
                    onChange={(e) => setSpeechInput(e.target.value)}
                    placeholder="E.g. Table 4 Spilled Wine on Tablecloth, send busser Immediately..."
                    className="w-full bg-transparent text-xs sm:text-sm text-zinc-200 placeholder-neutral-500 focus:outline-none font-['Inter']"
                  />
                </div>

                <button
                  onClick={handleParseAndDispatch}
                  className="w-full sm:w-auto h-9 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-semibold text-xs rounded-[6px] transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Parse &amp; Dispatch</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4-5 cols): Active Request Queue (From Figma) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-zinc-900 border border-white/20 rounded-[12px] p-4 sm:p-5 flex flex-col space-y-4 shadow-lg h-fit">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h3 className="text-white text-base font-medium font-['Inter']">
              Active Request Queue
            </h3>
            <span className="text-amber-500 text-xs font-semibold font-['Inter']">
              {pendingCount} Pending
            </span>
          </div>

          {/* Queue Items List */}
          <div className="space-y-3.5 max-h-[720px] overflow-y-auto pr-1">
            {requestQueue.length > 0 ? (
              requestQueue.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-950 border border-white/20 backdrop-blur-[10.20px] rounded-[10px] p-3.5 space-y-2.5 hover:border-white/40 transition-all group"
                >
                  {/* Top Row: Table Name, Dept & Timestamp */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 text-base font-semibold font-['Inter']">
                        {req.tableName}
                      </span>
                      <span className="px-2 py-0.5 bg-white/10 rounded text-white text-[9px] font-medium font-['DM_Sans'] uppercase tracking-wider">
                        {req.department}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 text-[9px] font-medium font-['DM_Sans'] uppercase">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{req.timestamp}</span>
                    </div>
                  </div>

                  {/* Message body */}
                  <p className="text-stone-300 text-xs font-medium font-['DM_Sans'] leading-relaxed">
                    {req.message}
                  </p>

                  {/* Mark Completed Button */}
                  <button
                    onClick={() => handleMarkHandled(req.id)}
                    className="w-full py-2 bg-green-500/10 hover:bg-green-500/20 active:scale-[0.99] border border-green-500/30 rounded-[6px] text-emerald-400 font-semibold text-xs font-['DM_Sans'] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Handled / Completed</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto" />
                <p className="text-zinc-400">All customer requests have been resolved!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
