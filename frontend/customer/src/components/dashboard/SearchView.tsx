'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Star, Clock, Compass, Tag, Sparkles } from 'lucide-react';

interface SearchViewProps {
  onReserveClick?: () => void;
  onDishClick?: () => void;
}

export default function SearchView({ onReserveClick, onDishClick }: SearchViewProps) {
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState<'restaurants' | 'dishes'>('restaurants');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('Date Night');
  const [selectedDietary, setSelectedDietary] = useState('Keto & Low Carb');

  const cuisines = ['Date Night', 'Post Workout', 'Business Lunch', 'Late Night Drinks'];
  const dietaries = ['Keto & Low Carb', 'Post Workout', 'Business Lunch', 'Late Night Drinks'];

  const handleReserve = () => {
    if (onReserveClick) {
      onReserveClick();
    } else {
      router.push('/reserve');
    }
  };

  const handleDishDetail = () => {
    if (onDishClick) {
      onDishClick();
    } else {
      router.push('/dish-detail');
    }
  };

  const restaurantResults = [
    {
      id: 1,
      name: 'Maison Verde - Tuscan Trattoria',
      rating: '4.9',
      status: 'Open until 11:00 PM',
      distance: '1.2 km away • Champs-Élysées',
      waitTime: 'Approx. 15-minute wait',
      image: '/images/slide2.jpg',
      slots: ['8:00 PM', '8:30 PM', '9:00 PM'],
    },
    {
      id: 2,
      name: 'The Burger Lab',
      rating: '4.5',
      offer: 'OFFER',
      status: 'Open until 12:00 AM',
      cuisine: 'American · Burgers',
      prepTime: '20–30 min',
      price: '$26.50',
      image: '/images/burger.jpg',
      slots: ['7:30 PM', '8:00 PM', '8:30 PM'],
    },
  ];

  const dishResults = [
    {
      id: 101,
      title: 'Pan-Seared Line-Caught Seabass',
      restaurant: 'Le Gabriel . Contemporary French',
      price: '€88',
      match: '99% Health Match',
      image: '/images/seabass.jpg',
      tags: ['Keto & Low Carb', 'High Protein'],
    },
    {
      id: 102,
      title: 'Double Truffle Wagyu Burger',
      restaurant: 'The Burger Lab',
      price: '$26.50',
      match: '95% Preference Match',
      image: '/images/burger.jpg',
      tags: ['Organic Beef', 'Keto Bun Available'],
    },
  ];

  const handleOpenReserve = (restoName: string) => {
    handleReserve();
  };

  return (
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto min-h-screen bg-black text-white flex flex-col justify-between relative overflow-x-hidden font-sans">
      <div className="w-full flex-1 flex flex-col gap-5 pb-24 pt-2">

        {/* 1. Curated Discovery Header Hero Banner */}
        <div className="w-full p-5 bg-gradient-to-br from-neutral-900 to-neutral-800/20 border-b border-white/10 flex flex-col gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-neutral-700 w-fit">
            <Compass className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400 text-[10px] font-semibold font-['Inter']">
              Curated Discovery
            </span>
          </div>

          <h2 className="text-base font-semibold text-white font-['Inter']">
            Explore Restaurants & Fine Dining
          </h2>

          <p className="text-xs text-neutral-400 leading-relaxed font-['Poppins']">
            Search by cuisine, dietary profile, acoustics, or specific dishes around Paris, 8th Arr. • Triangle d'Or.
          </p>
        </div>

        {/* 2. Filter & Search Panel Box */}
        <div className="mx-5 bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
          {/* Segmented Switcher (Restaurants vs Dishes) */}
          <div className="w-full flex items-center bg-black/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveSegment('restaurants')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium font-['Inter'] transition flex items-center justify-center gap-1 ${
                activeSegment === 'restaurants'
                  ? 'bg-yellow-500 text-black shadow-md font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Restaurants (5)</span>
            </button>
            <button
              onClick={() => setActiveSegment('dishes')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium font-['Inter'] transition flex items-center justify-center gap-1 ${
                activeSegment === 'dishes'
                  ? 'bg-yellow-500 text-black shadow-md font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Dishes (4)</span>
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="w-full px-3.5 py-2.5 bg-white/10 rounded-xl border border-zinc-800 backdrop-blur-sm flex items-center gap-2.5">
            <Search className="w-4 h-4 text-neutral-300 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Italian,Vegetarian..."
              className="w-full bg-transparent text-xs text-gray-200 placeholder:text-gray-400 font-['Montserrat'] focus:outline-none"
            />
          </div>

          {/* Cuisine Filter Pills */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-yellow-400 font-['Inter']">Cuisine</h4>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {cuisines.map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedCuisine(item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium font-['Montserrat'] whitespace-nowrap transition ${
                    selectedCuisine === item
                      ? 'bg-yellow-400 text-black font-semibold shadow-md shadow-yellow-500/20'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Filter Pills */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-yellow-400 font-['Inter']">Dietary</h4>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {dietaries.map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedDietary(item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium font-['Montserrat'] whitespace-nowrap transition ${
                    selectedDietary === item
                      ? 'bg-yellow-400 text-black font-semibold shadow-md shadow-yellow-500/20'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Search Results List */}
        <div className="flex flex-col gap-3 px-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white font-['Inter']">
              {activeSegment === 'restaurants' ? 'Matching Restaurants' : 'Matching Dishes'}
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              {activeSegment === 'restaurants' ? `${restaurantResults.length} found` : `${dishResults.length} found`}
            </span>
          </div>

          {activeSegment === 'restaurants' ? (
            <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
              {restaurantResults.map((resto) => (
                <div
                  key={resto.id}
                  className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between gap-3 shadow-lg hover:border-yellow-400/30 transition"
                >
                  {/* Card Image Banner */}
                  <div className="w-full h-36 relative rounded-xl overflow-hidden">
                    <Image src={resto.image} alt={resto.name} fill className="object-cover" />

                    {/* Top Ratings & Offer Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                      <div className="px-2 py-1 bg-zinc-900/90 backdrop-blur-md rounded-full flex items-center gap-1.5 border border-white/10">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[11px] font-semibold text-red-50">{resto.rating}</span>
                      </div>

                      {resto.offer && (
                        <div className="px-2.5 py-1 bg-amber-500 text-red-50 text-[10px] font-bold rounded-full shadow-md">
                          {resto.offer}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Details */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white font-['Inter']">{resto.name}</h4>
                      {resto.price && (
                        <span className="text-sm font-bold text-amber-500 font-['DM_Sans']">{resto.price}</span>
                      )}
                    </div>

                    {resto.status && (
                      <div className="flex items-center gap-1 text-xs text-yellow-400 font-medium">
                        <Clock className="w-3 h-3 text-yellow-400" />
                        <span>{resto.status}</span>
                      </div>
                    )}

                    {resto.cuisine && (
                      <p className="text-xs text-slate-400 font-['Inter']">{resto.cuisine}</p>
                    )}

                    {resto.distance && (
                      <p className="text-xs text-neutral-400 flex items-center gap-1 font-['Inter']">
                        <MapPin className="w-3 h-3 text-neutral-500" />
                        <span>{resto.distance}</span>
                      </p>
                    )}
                  </div>

                  {/* Wait Time & Prep Info */}
                  <div className="flex items-center gap-2">
                    {resto.waitTime && (
                      <div className="px-2.5 py-1 bg-zinc-800 rounded-md text-[11px] text-zinc-100 font-medium">
                        {resto.waitTime}
                      </div>
                    )}
                    {resto.prepTime && (
                      <div className="px-2.5 py-1 bg-zinc-800 rounded-md text-[11px] text-slate-300 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white/60" />
                        <span>{resto.prepTime}</span>
                      </div>
                    )}
                  </div>

                  {/* Booking Slot Buttons */}
                  <div className="flex flex-col gap-1.5 pt-1 border-t border-neutral-800">
                    <span className="text-[10px] text-neutral-400 font-['Inter']">Available Reservation Times Tonight:</span>
                    <div className="flex items-center gap-2">
                      {resto.slots.map((slot, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleOpenReserve(resto.name)}
                          className="flex-1 py-1.5 bg-zinc-800 hover:bg-yellow-400 hover:text-black rounded-lg text-xs font-medium text-zinc-100 transition shadow-sm text-center"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
              {dishResults.map((dish) => (
                <div
                  key={dish.id}
                  className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-3.5 flex flex-col gap-3 shadow-lg"
                >
                  <div className="w-full h-36 relative rounded-xl overflow-hidden">
                    <Image src={dish.image} alt={dish.title} fill className="object-cover" />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-zinc-900/90 text-white text-[10px] font-medium rounded-md border border-white/10">
                      {dish.match}
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-black text-yellow-400 text-xs font-bold rounded-md">
                      {dish.price}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-400 font-['Inter']">{dish.restaurant}</span>
                    <h4 className="text-sm font-semibold text-white font-['Inter']">{dish.title}</h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {dish.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 bg-zinc-800 text-[10px] font-medium text-yellow-400 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

