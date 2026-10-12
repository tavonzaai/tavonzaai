export interface MenuItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  category: string;
  image: string;
  popular?: boolean;
  rating?: number;
  reviewsCount?: number;
  dietary?: string;
  contains?: string;
  winePairing?: {
    wine: string;
    description: string;
  };
  prepTime?: string;
  calories?: string;
  description?: string;
  addOns?: { id: string; name: string; price: number }[];
}

export const MENU_CATEGORIES: { id: string; name: string; icon: string }[] = [];

export const MENU_ITEMS: MenuItem[] = [];
