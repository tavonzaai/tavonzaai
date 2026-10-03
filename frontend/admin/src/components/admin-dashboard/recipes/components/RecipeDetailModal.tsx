'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Recipe } from '../types';

export interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onEditRecipe: (recipe: Recipe) => void;
}

export default function RecipeDetailModal({
  recipe,
  isOpen,
  onClose,
  onEditRecipe,
}: RecipeDetailModalProps) {
  if (!isOpen || !recipe) return null;

  const format2Digits = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#121214]/95 border border-white/20 rounded-2xl backdrop-blur-2xl p-6 shadow-2xl space-y-4 text-white relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white border border-white/10 transition cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Dish Image */}
        <div className="w-full h-48 relative rounded-xl overflow-hidden shadow-md">
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 2. Title & Subtitle */}
        <div className="space-y-0.5">
          <h2 className="text-white text-2xl font-bold font-['Inter'] leading-6 tracking-tight">
            {recipe.name}
          </h2>
          <p className="text-gray-400 text-sm font-normal font-['Inter']">
            {recipe.category} · {recipe.stepsCount} steps
          </p>
        </div>

        {/* 3. 4-Box Metrics Grid (Prep Time, Servings, Food Cost, Sale Price) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Prep Time */}
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-[30px] flex flex-col justify-center">
            <span className="text-zinc-500 text-sm font-normal font-['Inter'] leading-4">
              Prep Time
            </span>
            <span className="text-white text-sm font-semibold font-['Inter'] leading-4 mt-0.5">
              {recipe.prepTimeMinutes} min
            </span>
          </div>

          {/* Servings */}
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-[30px] flex flex-col justify-center">
            <span className="text-zinc-500 text-sm font-normal font-['Inter'] leading-4">
              Servings
            </span>
            <span className="text-white text-sm font-semibold font-['Inter'] leading-4 mt-0.5">
              {format2Digits(recipe.servings)}
            </span>
          </div>

          {/* Food Cost */}
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-[30px] flex flex-col justify-center">
            <span className="text-zinc-500 text-sm font-normal font-['Inter'] leading-4">
              Food Cost
            </span>
            <span className="text-white text-sm font-semibold font-['Inter'] leading-4 mt-0.5">
              ${recipe.foodCost.toFixed(2)}
            </span>
          </div>

          {/* Sale Price */}
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-[30px] flex flex-col justify-center">
            <span className="text-zinc-500 text-sm font-normal font-['Inter'] leading-4">
              Sale Price
            </span>
            <span className="text-white text-sm font-semibold font-['Inter'] leading-4 mt-0.5">
              ${recipe.salePrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 4. Ingredients List */}
        <div className="space-y-2">
          <h4 className="text-white text-lg font-semibold font-['Inter'] leading-4">
            Ingredients
          </h4>
          <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar pt-1">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="size-1.5 bg-yellow-500 rounded-full shrink-0" />
                <span className="text-slate-400 text-sm font-normal font-['Inter'] leading-4">
                  {ing}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Edit Recipe CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEditRecipe(recipe);
            }}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.99] rounded-[10px] text-center text-white text-sm font-bold font-['Inter'] transition cursor-pointer shadow-lg shadow-yellow-500/20"
          >
            Edit Recipe
          </button>
        </div>
      </div>
    </div>
  );
}
