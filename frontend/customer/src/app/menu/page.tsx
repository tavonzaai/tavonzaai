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
  Flame,
  Clock,
} from 'lucide-react';
import { useCart, resolveDynamicBranchId, resolveDynamicTableId } from '@/context/CartContext';
import DraggableAskAi from '@/components/common/DraggableAskAi';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { fetchMenuCategories } from '@/redux/features/menu-category/menuCategoryApi';
import { fetchMenuItems } from '@/redux/features/menu-items/menuItemApi';
import { getItemImage, getCategoryImage, getCategoryLetters } from '@/lib/menuUtils';
import { getAuthToken, setCookie } from '@/redux/api/baseApi';
import { TavonzaLogoIcon } from '@/components/TavonzaLogo';
import { getActiveCustomerOrder, OrderListResponse } from '@/redux/features/orderApi';

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
  imageUrl?: string | null;
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

  type MenuViewMode = 'main' | 'all-categories' | 'all-items';
  const initialViewParam = searchParams.get('view');
  const [viewMode, setViewMode] = useState<MenuViewMode>(
    initialViewParam === 'categories'
      ? 'all-categories'
      : initialViewParam === 'items'
      ? 'all-items'
      : 'main'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [activeOrder, setActiveOrder] = useState<OrderListResponse | null>(null);

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

  // Continuously check and poll for active order preparing in kitchen
  useEffect(() => {
    if (!mounted) return;

    const branchId = resolveDynamicBranchId();
    const tableId = resolveDynamicTableId(null, activeTable);
    const checkActive = () => {
      getActiveCustomerOrder(branchId, tableId)
        .then((ord) => setActiveOrder(ord))
        .catch(() => setActiveOrder(null));
    };

    checkActive();
    const timer = setInterval(checkActive, 7000);
    const handleEvt = () => checkActive();
    window.addEventListener('tavonza:order_status_changed', handleEvt);
    return () => {
      clearInterval(timer);
      window.removeEventListener('tavonza:order_status_changed', handleEvt);
    };
  }, [mounted, activeTable]);

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

  // Fetch items via Backend Search, Category Filter, and items per page limit
  useEffect(() => {
    if (mounted) {
      dispatch(
        fetchMenuItems({
          page: currentPage,
          limit: 20,
          searchTerm: searchQuery.trim() || undefined,
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
        })
      );
    }
  }, [dispatch, mounted, currentPage, searchQuery, selectedCategory]);

  // Dynamic categories strictly from backend categories API (never borrows dish images)
  const allCategories: DisplayCategory[] = useMemo(() => {
    return (backendCategories || []).map((c) => ({
      id: c.id,
      name: c.name,
      imageUrl: getCategoryImage(c),
    }));
  }, [backendCategories]);


  // Categories filtered for the All Categories view search
  const filteredCategoriesForGrid: DisplayCategory[] = useMemo(() => {
    if (!categorySearchQuery.trim()) return allCategories;
    return allCategories.filter((cat) =>
      cat.name.toLowerCase().includes(categorySearchQuery.trim().toLowerCase())
    );
  }, [allCategories, categorySearchQuery]);

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

  // Active selected category object
  const selectedCategoryObj = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') return null;
    return allCategories.find((c) => c.id === selectedCategory);
  }, [allCategories, selectedCategory]);

  // Filtered items: strictly filtered by selected category and search query
  const filteredItems = useMemo(() => {
    let items = allItems;
    if (selectedCategory && selectedCategory !== 'all') {
      items = items.filter(
        (item) =>
          item.category === selectedCategory ||
          (item.categoryName &&
            selectedCategoryObj &&
            item.categoryName.toLowerCase() === selectedCategoryObj.name.toLowerCase())
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [allItems, selectedCategory, selectedCategoryObj, searchQuery]);

  const totalItems = selectedCategory !== 'all' || searchQuery.trim()
    ? filteredItems.length
    : (itemsMeta?.total ?? itemsMeta?.totalCount ?? (itemsMeta?.limit ? (itemsMeta?.totalPages || 1) * itemsMeta.limit : backendItems.length));
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
          {viewMode !== 'main' ? (
            <button
              onClick={() => setViewMode('main')}
              className="inline-flex items-center gap-2.5 text-white hover:text-yellow-400 transition cursor-pointer"
            >
              <div className="w-7 h-7 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center">
                <ArrowLeft className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white text-base font-semibold font-montserrat">
                {viewMode === 'all-categories' ? 'All Categories' : 'All Items'}
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
              onClick={() => router.push('/profile')}
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

        {/* ACTIVE KITCHEN ORDER PREPARING BANNER */}
        {activeOrder && (
          <div className="w-full bg-gradient-to-r from-yellow-500/20 via-amber-500/15 to-neutral-900 border border-yellow-400/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_4px_25px_rgba(234,179,8,0.15)] animate-in fade-in slide-in-from-top-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0 border border-yellow-400/30">
                <Flame className="w-5 h-5 animate-pulse text-yellow-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs sm:text-sm font-bold font-montserrat truncate">
                    Order #{activeOrder.orderNumber} in Progress
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[10px] font-semibold animate-pulse">
                    {activeOrder.displayStatus || activeOrder.status || 'PREPARING'}
                  </span>
                </div>
                <span className="text-neutral-400 text-[11px] font-poppins truncate">
                  {activeOrder.items?.length || activeOrder.itemCount || 1} items • Est. wait ~{activeOrder.estimatedPrepTime || 15} mins • Kitchen preparing
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                router.push(
                  `/orders/track?order=${encodeURIComponent(
                    activeOrder.orderId || activeOrder.id
                  )}&table=${encodeURIComponent(activeTable)}`
                )
              }
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold font-montserrat rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 shadow-md cursor-pointer self-start sm:self-auto"
            >
              <span>Track Live Status</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. ALL CATEGORIES VIEW (Dedicated view showing ONLY categories)           */}
        {/* ========================================================================= */}
        {viewMode === 'all-categories' && (
          <div className="w-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2">
            {/* Top Navigation & Search Header */}
            <div className="w-full flex flex-col gap-3 pb-3 border-b border-neutral-800">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('main')}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition cursor-pointer group"
                >
                  <ArrowLeft className="w-4 h-4 text-yellow-400 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="font-poppins font-medium">Back to Menu</span>
                </button>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 font-medium font-poppins">
                  {filteredCategoriesForGrid.length} categories
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h1 className="text-white text-xl sm:text-2xl font-bold font-poppins">
                    All Categories
                  </h1>
                  <p className="text-xs text-zinc-400 font-poppins mt-0.5">
                    Browse menu sections and discover dishes by category
                  </p>
                </div>

                {/* Category Search Input Field (Dedicated to All Categories View) */}
                <div className="w-full sm:w-72 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-2 focus-within:border-yellow-400/50 transition shadow-inner">
                  <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-poppins focus:outline-none"
                  />
                  {categorySearchQuery && (
                    <button
                      onClick={() => setCategorySearchQuery('')}
                      className="text-[10px] text-zinc-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Categories Grid (SHOWS ONLY CATEGORIES) */}
            {filteredCategoriesForGrid.length === 0 ? (
              <div className="w-full py-12 flex flex-col items-center justify-center gap-2 bg-neutral-900/40 rounded-2xl border border-neutral-800">
                <p className="text-sm font-medium text-zinc-300 font-poppins">No categories found</p>
                <p className="text-xs text-zinc-500 font-poppins">Try adjusting your category search</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
                {filteredCategoriesForGrid.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setViewMode('all-items');
                    }}
                    className="flex flex-col items-center gap-2 p-3 bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-yellow-400/50 rounded-2xl transition group cursor-pointer text-left shadow-sm hover:shadow-md"
                  >
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border border-neutral-800/80 flex items-center justify-center group-hover:border-yellow-400/40 transition-colors">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-2">
                          <span className="text-lg sm:text-xl font-bold font-montserrat tracking-widest text-yellow-400 group-hover:scale-110 transition-transform">
                            {getCategoryLetters(cat.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold font-poppins text-white group-hover:text-yellow-400 text-center truncate w-full transition-colors">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HERO TITLE (shown on main view) */}
        {viewMode === 'main' && (
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

        {/* DYNAMIC CATEGORIES SECTION (MAIN VIEW - NO SEARCH INPUT) */}
        {viewMode === 'main' && (
          <div className="w-full flex flex-col gap-3">
            <div className="w-full flex items-center justify-between">
              <h2 className="text-white text-base font-semibold font-poppins">
                Categories
              </h2>

              <button
                type="button"
                onClick={() => setViewMode('all-categories')}
                className="text-yellow-400 hover:text-yellow-300 text-xs font-medium font-poppins cursor-pointer transition shrink-0"
              >
                See All
              </button>
            </div>

            {/* Horizontal Large Category Cards with Real Images */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {allCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(isSelected ? 'all' : cat.id);
                    }}
                    className="flex flex-col items-center gap-1.5 shrink-0 w-24 group cursor-pointer"
                  >
                    <div
                      className={`w-full h-16 rounded-xl border overflow-hidden flex items-center justify-center transition-all relative ${
                        isSelected
                          ? 'bg-neutral-900 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)] ring-1 ring-yellow-400'
                          : 'bg-neutral-950 border-neutral-900 group-hover:border-neutral-800'
                      }`}
                    >
                      {cat.imageUrl ? (
                        <>
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div
                            className={`absolute inset-0 transition-opacity ${
                              isSelected ? 'bg-yellow-400/10' : 'bg-black/25 group-hover:bg-black/10'
                            }`}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
                          <span
                            className={`text-sm font-bold font-montserrat tracking-wider uppercase transition-all ${
                              isSelected ? 'text-yellow-400 scale-110' : 'text-neutral-300 group-hover:text-yellow-400'
                            }`}
                          >
                            {getCategoryLetters(cat.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium font-poppins text-center truncate w-full transition-colors ${
                        isSelected
                          ? 'text-yellow-400 font-semibold'
                          : 'text-white group-hover:text-neutral-200'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* LOADING INDICATOR SKELETON */}
        {isDataLoading && (
          <div className="w-full flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            <p className="text-zinc-400 text-xs font-poppins">Loading fresh menu from kitchen...</p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. MAIN VIEW ITEMS PREVIEW & POPULAR DISHES (viewMode === 'main')         */}
        {/* ========================================================================= */}
        {viewMode === 'main' && (
          <>
            {/* ALL ITEMS PREVIEW SECTION (NO SEARCH INPUT - Shows 6 items preview) */}
            <div className="w-full flex flex-col gap-3.5">
              <div className="w-full flex items-center justify-between">
                <h2 className="text-white text-base font-semibold font-poppins">
                  All Items
                </h2>

                <button
                  type="button"
                  onClick={() => setViewMode('all-items')}
                  className="text-yellow-400 hover:text-yellow-300 text-xs font-medium font-poppins cursor-pointer transition shrink-0"
                >
                  See All
                </button>
              </div>

              {/* Preview 6 items */}
              {filteredItems.length === 0 && !isDataLoading ? (
                <div className="w-full py-12 flex flex-col items-center justify-center gap-2 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                  <UtensilsCrossed className="w-8 h-8 text-zinc-500 mb-1" />
                  <p className="text-sm font-medium text-zinc-300 font-poppins">No items found</p>
                  <p className="text-xs text-zinc-500 font-poppins">Try selecting another category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredItems.slice(0, 6).map((item) => {
                    const qty = getItemCartQty(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => openDishDetail(item.id)}
                        className="w-full bg-neutral-900 rounded-2xl border border-neutral-800/80 p-3 pr-4 flex items-center justify-between gap-3 hover:border-neutral-700 transition-all cursor-pointer group shadow-sm"
                      >
                        {/* Left: Image & Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-neutral-950 border border-neutral-800/50">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="(max-width: 640px) 96px, 110px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-neutral-900">
                                <UtensilsCrossed className="w-6 h-6" />
                              </div>
                            )}
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
            </div>

            {/* POPULAR RIGHT NOW SECTION (shown in main menu view) */}
            {popularItems.length > 0 && (
              <div className="w-full flex flex-col gap-3.5 pt-2">
                <div className="w-full flex items-center justify-between">
                  <h2 className="text-white text-base font-semibold font-poppins">
                    Popular right now
                  </h2>
                  <button
                    onClick={() => setViewMode('all-items')}
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
          </>
        )}

        {/* ========================================================================= */}
        {/* 3. ALL ITEMS VIEW (Dedicated view showing ONLY items with dish search)      */}
        {/* ========================================================================= */}
        {viewMode === 'all-items' && (
          <div className="w-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2">
            {/* Top Navigation & Header */}
            <div className="w-full flex flex-col gap-3 pb-3 border-b border-neutral-800">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('main')}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition cursor-pointer group"
                >
                  <ArrowLeft className="w-4 h-4 text-yellow-400 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="font-poppins font-medium">Back to Menu</span>
                </button>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 font-medium font-poppins">
                  {totalItems} dishes
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h1 className="text-white text-xl sm:text-2xl font-bold font-poppins">
                    {selectedCategoryObj ? selectedCategoryObj.name : 'All Dishes'}
                  </h1>
                  <p className="text-xs text-zinc-400 font-poppins mt-0.5">
                    {selectedCategoryObj
                      ? `Showing dishes exclusively from ${selectedCategoryObj.name}`
                      : 'Search and browse dishes from our complete culinary collection'}
                  </p>
                </div>

                {/* Dish Search Input Field (Dedicated to All Items View) */}
                <div className="w-full sm:w-72 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-2 focus-within:border-yellow-400/50 transition shadow-inner">
                  <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes by name or flavor..."
                    className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-poppins focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-[10px] text-zinc-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {selectedCategory !== 'all' && selectedCategoryObj && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-zinc-400 font-poppins">Filtered by category:</span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-xs font-medium font-poppins">
                    <span>{selectedCategoryObj.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className="hover:text-white ml-0.5 text-xs font-bold cursor-pointer"
                      title="Clear filter and show all dishes"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dishes Grid (SHOWS ONLY ITEMS) */}
            {filteredItems.length === 0 && !isDataLoading ? (
              <div className="w-full py-12 flex flex-col items-center justify-center gap-2 bg-neutral-900/40 rounded-2xl border border-neutral-800">
                <UtensilsCrossed className="w-8 h-8 text-zinc-500 mb-1" />
                <p className="text-sm font-medium text-zinc-300 font-poppins">No dishes found</p>
                <p className="text-xs text-zinc-500 font-poppins">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredItems.map((item) => {
                  const qty = getItemCartQty(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => openDishDetail(item.id)}
                      className="w-full bg-neutral-900 rounded-2xl border border-neutral-800/80 p-3 pr-4 flex items-center justify-between gap-3 hover:border-neutral-700 transition-all cursor-pointer group shadow-sm"
                    >
                      {/* Left: Image & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-neutral-950 border border-neutral-800/50">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 96px, 110px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-neutral-900">
                              <UtensilsCrossed className="w-6 h-6" />
                            </div>
                          )}
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

            {/* Pagination Controls for All Items View */}
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
