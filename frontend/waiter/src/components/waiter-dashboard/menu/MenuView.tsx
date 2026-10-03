'use client';

import React, { useState } from 'react';
import {
  Search,
  Utensils,
  Wine,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  Flame,
  Info,
} from 'lucide-react';

export interface DishItem {
  id: string;
  name: string;
  category: 'Appetizers' | 'Mains' | 'Savory' | 'Desserts' | 'Drinks';
  badge?: "Chef's Pick" | 'Popular';
  description: string;
  price: number;
  status: 'Available' | "86'd";
  imageUrl: string;
  allergens?: string[];
  pairing?: string;
  prepTime?: string;
}

export const initialDishes: DishItem[] = [
  // --- Appetizers ---
  {
    id: 'dish-1',
    name: 'Tuna Tartare',
    category: 'Appetizers',
    badge: "Chef's Pick",
    description: 'Yellowfin tuna, avocado, sesame oil, wonton crisps',
    price: 18.0,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
    allergens: ['Fish', 'Sesame', 'Gluten'],
    pairing: 'Crisp Sauvignon Blanc or Dry Prosecco',
    prepTime: '6-8 min',
  },
  {
    id: 'dish-2',
    name: 'Lobster Bisque',
    category: 'Appetizers',
    description: 'Rich bisque, cognac cream, chive oil, sourdough toast',
    price: 18.5,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
    allergens: ['Shellfish', 'Dairy', 'Gluten'],
    pairing: 'Chardonnay or Viognier',
    prepTime: '8-10 min',
  },
  {
    id: 'dish-3',
    name: 'Caesar Salad',
    category: 'Appetizers',
    description: 'Romaine, house-made dressing, anchovy, parmesan, croutons',
    price: 16.0,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=80',
    allergens: ['Dairy', 'Eggs', 'Fish', 'Gluten'],
    pairing: 'Pinot Grigio',
    prepTime: '5-7 min',
  },
  {
    id: 'dish-4',
    name: 'Garlic Bread',
    category: 'Appetizers',
    badge: 'Popular',
    description: 'Toasted sourdough, roasted garlic butter, herbs',
    price: 9.0,
    status: "86'd",
    imageUrl: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=600&auto=format&fit=crop&q=80',
    allergens: ['Dairy', 'Gluten'],
    pairing: 'House Red or Chianti',
    prepTime: '6 min',
  },
  {
    id: 'dish-5',
    name: 'Burrata Caprese',
    category: 'Appetizers',
    badge: "Chef's Pick",
    description: 'Heirloom tomatoes, fresh burrata, basil pesto, aged balsamic',
    price: 22.0,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80',
    allergens: ['Dairy', 'Nuts (Pesto)'],
    pairing: 'Vermentino or Pinot Grigio',
    prepTime: '5 min',
  },
  {
    id: 'dish-6',
    name: 'Oysters Rockefeller',
    category: 'Appetizers',
    badge: 'Popular',
    description: 'Fresh half-shell oysters, creamed spinach, herbs, parmesan',
    price: 24.0,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1533745848184-3db07256e163?w=600&auto=format&fit=crop&q=80',
    allergens: ['Shellfish', 'Dairy'],
    pairing: 'Champagne or Chablis',
    prepTime: '10-12 min',
  },

  // --- Mains ---
  {
    id: 'dish-7',
    name: 'Wagyu Truffle Burger',
    category: 'Mains',
    badge: "Chef's Pick",
    description: 'A5 Wagyu beef patty, black truffle aioli, gruyère, brioche',
    price: 24.5,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    pairing: 'Cabernet Sauvignon or Craft IPA',
    prepTime: '12-15 min',
  },
  {
    id: 'dish-8',
    name: 'Grilled Salmon Risotto',
    category: 'Mains',
    badge: 'Popular',
    description: 'Pan-seared Atlantic salmon, lemon-dill risotto, broccolini',
    price: 28.0,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80',
    allergens: ['Fish', 'Dairy'],
    pairing: 'Marlborough Sauvignon Blanc',
    prepTime: '14-16 min',
  },
  {
    id: 'dish-9',
    name: 'Artisan Margherita Pizza',
    category: 'Mains',
    description: 'San Marzano DOP tomatoes, buffalo mozzarella, fresh basil',
    price: 18.0,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80',
    allergens: ['Dairy', 'Gluten'],
    pairing: 'Chianti Classico DOCG',
    prepTime: '10-12 min',
  },
  {
    id: 'dish-10',
    name: 'Tomahawk Steak (32oz)',
    category: 'Mains',
    badge: 'Popular',
    description: 'Prime bone-in ribeye, rosemary garlic butter, roasted marrow',
    price: 185.0,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    allergens: ['Dairy'],
    pairing: 'Bordeaux 2018 or Barolo',
    prepTime: '22-26 min',
  },

  // --- Savory ---
  {
    id: 'dish-11',
    name: 'Truffle Mac & Cheese',
    category: 'Savory',
    badge: 'Popular',
    description: 'Aged white cheddar, fontina, black summer truffle, panko',
    price: 18.0,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&auto=format&fit=crop&q=80',
    allergens: ['Dairy', 'Gluten'],
    pairing: 'Oaked Chardonnay',
    prepTime: '10 min',
  },
  {
    id: 'dish-12',
    name: 'Charcuterie & Cheese Board',
    category: 'Savory',
    badge: "Chef's Pick",
    description: 'Prosciutto di Parma, Spanish chorizo, truffle pecorino, figs',
    price: 34.0,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    allergens: ['Dairy', 'Nuts', 'Gluten'],
    pairing: 'Pinot Noir or Nebbiolo',
    prepTime: '8 min',
  },

  // --- Desserts ---
  {
    id: 'dish-13',
    name: 'Warm Chocolate Lava Cake',
    category: 'Desserts',
    badge: 'Popular',
    description: 'Valrhona molten dark chocolate cake, Madagascar vanilla gelato',
    price: 14.0,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    allergens: ['Dairy', 'Eggs', 'Gluten'],
    pairing: 'Tawny Port 10yr or Espresso',
    prepTime: '8 min',
  },
  {
    id: 'dish-14',
    name: 'Tiramisu Classico',
    category: 'Desserts',
    description: 'Espresso soaked savoiardi, zabaglione cream, cocoa dust',
    price: 12.0,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
    allergens: ['Dairy', 'Eggs', 'Gluten'],
    pairing: 'Amaretto or Cappuccino',
    prepTime: '5 min',
  },

  // --- Drinks ---
  {
    id: 'dish-15',
    name: 'Chianti Classico DOCG',
    category: 'Drinks',
    badge: "Chef's Pick",
    description: 'Full-bodied ruby Tuscan red, notes of wild cherry & spice',
    price: 26.0,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80',
    pairing: 'Steak, Pasta, Charcuterie',
    prepTime: '2 min',
  },
  {
    id: 'dish-16',
    name: 'Smoked Old Fashioned',
    category: 'Drinks',
    badge: 'Popular',
    description: 'Bourbon whiskey, smoked applewood, bitters, charred orange',
    price: 16.0,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80',
    pairing: 'Prime Steaks & Truffle Fries',
    prepTime: '4 min',
  },
];

export default function MenuView() {
  const [selectedCategory, setSelectedCategory] = useState<
    'Appetizers' | 'Mains' | 'Savory' | 'Desserts' | 'Drinks'
  >('Appetizers');
  const [searchQuery, setSearchQuery] = useState('');
  const [dishes, setDishes] = useState<DishItem[]>(initialDishes);
  const [activeModalDish, setActiveModalDish] = useState<DishItem | null>(null);

  const categories: Array<'Appetizers' | 'Mains' | 'Savory' | 'Desserts' | 'Drinks'> = [
    'Appetizers',
    'Mains',
    'Savory',
    'Desserts',
    'Drinks',
  ];

  const filteredDishes = dishes.filter((d) => {
    const matchesCat = d.category === selectedCategory;
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.allergens && d.allergens.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (d.pairing && d.pairing.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleToggle86 = (id: string) => {
    setDishes((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'Available' ? "86'd" : 'Available';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
    if (activeModalDish && activeModalDish.id === id) {
      setActiveModalDish((prev) =>
        prev ? { ...prev, status: prev.status === 'Available' ? "86'd" : 'Available' } : null
      );
    }
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* 1. Page Title & Subtitle */}
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9">
          Menu
        </h1>
        <p className="text-slate-500 text-lg font-normal font-['Inter'] leading-6 mt-1">
          Live kitchen availability, allergen indicators, and wine pairings
        </p>
      </div>

      {/* 2. Top Bar: Category Filter Tabs + Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="inline-flex rounded-lg overflow-hidden border border-white/20 bg-zinc-950/60 shadow-lg">
          {categories.map((cat, idx) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`h-9 px-3.5 py-2 text-base font-normal font-['Inter'] transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap ${
                  idx !== 0 ? 'border-l border-white/20' : ''
                } ${
                  isActive
                    ? 'bg-yellow-500 text-white font-semibold shadow-inner'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input Bar */}
        <div className="w-full md:w-96 h-10 px-4 bg-zinc-900 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-stone-300/10 flex items-center gap-3.5">
          <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Items..."
            className="w-full bg-transparent border-none text-white text-base font-normal font-['Inter'] placeholder-zinc-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-zinc-500 hover:text-white text-sm cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 3. Menu Item Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredDishes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white/5 rounded-2xl border border-white/10">
            <Utensils className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-base font-medium font-['Inter']">No dishes matching &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          filteredDishes.map((dish) => {
            const is86 = dish.status === "86'd";
            return (
              <div
                key={dish.id}
                onClick={() => setActiveModalDish(dish)}
                className="bg-[#121214] sm:bg-white/5 rounded-[14px] outline outline-1 outline-offset-[-1px] outline-white/10 hover:outline-amber-500 hover:shadow-lg hover:shadow-amber-500/10 backdrop-blur-[10.20px] overflow-hidden flex flex-col justify-between p-3.5 transition-all duration-200 cursor-pointer group h-[300px]"
              >
                {/* Top Image Container */}
                <div className="w-full h-36 bg-neutral-900 rounded-[10px] overflow-hidden relative flex-shrink-0">
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Subtle 86 overlay if out of stock */}
                  {is86 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-400 font-bold text-sm rounded-full uppercase tracking-wider">
                        86&apos;d · Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Middle Info (Title, Badge, Description) */}
                <div className="flex-1 pt-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-white text-lg font-bold font-['Inter'] leading-5 truncate">
                        {dish.name}
                      </h3>
                      {dish.badge && (
                        <span className="px-1.5 py-0.5 bg-amber-500/20 rounded-sm text-amber-500 text-[10px] font-bold font-['DM_Sans'] uppercase leading-3 flex-shrink-0">
                          {dish.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm font-normal font-['Inter'] leading-4 line-clamp-2 mt-1">
                      {dish.description}
                    </p>
                  </div>

                  {/* Bottom: Price + Availability Tag */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <span className="text-white text-base font-bold font-['Inter']">
                      ${dish.price.toFixed(2)}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium font-['DM_Sans'] leading-4 ${
                        is86
                          ? 'bg-orange-600/10 text-orange-500 border border-orange-600/20'
                          : 'bg-green-500/10 text-emerald-400 border border-green-500/20'
                      }`}
                    >
                      {dish.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Dish Detail & Sommelier Pairing Modal */}
      {activeModalDish && (
        <div className="fixed top-20 left-0 md:left-72 right-0 bottom-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-[480px] bg-[#18181b] border border-zinc-700/70 rounded-3xl p-6 shadow-2xl space-y-5 text-white relative my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {activeModalDish.name}
                  </h3>
                  {activeModalDish.badge && (
                    <span className="px-2 py-0.5 bg-amber-500/20 rounded-md text-amber-400 text-xs font-bold uppercase">
                      {activeModalDish.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 mt-0.5">
                  Category: {activeModalDish.category} · ${activeModalDish.price.toFixed(2)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalDish(null)}
                className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            {/* Dish Image */}
            <div className="w-full h-44 rounded-2xl overflow-hidden relative border border-zinc-800">
              <img
                src={activeModalDish.imageUrl}
                alt={activeModalDish.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-300 leading-5">
              {activeModalDish.description}
            </p>

            {/* Wine Pairing & Allergens Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {activeModalDish.pairing && (
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-sm text-amber-400 font-semibold">
                    <Wine className="w-3.5 h-3.5" />
                    <span>Sommelier Pairing</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {activeModalDish.pairing}
                  </p>
                </div>
              )}

              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-sm text-rose-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Allergen Notice</span>
                </div>
                <p className="text-xs text-zinc-300">
                  {activeModalDish.allergens ? activeModalDish.allergens.join(', ') : 'None listed'}
                </p>
              </div>
            </div>

            {/* Kitchen Prep Time & Status Toggle */}
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Prep Time: {activeModalDish.prepTime || '8-10 min'}</span>
              </div>

              <button
                type="button"
                onClick={() => handleToggle86(activeModalDish.id)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                  activeModalDish.status === "86'd"
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-emerald-400 border border-green-500/40 hover:bg-green-500/30'
                }`}
              >
                Status: {activeModalDish.status} (Toggle 86)
              </button>
            </div>

            {/* Done Action Button */}
            <button
              type="button"
              onClick={() => setActiveModalDish(null)}
              className="w-full h-11 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-white font-bold text-base rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-400/20"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
