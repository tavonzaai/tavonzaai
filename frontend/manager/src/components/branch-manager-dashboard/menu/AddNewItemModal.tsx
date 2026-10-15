'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Plus, Trash2, Clock, PackageCheck } from 'lucide-react';
import { MenuItem } from '../types';

interface AddNewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (item: MenuItem) => void;
  categories: string[];
  initialItem?: MenuItem | null;
  isEdit?: boolean;
}

export default function AddNewItemModal({
  isOpen,
  onClose,
  onItemCreated,
  categories,
  initialItem,
  isEdit = false,
}: AddNewItemModalProps) {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<string>('Starters');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [station, setStation] = useState('Grill');
  const [itemEnabled, setItemEnabled] = useState(true);
  const [stockState, setStockState] = useState<'In Stock' | 'Low Stock' | 'Out of Stock'>('In Stock');
  const [estimatedPrepTime, setEstimatedPrepTime] = useState<number>(15);
  const [isStockTracked, setIsStockTracked] = useState<boolean>(false);
  const [stockQuantity, setStockQuantity] = useState<number>(50);
  const [modifierGroups, setModifierGroups] = useState<string[]>([]);
  const [showAddModifierInput, setShowAddModifierInput] = useState(false);
  const [newModifierName, setNewModifierName] = useState('');
  const [variants, setVariants] = useState<Array<{ id: string; name: string; size: string; price: string }>>([]);

  // Dropdown visibility states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showStockDropdown, setShowStockDropdown] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setItemName(initialItem.name);
      setCategory(initialItem.category);
      setPrice(initialItem.price);
      setDescription(initialItem.description);
      setImageUrl(initialItem.imageUrl || '');
      setStation(initialItem.stationBadge);
      setItemEnabled(initialItem.enabled);
      setEstimatedPrepTime(initialItem.estimatedPrepTime ?? 15);
      setIsStockTracked(Boolean(initialItem.isStockTracked));
      setStockQuantity(initialItem.stockQuantity ?? 50);
      setStockState(
        initialItem.availability === 'Out of stock'
          ? 'Out of Stock'
          : initialItem.availability.includes('Low Stock')
          ? 'Low Stock'
          : 'In Stock'
      );
    } else {
      setItemName('');
      const validCats = categories.filter((c) => c !== 'All Categories');
      setCategory(validCats[0] || 'Starters');
      setPrice('');
      setDescription('');
      setImageUrl('');
      setStation('Grill');
      setItemEnabled(true);
      setEstimatedPrepTime(15);
      setIsStockTracked(false);
      setStockQuantity(50);
      setStockState('In Stock');
    }
  }, [initialItem, isOpen, categories]);

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
    const cleanStock = Math.max(0, Number(stockQuantity) || 0);

    const newItem: MenuItem = {
      id: initialItem?.id || `item-${Date.now()}`,
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
      availability: !isStockTracked
        ? 'In stock'
        : cleanStock === 0
        ? 'Out of stock'
        : cleanStock <= 10
        ? `Low Stock (${cleanStock} Left)`
        : 'In stock',
      modifiersCount:
        modifierGroups.length > 0 ? `${modifierGroups.length} group(s)` : '0 group(s)',
      enabled: itemEnabled,
      estimatedPrepTime: Math.max(0, Number(estimatedPrepTime) || 0),
      stockQuantity: isStockTracked ? cleanStock : undefined,
      isStockTracked,
      imageUrl: imageUrl.trim() || initialItem?.imageUrl || undefined,
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
              {isEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <span className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
              {isEdit ? 'Update preparation time, stock, and pricing' : 'Manager Actions'}
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

              {/* Image URL */}
              <div className="flex flex-col gap-2">
                <label className="text-white text-xs font-normal font-['Inter'] leading-4">
                  Image URL (Optional)
                </label>
                <div className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex items-center">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-transparent text-white text-sm font-normal font-['Inter'] focus:outline-none"
                  />
                </div>
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
                KDS Routing & ETA
              </span>
            </div>

            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
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
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-white text-xs font-normal font-['Inter'] leading-4 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Est. Prep Time (mins) *</span>
                  </label>
                  <div className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex items-center justify-between">
                    <input
                      type="number"
                      min="0"
                      max="240"
                      required
                      value={estimatedPrepTime}
                      onChange={(e) => setEstimatedPrepTime(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="15"
                      className="w-full bg-transparent text-stone-300 text-sm font-normal font-['Inter'] focus:outline-none"
                    />
                    <span className="text-xs text-neutral-400 font-mono ml-2">min</span>
                  </div>
                </div>
              </div>

              <span className="text-zinc-500 text-xs font-normal font-['Inter'] leading-4">
                Station routes tickets to KDS; prep duration calculates kitchen schedules and customer ETA.
              </span>
            </div>
          </div>

          {/* Section 3: Status & Inventory Controls */}
          <div className="w-full flex flex-col gap-2">
            <span className="text-white text-base font-medium font-['Poppins'] leading-5">
              Status & Inventory Controls
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Item Status Toggle Box */}
              <div className="p-3 bg-stone-950 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-800 flex justify-between items-center">
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

              {/* Stock Tracking Toggle Box */}
              <div className="p-3 bg-stone-950 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-800 flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="text-white text-xs font-medium font-['Inter'] leading-4 flex items-center gap-1.5">
                    <PackageCheck className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Track Stock</span>
                  </span>
                  <span className="text-neutral-500 text-xs font-normal font-['Poppins'] leading-4">
                    {isStockTracked ? 'Inventory tracked' : 'Unlimited quantity'}
                  </span>
                </div>

                <div
                  onClick={() => setIsStockTracked(!isStockTracked)}
                  className="cursor-pointer select-none"
                >
                  <div
                    className={`w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
                      isStockTracked ? 'bg-yellow-400 justify-end' : 'bg-zinc-700 justify-start'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* If Stock Tracking Enabled: Show Stock Quantity Input */}
            {isStockTracked && (
              <div className="p-3.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-1.5 animate-in fade-in">
                <div className="flex justify-between items-center">
                  <label className="text-white text-xs font-normal font-['Inter'] leading-4">
                    Available Stock Quantity *
                  </label>
                  <span className="text-neutral-400 text-xs">
                    Current units in pantry
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="50"
                  className="w-full px-3.5 py-2 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-sm focus:outline-neutral-500"
                />
                <span className="text-[11px] text-neutral-500">
                  Customer ordering atomically deducts stock. Orders are blocked when stock reaches 0.
                </span>
              </div>
            )}
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

          {/* Section 5: VARIANTS matching Figma */}
          <div className="w-full flex flex-col gap-2.5">
            <span className="text-white text-base font-medium font-['Poppins'] leading-5">
              Variants
            </span>

            {variants.map((v, idx) => (
              <div key={v.id || idx} className="w-full flex items-center gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-white text-xs font-normal font-['Inter']">Name</label>
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVariants((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                      );
                    }}
                    placeholder="e.g. Pizza / Regular"
                    className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm focus:outline-yellow-400"
                  />
                </div>

                <div className="w-32 flex flex-col gap-1.5">
                  <label className="text-white text-xs font-normal font-['Inter']">Size</label>
                  <input
                    type="text"
                    value={v.size}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVariants((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, size: val } : item))
                      );
                    }}
                    placeholder="12 inch"
                    className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm focus:outline-yellow-400"
                  />
                </div>

                <div className="w-32 flex flex-col gap-1.5">
                  <label className="text-white text-xs font-normal font-['Inter']">Price</label>
                  <input
                    type="text"
                    value={v.price}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVariants((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                      );
                    }}
                    placeholder="$ 15"
                    className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm focus:outline-yellow-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setVariants((prev) => prev.filter((_, i) => i !== idx))}
                  className="mt-5 p-2 text-neutral-400 hover:text-red-400 transition"
                  title="Remove variant"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setVariants((prev) => [
                  ...prev,
                  { id: `var-${Date.now()}`, name: '', size: '12 inch', price: '$ 10' },
                ])
              }
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center gap-1.5 text-white text-sm font-medium font-['Inter'] transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-orange-50" />
              <span>Add New Variant</span>
            </button>
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
              {isEdit ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
