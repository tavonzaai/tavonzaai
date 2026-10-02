import { BarOrder } from './types';

export const INITIAL_BAR_ORDERS: BarOrder[] = [
  // Queued (4)
  {
    id: '#10482',
    tableId: 'T-08',
    server: 'Jake R.',
    isRush: true,
    status: 'Queued',
    elapsedSeconds: 134, // 02:14
    createdAt: '1:44 PM',
    items: [
      { name: 'Fresh Lemonade', quantity: 2 },
      { name: 'Sparkling Water', quantity: 1 },
    ],
  },
  {
    id: '#10481',
    tableId: 'T-08',
    server: 'Carlos M.',
    isRush: true,
    status: 'Queued',
    elapsedSeconds: 134,
    createdAt: '1:44 PM',
    items: [
      { name: 'Mango Smoothie', quantity: 1 },
      { name: 'Iced Coffee', quantity: 1, note: 'One with oat milk' },
    ],
  },
  {
    id: '#10483',
    tableId: 'T-08',
    server: 'Maria L.',
    isRush: true,
    status: 'Queued',
    elapsedSeconds: 134,
    createdAt: '1:44 PM',
    items: [
      { name: 'Craft Beer (IPA)', quantity: 1 },
      { name: 'House Red Wine', quantity: 1, note: 'Room temp' },
    ],
  },
  {
    id: '#10484',
    tableId: 'T-08',
    server: 'Jake R.',
    isRush: true,
    status: 'Queued',
    elapsedSeconds: 134,
    createdAt: '1:44 PM',
    items: [
      { name: 'Fresh Lemonade', quantity: 2 },
      { name: 'Sparkling Water', quantity: 1 },
    ],
  },

  // Mixing (3)
  {
    id: '#10478',
    tableId: 'T-08',
    server: 'Jake R.',
    isRush: true,
    status: 'Mixing',
    elapsedSeconds: 134,
    createdAt: '1:38 PM',
    items: [
      { name: 'Craft Beer (IPA)', quantity: 2 },
      { name: 'House Red Wine', quantity: 1, note: 'Room temp' },
    ],
  },
  {
    id: '#10479',
    tableId: 'T-08',
    server: 'Jake R.',
    isRush: true,
    status: 'Mixing',
    elapsedSeconds: 134,
    createdAt: '1:36 PM',
    items: [
      { name: 'Espresso', quantity: 1 },
      { name: 'Fresh Orange Juice', quantity: 1 },
    ],
  },
  {
    id: '#10480',
    tableId: 'T-08',
    server: 'Jake R.',
    isRush: true,
    status: 'Mixing',
    elapsedSeconds: 134,
    createdAt: '1:35 PM',
    items: [
      { name: 'Fresh Lemonade', quantity: 2 },
      { name: 'Sparkling Water', quantity: 1 },
    ],
  },

  // Ready (3)
  {
    id: '#10475',
    tableId: 'T-02',
    server: 'Carlos M.',
    isRush: false,
    status: 'Ready',
    elapsedSeconds: 270,
    createdAt: '1:30 PM',
    items: [
      { name: 'Classic Mojito', quantity: 2 },
      { name: 'Sparkling Water', quantity: 1, note: 'Extra lime' },
    ],
  },
  {
    id: '#10476',
    tableId: 'T-04',
    server: 'Maria L.',
    isRush: false,
    status: 'Ready',
    elapsedSeconds: 310,
    createdAt: '1:28 PM',
    items: [
      { name: 'Old Fashioned', quantity: 1 },
      { name: 'Pinot Noir', quantity: 1 },
    ],
  },
  {
    id: '#10477',
    tableId: 'T-06',
    server: 'Jake R.',
    isRush: false,
    status: 'Ready',
    elapsedSeconds: 365,
    createdAt: '1:25 PM',
    items: [
      { name: 'Iced Matcha Latte', quantity: 2 },
      { name: 'Still Mineral Water', quantity: 1 },
    ],
  },
];
