'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface CategoryOption {
  id: string;
  name: string;
  restaurantId?: string;
  icon?: string;
}

export interface AddMenuItemFormData {
  name: string;
  categoryId: string;
  sellingPrice: string | number;
  costPrice?: string | number;
  description?: string;
  isVegetarian: boolean;
  imageUrl?: string;
}

export interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (itemData: {
    name: string;
    categoryId?: string;
    restaurantId?: string;
    categoryName: string;
    basePrice: number;
    costPrice?: number;
    description?: string;
    imageUrl?: string;
    isVegetarian?: boolean;
  }) => Promise<void> | void;
  categories?: CategoryOption[];
  defaultRestaurantId?: string;
  loading?: boolean;
}

const DEFAULT_CATEGORIES: CategoryOption[] = [
  { id: 'cat-mains', name: 'Mains', icon: '🥩' },
  { id: 'cat-starters', name: 'Starters & Small Plates', icon: '🥗' },
  { id: 'cat-desserts', name: 'Desserts', icon: '🍰' },
  { id: 'cat-soft-drinks', name: 'Soft Drinks', icon: '🥤' },
  { id: 'cat-cocktails', name: 'Cocktails', icon: '🍸' },
  { id: 'cat-beer-wine', name: 'Beer & Wine', icon: '🍷' },
];

export default function AddMenuItemModal({
  isOpen,
  onClose,
  onAddItem,
  categories = [],
  defaultRestaurantId,
  loading = false,
}: AddMenuItemModalProps) {
  const availableCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  // React Hook Form implementation
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddMenuItemFormData>({
    defaultValues: {
      name: '',
      categoryId: availableCategories[0]?.id || '',
      sellingPrice: '',
      costPrice: '',
      description: '',
      isVegetarian: false,
      imageUrl: '',
    },
  });

  // Ensure default category is set when categories load
  useEffect(() => {
    if (availableCategories.length > 0) {
      setValue('categoryId', availableCategories[0].id);
    }
  }, [availableCategories, setValue]);

  if (!isOpen) return null;

  const onSubmit = async (data: AddMenuItemFormData) => {
    const sell = typeof data.sellingPrice === 'number' ? data.sellingPrice : parseFloat(data.sellingPrice);
    if (isNaN(sell) || sell <= 0) {
      toast.error('Please enter a valid selling price greater than 0');
      return;
    }

    const selectedCat = availableCategories.find((c) => c.id === data.categoryId) || availableCategories[0];
    const restId = selectedCat?.restaurantId || defaultRestaurantId || '';
    const costVal = data.costPrice
      ? typeof data.costPrice === 'number'
        ? data.costPrice
        : parseFloat(data.costPrice)
      : undefined;

    try {
      await onAddItem({
        name: data.name.trim(),
        categoryId: selectedCat?.id,
        restaurantId: restId,
        categoryName: selectedCat?.name || 'Mains',
        basePrice: sell,
        costPrice: costVal || Math.round(sell * 0.35 * 100) / 100,
        description: data.description ? data.description.trim() : '',
        imageUrl: data.imageUrl && data.imageUrl.trim() ? data.imageUrl.trim() : undefined,
        isVegetarian: Boolean(data.isVegetarian),
      });

      reset();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add menu item');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-5 text-white animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight font-['Inter']">
              Add Menu Item
            </h3>
            <p className="text-sm text-zinc-400 font-normal font-['Inter'] mt-1">
              New item will be created in database via backend API and added to your menu.
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

        {/* React Hook Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Item Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Item Name *
            </label>
            <input
              {...register('name', {
                required: 'Please enter an item name',
                minLength: { value: 2, message: 'Item name must be at least 2 characters' },
              })}
              type="text"
              placeholder="e.g. Wagyu Ribeye Steak"
              className={`w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border text-base text-white placeholder:text-zinc-600 focus:outline-none transition font-['Inter'] ${
                errors.name ? 'border-red-500/80 focus:border-red-500' : 'border-zinc-800 focus:border-amber-400'
              }`}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-red-400 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Category Dropdown / Selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Category *
            </label>
            <select
              {...register('categoryId', { required: 'Please select a category' })}
              className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white focus:outline-none transition font-['Inter']"
            >
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-400 font-medium">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Price Fields */}
          <div className="grid grid-cols-2 gap-3">
            {/* Selling Price */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Selling Price ($) *
              </label>
              <input
                {...register('sellingPrice', {
                  required: 'Please enter a selling price',
                  validate: (val) => {
                    const num = typeof val === 'number' ? val : parseFloat(val);
                    return (!isNaN(num) && num > 0) || 'Must be greater than 0';
                  },
                })}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="24.50"
                className={`w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border text-base text-white placeholder:text-zinc-600 focus:outline-none transition font-['Inter'] ${
                  errors.sellingPrice ? 'border-red-500/80 focus:border-red-500' : 'border-zinc-800 focus:border-amber-400'
                }`}
              />
              {errors.sellingPrice && (
                <p className="text-xs text-red-400 font-medium">{errors.sellingPrice.message}</p>
              )}
            </div>

            {/* Cost Price */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Cost Price ($) <span className="text-zinc-500 font-normal">(optional)</span>
              </label>
              <input
                {...register('costPrice')}
                type="number"
                step="0.01"
                min="0"
                placeholder="8.50"
                className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white placeholder:text-zinc-600 focus:outline-none transition font-['Inter']"
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Image URL <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <input
              {...register('imageUrl')}
              type="url"
              placeholder="https://... or leave blank for default photo"
              className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-['Inter']"
            />
          </div>

          {/* Vegetarian Toggle */}
          <div className="flex items-center gap-3 pt-1">
            <input
              {...register('isVegetarian')}
              type="checkbox"
              id="isVegetarian"
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="isVegetarian" className="text-sm font-medium text-zinc-300 cursor-pointer select-none">
              Vegetarian Dish 🌱
            </label>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Description <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Fresh organic ingredients, herbs and chef special garnish..."
              className="w-full p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-['Inter'] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || loading}
              className="py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-xl text-sm font-semibold text-zinc-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 rounded-xl text-sm font-bold text-white shadow-lg shadow-yellow-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding via API...</span>
                </>
              ) : (
                'Add to Menu'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
