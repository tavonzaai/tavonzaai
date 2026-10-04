export type POSCategory =
  | 'All'
  | 'Burgers'
  | 'Pizza'
  | 'Pasta'
  | 'Salads'
  | 'Desserts'
  | 'Drinks';

export type PaymentMethod = 'card' | 'cash' | 'qr';

export interface POSProduct {
  id: string;
  name: string;
  category: POSCategory;
  categoryLabel: string;
  price: number;
  image: string;
  isHot?: boolean;
  badge?: string;
  emoji?: string;
}

export interface POSCartItem {
  product: POSProduct;
  quantity: number;
}
