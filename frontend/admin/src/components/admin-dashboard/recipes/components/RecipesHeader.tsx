'use client';

import React from 'react';
import { Plus, Sparkles } from 'lucide-react';

export interface RecipesHeaderProps {
  onOpenNewRecipeModal: () => void;
  onOpenAIModal: () => void;
}

export default function RecipesHeader({
  onOpenNewRecipeModal,
  onOpenAIModal,
}: RecipesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9 tracking-tight">
          Recipes
        </h1>
        <p className="text-zinc-500 text-lg font-normal font-['Inter'] leading-6 mt-0.5">
          Manage recipes, ingredients, and food costs.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        {/* Ask Tavonza AI CTA */}
        <button
          type="button"
          onClick={onOpenAIModal}
          className="h-10 px-3.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 active:scale-[0.99] rounded-[10px] shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition text-white text-sm font-semibold font-['Inter'] cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Ask Tavonza AI</span>
        </button>

        {/* New Recipe CTA */}
        <button
          type="button"
          onClick={onOpenNewRecipeModal}
          className="h-10 px-4 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.99] rounded-[10px] shadow-lg shadow-yellow-500/20 flex items-center gap-1.5 transition text-white text-sm font-semibold font-['Inter'] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Recipe</span>
        </button>
      </div>
    </div>
  );
}
