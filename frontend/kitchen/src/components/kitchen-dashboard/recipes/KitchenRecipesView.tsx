'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock,
  Zap,
  TrendingUp,
  Star,
  Search,
  Plus,
  Pencil,
  BookOpen,
  ChefHat,
  CheckCircle2,
  X,
  UtensilsCrossed,
  Printer,
  Sparkles,
  Flame,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

export type RecipeCategory = 'All' | 'Mains' | 'Starters' | 'Desserts' | 'Light Bites';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface KitchenRecipe {
  id: string;
  name: string;
  category: 'Mains' | 'Starters' | 'Desserts' | 'Light Bites';
  station: string;
  prepTimeMinutes: number;
  calories: number;
  ordersCount: number;
  rating: number;
  difficulty: Difficulty;
  allergens: string;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  equipmentTemp?: string;
  chefNotes?: string;
  isFeatured?: boolean;
}

export const initialRecipes: KitchenRecipe[] = [
  {
    id: 'rec-1',
    name: 'Classic Beef Burger',
    category: 'Mains',
    station: 'Grill Station',
    prepTimeMinutes: 12,
    calories: 650,
    ordersCount: 312,
    rating: 4.8,
    difficulty: 'Easy',
    allergens: 'Gluten, Dairy',
    equipmentTemp: '450°F (Optimal Searing)',
    chefNotes: 'Toast brioche with clarified butter. Medium-well sear on prime angus beef patty.',
    ingredients: [
      { name: 'Prime Angus Beef Patty', amount: '200g' },
      { name: 'Brioche Bun', amount: '1 pc' },
      { name: 'Aged Cheddar Slice', amount: '2 slices' },
      { name: 'Caramelized Onion Jam', amount: '30g' },
      { name: 'Crisp Butter Lettuce', amount: '20g' },
      { name: 'House Burger Aioli', amount: '25ml' },
    ],
    steps: [
      'Preheat flat-top griddle to 450°F and butter brioche buns.',
      'Sear 200g beef patty for 3.5 minutes on side 1 with sea salt and black pepper crust.',
      'Flip patty, top with 2 slices of aged cheddar, cover with cloche to melt (2.5 mins).',
      'Toast brioche buns on adjacent griddle until golden amber (45 secs).',
      'Assemble: Bottom bun -> Aioli -> Lettuce -> Patty with Melted Cheese -> Onion Jam -> Crown bun.',
    ],
    isFeatured: true,
  },
  {
    id: 'rec-2',
    name: 'Margherita Pizza',
    category: 'Mains',
    station: 'Grill Station',
    prepTimeMinutes: 22,
    calories: 600,
    ordersCount: 302,
    rating: 4.8,
    difficulty: 'Medium',
    allergens: 'Gluten, Dairy',
    equipmentTemp: '520°F (Stone Hearth Deck)',
    chefNotes: 'Fermented 48-hour sourdough base. Hand-crushed San Marzano sauce.',
    ingredients: [
      { name: '48-hr Fermented Dough Ball', amount: '240g' },
      { name: 'San Marzano D.O.P. Sauce', amount: '80g' },
      { name: 'Fior di Latte Mozzarella', amount: '110g' },
      { name: 'Fresh Genovese Basil', amount: '6 leaves' },
      { name: 'Extra Virgin Olive Oil (EVOO)', amount: '15ml' },
      { name: 'Maldon Sea Salt Flakes', amount: 'to taste' },
    ],
    steps: [
      'Hand-stretch sourdough disc to 12 inches on semolina dusting, leaving a 1-inch airy cornicione.',
      'Ladle San Marzano sauce in spiral pattern from center outwards.',
      'Evenly scatter torn Fior di Latte mozzarella pieces.',
      'Slide onto stone deck hearth at 520°F and bake for 3.5 - 4.5 minutes with 180° rotation halfway.',
      'Garnish immediately off heat with fresh basil leaves and a spiral of EVOO.',
    ],
  },
  {
    id: 'rec-3',
    name: 'Chicken Alfredo Pasta',
    category: 'Mains',
    station: 'Grill Station',
    prepTimeMinutes: 12,
    calories: 650,
    ordersCount: 232,
    rating: 4.8,
    difficulty: 'Medium',
    allergens: 'Gluten, Dairy',
    equipmentTemp: 'Medium-High Sauté Burner',
    chefNotes: 'Use bronze-die fettuccine cooked al dente. Emulsify pasta water with cream.',
    ingredients: [
      { name: 'Fresh Egg Fettuccine', amount: '160g' },
      { name: 'Free-Range Chicken Breast Strips', amount: '150g' },
      { name: 'Heavy Whipping Cream', amount: '90ml' },
      { name: 'Parmigiano-Reggiano 24-Mo', amount: '45g' },
      { name: 'Garlic-Infused Butter', amount: '25g' },
      { name: 'Chopped Italian Flat Parsley', amount: '5g' },
    ],
    steps: [
      'Drop fresh fettuccine into boiling salted water for 3 minutes.',
      'In heavy sauté skillet, sear seasoned chicken strips in garlic butter until golden (4 mins).',
      'Pour in heavy cream and 2 fl oz starchy pasta cooking water, bring to gentle simmer.',
      'Add strained pasta directly to pan, toss vigorously while gradually adding Parmigiano.',
      'Swirl until silky emulsion coats noodles. Garnish with cracked black pepper and parsley.',
    ],
  },
  {
    id: 'rec-4',
    name: 'Truffle Ribeye Steak',
    category: 'Mains',
    station: 'Grill Station',
    prepTimeMinutes: 18,
    calories: 780,
    ordersCount: 289,
    rating: 4.9,
    difficulty: 'Medium',
    allergens: 'Dairy',
    equipmentTemp: '550°F Cast Iron Sear',
    chefNotes: 'Bone-in dry-aged ribeye rested 8 minutes before slicing.',
    ingredients: [
      { name: 'Prime Dry-Aged Ribeye', amount: '350g' },
      { name: 'Black Truffle Compound Butter', amount: '30g' },
      { name: 'Fresh Rosemary & Thyme', amount: '2 sprigs' },
      { name: 'Clarified Garlic Butter', amount: '20ml' },
      { name: 'Smoked Maldon Salt', amount: 'Pinch' },
    ],
    steps: [
      'Bring steak to room temperature 15 mins prior to cooking; pat completely dry.',
      'Sear in smoking cast iron with clarified butter 4 minutes per side for medium-rare (130°F).',
      'Baste continuously in final 2 minutes with truffle butter and fresh herb sprigs.',
      'Transfer to warm carving board and rest 8 minutes before carving.',
    ],
  },
  {
    id: 'rec-5',
    name: 'Arancini al Tartufo',
    category: 'Starters',
    station: 'Fry Station',
    prepTimeMinutes: 8,
    calories: 420,
    ordersCount: 195,
    rating: 4.7,
    difficulty: 'Easy',
    allergens: 'Gluten, Dairy',
    equipmentTemp: '375°F Canola Oil Fryer',
    chefNotes: 'Golden crispy exterior with molten truffle mozzarella center.',
    ingredients: [
      { name: 'Chilled Truffle Risotto Balls', amount: '3 pcs (180g)' },
      { name: 'Smoked Scamorza Cheese Core', amount: '45g' },
      { name: 'Panko Breadcrumb Coating', amount: '50g' },
      { name: 'Truffle Garlic Aioli', amount: '35ml' },
      { name: 'Micro Basil & Shaved Truffle', amount: 'Garnish' },
    ],
    steps: [
      'Submerge breaded risotto balls into clean canola oil at 375°F.',
      'Fry for 4 minutes until deep amber golden and center core reaches 150°F.',
      'Drain on wire rack and season with fine sea salt immediately.',
      'Spoon truffle aioli onto slate plate, arrange arancini, finish with shaved black truffle.',
    ],
  },
  {
    id: 'rec-6',
    name: 'Crispy Calamari Fritti',
    category: 'Starters',
    station: 'Fry Station',
    prepTimeMinutes: 10,
    calories: 380,
    ordersCount: 240,
    rating: 4.6,
    difficulty: 'Easy',
    allergens: 'Seafood, Gluten',
    equipmentTemp: '380°F Fryer Deck',
    chefNotes: 'Tender Monterey squid dusted in semolina. Serve blistering hot.',
    ingredients: [
      { name: 'Squid Tubes & Tentacles', amount: '220g' },
      { name: 'Seasoned Semolina Dredge', amount: '70g' },
      { name: 'Smoked Paprika & Sea Salt', amount: '5g' },
      { name: 'Charred Lemon Wedges', amount: '2 pcs' },
      { name: 'Spicy Calabrian Chili Dip', amount: '40ml' },
    ],
    steps: [
      'Soak calamari in buttermilk 5 minutes, shake off excess moisture.',
      'Toss vigorously in semolina dredge until evenly separated and coated.',
      'Flash fry at 380°F for 2.5 minutes until crisp and tender (do not overcook).',
      'Toss with smoked paprika salt and serve with charred lemon and chili dip.',
    ],
  },
  {
    id: 'rec-7',
    name: 'Tiramisu Classico',
    category: 'Desserts',
    station: 'Pastry Station',
    prepTimeMinutes: 5,
    calories: 450,
    ordersCount: 340,
    rating: 4.9,
    difficulty: 'Easy',
    allergens: 'Dairy, Eggs, Gluten',
    equipmentTemp: '38°F Chilled Display',
    chefNotes: 'Traditional Treviso recipe with single-origin espresso and Marsala wine.',
    ingredients: [
      { name: 'Savoiardi Ladyfingers', amount: '4 pcs' },
      { name: 'Espresso & Marsala Dip', amount: '60ml' },
      { name: 'Zabaione Mascarpone Cream', amount: '120g' },
      { name: 'Valrhona Cocoa Powder', amount: '10g' },
      { name: 'Dark Chocolate Shavings', amount: '15g' },
    ],
    steps: [
      'Quick dip savoiardi ladyfingers in cooled espresso-marsala blend (1 second per side).',
      'Layer base in chilled crystal coupe or plate.',
      'Pipe velvety mascarpone zabaione cream over soaked biscuits.',
      'Dust generously with Dutch-process Valrhona cocoa powder and chocolate shavings.',
    ],
  },
  {
    id: 'rec-8',
    name: 'Molten Chocolate Lava Cake',
    category: 'Desserts',
    station: 'Pastry Station',
    prepTimeMinutes: 14,
    calories: 520,
    ordersCount: 215,
    rating: 4.8,
    difficulty: 'Medium',
    allergens: 'Dairy, Gluten, Eggs',
    equipmentTemp: '410°F Convection Oven',
    chefNotes: 'Bake precisely to keep dark chocolate ganache core flowing.',
    ingredients: [
      { name: '70% Dark Chocolate Batter', amount: '1 ramekin' },
      { name: 'Madagascar Vanilla Bean Gelato', amount: '1 scoop (60g)' },
      { name: 'Raspberry Coulis', amount: '25ml' },
      { name: 'Fresh Mint & Powdered Sugar', amount: 'Garnish' },
    ],
    steps: [
      'Bake prepared chocolate ramekin at 410°F convection for 11 minutes flat.',
      'Rest 1.5 minutes, loosen edges gently with small offset palette knife.',
      'Invert onto wide bowl plate, dust with powdered sugar.',
      'Quenelle Madagascar vanilla gelato alongside and drizzle raspberry coulis.',
    ],
  },
  {
    id: 'rec-9',
    name: 'Truffle Parmesan Fries',
    category: 'Light Bites',
    station: 'Fry Station',
    prepTimeMinutes: 6,
    calories: 320,
    ordersCount: 410,
    rating: 4.8,
    difficulty: 'Easy',
    allergens: 'Dairy',
    equipmentTemp: '375°F Dual Fryer',
    chefNotes: 'Double-fried Idaho russet potatoes tossed in white truffle oil.',
    ingredients: [
      { name: 'Hand-Cut Russet Fries', amount: '250g' },
      { name: 'White Truffle Oil', amount: '15ml' },
      { name: 'Grated Parmigiano-Reggiano', amount: '35g' },
      { name: 'Minced Fresh Rosemary', amount: '5g' },
      { name: 'Maldon Flake Salt', amount: '3g' },
    ],
    steps: [
      'Drop pre-blanched fries into 375°F fryer for 3 minutes until glass-crisp.',
      'Transfer directly to stainless mixing bowl.',
      'Drizzle white truffle oil, toss with sea salt, minced rosemary, and Parmigiano.',
      'Serve mounded in greaseproof newsprint cone with roasted garlic aioli.',
    ],
  },
  {
    id: 'rec-10',
    name: 'Bruschetta al Pomodoro',
    category: 'Light Bites',
    station: 'Cold Bar',
    prepTimeMinutes: 7,
    calories: 210,
    ordersCount: 175,
    rating: 4.7,
    difficulty: 'Easy',
    allergens: 'Gluten',
    equipmentTemp: 'Charcoal Hearth Toaster',
    chefNotes: 'Heirloom vine tomatoes marinated with garlic, basil, and aged Modena balsamico.',
    ingredients: [
      { name: 'Grilled Ciabatta Slices', amount: '3 slices' },
      { name: 'Diced Heirloom Tomatoes', amount: '140g' },
      { name: 'Garlic Clove (for rubbing)', amount: '1 clove' },
      { name: 'Torn Sweet Basil', amount: '8 leaves' },
      { name: 'Aged Balsamic Glaze', amount: '15ml' },
    ],
    steps: [
      'Char ciabatta slices over open flame griddle until grill marks form (1 min).',
      'Rub hot toasts vigorously with raw garlic clove.',
      'Top generously with marinated heirloom tomato and basil mixture.',
      'Drizzle with aged balsamic glaze and coarse sea salt flakes.',
    ],
  },
];

export default function KitchenRecipesView() {
  const [recipes, setRecipes] = useState<KitchenRecipe[]>(initialRecipes);
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStationFilter, setActiveStationFilter] = useState<string>('All');

  // Modal states
  const [viewingRecipe, setViewingRecipe] = useState<KitchenRecipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<KitchenRecipe | null>(null);
  const [isNewRecipeModalOpen, setIsNewRecipeModalOpen] = useState(false);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((rec) => {
      // Category check
      if (selectedCategory !== 'All' && rec.category !== selectedCategory) {
        return false;
      }
      // Station check
      if (activeStationFilter !== 'All' && rec.station !== activeStationFilter) {
        return false;
      }
      // Search check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = rec.name.toLowerCase().includes(query);
        const matchesStation = rec.station.toLowerCase().includes(query);
        const matchesAllergens = rec.allergens.toLowerCase().includes(query);
        const matchesIngredients = rec.ingredients.some((i) => i.name.toLowerCase().includes(query));
        return matchesName || matchesStation || matchesAllergens || matchesIngredients;
      }
      return true;
    });
  }, [recipes, selectedCategory, activeStationFilter, searchQuery]);

  // Unique stations for filtering
  const stations = useMemo(() => {
    const list = Array.from(new Set(recipes.map((r) => r.station)));
    return ['All', ...list];
  }, [recipes]);

  // Save edited recipe
  const handleSaveEdit = (updated: KitchenRecipe) => {
    setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditingRecipe(null);
    if (viewingRecipe?.id === updated.id) {
      setViewingRecipe(updated);
    }
    toast.success(`Recipe for "${updated.name}" updated successfully!`);
  };

  // Add new recipe
  const handleAddRecipe = (newRec: Omit<KitchenRecipe, 'id'>) => {
    const created: KitchenRecipe = {
      ...newRec,
      id: `rec-${Date.now()}`,
    };
    setRecipes((prev) => [created, ...prev]);
    setIsNewRecipeModalOpen(false);
    toast.success(`"${created.name}" added to Recipe Library!`);
  };

  // Quick action: Send recipe to Kitchen Queue
  const handleSendToQueue = (recipe: KitchenRecipe) => {
    toast.success(`Preparation ticket for "${recipe.name}" dispatched to ${recipe.station}!`, {
      description: `Estimated prep: ${recipe.prepTimeMinutes} mins. Ticket #QC-${Math.floor(100 + Math.random() * 900)}`,
    });
  };

  // Print recipe
  const handlePrintRecipe = (recipe: KitchenRecipe) => {
    toast.info(`Sending culinary spec sheet for "${recipe.name}" to kitchen thermal printer...`);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER - Exact text & layout from design specification            */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight font-['Inter']">
            Recipe Library
          </h1>
          <p className="text-zinc-500 text-base sm:text-lg font-normal font-['Inter'] mt-1">
            Browse, manage, and update all kitchen recipes and preparation guides.
          </p>
        </div>

        {/* Action Button: Add New Recipe */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewRecipeModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-base rounded-lg transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Add Recipe</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER TABS & SEARCH BAR - Segmented Button Bar & Search Input         */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        {/* Segmented Category Filter */}
        <div className="inline-flex items-center rounded-lg border border-white/20 bg-zinc-900/60 p-0.5 overflow-x-auto max-w-full">
          {(['All', 'Mains', 'Starters', 'Desserts', 'Light Bites'] as RecipeCategory[]).map((cat, idx) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`h-9 px-4 py-2 text-base sm:text-lg font-normal font-['Inter'] transition-all whitespace-nowrap flex items-center justify-center ${
                  isActive
                    ? 'bg-amber-500 text-white font-semibold rounded-md shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                } ${idx > 0 && !isActive ? 'border-l border-white/10' : ''}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right Search Input & Station Filter */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Station Filter Dropdown */}
          <div className="relative">
            <select
              value={activeStationFilter}
              onChange={(e) => setActiveStationFilter(e.target.value)}
              className="h-9 px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 text-sm font-medium text-zinc-300 border border-zinc-700/60 rounded-lg outline-none cursor-pointer appearance-none pr-8 transition-colors"
            >
              {stations.map((st) => (
                <option key={st} value={st} className="bg-zinc-900 text-white">
                  {st === 'All' ? 'All Stations' : st}
                </option>
              ))}
            </select>
            <Filter className="w-3 h-3 text-zinc-500 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Search Box with Magnifying Glass */}
          <div className="relative flex-1 sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full h-9 pl-9 pr-4 bg-zinc-900/90 text-base text-white placeholder-zinc-500 border border-zinc-700/60 rounded-lg focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all font-['Inter']"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RECIPES GRID - Matching the Figma & Screenshot specification          */}
      {/* ========================================================================= */}
      {filteredRecipes.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8">
          <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-xl font-semibold text-white font-['Inter']">No recipes found</h3>
          <p className="text-zinc-500 text-base max-w-sm mx-auto mt-1">
            No culinary specs match your search criteria. Try modifying your filter or clear the search query.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setActiveStationFilter('All');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-amber-400 border border-amber-500/30 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
          {filteredRecipes.map((recipe, index) => {
            const isFirst = index === 0 && selectedCategory === 'All' && !searchQuery;

            return (
              <div
                key={recipe.id}
                className="p-4 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700/70 hover:outline-amber-500/50 transition-all duration-200 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  {/* Title & Station Subtitle */}
                  <div className="flex flex-col justify-start items-start">
                    <div className="h-5 flex items-center overflow-hidden">
                      <h3 className="text-slate-200 text-base font-semibold font-['Inter'] leading-5 group-hover:text-amber-400 transition-colors">
                        {recipe.name}
                      </h3>
                    </div>
                    <div className="h-5 pt-0.5 flex items-center">
                      <p className="text-gray-500 text-sm font-normal font-['Inter'] leading-4">
                        {recipe.category} · {recipe.station}
                      </p>
                    </div>
                  </div>

                  {/* 3 Metric Cards Row (Prep Time, Calories, Orders) */}
                  <div className="pt-3">
                    <div className="grid grid-cols-3 gap-1.5">
                      {/* 1. Prep Time */}
                      <div className="h-14 p-2 bg-neutral-800 rounded-md flex flex-col justify-center items-center">
                        <Clock className="w-2.5 h-2.5 text-gray-500 mb-0.5" />
                        <div className="text-center text-slate-200 text-sm font-bold font-['Consolas'] leading-4">
                          {recipe.prepTimeMinutes} min
                        </div>
                        <div className="text-center text-gray-500 text-[10px] font-normal font-['Inter'] leading-3">
                          Prep Time
                        </div>
                      </div>

                      {/* 2. Calories */}
                      <div className="h-14 p-2 bg-neutral-800 rounded-md flex flex-col justify-center items-center">
                        <Zap className="w-2.5 h-2.5 text-gray-500 mb-0.5" />
                        <div className="text-center text-slate-200 text-sm font-bold font-['Consolas'] leading-4">
                          {recipe.calories}
                        </div>
                        <div className="text-center text-gray-500 text-[10px] font-normal font-['Inter'] leading-3">
                          Calories
                        </div>
                      </div>

                      {/* 3. Orders */}
                      <div className="h-14 p-2 bg-neutral-800 rounded-md flex flex-col justify-center items-center">
                        <TrendingUp className="w-2.5 h-2.5 text-gray-500 mb-0.5" />
                        <div className="text-center text-slate-200 text-sm font-bold font-['Consolas'] leading-4">
                          {recipe.ordersCount}
                        </div>
                        <div className="text-center text-gray-500 text-[10px] font-normal font-['Inter'] leading-3">
                          Orders
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Star Rating & Difficulty Badge Row */}
                  <div className="h-8 pt-3 flex justify-between items-center">
                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-slate-200 text-sm font-bold font-['Consolas'] leading-4">
                        {recipe.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Difficulty Pill */}
                    {recipe.difficulty === 'Easy' ? (
                      <div className="px-2 py-0.5 bg-green-500/20 rounded-sm outline outline-1 outline-offset-[-1px] outline-green-500/30 flex items-center">
                        <span className="text-emerald-500 text-xs font-normal font-['Inter'] leading-4">
                          Easy
                        </span>
                      </div>
                    ) : recipe.difficulty === 'Medium' ? (
                      <div className="px-2 py-0.5 bg-amber-500/20 rounded-sm outline outline-1 outline-offset-[-1px] outline-amber-500/30 flex items-center">
                        <span className="text-yellow-500 text-xs font-normal font-['Inter'] leading-4">
                          Medium
                        </span>
                      </div>
                    ) : (
                      <div className="px-2 py-0.5 bg-rose-500/20 rounded-sm outline outline-1 outline-offset-[-1px] outline-rose-500/30 flex items-center">
                        <span className="text-rose-400 text-xs font-normal font-['Inter'] leading-4">
                          Hard
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Allergens Row */}
                  <div className="pt-2">
                    <span className="text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                      Allergens:
                    </span>
                    <span className="text-gray-400 text-xs font-normal font-['Inter'] leading-4">
                      {' '}{recipe.allergens}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="pt-3 inline-flex justify-start items-start gap-2 w-full">
                  {/* View Button */}
                  <button
                    onClick={() => setViewingRecipe(recipe)}
                    className={`flex-1 py-1.5 rounded-sm outline outline-1 outline-offset-[-1px] flex justify-center items-center gap-1 transition-all ${
                      isFirst
                        ? 'bg-amber-500 hover:bg-amber-400 outline-amber-400 text-white font-medium shadow-sm'
                        : 'bg-neutral-500/20 hover:bg-amber-500/30 outline-neutral-700/30 hover:outline-amber-500/50 text-yellow-500'
                    }`}
                  >
                    <span className={`text-sm font-medium font-['Inter'] leading-4 ${isFirst ? 'text-white' : 'text-yellow-500'}`}>
                      View
                    </span>
                  </button>

                  {/* Edit Pencil Button */}
                  <button
                    onClick={() => setEditingRecipe(recipe)}
                    title="Edit Recipe"
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-sm outline outline-1 outline-offset-[-1px] outline-white/5 flex justify-center items-center text-gray-400 hover:text-white transition-colors"
                  >
                    <Pencil className="w-3 h-3 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: RECIPE DETAIL & PREPARATION SPEC SHEET                          */}
      {/* ========================================================================= */}
      {viewingRecipe && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white font-['Inter'] flex items-center gap-2">
                    {viewingRecipe.name}
                    <span className="text-sm px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium font-sans">
                      {viewingRecipe.category}
                    </span>
                  </h2>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    Assigned: <span className="text-zinc-200 font-medium">{viewingRecipe.station}</span>
                    {viewingRecipe.equipmentTemp && ` • Deck: ${viewingRecipe.equipmentTemp}`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingRecipe(null)}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 text-base text-zinc-300 custom-scrollbar">
              {/* Metric Highlights */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl text-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block">Prep Time</span>
                  <span className="text-lg font-bold font-mono text-amber-400 mt-0.5 block">
                    {viewingRecipe.prepTimeMinutes} min
                  </span>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl text-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block">Calories</span>
                  <span className="text-lg font-bold font-mono text-zinc-200 mt-0.5 block">
                    {viewingRecipe.calories} kcal
                  </span>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl text-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block">Completed</span>
                  <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
                    {viewingRecipe.ordersCount} orders
                  </span>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl text-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block">Skill Level</span>
                  <span className="text-lg font-bold font-mono text-zinc-200 mt-0.5 block">
                    {viewingRecipe.difficulty}
                  </span>
                </div>
              </div>

              {/* Chef Culinary Note */}
              {viewingRecipe.chefNotes && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-amber-300 block">Executive Chef's Guideline:</span>
                    <p className="text-sm text-amber-200/90 mt-0.5">{viewingRecipe.chefNotes}</p>
                  </div>
                </div>
              )}

              {/* Ingredients & Portioning */}
              <div>
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  Portion & Ingredients Checklist
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {viewingRecipe.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg flex items-center justify-between text-sm"
                    >
                      <span className="text-zinc-200">{ing.name}</span>
                      <span className="font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-xs">
                        {ing.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Culinary Preparation */}
              <div>
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-zinc-400" />
                  Preparation & Firing Sequence
                </h4>
                <ol className="space-y-2.5">
                  {viewingRecipe.steps.map((step, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex items-start gap-3 text-sm leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-zinc-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Allergens Notice */}
              <div className="pt-2 text-sm text-zinc-500 border-t border-zinc-800">
                <span className="font-semibold text-zinc-400">Allergen Safety:</span>{' '}
                <span className="text-amber-400/90">{viewingRecipe.allergens}</span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintRecipe(viewingRecipe)}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium rounded-lg border border-zinc-700/60 transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Ticket</span>
                </button>
                <button
                  onClick={() => {
                    setEditingRecipe(viewingRecipe);
                    setViewingRecipe(null);
                  }}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium rounded-lg border border-zinc-700/60 transition-colors flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Recipe</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingRecipe(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleSendToQueue(viewingRecipe);
                    setViewingRecipe(null);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm rounded-lg transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-white" />
                  <span>Fire to Station</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: EDIT RECIPE                                                     */}
      {/* ========================================================================= */}
      {editingRecipe && (
        <EditRecipeModal
          recipe={editingRecipe}
          onClose={() => setEditingRecipe(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: ADD NEW RECIPE                                                  */}
      {/* ========================================================================= */}
      {isNewRecipeModalOpen && (
        <AddRecipeModal
          onClose={() => setIsNewRecipeModalOpen(false)}
          onAdd={handleAddRecipe}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Helper Component: Edit Recipe Modal
// -----------------------------------------------------------------------------
interface EditRecipeModalProps {
  recipe: KitchenRecipe;
  onClose: () => void;
  onSave: (updated: KitchenRecipe) => void;
}

function EditRecipeModal({ recipe, onClose, onSave }: EditRecipeModalProps) {
  const [formData, setFormData] = useState<KitchenRecipe>({ ...recipe });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <h3 className="text-xl font-bold text-white font-['Inter'] flex items-center gap-2">
            <Pencil className="w-4 h-4 text-amber-400" />
            Edit Recipe: {recipe.name}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-sm">
          <div>
            <label className="text-zinc-400 font-medium block mb-1">Recipe Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Mains">Mains</option>
                <option value="Starters">Starters</option>
                <option value="Desserts">Desserts</option>
                <option value="Light Bites">Light Bites</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Station</label>
              <input
                type="text"
                required
                value={formData.station}
                onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Prep Time (min)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.prepTimeMinutes}
                onChange={(e) => setFormData({ ...formData, prepTimeMinutes: parseInt(e.target.value) || 1 })}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Calories</label>
              <input
                type="number"
                min="1"
                required
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 100 })}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-zinc-400 font-medium block mb-1">Allergens</label>
            <input
              type="text"
              value={formData.allergens}
              onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
              placeholder="e.g. Gluten, Dairy, Nuts"
              className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-medium block mb-1">Chef Instructions / Notes</label>
            <textarea
              rows={2}
              value={formData.chefNotes || ''}
              onChange={(e) => setFormData({ ...formData, chefNotes: e.target.value })}
              className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg text-sm transition-all shadow-md shadow-amber-500/20"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Helper Component: Add Recipe Modal
// -----------------------------------------------------------------------------
interface AddRecipeModalProps {
  onClose: () => void;
  onAdd: (recipe: Omit<KitchenRecipe, 'id'>) => void;
}

function AddRecipeModal({ onClose, onAdd }: AddRecipeModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Mains' | 'Starters' | 'Desserts' | 'Light Bites'>('Mains');
  const [station, setStation] = useState('Grill Station');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(15);
  const [calories, setCalories] = useState(550);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [allergens, setAllergens] = useState('Gluten, Dairy');
  const [chefNotes, setChefNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name,
      category,
      station,
      prepTimeMinutes,
      calories,
      ordersCount: 1,
      rating: 5.0,
      difficulty,
      allergens,
      chefNotes,
      equipmentTemp: 'Normal Line Station',
      ingredients: [
        { name: 'Base Prep Ingredient', amount: '150g' },
        { name: 'Seasoning & Butter', amount: '20g' },
      ],
      steps: [
        'Prepare clean station surface and sanitize cutting tools.',
        'Cook ingredients according to standard temperature specifications.',
        'Plate neatly, garnish with fresh herbs, and serve hot.',
      ],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <h3 className="text-xl font-bold text-white font-['Inter'] flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            Add New Recipe
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-sm">
          <div>
            <label className="text-zinc-400 font-medium block mb-1">Dish Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Truffle Pappardelle"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Mains">Mains</option>
                <option value="Starters">Starters</option>
                <option value="Desserts">Desserts</option>
                <option value="Light Bites">Light Bites</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Station</label>
              <select
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Grill Station">Grill Station</option>
                <option value="Pizza Station">Pizza Station</option>
                <option value="Sauté Station">Sauté Station</option>
                <option value="Fry Station">Fry Station</option>
                <option value="Pastry Station">Pastry Station</option>
                <option value="Cold Bar">Cold Bar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Prep Time (min)</label>
              <input
                type="number"
                min="1"
                required
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(parseInt(e.target.value) || 1)}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Calories</label>
              <input
                type="number"
                min="1"
                required
                value={calories}
                onChange={(e) => setCalories(parseInt(e.target.value) || 100)}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-zinc-400 font-medium block mb-1">Allergens</label>
            <input
              type="text"
              value={allergens}
              onChange={(e) => setAllergens(e.target.value)}
              placeholder="e.g. Gluten, Dairy, Shellfish"
              className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-medium block mb-1">Chef Notes</label>
            <textarea
              rows={2}
              value={chefNotes}
              onChange={(e) => setChefNotes(e.target.value)}
              placeholder="Plating techniques, resting guidelines..."
              className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg text-sm transition-all shadow-md shadow-amber-500/20"
            >
              Add Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
