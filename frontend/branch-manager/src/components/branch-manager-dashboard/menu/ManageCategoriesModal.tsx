'use client';

import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
}

export default function ManageCategoriesModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}: ManageCategoriesModalProps) {
  const [newCatName, setNewCatName] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-white font-['Inter']">
        {/* Header matching Figma */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium font-['Poppins'] text-white">
              Manage Categories
            </h3>
            <span className="text-neutral-400 text-xs font-normal font-['Poppins']">
              Manager Actions
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-gray-300/10 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center text-gray-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full h-px bg-neutral-800" />

        {/* Add Category Input */}
        <form onSubmit={handleAdd} className="flex items-center gap-3.5">
          <div className="flex-1">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New category name..."
              className="w-full px-3.5 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 bg-transparent text-stone-300 placeholder-zinc-500 text-sm focus:outline-neutral-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 font-medium text-base rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 transition cursor-pointer shrink-0"
          >
            Add
          </button>
        </form>

        {/* Category Items List with Trash Icons */}
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div
              key={cat}
              className="w-full px-3.5 py-3 bg-neutral-950/60 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center"
            >
              <span className="text-stone-300 text-base font-normal font-['Inter']">
                {cat}
              </span>
              <button
                type="button"
                onClick={() => onDeleteCategory(cat)}
                className="text-red-400 hover:text-red-300 p-1 transition cursor-pointer"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Done Button matching Figma */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 font-medium text-base rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
