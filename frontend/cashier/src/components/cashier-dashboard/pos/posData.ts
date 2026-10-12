import { POSProduct, POSCategory, POSCartItem } from './types';

export const POS_CATEGORIES: POSCategory[] = [
  'All',
  'Burgers',
  'Pizza',
  'Pasta',
  'Salads',
  'Desserts',
  'Drinks',
];

export const POS_TABLES: string[] = [
  'T-01', 'T-02', 'T-03', 'T-04', 'T-05',
  'T-06', 'T-07', 'T-08', 'T-09', 'T-10',
  'T-11', 'T-12', 'T-13', 'T-14', 'T-15',
  'Bar-01', 'Bar-02', 'VIP-01', 'Patio-01'
];

export const POS_PRODUCTS: POSProduct[] = [];

export const INITIAL_CART_ITEMS: POSCartItem[] = [];
