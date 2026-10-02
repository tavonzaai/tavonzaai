'use client';

import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { InventoryCategory, InventoryItem, StockStatus } from '../types';
import { toast } from 'sonner';

export interface AddInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: InventoryItem) => void;
}

export default function AddInventoryItemModal({
  isOpen,
  onClose,
  onAddItem,
}: AddInventoryItemModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('Dairy');
  const [unit, setUnit] = useState('kg');
  const [currentStock, setCurrentStock] = useState('10');
  const [minStock, setMinStock] = useState('5');
  const [maxStock, setMaxStock] = useState('30');
  const [supplier, setSupplier] = useState('FreshDairy Co.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    const current = parseFloat(currentStock) || 0;
    const min = parseFloat(minStock) || 1;
    const max = parseFloat(maxStock) || 10;
    const levelPercent = Math.min(Math.round((current / max) * 100), 100);

    let status: StockStatus = 'In Stock';
    if (current === 0) {
      status = 'Out of Stock';
    } else if (current < min / 2) {
      status = 'Critical';
    } else if (current <= min) {
      status = 'Low Stock';
    }

    const newItem: InventoryItem = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      category,
      unit,
      currentStock: current,
      minStock: min,
      maxStock: max,
      levelPercent,
      supplier: supplier.trim() || 'FreshDairy Co.',
      lastUpdated: 'Just now',
      status,
    };

    onAddItem(newItem);
    toast.success(`"${newItem.name}" added to inventory!`);

    // Reset and close
    setName('');
    setCategory('Dairy');
    setCurrentStock('10');
    setMinStock('5');
    setMaxStock('30');
    setSupplier('FreshDairy Co.');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-5 text-white animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight font-['Inter']">
              Add Inventory Item
            </h3>
            <p className="text-sm text-zinc-400 font-normal font-['Inter'] mt-1">
              Enter details to track stock levels in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Ingredient / Item Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mozzarella Cheese, Angus Beef"
              className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white placeholder:text-zinc-600 focus:outline-none transition font-['Inter']"
              autoFocus
            />
          </div>

          {/* Row: Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                  className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-sm text-white appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="Dairy">Dairy</option>
                  <option value="Protein">Protein</option>
                  <option value="Produce">Produce</option>
                  <option value="Dry Goods">Dry Goods</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Condiments">Condiments</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-4 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Unit of Measure
              </label>
              <div className="relative">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-sm text-white appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="kg">kg (Kilograms)</option>
                  <option value="L">L (Liters)</option>
                  <option value="pcs">pcs (Pieces)</option>
                  <option value="heads">heads (Heads)</option>
                  <option value="btl">btl (Bottles)</option>
                  <option value="doz">doz (Dozens)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row: Current Stock, Min, Max */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Current Stock
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white focus:outline-none font-['Inter']"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Min Threshold
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white focus:outline-none font-['Inter']"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Max Capacity
              </label>
              <input
                type="number"
                step="any"
                min="1"
                value={maxStock}
                onChange={(e) => setMaxStock(e.target.value)}
                className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white focus:outline-none font-['Inter']"
              />
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Supplier
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. FreshDairy Co."
              className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white placeholder:text-zinc-600 focus:outline-none font-['Inter']"
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold text-zinc-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-3 bg-yellow-500 hover:bg-yellow-400 rounded-xl text-sm font-bold text-white shadow-lg shadow-yellow-500/20 transition cursor-pointer"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
