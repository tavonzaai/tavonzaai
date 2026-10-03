'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Clock, ChevronDown } from 'lucide-react';
import {
  RestaurantBranch,
  RestaurantType,
  RestaurantStatus,
  Manager,
} from '../types';
import { MOCK_MANAGERS } from '../restaurantsData';

interface EditRestaurantModalProps {
  restaurant: RestaurantBranch | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: RestaurantBranch) => void;
}

interface DayHourState {
  day: string;
  openTime: string;
  closeTime: string;
}

const DEFAULT_WEEK_HOURS: DayHourState[] = [
  { day: 'Monday', openTime: '09:00', closeTime: '22:00' },
  { day: 'Tuesday', openTime: '09:00', closeTime: '22:00' },
  { day: 'Wednesday', openTime: '09:00', closeTime: '22:00' },
  { day: 'Thursday', openTime: '09:00', closeTime: '22:00' },
  { day: 'Friday', openTime: '09:00', closeTime: '22:00' },
  { day: 'Saturday', openTime: '10:00', closeTime: '22:00' },
  { day: 'Sunday', openTime: '10:00', closeTime: '22:00' },
];

export default function EditRestaurantModal({
  restaurant,
  isOpen,
  onClose,
  onSave,
}: EditRestaurantModalProps) {
  // Basic Info
  const [name, setName] = useState('');
  const [type, setType] = useState<RestaurantType>('Restaurant');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Status
  const [status, setStatus] = useState<RestaurantStatus>('Open');

  // Manager
  const [selectedManagerId, setSelectedManagerId] = useState<string>('mgr-1');

  // Services Offered (2x2 grid in Figma)
  const [services, setServices] = useState<string[]>([
    'Dine-in',
    'Delivery',
    'Pickup',
    'QR Ordering',
  ]);

  // Opening Hours (7 days)
  const [openingHours, setOpeningHours] = useState<DayHourState[]>(DEFAULT_WEEK_HOURS);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || 'Tavonza Downtown');
      setType(restaurant.type || 'Restaurant');
      setPhone(restaurant.phone || '+880 1700-1111');
      setEmail(restaurant.email || 'contact@tavonza.com');
      setAddress(restaurant.address || 'Road 12, Block D');
      setCity(restaurant.city || 'Dhaka');
      setPostalCode(restaurant.postalCode || '1207');
      setStatus(restaurant.status || 'Open');

      if (restaurant.manager?.id) {
        setSelectedManagerId(restaurant.manager.id);
      } else {
        setSelectedManagerId('mgr-1');
      }

      if (restaurant.services && restaurant.services.length > 0) {
        const mapped = restaurant.services.map((s) => {
          if (s.toLowerCase().includes('dine')) return 'Dine-in';
          if (s.toLowerCase().includes('delivery')) return 'Delivery';
          if (s.toLowerCase().includes('pickup') || s.toLowerCase().includes('takeaway'))
            return 'Pickup';
          if (s.toLowerCase().includes('qr')) return 'QR Ordering';
          return s;
        });
        setServices(mapped);
      } else {
        setServices(['Dine-in', 'Delivery', 'Pickup', 'QR Ordering']);
      }

      if (restaurant.operatingHours && restaurant.operatingHours.length >= 7) {
        setOpeningHours(
          restaurant.operatingHours.map((h) => ({
            day: h.day,
            openTime: h.openTime?.replace(' AM', '')?.replace(' PM', '') || '09:00',
            closeTime: h.closeTime?.replace(' AM', '')?.replace(' PM', '') || '22:00',
          }))
        );
      } else {
        setOpeningHours(DEFAULT_WEEK_HOURS);
      }
    }
  }, [restaurant]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !restaurant) return null;

  const toggleService = (svc: string) => {
    setServices((prev) =>
      prev.includes(svc) ? prev.filter((item) => item !== svc) : [...prev, svc]
    );
  };

  const handleHourChange = (dayIndex: number, field: 'openTime' | 'closeTime', val: string) => {
    setOpeningHours((prev) => {
      const next = [...prev];
      next[dayIndex] = { ...next[dayIndex], [field]: val };
      return next;
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assignedMgr =
      MOCK_MANAGERS.find((m) => m.id === selectedManagerId) ||
      restaurant.manager ||
      MOCK_MANAGERS[0];

    const updatedOperatingHours = openingHours.map((h) => ({
      day: h.day,
      isOpen: true,
      openTime: h.openTime,
      closeTime: h.closeTime,
    }));

    onSave({
      ...restaurant,
      name: name.trim() || restaurant.name,
      type,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      status,
      manager: assignedMgr,
      services,
      operatingHours: updatedOperatingHours,
    });

    onClose();
  };

  const restaurantTypes: RestaurantType[] = ['Restaurant', 'Café', 'Bar', 'Fast Food', 'Bakery'];
  const statusOptions: RestaurantStatus[] = ['Open', 'Closed', 'Temporarily Closed'];
  const serviceOptions = ['Dine-in', 'Delivery', 'Pickup', 'QR Ordering'];

  return (
    <div
      className="fixed top-20 left-0 md:left-64 right-0 bottom-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[calc(100vh-6.5rem)] bg-zinc-950 text-white border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header Bar with Close Button */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/80 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white">Edit Restaurant</h2>
            <p className="text-[11px] text-zinc-400">{restaurant.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* ========================================================================= */}
          {/* 1. BASIC INFORMATION CARD */}
          {/* ========================================================================= */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 space-y-3.5 shadow-sm">
            <h3 className="text-xs sm:text-sm font-bold text-white">Basic Information</h3>

            {/* Restaurant Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Restaurant Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Restaurant Name"
                className="w-full h-10 px-3.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Restaurant Type Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Restaurant Type</label>
              <div className="flex flex-wrap gap-2">
                {restaurantTypes.map((t) => {
                  const isSelected = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-black font-semibold shadow-xs'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-600 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1700-1111"
                className="w-full h-10 px-3.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@tavonza.com"
                className="w-full h-10 px-3.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. LOCATION CARD */}
          {/* ========================================================================= */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 space-y-3.5 shadow-sm">
            <h3 className="text-xs sm:text-sm font-bold text-white">Location</h3>

            {/* Street Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Road 12, Block D"
                className="w-full h-10 px-3.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* 2-Column: City & Postal Code */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Dhaka"
                  className="w-full h-10 px-3.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="1207"
                  className="w-full h-10 px-3.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. STATUS CARD */}
          {/* ========================================================================= */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 space-y-3.5 shadow-sm">
            <h3 className="text-xs sm:text-sm font-bold text-white">Status</h3>

            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((st) => {
                const isSelected = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-black font-bold shadow-xs'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-750 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. MANAGER CARD */}
          {/* ========================================================================= */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 space-y-3.5 shadow-sm">
            <h3 className="text-xs sm:text-sm font-bold text-white">Manager</h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Assigned Manager</label>
              <div className="relative">
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="w-full h-10 pl-3.5 pr-8 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition-colors appearance-none cursor-pointer"
                >
                  {MOCK_MANAGERS.map((mgr) => (
                    <option key={mgr.id} value={mgr.id} className="bg-zinc-900 text-white">
                      {mgr.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. SERVICES OFFERED (2x2 Grid) */}
          {/* ========================================================================= */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 space-y-3.5 shadow-sm">
            <h3 className="text-xs sm:text-sm font-bold text-white">Services Offered</h3>

            <div className="grid grid-cols-2 gap-3">
              {serviceOptions.map((svc) => {
                const isSelected = services.includes(svc);
                return (
                  <div
                    key={svc}
                    onClick={() => toggleService(svc)}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all select-none ${
                      isSelected
                        ? 'bg-amber-500/10 border-2 border-amber-500 shadow-sm text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-amber-400 text-black' : 'border border-zinc-700 bg-zinc-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-xs ${
                        isSelected ? 'font-semibold text-amber-200' : 'font-medium text-zinc-400'
                      }`}
                    >
                      {svc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. OPENING HOURS (7 Days) */}
          {/* ========================================================================= */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 space-y-3 shadow-sm">
            <h3 className="text-xs sm:text-sm font-bold text-white">Opening Hours</h3>

            <div className="space-y-2">
              {openingHours.map((schedule, idx) => (
                <div
                  key={schedule.day}
                  className="p-2 sm:p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-semibold text-zinc-200 w-20 sm:w-24 shrink-0">
                    {schedule.day}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Open Time Pill */}
                    <div className="h-8 px-2.5 bg-zinc-800/90 border border-zinc-700/80 rounded-lg flex items-center gap-1.5 w-24 sm:w-28 justify-between shadow-xs">
                      <input
                        type="text"
                        value={schedule.openTime}
                        onChange={(e) => handleHourChange(idx, 'openTime', e.target.value)}
                        className="w-full bg-transparent text-xs font-medium text-white focus:outline-none"
                      />
                      <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    </div>

                    <span className="text-zinc-500 text-xs font-light">—</span>

                    {/* Close Time Pill */}
                    <div className="h-8 px-2.5 bg-zinc-800/90 border border-zinc-700/80 rounded-lg flex items-center gap-1.5 w-24 sm:w-28 justify-between shadow-xs">
                      <input
                        type="text"
                        value={schedule.closeTime}
                        onChange={(e) => handleHourChange(idx, 'closeTime', e.target.value)}
                        className="w-full bg-transparent text-xs font-medium text-white focus:outline-none"
                      />
                      <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FOOTER ACTIONS */}
          {/* ========================================================================= */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
