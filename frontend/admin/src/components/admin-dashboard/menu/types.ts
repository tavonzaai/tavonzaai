export type MenuCategory = string;

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  categoryLabel?: string;
  categoryId?: string;
  restaurantId?: string;
  price: number;
  costPrice?: number;
  marginPercent: number;
  soldToday: number;
  isActive: boolean;
  isVegetarian?: boolean;
  spiceLevel?: number | null;
  image: string;
  description?: string;
}

export interface MenuStats {
  totalItems: number;
  activeItems: number;
  hiddenItems: number;
  totalRevenue: string;
  avgMargin: number;
}
