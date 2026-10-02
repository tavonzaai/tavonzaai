'use client';

import React from 'react';
import {
  X,
  MapPin,
  Phone,
  Mail,
  Users,
  Clock,
  CheckCircle2,
  Utensils,
  Star,
  DollarSign,
  Layers,
} from 'lucide-react';
import { RestaurantBranch } from '../types';

interface RestaurantDetailModalProps {
  restaurant: RestaurantBranch | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (restaurant: RestaurantBranch) => void;
}

export default function RestaurantDetailModal({
  restaurant,
  isOpen,
  onClose,
  onEdit,
}: RestaurantDetailModalProps) {
  if (!isOpen || !restaurant) return null;

  return (
    <div
      className="fixed top-20 left-0 md:left-64 right-0 bottom-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[calc(100vh-6.5rem)] bg-neutral-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-start justify-between bg-zinc-950/60">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1px]">
              <div className="w-full h-full bg-zinc-950 rounded-[15px] flex items-center justify-center text-amber-400">
                <Utensils className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{restaurant.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    restaurant.status === 'Open'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {restaurant.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>
                  {restaurant.address}, {restaurant.city}, {restaurant.country}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl">
              <div className="text-xs text-zinc-400 font-medium">Monthly Revenue</div>
              <div className="text-lg font-bold text-white mt-0.5">{restaurant.revenue || '$42,850/mo'}</div>
            </div>
            <div className="p-3.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl">
              <div className="text-xs text-zinc-400 font-medium">Guest Rating</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5 flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{restaurant.rating || 4.9}</span>
              </div>
            </div>
            <div className="p-3.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl">
              <div className="text-xs text-zinc-400 font-medium">Staff Members</div>
              <div className="text-lg font-bold text-white mt-0.5">{restaurant.staffCount} Staff</div>
            </div>
            <div className="p-3.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl">
              <div className="text-xs text-zinc-400 font-medium">Tables Count</div>
              <div className="text-lg font-bold text-white mt-0.5">{restaurant.tablesCount || 24} Tables</div>
            </div>
          </div>

          {/* Contact & Branch Manager */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Manager info */}
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
              <div className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
                Assigned Branch Manager
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-400 text-white font-bold text-base flex items-center justify-center flex-shrink-0 shadow-md">
                  {restaurant.manager?.avatar || 'MG'}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{restaurant.manager?.name}</div>
                  <div className="text-zinc-400 text-xs">{restaurant.manager?.role}</div>
                  <div className="text-amber-400/90 text-xs mt-0.5">{restaurant.manager?.email}</div>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
              <div className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
                Contact & Logistics
              </div>
              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{restaurant.phone || '+880 2-9661234'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{restaurant.email || 'info@tavonza.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Type: {restaurant.type} • Postal: {restaurant.postalCode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase text-zinc-400 tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Weekly Operating Schedule</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {restaurant.operatingHours?.map((schedule) => (
                <div
                  key={schedule.day}
                  className="p-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-xs"
                >
                  <div className="font-medium text-white">{schedule.day}</div>
                  <div className="text-zinc-400 mt-0.5 text-[11px]">
                    {schedule.openTime} - {schedule.closeTime}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Staff Roster */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase text-zinc-400 tracking-wider flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              <span>Assigned Team Roster ({restaurant.assignedStaff?.length || 0})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {restaurant.assignedStaff?.map((staff) => (
                <div
                  key={staff.id}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200">
                    {staff.avatar}
                  </div>
                  <div>
                    <div className="text-white text-xs font-medium">{staff.name}</div>
                    <div className="text-zinc-400 text-[11px]">{staff.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(restaurant);
            }}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-amber-500/20"
          >
            Edit Restaurant
          </button>
        </div>
      </div>
    </div>
  );
}
