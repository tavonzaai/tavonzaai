'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Recipe, RecipeCategory } from '../types';
import { toast } from 'sonner';

export interface NewRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecipe: (recipe: Recipe) => void;
  editingRecipe?: Recipe | null;
}

export default function NewRecipeModal({
  isOpen,
  onClose,
  onSaveRecipe,
  editingRecipe,
}: NewRecipeModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('Burgers');
  const [prepTime, setPrepTime] = useState('12');
  const [servings, setServings] = useState('1');
  const [foodCost, setFoodCost] = useState('4.20');
  const [salePrice, setSalePrice] = useState('18.90');
  const [imageUrl, setImageUrl] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');

  useEffect(() => {
    if (editingRecipe) {
      setName(editingRecipe.name);
      setCategory(editingRecipe.category);
      setPrepTime(editingRecipe.prepTimeMinutes.toString());
      setServings(editingRecipe.servings.toString());
      setFoodCost(editingRecipe.foodCost.toString());
      setSalePrice(editingRecipe.salePrice.toString());
      setImageUrl(editingRecipe.imageUrl);
      setIngredientsText(editingRecipe.ingredients.join('\n'));
    } else {
      setName('');
      setCategory('Burgers');
      setPrepTime('12');
      setServings('1');
      setFoodCost('4.20');
      setSalePrice('18.90');
      setImageUrl(
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
      );
      setIngredientsText('200g Beef Patty\n1 Brioche Bun\nLettuce\nTomato\nPickles\n30ml House Sauce');
    }
  }, [editingRecipe, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a recipe name');
      return;
    }

    const cost = parseFloat(foodCost) || 0;
    const price = parseFloat(salePrice) || 0;
    const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;
    const ingredients = ingredientsText
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);

    const recipeData: Recipe = {
      id: editingRecipe?.id || `REC-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      category,
      stepsCount: editingRecipe?.stepsCount || 6,
      rating: editingRecipe?.rating || 4.8,
      prepTimeMinutes: parseInt(prepTime, 10) || 10,
      servings: parseInt(servings, 10) || 1,
      foodCost: cost,
      salePrice: price,
      marginPercent: margin,
      imageUrl:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      ingredients:
        ingredients.length > 0
          ? ingredients
          : ['200g Fresh Ingredients', 'Seasoning & Sauce'],
      instructions: editingRecipe?.instructions,
    };

    onSaveRecipe(recipeData);
    toast.success(
      editingRecipe
        ? `Recipe "${recipeData.name}" updated!`
        : `Recipe "${recipeData.name}" created!`
    );
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
              {editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
            </h3>
            <p className="text-sm text-zinc-400 font-normal font-['Inter'] mt-1">
              Configure dish ingredients, preparation time, and food cost margins.
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
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar pr-1">
          {/* Recipe Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Recipe Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wagyu Truffle Burger"
              className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white placeholder:text-zinc-600 focus:outline-none transition font-['Inter']"
              autoFocus
            />
          </div>

          {/* Row: Category & Prep Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RecipeCategory)}
                  className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-sm text-white appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="Burgers">Burgers</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Pasta">Pasta</option>
                  <option value="Salads">Salads</option>
                  <option value="Desserts">Desserts</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-4 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Prep Time (mins)
              </label>
              <input
                type="number"
                min="1"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white focus:outline-none font-['Inter']"
              />
            </div>
          </div>

          {/* Row: Servings, Food Cost, Sale Price */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Servings
              </label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white focus:outline-none font-['Inter']"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Food Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={foodCost}
                onChange={(e) => setFoodCost(e.target.value)}
                className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white focus:outline-none font-['Inter']"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
                Sale Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-base text-white focus:outline-none font-['Inter']"
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full h-11 px-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-['Inter']"
            />
          </div>

          {/* Ingredients (One per line) */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 font-['Inter']">
              Ingredients (One per line)
            </label>
            <textarea
              rows={4}
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="200g Beef Patty&#10;1 Brioche Bun&#10;Lettuce..."
              className="w-full p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 focus:border-amber-400 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-['Inter'] resize-none leading-relaxed"
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
              {editingRecipe ? 'Save Changes' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
