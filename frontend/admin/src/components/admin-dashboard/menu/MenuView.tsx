'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MenuHeader,
  MenuFilterBar,
  MenuItemCard,
  AddMenuItemModal,
  EditMenuItemModal,
} from './components';
import { mapBackendToMenuItem } from './menuData';
import { MenuItem, MenuCategory } from './types';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
  MenuItemQuery,
} from '@/redux/features/menu-items/menuItemApi';
import { fetchMenuCategories } from '@/redux/features/menu-category/menuCategoryApi';
import { Plus } from 'lucide-react';

export interface MenuViewProps {
  globalSearchQuery?: string;
  onGlobalSearchChange?: (query: string) => void;
}

export default function MenuView({
  globalSearchQuery,
  onGlobalSearchChange,
}: MenuViewProps = {}) {
  const dispatch = useAppDispatch();
  const { items: apiItems, loading: apiLoading, actionLoading } = useAppSelector(
    (state) => state.menuItems
  );
  const { categories: apiCategories, loading: categoriesLoading } = useAppSelector(
    (state) => state.menuCategories
  );
  const user = useAppSelector((state) => state.auth.user);

  // 1. Initialize Route Query State from URL (?search=... &category=...)
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (globalSearchQuery !== undefined) return globalSearchQuery;
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('search') || sp.get('q') || '';
    }
    return '';
  });

  const [activeCategory, setActiveCategory] = useState<MenuCategory>(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const cat = sp.get('category');
      if (cat) return cat;
    }
    return 'All';
  });

  // Pure dynamic state from backend API only (no static fallback data)
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [hasLoadedFromApi, setHasLoadedFromApi] = useState(false);

  // Helper to keep browser URL route query in sync without page reloads
  const updateUrlQueryParams = useCallback(
    (newSearch: string, newCat?: string) => {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);

      // Keep tab=menu present in route
      if (!url.searchParams.get('tab')) {
        url.searchParams.set('tab', 'menu');
      }

      // Set or clear 'search' param in URL
      if (newSearch && newSearch.trim()) {
        url.searchParams.set('search', newSearch.trim());
      } else {
        url.searchParams.delete('search');
        url.searchParams.delete('q');
      }

      // Set or clear 'category' param in URL
      const catToSet = newCat !== undefined ? newCat : activeCategory;
      if (catToSet && catToSet !== 'All') {
        url.searchParams.set('category', catToSet);
      } else {
        url.searchParams.delete('category');
      }

      window.history.replaceState({}, '', url.toString());
    },
    [activeCategory]
  );

  // Synchronize on browser Back / Forward buttons (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      const q = sp.get('search') || sp.get('q') || '';
      const c = sp.get('category') || 'All';
      setSearchQuery(q);
      setActiveCategory(c);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync when parent changes globalSearchQuery
  useEffect(() => {
    if (globalSearchQuery !== undefined && globalSearchQuery !== searchQuery) {
      setSearchQuery(globalSearchQuery);
      updateUrlQueryParams(globalSearchQuery, activeCategory);
    }
  }, [globalSearchQuery, activeCategory, searchQuery, updateUrlQueryParams]);

  // Fetch Categories on mount
  useEffect(() => {
    dispatch(fetchMenuCategories({ limit: 100 }));
  }, [dispatch]);

  // Resolve matching category ID from backend categories
  const getSelectedCategoryId = useCallback(
    (categoryName: string): string | undefined => {
      if (!categoryName || categoryName === 'All') return undefined;
      if (apiCategories && apiCategories.length > 0) {
        const found = apiCategories.find(
          (c) => c.name.toLowerCase() === categoryName.toLowerCase()
        );
        if (found) return found.id;
      }
      return undefined;
    },
    [apiCategories]
  );

  // 2. Debounced API Call that hits GET /menu-items with searchTerm & categoryId
  useEffect(() => {
    const timer = setTimeout(() => {
      const categoryId = getSelectedCategoryId(activeCategory);
      const queryPayload: MenuItemQuery = {
        limit: 100,
        searchTerm: searchQuery.trim() || undefined,
        categoryId: categoryId || undefined,
      };

      console.log('📡 [Menu Items API] Hitting backend GET /menu-items with query:', queryPayload);
      dispatch(fetchMenuItems(queryPayload));
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, getSelectedCategoryId, dispatch]);

  // 3. Synchronize Redux API Items with Local Display State
  useEffect(() => {
    if (apiItems) {
      const mapped = apiItems.map((bi) => mapBackendToMenuItem(bi));
      setItems(mapped);
      setHasLoadedFromApi(true);
    }
  }, [apiItems]);

  // Handle Search Input Change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateUrlQueryParams(query, activeCategory);
    if (onGlobalSearchChange) {
      onGlobalSearchChange(query);
    }
  };

  // Handle Category Tab Selection
  const handleSelectCategory = (cat: MenuCategory) => {
    setActiveCategory(cat);
    updateUrlQueryParams(searchQuery, cat);
  };

  // 4. Dynamic Category List for Tabs (Derived strictly from API categories)
  const categoriesList = useMemo(() => {
    const list: string[] = ['All'];
    if (apiCategories && apiCategories.length > 0) {
      apiCategories.forEach((cat) => {
        if (cat.name && !list.includes(cat.name)) {
          list.push(cat.name);
        }
      });
    }
    return list;
  }, [apiCategories]);

  // 5. Formatted Category Options for Modals
  const categoryOptions = useMemo(() => {
    if (apiCategories && apiCategories.length > 0) {
      return apiCategories.map((c) => ({
        id: c.id,
        name: c.name,
        restaurantId: c.restaurantId,
      }));
    }
    return [];
  }, [apiCategories]);

  // Dynamic Restaurant ID
  const defaultRestaurantId = useMemo(() => {
    return (
      apiCategories?.[0]?.restaurantId ||
      apiItems?.[0]?.restaurantId ||
      user?.assignments?.[0]?.branch?.restaurant?.id ||
      ''
    );
  }, [apiCategories, apiItems, user]);

  // 6. Filter Items based on Active Category & Search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.categoryLabel && item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        activeCategory === 'All' ||
        item.category.toLowerCase() === activeCategory.toLowerCase() ||
        (item.categoryLabel && item.categoryLabel.toLowerCase() === activeCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [items, activeCategory, searchQuery]);

  // 7. Action Handlers (All operations hit backend APIs directly)

  // Toggle active / hidden status
  const handleToggleActive = async (targetItem: MenuItem) => {
    const nextActive = !targetItem.isActive;

    // Optimistic local update
    setItems((prev) =>
      prev.map((item) =>
        item.id === targetItem.id ? { ...item, isActive: nextActive } : item
      )
    );

    try {
      await dispatch(
        toggleMenuItemAvailability({
          id: targetItem.id,
          isAvailable: nextActive,
        })
      ).unwrap();

      toast.success(
        nextActive
          ? `"${targetItem.name}" is now active and visible to guests.`
          : `"${targetItem.name}" is now hidden from customer menu.`
      );
    } catch (err: any) {
      // Revert if API fails
      setItems((prev) =>
        prev.map((item) =>
          item.id === targetItem.id ? { ...item, isActive: targetItem.isActive } : item
        )
      );
      toast.error(err || 'Failed to update item availability on server.');
    }
  };

  // Add new item via API
  const handleAddItem = async (newItemData: {
    name: string;
    categoryId?: string;
    restaurantId?: string;
    categoryName: string;
    basePrice: number;
    costPrice?: number;
    description?: string;
    imageUrl?: string;
    isVegetarian?: boolean;
  }) => {
    const resolvedRestId =
      newItemData.restaurantId || defaultRestaurantId;
    const resolvedCatId =
      newItemData.categoryId || apiCategories?.[0]?.id;

    if (!resolvedRestId) {
      toast.error('Restaurant ID not found. Please ensure a category is selected.');
      throw new Error('Restaurant ID missing');
    }

    try {
      const createdItem = await dispatch(
        createMenuItem({
          restaurantId: resolvedRestId,
          categoryId: resolvedCatId || '',
          name: newItemData.name,
          basePrice: newItemData.basePrice,
          description: newItemData.description,
          imageUrl: newItemData.imageUrl,
          isAvailable: true,
          isVegetarian: newItemData.isVegetarian || false,
        })
      ).unwrap();

      if (createdItem) {
        const mapped = mapBackendToMenuItem(createdItem);
        setItems((prev) => [mapped, ...prev.filter((i) => i.id !== mapped.id)]);
      }
      toast.success(`"${newItemData.name}" created and saved to database!`);
    } catch (err: any) {
      toast.error(err || 'Failed to create item on server.');
      throw err;
    }
  };

  // Update item via API
  const handleUpdateItem = async (updatedData: {
    id: string;
    name: string;
    categoryId?: string;
    categoryName: string;
    basePrice: number;
    costPrice?: number;
    description?: string;
    isAvailable?: boolean;
    isVegetarian?: boolean;
    imageUrl?: string;
  }) => {
    try {
      const updated = await dispatch(
        updateMenuItem({
          id: updatedData.id,
          data: {
            name: updatedData.name,
            categoryId: updatedData.categoryId,
            basePrice: updatedData.basePrice,
            description: updatedData.description,
            isAvailable: updatedData.isAvailable,
            isVegetarian: updatedData.isVegetarian,
            imageUrl: updatedData.imageUrl,
          },
        })
      ).unwrap();

      if (updated) {
        const mapped = mapBackendToMenuItem(updated);
        setItems((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)));
        toast.success(`"${updatedData.name}" updated successfully in database!`);
      }
    } catch (err: any) {
      toast.error(err || 'Failed to update menu item on server.');
      throw err;
    }
  };

  // Delete item via API
  const handleDeleteItem = async (targetItem: MenuItem) => {
    if (confirm(`Are you sure you want to permanently delete "${targetItem.name}"?`)) {
      try {
        await dispatch(deleteMenuItem(targetItem.id)).unwrap();
        setItems((prev) => prev.filter((item) => item.id !== targetItem.id));
        toast.success(`Deleted "${targetItem.name}" from database.`);
      } catch (err: any) {
        toast.error(err || 'Failed to delete item from server.');
      }
    }
  };

  // Manual Sync with Server
  const handleRefresh = async () => {
    try {
      await Promise.all([
        dispatch(fetchMenuItems({ limit: 100 })).unwrap(),
        dispatch(fetchMenuCategories({ limit: 100 })).unwrap(),
      ]);
      toast.success('Menu synced with database!');
    } catch (err: any) {
      toast.error('Sync failed: ' + (err || 'Server unreachable'));
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Dynamic Header with Database Stats & Sync CTA */}
      <MenuHeader
        items={items}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={apiLoading || categoriesLoading}
      />

      {/* 2. Filter Bar & Search */}
      <MenuFilterBar
        categories={categoriesList}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        isSearching={apiLoading}
      />

      {/* Live API Search Feedback Banner */}
      {searchQuery && (
        <div className="flex items-center justify-between text-xs text-zinc-400 bg-white/5 border border-white/10 px-3.5 py-2 rounded-lg animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Live API Search for &ldquo;<span className="text-amber-400 font-semibold">{searchQuery}</span>&rdquo;
              {activeCategory !== 'All' ? ` in category "${activeCategory}"` : ''}
            </span>
            <span className="text-zinc-600">•</span>
            <span>
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleSearchChange('')}
            className="text-amber-400 hover:text-amber-300 font-medium underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* 3. Loading Skeletons or Dynamic Items Grid */}
      {apiLoading && !hasLoadedFromApi ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-full h-72 bg-white/5 rounded-2xl border border-white/10 p-3.5 flex flex-col justify-between animate-pulse"
            >
              <div className="w-full h-32 bg-zinc-800 rounded-xl" />
              <div className="space-y-2">
                <div className="w-3/4 h-5 bg-zinc-800 rounded" />
                <div className="w-1/2 h-3 bg-zinc-800 rounded" />
                <div className="w-1/3 h-4 bg-zinc-800 rounded" />
              </div>
              <div className="w-full h-6 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 px-4 text-center bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Plus className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-white">
            {searchQuery
              ? `No items found matching "${searchQuery}"`
              : activeCategory !== 'All'
              ? `No menu items found in "${activeCategory}" category`
              : 'No menu items in database yet'}
          </p>
          <p className="text-sm text-zinc-400 max-w-sm">
            {searchQuery
              ? 'Try searching with another keyword or clear the search filter.'
              : 'Add your first menu item to populate the database and make it available to guests.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-white font-bold text-sm rounded-xl transition cursor-pointer shadow-lg shadow-yellow-500/20"
            >
              Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onToggleActive={handleToggleActive}
              onEdit={(itm) => setEditingItem(itm)}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      )}

      {/* 4. Add Modal */}
      <AddMenuItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
        categories={categoryOptions}
        defaultRestaurantId={defaultRestaurantId}
        loading={actionLoading}
      />

      {/* 5. Edit Modal */}
      <EditMenuItemModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onUpdateItem={handleUpdateItem}
        categories={categoryOptions}
        loading={actionLoading}
      />
    </div>
  );
}
