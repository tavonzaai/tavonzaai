'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Recipe } from '../types';

export interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <div
      onClick={() => onClick(recipe)}
      className="w-full h-72 relative bg-white/5 rounded-[10px] border border-white/15 hover:border-zinc-500 backdrop-blur-[10.20px] p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-md group hover:bg-white/[0.07]"
    >
      {/* 1. Dish Image */}
      <div className="w-full h-32 relative bg-neutral-900 rounded-[10px] overflow-hidden">
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* 2. Title, Category/Steps, and Rating */}
      <div className="space-y-0.5 pt-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-white text-lg font-semibold font-['Inter'] leading-6 truncate">
            {recipe.name}
          </h3>

          {/* Rating */}
          <div className="inline-flex items-center gap-1 shrink-0">
            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
            <span className="text-amber-500 text-sm font-medium font-['Inter'] leading-4">
              {recipe.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <p className="text-gray-400 text-xs font-normal font-['Inter'] leading-4">
          {recipe.category} · {recipe.stepsCount} steps
        </p>
      </div>

      {/* 3. Three Metric Glass Boxes (Time, Cost, Margin) */}
      <div className="grid grid-cols-3 gap-2 pt-0.5">
        {/* Time */}
        <div className="h-10 py-1 px-1 bg-white/5 rounded-[5px] border border-white/10 backdrop-blur-xl flex flex-col justify-center items-center">
          <div className="text-center text-slate-500 text-xs font-medium font-['Inter'] leading-4">
            Time
          </div>
          <div className="text-center text-white text-sm font-bold font-['Inter'] leading-4">
            {recipe.prepTimeMinutes}m
          </div>
        </div>

        {/* Cost */}
        <div className="h-10 py-1 px-1 bg-white/5 rounded-[5px] border border-white/10 backdrop-blur-xl flex flex-col justify-center items-center">
          <div className="text-center text-slate-500 text-xs font-medium font-['Inter'] leading-4">
            Cost
          </div>
          <div className="text-center text-indigo-400 text-sm font-bold font-['Inter'] leading-4">
            ${recipe.foodCost.toFixed(2)}
          </div>
        </div>

        {/* Margin */}
        <div className="h-10 py-1 px-1 bg-white/5 rounded-[5px] border border-white/10 backdrop-blur-xl flex flex-col justify-center items-center">
          <div className="text-center text-slate-500 text-xs font-medium font-['Inter'] leading-4">
            Margin
          </div>
          <div className="text-center text-green-500 text-sm font-bold font-['Inter'] leading-4">
            {recipe.marginPercent}%
          </div>
        </div>
      </div>
    </div>
  );
}
