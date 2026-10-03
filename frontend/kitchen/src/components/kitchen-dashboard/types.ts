export interface KitchenOrderItem {
  id: string;
  orderNumber: string;
  table: string;
  items: string;
  priority: 'High' | 'Medium' | 'Normal';
  eta: string;
  status: 'New' | 'Preparing' | 'Quality Check' | 'Ready';
  timePlaced: string;
  station: 'Grill' | 'Fry' | 'Pizza' | 'Dessert' | 'Bar';
}

export interface KitchenStation {
  id: string;
  name: string;
  activeOrders: number;
  status: 'Busy' | 'Normal' | 'Available';
  statusColor: string;
  iconName: string;
}

export interface KitchenInventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  stockStatus: 'Low Stock' | 'Running Low' | 'In Stock';
  color: string;
}

export interface KitchenAlert {
  id: string;
  message: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  time: string;
}

export interface KitchenAIInsight {
  id: string;
  title: string;
  description: string;
  tag: string;
}

export interface KitchenStatCard {
  id: string;
  label: string;
  value: string | number;
  subtext: string;
  description: string;
  type: 'blue' | 'red' | 'green' | 'amber' | 'orange';
  glowShadow: string;
}
