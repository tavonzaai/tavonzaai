'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Send,
  Plus,
  Minus,
  Utensils,
  Leaf,
  Wine,
  Flame,
  CheckCircle2,
  X,
  Bot,
} from 'lucide-react';
import { MenuItem, OrderTicketItem } from '../types';
import { initialMenuItems } from '../data';

interface TakingOrderViewProps {
  tableNumber?: number;
  onCancel: () => void;
  onFireOrder: (tableNumber: number, items: OrderTicketItem[], total: number) => void;
  onShowToast: (message: string) => void;
}

const CATEGORIES = [
  'Starters',
  'Mains',
  'Desserts',
  'Cocktails & Wine',
  'Non-Alcoholic',
  'Chef Specials',
] as const;

export default function TakingOrderView({
  tableNumber = 2,
  onCancel,
  onFireOrder,
  onShowToast,
}: TakingOrderViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Starters');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Initial ticket items as shown in Figma screenshot ("02 items", Truffle Margherita)
  const [ticketItems, setTicketItems] = useState<OrderTicketItem[]>([
    {
      id: 'ticket-1',
      menuItemId: 'm-1',
      name: 'Truffle Margherita',
      price: 30.5,
      quantity: 1,
      allergyNote: '',
    },
    {
      id: 'ticket-2',
      menuItemId: 'm-2',
      name: 'Burrata & Heirloom Tomatoes',
      price: 18.5,
      quantity: 1,
      allergyNote: 'Gluten-Free guest: serve with GF crackers.',
    },
  ]);

  // Filtered dishes
  const filteredMenuItems = useMemo(() => {
    return initialMenuItems.filter((item) => {
      const matchesCategory = item.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dietaryTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Add or increment item
  const handleAddItem = (item: MenuItem) => {
    setTicketItems((prev) => {
      const existing = prev.find((t) => t.menuItemId === item.id);
      if (existing) {
        return prev.map((t) =>
          t.menuItemId === item.id ? { ...t, quantity: t.quantity + 1 } : t
        );
      }
      return [
        ...prev,
        {
          id: `ticket-${Date.now()}-${item.id}`,
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          allergyNote: '',
        },
      ];
    });
    onShowToast(`Added "${item.name}" to Table ${tableNumber} ticket!`);
  };

  // Decrement or remove item
  const handleDecrementItem = (menuItemId: string) => {
    setTicketItems((prev) => {
      const existing = prev.find((t) => t.menuItemId === menuItemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((t) => t.menuItemId !== menuItemId);
      }
      return prev.map((t) =>
        t.menuItemId === menuItemId ? { ...t, quantity: t.quantity - 1 } : t
      );
    });
  };

  // Update allergy note
  const handleUpdateNote = (ticketId: string, note: string) => {
    setTicketItems((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, allergyNote: note } : t))
    );
  };

  // Ask AI natural language parser
  const handleAskAI = () => {
    if (!aiPrompt.trim()) {
      setAiSuggestion(
        'AI Recommendation: For Prime Wagyu Ribeye, recommend pairing with our 2018 Barolo DOCG. Sea Bass is 100% nut-free and dairy-free on request.'
      );
      return;
    }
    const lower = aiPrompt.toLowerCase();
    if (lower.includes('gluten') || lower.includes('ribeye')) {
      setAiSuggestion(
        'AI Pairing: For gluten-free guests enjoying the Ribeye, recommend the Barolo DOCG 2018 (bold tannins) or Hamachi Crudo as starter. Both are certified 100% gluten-free.'
      );
    } else if (lower.includes('wine') || lower.includes('pairing')) {
      setAiSuggestion(
        'AI Sommelier: Barolo DOCG 2018 pairs harmoniously with red meats, while the Smoked Rosemary Old Fashioned accentuates truffle starters.'
      );
    } else {
      setAiSuggestion(
        `AI Match for "${aiPrompt}": Identified dietary preferences. Filtered 3 recommended appetizers and paired wines.`
      );
    }
    onShowToast('Tavonza AI generated personalized dining and allergen recommendations!');
  };

  // Calculations
  const subtotal = ticketItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemCount = ticketItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleFireTicket = () => {
    if (ticketItems.length === 0) {
      onShowToast('Cannot fire empty ticket. Please select items.');
      return;
    }
    onFireOrder(tableNumber, ticketItems, subtotal);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Banner: Taking Order Header (From Figma) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[12px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-xl sm:text-2xl font-semibold font-['Inter']">
              Taking Order for Table {tableNumber}
            </h2>
            <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/30 rounded text-emerald-400 text-xs font-medium font-['DM_Sans']">
              4 Guests
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm font-normal font-['Inter']">
            Assigned: Alex Rivera (You)
          </p>
        </div>

        <button
          onClick={onCancel}
          className="px-3.5 py-1.5 bg-amber-500/5 hover:bg-neutral-800 active:scale-[0.98] border border-neutral-700 rounded-md text-white text-xs font-normal font-['Inter'] transition-colors cursor-pointer self-start sm:self-auto"
        >
          Cancel
        </button>
      </div>

      {/* 2. AI Natural Language Parser for Menu (From Figma) */}
      <div className="bg-zinc-900 border border-neutral-700/80 rounded-[12px] p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-amber-500 text-sm font-medium font-['Inter']">
              Tavonza AI Natural Language Parser
            </span>
          </div>
          <span className="text-zinc-500 text-xs hidden sm:inline font-['Inter']">
            Autonomous Allergen &amp; Pairing Assistant
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="flex-1 w-full bg-black border border-neutral-700 rounded-lg px-3.5 py-2.5 flex items-center">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Guest is gluten-Free and wants a wine pairing for ribeye....."
              className="w-full bg-transparent text-xs sm:text-sm text-zinc-200 placeholder:text-neutral-500 focus:outline-none font-['Inter']"
            />
          </div>

          <button
            onClick={handleAskAI}
            className="w-full sm:w-auto h-10 px-5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] rounded-lg text-black font-semibold text-xs font-['Inter'] transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>
        </div>

        {aiSuggestion && (
          <div className="p-3 rounded-lg bg-[#1a1a1e] border border-amber-500/30 text-xs text-amber-300 flex items-start justify-between gap-2 animate-in fade-in">
            <p className="leading-relaxed">{aiSuggestion}</p>
            <button
              onClick={() => setAiSuggestion(null)}
              className="text-zinc-400 hover:text-white shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Category Filter Tabs (From Figma) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 font-semibold'
                  : 'bg-stone-900 text-zinc-400 hover:text-zinc-200 hover:bg-stone-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 4. Search Filter Bar */}
      <div className="w-full max-w-xl relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search dishes, cocktails, or dietary tags..."
          className="w-full h-10 pl-10 pr-4 bg-zinc-900 border border-neutral-800 rounded-lg text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 font-['Inter']"
        />
      </div>

      {/* 5. Main Split Layout: Dishes Grid (Left) & Live Order Ticket (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Dishes Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredMenuItems.map((item) => {
            const ticketItem = ticketItems.find((t) => t.menuItemId === item.id);
            const quantity = ticketItem ? ticketItem.quantity : 0;

            return (
              <div
                key={item.id}
                className="bg-neutral-900 border border-neutral-800/90 rounded-[12px] p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-neutral-700 transition-all group"
              >
                <div className="flex items-start gap-3">
                  {/* Dish Visual Emblem */}
                  <div className="w-16 h-16 rounded-xl bg-neutral-800 border border-neutral-700/80 flex items-center justify-center text-amber-500 shrink-0 shadow-inner">
                    {item.category === 'Cocktails & Wine' ? (
                      <Wine className="w-7 h-7 text-amber-400" />
                    ) : item.category === 'Desserts' ? (
                      <Flame className="w-7 h-7 text-amber-400" />
                    ) : (
                      <Utensils className="w-7 h-7 text-amber-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-white text-sm sm:text-base font-semibold font-['Montserrat'] tracking-tight truncate group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-zinc-400 text-xs font-normal line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Dietary Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {item.dietaryTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[9px] font-semibold text-emerald-400 flex items-center gap-1 uppercase tracking-wider"
                        >
                          <Leaf className="w-2.5 h-2.5 text-emerald-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price and Quantity / Add Stepper */}
                <div className="border-t border-neutral-800/80 pt-3 flex items-center justify-between">
                  <span className="text-amber-500 text-base font-bold font-['DM_Sans'] font-mono">
                    ${item.price.toFixed(2)}
                  </span>

                  {quantity === 0 ? (
                    <button
                      onClick={() => handleAddItem(item)}
                      className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-400 active:scale-[0.98] rounded-full text-white text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-sm shadow-orange-500/20"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      <span>Add</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-full px-2 py-1">
                      <button
                        onClick={() => handleDecrementItem(item.id)}
                        className="w-5 h-5 rounded-full bg-orange-500/30 hover:bg-orange-500/50 text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-white text-xs font-bold font-mono px-1">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleAddItem(item)}
                        className="w-5 h-5 rounded-full bg-orange-500 hover:bg-orange-400 text-black flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Live Order Ticket (From Figma) */}
        <div className="lg:col-span-4 bg-zinc-900 border border-white/20 rounded-[12px] p-4 sm:p-5 flex flex-col space-y-4 shadow-xl sticky top-24">
          {/* Ticket Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-white text-base font-semibold font-['Inter']">Order Ticket</h3>
              <p className="text-zinc-500 text-[11px]">Table {tableNumber} · Dining Station</p>
            </div>
            <span className="text-amber-500 text-xs font-semibold font-['Inter'] font-mono">
              {totalItemCount < 10 ? `0${totalItemCount}` : totalItemCount} items
            </span>
          </div>

          {/* Ticket Items List */}
          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
            {ticketItems.length > 0 ? (
              ticketItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#18181c] border border-zinc-800/90 rounded-lg p-3 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold font-['Montserrat'] truncate max-w-[140px]">
                      {item.name}
                    </span>
                    <span className="text-amber-400 font-bold font-mono">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Stepper inside ticket */}
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px]">${item.price.toFixed(2)} each</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecrementItem(item.menuItemId)}
                        className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-white font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => {
                          const original = initialMenuItems.find((m) => m.id === item.menuItemId);
                          if (original) handleAddItem(original);
                        }}
                        className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* Special Allergy Note Input (From Figma) */}
                  <input
                    type="text"
                    value={item.allergyNote}
                    onChange={(e) => handleUpdateNote(item.id, e.target.value)}
                    placeholder="Add Special Allergy Note..."
                    className="w-full h-7 px-2 bg-black border border-neutral-700 rounded text-[10px] text-zinc-200 placeholder:text-neutral-500 focus:outline-none font-['Inter']"
                  />
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No items added yet. Tap items from the menu to start order.
              </div>
            )}
          </div>

          {/* Subtotal & Summary */}
          <div className="border-t border-neutral-800 pt-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Subtotal</span>
              <span className="text-white font-semibold font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Estimated Tax (8.875%)</span>
              <span className="text-white font-semibold font-mono">
                ${(subtotal * 0.08875).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
              <span className="text-zinc-200 font-bold">Total Bill</span>
              <span className="text-amber-500 text-base font-bold font-['DM_Sans'] font-mono">
                ${(subtotal * 1.08875).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Primary Action: Fire Order Button (From Figma) */}
          <button
            onClick={handleFireTicket}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-semibold text-xs sm:text-sm font-['DM_Sans'] rounded-[8px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Send className="w-4 h-4 text-black" />
            <span>Fire Order To Kitchen / Bar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
