'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Bot,
  SlidersHorizontal,
  Mic,
  Send,
  Star,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  PlusCircle,
  ShoppingBag,
} from 'lucide-react';
import InstantReserveModal from './InstantReserveModal';
import DishDetailModal, { DishData } from './DishDetailModal';
import CartFlowModal, { CartStep } from './CartFlowModal';
import FeedbackModal from './FeedbackModal';
import AuthSuccessModal from './AuthSuccessModal';
import BottomNav, { DashboardTab } from './BottomNav';
import SearchView from './SearchView';
import JarvisChatView from './JarvisChatView';
import OrdersView from './OrdersView';
import ProfileView from './ProfileView';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { fetchMenuItems, BackendMenuItem } from '@/redux/features/menu-items/menuItemApi';
import { getItemImage } from '@/lib/menuUtils';

interface CustomerDashboardViewProps {
  showAuthSuccessModal?: boolean;
  initialTab?: DashboardTab;
}

export default function CustomerDashboardView({
  showAuthSuccessModal = true,
  initialTab = 'menu',
}: CustomerDashboardViewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: backendMenuItems, loading: menuLoading } = useAppSelector((state) => state.menuItems);

  const [activeIntent, setActiveIntent] = useState('Date Night');
  const [activeDietary, setActiveDietary] = useState(['Keto & Low Carb']);
  const [jarvisQuery, setJarvisQuery] = useState('');
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(showAuthSuccessModal);
  const [selectedDishDetail, setSelectedDishDetail] = useState<DishData | null>(null);
  const [cartFlowStep, setCartFlowStep] = useState<CartStep | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [isNavVisible, setIsNavVisible] = useState(true);

  useEffect(() => {
    if (!backendMenuItems || backendMenuItems.length === 0) {
      dispatch(fetchMenuItems({ page: 1, limit: 20 }));
    }
  }, [dispatch, backendMenuItems]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    const targetRoute = tab === 'menu' || tab === 'home' ? '/menu' : `/${tab}`;
    router.push(targetRoute);
  };

  const lastScrollY = useRef(0);

  // Smooth Scroll Listener: Hide bottom nav on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // If scrolled down more than 10px past header, hide bottom nav
      if (currentScrollY > lastScrollY.current + 10 && currentScrollY > 40) {
        setIsNavVisible(false);
      }
      // If scrolled up more than 5px, show bottom nav
      else if (currentScrollY < lastScrollY.current - 5) {
        setIsNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDietary = (item: string) => {
    if (activeDietary.includes(item)) {
      setActiveDietary(activeDietary.filter((d) => d !== item));
    } else {
      setActiveDietary([...activeDietary, item]);
    }
  };

  const handleAskJarvis = (promptText: string) => {
    setJarvisQuery(promptText);
    setChatMessages((prev) => [...prev, promptText]);
    setActiveTab('jarvis');
  };

  const handleOpenDishDetail = (dish: BackendMenuItem) => {
    setSelectedDishDetail({
      id: dish.id,
      title: dish.name,
      restaurant: 'Maison Verde - Tuscan Trattoria',
      price: Number(dish.basePrice || 0),
      rating: '4.8',
      reviewsCount: 142,
      description: dish.description || 'Prepared fresh with black truffle, premium cheese, and chef special garden reduction.',
      isVegetarian: Boolean(dish.isVegetarian),
      containsAllergens: dish.isVegetarian ? 'Dairy' : 'Gluten, Dairy',
      winePairing: {
        wine: 'Chardonnay',
        description: "Oaked Chardonnay echoes the dish's earthy richness.",
      },
      prepTime: '12 min',
      calories: '480 kcal',
      image: dish.imageUrl || getItemImage(dish.name),
      addOns: dish.modifierGroups?.flatMap((mg) =>
        mg.modifiers.map((m) => ({ name: m.name, price: Number(m.priceDelta || 0) }))
      ) || [
        { name: 'Extra Parmigiano', price: 1.5 },
        { name: 'Truffle Butter', price: 1.5 },
        { name: 'Rosemary Fries', price: 1.5 },
      ],
    });
  };

  const renderActiveView = () => {

    switch (activeTab) {
      case 'search':
        return <SearchView onReserveClick={() => setShowReserveModal(true)} />;
      case 'jarvis':
        return (
          <JarvisChatView
            isNavVisible={isNavVisible}
            onInputFocus={() => setIsNavVisible(false)}
            onInputBlur={() => setIsNavVisible(true)}
          />
        );
      case 'orders':
        return <OrdersView onReserveClick={() => setShowReserveModal(true)} onOpenFeedback={() => setShowFeedbackModal(true)} />;
      case 'profile':
        return <ProfileView />;
      case 'home':
      default:
        return (
          <div className="w-full flex-1 flex flex-col gap-6 pb-20 pt-2">

            {/* 1. JARVIS Context Intelligence Hero Banner (Figma Pixel-Perfect) */}
            <div className="w-full p-5 md:p-6 bg-neutral-900/90 border-b border-white/10 relative overflow-hidden flex items-center justify-between">
              <div className="flex flex-col gap-2.5 max-w-[250px] sm:max-w-[280px] md:max-w-[340px] z-10 relative">
                {/* Badge Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-800/90 border border-neutral-700/60 w-fit shadow-sm">
                  <span className="text-xs leading-none">🤖</span>
                  <span className="text-yellow-400 text-xs font-semibold font-['Inter']">
                    JARVIS Context Intelligence
                  </span>
                </div>

                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white leading-snug font-['Inter']">
                  Good evening, {user?.name || user?.firstName || 'Alex'}. What are you in the mood for?
                </h2>

                <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed font-['Inter']">
                  Fast-track 45-min tasting menus, valet parking & high-privacy alcoves.
                </p>
              </div>

              {/* Robot Avatar Image (Clean 3D Bot without yellow circle border ring) */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 relative shrink-0 -mr-1">
                <Image
                  src="/images/image 11.png"
                  alt="JARVIS Bot"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* 2. Intent Category Badges */}
            <div className="flex flex-col gap-2 px-5">
              <h3 className="text-sm font-semibold text-white font-['Inter']">Intent</h3>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {['Date Night', 'Post Workout', 'Business Lunch', 'Late Night Drinks'].map((intent) => (
                  <button
                    key={intent}
                    onClick={() => setActiveIntent(intent)}
                    className={`px-3.5 py-2 rounded-full text-xs font-medium font-['Montserrat'] whitespace-nowrap transition ${
                      activeIntent === intent
                        ? 'bg-yellow-400 text-black shadow-md shadow-yellow-500/20'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    }`}
                  >
                    {intent}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Dietary Preferences Section */}
            <div className="flex flex-col gap-2.5 px-5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-semibold text-white font-['Inter']">Dietary</h3>
                  <p className="text-xs text-stone-400 font-['Poppins']">
                    Select dietary preferences to find meals that suit your needs.
                  </p>
                </div>
                <button className="p-2 rounded-lg bg-zinc-800 border border-neutral-700 text-white hover:text-yellow-400 transition">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {['Keto & Low Carb', 'Gluten-Free Friendly', 'Organic Focus'].map((diet) => {
                  const isSelected = activeDietary.includes(diet);
                  return (
                    <button
                      key={diet}
                      onClick={() => toggleDietary(diet)}
                      className={`px-3.5 py-2 rounded-full text-xs font-medium font-['Montserrat'] whitespace-nowrap transition ${
                        isSelected
                          ? 'bg-yellow-400 text-black shadow-md shadow-yellow-500/20'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                      }`}
                    >
                      {diet}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. AI Concierge Curation - Recommended for You */}
            <div className="flex flex-col gap-3 px-5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 border border-neutral-700 w-fit">
                    <span className="text-yellow-400 text-xs font-semibold">⟐ AI Concierge Curation</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white font-['Inter']">Recommended for You</h3>
                </div>
                <button
                  onClick={() => setActiveTab('search')}
                  className="text-yellow-400 text-xs font-normal underline hover:text-yellow-300"
                >
                  View All
                </button>
              </div>

              {/* Horizontal Scrolling Restaurant Cards */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                {[
                  {
                    name: 'Maison Verde - Tuscan Trattoria',
                    rating: '4.9',
                    status: 'Open until 11:00 PM',
                    dist: '1.2 km away • Champs-Élysées',
                    wait: 'Approx. 15-minute wait',
                    img: '/images/slide2.jpg',
                  },
                  {
                    name: 'The Burger Lab',
                    rating: '4.5',
                    status: 'Open until 12:00 AM',
                    dist: '0.8 km away • Triangle d\'Or',
                    wait: 'Approx. 10-minute wait',
                    img: '/images/burger.jpg',
                  },
                ].map((resto, idx) => (
                  <div
                    key={idx}
                    className="w-72 bg-neutral-900 border border-white/10 rounded-2xl p-3 flex flex-col gap-2.5 shrink-0 shadow-lg"
                  >
                    <div className="w-full h-32 relative rounded-xl overflow-hidden">
                      <Image src={resto.img} alt={resto.name} fill className="object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded-md flex items-center gap-1 text-xs font-medium text-white">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span>{resto.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-yellow-400 font-medium">{resto.status}</span>
                      <h4 className="text-sm font-semibold text-white">{resto.name}</h4>
                      <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-500" />
                        <span>{resto.dist}</span>
                      </p>
                    </div>

                    <div className="px-2.5 py-1 bg-zinc-800 rounded-md text-[11px] text-zinc-100 font-medium w-fit">
                      {resto.wait}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-neutral-400">Slots:</span>
                      {['8:00 PM', '8:30 PM', '9:00 PM'].map((slot, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setShowReserveModal(true)}
                          className="px-2 py-1 bg-zinc-800 hover:bg-yellow-400 hover:text-black rounded-md text-[10px] font-medium text-zinc-100 transition"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Real-Time Seating Sync - Available Tables Tonight */}
            <div className="flex flex-col gap-3 px-5">
              <div className="flex flex-col gap-0.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 border border-neutral-700 w-fit">
                  <span className="text-yellow-400 text-xs font-semibold">⟐ Real-Time Seating Sync</span>
                </div>
                <h3 className="text-sm font-semibold text-white font-['Inter']">Available Tables Tonight</h3>
                <p className="text-xs text-white/60 font-['Inter']">
                  Instant table locks with dietary profile pre-notified
                </p>
              </div>

              {/* Horizontal Alcove Cards */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                {[1, 2].map((cardIdx) => (
                  <div
                    key={cardIdx}
                    className="w-60 bg-neutral-900 border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2 shrink-0 shadow-lg"
                  >
                    <span className="px-2 py-0.5 bg-neutral-800 text-yellow-400 text-[10px] font-medium rounded-md w-fit">
                      8:00 PM Tonight
                    </span>
                    <h4 className="text-xs font-semibold text-white">Maison Verde - Tuscan Trattoria</h4>
                    <p className="text-[11px] text-yellow-400 font-medium">Private Alcove • Max 4 Guests</p>
                    <p className="text-[10px] text-white/60">Quiet Acoustics • Courtyard View</p>

                    <button
                      onClick={() => setShowReserveModal(true)}
                      className="w-full h-8 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-medium rounded-lg flex items-center justify-center transition shadow-md shadow-yellow-500/10 mt-1"
                    >
                      Instant Reserve
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Health & Culinary Alignment - Suitable for Your Dietary Preferences */}
            <div className="flex flex-col gap-3 px-5">
              <div className="flex flex-col gap-0.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 border border-neutral-700 w-fit">
                  <span className="text-yellow-400 text-xs font-semibold">⟐ Health & Culinary Alignment</span>
                </div>
                <h3 className="text-sm font-semibold text-white font-['Inter']">
                  Suitable for Your Dietary Preferences
                </h3>
                <p className="text-xs text-white/60 font-['Inter']">
                  Verified for: Keto & Low Carb • Gluten-Free Friendly • Organic Focus
                </p>
              </div>

              {/* Dish Cards from real backend database */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                {menuLoading && (!backendMenuItems || backendMenuItems.length === 0) ? (
                  <div className="flex items-center gap-3">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="w-72 h-64 bg-neutral-900 border border-white/5 rounded-2xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  (backendMenuItems || []).map((dish) => {
                    const dishImage = dish.imageUrl || getItemImage(dish.name);
                    const formattedPrice = `$${Number(dish.basePrice || 0).toFixed(2)}`;

                    return (
                      <div
                        key={dish.id}
                        onClick={() => handleOpenDishDetail(dish)}
                        className="w-72 bg-neutral-900 border border-white/10 hover:border-yellow-400/40 cursor-pointer rounded-2xl p-3 flex flex-col gap-2.5 shrink-0 shadow-lg transition"
                      >
                        <div className="w-full h-32 relative rounded-xl overflow-hidden bg-neutral-950">
                          <Image src={dishImage} alt={dish.name} fill className="object-cover" />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-zinc-900 text-white text-[10px] font-medium rounded-sm">
                            {dish.isVegetarian ? 'Vegetarian' : 'Chef Special'}
                          </div>
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black text-yellow-400 text-xs font-bold rounded-sm">
                            {formattedPrice}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-neutral-400">
                            {dish.category?.name || 'Maison Verde - Tuscan Trattoria'}
                          </span>
                          <h4 className="text-xs font-semibold text-white truncate">{dish.name}</h4>
                          <p className="text-[10px] text-white/60 leading-tight line-clamp-2">
                            {dish.description || 'Freshly prepared with authentic ingredients and herbs.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-zinc-800 text-[10px] font-medium text-zinc-100 rounded-md">
                            {dish.isVegetarian ? 'Plant-Based' : 'High Protein'}
                          </span>
                          <span className="px-2 py-0.5 bg-zinc-800 text-[10px] font-medium text-yellow-400 rounded-md">
                            {formattedPrice}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 8. Ask Jarvis Inline Chat Bar (Pixel-Perfect to Figma Image 1 & 2) */}
            <div className="px-5 my-2">
              <div className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between shadow-xl">
                <input
                  type="text"
                  value={jarvisQuery}
                  onChange={(e) => setJarvisQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskJarvis(jarvisQuery)}
                  placeholder="Ask Jarvis anything..."
                  className="w-full bg-transparent text-sm font-normal text-white placeholder:text-neutral-500 focus:outline-none pr-3 font-['Inter']"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <button className="w-9 h-9 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-white hover:bg-neutral-700 transition">
                    <Mic className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleAskJarvis(jarvisQuery || "What's your best-selling dish?")}
                    className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/20 transition active:scale-95"
                  >
                    <Send className="w-4 h-4 text-black fill-black stroke-none" />
                  </button>
                </div>
              </div>
            </div>

            {/* 8. Brunch Near You & Additional Categories Button */}
            <div className="flex flex-col gap-3 px-5">
              <div className="flex flex-col gap-0.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 border border-neutral-700 w-fit">
                  <span className="text-yellow-400 text-xs font-semibold">⟐ Health & Culinary Alignment</span>
                </div>
                <h3 className="text-sm font-semibold text-white font-['Inter']">Brunch Near You</h3>
                <p className="text-xs text-white/60 font-['Inter']">
                  Within 1.5 km of Paris, 8th Arr. • Triangle d'Or
                </p>
              </div>

              <div
                onClick={() => setActiveTab('search')}
                className="w-full py-2.5 px-4 bg-yellow-400/10 border border-white/10 rounded-full flex items-center justify-center gap-2 cursor-pointer hover:bg-yellow-400/20 transition"
              >
                <PlusCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-medium text-white font-['DM_Sans']">
                  View Additional Curated Categories (4 More)
                </span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto min-h-screen bg-black text-white flex flex-col justify-between relative overflow-x-hidden font-sans">
      {/* Active Tab View */}
      {renderActiveView()}

      {/* Instant Concierge Reserve Modal */}
      {showReserveModal && (
        <InstantReserveModal
          restaurantName="Maison Verde - Tuscan Trattoria"
          onClose={() => setShowReserveModal(false)}
          onSuccess={() => setShowReserveModal(false)}
        />
      )}

      {/* Product / Dish Detail Modal */}
      {selectedDishDetail && (
        <DishDetailModal
          dish={selectedDishDetail}
          onClose={() => setSelectedDishDetail(null)}
          onAddToCart={() => {
            setSelectedDishDetail(null);
            setCartFlowStep('cart');
          }}
          onAskAI={(dishTitle) => {
            setSelectedDishDetail(null);
            router.push(`/chat?query=${encodeURIComponent(`Tell me more about ${dishTitle} and wine pairings`)}`);
          }}
        />
      )}

      {/* Cart & Checkout Flow Modal */}
      {cartFlowStep && (
        <CartFlowModal
          initialStep={cartFlowStep}
          onClose={() => setCartFlowStep(null)}
          onGoHome={() => handleTabChange('home')}
        />
      )}

      {/* Feedback & Review Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => setShowFeedbackModal(false)}
          onGoHome={() => {
            setShowFeedbackModal(false);
            handleTabChange('home');
          }}
        />
      )}

      {/* Authenticated Success Toast / Modal (Auto hides after 3 seconds) */}
      {showAuthModal && (
        <AuthSuccessModal
          onClose={() => setShowAuthModal(false)}
          autoHideMs={3000}
        />
      )}

      {/* Sticky Bottom Nav Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isVisible={isNavVisible}
      />
    </div>
  );
}



