'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  Settings,
  Edit,
  MapPin,
  Utensils,
  Coffee,
  Beer,
  Clock,
  CheckCircle2,
  Store,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { RestaurantBranch, StaffMember, MenuItem, SubBranch, StaffShift } from '../types';
import ManageShiftsModal from './ManageShiftsModal';
import AddStaffModal from './AddStaffModal';

interface RestaurantDetailViewProps {
  restaurant: RestaurantBranch;
  initialTab?: 'overview' | 'branches' | 'staff' | 'menu' | 'analytics';
  onBack: () => void;
  onEdit: (restaurant: RestaurantBranch) => void;
  onSettings?: (restaurant: RestaurantBranch) => void;
  onManageBranches?: () => void;
}

export default function RestaurantDetailView({
  restaurant,
  initialTab = 'overview',
  onBack,
  onEdit,
  onSettings,
  onManageBranches,
}: RestaurantDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'staff' | 'menu' | 'analytics'>(initialTab);
  const [selectedStaffForShift, setSelectedStaffForShift] = useState<StaffMember | null>(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>(restaurant.assignedStaff || []);

  const getTypeIcon = () => {
    switch (restaurant.type) {
      case 'Café':
        return Coffee;
      case 'Bar':
        return Beer;
      default:
        return Utensils;
    }
  };

  const TypeIcon = getTypeIcon();

  // Helper to toggle day in shift modal
  const handleToggleDay = (day: string) => {
    if (!selectedStaffForShift) return;
    const currentDays = selectedStaffForShift.days || [];
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    const updatedStaff = { ...selectedStaffForShift, days: updatedDays };
    setSelectedStaffForShift(updatedStaff);
    setStaffList((prev) =>
      prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP NAV BAR (From Figma Images 2, 3, 4, 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm shrink-0"
            title="Back to All Restaurants"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              {restaurant.name}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {restaurant.type} · {restaurant.address}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => (onSettings ? onSettings(restaurant) : onEdit(restaurant))}
            className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Restaurant Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onEdit(restaurant)}
            className="h-10 px-4 rounded-xl bg-black hover:bg-zinc-950 border border-zinc-700 hover:border-amber-500/50 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Edit className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit Restaurant</span>
          </button>
        </div>
      </div>

      {/* 2. RESTAURANT HERO PROFILE BANNER (From Figma Images) */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        {/* Left: Plate Icon + Title + Location */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <TypeIcon className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-white font-['Inter']">
                {restaurant.name}
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  restaurant.status === 'Open'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    restaurant.status === 'Open' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span>{restaurant.status}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span>{restaurant.address}</span>
            </div>
          </div>
        </div>

        {/* Right Stats: Staff, Branches, Type */}
        <div className="flex items-center gap-8 md:gap-12 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-800">
          <div className="text-center md:text-right">
            <div className="text-2xl font-serif font-bold text-white">
              {restaurant.staffCount}
            </div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider mt-0.5">
              Staff
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="text-2xl font-serif font-bold text-white">
              {restaurant.branchesCount ?? (restaurant.branchesList?.length || 0)}
            </div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider mt-0.5">
              Branches
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="text-lg font-serif font-bold text-white">
              {restaurant.type}
            </div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider mt-0.5">
              Type
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION BAR (From Figma Images) */}
      <div className="flex items-center gap-8 border-b border-zinc-800/80 overflow-x-auto custom-scrollbar">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'branches', label: 'Branches' },
          { id: 'staff', label: 'Staff' },
          { id: 'menu', label: 'Menu' },
          { id: 'analytics', label: 'Analytics' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                isActive ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENT PANELS */}

      {/* TAB 1: OVERVIEW (Image 2) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Restaurant Details Card (Image 2) */}
            <div className="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-2 pb-4 border-b border-zinc-800 text-sm font-semibold text-white">
                <span className="w-4 h-4 rounded-full border border-zinc-500 flex items-center justify-center text-[10px] text-zinc-400">
                  ℹ
                </span>
                <span>Restaurant Details</span>
              </div>

              <div className="divide-y divide-zinc-800/60 text-xs">
                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">ID</span>
                  <span className="text-white font-mono font-semibold">
                    {restaurant.codeId || 'REST-0001'}
                  </span>
                </div>

                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Type</span>
                  <span className="text-white font-medium">{restaurant.type}</span>
                </div>

                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Location</span>
                  <span className="text-white font-medium">{restaurant.address}</span>
                </div>

                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Manager</span>
                  <span className="text-white font-semibold">
                    {restaurant.manager?.name || 'Sarah Ahmed'}
                  </span>
                </div>

                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Staff Count</span>
                  <span className="text-white font-medium">
                    {restaurant.staffCount} Members
                  </span>
                </div>

                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Branches</span>
                  <span className="text-white font-medium">
                    {restaurant.branchesCount ?? 2} Locations
                  </span>
                </div>
              </div>
            </div>

            {/* Right: 3 Stat KPI Cards (Image 2) */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4">
              {/* Card 1: This Month Revenue */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between shadow-md">
                <div>
                  <div className="text-xs text-zinc-400 font-medium">This Month Revenue</div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                    {restaurant.detailStats?.thisMonthRevenue || '৳4,28,500'}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{restaurant.detailStats?.thisMonthRevenueChange || '+18%'}</span>
                </div>
              </div>

              {/* Card 2: Total Orders */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between shadow-md">
                <div>
                  <div className="text-xs text-zinc-400 font-medium">Total Orders (Month)</div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                    {restaurant.detailStats?.totalOrders || '1,284'}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{restaurant.detailStats?.totalOrdersChange || '+9%'}</span>
                </div>
              </div>

              {/* Card 3: Avg Daily Revenue */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between shadow-md">
                <div>
                  <div className="text-xs text-zinc-400 font-medium">Avg. Daily Revenue</div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                    {restaurant.detailStats?.avgDailyRevenue || '৳13,820'}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-bold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>{restaurant.detailStats?.avgDailyRevenueChange || '-3%'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Services Card (Image 2) */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-md">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3.5">
              Active Services
            </h3>
            <div className="flex items-center gap-2.5 flex-wrap">
              {(restaurant.services && restaurant.services.length > 0
                ? restaurant.services
                : ['Dine-In', 'Delivery', 'Pickup', 'QR Ordering']
              ).map((service, index) => (
                <span
                  key={index}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRANCHES (Image 3) */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <p className="text-xs sm:text-sm text-zinc-400 font-medium">
              {(restaurant.branchesList?.length || 2)} branches under this restaurant
            </p>
            <button
              type="button"
              onClick={onManageBranches}
              className="h-9 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-400/50 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Manage Branches</span>
            </button>
          </div>

          <div className="space-y-3">
            {(restaurant.branchesList && restaurant.branchesList.length > 0
              ? restaurant.branchesList
              : [
                  {
                    id: 'br-def1',
                    name: 'Tavonza Uttara',
                    location: 'Uttara, Dhaka · 7 staff',
                    staffCount: 7,
                    status: 'Open' as const,
                    manager: 'Arif Hossain',
                  },
                  {
                    id: 'br-def2',
                    name: 'Tavonza Mirpur',
                    location: 'Mirpur, Dhaka · 5 staff',
                    staffCount: 5,
                    status: 'Closed' as const,
                    manager: 'Priya Sen',
                  },
                ]
            ).map((branch) => (
              <div
                key={branch.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 hover:border-zinc-700 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-300 shrink-0">
                    <Store className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {branch.name}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{branch.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border shrink-0 ${
                      branch.status === 'Open'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        branch.status === 'Open' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                    <span>{branch.status}</span>
                  </span>

                  <span className="text-xs text-zinc-400 hidden sm:inline-block font-medium">
                    {branch.manager}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STAFF (Image 4) */}
      {activeTab === 'staff' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-md">
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Staff Members</h3>
              <span className="text-xs text-zinc-400 font-mono">
                {staffList.length} total
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsAddStaffOpen(true)}
              className="h-9 px-4 rounded-xl bg-black hover:bg-zinc-950 border border-zinc-700/80 hover:border-amber-400/50 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Staff</span>
            </button>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {staffList.map((member) => (
              <div
                key={member.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/30 transition-colors"
              >
                {/* Left: Avatar + Name + Role */}
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-200 shrink-0">
                    {member.avatar || member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{member.name}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {member.role} · {member.restaurantName || restaurant.name}
                    </p>
                  </div>
                </div>

                {/* Right: Days + Status + Shifts Button */}
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  {/* Days */}
                  <div className="flex items-center gap-1.5">
                    {(member.days || ['Mon', 'Wed', 'Fri']).map((day, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-amber-300 border border-zinc-700"
                      >
                        {day}
                      </span>
                    ))}
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      member.status === 'On Leave'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    }`}
                  >
                    {member.status || 'Active'}
                  </span>

                  {/* Shifts Action Button (Image 4) */}
                  <button
                    type="button"
                    onClick={() => setSelectedStaffForShift(member)}
                    className="h-8 px-3 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/60 hover:border-amber-400/50 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Shifts</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MENU (Image 5) */}
      {activeTab === 'menu' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-md">
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Menu Items</h3>
            <span className="text-xs text-zinc-400">
              {(restaurant.menuItems?.length || 5)} items
            </span>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {(restaurant.menuItems && restaurant.menuItems.length > 0
              ? restaurant.menuItems
              : [
                  {
                    id: 'm1',
                    name: 'Grilled Chicken',
                    category: 'Main Course',
                    price: '৳480',
                    status: 'Available' as const,
                  },
                  {
                    id: 'm2',
                    name: 'Beef Burger',
                    category: 'Fast Food',
                    price: '৳350',
                    status: 'Available' as const,
                  },
                  {
                    id: 'm3',
                    name: 'Caesar Salad',
                    category: 'Starters',
                    price: '৳220',
                    status: 'Available' as const,
                  },
                  {
                    id: 'm4',
                    name: 'Pasta Carbonara',
                    category: 'Main Course',
                    price: '৳420',
                    status: 'Out of Stock' as const,
                  },
                  {
                    id: 'm5',
                    name: 'Chocolate Lava Cake',
                    category: 'Desserts',
                    price: '৳180',
                    status: 'Available' as const,
                  },
                ]
            ).map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400 shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{item.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm sm:text-base font-serif font-bold text-white">
                    {item.price}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      item.status === 'Available'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <span className="text-xs text-zinc-400 font-medium">Average Ticket Size</span>
              <div className="text-2xl font-serif font-bold text-white mt-1.5">৳1,450</div>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+8.4% this week</span>
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <span className="text-xs text-zinc-400 font-medium">Seat Turnover Time</span>
              <div className="text-2xl font-serif font-bold text-white mt-1.5">38 mins</div>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>-5 mins faster</span>
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <span className="text-xs text-zinc-400 font-medium">Food Margin (COGS)</span>
              <div className="text-2xl font-serif font-bold text-white mt-1.5">69.2%</div>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Optimal profitability</span>
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Weekly Revenue Trajectory</h3>
              <span className="text-xs text-zinc-400">Past 7 Days</span>
            </div>
            <div className="space-y-3">
              {[
                { day: 'Monday', rev: '৳52,400', pct: '60%' },
                { day: 'Tuesday', rev: '৳61,200', pct: '70%' },
                { day: 'Wednesday', rev: '৳68,800', pct: '78%' },
                { day: 'Thursday', rev: '৳84,200', pct: '92%' },
                { day: 'Friday (Peak)', rev: '৳98,500', pct: '100%' },
                { day: 'Saturday', rev: '৳92,100', pct: '95%' },
                { day: 'Sunday', rev: '৳71,300', pct: '82%' },
              ].map((row, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium">{row.day}</span>
                    <span className="text-white font-mono font-bold">{row.rev}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                      style={{ width: row.pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SHIFT SCHEDULER MODAL (Figma Images 2 & 3) */}
      <ManageShiftsModal
        isOpen={!!selectedStaffForShift}
        onClose={() => setSelectedStaffForShift(null)}
        staff={selectedStaffForShift}
        onSave={(staffId, updatedShifts) => {
          setStaffList((prev) =>
            prev.map((s) =>
              s.id === staffId
                ? {
                    ...s,
                    shifts: updatedShifts,
                    days: updatedShifts.map((sh) => sh.shortDay),
                  }
                : s
            )
          );
        }}
      />

      {/* ADD STAFF MODAL (Figma Images 2 & 3) */}
      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        restaurantName={restaurant.name}
        onAddStaff={(newStaff) => {
          setStaffList((prev) => [newStaff, ...prev]);
        }}
      />
    </div>
  );
}
