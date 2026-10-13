'use client';

import React, { useState } from 'react';
import { X, Trash2, Edit2, Check, Loader2 } from 'lucide-react';
import { MenuCategoryItem } from '../../../redux/features/branchManagerApi';

export interface CategoryItemEntry {
  id?: string;
  name: string;
  itemCount?: number;
}

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<MenuCategoryItem | CategoryItemEntry | string>;
  onAddCategory: (categoryName: string) => Promise<void> | void;
  onDeleteCategory: (category: MenuCategoryItem | CategoryItemEntry | string) => Promise<void> | void;
  onUpdateCategory?: (category: MenuCategoryItem | CategoryItemEntry | string, newName: string) => Promise<void> | void;
}

export default function ManageCategoriesModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory,
}: ManageCategoriesModalProps) {
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || isAdding) return;
    setIsAdding(true);
    try {
      await onAddCategory(newCatName.trim());
      setNewCatName('');
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (key: string, currentName: string) => {
    setEditingKey(key);
    setEditCatName(currentName);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditCatName('');
  };

  const handleSaveEdit = async (cat: MenuCategoryItem | CategoryItemEntry | string) => {
    if (!editCatName.trim() || !onUpdateCategory || isSavingEdit) return;
    setIsSavingEdit(true);
    try {
      await onUpdateCategory(cat, editCatName.trim());
      setEditingKey(null);
      setEditCatName('');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (key: string, cat: MenuCategoryItem | CategoryItemEntry | string) => {
    if (deletingKey) return;
    setDeletingKey(key);
    try {
      await onDeleteCategory(cat);
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-white font-['Inter']">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium font-['Poppins'] text-white">
              Manage Categories
            </h3>
            <span className="text-neutral-400 text-xs font-normal font-['Poppins']">
              Create, rename, or remove branch menu categories
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

        {/* Add Category Input (POST /menus/categories) */}
        <form onSubmit={handleAdd} className="flex items-center gap-3.5">
          <div className="flex-1">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New category name (e.g. Burgers, Beverages, Desserts)..."
              className="w-full px-3.5 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 bg-neutral-950/60 text-stone-300 placeholder-zinc-500 text-sm focus:outline-yellow-400"
            />
          </div>

          <button
            type="submit"
            disabled={isAdding || !newCatName.trim()}
            className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-900 font-medium text-sm rounded-lg transition cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Adding...</span>
              </>
            ) : (
              <span>Add</span>
            )}
          </button>
        </form>

        {/* Category Items List with Edit & Trash Icons */}
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {categories
            .filter((cat) => {
              const name = typeof cat === 'string' ? cat : cat.name;
              return name !== 'All Categories';
            })
            .map((cat) => {
              const name = typeof cat === 'string' ? cat : cat.name;
              const id = typeof cat === 'string' ? cat : cat.id || cat.name;
              const isEditing = editingKey === id;
              const isDeleting = deletingKey === id;

              return (
                <div
                  key={id}
                  className="w-full px-3.5 py-2.5 bg-neutral-950/60 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center gap-2"
                >
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(cat);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-md bg-neutral-900 border border-neutral-700 text-stone-200 text-sm focus:outline-yellow-400"
                      />
                      <button
                        type="button"
                        disabled={isSavingEdit || !editCatName.trim()}
                        onClick={() => handleSaveEdit(cat)}
                        className="p-1.5 rounded-md bg-yellow-400 hover:bg-yellow-300 text-black transition cursor-pointer disabled:opacity-50"
                        title="Save Changes"
                      >
                        {isSavingEdit ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-stone-300 text-sm font-normal truncate">
                          {name}
                        </span>
                        {typeof cat !== 'string' && cat.itemCount !== undefined && (
                          <span className="text-[11px] text-neutral-500 font-mono">
                            ({cat.itemCount} items)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {onUpdateCategory && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(id, name)}
                            className="p-1.5 text-neutral-400 hover:text-yellow-400 hover:bg-neutral-900 rounded-md transition cursor-pointer"
                            title="Edit / Rename category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDelete(id, cat)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-neutral-900 rounded-md transition cursor-pointer disabled:opacity-50"
                          title="Delete category"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>

        {/* Done Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 font-semibold text-sm rounded-lg transition cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
