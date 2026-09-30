/**
 * Utility functions for rendering categories and menu items
 */

export function getCategoryIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('all')) return '🍽️';
  if (lower.includes('burger')) return '🍔';
  if (lower.includes('dessert') || lower.includes('sweet')) return '🍰';
  if (lower.includes('soft') || lower.includes('drink') || lower.includes('tea') || lower.includes('water')) return '🥤';
  if (lower.includes('cocktail')) return '🍸';
  if (lower.includes('beer') || lower.includes('wine')) return '🍷';
  if (lower.includes('starter') || lower.includes('arancini') || lower.includes('salad') || lower.includes('pepper')) return '🥗';
  if (lower.includes('main') || lower.includes('meat') || lower.includes('steak') || lower.includes('lamb') || lower.includes('chicken')) return '🥩';
  if (lower.includes('pizza') || lower.includes('flatbread')) return '🍕';
  if (lower.includes('seafood') || lower.includes('fish') || lower.includes('calamari')) return '🐟';
  return '🍽️';
}

export function getItemImage(name: string, categoryName = '', imageUrl?: string | null): string {
  if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/'))) {
    return imageUrl;
  }
  const n = name.toLowerCase();
  const c = categoryName.toLowerCase();

  if (n.includes('burger')) return '/images/burger.jpg';
  if (n.includes('sea bass') || n.includes('fish') || n.includes('calamari')) return '/images/seabass.jpg';
  if (c.includes('cocktail') || c.includes('wine') || c.includes('beer') || n.includes('drink') || n.includes('cocktail')) return '/images/slide2.jpg';
  if (c.includes('dessert') || n.includes('cheesecake') || n.includes('sorbet') || n.includes('fondant')) return '/images/slide3.jpg';
  if (n.includes('butter chicken') || n.includes('kofta') || n.includes('risotto') || n.includes('pizza') || n.includes('flatbread')) return '/images/slide1.jpg';
  return '/images/burger.jpg';
}
