'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Bell,
  BellRing,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Mic,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Send,
  MessageSquare,
  Lightbulb,
  X,
  ShieldAlert,
  ArrowRight,
  Flame,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface FeatureDetail {
  id: string;
  title: string;
  bengaliTitle: string;
  status: 'In Development' | 'Planned' | 'Research';
  statusColor: string;
  badgeBg: string;
  quarter: string;
  tagline: string;
  description: string;
  accentGradient: string;
  iconBg: string;
  iconColor: string;
  progress: number;
  progressBarColor: string;
  metrics: {
    value: string;
    label: string;
    color: string;
  }[];
  deepDive: {
    problem: string;
    solution: string;
    technicalSpecs: string[];
    timelineNotes: string;
  };
}

const upcomingFeatures: FeatureDetail[] = [
  {
    id: 'chef-auto-assignment',
    title: 'Chef Auto-Assignment',
    bengaliTitle: 'Chef স্বয়ংক্রিয় Assignment',
    status: 'In Development',
    statusColor: 'text-yellow-500',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-yellow-500',
    quarter: 'Q3 2025',
    tagline: 'Right chef. Right station. Every time.',
    description:
      "Tavonza AI analyzes each chef's skill profile, current workload, and real-time fatigue indicators to automatically assign the most qualified chef to every incoming order — no manual dispatch needed.",
    accentGradient: 'from-amber-500/10 via-black/0 to-black/0',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-yellow-500',
    progress: 68,
    progressBarColor: 'bg-yellow-500',
    metrics: [
      { value: '3.2×', label: 'Faster Assignment', color: 'text-yellow-500' },
      { value: '94%', label: 'Workload Balance', color: 'text-emerald-500' },
      { value: '−61%', label: 'Error Reduction', color: 'text-blue-400' },
    ],
    deepDive: {
      problem: 'Manual kitchen order routing during peak rush hours leads to uneven station stress and ticket delays.',
      solution: 'Neural graph matching considers certified chef skill tiers, thermal station proximity, and ticket complexity in real time.',
      technicalSpecs: [
        'Sub-50ms dispatch decision latency',
        'Chef fatigue telemetry via station completion pace',
        'Auto-escalates to Sous Chef if ticket exceeds prep benchmark by 15%',
      ],
      timelineNotes: 'Alpha testing in downtown branch kitchen; beta release planned August 2025.',
    },
  },
  {
    id: 'workload-auto-balancing',
    title: 'Workload Auto-Balancing',
    bengaliTitle: 'Workload স্বয়ংক্রিয় Balance',
    status: 'In Development',
    statusColor: 'text-yellow-500',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-yellow-500',
    quarter: 'Q3 2025',
    tagline: 'No station burns. No station idles.',
    description:
      'Continuously monitors all station capacities in real-time and automatically redistributes orders the moment any station approaches overload — preventing bottlenecks before they even form.',
    accentGradient: 'from-blue-500/10 via-black/0 to-black/0',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    progress: 55,
    progressBarColor: 'bg-yellow-500',
    metrics: [
      { value: '−28%', label: 'Avg Wait Reduction', color: 'text-blue-400' },
      { value: '91%', label: 'Station Utilization', color: 'text-emerald-500' },
      { value: '−4.7', label: 'Bottlenecks/day', color: 'text-orange-500' },
    ],
    deepDive: {
      problem: 'One overloaded fry station slows down burger assembly across 15 simultaneously waiting tables.',
      solution: 'Dynamic order pipeline dynamically reroutes auxiliary prep items to parallel cold and saute lines.',
      technicalSpecs: [
        'Continuous throughput calculation across all 6 stations',
        'Smart split-ticket synchronization for unified table delivery',
        'Simulated predictive capacity testing before dinner rush',
      ],
      timelineNotes: 'Internal algorithm stress-tested with 120 concurrent tickets in simulation.',
    },
  },
  {
    id: 'ingredient-auto-reorder',
    title: 'Ingredient Auto-Reorder',
    bengaliTitle: 'Ingredient স্বয়ংক্রিয় Reorder',
    status: 'Planned',
    statusColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    quarter: 'Q4 2025',
    tagline: 'Never run out. Never over-order.',
    description:
      'Combines real-time inventory data, demand forecasts, and supplier lead times to automatically trigger purchase orders the moment stock crosses your configurable par levels — with zero human input.',
    accentGradient: 'from-green-500/10 via-black/0 to-black/0',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    progress: 22,
    progressBarColor: 'bg-purple-500',
    metrics: [
      { value: '−89%', label: 'Stockout Events', color: 'text-emerald-500' },
      { value: '6h/wk', label: 'Ordering Time Saved', color: 'text-orange-500' },
      { value: '−34%', label: 'Food Waste', color: 'text-blue-400' },
    ],
    deepDive: {
      problem: 'Manual inventory counts after midnight miss urgent shortages for the morning prep shift.',
      solution: 'Direct ERP & Supplier API integration triggered by recipe consumption deduction logic.',
      technicalSpecs: [
        'Automated EDI/REST purchase order generation',
        'Weather & event-aware par adjustments (e.g. rain forecasts increase hot soup demand)',
        'Three-tier price check across registered dairy and produce vendors',
      ],
      timelineNotes: 'Vendor integration partnerships finalized; prototype testing scheduled Q4 2025.',
    },
  },
  {
    id: 'voice-command-support',
    title: 'Voice Command Support',
    bengaliTitle: 'Voice Command Support',
    status: 'Planned',
    statusColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    quarter: 'Q4 2025',
    tagline: 'Hands busy. Voice free. Kitchen moving.',
    description:
      'Control your entire kitchen with natural voice commands — no touch required. Designed for chefs mid-prep, hands covered in flour or at a hot grill. Supports English and Bengali.',
    accentGradient: 'from-violet-500/10 via-black/0 to-black/0',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    progress: 18,
    progressBarColor: 'bg-purple-500',
    metrics: [
      { value: '100%', label: 'Hands-Free Actions', color: 'text-violet-400' },
      { value: '<0.8s', label: 'Response Latency', color: 'text-emerald-500' },
      { value: '97.3%', label: 'Command Accuracy', color: 'text-orange-500' },
    ],
    deepDive: {
      problem: 'Touching touchscreen monitors during prep breaks hygiene protocols and slows station cadence.',
      solution: 'Noise-filtering directional acoustic array tuned specifically for kitchen exhaust and fry sizzle noise.',
      technicalSpecs: [
        'Dual-language acoustic model (English & Bengali kitchen slang)',
        'Local edge processing for zero-delay wake word "Hey Tavonza"',
        'Visual confirmation HUD flash on station screen',
      ],
      timelineNotes: 'Hardware acoustic trials underway with specialized waterproof mic arrays.',
    },
  },
  {
    id: 'bottleneck-prediction',
    title: 'Bottleneck Prediction',
    bengaliTitle: 'Bottleneck আগাম Prediction',
    status: 'Research',
    statusColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    quarter: 'Q1 2026',
    tagline: 'See the jam before it happens.',
    description:
      'A predictive AI model trained on months of kitchen data that identifies bottlenecks up to 15 minutes before they occur — giving you time to act, not react. The most advanced feature in our roadmap.',
    accentGradient: 'from-orange-500/10 via-black/0 to-black/0',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
    progress: 8,
    progressBarColor: 'bg-blue-500',
    metrics: [
      { value: '15 min', label: 'Prediction Window', color: 'text-orange-500' },
      { value: '83%', label: 'Bottleneck Prevention', color: 'text-emerald-500' },
      { value: '91.7%', label: 'Model Accuracy', color: 'text-blue-400' },
    ],
    deepDive: {
      problem: 'By the time tickets turn red on the KDS, the prep queue has already backed up 30 minutes.',
      solution: 'Predictive temporal convolution model forecasting order injection bursts from front-of-house tables.',
      technicalSpecs: [
        'Table turn status + reservation books cross-referencing',
        'Dynamic alert notifications to Head Chef tablet 15 min early',
        'Automated prep station pre-heat recommendation',
      ],
      timelineNotes: 'Joint research project with AI Hospitality labs on neural sequence modeling.',
    },
  },
];

export default function FutureAIView() {
  const [email, setEmail] = useState('');
  const [notifiedFeatures, setNotifiedFeatures] = useState<Record<string, boolean>>({});
  const [selectedFeature, setSelectedFeature] = useState<FeatureDetail | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Form states
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState('5');
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDesc, setRequestDesc] = useState('');

  const handleGlobalNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success(`Success! ${email} has been enrolled in early access for all upcoming features.`);
    setEmail('');
  };

  const toggleFeatureNotify = (featId: string, featTitle: string) => {
    setNotifiedFeatures((prev) => {
      const isCurrentlyNotified = !!prev[featId];
      const next = { ...prev, [featId]: !isCurrentlyNotified };
      if (!isCurrentlyNotified) {
        toast.success(`You will be notified as soon as ${featTitle} enters public beta!`);
      } else {
        toast.info(`Notification alert disabled for ${featTitle}.`);
      }
      return next;
    });
  };

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      toast.error('Please write a brief note for feedback.');
      return;
    }
    toast.success('Thank you! Your feedback has been sent directly to the Tavonza AI product team.');
    setFeedbackText('');
    setShowFeedbackModal(false);
  };

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTitle.trim() || !requestDesc.trim()) {
      toast.error('Please enter both a feature title and description.');
      return;
    }
    toast.success(`Feature request "${requestTitle}" submitted to the Tavonza roadmap backlog!`);
    setRequestTitle('');
    setRequestDesc('');
    setShowRequestModal(false);
  };

  return (
    <div className="space-y-7   mx-auto pb-20">
      {/* 1. HERO BANNER */}
      <div className="relative bg-neutral-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-black/0 to-violet-500/10 pointer-events-none" />
        <div className="absolute -top-16 -right-16 size-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 size-60 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-9 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          {/* Left Text Column */}
          <div className="max-w-2xl space-y-4">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="size-2 rounded-full bg-orange-500 animate-ping" />
              <span className="text-orange-400 text-sm font-mono uppercase tracking-wider font-semibold">
                Tavonza AI — Upcoming Features
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-slate-100 text-4xl sm:text-5xl font-bold font-['Inter'] leading-tight tracking-tight">
              The Future of Your Kitchen <br />
              <span className="text-orange-500 bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                Is Already Being Built.
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-400 text-base sm:text-lg font-normal font-['Inter'] leading-relaxed">
              Five AI-powered capabilities that will transform how your kitchen operates — from zero-touch chef assignment and live workload balancing to voice control and predictive bottleneck prevention.
            </p>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/30 flex items-center gap-2">
                <span className="size-2 rounded-full bg-yellow-500" />
                <span className="text-yellow-500 text-sm font-medium font-['Inter']">2 In Development</span>
              </div>
              <div className="px-3 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/30 flex items-center gap-2">
                <span className="size-2 rounded-full bg-purple-400" />
                <span className="text-purple-400 text-sm font-medium font-['Inter']">2 Planned</span>
              </div>
              <div className="px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/30 flex items-center gap-2">
                <span className="size-2 rounded-full bg-blue-400" />
                <span className="text-blue-400 text-sm font-medium font-['Inter']">1 In Research</span>
              </div>
            </div>
          </div>

          {/* Right Early Access Card */}
          <div className="w-full lg:w-72 p-5 bg-neutral-800/90 rounded-xl border border-white/10 shadow-xl flex flex-col justify-start space-y-3 flex-shrink-0">
            <div>
              <h2 className="text-slate-200 text-base font-semibold font-['Inter'] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Get Early Access
              </h2>
              <p className="text-gray-400 text-sm font-normal font-['Inter'] mt-1 leading-snug">
                Be the first to try each feature as it launches. We&apos;ll notify you when your kitchen qualifies.
              </p>
            </div>

            <form onSubmit={handleGlobalNotify} className="space-y-2.5 pt-1">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 px-3 bg-neutral-900 rounded-lg border border-white/10 text-sm text-white placeholder:text-gray-500 outline-none focus:border-orange-500/50 transition-colors"
              />
              <button
                type="submit"
                className="w-full h-8 px-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm font-['Inter'] rounded-lg shadow-md hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-white" />
                Notify Me for All Features
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. RELEASE ROADMAP SECTION */}
      <div className="p-6 bg-neutral-900 rounded-xl border border-white/10 shadow-lg space-y-5">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h2 className="text-slate-200 text-base sm:text-lg font-semibold font-['Inter'] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            Release Roadmap
          </h2>
          <span className="text-xs font-mono text-zinc-400">Target Delivery Timeline</span>
        </div>

        {/* Horizontal Timeline Track */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Milestone 1: Q3 2025 */}
          <div className="relative p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="size-3.5 rounded-full bg-yellow-500 ring-4 ring-neutral-950 shadow-sm" />
              <span className="text-slate-200 text-sm font-bold font-mono">Q3 2025</span>
              <span className="text-yellow-500 text-xs font-medium font-['Inter'] px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                In Development
              </span>
            </div>
            <ul className="space-y-2 pl-6 border-l border-yellow-500/20 text-sm text-gray-300 font-['Inter']">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-yellow-500" />
                Chef Auto-Assignment
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-yellow-500" />
                Workload Auto-Balancing
              </li>
            </ul>
          </div>

          {/* Milestone 2: Q4 2025 */}
          <div className="relative p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="size-3.5 rounded-full bg-purple-500 ring-4 ring-neutral-950 shadow-sm" />
              <span className="text-slate-200 text-sm font-bold font-mono">Q4 2025</span>
              <span className="text-purple-400 text-xs font-medium font-['Inter'] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                Planned
              </span>
            </div>
            <ul className="space-y-2 pl-6 border-l border-purple-500/20 text-sm text-gray-300 font-['Inter']">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-purple-400" />
                Ingredient Auto-Reorder
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-purple-400" />
                Voice Command Support
              </li>
            </ul>
          </div>

          {/* Milestone 3: Q1 2026 */}
          <div className="relative p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="size-3.5 rounded-full bg-blue-500 ring-4 ring-neutral-950 shadow-sm" />
              <span className="text-slate-200 text-sm font-bold font-mono">Q1 2026</span>
              <span className="text-blue-400 text-xs font-medium font-['Inter'] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                Research
              </span>
            </div>
            <ul className="space-y-2 pl-6 border-l border-blue-500/20 text-sm text-gray-300 font-['Inter']">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-blue-400" />
                Bottleneck Prediction
              </li>
              <li className="text-xs text-gray-500 italic pl-3.5">
                Neural predictive temporal forecasting
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. FIVE DEEP FEATURE INNOVATION CARDS */}
      <div className="space-y-5">
        {upcomingFeatures.map((feature, idx) => {
          const isNotified = !!notifiedFeatures[feature.id];
          return (
            <div
              key={feature.id}
              className="bg-neutral-900 rounded-2xl border border-white/10 overflow-hidden shadow-xl hover:border-white/20 transition-all group"
            >
              {/* Top Accent Gradient Line */}
              <div className={`h-1 w-full bg-gradient-to-r ${feature.accentGradient}`} />

              <div className="p-6 space-y-5">
                {/* Header Row: Icon + Title + Badges + Actions */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Feature Icon */}
                    <div
                      className={`size-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5 ${feature.iconBg}`}
                    >
                      {idx === 0 && <Bot className={`w-6 h-6 ${feature.iconColor}`} />}
                      {idx === 1 && <Cpu className={`w-6 h-6 ${feature.iconColor}`} />}
                      {idx === 2 && <Layers className={`w-6 h-6 ${feature.iconColor}`} />}
                      {idx === 3 && <Mic className={`w-6 h-6 ${feature.iconColor}`} />}
                      {idx === 4 && <AlertTriangle className={`w-6 h-6 ${feature.iconColor}`} />}
                    </div>

                    {/* Title + Meta */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-slate-100 text-xl font-bold font-['Inter'] leading-snug">
                          {feature.title}
                        </h3>
                        <span className="text-gray-500 text-sm font-mono">·</span>
                        <span className="text-gray-400 text-sm font-normal font-['Inter']">
                          {feature.bengaliTitle}
                        </span>
                        <span
                          className={`text-xs font-medium font-['Inter'] px-2 py-0.5 rounded-full border ${feature.badgeBg}`}
                        >
                          {feature.status}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-gray-400 border border-white/5">
                          {feature.quarter}
                        </span>
                      </div>

                      {/* Tagline */}
                      <p className="text-orange-400 text-sm font-semibold font-['Inter']">
                        {feature.tagline}
                      </p>

                      {/* Description */}
                      <p className="text-gray-400 text-base font-normal font-['Inter'] leading-relaxed pt-1 max-w-4xl">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Top Right Actions */}
                  <div className="flex items-center gap-2 self-start flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleFeatureNotify(feature.id, feature.title)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium font-['Inter'] transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isNotified
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          : 'bg-neutral-800 text-gray-300 border-white/10 hover:bg-neutral-700'
                      }`}
                    >
                      {isNotified ? (
                        <BellRing className="w-3.5 h-3.5 text-orange-400" />
                      ) : (
                        <Bell className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      {isNotified ? 'Subscribed' : 'Notify Me'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFeature(feature)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-gray-200 rounded-lg border border-white/10 text-sm font-medium font-['Inter'] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Explore
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar Row */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-sm font-mono text-gray-400">
                    <span className="text-xs text-zinc-500">Development Progress</span>
                    <span className="font-semibold text-slate-300">{feature.progress}% complete</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${feature.progressBarColor}`}
                      style={{ width: `${feature.progress}%` }}
                    />
                  </div>
                </div>

                {/* 3 Metric Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {feature.metrics.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3 bg-neutral-800/70 rounded-xl border border-white/5 text-center space-y-0.5"
                    >
                      <div className={`text-xl font-bold font-mono ${m.color}`}>{m.value}</div>
                      <div className="text-xs text-gray-400 font-['Inter']">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. BOTTOM COLLABORATION BANNER */}
      <div className="relative bg-neutral-900 rounded-2xl border border-orange-500/20 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-violet-500/5 pointer-events-none" />

        <div className="relative p-6 sm:p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl space-y-1.5">
            <h2 className="text-slate-100 text-xl font-bold font-['Inter'] flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-orange-400" />
              Help shape what we build next.
            </h2>
            <p className="text-gray-400 text-base font-normal font-['Inter'] leading-relaxed">
              Your kitchen&apos;s real challenges drive our roadmap. Share which features matter most to you — our team reads every response.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setShowFeedbackModal(true)}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl border border-white/10 text-slate-200 text-base font-medium font-['Inter'] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-slate-300" />
              Share Feedback
            </button>

            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-semibold text-base font-['Inter'] shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              Request a Feature
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: FEATURE DEEP DIVE EXPLORE MODAL */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-medium font-['Inter'] px-2 py-0.5 rounded-full border ${selectedFeature.badgeBg}`}
                  >
                    {selectedFeature.status}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-gray-400 border border-white/5">
                    {selectedFeature.quarter}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white font-['Inter']">
                  {selectedFeature.title}
                </h3>
                <p className="text-sm text-orange-400 font-medium font-['Inter'] mt-0.5">
                  {selectedFeature.tagline}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFeature(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Deep Dive Content */}
            <div className="space-y-4 text-base text-zinc-300 font-['Inter']">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  The Problem It Solves
                </h4>
                <p className="p-3 bg-white/5 rounded-xl border border-white/5 text-gray-300 leading-relaxed text-sm">
                  {selectedFeature.deepDive.problem}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Tavonza AI Solution Architecture
                </h4>
                <p className="p-3 bg-white/5 rounded-xl border border-white/5 text-gray-300 leading-relaxed text-sm">
                  {selectedFeature.deepDive.solution}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Technical Specifications
                </h4>
                <ul className="space-y-1.5 pl-2">
                  {selectedFeature.deepDive.technicalSpecs.map((spec, sIdx) => (
                    <li key={sIdx} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-sm text-amber-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{selectedFeature.deepDive.timelineNotes}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  toggleFeatureNotify(selectedFeature.id, selectedFeature.title);
                  setSelectedFeature(null);
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5 text-white" />
                {notifiedFeatures[selectedFeature.id] ? 'Subscribed' : 'Notify Me for Beta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SHARE FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-400" />
                Share Kitchen Feedback
              </h3>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitFeedback} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 font-medium">How would you rate your experience?</label>
                <select
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(e.target.value)}
                  className="w-full h-9 mt-1 px-3 bg-neutral-800 border border-white/10 rounded-lg text-sm text-white outline-none"
                >
                  <option value="5">⭐⭐⭐⭐⭐ Exceptional (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ Very Good (4/5)</option>
                  <option value="3">⭐⭐⭐ Good (3/5)</option>
                  <option value="2">⭐⭐ Needs Improvement (2/5)</option>
                  <option value="1">⭐ Poor (1/5)</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 font-medium">What is your biggest kitchen bottleneck?</label>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="e.g. Grill station delays during Friday dinner rush, or par levels running out of fresh brioche buns..."
                  className="w-full mt-1 p-3 bg-neutral-800 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg text-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REQUEST A FEATURE MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-orange-400" />
                Request a Feature
              </h3>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 font-medium">Feature Title</label>
                <input
                  type="text"
                  placeholder="e.g. Automated Dessert Station Pairing"
                  value={requestTitle}
                  onChange={(e) => setRequestTitle(e.target.value)}
                  className="w-full h-9 mt-1 px-3 bg-neutral-800 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 outline-none focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 font-medium">How would this help your operations?</label>
                <textarea
                  rows={4}
                  value={requestDesc}
                  onChange={(e) => setRequestDesc(e.target.value)}
                  placeholder="Describe your use case, expected time saved, and current manual process..."
                  className="w-full mt-1 p-3 bg-neutral-800 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg text-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
