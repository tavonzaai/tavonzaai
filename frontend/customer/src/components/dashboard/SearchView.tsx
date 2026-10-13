'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Star,
  Clock,
  Compass,
  UtensilsCrossed,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { fetchMenuItems } from '@/redux/features/menu-items/menuItemApi';
import { fetchMenuCategories } from '@/redux/features/menu-category/menuCategoryApi';
import { getItemImage, getCategoryIcon } from '@/lib/menuUtils';
import { useCart } from '@/context/CartContext';

interface SearchViewProps {
  onReserveClick?: () => void;
  onDishClick?: () => void;
}

export default function SearchView({ onReserveClick, onDishClick }: SearchViewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { addToCart } = useCart();

  const { items: backendItems, loading: itemsLoading, meta: itemsMeta } = useAppSelector(
    (state) => state.menuItems
  );
  const { categories: backendCategories } = useAppSelector((state) => state.menuCategories);

  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Categories from Backend API on mount & whenever categorySearchQuery changes
  useEffect(() => {
    dispatch(
      fetchMenuCategories({
        page: 1,
        limit: 10,
        searchTerm: categorySearchQuery.trim() || undefined,
      })
    );
  }, [dispatch, categorySearchQuery]);

  // Reset pagination to page 1 on query or category change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Fetch Items from Backend GET API with searchTerm and 10 items limit per page
  useEffect(() => {
    dispatch(
      fetchMenuItems({
        page: currentPage,
        limit: 10,
        searchTerm: searchQuery.trim() || undefined,
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
      })
    );
  }, [dispatch, currentPage, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const list = (backendCategories || []).map((c) => ({
      id: c.id,
      name: c.name,
      icon: getCategoryIcon(c.name),
    }));
    const allList = [{ id: 'all', name: 'ALL', icon: '🍽️' }, ...list];
    if (!categorySearchQuery.trim()) return allList;
    return allList.filter((cat) =>
      cat.name.toLowerCase().includes(categorySearchQuery.trim().toLowerCase())
    );
  }, [backendCategories, categorySearchQuery]);

  const totalItems = itemsMeta?.total ?? itemsMeta?.totalCount ?? backendItems.length;
  const totalPages = itemsMeta?.totalPages || Math.max(1, Math.ceil(totalItems / 10));

  const handleOpenDish = (id: string) => {
    router.push(`/dish-detail?dish=${encodeURIComponent(id)}`);
  };

  return (
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto min-h-screen bg-black text-white flex flex-col justify-between relative overflow-x-hidden font-sans">
      <div className="w-full flex-1 flex flex-col gap-5 pb-12 pt-2">

        {/* 1. Header Hero Banner with Back Button */}
        <div className="w-full p-5 bg-gradient-to-br from-neutral-900 to-neutral-800/20 border-b border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-white hover:text-yellow-400 transition cursor-pointer group"
            >
              <div className="w-7 h-7 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center group-hover:border-yellow-400/50 transition">
                <ArrowLeft className="w-3.5 h-3.5 text-white group-hover:text-yellow-400 transition" />
              </div>
              <span className="text-white text-xs font-semibold font-montserrat">
                Back
              </span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-neutral-700 w-fit">
              <Compass className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-yellow-400 text-[10px] font-semibold font-['Inter']">
                Backend Live Search
              </span>
            </div>
          </div>

          <h2 className="text-base font-semibold text-white font-['Inter']">
            Explore Menu & Culinary Dishes
          </h2>

          <p className="text-xs text-neutral-400 leading-relaxed font-['Poppins']">
            Search items in real-time with dynamic backend pagination (10 items per page limit).
          </p>
        </div>

        {/* 2. Filter & Category Section with Section Input Field */}
        <div className="mx-5 bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
          {/* Category Header with Search Input Field beside Title */}
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-xs font-semibold text-yellow-400 font-['Inter'] shrink-0">
              Categories ({backendCategories.length} live)
            </h4>

            {/* Input field beside Category Title */}
            <div className="flex-1 max-w-xs px-2.5 py-1 bg-black/60 rounded-xl border border-zinc-800 flex items-center gap-1.5 focus-within:border-yellow-400/50 transition">
              <Search className="w-3 h-3 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                placeholder="Filter categories..."
                className="w-full bg-transparent text-xs text-gray-200 placeholder:text-gray-500 font-['Montserrat'] focus:outline-none"
              />
              {categorySearchQuery && (
                <button
                  onClick={() => setCategorySearchQuery('')}
                  className="text-[10px] text-zinc-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium font-['Montserrat'] whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-yellow-400 text-black font-semibold shadow-md shadow-yellow-500/20'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
              >
                <span className="mr-1.5">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Items Section with Search Input Field beside Section Title */}
        <div className="flex flex-col gap-3.5 px-5">
          {/* Items Section Header with Search Input Field beside Title */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 shrink-0">
              <h3 className="text-sm font-semibold text-white font-['Inter']">
                Backend Items
              </h3>
              <span className="text-xs text-neutral-400 font-mono">
                ({totalItems} found)
              </span>
            </div>

            {/* Search Input Field beside Item Section Title */}
            <div className="flex-1 max-w-xs px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-2 focus-within:border-yellow-400/50 transition shadow-inner">
              <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items by name..."
                className="w-full bg-transparent text-xs text-gray-200 placeholder:text-gray-400 font-['Montserrat'] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] text-zinc-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {itemsLoading ? (
            <div className="w-full py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-7 h-7 text-yellow-400 animate-spin" />
              <p className="text-xs text-zinc-400">Searching menu items...</p>
            </div>
          ) : backendItems.length === 0 ? (
            <div className="w-full py-12 flex flex-col items-center justify-center gap-2 bg-neutral-900/50 rounded-2xl border border-neutral-800">
              <UtensilsCrossed className="w-8 h-8 text-zinc-500 mb-1" />
              <p className="text-sm font-medium text-zinc-300 font-poppins">No items found</p>
              <p className="text-xs text-zinc-500 font-poppins">Try adjusting your search query or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {backendItems.map((item) => {
                const imageUrl = getItemImage(item.name, item.category?.name, item.imageUrl);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenDish(item.id)}
                    className="w-full bg-neutral-900 rounded-2xl border border-neutral-800/80 p-3.5 pr-4 flex items-center justify-between gap-3 hover:border-yellow-400/40 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-950">
                        <Image
                          src={imageUrl}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="flex flex-col gap-1 min-w-0">
                        <h4 className="text-white text-sm font-medium font-inter truncate group-hover:text-yellow-300 transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-zinc-400 text-xs font-normal font-poppins truncate">
                          {item.description || item.category?.name || 'Fresh Item'}
                        </p>
                        <div className="flex items-center gap-1 text-orange-400 text-sm font-medium font-poppins">
                          <span>$</span>
                          <span className="text-white">{(item.basePrice || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                          id: item.id,
                          dishId: item.id,
                          name: item.name,
                          subtitle: item.description || '',
                          price: item.basePrice || 0,
                          image: imageUrl,
                          quantity: 1,
                        });
                      }}
                      className="w-8 h-8 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black flex items-center justify-center font-bold shrink-0 transition"
                      title="Add to Cart"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 10 per page limit Pagination controls */}
          {backendItems.length > 0 && (
            <div className="w-full flex items-center justify-between pt-4 pb-2 border-t border-neutral-800 mt-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage <= 1 || itemsLoading}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-white hover:bg-neutral-800 hover:border-yellow-400/40 disabled:opacity-40 disabled:hover:bg-neutral-900 transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-yellow-400" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs font-poppins">
                <span className="text-zinc-400 font-medium">Page</span>
                <span className="text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30">
                  {currentPage}
                </span>
                <span className="text-zinc-400 font-medium">of {totalPages}</span>
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages || itemsLoading}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-white hover:bg-neutral-800 hover:border-yellow-400/40 disabled:opacity-40 disabled:hover:bg-neutral-900 transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 text-yellow-400" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
