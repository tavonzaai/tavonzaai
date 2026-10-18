'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { FolderPlus, Loader2, Pencil, RefreshCw, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  MenuCategoryItem,
  branchManagerService,
  getActiveBranchId,
} from '../../../redux/features/branchManagerApi';

/**
 * First-class Menu Categories module for branch managers.
 * Uses POST/PATCH/DELETE /menus/categories and GET /menus/:branchId/categories.
 */
export default function MenuCategoriesView() {
  const [categories, setCategories] = useState<MenuCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const branchId = getActiveBranchId();
      const rows = await branchManagerService.getCategories(branchId);
      setCategories(Array.isArray(rows) ? rows : []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load menu categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const created = await branchManagerService.createCategory({ name });
      setCategories((prev) => [...prev, created]);
      setNewName('');
      toast.success(`Category "${name}" created`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    const name = editName.trim();
    if (!name || savingId) return;
    setSavingId(id);
    try {
      const updated = await branchManagerService.updateCategory(id, { name });
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: updated?.name || name } : c)),
      );
      setEditingId(null);
      setEditName('');
      toast.success('Category renamed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to rename category');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await branchManagerService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Category "${name}" removed`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="flex-1 p-6 lg:p-8 space-y-6 max-w-3xl animate-in fade-in duration-200"
      data-testid="menu-categories-view"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl font-semibold font-['Inter'] tracking-tight">
            Menu Categories
          </h1>
          <p className="text-neutral-400 text-sm mt-1 font-['Inter']">
            Create and manage categories used when adding menu items for this branch.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadCategories()}
          className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-sm flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex flex-col sm:flex-row gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl"
      >
        <div className="flex-1 flex items-center gap-2">
          <FolderPlus className="w-4 h-4 text-amber-400 shrink-0" />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name (e.g. Burgers, Beverages)"
            className="w-full bg-transparent text-white placeholder:text-neutral-500 text-sm outline-none"
            data-testid="menu-category-name-input"
          />
        </div>
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-900 font-medium text-sm rounded-lg flex items-center justify-center gap-2"
          data-testid="menu-category-create-btn"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Create Category
        </button>
      </form>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-neutral-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 text-sm">
            No categories yet. Create one above before adding menu items.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;
              const isSaving = savingId === cat.id;
              const isDeleting = deletingId === cat.id;
              return (
                <li
                  key={cat.id}
                  className="px-4 py-3 flex items-center justify-between gap-3"
                  data-testid={`menu-category-row-${cat.id}`}
                >
                  {isEditing ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white text-sm"
                      autoFocus
                    />
                  ) : (
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{cat.name}</p>
                      {cat.description ? (
                        <p className="text-neutral-500 text-xs truncate">{cat.description}</p>
                      ) : null}
                    </div>
                  )}

                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cat.id)}
                          disabled={isSaving || !editName.trim()}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditName('');
                          }}
                          className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditName(cat.name);
                          }}
                          className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white"
                          aria-label={`Rename ${cat.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={isDeleting}
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                          aria-label={`Delete ${cat.name}`}
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
