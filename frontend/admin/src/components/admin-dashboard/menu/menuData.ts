import { MenuItem } from './types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [];

export function getFallbackImageByCategory(cat: string = ''): string {
  const c = cat.toLowerCase();
  if (c.includes('starter') || c.includes('appetizer')) {
    return 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80';
  }
  if (c.includes('main') || c.includes('steak') || c.includes('grill') || c.includes('meat')) {
    return '/assets/costomerpages/ribeye-steak-butter.png';
  }
  if (c.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80';
  }
  if (c.includes('burger')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80';
  }
  if (c.includes('dessert') || c.includes('sweet') || c.includes('pancake')) {
    return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80';
  }
  if (c.includes('cocktail') || c.includes('drink') || c.includes('wine') || c.includes('beer') || c.includes('beverage')) {
    return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80';
  }
  return '/assets/costomerpages/steak-rating-card.png';
}

export function mapBackendToMenuItem(backendItem: any): MenuItem {
  const categoryName = backendItem.category?.name || 'Mains';
  const defaultImage = getFallbackImageByCategory(categoryName);
  const price = typeof backendItem.basePrice === 'number' ? backendItem.basePrice : Number(backendItem.basePrice) || 0;
  const cost = Math.round(price * 0.34 * 100) / 100;
  const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 66;

  return {
    id: backendItem.id,
    name: backendItem.name,
    category: categoryName,
    categoryLabel: categoryName,
    categoryId: backendItem.categoryId,
    restaurantId: backendItem.restaurantId,
    price: price,
    costPrice: cost,
    marginPercent: margin,
    soldToday: 0,
    isActive: backendItem.isAvailable !== false,
    isVegetarian: backendItem.isVegetarian || false,
    spiceLevel: backendItem.spiceLevel,
    image: backendItem.imageUrl || defaultImage,
    description: backendItem.description || '',
  };
}
