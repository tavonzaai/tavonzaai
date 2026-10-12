'use client';

import React, { useState, useEffect } from 'react';
import { waiterService, getActiveBranchId } from '@/redux/features/waiterApi';
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

export const initialDishes: DishItem[] = [];

export default function MenuView() {
  const [selectedCategory, setSelectedCategory] = useState<
    'Appetizers' | 'Mains' | 'Savory' | 'Desserts' | 'Drinks'
  >('Appetizers');
  const [searchQuery, setSearchQuery] = useState('');
  const [dishes, setDishes] = useState<DishItem[]>(initialDishes);

  useEffect(() => {
    let mounted = true;
    const fetchDishes = async () => {
      try {
        const branchId = getActiveBranchId();
        const items = await waiterService.getMenuItems(branchId);
        if (mounted && Array.isArray(items)) {
          const mapped: DishItem[] = items.map((it: any) => ({
            id: it.id,
            name: it.name,
            category: (['Appetizers', 'Mains', 'Savory', 'Desserts', 'Drinks'].includes(it.categoryName)
              ? it.categoryName
              : 'Mains'),
            badge: it.isPopular ? "Chef's Pick" : undefined,
            description: it.description || '',
            price: Number(it.price) || 0,
            status: it.isAvailable !== false ? 'Available' : "86'd",
            imageUrl: it.imageUrl || it.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
            allergens: it.dietaryTags || [],
            pairing: it.pairing || undefined,
            prepTime: it.prepTimeMinutes ? `${it.prepTimeMinutes} min` : undefined,
          }));
          setDishes(mapped);
        }
      } catch (err) {
        console.error('Failed to load menu dishes:', err);
      }
    };
    fetchDishes();
    return () => {
      mounted = false;
    };
  }, []);
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
