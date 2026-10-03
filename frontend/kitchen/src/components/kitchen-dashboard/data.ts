import {
  KitchenOrderItem,
  KitchenStation,
  KitchenInventoryItem,
  KitchenAlert,
  KitchenAIInsight,
  KitchenStatCard
} from './types';

export const mockKitchenOrders: KitchenOrderItem[] = [
  {
    id: 'k-1',
    orderNumber: '#20581',
    table: 'T-08',
    items: 'Burger ×2 · Fries',
    priority: 'High',
    eta: '3 min',
    status: 'Preparing',
    timePlaced: '10:24 AM',
    station: 'Grill'
  },
  {
    id: 'k-2',
    orderNumber: '#20582',
    table: 'T-08',
    items: 'Chicken Pizza',
    priority: 'Medium',
    eta: '3 min',
    status: 'Preparing',
    timePlaced: '10:25 AM',
    station: 'Pizza'
  },
  {
    id: 'k-3',
    orderNumber: '#20583',
    table: 'T-08',
    items: 'Alfredo Pasta ×2',
    priority: 'Normal',
    eta: '3 min',
    status: 'Quality Check',
    timePlaced: '10:20 AM',
    station: 'Fry'
  },
  {
    id: 'k-4',
    orderNumber: '#20584',
    table: 'Bar Counter',
    items: 'Burger Combo',
    priority: 'High',
    eta: '3 min',
    status: 'Preparing',
    timePlaced: '10:27 AM',
    station: 'Grill'
  },
  {
    id: 'k-5',
    orderNumber: '#20585',
    table: 'T-04',
    items: 'T-Bone Steak Med-Rare · Asparagus',
    priority: 'High',
    eta: '6 min',
    status: 'New',
    timePlaced: '10:30 AM',
    station: 'Grill'
  },
  {
    id: 'k-6',
    orderNumber: '#20586',
    table: 'T-12',
    items: 'Truffle Mac & Cheese · Onion Rings',
    priority: 'Normal',
    eta: '8 min',
    status: 'New',
    timePlaced: '10:31 AM',
    station: 'Fry'
  }
];

export const mockKitchenStations: KitchenStation[] = [
  {
    id: 'st-1',
    name: 'Grill Station',
    activeOrders: 8,
    status: 'Busy',
    statusColor: 'text-red-400',
    iconName: 'Flame'
  },
  {
    id: 'st-2',
    name: 'Fry Station',
    activeOrders: 4,
    status: 'Normal',
    statusColor: 'text-yellow-500',
    iconName: 'CookingPot'
  },
  {
    id: 'st-3',
    name: 'Pizza Station',
    activeOrders: 3,
    status: 'Available',
    statusColor: 'text-emerald-500',
    iconName: 'Pizza'
  },
  {
    id: 'st-4',
    name: 'Dessert Station',
    activeOrders: 3,
    status: 'Available',
    statusColor: 'text-emerald-500',
    iconName: 'Cake'
  }
];

export const mockKitchenInventory: KitchenInventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Mozzarella Cheese',
    category: 'Dairy',
    quantity: '2.4 kg remaining',
    stockStatus: 'Low Stock',
    color: 'bg-red-500'
  },
  {
    id: 'inv-2',
    name: 'Chicken Breast',
    category: 'Meat & Poultry',
    quantity: '18.5 kg in cooler',
    stockStatus: 'In Stock',
    color: 'bg-emerald-500'
  },
  {
    id: 'inv-3',
    name: 'Burger Buns',
    category: 'Bakery',
    quantity: '14 packs (running low)',
    stockStatus: 'Running Low',
    color: 'bg-yellow-500'
  },
  {
    id: 'inv-4',
    name: 'French Fries (Frozen)',
    category: 'Frozen',
    quantity: '45.0 kg in freezer',
    stockStatus: 'In Stock',
    color: 'bg-emerald-500'
  },
  {
    id: 'inv-5',
    name: 'Olive Oil',
    category: 'Pantry',
    quantity: '12 Liters in stock',
    stockStatus: 'In Stock',
    color: 'bg-emerald-500'
  }
];

export const mockAIInsights: KitchenAIInsight[] = [
  {
    id: 'ins-1',
    title: 'Workload Optimization',
    description: 'Grill Station is overloaded. Move two burger orders to Fry Station to balance throughput.',
    tag: 'Flow'
  },
  {
    id: 'ins-2',
    title: 'Preparation Alert',
    description: 'Order #10582 must be completed within 3 minutes to meet the target preparation time.',
    tag: 'Urgent'
  },
  {
    id: 'ins-3',
    title: 'Demand Prediction',
    description: 'Burger demand is expected to increase by 18% during dinner. Prepare additional patties and buns now.',
    tag: 'Forecast'
  },
  {
    id: 'ins-4',
    title: 'Inventory Notice',
    description: 'Mozzarella cheese inventory is below the recommended threshold. Restock before 5:00 PM.',
    tag: 'Stock'
  }
];

export const mockLiveKitchenAlerts: KitchenAlert[] = [
  {
    id: 'alt-1',
    message: 'Order #10582 is close to exceeding the target preparation time.',
    type: 'urgent',
    time: 'Just now'
  },
  {
    id: 'alt-2',
    message: 'Grill Station is operating above normal capacity.',
    type: 'warning',
    time: '2m ago'
  },
  {
    id: 'alt-3',
    message: 'Cheese stock has reached the reorder threshold.',
    type: 'warning',
    time: '6m ago'
  },
  {
    id: 'alt-4',
    message: 'Fry Station is available for additional workload.',
    type: 'success',
    time: '11m ago'
  }
];

export const mockKitchenStatCards: KitchenStatCard[] = [
  {
    id: 'stat-1',
    label: 'Active Orders',
    value: 24,
    subtext: 'Currently Preparing',
    description: 'Orders actively in progress across stations',
    type: 'blue',
    glowShadow: 'shadow-[0px_0px_6px_0px_rgba(81,162,255,0.70)]'
  },
  {
    id: 'stat-2',
    label: 'High Priority',
    value: 6,
    subtext: 'Immediate Attention',
    description: 'VIP guests or nearing ticket timer limit',
    type: 'red',
    glowShadow: 'shadow-[0px_0px_6px_0px_rgba(251,44,54,0.70)]'
  },
  {
    id: 'stat-3',
    label: 'Completed Today',
    value: 186,
    subtext: 'Orders Completed',
    description: 'Dispatched successfully to floor staff',
    type: 'green',
    glowShadow: 'shadow-[0px_0px_6px_0px_rgba(0,201,80,0.70)]'
  },
  {
    id: 'stat-4',
    label: 'Avg Prep Time',
    value: '13 min',
    subtext: 'Current Average',
    description: 'Ticket placement to pickup',
    type: 'amber',
    glowShadow: 'shadow-[0px_0px_6px_0px_rgba(245,158,11,0.70)]'
  },
  {
    id: 'stat-5',
    label: 'Efficiency',
    value: '93%',
    subtext: 'Performance Score',
    description: 'Station synchronization index',
    type: 'orange',
    glowShadow: 'shadow-[0px_0px_6px_0px_rgba(249,115,22,0.70)]'
  },
  {
    id: 'stat-6',
    label: 'Delayed Orders',
    value: 3,
    subtext: 'Need Attention',
    description: 'Orders past standard SLA window',
    type: 'red',
    glowShadow: 'shadow-[0px_0px_6px_0px_rgba(251,44,54,0.70)]'
  }
];

export const mockKitchenChecklist = [
  { id: 'chk-1', text: 'Prioritize Order #10582', completed: false },
  { id: 'chk-2', text: 'Reassign 2 burger orders to Fry Station', completed: false },
  { id: 'chk-3', text: 'Prepare additional burger buns', completed: false },
  { id: 'chk-4', text: 'Restock mozzarella before dinner service', completed: false },
];
