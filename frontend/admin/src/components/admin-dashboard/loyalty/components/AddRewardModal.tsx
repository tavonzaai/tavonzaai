'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { LoyaltyReward } from '../types';

export interface AddRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReward: (reward: Omit<LoyaltyReward, 'id' | 'claimedCount'>) => void;
}

export default function AddRewardModal({
  isOpen,
  onClose,
  onAddReward,
}: AddRewardModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🍰');
  const [pointsCost, setPointsCost] = useState('200');
  const [category, setCategory] = useState('Dessert');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const emojiOptions = ['🍰', '🏷️', '☕', '🍟', '🥂', '🍽️', '🍔', '🍕', '🍸', '🎁'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddReward({
      name: name.trim(),
      icon,
      pointsCost: Number(pointsCost) || 200,
      category,
      description: description.trim() || 'Exclusive loyalty program reward.',
    });

    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-[440px] bg-[#141416] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col font-['Inter'] animate-in zoom-in-95 duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-white text-lg font-bold font-['Plus_Jakarta_Sans']">
            Create New Reward
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {/* Icon Selector */}
          <div className="space-y-1.5">
            <label className="text-white text-sm font-medium">Reward Icon</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {emojiOptions.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={`size-9 rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                    icon === em
                      ? 'bg-amber-950/60 border-amber-500 scale-110 shadow-sm'
                      : 'bg-zinc-800/80 border-zinc-700/60 hover:bg-zinc-700'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Reward Name */}
          <div className="space-y-1.5">
            <label className="text-white text-sm font-medium">Reward Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Free House Cocktail"
              className="w-full h-10 px-3.5 bg-zinc-800/90 rounded-xl border border-zinc-700/70 text-stone-200 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-500"
              required
            />
          </div>

          {/* Points Cost & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-white text-sm font-medium">Points Cost</label>
              <input
                type="number"
                value={pointsCost}
                onChange={(e) => setPointsCost(e.target.value)}
                placeholder="200"
                className="w-full h-10 px-3.5 bg-zinc-800/90 rounded-xl border border-zinc-700/70 text-stone-200 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-white text-sm font-medium">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Beverage, Food..."
                className="w-full h-10 px-3.5 bg-zinc-800/90 rounded-xl border border-zinc-700/70 text-stone-200 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-white text-sm font-medium">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details on what the customer receives..."
              className="w-full p-3 bg-zinc-800/80 rounded-xl border border-zinc-700/70 text-stone-200 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none placeholder-zinc-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-zinc-700/80 bg-zinc-900/60 text-slate-400 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 bg-[#f59e0b] hover:bg-amber-400 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Reward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
