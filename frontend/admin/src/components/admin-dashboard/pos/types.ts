export type POSCategory =
  | 'All'
  | 'Burgers'
  | 'Pizza'
  | 'Pasta'
  | 'Salads'
  | 'Desserts'
  | 'Drinks';

export type PaymentMethod = 'Card' | 'Cash' | 'Mobile';

export interface POSProduct {
  id: string;
  name: string;
  category: POSCategory | string;
  categoryLabel: string;
  price: number;
  image: string;
  isHot?: boolean;
  badge?: string;
  description?: string;
}

export interface POSCartItem {
  product: POSProduct;
  quantity: number;
  notes?: string;
}

export interface POSTransaction {
  id: string;
  table: string;
  items: POSCartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  timestamp: string;
}
