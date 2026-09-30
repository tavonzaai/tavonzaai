'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Mic,
  Send,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Flame,
  CheckCircle2,
  UtensilsCrossed,
} from 'lucide-react';

interface JarvisChatViewProps {
  onReserveClick?: () => void;
  isNavVisible?: boolean;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
}

export default function JarvisChatView({
  onReserveClick,
  isNavVisible = true,
  onInputFocus,
  onInputBlur,
}: JarvisChatViewProps) {
  const router = useRouter();
  const [jarvisQuery, setJarvisQuery] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'jarvis'; text: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatLog.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog]);

  const showNav = isNavVisible && !isFocused;

  const handleReserve = () => {
    if (onReserveClick) {
      onReserveClick();
    } else {
      router.push('/reserve');
    }
  };

  const presets = [
    "What's your best-selling dish?",
    'Recommend something spicy.',
    'Show vegetarian options.',
    'I have a nut allergy.',
    'Help me choose a wine.',
  ];

  const categories = [
    { name: 'Burgers', icon: '🍔' },
    { name: 'Dessert', icon: '🍰' },
    { name: 'Mexican', icon: '🌮' },
    { name: 'Sushi', icon: '🍣' },
    { name: 'Pizza', icon: '🍕' },
  ];

  const trendingDishes = [
    {
      id: 1,
      title: 'Classic Wagyu Smash',
      restaurant: 'The Burger Lab',
      price: '$26.50',
      image: '/images/burger.jpg',
    },
    {
      id: 2,
      title: 'Classic Wagyu Smash',
      restaurant: 'The Burger Lab',
      price: '$26.50',
      image: '/images/burger.jpg',
    },
  ];

  const dietaryDishes = [
    {
      id: 101,
      match: '99% Health Match',
      price: '€88',
      restaurant: 'Le Gabriel • Contemporary French',
      title: 'Pan-Seared Line-Caught Seabass',
      desc: 'Crispy skin sea bass resting on braised carrots & herb reduction.',
      macros: ['Protein : 48g', 'Carbs : 06g', 'Fat : 22g'],
      tags: ['Keto & Low Carb', 'High Protein'],
      image: '/images/seabass.jpg',
    },
    {
      id: 102,
      match: '99% Health Match',
      price: '€88',
      restaurant: 'Le Gabriel • Contemporary French',
      title: 'Pan-Seared Line-Caught Seabass',
      desc: 'Crispy skin sea bass resting on braised carrots & herb reduction.',
      macros: ['Protein : 48g', 'Carbs : 06g', 'Fat : 22g'],
      tags: ['Keto & Low Carb', 'High Protein'],
      image: '/images/seabass.jpg',
    },
  ];

  const handleSendPrompt = (text: string) => {
    if (!text.trim()) return;
    setActivePreset(text);
    setChatLog((prev) => [
      ...prev,
      { sender: 'user', text },
      {
        sender: 'jarvis',
        text: `JARVIS AI recommendation prepared for "${text}". Your dietary preferences (Keto & Organic) have been pre-synced.`,
      },
    ]);
    setJarvisQuery('');
  };

  return (
    <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto min-h-screen bg-black text-white flex flex-col justify-between relative overflow-x-hidden font-sans">
      <div className="w-full flex-1 flex flex-col gap-5 pb-36 pt-2">

        {/* Top Header Bar with Back Button */}
        <div className="flex items-center justify-between px-4 pt-1 pb-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white hover:bg-neutral-800 hover:text-yellow-400 transition cursor-pointer shadow-sm"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white font-['Montserrat'] tracking-wide">
              JARVIS AI Live
            </span>
          </div>
          <div className="w-8" />
        </div>

        {/* 1. Header Banner: 3D Robot Avatar on Left + Multimodal AI Engine (#382F07 to #070705) */}
        <div className="mx-4 rounded-2xl p-5 bg-gradient-to-r from-[#382F07] to-[#070705] border border-amber-500/20 flex items-center gap-4 shadow-xl relative overflow-hidden">
          {/* Robot Avatar Image on Left */}
          <div className="w-24 h-24 md:w-28 md:h-28 relative shrink-0">
            <Image
              src="/images/image 11.png"
              alt="JARVIS Bot"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Right Text Details */}
          <div className="flex flex-col gap-2 flex-1">
            <div className="px-2.5 py-0.5 bg-emerald-950/40 border border-emerald-600/60 rounded-md text-emerald-400 text-[10px] font-semibold font-['Inter'] w-fit">
              Multimodal AI Engine
            </div>

            <h2 className="text-base md:text-lg font-bold text-white font-['Inter'] tracking-tight">
              JARVIS AI Concierge
            </h2>

            <p className="text-xs text-stone-300 leading-relaxed font-['Poppins']">
              Ask naturally for restaurants, dietary checks, instant table locks, or meal recommendations.
            </p>

            <div className="px-2.5 py-0.5 bg-amber-950/50 border border-amber-600/60 rounded-md text-yellow-400 text-[10px] font-semibold font-['Inter'] w-fit">
              VIP Status: Tavonza Black
            </div>
          </div>
        </div>

        {/* 2. Quick Concierge Voice & Text Presets */}
        <div className="flex flex-col gap-3 px-5 pt-2">
          <div className="flex flex-col gap-1">
            <h3 className="text-base md:text-lg font-bold text-white font-['Inter']">
              Quick Concierge Voice & Text Presets
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed font-['Poppins']">
              Save ready-to-use voice and text responses for faster guest support.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {presets.map((presetText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(presetText)}
                className={`px-4 py-2 rounded-full text-xs font-medium font-['DM_Sans'] transition text-left border ${
                  activePreset === presetText
                    ? 'bg-amber-500 text-black border-amber-500 font-semibold shadow-md shadow-amber-500/20'
                    : 'bg-neutral-900 border-neutral-700/80 text-white hover:bg-neutral-800'
                }`}
              >
                {presetText}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Categories */}
        <div className="flex flex-col gap-3 px-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white font-['Inter']">Categories</h3>
            <button className="text-xs text-yellow-400 font-medium underline hover:text-yellow-300">
              See All
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat.name)}
                className={`w-20 h-24 rounded-2xl border flex flex-col items-center justify-center gap-2 shrink-0 transition ${
                  selectedCategory === cat.name
                    ? 'bg-yellow-400/20 border-yellow-400 text-white shadow-lg shadow-yellow-500/10'
                    : 'bg-neutral-900 border-white/10 text-neutral-300 hover:border-white/20'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium font-['Inter']">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Trending Today */}
        <div className="flex flex-col gap-3 px-5">
          <h3 className="text-sm font-semibold text-white font-['Inter']">Trending Today</h3>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            {trendingDishes.map((dish, idx) => (
              <div
                key={idx}
                className="w-56 bg-neutral-900 border border-white/10 rounded-2xl p-3 flex flex-col gap-2 shrink-0 shadow-lg"
              >
                <div className="w-full h-32 relative rounded-xl overflow-hidden">
                  <Image src={dish.image} alt={dish.title} fill className="object-cover" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-semibold text-white font-['Inter']">{dish.title}</h4>
                  <p className="text-[11px] text-neutral-400 font-['Inter']">{dish.restaurant}</p>
                  <span className="text-xs font-bold text-yellow-400 font-['DM_Sans'] mt-1">
                    {dish.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Suitable for Your Dietary Preferences */}
        <div className="flex flex-col gap-3 px-5">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-semibold text-white font-['Inter']">
              Suitable for Your Dietary Preferences
            </h3>
            <p className="text-xs text-neutral-400 font-['Poppins']">
              Verified for: Keto & Low Carb • Gluten-Free Friendly • Organic Focus
            </p>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            {dietaryDishes.map((dish, idx) => (
              <div
                key={idx}
                className="w-72 bg-neutral-900 border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2.5 shrink-0 shadow-lg"
              >
                <div className="w-full h-36 relative rounded-xl overflow-hidden">
                  <Image src={dish.image} alt={dish.title} fill className="object-cover" />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-md text-white text-[10px] font-medium border border-white/10">
                    {dish.match}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-black/90 text-yellow-400 text-xs font-bold rounded-md border border-white/10">
                    {dish.price}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-400 font-['Inter']">{dish.restaurant}</span>
                  <h4 className="text-xs font-semibold text-white font-['Inter']">{dish.title}</h4>
                  <p className="text-[10px] text-neutral-400 leading-tight">{dish.desc}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {dish.macros.map((m, mIdx) => (
                    <span
                      key={mIdx}
                      className="px-2 py-0.5 bg-black/60 border border-white/10 text-[10px] font-medium text-neutral-300 rounded-md"
                    >
                      {m}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  {dish.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/20 text-[10px] font-medium text-yellow-400 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Active Live AI Chat Conversation Stream (Positioned above Chat Input Box) */}
        {chatLog.length > 0 && (
          <div className="px-5 my-2 flex flex-col gap-2.5 animate-in fade-in duration-300">
            <div className="p-4 bg-neutral-900/90 rounded-2xl border border-yellow-400/30 shadow-xl flex flex-col gap-3">
              {chatLog.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs max-w-[85%] ${
                    msg.sender === 'user'
                      ? 'bg-yellow-400/20 text-yellow-300 font-medium self-end border border-yellow-400/20'
                      : 'bg-black/60 text-neutral-200 self-start border border-white/10'
                  }`}
                >
                  <span className="font-semibold block mb-1 text-[10px] text-neutral-400 uppercase tracking-wider">
                    {msg.sender === 'user' ? 'You' : 'JARVIS AI'}
                  </span>
                  <p className="leading-relaxed font-['Inter']">{msg.text}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* 6. Chat Input Bar (Floating above BottomNav, drops to screen bottom when focused/typing or scrolling down) */}
      <div
        className={`w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto fixed left-0 right-0 px-4 pb-2 z-40 transition-all duration-300 ease-in-out ${
          showNav ? 'bottom-[84px]' : 'bottom-3'
        }`}
      >
        <div className="w-full bg-neutral-900/95 border border-white/10 rounded-2xl p-3 flex items-center justify-between shadow-2xl backdrop-blur-xl">
          <input
            type="text"
            value={jarvisQuery}
            onChange={(e) => setJarvisQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (onInputFocus) onInputFocus();
            }}
            onBlur={() => {
              setIsFocused(false);
              if (onInputBlur) onInputBlur();
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt(jarvisQuery)}
            placeholder="Ask Jarvis anything..."
            className="w-full bg-transparent text-xs sm:text-sm font-normal text-white placeholder:text-neutral-400 focus:outline-none pr-3 font-['Inter']"
          />

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-white hover:bg-neutral-700 transition"
            >
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
            <button
              type="button"
              onClick={() => handleSendPrompt(jarvisQuery || "What's your best-selling dish?")}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/20 transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black fill-black stroke-none" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

