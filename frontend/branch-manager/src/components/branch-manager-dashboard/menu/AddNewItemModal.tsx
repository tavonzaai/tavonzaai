'use client';

import React, { useState } from 'react';
import { X, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { MenuItem } from '../types';

interface AddNewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (item: MenuItem) => void;
  categories: string[];
}

export default function AddNewItemModal({
  isOpen,
  onClose,
  onItemCreated,
  categories,
}: AddNewItemModalProps) {
  const [itemName, setItemName] = useState('Grilled Chicken');
  const [category, setCategory] = useState<string>('Starters');
  const [price, setPrice] = useState('$ 10');
  const [description, setDescription] = useState('');
  const [station, setStation] = useState('Grill');
  const [itemEnabled, setItemEnabled] = useState(true);
  const [stockState, setStockState] = useState<'In Stock' | 'Low Stock' | 'Out of Stock'>('In Stock');
  const [modifierGroups, setModifierGroups] = useState<string[]>([]);
  const [showAddModifierInput, setShowAddModifierInput] = useState(false);
  const [newModifierName, setNewModifierName] = useState('');

  // Dropdown visibility states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showStockDropdown, setShowStockDropdown] = useState(false);

  if (!isOpen) return null;

  const stationOptions = ['Grill', 'Oven', 'Fryer', 'Bar', 'Dessert Prep'];
  const stockOptions: ('In Stock' | 'Low Stock' | 'Out of Stock')[] = ['In Stock', 'Low Stock', 'Out of Stock'];

  const handleAddModifier = () => {
    if (newModifierName.trim()) {
      setModifierGroups((prev) => [...prev, newModifierName.trim()]);
      setNewModifierName('');
      setShowAddModifierInput(false);
    }
  };

  const handleRemoveModifier = (index: number) => {
    setModifierGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const formattedPrice = price.trim().startsWith('$') ? price.trim() : `$ ${price.trim()}`;

    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: itemName.trim(),
      category: category as any,
      stationBadge: station,
      stationBadgeColor:
        station === 'Grill'
          ? 'bg-pink-400/10 text-pink-400'
          : station === 'Oven'
          ? 'bg-fuchsia-500/10 text-fuchsia-400'
          : station === 'Bar'
          ? 'bg-blue-400/10 text-blue-400'
          : 'bg-yellow-400/10 text-yellow-400',
      price: formattedPrice,
      description:
        description.trim() ||
        'Flame-grilled marinated specialty served with signature garnishes and rosemary potatoes.',
      status: itemEnabled ? 'Available' : 'Disabled',
      availability:
        stockState === 'In Stock'
          ? 'In stock'
          : stockState === 'Low Stock'
          ? 'Low Stock (8 Left)'
          : 'Out of stock',
      modifiersCount:
        modifierGroups.length > 0 ? `${modifierGroups.length} group(s)` : '0 group(s)',
      enabled: itemEnabled,
    };

    onItemCreated(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-[560px] my-8 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 p-4 flex flex-col gap-4 text-white font-['Inter'] shadow-2xl">
        {/* Header matching Figma */}
        <div className="w-full flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h2 className="text-white text-lg font-medium font-['Poppins'] leading-5">
              Add New Menu Item
            </h2>
            <span className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
              Manager Actions
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 px-2.5 py-2 bg-gray-300/10 hover:bg-neutral-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full h-px bg-neutral-800" />

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Section 1: Basic Details */}
          <div className="w-full flex flex-col gap-2">
            <span className="text-white text-base font-medium font-['Poppins'] leading-5">
              Basic Details
            </span>

            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
              {/* Item Name */}
              <div className="flex flex-col gap-2">
                <label className="text-white text-xs font-normal font-['Inter'] leading-4">
                  Item Name *
                </label>
                <div className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex items-center">
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Grilled Chicken"
                    className="w-full bg-transparent text-white text-sm font-normal font-['Inter'] focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & Price Row */}
              <div className="flex gap-3">
                {/* Category Dropdown */}
                <div className="flex-1 flex flex-col gap-2 relative">
                  <label className="text-white text-xs font-normal font-['Inter'] leading-4">
                    Category*
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryDropdown(!showCategoryDropdown);
                      setShowStationDropdown(false);
                      setShowStockDropdown(false);
                    }}
                    className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center text-stone-300 text-sm font-normal font-['Inter'] hover:bg-neutral-800 transition"
                  >
                    <span>{category}</span>
                    <ChevronDown className="w-4 h-4 text-stone-300" />
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-30 py-1 text-xs font-['Inter']">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategory(cat);
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-stone-200 hover:bg-neutral-800 hover:text-yellow-400 transition"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Input */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-white text-xs font-normal font-['Inter'] leading-4">
                    Price ($ USD) *
                  </label>
                  <div className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex items-center">
                    <input
                      type="text"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="$ 10"
                      className="w-full bg-transparent text-stone-300 text-sm font-normal font-['Inter'] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Description Textarea */}
              <div className="flex flex-col gap-2">
                <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredients, prep style, allergens..."
                  className="w-full px-3.5 py-2.5 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-sm font-normal font-['Inter'] placeholder-neutral-500 focus:outline-none focus:outline-neutral-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: PREPARATION & KDS STATION */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-white text-base font-medium font-['Poppins'] leading-5 uppercase tracking-wide">
                PREPARATION & KDS STATION
              </span>
              <span className="text-yellow-400 text-sm font-normal font-['Inter'] leading-4">
                KDS Routing Rule
              </span>
            </div>

            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-2">
              <label className="text-white text-xs font-normal font-['Inter'] leading-4">
                Preparation Station *
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowStationDropdown(!showStationDropdown);
                    setShowCategoryDropdown(false);
                    setShowStockDropdown(false);
                  }}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center text-stone-300 text-sm font-normal font-['Inter'] hover:bg-neutral-800 transition"
                >
                  <span>{station}</span>
                  <ChevronDown className="w-4 h-4 text-stone-300" />
                </button>

                {showStationDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-30 py-1 text-xs font-['Inter']">
                    {stationOptions.map((stn) => (
                      <button
                        key={stn}
                        type="button"
                        onClick={() => {
                          setStation(stn);
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

              <span className="text-zinc-600 text-xs font-normal font-['Inter'] leading-4">
                Selected station determines kitchen display screen routing.
              </span>
            </div>
          </div>

          {/* Section 3: Status & Availability Controls */}
          <div className="w-full flex flex-col gap-2">
            <span className="text-white text-base font-medium font-['Poppins'] leading-5">
              Status & Availability Controls
            </span>

            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex gap-3">
              {/* Item Status Toggle Box */}
              <div className="flex-1 p-3 bg-stone-950 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-800 flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="text-white text-xs font-medium font-['Inter'] leading-4">
                    Item Status
                  </span>
                  <span className="text-neutral-500 text-xs font-normal font-['Poppins'] leading-4">
                    Visible on ordering POS
                  </span>
                </div>

                <div
                  onClick={() => setItemEnabled(!itemEnabled)}
                  className="cursor-pointer select-none"
                >
                  <div
                    className={`w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
                      itemEnabled ? 'bg-yellow-400 justify-end' : 'bg-zinc-700 justify-start'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Stock State Dropdown Box */}
              <div className="flex-1 flex flex-col gap-1.5 relative">
                <label className="text-white text-xs font-normal font-['Inter'] leading-4">
                  Inventory / Stock State
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowStockDropdown(!showStockDropdown);
                    setShowCategoryDropdown(false);
                    setShowStationDropdown(false);
                  }}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center text-stone-300 text-sm font-normal font-['Inter'] hover:bg-neutral-800 transition"
                >
                  <span>{stockState}</span>
                  <ChevronDown className="w-4 h-4 text-stone-300" />
                </button>

                {showStockDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-30 py-1 text-xs font-['Inter']">
                    {stockOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setStockState(opt);
                          setShowStockDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-stone-200 hover:bg-neutral-800 hover:text-yellow-400 transition"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: MODIFIERS & ADD-ONS */}
          <div className="w-full flex flex-col gap-2">
            <span className="text-white text-base font-medium font-['Poppins'] leading-5 uppercase tracking-wide">
              MODIFIERS & ADD-ONS
            </span>

            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-center items-center gap-3">
              {modifierGroups.length === 0 ? (
                <span className="text-neutral-500 text-xs font-normal font-['Poppins'] leading-4">
                  No modifiers attached to this item.
                </span>
              ) : (
                <div className="w-full flex flex-wrap gap-2">
                  {modifierGroups.map((mod, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 bg-neutral-800 rounded-lg border border-neutral-700 flex items-center gap-1.5 text-xs text-stone-200"
                    >
                      <span>{mod}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveModifier(idx)}
                        className="text-neutral-400 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showAddModifierInput ? (
                <div className="flex items-center gap-2 w-full max-w-xs">
                  <input
                    type="text"
                    value={newModifierName}
                    onChange={(e) => setNewModifierName(e.target.value)}
                    placeholder="e.g. Extra Sauce, Medium Rare"
                    className="flex-1 px-2.5 py-1 bg-neutral-950 border border-neutral-700 rounded-md text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddModifier}
                    className="px-3 py-1 bg-yellow-400 text-neutral-900 rounded-md text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddModifierInput(true)}
                  className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 inline-flex items-center gap-1.5 cursor-pointer transition text-zinc-800 text-xs font-medium font-['Inter']"
                >
                  <Plus className="w-3 h-3 text-zinc-800" />
                  <span>Add Modifier Group</span>
                </button>
              )}
            </div>
          </div>

          {/* Footer Actions matching Figma */}
          <div className="w-full flex justify-end items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-['Inter'] leading-5 transition cursor-pointer shadow-md active:scale-95"
            >
              Create Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
