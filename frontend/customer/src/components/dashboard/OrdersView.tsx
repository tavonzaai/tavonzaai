'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Sparkles,
  ChevronRight,
  Receipt,
  Ticket,
  CheckCircle2,
  RefreshCw,
  Navigation,
} from 'lucide-react';

interface OrdersViewProps {
  onReserveClick?: () => void;
  onOpenFeedback?: () => void;
}

export default function OrdersView({ onReserveClick, onOpenFeedback }: OrdersViewProps) {
  const router = useRouter();
  const [selectedResto, setSelectedResto] = useState('Maison Verde - Tuscan Trattoria');
  const [activeTabNotice, setActiveTabNotice] = useState<string | null>(null);

  const handleBookAgain = (restoName: string) => {
    setSelectedResto(restoName);
    if (onReserveClick) {
      onReserveClick();
    } else {
      router.push('/reserve');
    }
  };

  const handleFeedback = () => {
    if (onOpenFeedback) {
      onOpenFeedback();
    } else {
      router.push('/feedback');
    }
  };

  const handleClaimPerk = (perkTitle: string) => {
    setActiveTabNotice(`Perk claimed: "${perkTitle}". Concierge pass generated!`);
    setTimeout(() => setActiveTabNotice(null), 4000);
  };

  return (
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto min-h-screen bg-black text-white flex flex-col justify-between relative overflow-x-hidden font-sans pb-24 pt-2">

      {/* 1. Concierge Itinerary & History Header Banner */}
      <div className="w-full p-5 bg-gradient-to-br from-neutral-900 to-neutral-800/20 border-b border-white/10 flex flex-col gap-2.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-neutral-700 w-fit">
          <Calendar className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-yellow-400 text-[10px] font-semibold font-['Inter']">
            Concierge Itinerary & History
          </span>
        </div>

        <h2 className="text-base font-semibold text-white font-['Inter']">
          Reservations & Order History
        </h2>

        <p className="text-xs text-neutral-400 leading-relaxed font-['Poppins']">
          Manage active table locks, review past dining visits, and re-order previous menu creations.
        </p>

        {activeTabNotice && (
          <div className="p-2 bg-yellow-400/20 border border-yellow-400/40 rounded-xl text-xs text-yellow-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 animate-bounce" />
            <span>{activeTabNotice}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-7 px-5 pt-4">
        {/* 2. Active Table Lock Confirmed Card */}
        <div className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-3.5 shadow-xl relative overflow-hidden">
          {/* Header Row: Badge & Passcode */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-md border border-neutral-700">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-[10px] font-semibold font-['Inter']">
                Active Table Lock Confirmed
              </span>
            </div>

            <span className="text-[11px] font-semibold text-zinc-300 font-mono">
              Pass Code #TVZ-8841
            </span>
          </div>

          {/* Restaurant Title & Address */}
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-semibold text-white font-['Inter']">
              Maison Verde - Tuscan Trattoria
            </h3>
            <p className="text-xs text-neutral-400 flex items-center gap-1 font-['Inter']">
              <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span>18 Rue du Faubourg , Paris 8th • Private Alcove #4</span>
            </p>
          </div>

          {/* 4 Glass Grid Info Boxes */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-0.5 backdrop-blur-md">
              <span className="text-[10px] text-stone-300 font-['Inter']">Date & Time</span>
              <span className="text-xs font-medium text-white font-['Inter']">Tonight, 8:00 PM</span>
            </div>

            <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-0.5 backdrop-blur-md">
              <span className="text-[10px] text-stone-300 font-['Inter']">Guests</span>
              <span className="text-xs font-medium text-white font-['Inter']">4 Guests</span>
            </div>

            <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-0.5 backdrop-blur-md">
              <span className="text-[10px] text-stone-300 font-['Inter']">Dietary Flags</span>
              <span className="text-xs font-medium text-white font-['Inter']">Vegetarian, Nut-Free</span>
            </div>

            <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-0.5 backdrop-blur-md">
              <span className="text-[10px] text-stone-300 font-['Inter']">VIP Privilege</span>
              <span className="text-xs font-medium text-white font-['Inter']">Aged Parmigiano Flight</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => handleBookAgain('Maison Verde - Tuscan Trattoria')}
              className="w-full h-10 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-medium rounded-xl flex items-center justify-center transition shadow-md shadow-yellow-500/10"
            >
              Modify Reservation
            </button>

            <button className="w-full h-10 border border-zinc-500 hover:border-white text-neutral-300 hover:text-white text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition">
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions & Valet</span>
            </button>
          </div>
        </div>

        {/* 3. Personal Dining Memory - Based on Your Previous Visits */}
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-white/60 font-['Inter']">Personal Dining Memory</span>
            <h3 className="text-base font-semibold text-white font-['Inter']">
              Based on Your Previous Visits
            </h3>
          </div>

          {/* Swiper Slider Row */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
            {/* Card 1 */}
            <div className="w-72 bg-neutral-900 border border-white/10 rounded-2xl p-3.5 flex flex-col gap-3 shrink-0 snap-start shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-11 relative rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <Image src="/images/slide2.jpg" alt="Maison Verde" fill className="object-cover" />
                </div>

                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-semibold text-white font-['Inter']">
                    Maison Verde - Tuscan Trattoria
                  </h4>
                  <p className="text-[10px] text-white/60 font-['Inter']">Italian • Champs-Élysées</p>

                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-zinc-800 rounded-full w-fit">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] text-red-50 font-medium">4.8 (394 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Memory Box */}
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-1 backdrop-blur-md">
                <span className="text-[10px] text-yellow-400 font-medium font-['Inter']">
                  JARVIS History Memory
                </span>
                <p className="text-[10px] text-white font-['Inter'] leading-relaxed">
                  Visited 3 times • Chef remembered your preference for Barolo & quiet seating.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBookAgain('Maison Verde - Tuscan Trattoria')}
                  className="flex-1 h-9 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-medium rounded-xl flex items-center justify-center transition shadow-md shadow-yellow-500/10"
                >
                  Book Table Again
                </button>
                {onOpenFeedback && (
                  <button
                    onClick={onOpenFeedback}
                    className="px-3 h-9 bg-orange-400/20 hover:bg-orange-400/30 border border-orange-400/40 text-orange-300 text-xs font-medium rounded-xl flex items-center justify-center transition"
                  >
                    Feedback
                  </button>
                )}
              </div>
            </div>

            {/* Card 2 */}
            <div className="w-72 bg-neutral-900 border border-white/10 rounded-2xl p-3.5 flex flex-col gap-3 shrink-0 snap-start shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-11 relative rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <Image src="/images/burger.jpg" alt="The Burger Lab" fill className="object-cover" />
                </div>

                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-semibold text-white font-['Inter']">The Burger Lab</h4>
                  <p className="text-[10px] text-white/60 font-['Inter']">American • Triangle d'Or</p>

                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-zinc-800 rounded-full w-fit">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] text-red-50 font-medium">4.5 (210 reviews)</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-1 backdrop-blur-md">
                <span className="text-[10px] text-yellow-400 font-medium font-['Inter']">
                  JARVIS History Memory
                </span>
                <p className="text-[10px] text-white font-['Inter'] leading-relaxed">
                  Visited 2 times • Loved Truffle Wagyu Smash with extra caramelised onions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBookAgain('The Burger Lab')}
                  className="flex-1 h-9 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-medium rounded-xl flex items-center justify-center transition shadow-md shadow-yellow-500/10"
                >
                  Book Table Again
                </button>
                {onOpenFeedback && (
                  <button
                    onClick={onOpenFeedback}
                    className="px-3 h-9 bg-orange-400/20 hover:bg-orange-400/30 border border-orange-400/40 text-orange-300 text-xs font-medium rounded-xl flex items-center justify-center transition"
                  >
                    Feedback
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Instant Repeat Concierge - Continue Your Previous Order */}
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-white/60 font-['Inter']">Instant Repeat Concierge</span>
            <h3 className="text-base font-semibold text-white font-['Inter']">
              Continue Your Previous Order
            </h3>
            <p className="text-[11px] text-white/60 font-['Inter']">
              Re-order signature dishes or request table call with exact custom modifications saved
            </p>
          </div>

          {/* Swiper Slider Row */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
            {/* Order Card 1 */}
            <div className="w-72 bg-neutral-900 border border-white/10 rounded-2xl p-3.5 flex flex-col gap-3 shrink-0 snap-start shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-11 relative rounded-lg overflow-hidden shrink-0 border border-white/10">
                    <Image src="/images/seabass.jpg" alt="Le Gabriel" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-xs font-semibold text-white">Le Gabriel - La Réserve</h4>
                    <span className="text-[10px] text-white/70">Last Friday</span>
                    <span className="text-[9px] text-white/60">July 31 • 8:30 PM • Table 4 (Alcove)</span>
                  </div>
                </div>
              </div>

              {/* Itemized Receipt Box */}
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-1 text-[10px] font-['Inter'] backdrop-blur-md">
                <div className="flex items-center justify-between text-stone-300">
                  <span>2x Brittany Lobster Cacao Emulsion</span>
                  <span className="text-white font-medium">€220</span>
                </div>
                <div className="flex items-center justify-between text-stone-300">
                  <span>1x Meursault 1er Cru Bottle</span>
                  <span className="text-white font-medium">€220</span>
                </div>
                <div className="flex items-center justify-between text-stone-300">
                  <span>1x Heritage Beetroot Tartare</span>
                  <span className="text-white font-medium">€45</span>
                </div>
              </div>

              {/* Saved Chef Preference */}
              <div className="p-2.5 bg-yellow-400/10 border border-white/10 rounded-xl text-[10px]">
                <span className="text-white font-medium">Saved Chef Preference: </span>
                <span className="text-neutral-400">
                  "Chef Banctel prepared your cacao sauce with zero refined sugar as requested."
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-neutral-400 font-semibold">Total Paid</span>
                <span className="text-white font-bold font-['DM_Sans']">€485</span>
              </div>

              <button
                onClick={() => handleBookAgain('Le Gabriel - La Réserve')}
                className="w-full h-9 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-medium rounded-xl flex items-center justify-center transition shadow-md shadow-yellow-500/10"
              >
                Repeat Order & Reserve
              </button>
            </div>

            {/* Order Card 2 */}
            <div className="w-72 bg-neutral-900 border border-white/10 rounded-2xl p-3.5 flex flex-col gap-3 shrink-0 snap-start shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-11 relative rounded-lg overflow-hidden shrink-0 border border-white/10">
                    <Image src="/images/burger.jpg" alt="The Burger Lab" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-xs font-semibold text-white">The Burger Lab</h4>
                    <span className="text-[10px] text-white/70">2 Days Ago</span>
                    <span className="text-[9px] text-white/60">Sep 20 • Delivery</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-1 text-[10px] font-['Inter'] backdrop-blur-md">
                <div className="flex items-center justify-between text-stone-300">
                  <span>2x Classic Wagyu Smash Burger</span>
                  <span className="text-white font-medium">$26.50</span>
                </div>
                <div className="flex items-center justify-between text-stone-300">
                  <span>1x Truffle Fries & Aioli</span>
                  <span className="text-white font-medium">$8.50</span>
                </div>
              </div>

              <div className="p-2.5 bg-yellow-400/10 border border-white/10 rounded-xl text-[10px]">
                <span className="text-white font-medium">Saved Preference: </span>
                <span className="text-neutral-400">"Gluten-free bun requested & well done patties."</span>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-neutral-400 font-semibold">Total Paid</span>
                <span className="text-white font-bold font-['DM_Sans']">$35.00</span>
              </div>

              <button
                onClick={() => handleBookAgain('The Burger Lab')}
                className="w-full h-9 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-medium rounded-xl flex items-center justify-center transition shadow-md shadow-yellow-500/10"
              >
                Repeat Order & Reserve
              </button>
            </div>
          </div>
        </div>

        {/* 5. Private Concierge Privileges - Offers from Favourite Restaurants */}
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-white/60 font-['Inter']">Private Concierge Privileges</span>
            <h3 className="text-base font-semibold text-white font-['Inter']">
              Offers from Favourite Restaurants
            </h3>
          </div>

          {/* Swiper Slider Row */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
            {/* Offer Card 1 */}
            <div className="w-56 bg-neutral-900 border border-white/10 rounded-2xl p-3 flex flex-col gap-2 shrink-0 snap-start shadow-lg">
              <div className="w-full h-28 relative rounded-xl overflow-hidden border border-white/10">
                <Image src="/images/slide1.jpg" alt="Private Cellar Tour" fill className="object-cover" />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-zinc-900/90 text-red-50 text-[8px] font-medium rounded-full border border-white/10">
                  Tavonza Black Exclusive
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black text-red-50 text-[10px] font-semibold rounded-lg">
                  €88
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-white/60 font-['Inter']">Le Gabriel</span>
                <h4 className="text-xs font-semibold text-white font-['Inter'] line-clamp-2">
                  Private Sommelier Cellar Tour & Vintage Pour
                </h4>
                <p className="text-[10px] text-white/60 font-['Inter'] line-clamp-1">
                  Complimentary access to La Réserve cellar
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-[10px]">
                <span className="text-white/60">Valid until Aug 15</span>
                <button
                  onClick={() => handleClaimPerk('Private Sommelier Cellar Tour')}
                  className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-black text-[10px] font-semibold rounded-lg transition"
                >
                  Claim Perk
                </button>
              </div>
            </div>

            {/* Offer Card 2 */}
            <div className="w-56 bg-neutral-900 border border-white/10 rounded-2xl p-3 flex flex-col gap-2 shrink-0 snap-start shadow-lg">
              <div className="w-full h-28 relative rounded-xl overflow-hidden border border-white/10">
                <Image src="/images/slide3.jpg" alt="Truffle Flight" fill className="object-cover" />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-zinc-900/90 text-red-50 text-[8px] font-medium rounded-full border border-white/10">
                  Tavonza Black Exclusive
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black text-yellow-400 text-[10px] font-semibold rounded-lg">
                  FREE
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-white/60 font-['Inter']">Maison Verde</span>
                <h4 className="text-xs font-semibold text-white font-['Inter'] line-clamp-2">
                  Aged Parmigiano & Truffle Tasting Flight
                </h4>
                <p className="text-[10px] text-white/60 font-['Inter'] line-clamp-1">
                  Complimentary pairing with dinner alcove table lock
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-[10px]">
                <span className="text-white/60">Valid until Sep 01</span>
                <button
                  onClick={() => handleClaimPerk('Aged Parmigiano & Truffle Tasting Flight')}
                  className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-black text-[10px] font-semibold rounded-lg transition"
                >
                  Claim Perk
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

