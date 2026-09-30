'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Mic,
  Sparkles,
  Plus,
  Bell,
  Check,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  dishes?: {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    tags?: string[];
  }[];
  callWaiter?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: "👋 Hi there! I'm your Tavonza AI Dining Concierge. I can recommend dishes, verify ingredients & allergies, recommend drink pairings, or assist your table. How can I help you today?",
    timestamp: 'Just now',
  },
];

const SUGGESTION_CHIPS = [
  { label: '⭐ Best-selling dishes', query: 'What are your best-selling dishes?' },
  { label: '🌱 Vegetarian & Keto', query: 'Show me healthy vegetarian & keto options.' },
  { label: '🍷 Wine pairings', query: 'What wines pair best with steak and seafood?' },
  { label: '🌶️ Spicy specials', query: 'Recommend something spicy with bold flavors.' },
  { label: '🛎️ Call Waiter', query: 'Please call a waiter to our table.' },
];

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tableNumber, addToCart } = useCart();

  const activeTable = searchParams.get('table') || tableNumber || 'Table 8';
  const initialQuery = searchParams.get('query') || '';

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWaiterAlert, setShowWaiterAlert] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle initial query from URL if passed
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const getTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!content) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: content,
      timestamp: getTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (textToSend === undefined) setInputText('');
    setIsTyping(true);

    // AI Response generation logic
    setTimeout(() => {
      generateAiResponse(content);
      setIsTyping(false);
    }, 900);
  };

  const generateAiResponse = (userQuery: string) => {
    const q = userQuery.toLowerCase();
    const timestamp = getTimeString();

    if (q.includes('call') || q.includes('waiter') || q.includes('server') || q.includes('help')) {
      setShowWaiterAlert(true);
      setTimeout(() => setShowWaiterAlert(false), 4000);

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `🛎️ I have notified your server for **${activeTable}**. A waiter will be at your table shortly! Is there anything else you'd like while you wait?`,
        timestamp,
        callWaiter: true,
      };
      setMessages((prev) => [...prev, aiMsg]);
      return;
    }

    if (q.includes('best') || q.includes('popular') || q.includes('recommend') || q.includes('burger')) {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: "Here are our top chef recommendations loved by our guests today! Both are prepared fresh to order:",
        timestamp,
        dishes: [
          {
            id: 'potato-corn-burger-1',
            name: 'Potato Corn Burger',
            price: 26.0,
            image: '/images/burger.jpg',
            description: 'Crispy seasoned potato patty, sweet grilled corn relish, and smoked cheddar sauce on a brioche bun.',
            tags: ['Chef Special', 'Top Seller'],
          },
          {
            id: 'seabass-special-1',
            name: 'Pan-Seared Sea Bass',
            price: 34.0,
            image: '/images/seabass.jpg',
            description: 'Line-caught sea bass with braised garden carrots, fennel crisp, and citrus herb reduction.',
            tags: ['Gluten-Free', 'High Protein'],
          },
        ],
      };
      setMessages((prev) => [...prev, aiMsg]);
      return;
    }

    if (q.includes('veg') || q.includes('keto') || q.includes('healthy') || q.includes('salad')) {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: "🌱 Here are our organic, keto-friendly and vegetarian options made with farm-to-table ingredients:",
        timestamp,
        dishes: [
          {
            id: 'arancini-truffle-1',
            name: 'Arancini al Tartufo',
            price: 30.5,
            image: '/images/slide1.jpg',
            description: 'Crisp black truffle risotto croquettes with aged parmesan and warm roasted garlic aioli.',
            tags: ['Vegetarian', 'Organic'],
          },
        ],
      };
      setMessages((prev) => [...prev, aiMsg]);
      return;
    }

    if (q.includes('wine') || q.includes('drink') || q.includes('cocktail')) {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: "🍷 **Sommelier Pairing Recommendations:**\n\n• **For Burgers & Red Meat:** 2021 Tuscan Chianti Classico Riserva — rich blackberry & oak notes.\n• **For Seafood & Light Bites:** 2022 Oaked Chardonnay or Crisp Pinot Grigio.\n\nWould you like me to add a glass or bottle to your table order?",
        timestamp,
      };
      setMessages((prev) => [...prev, aiMsg]);
      return;
    }

    // Default friendly assistant reply
    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `Got it! I've noted that for **${activeTable}**. You can explore our complete menu, customize toppings, or let me know if you have specific dietary requests like nut-free or dairy-free.`,
      timestamp,
    };
    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleQuickAdd = (dish: NonNullable<Message['dishes']>[0]) => {
    addToCart({
      id: dish.id,
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      image: dish.image,
      quantity: 1,
      subtitle: dish.tags ? dish.tags.join(' • ') : 'Chef Recommendation',
    });

    setAddedItemIds((prev) => ({ ...prev, [dish.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [dish.id]: false }));
    }, 2500);
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="w-full min-h-[100dvh] bg-neutral-950 text-white flex flex-col justify-between font-sans selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      
      {/* 1. MESSENGER HEADER */}
      <header className="sticky top-0 z-40 w-full max-w-2xl mx-auto bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-800/80 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-lg">
        {/* Left: Back button + Avatar & Active Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 active:scale-95 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* AI Avatar */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-[1.5px] shadow-md">
              <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              </div>
            </div>
            {/* Active Green Dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-neutral-900 rounded-full animate-pulse" />
          </div>

          {/* Name & Table Info */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-white text-xs sm:text-sm font-semibold font-montserrat truncate">
                Tavonza AI Concierge
              </span>
              <span className="px-1.5 py-0.2 bg-yellow-400/20 text-yellow-400 text-[9px] sm:text-[10px] font-bold rounded shrink-0">
                BOT
              </span>
            </div>
            <span className="text-emerald-400 text-[11px] sm:text-xs font-inter flex items-center gap-1 truncate">
              <span>Active now</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400 truncate">{activeTable}</span>
            </span>
          </div>
        </div>

        {/* Right Action Icons: Call Waiter & Clear */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSendMessage('Please call our waiter to Table ' + activeTable)}
            className="px-2 sm:px-2.5 py-1.5 bg-neutral-800 hover:bg-yellow-400/20 hover:text-yellow-400 border border-neutral-700/60 rounded-lg text-xs font-medium font-inter flex items-center gap-1.5 text-zinc-300 transition cursor-pointer"
            title="Call server to table"
          >
            <Bell className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span className="hidden sm:inline">Call Waiter</span>
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            className="w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer shrink-0"
            title="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* WAITER NOTIFICATION TOAST */}
      {showWaiterAlert && (
        <div className="fixed top-16 sm:top-18 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="p-3 bg-amber-500 text-neutral-950 font-inter text-xs font-semibold rounded-xl shadow-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-4 h-4 animate-bounce shrink-0" />
              <span className="truncate">Server alerted for {activeTable}. They are on their way!</span>
            </div>
            <button
              onClick={() => setShowWaiterAlert(false)}
              className="text-black font-bold px-1 shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. CHAT TIMELINE / MESSAGES BODY */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-3.5 sm:gap-4 overflow-y-auto overflow-x-hidden min-w-0">
        
        {/* Date divider */}
        <div className="flex items-center justify-center my-0.5">
          <span className="px-3 py-1 bg-neutral-900 border border-neutral-800/80 rounded-full text-[10px] sm:text-[11px] font-medium text-zinc-400 font-inter">
            Today • Real-time AI Assistant
          </span>
        </div>

        {/* Message stream */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          if (isUser) {
            return (
              <div
                key={msg.id}
                className="flex items-end justify-end self-end w-full max-w-[85%] sm:max-w-[75%] min-w-0"
              >
                <div className="flex flex-col gap-1 items-end min-w-0 max-w-full">
                  <div className="w-auto max-w-full p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed bg-yellow-400 text-neutral-950 font-medium rounded-2xl rounded-tr-xs shadow-md font-inter break-words overflow-hidden">
                    <p className="whitespace-pre-line break-words">{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 px-1 justify-end">
                    <span>{msg.timestamp}</span>
                    <CheckCheck className="w-3 h-3 text-yellow-400/80" />
                  </div>
                </div>
              </div>
            );
          }

          // AI Message
          return (
            <div
              key={msg.id}
              className="flex items-start gap-2 sm:gap-2.5 justify-start self-start w-full max-w-[94%] sm:max-w-[85%] min-w-0"
            >
              {/* Bot Avatar on left for AI messages */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-900 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              </div>

              {/* Message Bubble + Inner Content */}
              <div className="flex-1 min-w-0 max-w-full flex flex-col gap-1">
                <div className="w-full min-w-0 max-w-full p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-2xl rounded-tl-xs shadow-md font-inter overflow-hidden break-words">
                  <p className="whitespace-pre-line break-words">{msg.text}</p>

                  {/* Interactive Recommended Dish Cards in message */}
                  {msg.dishes && msg.dishes.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2.5 w-full min-w-0">
                      {msg.dishes.map((dish) => {
                        const isAdded = addedItemIds[dish.id];

                        return (
                          <div
                            key={dish.id}
                            className="w-full min-w-0 bg-neutral-950/90 border border-neutral-800 rounded-xl p-2.5 flex items-center gap-2.5 sm:gap-3 shadow-inner overflow-hidden"
                          >
                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 bg-neutral-900">
                              <Image
                                src={dish.image}
                                alt={dish.name}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <span className="text-white text-xs font-semibold truncate font-inter">
                                {dish.name}
                              </span>
                              <p className="text-zinc-400 text-[10px] sm:text-[11px] line-clamp-2 font-inter leading-snug mt-0.5">
                                {dish.description}
                              </p>
                              <div className="flex items-center justify-between gap-2 mt-2">
                                <span className="text-yellow-400 text-xs sm:text-sm font-bold font-poppins shrink-0">
                                  ${dish.price.toFixed(2)}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleQuickAdd(dish)}
                                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer shrink-0 ${
                                    isAdded
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-yellow-400 hover:bg-yellow-300 text-neutral-950'
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Added</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      <span>Add to Cart</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 px-1 justify-start">
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 self-start min-w-0">
            <div className="w-7 h-7 rounded-full bg-neutral-900 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <div className="px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-md">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* 3. QUICK PROMPT SUGGESTION CHIPS */}
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-1.5 min-w-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 min-w-0">
          {SUGGESTION_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip.query)}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-yellow-400/40 active:scale-95 text-xs text-zinc-300 hover:text-white rounded-full whitespace-nowrap transition cursor-pointer shadow-sm flex items-center gap-1 font-inter shrink-0"
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. MESSENGER BOTTOM INPUT BAR */}
      <footer className="sticky bottom-0 z-40 w-full max-w-2xl mx-auto bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800 px-3 sm:px-4 py-2.5 sm:py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 sm:gap-2.5 min-w-0"
        >
          {/* Menu / Voice Button */}
          <button
            type="button"
            onClick={() => handleSendMessage("What's your chef special for today?")}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-800/90 hover:bg-neutral-700 text-zinc-300 hover:text-white flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer"
            title="Chef Recommendation"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative flex items-center min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything (allergens, wine, dishes)..."
              className="w-full py-2 sm:py-2.5 pl-3.5 sm:pl-4 pr-3.5 sm:pr-4 bg-neutral-950 border border-neutral-800 focus:border-yellow-400/60 rounded-full text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none transition font-inter min-w-0"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer shadow-md ${
              inputText.trim()
                ? 'bg-yellow-400 hover:bg-yellow-300 text-neutral-950 shadow-yellow-500/20'
                : 'bg-neutral-800 text-zinc-600 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </footer>

    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-neutral-950 flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}

