import { KitchenOrder } from './types';

export const INITIAL_KDS_ORDERS: KitchenOrder[] = [
  // New Orders (4)
  {
    id: '#10482',
    tableId: 'T-08',
    server: 'Jake R.',
    isRush: true,
    status: 'New Orders',
    elapsedSeconds: 134, // 02:14
    createdAt: '1:42 PM',
    items: [
      { name: 'Classic Burger', quantity: 2 },
      { name: 'Caesar Salad', quantity: 1, note: 'No croutons' },
      { name: 'Alfredo Pasta', quantity: 1 },
    ],
  },
  {
    id: '#10481',
    tableId: 'T-08',
    server: 'Maria L.',
    isRush: true,
    status: 'New Orders',
    elapsedSeconds: 134,
    createdAt: '1:42 PM',
    items: [
      { name: 'Chicken Pizza', quantity: 1 },
      { name: 'Greek Salad', quantity: 1, note: 'No croutons' },
      { name: 'BBQ Bacon Burger', quantity: 1 },
    ],
  },
  {
    id: '#10483',
    tableId: 'T-08',
    server: 'Jake R.',
    isRush: true,
    status: 'New Orders',
    elapsedSeconds: 134,
    createdAt: '1:42 PM',
    items: [
      { name: 'BBQ Bacon Burger', quantity: 2 },
      { name: 'Mushroom Swiss Burger', quantity: 1 },
      { name: 'Tiramisu', quantity: 1 },
    ],
  },
  {
    id: '#10484',
    tableId: 'T-08',
    server: 'Jake R.',
    isRush: true,
    status: 'New Orders',
    elapsedSeconds: 134,
    createdAt: '1:42 PM',
    items: [
      { name: 'Classic Burger', quantity: 2 },
      { name: 'BBQ Chicken Pizza', quantity: 1 },
      { name: 'Caesar Salad', quantity: 1, note: 'No croutons' },
    ],
  },

  // In Progress (3)
  {
    id: '#10478',
    tableId: 'T-08',
    server: 'Jake R.',
    isRush: false,
    status: 'In Progress',
    elapsedSeconds: 134,
    createdAt: '1:35 PM',
    items: [
      { name: 'Classic Burger', quantity: 2 },
      { name: 'Caesar Salad', quantity: 1, note: 'No croutons' },
      { name: 'Alfredo Pasta', quantity: 1 },
    ],
  },
  {
    id: '#10479',
    tableId: 'T-08',
    server: 'Jake R.',
    isRush: false,
    status: 'In Progress',
    elapsedSeconds: 134,
    createdAt: '1:32 PM',
    items: [
      { name: 'Spaghetti Bolognese', quantity: 2 },
      { name: 'Garlic Bread', quantity: 1, note: 'Well Done' },
      { name: 'Alfredo Pasta', quantity: 1 },
    ],
  },
  {
    id: '#10480',
    tableId: 'T-08',
    server: 'Jake R.',
    isRush: false,
    status: 'In Progress',
    elapsedSeconds: 134,
    createdAt: '1:30 PM',
    items: [
      { name: 'Classic Burger', quantity: 2 },
      { name: 'Caesar Salad', quantity: 1, note: 'No croutons' },
      { name: 'Alfredo Pasta', quantity: 1 },
    ],
  },

  // Ready To Serve (2)
  {
    id: '#10476',
    tableId: 'T-08',
    server: 'Jake R.',
    isRush: false,
    status: 'Ready To Serve',
    elapsedSeconds: 134,
    createdAt: '1:24 PM',
    items: [
      { name: 'Classic Burger', quantity: 2 },
      { name: 'Caesar Salad', quantity: 1, note: 'No croutons' },
      { name: 'Alfredo Pasta', quantity: 1 },
    ],
  },
  {
    id: '#10477',
    tableId: 'T-08',
    server: 'Jake R.',
    isRush: false,
    status: 'Ready To Serve',
    elapsedSeconds: 134,
    createdAt: '1:20 PM',
    items: [
      { name: 'Chicken Pizza', quantity: 2 },
      { name: 'Greek Salad', quantity: 1, note: 'No croutons' },
      { name: 'Alfredo Pasta', quantity: 1 },
    ],
  },
];
