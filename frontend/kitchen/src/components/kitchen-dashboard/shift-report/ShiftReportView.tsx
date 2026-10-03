'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Printer,
  Download,
  Plus,
  X,
  ChefHat,
  Flame,
  Pizza,
  Zap,
  IceCream,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

export interface IncidentAlert {
  id: string;
  time: string;
  category: 'Inventory' | 'Station' | 'Order' | 'Equipment';
  categoryColor: string;
  timeColor: string;
  message: string;
}

export interface TeamMemberPerformance {
  id: string;
  name: string;
  station: string;
  stationType: 'grill' | 'pizza' | 'fry' | 'dessert';
  orders: number;
  accuracy: string;
  avatarColor: string;
  avatarInitials: string;
}

export default function ShiftReportView() {
  const [selectedShift, setSelectedShift] = useState<'AM' | 'PM' | 'Night'>('AM');
  const [selectedDate, setSelectedDate] = useState('Sunday, July 18, 2026');
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isLogIncidentOpen, setIsLogIncidentOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Chef Notes state
  const [chefNotes, setChefNotes] = useState<string[]>([
    'Excellent team coordination during peak lunch hours (12–1 PM).',
    'Grill station needs an additional chef during peak service — recommend scheduling.',
    'New burger assembly method reduced avg plating time by ~45 seconds.',
    'Mozzarella reorder approved — delivery scheduled for 4:30 PM.',
    'Consider pre-staging dessert components before dinner rush.',
  ]);

  // Incidents list
  const [incidents, setIncidents] = useState<IncidentAlert[]>([
    {
      id: 'inc-1',
      time: '07:42 AM',
      category: 'Inventory',
      categoryColor: 'text-yellow-500',
      timeColor: 'text-yellow-500',
      message: 'Mozzarella cheese below reorder threshold. Supplier contacted.',
    },
    {
      id: 'inc-2',
      time: '09:15 AM',
      category: 'Station',
      categoryColor: 'text-amber-500',
      timeColor: 'text-amber-500',
      message: 'Grill Station reached 90% capacity. Load balancing initiated.',
    },
    {
      id: 'inc-3',
      time: '11:58 AM',
      category: 'Order',
      categoryColor: 'text-red-400',
      timeColor: 'text-red-400',
      message: 'Order #10571 (BBQ Ribs) delayed by 11 min due to grill overload.',
    },
    {
      id: 'inc-4',
      time: '12:34 PM',
      category: 'Equipment',
      categoryColor: 'text-yellow-500',
      timeColor: 'text-yellow-500',
      message: 'Pizza oven temperature fluctuation — self-corrected within 2 min.',
    },
  ]);

  // Team performance list
  const teamPerformance: TeamMemberPerformance[] = [
    {
      id: 'chef-1',
      name: 'Marco R.',
      station: 'Grill Station',
      stationType: 'grill',
      orders: 52,
      accuracy: '99.1%',
      avatarColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
      avatarInitials: 'MR',
    },
    {
      id: 'chef-2',
      name: 'Sara M.',
      station: 'Pizza Station',
      stationType: 'pizza',
      orders: 38,
      accuracy: '98.7%',
      avatarColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      avatarInitials: 'SM',
    },
    {
      id: 'chef-3',
      name: 'Jin L.',
      station: 'Fry Station',
      stationType: 'fry',
      orders: 44,
      accuracy: '97.9%',
      avatarColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      avatarInitials: 'JL',
    },
    {
      id: 'chef-4',
      name: 'Priya N.',
      station: 'Dessert Station',
      stationType: 'dessert',
      orders: 32,
      accuracy: '99.6%',
      avatarColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
      avatarInitials: 'PN',
    },
    {
      id: 'chef-5',
      name: 'David K.',
      station: 'Grill Station',
      stationType: 'grill',
      orders: 20,
      accuracy: '98.5%',
      avatarColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      avatarInitials: 'DK',
    },
  ];

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setChefNotes((prev) => [...prev, newNoteText.trim()]);
    setNewNoteText('');
    setIsAddNoteOpen(false);
    toast.success('Shift note added successfully!');
  };

  const handleExportReport = () => {
    toast.info('Generating official Kitchen Shift Report PDF...');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER - Exact Title & Date from Figma                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight font-['Inter']">
            Shift Report
          </h1>
          <p className="text-zinc-500 text-base sm:text-lg font-normal font-['Inter'] mt-1">
            {selectedShift} Shift · {selectedDate}
          </p>
        </div>

        {/* Action Buttons: Shift Switcher & Export */}
        <div className="flex items-center gap-2.5">
          {/* Shift selector pills */}
          <div className="inline-flex rounded-lg border border-white/10 bg-zinc-900/80 p-0.5">
            {(['AM', 'PM', 'Night'] as const).map((shift) => (
              <button
                key={shift}
                onClick={() => setSelectedShift(shift)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  selectedShift === shift
                    ? 'bg-amber-500 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {shift}
              </button>
            ))}
          </div>

          {/* Add Note Button */}
          <button
            onClick={() => setIsAddNoteOpen(true)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-slate-200 text-sm font-medium rounded-md outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={handleExportReport}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm rounded-md flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TWO COLUMN LAYOUT (Matching Figma Structure)                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ======================================================================= */}
        {/* LEFT COLUMN (6/12): Shift Summary & Incidents & Alerts                  */}
        {/* ======================================================================= */}
        <div className="lg:col-span-6 space-y-5">
          {/* --------------------------------------------------------------------- */}
          {/* CARD A: Shift Summary (9 Metric Table Rows)                           */}
          {/* --------------------------------------------------------------------- */}
          <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/5 shadow-xl flex flex-col justify-start items-start">
            <div className="w-full flex items-center justify-between pb-1 border-b border-white/5">
              <h2 className="text-slate-200 text-base font-semibold font-['Inter'] leading-5">
                Shift Summary
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Live Audit Verified
              </span>
            </div>

            <div className="w-full pt-1.5 flex flex-col justify-start items-start divide-y divide-white/5 text-sm">
              {/* Row 1: Duration */}
              <div className="w-full py-3 flex justify-between items-center">
                <span className="text-neutral-400 font-normal font-['Inter']">Shift Duration</span>
                <span className="text-slate-200 font-medium font-['Inter']">
                  6:00 AM – 2:00 PM (8 hrs)
                </span>
              </div>

              {/* Row 2: Head Chef */}
              <div className="w-full py-3 flex justify-between items-center">
                <span className="text-neutral-400 font-normal font-['Inter']">Head Chef</span>
                <span className="text-slate-200 font-medium font-['Inter']">Chef Michael</span>
              </div>

              {/* Row 3: Team Size */}
              <div className="w-full py-3 flex justify-between items-center">
                <span className="text-neutral-400 font-normal font-['Inter']">Team Size</span>
                <span className="text-slate-200 font-medium font-['Inter']">6 Chefs</span>
              </div>

              {/* Row 4: Orders Completed */}
              <div className="w-full py-3 flex justify-between items-center">
                <span className="text-neutral-400 font-normal font-['Inter']">Orders Completed</span>
                <span className="text-slate-200 font-bold font-['Consolas'] text-base">186</span>
              </div>

              {/* Row 5: Orders Delayed */}
              <div className="w-full py-3 flex justify-between items-center">
                <span className="text-neutral-400 font-normal font-['Inter']">Orders Delayed</span>
                <span className="text-amber-400 font-bold font-['Consolas'] text-base">3</span>
              </div>

              {/* Row 6: Average Prep Time */}
              <div className="w-full py-3 flex justify-between items-center">
                <span className="text-neutral-400 font-normal font-['Inter']">Average Prep Time</span>
                <span className="text-slate-200 font-medium font-['Inter']">13 minutes</span>
              </div>

              {/* Row 7: Peak Hour */}
              <div className="w-full py-3 flex justify-between items-center">
                <span className="text-neutral-400 font-normal font-['Inter']">Peak Hour</span>
                <span className="text-slate-200 font-medium font-['Inter']">
                  12:00 PM – 1:00 PM (42 orders)
                </span>
              </div>

              {/* Row 8: Kitchen Efficiency */}
              <div className="w-full py-3 flex justify-between items-center">
                <span className="text-neutral-400 font-normal font-['Inter']">Kitchen Efficiency</span>
                <span className="text-emerald-400 font-bold font-['Consolas'] text-base">93%</span>
              </div>

              {/* Row 9: Order Accuracy */}
              <div className="w-full py-3 flex justify-between items-center">
                <span className="text-neutral-400 font-normal font-['Inter']">Order Accuracy</span>
                <span className="text-emerald-400 font-bold font-['Consolas'] text-base">98.6%</span>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* CARD B: Incidents & Alerts (Timeline Box from Figma)                  */}
          {/* --------------------------------------------------------------------- */}
          <div className="p-5 bg-slate-300/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/5 backdrop-blur-[10.20px] shadow-xl flex flex-col justify-start items-start">
            <div className="w-full flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="text-slate-200 text-base font-semibold font-['Inter'] leading-5">
                Incidents & Alerts
              </h2>
              <span className="text-xs text-zinc-400 font-medium">4 Logged Events</span>
            </div>

            <div className="w-full pt-3 space-y-2.5">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-3 bg-neutral-800/90 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/5 flex items-start gap-3 hover:bg-neutral-800 transition-colors"
                >
                  <div className="w-14 shrink-0 pt-0.5">
                    <span className={`${incident.timeColor} text-xs font-mono font-medium block leading-4`}>
                      {incident.time}
                    </span>
                  </div>

                  <div className="flex-1 text-sm leading-4">
                    <span className={`${incident.categoryColor} text-xs font-semibold font-['Inter'] mr-1.5`}>
                      [{incident.category}]
                    </span>
                    <span className="text-zinc-400 font-normal font-['Inter']">
                      {incident.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN (6/12): Performance Trend, Team Performance, Chef Notes    */}
        {/* ======================================================================= */}
        <div className="lg:col-span-6 space-y-5">
          {/* --------------------------------------------------------------------- */}
          {/* CARD C: Performance Trend (Area Line Chart matching screenshot)       */}
          {/* --------------------------------------------------------------------- */}
          <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-white text-lg font-semibold font-['Inter'] leading-9">
                Performance Trend
              </h2>
              <div className="flex items-center gap-1.5 text-sm text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Peak: 42 orders/hr</span>
              </div>
            </div>

            {/* SVG Wave Chart Container (Matching user screenshot) */}
            <div className="w-full pt-2">
              <div className="w-full h-32 relative rounded-md outline outline-[0.5px] outline-zinc-800 bg-black/40 overflow-hidden">
                {/* Dotted / Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-6 pointer-events-none">
                  <div className="border-r border-zinc-800/60 border-dashed" />
                  <div className="border-r border-zinc-800/60 border-dashed" />
                  <div className="border-r border-zinc-800/60 border-dashed" />
                  <div className="border-r border-zinc-800/60 border-dashed" />
                  <div className="border-r border-zinc-800/60 border-dashed" />
                  <div className="border-zinc-800/60 border-dashed" />
                </div>
                <div className="absolute inset-0 grid grid-rows-3 pointer-events-none">
                  <div className="border-b border-zinc-800/40 border-dashed" />
                  <div className="border-b border-zinc-800/40 border-dashed" />
                  <div />
                </div>

                {/* SVG Area & Smooth Wave Line */}
                <svg
                  viewBox="0 0 500 120"
                  className="w-full h-full preserve-3d"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Amber Gradient Fill */}
                    <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity="0.30" />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Filter for subtle glow */}
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.6" />
                    </filter>
                  </defs>

                  {/* Gradient Area Fill under the curve */}
                  <path
                    d="M 0 78
                       C 40 70, 70 65, 100 66
                       C 140 68, 170 56, 210 46
                       C 245 37, 280 40, 320 48
                       C 360 55, 390 44, 420 38
                       C 450 34, 480 34, 500 34
                       L 500 120
                       L 0 120 Z"
                    fill="url(#performanceGradient)"
                  />

                  {/* Top Glowing Wave Line */}
                  <path
                    d="M 0 78
                       C 40 70, 70 65, 100 66
                       C 140 68, 170 56, 210 46
                       C 245 37, 280 40, 320 48
                       C 360 55, 390 44, 420 38
                       C 450 34, 480 34, 500 34"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />
                </svg>
              </div>

              {/* Time axis labels */}
              <div className="flex justify-between items-center text-zinc-400 text-sm font-normal font-['Inter'] pt-2 px-1">
                <span>9am</span>
                <span>10am</span>
                <span>11am</span>
                <span>12pm</span>
                <span>1pm</span>
                <span>2pm</span>
                <span className="text-amber-400 font-semibold">Now</span>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* CARD D: Team Performance (5 Line Cooks & Accuracy)                    */}
          {/* --------------------------------------------------------------------- */}
          <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/5 shadow-xl flex flex-col justify-start items-start">
            <div className="w-full flex items-center justify-between pb-2 border-b border-white/5">
              <h2 className="text-slate-200 text-base font-semibold font-['Inter'] leading-5">
                Team Performance
              </h2>
              <span className="text-xs text-zinc-400">Shift #1 Active Line</span>
            </div>

            <div className="w-full pt-3 space-y-3">
              {teamPerformance.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 group hover:bg-white/[0.02] p-1 rounded-lg transition-colors"
                >
                  {/* Avatar with Initials */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${member.avatarColor}`}>
                    {member.avatarInitials}
                  </div>

                  {/* Name and Station */}
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-200 text-sm font-medium font-['Inter'] leading-4 truncate group-hover:text-amber-400 transition-colors">
                      {member.name}
                    </div>
                    <div className="text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                      {member.station}
                    </div>
                  </div>

                  {/* Orders and Accuracy */}
                  <div className="text-right shrink-0">
                    <div className="text-slate-200 text-sm font-bold font-['Consolas'] leading-4">
                      {member.orders} orders
                    </div>
                    <div className="text-emerald-500 text-xs font-normal font-['Consolas'] leading-4">
                      {member.accuracy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* CARD E: Chef Notes & AI Summary Box                                  */}
          {/* --------------------------------------------------------------------- */}
          <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/5 shadow-xl flex flex-col justify-start items-start space-y-3.5">
            <div className="w-full flex items-center justify-between pb-1 border-b border-white/5">
              <h2 className="text-slate-200 text-base font-semibold font-['Inter'] leading-5">
                Chef Notes
              </h2>
              <button
                onClick={() => setIsAddNoteOpen(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Observation</span>
              </button>
            </div>

            {/* Bulleted Notes */}
            <div className="w-full space-y-2 text-sm">
              {chefNotes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold font-mono text-base leading-4 shrink-0">
                    ·
                  </span>
                  <p className="text-neutral-400 text-sm font-normal font-['Inter'] leading-relaxed">
                    {note}
                  </p>
                </div>
              ))}
            </div>

            {/* AI Summary Box from Figma */}
            <div className="w-full pt-1">
              <div className="p-3.5 bg-yellow-500/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-amber-500/20 flex flex-col justify-start items-start">
                <div className="flex items-center gap-1.5 text-yellow-500 text-sm font-medium font-['Inter'] leading-4 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                  <span>AI Summary</span>
                </div>
                <p className="text-stone-300 text-sm font-normal font-['Inter'] leading-5">
                  Strong shift overall. Key area for improvement: Grill Station capacity management. Implementing the AI&apos;s load-balancing recommendation mid-shift prevented further delays. Predicted efficiency for PM shift: 91%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: ADD OBSERVATION / CHEF NOTE                                     */}
      {/* ========================================================================= */}
      {isAddNoteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white font-['Inter'] flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-amber-400" />
                Add Shift Observation
              </h3>
              <button
                onClick={() => setIsAddNoteOpen(false)}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleAddNoteSubmit} className="space-y-4 pt-4 text-sm">
              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  Observation / Culinary Handover Note
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Low stock on truffle butter. PM shift should prep additional compound batch..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 font-['Inter'] leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddNoteOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg text-sm transition-all shadow-md shadow-amber-500/20"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
