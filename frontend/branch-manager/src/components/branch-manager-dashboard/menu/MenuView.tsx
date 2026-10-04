'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, Plus, Sparkles, SlidersHorizontal, Info, Edit3 } from 'lucide-react';
import { MenuItem } from '../types';
import { INITIAL_MENU_ITEMS } from '../data';
import ManageCategoriesModal from './ManageCategoriesModal';
import AddNewItemModal from './AddNewItemModal';
import ItemSuccessModal from './ItemSuccessModal';

export default function MenuView() {
  const [items, setItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [categories, setCategories] = useState<string[]>([
    'Starters',
    'Mains - Grill',
    'Mains - Pasta',
    'Desserts',
    'Beverages',
    'Sides',
  ]);
  const [activeCategory, setActiveCategory] = useState<string>('All Categories');
  const [stationFilter, setStationFilter] = useState('All Stations');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Modals state
  const [isManageCatOpen, setIsManageCatOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastCreatedItem, setLastCreatedItem] = useState<MenuItem | null>(null);

  const stationOptions = ['All Stations', 'Grill', 'Oven', 'Fryer', 'Bar', 'Dessert Prep'];
  const statusOptions = ['All Statuses', 'Available', 'Disabled'];

  // Calculate live counts
  const totalCount = items.length;
  const availableCount = items.filter((i) => i.status === 'Available').length;
  const disabledCount = items.filter((i) => i.status === 'Disabled').length;

  // Filter items
  const filteredItems = items.filter((item) => {
    if (activeCategory !== 'All Categories' && item.category !== activeCategory) {
      return false;
    }
    if (stationFilter !== 'All Stations' && item.stationBadge !== stationFilter) {
      return false;
    }
    if (statusFilter !== 'All Statuses' && item.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const toggleItemEnabled = (itemId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              enabled: !i.enabled,
              status: !i.enabled ? 'Available' : 'Disabled',
              availability: !i.enabled ? 'In stock' : 'Out of stock',
            }
          : i
      )
    );
  };

  const handleAddCategory = (newCat: string) => {
    if (!categories.includes(newCat)) {
      setCategories((prev) => [...prev, newCat]);
    }
  };

  const handleDeleteCategory = (catToDelete: string) => {
    setCategories((prev) => prev.filter((c) => c !== catToDelete));
    if (activeCategory === catToDelete) {
      setActiveCategory('All Categories');
    }
  };

  const handleItemCreated = (newItem: MenuItem) => {
    setItems((prev) => [newItem, ...prev]);
    setLastCreatedItem(newItem);
    setIsAddItemOpen(false);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Top Header matching Figma */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-yellow-400 text-sm font-normal font-['Inter'] leading-6">
            Operations · Menu
          </span>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
              Menu Management
            </h1>
            <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
              Manage items, availability, pricing, and kitchen routing.
            </p>
          </div>
        </div>

        {/* Counts Pill & Add New Item Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-10 px-4 py-2 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex items-center gap-3 text-sm font-['Poppins']">
            <div>
              <span className="text-neutral-500">Total </span>
              <span className="text-white font-medium">{totalCount}</span>
            </div>
            <div>
              <span className="text-neutral-500">Available </span>
              <span className="text-white font-medium">{availableCount}</span>
            </div>
            <div>
              <span className="text-neutral-500">Disabled </span>
              <span className="text-white font-medium">{disabledCount}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddItemOpen(true)}
            className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 text-base font-medium font-['Inter'] rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 transition flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Search, Station/Status Filters, and Category Chips Card matching Figma */}
      <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
        {/* Row 1: Search & Dropdowns */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search staff / items input */}
          <div className="flex-1 h-9 relative bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 overflow-hidden flex items-center">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff or menu items..."
              className="w-full pl-9 pr-3 py-1.5 bg-transparent text-white placeholder-neutral-500 text-sm font-['Inter'] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Station Dropdown */}
            <div className="relative flex items-center gap-2">
              <span className="text-neutral-500 text-base font-semibold font-['Inter']">Station:</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowStationDropdown(!showStationDropdown);
                    setShowStatusDropdown(false);
                  }}
                  className="px-3 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center gap-2 hover:bg-neutral-800 transition"
                >
                  <span className="text-stone-300 text-sm font-medium font-['Inter']">
                    {stationFilter}
                  </span>
                  <ChevronDown className="w-4 h-4 text-stone-300" />
                </button>

                {showStationDropdown && (
                  <div className="absolute right-0 mt-1 w-40 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20 py-1 text-xs">
                    {stationOptions.map((stn) => (
                      <button
                        key={stn}
                        type="button"
                        onClick={() => {
                          setStationFilter(stn);
                          setShowStationDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-stone-200 hover:bg-neutral-800 hover:text-yellow-400 transition"
                      >
                        {stn}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="relative flex items-center gap-2">
              <span className="text-neutral-500 text-base font-semibold font-['Inter']">Status:</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowStationDropdown(false);
                  }}
                  className="px-3 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center gap-2 hover:bg-neutral-800 transition"
                >
                  <span className="text-stone-300 text-sm font-medium font-['Inter']">
                    {statusFilter}
                  </span>
                  <ChevronDown className="w-4 h-4 text-stone-300" />
                </button>

                {showStatusDropdown && (
                  <div className="absolute right-0 mt-1 w-36 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20 py-1 text-xs">
                    {statusOptions.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setStatusFilter(st);
                          setShowStatusDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-stone-200 hover:bg-neutral-800 hover:text-yellow-400 transition"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-neutral-800" />

        {/* Row 2: Category Filter Chips + Manage Categories Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {['All Categories', ...categories].map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium font-['Poppins'] transition outline outline-1 outline-offset-[-1px] ${
                    isActive
                      ? 'bg-yellow-400 text-neutral-900 outline-neutral-700 shadow-sm'
                      : 'bg-transparent text-white outline-neutral-700 hover:bg-neutral-800/60'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsManageCatOpen(true)}
            className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manage Categories</span>
          </button>
        </div>
      </div>

      {/* KDS Routing Note Banner matching Figma */}
      <div className="p-4 bg-gradient-to-r from-yellow-400/5 to-transparent rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-yellow-400/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400/60 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-sm font-['Inter'] leading-5">
            <span className="text-yellow-400 font-light">KDS routing note: </span>
            <span className="text-zinc-400 font-normal">
              Changing a preparation station updates where kitchen displays route incoming orders.
            </span>
          </div>
        </div>

        <div className="px-3 py-1.5 bg-yellow-400/10 rounded-md outline outline-1 outline-offset-[-1px] outline-yellow-400/60 flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
          <span className="text-yellow-400 text-sm font-medium font-['Inter']">
            Live POS sync
          </span>
        </div>
      </div>

      {/* Menu Items Grid matching Figma */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-3.5 hover:outline-neutral-700 hover:shadow-lg transition"
          >
            {/* Header: Category, Station Badge, Title & Price */}
            <div className="w-full flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="px-2 py-1.5 bg-stone-900 rounded-md outline outline-1 outline-offset-[-0.50px] outline-zinc-800 flex items-center">
                  <span className="text-white text-sm font-normal font-['Poppins']">
                    {item.category}
                  </span>
                </div>
                <div className={`px-2 py-1.5 rounded-md flex items-center ${item.stationBadgeColor}`}>
                  <span className="text-xs font-medium font-['Inter'] tracking-wide">
                    {item.stationBadge}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center gap-2">
                <span className="text-white text-lg font-medium font-['Poppins'] leading-5 truncate">
                  {item.name}
                </span>
                <span className="text-amber-400 text-base font-semibold font-['Inter'] leading-6 shrink-0">
                  {item.price}
                </span>
              </div>
            </div>

            <div className="w-full h-px bg-neutral-800" />

            {/* Description */}
            <p className="text-neutral-400 text-xs font-normal font-['Inter'] leading-4 line-clamp-2 min-h-[32px]">
              {item.description}
            </p>

            {/* Status & Availability Badges matching Figma */}
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-stone-950 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-1">
                <span className="text-neutral-500 text-xs font-normal font-['Poppins']">Status</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.status === 'Available' ? 'bg-green-500' : 'bg-red-400'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium font-['Inter'] ${
                      item.status === 'Available' ? 'text-green-500' : 'text-red-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="flex-1 px-3 py-2 bg-stone-950 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-1">
                <span className="text-neutral-500 text-xs font-normal font-['Poppins']">
                  Availability
                </span>
                <span
                  className={`text-xs font-medium font-['Inter'] ${
                    item.availability === 'In stock'
                      ? 'text-green-500'
                      : item.availability.includes('Low Stock')
                      ? 'text-orange-400'
                      : 'text-red-400'
                  }`}
                >
                  {item.availability}
                </span>
              </div>
            </div>

            <div className="w-full h-px bg-neutral-800" />

            {/* Modifiers Count */}
            <div className="w-full flex justify-between items-center text-sm font-normal font-['Inter'] text-neutral-400">
              <span>Modifiers</span>
              <span className="text-xs">{item.modifiersCount}</span>
            </div>

            <div className="w-full h-px bg-neutral-800" />

            {/* Toggle Switch and Edit Item Action */}
            <div className="w-full flex justify-between items-center pt-1">
              <div
                onClick={() => toggleItemEnabled(item.id)}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <div
                  className={`w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
                    item.enabled ? 'bg-yellow-400 justify-end' : 'bg-zinc-700 justify-start'
                  }`}
                >
                  <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                </div>
                <span className="text-neutral-400 text-xs font-normal font-['Inter']">
                  {item.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <button
                type="button"
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center gap-1.5 transition text-gray-200 text-sm font-medium font-['Inter'] cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Item</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Manage Categories Modal */}
      <ManageCategoriesModal
        isOpen={isManageCatOpen}
        onClose={() => setIsManageCatOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Add New Item Modal */}
      <AddNewItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onItemCreated={handleItemCreated}
        categories={categories}
      />

      {/* Item Created Confirmation Modal */}
      <ItemSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onCreateAnother={() => {
          setIsSuccessModalOpen(false);
          setIsAddItemOpen(true);
        }}
        itemData={{
          name: lastCreatedItem?.name,
          price: lastCreatedItem?.price,
          station: lastCreatedItem?.stationBadge,
          category: lastCreatedItem?.category,
        }}
      />
    </div>
  );
}
