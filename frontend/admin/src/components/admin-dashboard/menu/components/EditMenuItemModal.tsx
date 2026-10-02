'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { MenuItem } from '../types';
import { toast } from 'sonner';

export interface CategoryOption {
  id: string;
  name: string;
  restaurantId?: string;
}

export interface EditMenuItemFormData {
  name: string;
  categoryId: string;
  sellingPrice: string | number;
  costPrice?: string | number;
  description?: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  imageUrl?: string;
}

export interface EditMenuItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateItem: (updatedData: {
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
  }) => Promise<void> | void;
  categories?: CategoryOption[];
  loading?: boolean;
}

const DEFAULT_CATEGORIES: CategoryOption[] = [
  { id: 'cat-mains', name: 'Mains' },
  { id: 'cat-starters', name: 'Starters & Small Plates' },
  { id: 'cat-desserts', name: 'Desserts' },
  { id: 'cat-soft-drinks', name: 'Soft Drinks' },
  { id: 'cat-cocktails', name: 'Cocktails' },
  { id: 'cat-beer-wine', name: 'Beer & Wine' },
];

export default function EditMenuItemModal({
  item,
  isOpen,
  onClose,
  onUpdateItem,
  categories = [],
  loading = false,
}: EditMenuItemModalProps) {
  const availableCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  // React Hook Form implementation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditMenuItemFormData>();

  // Synchronize form values whenever the edited item changes
  useEffect(() => {
    if (item) {
      const matchedCat = availableCategories.find(
        (c) => c.id === item.categoryId || c.name.toLowerCase() === item.category.toLowerCase()
      );
      const resolvedCatId = matchedCat?.id || (availableCategories[0] ? availableCategories[0].id : '');

      reset({
        name: item.name || '',
        categoryId: resolvedCatId,
        sellingPrice: item.price !== undefined ? item.price : '',
        costPrice: item.costPrice !== undefined ? item.costPrice : '',
        description: item.description || '',
        isAvailable: item.isActive !== false,
        isVegetarian: Boolean(item.isVegetarian),
        imageUrl: item.image || '',
      });
    }
  }, [item, availableCategories, reset]);

  if (!isOpen || !item) return null;

  const onSubmit = async (data: EditMenuItemFormData) => {
    const sell = typeof data.sellingPrice === 'number' ? data.sellingPrice : parseFloat(data.sellingPrice);
    if (isNaN(sell) || sell <= 0) {
      toast.error('Please enter a valid price greater than 0');
      return;
    }

    const selectedCat = availableCategories.find((c) => c.id === data.categoryId) || availableCategories[0];
    const costVal = data.costPrice
      ? typeof data.costPrice === 'number'
        ? data.costPrice
        : parseFloat(data.costPrice)
      : undefined;

    try {
      await onUpdateItem({
        id: item.id,
        name: data.name.trim(),
        categoryId: selectedCat?.id,
        categoryName: selectedCat?.name || item.category,
        basePrice: sell,
        costPrice: costVal || item.costPrice || Math.round(sell * 0.35 * 100) / 100,
        description: data.description ? data.description.trim() : '',
        isAvailable: Boolean(data.isAvailable),
        isVegetarian: Boolean(data.isVegetarian),
        imageUrl: data.imageUrl && data.imageUrl.trim() ? data.imageUrl.trim() : undefined,
      });

      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update menu item');
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
              Edit Menu Item
            </h3>
            <p className="text-sm text-zinc-400 font-normal font-['Inter'] mt-1">
              Update pricing, category, availability or recipe details.
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
              className={`w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border text-base text-white placeholder:text-zinc-600 focus:outline-none transition font-['Inter'] ${
                errors.name ? 'border-red-500/80 focus:border-red-500' : 'border-zinc-800 focus:border-amber-400'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-400 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Category Selector */}
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
                Cost Price ($)
              </label>
              <input
                {...register('costPrice')}
                type="number"
                step="0.01"
                min="0"
                className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white placeholder:text-zinc-600 focus:outline-none transition font-['Inter']"
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Image URL
            </label>
            <input
              {...register('imageUrl')}
              type="url"
              placeholder="https://..."
              className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-['Inter']"
            />
          </div>

          {/* Availability and Vegetarian row */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 cursor-pointer hover:bg-zinc-800/60 transition">
              <input
                {...register('isAvailable')}
                type="checkbox"
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-zinc-200">Active (Visible)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 cursor-pointer hover:bg-zinc-800/60 transition">
              <input
                {...register('isVegetarian')}
                type="checkbox"
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-zinc-200">Vegetarian 🌱</span>
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
              placeholder="Describe the dish for guests..."
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
                  <span>Saving via API...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
