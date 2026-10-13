'use client';

import React, { Suspense, useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Plus,
  Minus,
  Heart,
  ArrowLeft,
  ShoppingBag,
  Loader2,
  UtensilsCrossed,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DraggableAskAi from '@/components/common/DraggableAskAi';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { fetchMenuCategories } from '@/redux/features/menu-category/menuCategoryApi';
import { fetchMenuItems } from '@/redux/features/menu-items/menuItemApi';
import { getCategoryIcon, getItemImage } from '@/lib/menuUtils';
import { getAuthToken, setCookie } from '@/redux/api/baseApi';
import { TavonzaLogoIcon } from '@/components/TavonzaLogo';

interface DisplayMenuItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  category: string;
  categoryName: string;
  image: string;
  popular?: boolean;
  isVegetarian?: boolean;
  spiceLevel?: number | null;
}

interface DisplayCategory {
  id: string;
  name: string;
  icon: string;
}

function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { cart, addToCart, updateQuantity, totalCount, totalAmount, tableNumber } = useCart();

  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  // Redux state for dynamic categories and items
  const { categories: backendCategories, loading: categoriesLoading } = useAppSelector(
    (state) => state.menuCategories
  );
  const { items: backendItems, loading: itemsLoading, meta: itemsMeta } = useAppSelector(
    (state) => state.menuItems
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAllItemsView, setShowAllItemsView] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const activeTable = searchParams.get('table') || tableNumber || '';
  const isConnected = searchParams.get('connected') === 'true' || Boolean(searchParams.get('connect'));

  const tableParam = searchParams.get('table');
  const forwardParam = tableParam ? `?table=${encodeURIComponent(tableParam)}` : '';

  useEffect(() => {
    setMounted(true);
    const tableVal = searchParams.get('table') || searchParams.get('tableNumber');
    const tableIdVal = searchParams.get('tableId');
    const branchIdVal = searchParams.get('branchId');

    const isUUID = (val?: string | null) =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));

    if (branchIdVal && isUUID(branchIdVal)) {
      setCookie('tavonza_branch_id', branchIdVal);
    }
    if (tableIdVal && isUUID(tableIdVal)) {
      setCookie('tavonza_table_id', tableIdVal);
    } else if (tableVal && isUUID(tableVal)) {
      setCookie('tavonza_table_id', tableVal);
    }
    if (tableVal) {
      setCookie('tavonza_table_number', tableVal);
    }
  }, [searchParams]);

  // Fetch dynamic categories via Backend API on mount & on category search
  useEffect(() => {
    if (mounted) {
      dispatch(
        fetchMenuCategories({
          page: 1,
          limit: 10,
          searchTerm: categorySearchQuery.trim() || undefined,
        })
      );
    }
  }, [dispatch, mounted, categorySearchQuery]);

  // Reset pagination to page 1 whenever search query or selected category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Fetch items via Backend Search, Category Filter, and 10 items per page limit
  useEffect(() => {
    if (mounted) {
      dispatch(
        fetchMenuItems({
          page: currentPage,
          limit: 10,
          searchTerm: searchQuery.trim() || undefined,
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
        })
      );
    }
  }, [dispatch, mounted, currentPage, searchQuery, selectedCategory]);

  // Transform dynamic categories with "ALL" chip
  const categories: DisplayCategory[] = useMemo(() => {
    const dynamicCats: DisplayCategory[] = (backendCategories || []).map((c) => ({
      id: c.id,
      name: c.name,
      icon: getCategoryIcon(c.name),
    }));
    const allCats = [{ id: 'all', name: 'ALL', icon: '🍽️' }, ...dynamicCats];
    if (!categorySearchQuery.trim()) return allCats;
    return allCats.filter((cat) =>
      cat.name.toLowerCase().includes(categorySearchQuery.trim().toLowerCase())
    );
  }, [backendCategories, categorySearchQuery]);

  // Transform backend items to standard display items (zero mock fallback)
  const allItems: DisplayMenuItem[] = useMemo(() => {
    return (backendItems || []).map((item) => ({
      id: item.id,
      name: item.name,
      subtitle: item.description || item.category?.name || 'Fresh from kitchen',
      price: item.basePrice || (item as any).price || 0,
      category: item.categoryId,
      categoryName: item.category?.name || '',
      image: getItemImage(item.name, item.category?.name, item.imageUrl),
      popular: item.isAvailable,
      isVegetarian: item.isVegetarian,
      spiceLevel: item.spiceLevel,
    }));
  }, [backendItems]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered items are directly supplied by backend API queries
  const filteredItems = allItems;

  const totalItems = itemsMeta?.total ?? itemsMeta?.totalCount ?? (itemsMeta?.limit ? (itemsMeta?.totalPages || 1) * itemsMeta.limit : backendItems.length);
  const totalPages = itemsMeta?.totalPages || Math.max(1, Math.ceil(totalItems / 10));

  const popularItems = useMemo(() => {
    const pops = allItems.filter((item) => item.popular);
    return pops.length > 0 ? pops : allItems.slice(0, 6);
  }, [allItems]);

  const getItemCartQty = (id: string) => {
    const found = cart.find((i: any) => i.id === id || i.dishId === id);
    return found ? found.quantity : 0;
  };

  const handleQtyChange = (item: DisplayMenuItem, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentQty = getItemCartQty(item.id);
    if (currentQty === 0 && delta > 0) {
      addToCart({
        id: item.id,
        dishId: item.id,
        name: item.name,
        subtitle: item.subtitle,
        price: item.price,
        image: item.image,
        quantity: 1,
      });
    } else if (currentQty > 0) {
      updateQuantity(item.id, delta);
    }
  };

  const openDishDetail = (dishId: string) => {
    router.push(`/dish-detail?dish=${encodeURIComponent(dishId)}&table=${encodeURIComponent(activeTable)}`);
  };

  const isDataLoading = (categoriesLoading || itemsLoading) && allItems.length === 0;

  if (!mounted || !isInitialized) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-stone-300 text-sm font-medium tracking-wide">
          Loading Tavonza Menu...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black text-white relative font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">
      {/* Top Main Container - Centered and fully responsive across mobile, tablet & desktop */}
      <div className="w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-32 flex flex-col gap-6">
        
        {/* HEADER: Brand Logo / Back Button + Table Badge + Cart Icon + Profile Avatar */}
        <header className="w-full flex items-center justify-between pt-1">
          {showAllItemsView ? (
            <button
              onClick={() => setShowAllItemsView(false)}
              className="inline-flex items-center gap-2.5 text-white hover:text-yellow-400 transition cursor-pointer"
            >
              <div className="w-7 h-7 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center">
                <ArrowLeft className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white text-base font-semibold font-montserrat">
                All Items
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <TavonzaLogoIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-white text-base font-bold tracking-tight font-montserrat">
                Tavonza<span className="text-yellow-400">.</span>
              </span>
            </div>
          )}

          {/* Right Header: Table Number Pill + Cart Icon + Profile Avatar Button */}
          <div className="flex items-center gap-2.5">
            {/* Table Number Pill */}
            <div className="px-2.5 py-1.5 bg-neutral-900 rounded-md border border-neutral-800 flex items-center gap-1.5 shadow-sm">
              <span className="text-zinc-400 text-xs font-medium font-poppins">
                {activeTable.startsWith('Table') ? activeTable : `Table ${activeTable}`}
              </span>
            </div>

            {/* Top Cart Icon */}
            <button
              onClick={() => router.push('/cart')}
              className="relative p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-white transition cursor-pointer"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4 text-yellow-400" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Profile Avatar Button (Clicking redirects to Profile Page) */}
            <button
              onClick={() => router.push(`/profile${forwardParam}`)}
              className="relative w-8 h-8 rounded-full bg-neutral-900 border border-yellow-400/60 hover:border-yellow-400 flex items-center justify-center text-yellow-400 transition cursor-pointer overflow-hidden shadow-sm hover:scale-105 active:scale-95 shrink-0"
              title="View Profile"
            >
              {(user as any)?.profileImage || (user as any)?.avatar || (user as any)?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={(user as any).profileImage || (user as any).avatar || (user as any).avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : user?.name || user?.firstName ? (
                <span className="text-xs font-bold text-yellow-400 font-montserrat">
                  {(user.name || user.firstName).slice(0, 2).toUpperCase()}
                </span>
              ) : (
                <User className="w-4 h-4 text-yellow-400" />
              )}
            </button>
          </div>
        </header>

        {/* GROUP SESSION CONNECTED BANNER (If scanned host's QR code) */}
        {isConnected && (
          <div className="w-full bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-neutral-900 border border-yellow-500/30 rounded-xl p-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-white text-xs font-semibold font-montserrat truncate">
                  Connected to {activeTable}
                </span>
                <span className="text-amber-400/90 text-[11px] font-poppins truncate">
                  Ordering individually • Add items & checkout when ready
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push(`/cart/share-qr?table=${encodeURIComponent(activeTable)}`)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium font-montserrat rounded-lg transition shrink-0 cursor-pointer"
            >
              Table QR
            </button>
          </div>
        )}

        {/* HERO TITLE (shown on main view) */}
        {!showAllItemsView && (
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">👋</span>
              <span className="text-white text-base sm:text-lg font-semibold font-montserrat">
                Welcome to Tavonza
              </span>
            </div>
            <h1 className="text-white text-3xl sm:text-4xl font-semibold font-poppins leading-tight tracking-tight">
              What is your <br />
              favorite item?
            </h1>
          </div>
        )}

        {/* SEARCH BAR */}
        {/* <div className="w-full py-3 px-3.5 bg-neutral-900 rounded-[10px] border border-neutral-800 flex items-center gap-2.5 shadow-inner focus-within:border-yellow-400/50 transition">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your item by name or flavor..."
            className="w-full bg-transparent text-white placeholder:text-zinc-400 font-poppins text-sm sm:text-base focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-zinc-500 hover:text-white px-1.5 py-0.5"
            >
              Clear
            </button>
          )}
        </div> */}

        {/* DYNAMIC CATEGORIES SECTION */}
        <div className="w-full flex flex-col gap-3">
          <div className="w-full flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 shrink-0">
              <h2 className="text-white text-base font-semibold font-poppins">
                Categories
              </h2>
              {backendCategories.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 font-medium">
                  {backendCategories.length} live
                </span>
              )}
            </div>

            {/* Section Input Field beside Categories Title */}
            <div className="flex-1 max-w-xs px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center gap-1.5 focus-within:border-yellow-400/50 transition">
              <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                placeholder="Filter categories..."
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-poppins focus:outline-none"
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

            {!showAllItemsView && (
              <button
                onClick={() => setShowAllItemsView(true)}
                className="text-yellow-400 hover:text-yellow-300 text-xs font-medium font-poppins cursor-pointer transition shrink-0"
              >
                See All
              </button>
            )}
          </div>

          {/* If on All Items View -> Filter Chips */}
          {showAllItemsView ? (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium font-poppins transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-yellow-400 text-zinc-950 font-semibold shadow-md'
                        : 'bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Main Menu View -> Horizontal Large Category Cards */
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {categories.filter((c) => c.id !== 'all').map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(isSelected ? 'all' : cat.id);
                    }}
                    className="flex flex-col items-center gap-1.5 shrink-0 w-22 group cursor-pointer"
                  >
                    <div
                      className={`w-full p-3 rounded-xl border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-neutral-900 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                          : 'bg-neutral-950 border-neutral-900 group-hover:border-neutral-800'
                      }`}
                    >
                      <span className="text-2xl select-none group-hover:scale-110 transition-transform">
                        {cat.icon}
                      </span>
                    </div>
                    <span className="text-white text-xs font-medium font-poppins text-center truncate w-full">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* LOADING INDICATOR SKELETON */}
        {isDataLoading && (
          <div className="w-full flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            <p className="text-zinc-400 text-xs font-poppins">Loading fresh menu from kitchen...</p>
          </div>
        )}

        {/* ALL ITEMS SECTION */}
        <div className="w-full flex flex-col gap-3.5">
          {!showAllItemsView && (
            <div className="w-full flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 shrink-0">
                <h2 className="text-white text-base font-semibold font-poppins">
                  All Items
                </h2>
                <span className="text-xs text-zinc-400 font-poppins">
                  ({filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'})
                </span>
              </div>

              {/* Section Input Field beside All Items Title */}
              <div className="flex-1 max-w-xs px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center gap-1.5 focus-within:border-yellow-400/50 transition">
                <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter items..."
                  className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-poppins focus:outline-none"
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

              <button
                onClick={() => setShowAllItemsView(true)}
                className="text-yellow-400 hover:text-yellow-300 text-xs font-medium font-poppins cursor-pointer transition shrink-0"
              >
                See All
              </button>
            </div>
          )}

          {/* List of items - Responsive grid on tablet & desktop */}
          {filteredItems.length === 0 && !isDataLoading ? (
            <div className="w-full py-12 flex flex-col items-center justify-center gap-2 bg-neutral-900/50 rounded-2xl border border-neutral-800">
              <UtensilsCrossed className="w-8 h-8 text-zinc-500 mb-1" />
              <p className="text-sm font-medium text-zinc-300 font-poppins">No items found</p>
              <p className="text-xs text-zinc-500 font-poppins">Try selecting another category or clear search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredItems.slice(0, showAllItemsView ? undefined : 6).map((item) => {
                const qty = getItemCartQty(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => openDishDetail(item.id)}
                    className="w-full bg-neutral-900 rounded-2xl border border-neutral-800/80 p-3 pr-4 flex items-center justify-between gap-3 hover:border-neutral-700 transition-all cursor-pointer group shadow-sm"
                  >
                    {/* Left: Image & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-neutral-950">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 96px, 110px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="text-white text-sm font-medium font-inter truncate group-hover:text-yellow-300 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-orange-200 text-xs font-normal font-poppins tracking-wide truncate">
                          {item.subtitle}
                        </p>
                        <div className="flex items-center gap-0.5 text-orange-400 text-sm font-medium font-poppins">
                          <span>$</span>
                          <span className="text-white">{item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Stepper Counter [-] Qty [+] */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 shrink-0"
                    >
                      <button
                        type="button"
                        onClick={(e) => handleQtyChange(item, -1, e)}
                        disabled={qty === 0}
                        className="w-6 h-6 bg-neutral-200 hover:bg-neutral-300 disabled:opacity-40 disabled:hover:bg-neutral-200 rounded-md flex items-center justify-center transition cursor-pointer text-neutral-800"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>

                      <span className="text-white text-base font-medium font-inter min-w-4 text-center">
                        {qty}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleQtyChange(item, 1, e)}
                        className="w-6 h-6 bg-yellow-500 hover:bg-yellow-400 rounded-md flex items-center justify-center transition cursor-pointer text-neutral-900 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINATION CONTROLS (10 items per page limit) */}
          {allItems.length > 0 && (
            <div className="w-full flex items-center justify-between pt-3 pb-1 border-t border-neutral-800/80 mt-1">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage <= 1 || itemsLoading}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-white hover:bg-neutral-800 hover:border-yellow-400/40 disabled:opacity-40 disabled:hover:bg-neutral-900 disabled:hover:border-neutral-800 transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
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
                className="px-3.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-white hover:bg-neutral-800 hover:border-yellow-400/40 disabled:opacity-40 disabled:hover:bg-neutral-900 disabled:hover:border-neutral-800 transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 text-yellow-400" />
              </button>
            </div>
          )}
        </div>

        {/* POPULAR RIGHT NOW SECTION (shown in main menu view) */}
        {!showAllItemsView && popularItems.length > 0 && (
          <div className="w-full flex flex-col gap-3.5 pt-2">
            <div className="w-full flex items-center justify-between">
              <h2 className="text-white text-base font-semibold font-poppins">
                Popular right now
              </h2>
              <button
                onClick={() => setShowAllItemsView(true)}
                className="text-yellow-400 hover:text-yellow-300 text-xs font-medium font-poppins cursor-pointer transition"
              >
                See All
              </button>
            </div>

            {/* Responsive Food Grid: 2 cols on mobile, 3 cols on tablet, 4 cols on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {popularItems.slice(0, 4).map((dish) => {
                const isFav = !!favorites[dish.id];
                const qty = getItemCartQty(dish.id);
                return (
                  <div
                    key={dish.id}
                    onClick={() => openDishDetail(dish.id)}
                    className="p-3.5 bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col justify-between gap-3 group hover:border-neutral-700 transition cursor-pointer shadow-sm"
                  >
                    {/* Top: Image + Favorite Badge */}
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-950">
                      <Image
                        src={dish.image}
                        alt={dish.name}
                        fill
                        sizes="(max-width: 640px) 180px, 240px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(dish.id, e)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/50 backdrop-blur-md flex items-center justify-center transition hover:bg-black/70 cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isFav ? 'fill-rose-500 text-rose-500' : 'text-white'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white text-sm font-normal font-poppins leading-snug truncate group-hover:text-yellow-300 transition-colors">
                        {dish.name}
                      </h3>
                      <p className="text-orange-200 text-xs font-normal font-poppins tracking-wide truncate">
                        {dish.subtitle}
                      </p>
                    </div>

                    {/* Price and Add/Qty Button */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-0.5 text-orange-400 text-sm font-normal font-poppins tracking-wide">
                        <span>$</span>
                        <span className="text-white font-medium">{dish.price.toFixed(2)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleQtyChange(dish, 1, e)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition cursor-pointer ${
                          qty > 0
                            ? 'bg-yellow-400 text-neutral-950 font-bold'
                            : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
                        }`}
                        title="Add to Cart"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* FLOATING DRAGGABLE "Ask AI" BUTTON (can be dragged above, bottom, left, right) */}
      <DraggableAskAi defaultBottom={24} defaultRight={24} />

      {/* FLOATING BOTTOM CART BAR (when items are added) */}
      {totalCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            onClick={() => router.push('/cart')}
            className="w-full py-3.5 px-5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-2xl shadow-[0_10px_30px_rgba(250,204,21,0.35)] flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 font-montserrat text-sm font-semibold">
              <ShoppingBag className="w-4 h-4" />
              <span>{totalCount} {totalCount === 1 ? 'item' : 'items'} in Cart</span>
            </div>
            <div className="flex items-center gap-2 font-montserrat font-bold text-base">
              <span>${totalAmount.toFixed(2)}</span>
              <span>→</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
