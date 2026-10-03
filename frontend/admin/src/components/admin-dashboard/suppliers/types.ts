export type SupplierCategory =
  | 'All'
  | 'Produce'
  | 'Dairy'
  | 'Seafood'
  | 'Meat'
  | 'Dry Goods'
  | 'Beverages';

export type SupplierStatus = 'Active' | 'Inactive';

export interface SupplierHistoryOrder {
  id: string; // 'ORD-8821'
  date: string; // 'Jul 12, 2025'
  itemsCount: number; // 8
  totalAmount: number; // 1240
  status: 'Delivered' | 'Pending' | 'In Transit';
}

export interface SupplierProductItem {
  name: string;
  defaultQty: number;
  unitPrice: number;
}

export interface Supplier {
  id: string;
  name: string; // 'Fresh Farm Co.'
  contactPerson: string; // 'Mark Stevens'
  category: SupplierCategory;
  phone: string; // '+1 555-2201'
  email: string; // 'mark@freshfarm.com'
  location: string; // 'California, USA'
  reliabilityPercent: number; // 98
  lastOrder: string; // '2 days ago'
  nextDelivery: string; // 'Tomorrow'
  productsCount: number; // 24
  status: SupplierStatus; // 'Active'
  products?: SupplierProductItem[];
  orderHistory?: SupplierHistoryOrder[];
}

export interface SupplierKPIs {
  activeSuppliersCount: number;
  totalProductsCount: number;
  avgReliability: number;
  deliveriesThisWeekCount: number;
}
