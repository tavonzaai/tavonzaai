'use client';

import React, { Suspense, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Clock,
  Flame,
  Plus,
  Minus,
  Check,
  Sparkles,
  Wine,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DraggableAskAi from '@/components/common/DraggableAskAi';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { fetchMenuItemById, fetchMenuItems } from '@/redux/features/menu-items/menuItemApi';
import { getItemImage } from '@/lib/menuUtils';

interface MenuItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  category: string;
  image: string;
  popular?: boolean;
  description: string;
  addOns: { id: string; name: string; price: number }[];
  rating?: number | string | null;
  reviewsCount?: number | string | null;
  dietary?: string | null;
  contains?: string | string[] | null;
  winePairing?: { wine: string; description: string } | null;
  prepTime?: number | string | null;
  calories?: number | string | null;
}

function DishDetailContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { cart, upsertCartItem } = useCart();

  const searchDish = searchParams.get('dish');
  const nameParam = searchParams.get('name');
  const tableParam = searchParams.get('table') || 'Table 8';

  const pathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/dish-detail/')[1] : null;
  const dishParam = searchDish || pathSlug;

  const { items: backendItems, selectedItem } = useAppSelector((state) => state.menuItems);

  const isUUID = (val?: string | null) =>
    Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));

  useEffect(() => {
    if (dishParam && isUUID(dishParam)) {
      dispatch(fetchMenuItemById(dishParam));
    } else {
      dispatch(fetchMenuItems({ page: 1, limit: 50 }));
    }
  }, [dispatch, dishParam]);

  // Find dish from dynamic backend data or fallback
  const dish: MenuItem = useMemo(() => {
    if (selectedItem && (selectedItem.id === dishParam || !dishParam || selectedItem.id === searchDish)) {
      const addOns: { id: string; name: string; price: number }[] = [];
      if (selectedItem.modifierGroups) {
        for (const grp of selectedItem.modifierGroups) {
          for (const mod of grp.modifiers) {
            addOns.push({
              id: mod.id,
              name: `${grp.name}: ${mod.name}`,
              price: mod.priceDelta,
            });
          }
        }
      }
      return {
        id: selectedItem.id,
        name: selectedItem.name,
        subtitle: selectedItem.description || selectedItem.category?.name || 'Chef Specialty',
        price: selectedItem.basePrice || (selectedItem as any).price || 0,
        category: selectedItem.categoryId,
        image: getItemImage(selectedItem.name, selectedItem.category?.name, selectedItem.imageUrl),
        popular: selectedItem.isAvailable,
        description: selectedItem.description || 'Prepared fresh with the finest seasonal ingredients by Tavonza chefs.',
        addOns: addOns.length > 0 ? addOns : [
          { id: 'addon-extra-cheese', name: 'Extra Cheddar', price: 1.5 },
          { id: 'addon-truffle-oil', name: 'Truffle Oil Drizzle', price: 2.0 },
        ],
      };
    }

    const foundBackend =
      backendItems?.find(
        (i) =>
          i.id === dishParam ||
          i.id === searchDish ||
          (dishParam && i.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === dishParam.toLowerCase()) ||
          (nameParam && i.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === nameParam.toLowerCase())
      ) || (backendItems && backendItems.length > 0 ? backendItems[0] : null);

    if (foundBackend) {
      return {
        id: foundBackend.id,
        name: foundBackend.name,
        subtitle: foundBackend.description || foundBackend.category?.name || 'Chef Specialty',
        price: foundBackend.basePrice || (foundBackend as any).price || 0,
        category: foundBackend.categoryId,
        image: getItemImage(foundBackend.name, foundBackend.category?.name, foundBackend.imageUrl),
        popular: foundBackend.isAvailable,
        description: foundBackend.description || 'Prepared fresh with the finest seasonal ingredients by Tavonza chefs.',
        addOns: [
          { id: 'addon-extra-cheese', name: 'Extra Cheddar', price: 1.5 },
          { id: 'addon-truffle-oil', name: 'Truffle Oil Drizzle', price: 2.0 },
        ],
      };
    }

    return {
      id: '4455110d-db04-4cef-92c6-46bcd6a4c7e2',
      name: 'Potato Corn Burger',
      subtitle: 'Chef Specialty',
      price: 26,
      category: 'ba394e24-642c-4608-8e42-61424fc78448',
      image: '/images/burger.jpg',
      popular: true,
      description: 'Prepared fresh with the finest seasonal ingredients by Tavonza chefs.',
      addOns: [
        { id: 'addon-extra-cheese', name: 'Extra Cheddar', price: 1.5 },
        { id: 'addon-truffle-oil', name: 'Truffle Oil Drizzle', price: 2.0 },
      ],
    };
  }, [dishParam, searchDish, nameParam, selectedItem, backendItems]);

  // Synchronize browser address bar route path & product name in query params dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !dish) return;
    const slugName = dish.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const params = new URLSearchParams();
    params.set('dish', dish.id);
    params.set('name', slugName);
    if (tableParam) params.set('table', tableParam);

    const targetPath = window.location.pathname.startsWith('/dish-detail/')
      ? window.location.pathname
      : '/dish-detail';

    const newUrl = `${targetPath}?${params.toString()}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.pushState(null, '', newUrl);
    }
  }, [dish, tableParam]);

  // Find previously added/saved configuration for this dish in cart state
  const previousItem = useMemo(() => {
    return cart.find(
      (item) =>
        item.dishId === dish.id ||
        item.id.startsWith(dish.id) ||
        item.name.toLowerCase() === dish.name.toLowerCase()
    );
  }, [cart, dish.id, dish.name]);

  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const initializedDishRef = useRef<string | null>(null);

  // Restore previously saved state whenever this dish is loaded or revisited
  useEffect(() => {
    if (dish && initializedDishRef.current !== dish.id) {
      initializedDishRef.current = dish.id;
      if (previousItem) {
        setQuantity(previousItem.quantity || 1);
        if (previousItem.selectedAddOnIds && previousItem.selectedAddOnIds.length > 0) {
          setSelectedAddOns(previousItem.selectedAddOnIds);
        } else if (previousItem.addOns && previousItem.addOns.length > 0 && dish.addOns) {
          const matched = dish.addOns
            .filter((a) =>
              previousItem.addOns?.some(
                (pa) => pa.name.toLowerCase() === a.name.toLowerCase() || pa.id === a.id
              )
            )
            .map((a) => a.id);
          if (matched.length > 0) {
            setSelectedAddOns(matched);
          }
        }
        if (previousItem.specialInstructions) {
          setSpecialInstructions(previousItem.specialInstructions);
        }
      } else {
        setQuantity(1);
        setSelectedAddOns([]);
        setSpecialInstructions('');
      }
    }
  }, [dish, previousItem]);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Calculate dynamic total
  const addOnsTotal = useMemo(() => {
    if (!dish.addOns) return 0;
    return dish.addOns
      .filter((addon) => selectedAddOns.includes(addon.id))
      .reduce((sum, addon) => sum + addon.price, 0);
  }, [dish.addOns, selectedAddOns]);

  const totalItemAmount = (dish.price + addOnsTotal) * quantity;

  // Save current dish customization into Cart state (preserves previous selections)
  const saveCurrentDishToState = useCallback(() => {
    const chosenAddOns = dish.addOns
      ? dish.addOns.filter((a) => selectedAddOns.includes(a.id))
      : [];

    const itemId = `${dish.id}-${[...selectedAddOns].sort().join('-') || 'default'}`;

    upsertCartItem(
      {
        id: itemId,
        dishId: dish.id,
        name: dish.name,
        subtitle: dish.subtitle,
        price: dish.price + addOnsTotal,
        quantity,
        image: dish.image,
        addOns: chosenAddOns,
        selectedAddOnIds: selectedAddOns,
        specialInstructions,
      },
      dish.id
    );
  }, [dish, selectedAddOns, addOnsTotal, quantity, specialInstructions, upsertCartItem]);

  // Saves current dish & selections to state, then redirects back to Menu page
  const handleSaveAndRedirectToMenu = () => {
    saveCurrentDishToState();
    router.push(`/menu?table=${encodeURIComponent(tableParam)}`);
  };

  // Adds to cart and redirects to cart checkout page
  const handleAddToCart = () => {
    saveCurrentDishToState();
    router.push(`/cart?table=${encodeURIComponent(tableParam)}`);
  };

  return (
    <div className="w-full min-h-screen bg-black text-white relative font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">
      {/* Container max-width for tablet & desktop responsiveness */}
      <div className="w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 pt-0 lg:pt-6 pb-32 relative">
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: HERO IMAGE CONTAINER (Sticky on desktop) */}
        <div className="w-full lg:w-1/2 lg:sticky lg:top-6 lg:self-start flex flex-col gap-4">
          <div className="relative w-full h-72 sm:h-80 lg:h-[480px] bg-neutral-900 rounded-b-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-white/5">
            <Image
              src={dish.image}
              alt={dish.name}
              fill
              priority
              className="object-cover"
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

            {/* Top Floating Actions: Back button & Popular badge */}
            <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-10">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-9 h-9 bg-amber-500/40 hover:bg-amber-500/60 backdrop-blur-md rounded-full flex items-center justify-center transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>

              {dish.popular && (
                <div className="px-3 py-1 bg-amber-500/70 backdrop-blur-md rounded-full shadow-md">
                  <span className="text-white text-xs font-semibold font-dm-sans">
                    Popular
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN BODY CONTENT */}
        <div className="w-full lg:w-1/2 px-5 lg:px-2 pt-4 lg:pt-0 flex flex-col gap-5">
          
          {/* Dish Header: Title, Rating, Price */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-white text-lg sm:text-xl font-semibold font-montserrat tracking-tight">
                    {dish.name}
                  </h1>

                  {/* Rating Pill Badge */}
                  <div className="px-2 py-0.5 bg-zinc-900 border border-neutral-800 rounded-full flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    <span className="text-white text-[10px] font-medium font-montserrat">
                      {dish.rating || 4.5}{' '}
                      <span className="text-white/60">({dish.reviewsCount || 142})</span>
                    </span>
                  </div>
                </div>

                <p className="text-white/70 text-xs font-normal font-poppins leading-relaxed max-w-sm">
                  {dish.description ||
                    'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'}
                </p>
              </div>

              {/* Price */}
              <div className="text-amber-500 text-lg sm:text-xl font-bold font-dm-sans shrink-0">
                ${dish.price.toFixed(2)}
              </div>
            </div>

            {/* Dietary Badge */}
            {dish.dietary && (
              <div className="self-start inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-900 border border-neutral-700/60 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                <span className="text-green-500 text-[10px] font-semibold font-dm-sans">
                  {dish.dietary}
                </span>
              </div>
            )}
          </div>

          {/* Allergen Warning Box */}
          {dish.contains && (
            <div className="w-full p-3 bg-stone-900/90 rounded-[10px] border border-neutral-800 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="text-xs font-dm-sans">
                <span className="text-orange-400 font-semibold">Contains: </span>
                <span className="text-white/90">{dish.contains}</span>
              </div>
            </div>
          )}

          {/* Wine Pairing Card */}
          {dish.winePairing && (
            <div className="w-full p-3 bg-white/10 backdrop-blur-md rounded-[10px] border border-white/10 flex items-start gap-2.5">
              <Wine className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <div className="text-xs font-dm-sans">
                  <span className="text-amber-500 font-semibold">Wine Pairing: </span>
                  <span className="text-white font-semibold">{dish.winePairing.wine}</span>
                </div>
                <p className="text-white/80 text-xs font-normal font-dm-sans leading-relaxed">
                  {dish.winePairing.description}
                </p>
              </div>
            </div>
          )}

          {/* Info Stats: Prep Time & Calories */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-[10px] border border-white/10 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-amber-500 text-[10px] uppercase font-normal font-dm-sans tracking-tight">
                  Prep Time
                </span>
                <span className="text-white text-sm font-semibold font-dm-sans">
                  {dish.prepTime || '12 min'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-md rounded-[10px] border border-white/10 flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-amber-500 text-[10px] uppercase font-normal font-dm-sans tracking-tight">
                  Calories
                </span>
                <span className="text-white text-sm font-semibold font-dm-sans">
                  {dish.calories || '480 kcal'}
                </span>
              </div>
            </div>
          </div>

          {/* QUANTITY SELECTOR BAR */}
          <div className="w-full h-12 px-3.5 bg-neutral-900 rounded-[10px] border border-neutral-800 flex items-center justify-between shadow-inner">
            <span className="text-white text-sm sm:text-base font-semibold font-montserrat">
              Quantity
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-6 h-6 bg-white hover:bg-neutral-200 rounded-md flex items-center justify-center text-black font-bold transition cursor-pointer"
              >
                <Minus className="w-3 h-3 stroke-[2.5]" />
              </button>

              <span className="text-white text-sm font-bold font-inter min-w-4 text-center">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-6 h-6 bg-orange-400 hover:bg-orange-300 rounded-md flex items-center justify-center text-black font-bold transition cursor-pointer"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* ADD ON SECTION */}
          {dish.addOns && dish.addOns.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-white text-sm sm:text-base font-semibold font-montserrat">
                    Add On
                  </h3>
                  {previousItem && (
                    <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      In Order ({previousItem.quantity})
                    </span>
                  )}
                </div>

                {/* Primary Button in Add On Section to save state & redirect to menu */}
                <button
                  type="button"
                  id="btn-add-more-menu-header"
                  onClick={handleSaveAndRedirectToMenu}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 border border-amber-500/40 rounded-full text-amber-400 text-xs font-semibold font-montserrat transition cursor-pointer shadow-sm group"
                  title="Save current item with add-ons and choose more from menu"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5] group-hover:rotate-90 transition-transform" />
                  <span>Add More from Menu</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {dish.addOns.map((addon) => {
                  const isChecked = selectedAddOns.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      className={`p-3 rounded-[10px] border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-neutral-900 border-amber-500/60'
                          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-amber-500 border-amber-500 text-black'
                              : 'border-stone-500 bg-transparent'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="text-white text-sm sm:text-base font-semibold font-montserrat">
                          {addon.name}
                        </span>
                      </div>

                      <span className="text-amber-500 text-sm font-medium font-dm-sans">
                        +${addon.price.toFixed(2)}
                      </span>
                    </div>
                  );
                })}

                {/* Interactive card to save and browse menu for more items/add-ons */}
                <button
                  type="button"
                  id="btn-browse-menu-addons-card"
                  onClick={handleSaveAndRedirectToMenu}
                  className="w-full mt-1 p-3 rounded-[10px] border border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 active:scale-[0.99] flex items-center justify-between cursor-pointer transition-all group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors shrink-0">
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-xs sm:text-sm font-semibold font-montserrat group-hover:text-amber-400 transition-colors">
                        Want additional sides, drinks or add-ons?
                      </span>
                      <span className="text-zinc-400 text-[11px] font-dm-sans">
                        Saves your current selections & opens full menu
                      </span>
                    </div>
                  </div>
                  <span className="text-amber-400 text-xs font-semibold font-montserrat group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0 ml-2">
                    <span>Menu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* SPECIAL INSTRUCTIONS */}
          <div className="flex flex-col gap-2">
            <h3 className="text-white text-sm sm:text-base font-semibold font-montserrat">
              Special Instructions
            </h3>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Add a note for the Kitchen.........."
              className="w-full p-3 bg-neutral-900 rounded-[10px] border border-neutral-800 text-white placeholder:text-zinc-500 text-xs font-montserrat focus:outline-none focus:border-yellow-400/50 resize-none transition"
            />
          </div>

          {/* TOTAL & ADD TO CART BUTTON */}
          <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm sm:text-base font-semibold font-montserrat">
                Total Amount
              </span>
              <span className="text-amber-500 text-lg sm:text-xl font-bold font-poppins">
                ${totalItemAmount.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.99] text-neutral-950 text-base sm:text-lg font-semibold font-montserrat rounded-lg shadow-[0px_8px_20px_0px_rgba(227,172,56,0.35)] transition-all flex items-center justify-center cursor-pointer"
            >
              Add To Cart
            </button>
          </div>

        </div>
        </div>

      </div>

      {/* Floating Draggable Ask AI button (can be moved anywhere: up, down, left, right) */}
      <DraggableAskAi defaultBottom={24} defaultRight={24} />

    </div>
  );
}

export default function DishDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DishDetailContent />
    </Suspense>
  );
}
