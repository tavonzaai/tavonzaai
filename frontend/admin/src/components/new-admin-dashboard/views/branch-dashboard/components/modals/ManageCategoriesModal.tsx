'use client';

import React, { useState } from 'react';
import { X, Trash2, Edit2, Check, Loader2, Plus, Layers } from 'lucide-react';
import { CategoryItem } from '../../types';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  branchName: string;
  categories: CategoryItem[];
  onClose: () => void;
  onAddCategory: (categoryName: string) => Promise<void> | void;
  onUpdateCategory: (id: string, newName: string) => Promise<void> | void;
  onDeleteCategory: (id: string) => Promise<void> | void;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  branchName,
  categories,
  onClose,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed || isAdding) return;
    setIsAdding(true);
    try {
      await onAddCategory(trimmed);
      setNewCatName('');
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setEditCatName(cat.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCatName('');
  };

  const handleSaveEdit = async (cat: CategoryItem) => {
    const trimmed = editCatName.trim();
    if (!trimmed || isSavingEdit) return;
    setIsSavingEdit(true);
    try {
      await onUpdateCategory(cat.id, trimmed);
      setEditingId(null);
      setEditCatName('');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    if (deletingId) return;
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }
    setDeletingId(cat.id);
    try {
      await onDeleteCategory(cat.id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-white font-['Inter']">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-yellow-400" />
              <h3 className="text-lg font-semibold font-['Poppins'] text-white">
                Manage Categories
              </h3>
            </div>
            <p className="text-neutral-400 text-xs">
              Configure menu categories for {branchName}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full h-px bg-neutral-800" />

        {/* Create Category Form */}
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="New category name (e.g. Burgers, Starters, Drinks)..."
            className="flex-1 h-10 px-3.5 bg-neutral-950/70 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-yellow-400"
          />
          <button
            type="submit"
            disabled={isAdding || !newCatName.trim()}
            className="h-10 px-4 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-900 font-medium text-sm rounded-lg transition cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add</span>
              </>
            )}
          </button>
        </form>

        {/* Existing Categories List */}
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {categories.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-sm">
              No categories created yet. Enter a name above to add one.
            </div>
          ) : (
            categories.map((cat) => {
              const isEditing = editingId === cat.id;
              const isDeleting = deletingId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="w-full px-3.5 py-2.5 bg-neutral-950/60 rounded-lg border border-neutral-800 flex justify-between items-center gap-2"
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
                        className="flex-1 px-2.5 py-1.5 rounded-md bg-neutral-900 border border-neutral-700 text-stone-200 text-sm focus:outline-none focus:border-yellow-400"
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
                        <span className="text-stone-200 text-sm font-medium truncate">
                          {cat.name}
                        </span>
                        {cat.itemCount !== undefined && (
                          <span className="text-[11px] text-neutral-500 font-mono">
                            ({cat.itemCount} {cat.itemCount === 1 ? 'item' : 'items'})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 text-neutral-400 hover:text-yellow-400 hover:bg-neutral-850 rounded-md transition cursor-pointer"
                          title="Rename category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-neutral-850 rounded-md transition cursor-pointer disabled:opacity-50"
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
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 font-medium text-sm rounded-lg transition cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
