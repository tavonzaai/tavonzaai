'use client';

import React, { useState } from 'react';
import { X, Bot, CheckCircle2, Sparkles, ChevronDown } from 'lucide-react';

interface InstantReserveModalProps {
  restaurantName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InstantReserveModal({
  restaurantName = 'Maison Verde - Tuscan Trattoria',
  onClose,
  onSuccess,
}: InstantReserveModalProps) {
  const [date, setDate] = useState('Tonight , Aug 4');
  const [timeSlot, setTimeSlot] = useState('8:30 PM');
  const [partySize, setPartySize] = useState('1 guest');
  const [seatingArea, setSeatingArea] = useState('Private Alcove');
  const [specialRequests, setSpecialRequests] = useState(
    'Romantic anniversary dinner. Preferred quiet corner.'
  );
  const [isReserved, setIsReserved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReserved(true);
    setTimeout(() => {
      onSuccess();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg bg-neutral-900 border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl relative flex flex-col gap-4 text-white font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {isReserved ? (
          <div className="w-full py-8 flex flex-col items-center justify-center gap-3 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shadow-xl shadow-yellow-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-['Outfit'] text-white">Table Locked!</h3>
            <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
              Your reservation at <span className="text-white font-semibold">{restaurantName}</span> is confirmed for {timeSlot}. Dietary preferences auto-transmitted to kitchen.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Header Titles */}
            <div className="flex flex-col gap-1 pr-6">
              <span className="text-xs font-semibold text-yellow-400 tracking-wide font-['Inter']">
                Instant Concierge Lock
              </span>
              <h3 className="text-base font-bold text-white leading-snug font-['Inter']">
                Reserve at {restaurantName}
              </h3>
              <p className="text-[11px] text-white/60 leading-relaxed font-['Inter']">
                Your dietary profile (Keto & Low Carb, Gluten-Free Friendly, Organic Focus) will be auto-transmitted to the kitchen.
              </p>
            </div>

            {/* Grid 2x2 Dropdowns */}
            <div className="grid grid-cols-2 gap-3">
              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-stone-300 font-['Inter']">Date</label>
                <div className="relative">
                  <select
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-9 px-3 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 text-xs text-white appearance-none focus:outline-none cursor-pointer pr-7 font-['Inter']"
                  >
                    <option value="Tonight , Aug 4">Tonight , Aug 4</option>
                    <option value="Tomorrow , Aug 5">Tomorrow , Aug 5</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-white/50 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Time Slot */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-stone-300 font-['Inter']">Time Slot</label>
                <div className="relative">
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full h-9 px-3 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 text-xs text-white appearance-none focus:outline-none cursor-pointer pr-7 font-['Inter']"
                  >
                    <option value="8:30 PM">8:30 PM</option>
                    <option value="8:00 PM">8:00 PM</option>
                    <option value="9:00 PM">9:00 PM</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-white/50 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Party Size */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-stone-300 font-['Inter']">Party Size</label>
                <div className="relative">
                  <select
                    value={partySize}
                    onChange={(e) => setPartySize(e.target.value)}
                    className="w-full h-9 px-3 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 text-xs text-white appearance-none focus:outline-none cursor-pointer pr-7 font-['Inter']"
                  >
                    <option value="1 guest">1 guest</option>
                    <option value="2 guests">2 guests</option>
                    <option value="4 guests">4 guests</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-white/50 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Seating Area */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-stone-300 font-['Inter']">Seating Area</label>
                <div className="relative">
                  <select
                    value={seatingArea}
                    onChange={(e) => setSeatingArea(e.target.value)}
                    className="w-full h-9 px-3 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 text-xs text-white appearance-none focus:outline-none cursor-pointer pr-7 font-['Inter']"
                  >
                    <option value="Private Alcove">Private Alcove</option>
                    <option value="Courtyard View">Courtyard View</option>
                    <option value="Main Dining">Main Dining</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-white/50 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-stone-300 font-['Inter']">
                Special Requests for Maitre D'
              </label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full p-2.5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 text-xs text-white placeholder:text-neutral-500 font-['Inter'] focus:outline-none resize-none"
              />
            </div>

            {/* Privilege Banner */}
            <div className="w-full p-2.5 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <p className="text-[11px] text-white leading-tight font-['Inter']">
                <span className="font-semibold text-yellow-400">Tavonza Black Privilege:</span> Complimentary Welcome Champagne upon arrival.
              </p>
            </div>

            {/* Confirm Button */}
            <button
              type="submit"
              className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.99] text-black font-semibold text-xs font-['Inter'] rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20 transition mt-1"
            >
              Confirm Reservation
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
