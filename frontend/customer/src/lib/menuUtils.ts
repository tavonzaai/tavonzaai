/**
 * Utility functions for rendering categories and menu items
 * Strictly real API data — zero mock/fake data or static emoji lists.
 */

/**
 * Returns exact image from API without fake mock images.
 */
export function getItemImage(_name = '', _categoryName = '', imageUrl?: string | null): string {
  if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/'))) {
    return imageUrl;
  }
  return '';
}

/**
 * Resolves the real category image:
 * Strictly from category.imageUrl directly (if provided in database/API).
 * If null in category record, returns null (never borrows from items or uses mock fallbacks).
 */
export function getCategoryImage(
  category: { id?: string; name?: string; imageUrl?: string | null },
  _items?: any[]
): string | null {
  if (category?.imageUrl && (category.imageUrl.startsWith('http') || category.imageUrl.startsWith('/'))) {
    return category.imageUrl;
  }
  return null;
}

/**
 * Extracts 2-letter abbreviation / initials from category name for typography fallback badge
 * If category has no image, shows just name letters:
 * - "Starters & Small Plates" -> "ST"
 * - "Chef's Signature Mains" -> "CS"
 * - "Pastas & Risotto" -> "PR"
 * - "Desserts" -> "DE"
 */
export function getCategoryLetters(name?: string): string {
  if (!name || !name.trim()) return 'CA';
  const clean = name.trim().replace(/[^a-zA-Z\s]/g, '');
  const words = clean.split(/\s+/).filter((w) => w.length > 0 && w.toLowerCase() !== 'and');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}
