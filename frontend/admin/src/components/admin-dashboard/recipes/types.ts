export type RecipeCategory =
  | 'All'
  | 'Burgers'
  | 'Pizza'
  | 'Pasta'
  | 'Salads'
  | 'Desserts';

export interface RecipeIngredient {
  name: string;
  amount?: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  stepsCount: number;
  rating: number;
  prepTimeMinutes: number; // e.g. 12m
  servings: number; // e.g. 1
  foodCost: number; // e.g. 4.20
  salePrice: number; // e.g. 18.90
  marginPercent: number; // e.g. 77%
  imageUrl: string;
  ingredients: string[];
  instructions?: string[];
}
