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

export const INITIAL_ORDERS: OrderItemData[] = [
  {
    id: 'Oder No #1230',
    orderNumber: '1230',
    table: 'T1',
    status: 'Pending',
    time: '10:24',
    targetTime: 'Target 12min',
    subtotal: '$28.30',
    serviceCharge: '$0.93',
    tax: '$1.48',
    totalAmount: '$193.20',
    specialInstructions: 'Add any special requests for your food, such as less spicy, no onions, extra sauce, or less salt.',
    items: [
      {
        id: 'item-1',
        name: 'Potato Corn Burger',
        subtitle: 'With Sauce',
        price: '$168.00',
        priceNum: 168.0,
        quantity: 4,
        image: '/images/burger.jpg',
        iconType: 'sparkle',
        selected: true,
      },
      {
        id: 'item-2',
        name: 'Potato Corn Burger',
        subtitle: 'With Sauce',
        price: '$168.00',
        priceNum: 168.0,
        quantity: 4,
        image: '/images/burger.jpg',
        iconType: 'sparkle',
        selected: false,
      },
    ],
  },
  {
    id: 'Oder No #1230',
    orderNumber: '1230',
    table: 'T2',
    status: 'Ready to Serve',
    time: '10:24',
    targetTime: 'Target 12min',
    subtotal: '$28.30',
    serviceCharge: '$0.93',
    tax: '$1.48',
    totalAmount: '$193.20',
    specialInstructions: 'Add any special requests for your food, such as less spicy, no onions, extra sauce, or less salt.',
    items: [
      {
        id: 'item-3',
        name: 'Potato Corn Burger',
        subtitle: 'With Sauce',
        price: '$168.00',
        priceNum: 168.0,
        quantity: 4,
        image: '/images/burger.jpg',
        iconType: 'sparkle',
        selected: true,
      },
      {
        id: 'item-4',
        name: 'Potato Corn Burger',
        subtitle: 'With Sauce',
        price: '$168.00',
        priceNum: 168.0,
        quantity: 4,
        image: '/images/burger.jpg',
        iconType: 'sparkle',
        selected: true,
      },
    ],
  },
  {
    id: 'Oder No #1230',
    orderNumber: '1230',
    table: 'T3',
    status: 'Cooking',
    time: '10:24',
    targetTime: 'Target 12min',
    subtotal: '$28.30',
    serviceCharge: '$0.93',
    tax: '$1.48',
    totalAmount: '$193.20',
    specialInstructions: 'Add any special requests for your food, such as less spicy, no onions, extra sauce, or less salt.',
    items: [
      {
        id: 'item-5',
        name: 'Potato Corn Burger',
        subtitle: 'With Sauce',
        price: '$168.00',
        priceNum: 168.0,
        quantity: 4,
        image: '/images/burger.jpg',
        iconType: 'cooking',
        selected: false,
      },
      {
        id: 'item-6',
        name: 'Potato Corn Burger',
        subtitle: 'With Sauce',
        price: '$168.00',
        priceNum: 168.0,
        quantity: 4,
        image: '/images/burger.jpg',
        iconType: 'ready',
        selected: true,
      },
    ],
  },
  {
    id: 'Oder No #1230',
    orderNumber: '1230',
    table: 'T4',
    status: 'Served',
    time: '10:24',
    targetTime: 'Target 12min',
    subtotal: '$28.30',
    serviceCharge: '$0.93',
    tax: '$1.48',
    totalAmount: '$193.20',
    specialInstructions: 'Add any special requests for your food, such as less spicy, no onions, extra sauce, or less salt.',
    items: [
      {
        id: 'item-7',
        name: 'Potato Corn Burger',
        subtitle: 'With Sauce',
        price: '$168.00',
        priceNum: 168.0,
        quantity: 4,
        image: '/images/burger.jpg',
        iconType: 'ready',
        selected: true,
      },
      {
        id: 'item-8',
        name: 'Potato Corn Burger',
        subtitle: 'With Sauce',
        price: '$168.00',
        priceNum: 168.0,
        quantity: 4,
        image: '/images/burger.jpg',
        iconType: 'ready',
        selected: true,
      },
    ],
  },
  {
    id: 'Oder No #1230',
    orderNumber: '1230',
    table: 'T5',
    status: 'New Add On',
    time: '10:24',
    targetTime: 'Target 12min',
    subtotal: '$28.30',
    serviceCharge: '$0.93',
    tax: '$1.48',
    totalAmount: '$193.20',
    specialInstructions: 'Add any special requests for your food, such as less spicy, no onions, extra sauce, or less salt.',
    items: [
      {
        id: 'item-9',
        name: 'Potato Corn Burger',
        subtitle: 'With Sauce',
        price: '$168.00',
        priceNum: 168.0,
        quantity: 4,
        image: '/images/burger.jpg',
        iconType: 'cooking',
        selected: false,
      },
      {
        id: 'item-10',
        name: 'Potato Corn Burger',
        subtitle: 'With Sauce',
        price: '$168.00',
        priceNum: 168.0,
        quantity: 4,
        image: '/images/burger.jpg',
        iconType: 'cooking',
        selected: false,
      },
    ],
  },
  {
    id: 'Oder No #1230',
    orderNumber: '1230',
    table: 'T6',
    status: 'Customer Calling',
    time: '10:24',
    targetTime: 'Target 12min',
    subtotal: '$28.30',
    serviceCharge: '$0.93',
    tax: '$1.48',
    totalAmount: '$193.20',
    specialInstructions: 'Customer requested immediate assistance regarding cutlery and drinks refill.',
    items: [
      {
        id: 'item-11',
        name: 'Potato Corn Burger',
        subtitle: 'With Sauce',
        price: '$168.00',
        priceNum: 168.0,
        quantity: 4,
        image: '/images/burger.jpg',
        iconType: 'cooking',
        selected: true,
      },
      {
        id: 'item-12',
        name: 'Potato Corn Burger',
        subtitle: 'With Sauce',
        price: '$168.00',
        priceNum: 168.0,
        quantity: 4,
        image: '/images/burger.jpg',
        iconType: 'cooking',
        selected: true,
      },
    ],
  },
];
