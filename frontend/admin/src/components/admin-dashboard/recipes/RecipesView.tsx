'use client';

import React, { useState, useMemo } from 'react';
import {
  RecipesHeader,
  RecipesFilters,
  RecipeCard,
  RecipeDetailModal,
  NewRecipeModal,
  AskAIModal,
} from './components';
import { INITIAL_RECIPES } from './recipesData';
import { Recipe, RecipeCategory } from './types';

export default function RecipesView() {
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [activeCategory, setActiveCategory] = useState<RecipeCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewRecipeModalOpen, setIsNewRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const categories: RecipeCategory[] = [
    'All',
    'Burgers',
    'Pizza',
    'Pasta',
    'Salads',
    'Desserts',
  ];

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchesCat =
        activeCategory === 'All' || r.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query) ||
        r.ingredients.some((ing) => ing.toLowerCase().includes(query));
      return matchesCat && matchesSearch;
    });
  }, [recipes, activeCategory, searchQuery]);

  // Card click -> open detail modal
  const handleCardClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailModalOpen(true);
  };

  // Edit from detail modal
  const handleStartEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsNewRecipeModalOpen(true);
  };

  // Create / Save recipe
  const handleSaveRecipe = (savedRecipe: Recipe) => {
    setRecipes((prev) => {
      const exists = prev.some((r) => r.id === savedRecipe.id);
      if (exists) {
        return prev.map((r) => (r.id === savedRecipe.id ? savedRecipe : r));
      }
      return [savedRecipe, ...prev];
    });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Header with New Recipe & Ask AI buttons */}
      <RecipesHeader
        onOpenNewRecipeModal={() => {
          setEditingRecipe(null);
          setIsNewRecipeModalOpen(true);
        }}
        onOpenAIModal={() => setIsAIModalOpen(true)}
      />

      {/* 2. Search & Category Filters Bar */}
      <RecipesFilters
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 3. 4-Column Recipe Cards Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-base">No recipes found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}

      {/* 4. Recipe Detail Modal (Screenshot match) */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRecipe(null);
        }}
        onEditRecipe={handleStartEdit}
      />

      {/* 5. Create / Edit Recipe Modal */}
      <NewRecipeModal
        isOpen={isNewRecipeModalOpen}
        onClose={() => {
          setIsNewRecipeModalOpen(false);
          setEditingRecipe(null);
        }}
        onSaveRecipe={handleSaveRecipe}
        editingRecipe={editingRecipe}
      />

      {/* 6. Tavonza Recipe Intelligence AI Modal */}
      <AskAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
}
