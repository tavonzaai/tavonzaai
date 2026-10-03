'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Star,
  Clock,
  Flame,
  Wine,
  AlertTriangle,
  Plus,
  Minus,
  Sparkles,
  ShoppingBag,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DraggableAskAi from '@/components/common/DraggableAskAi';

export interface DishData {
  id: string | number;
  title: string;
  restaurant?: string;
  price: number;
  rating?: string;
  reviewsCount?: number;
  description: string;
  isVegetarian?: boolean;
  containsAllergens?: string;
  winePairing?: {
    wine: string;
    description: string;
  };
  prepTime?: string;
  calories?: string;
  image: string;
  addOns?: { name: string; price: number }[];
}

interface DishDetailModalProps {
  dish?: DishData;
  onClose: () => void;
  onAddToCart?: (dish: DishData, quantity: number, selectedAddOns: string[], notes: string) => void;
  onAskAI?: (dishTitle: string) => void;
}

const DEFAULT_DISH: DishData = {
  id: 'arancini-1',
  title: 'Arancini al Tartufo',
  restaurant: 'Maison Verde - Tuscan Trattoria',
  price: 30.5,
  rating: '4.5',
  reviewsCount: 142,
  description:
    'Crispy risotto balls filled with black truffle, melted mozzarella, and fresh garden herbs served with warm garlic reduction.',
  isVegetarian: true,
  containsAllergens: 'Gluten, Dairy, Nuts',
  winePairing: {
    wine: 'Chardonnay',
    description: "Oaked Chardonnay echoes the truffle's earthy richness.",
  },
  prepTime: '12 min',
  calories: '480 kcal',
  image: '/images/slide1.jpg',
  addOns: [
    { name: 'Extra Parmigiano', price: 1.5 },
    { name: 'Truffle Butter', price: 1.5 },
    { name: 'Rosemary Fries', price: 1.5 },
  ],
};

export default function DishDetailModal({
  dish = DEFAULT_DISH,
  onClose,
  onAddToCart,
  onAskAI,
}: DishDetailModalProps) {
  const router = useRouter();
  const { cart, upsertCartItem } = useCart();

  const previousItem = useMemo(() => {
    return cart.find(
      (item) =>
        item.dishId === String(dish.id) ||
        item.id.startsWith(String(dish.id)) ||
        item.name.toLowerCase() === dish.title.toLowerCase()
    );
  }, [cart, dish.id, dish.title]);

  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const initializedDishRef = useRef<string | null>(null);

  // Restore previous selections if the dish was already added or configured
  useEffect(() => {
    if (dish && initializedDishRef.current !== String(dish.id)) {
      initializedDishRef.current = String(dish.id);
      if (previousItem) {
        setQuantity(previousItem.quantity || 1);
        if (previousItem.selectedAddOnIds && previousItem.selectedAddOnIds.length > 0) {
          setSelectedAddOns(previousItem.selectedAddOnIds);
        } else if (previousItem.addOns && previousItem.addOns.length > 0) {
          setSelectedAddOns(previousItem.addOns.map((a) => a.name));
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

  const toggleAddOn = (name: string) => {
    if (selectedAddOns.includes(name)) {
      setSelectedAddOns(selectedAddOns.filter((item) => item !== name));
    } else {
      setSelectedAddOns([...selectedAddOns, name]);
    }
  };

  const addOnsTotal = (dish.addOns || [])
    .filter((item) => selectedAddOns.includes(item.name))
    .reduce((sum, item) => sum + item.price, 0);

  const totalAmount = (dish.price + addOnsTotal) * quantity;

  // Save current dish customization into Cart state (preserves previous selections)
  const saveCurrentDishToCart = () => {
    const chosenAddOns = (dish.addOns || [])
      .filter((item) => selectedAddOns.includes(item.name))
      .map((a) => ({ name: a.name, price: a.price }));

    const itemId = `${dish.id}-${[...selectedAddOns].sort().join('-') || 'default'}`;

    upsertCartItem(
      {
        id: itemId,
        dishId: String(dish.id),
        name: dish.title,
        subtitle: dish.restaurant,
        price: dish.price + addOnsTotal,
        quantity,
        image: dish.image,
        addOns: chosenAddOns,
        selectedAddOnIds: selectedAddOns,
        specialInstructions,
      },
      String(dish.id)
    );
  };

  const handleSaveAndRedirectToMenu = () => {
    saveCurrentDishToCart();
    if (onAddToCart) {
      onAddToCart(dish, quantity, selectedAddOns, specialInstructions);
    }
    onClose();
    router.push('/menu');
  };

  const handleAddToCartClick = () => {
    saveCurrentDishToCart();
    setIsAdded(true);
    if (onAddToCart) {
      onAddToCart(dish, quantity, selectedAddOns, specialInstructions);
    }
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-0 md:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl bg-black min-h-screen md:min-h-0 md:rounded-3xl border border-white/10 shadow-2xl relative flex flex-col justify-between overflow-x-hidden font-sans pb-24 md:pb-6">
        {/* Scrollable Main Container */}
        <div className="w-full flex-1 flex flex-col gap-4 overflow-y-auto">
          {/* 1. Top Image Banner with Overlays */}
          <div className="w-full h-64 md:h-72 relative rounded-b-2xl overflow-hidden border-b border-white/10 shrink-0">
            <Image src={dish.image} alt={dish.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/50" />

            {/* Back Button & Popular Badge Header */}
            <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20">
              <button
                onClick={onClose}
                className="w-9.5 h-9.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition shadow-lg active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="px-3 py-1 bg-amber-500/90 backdrop-blur-md rounded-full text-white text-xs font-semibold font-['DM_Sans'] shadow-md border border-white/10">
                Popular
              </div>
            </div>
          </div>

          {/* 2. Title, Rating & Price Row */}
          <div className="px-5 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-white font-['Montserrat']">
                    {dish.title}
                  </h2>

                  {dish.rating && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-zinc-900 border border-neutral-700 rounded-full">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-medium text-red-50">
                        {dish.rating} ({dish.reviewsCount || 142})
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-neutral-400 font-['Poppins'] leading-relaxed">
                  {dish.description}
                </p>
              </div>

              <span className="text-lg font-bold text-amber-500 font-['DM_Sans'] shrink-0">
                ${dish.price.toFixed(2)}
              </span>
            </div>

            {/* Dietary Badge */}
            {dish.isVegetarian && (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-900 border border-neutral-600 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-green-500 text-[10px] font-semibold font-['DM_Sans']">
                  Vegetarian
                </span>
              </div>
            )}
          </div>

          {/* 3. Allergen Warning Box */}
          {dish.containsAllergens && (
            <div className="mx-5 p-3 bg-stone-900 border border-neutral-700 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs font-['DM_Sans']">
                <span className="text-orange-400 font-semibold">Contains: </span>
                <span className="text-white font-normal">{dish.containsAllergens}</span>
              </p>
            </div>
          )}

          {/* 4. Wine Pairing Box */}
          {dish.winePairing && (
            <div className="mx-5 p-3 bg-white/10 border border-white/10 rounded-xl flex flex-col gap-1 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-xs font-['DM_Sans']">
                <Wine className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-amber-500 font-semibold">Wine Pairing: </span>
                <span className="text-white font-semibold">{dish.winePairing.wine}</span>
              </div>
              <p className="text-xs text-white/90 font-['DM_Sans'] pl-5 leading-relaxed">
                {dish.winePairing.description}
              </p>
            </div>
          )}

          {/* 5. Macro Info Boxes (Prep Time & Calories) */}
          <div className="mx-5 grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/10 border border-white/10 rounded-xl flex items-center gap-2.5 backdrop-blur-md">
              <Clock className="w-4 h-4 text-white shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-500 uppercase font-['DM_Sans'] font-medium">
                  Prep Time
                </span>
                <span className="text-sm font-semibold text-white font-['DM_Sans']">
                  {dish.prepTime || '12 min'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white/10 border border-white/10 rounded-xl flex items-center gap-2.5 backdrop-blur-md">
              <Flame className="w-4 h-4 text-white shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-500 uppercase font-['DM_Sans'] font-medium">
                  Calories
                </span>
                <span className="text-sm font-semibold text-white font-['DM_Sans']">
                  {dish.calories || '480 kcal'}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Quantity Selector Box */}
          <div className="mx-5 p-3 bg-neutral-900 rounded-xl border border-white/10 flex items-center justify-between">
            <span className="text-base font-semibold text-white font-['Montserrat']">Quantity</span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-full bg-orange-400/30 border border-neutral-700 flex items-center justify-center text-black hover:bg-orange-400/50 transition"
              >
                <Minus className="w-3.5 h-3.5 text-black" />
              </button>

              <span className="text-sm font-bold text-white font-['Inter'] w-4 text-center">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 rounded-full bg-orange-400 border border-neutral-700 flex items-center justify-center text-black hover:bg-orange-300 transition"
              >
                <Plus className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </div>

          {/* 7. Add On Options */}
          {dish.addOns && dish.addOns.length > 0 && (
            <div className="px-5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white font-['Montserrat']">
                    Add On
                  </h3>
                  {previousItem && (
                    <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      In Order ({previousItem.quantity})
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveAndRedirectToMenu}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 border border-amber-500/40 rounded-full text-amber-400 text-xs font-semibold font-montserrat transition cursor-pointer shadow-sm group"
                  title="Save current item selections and browse menu for more items/add-ons"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5] group-hover:rotate-90 transition-transform" />
                  <span>Add More from Menu</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {dish.addOns.map((addOn, idx) => {
                  const isChecked = selectedAddOns.includes(addOn.name);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleAddOn(addOn.name)}
                      className={`w-full p-3 bg-neutral-900 rounded-xl border flex items-center justify-between transition text-left cursor-pointer ${
                        isChecked ? 'border-amber-500 bg-neutral-800' : 'border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                            isChecked ? 'border-amber-500 bg-amber-500 text-black' : 'border-stone-500'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </div>
                        <span className="text-sm font-semibold text-white font-['Montserrat']">
                          {addOn.name}
                        </span>
                      </div>

                      <span className="text-sm font-medium text-amber-500 font-['DM_Sans']">
                        +${addOn.price.toFixed(2)}
                      </span>
                    </button>
                  );
                })}

                {/* Secondary card to browse menu */}
                <button
                  type="button"
                  onClick={handleSaveAndRedirectToMenu}
                  className="w-full mt-1 p-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 active:scale-[0.99] flex items-center justify-between cursor-pointer transition-all group text-left"
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

          {/* 8. Special Instructions Box */}
          <div className="px-5 flex flex-col gap-2">
            <h3 className="text-base font-semibold text-white font-['Montserrat']">
              Special Instructions
            </h3>
            <textarea
              rows={3}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Add a note for the Kitchen.........."
              className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 font-['Montserrat']"
            />
          </div>

          {/* 9. Subtotal Amount */}
          <div className="mx-5 py-3 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-base font-semibold text-white font-['Montserrat']">
              Total Amount
            </span>
            <span className="text-lg font-bold text-amber-500 font-['Poppins']">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Floating Draggable "Ask AI" Button (can be moved anywhere: up, down, left, right) */}
        <DraggableAskAi
          onClick={() => {
            if (onAskAI) {
              onAskAI(dish.title);
            } else {
              router.push(`/chat?query=${encodeURIComponent(`Tell me about ${dish.title} and ingredients`)}`);
            }
            onClose();
          }}
          defaultBottom={80}
          defaultRight={24}
        />

        {/* 10. Bottom Action Bar: Add To Cart */}
        <div className="px-5 pb-4">
          <button
            onClick={handleAddToCartClick}
            disabled={isAdded}
            className="w-full h-12 bg-orange-400 hover:bg-orange-300 text-neutral-950 text-base font-semibold font-['Montserrat'] rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition active:scale-[0.99]"
          >
            {isAdded ? (
              <>
                <Check className="w-5 h-5 text-neutral-950" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5 text-neutral-950" />
                <span>Add To Cart • ${totalAmount.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
