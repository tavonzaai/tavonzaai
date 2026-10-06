export interface OrderFoodItem {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  priceNum: number;
  quantity: number;
  image: string;
  iconType: 'sparkle' | 'cooking' | 'ready';
  selected?: boolean;
}

export type OrderStatus =
  | 'Pending'
  | 'Ready to Serve'
  | 'Cooking'
  | 'Served'
  | 'New Add On'
  | 'Customer Calling';

export interface OrderItemData {
  id: string; // e.g. "Oder No #1230"
  orderNumber: string; // "1230"
  realId?: string; // UUID from backend
  table: string; // "T1", "T2", ...
  status: OrderStatus;
  time: string; // "10:24"
  targetTime: string; // "Target 12min"
  items: OrderFoodItem[];
  subtotal: string;
  serviceCharge: string;
  tax: string;
  totalAmount: string; // "$193.20"
  specialInstructions?: string;
  hasAddonRequest?: boolean;
  addonData?: {
    table: string;
    orderId: string;
    status: string;
    time: string;
    targetTime: string;
    items: OrderFoodItem[];
    totalAmount: string;
  };
}

export const INITIAL_ORDERS: OrderItemData[] = [];
