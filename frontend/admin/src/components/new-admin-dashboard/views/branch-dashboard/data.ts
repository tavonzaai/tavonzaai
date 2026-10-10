import { TableItem, MenuItem, StaffMember } from './types';

// Initial default tables matching Figma designs (Total: 5, Available: 3, Occupied: 1, Capacity: 24)
export const DEFAULT_TABLES: TableItem[] = [
  { id: 'tbl-1', number: 'T-01', capacity: 2, status: 'Available', qrCodeUrl: 'https://tavonza.ai/r/t-01' },
  { id: 'tbl-2', number: 'T-02', capacity: 4, status: 'Occupied', qrCodeUrl: 'https://tavonza.ai/r/t-02' },
  { id: 'tbl-3', number: 'T-03', capacity: 4, status: 'Reserved', qrCodeUrl: 'https://tavonza.ai/r/t-03' },
  { id: 'tbl-4', number: 'T-04', capacity: 6, status: 'Available', qrCodeUrl: 'https://tavonza.ai/r/t-04' },
  { id: 'tbl-5', number: 'T-05', capacity: 8, status: 'Available', qrCodeUrl: 'https://tavonza.ai/r/t-05' },
];

// Initial default menu items matching Figma designs
export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'menu-1', name: 'Grilled Chicken', category: 'Main Course', price: '$12.20', status: 'Active' },
  { id: 'menu-2', name: 'Caesar Salad Supreme', category: 'Starters', price: '$12.20', status: 'Active' },
  { id: 'menu-3', name: 'Mojito Cocktail', category: 'Beverages', price: '$12.20', status: 'Active' },
  { id: 'menu-4', name: 'Chocolate Fondant', category: 'Desserts', price: '$12.20', status: 'Disable' },
  { id: 'menu-5', name: 'Wood-Fired Ribeye', category: 'Main Course', price: '$24.50', status: 'Active' },
  { id: 'menu-6', name: 'Truffle Mushroom Risotto', category: 'Main Course', price: '$18.50', status: 'Active' },
];

// Initial default staff members matching exact Figma Staff snippet
export const DEFAULT_STAFF: StaffMember[] = [
  { id: 'st-1', name: 'Nobin Mille', role: 'Branch Manager', branch: 'Georgia Flagship', status: 'Active', contact: '+1 (555) 234-5678', shift: 'Morning / Evening' },
  { id: 'st-2', name: 'Sara Ahmed', role: 'Waiter', branch: 'Florida Flagship', status: 'Active', contact: '+1 (555) 345-6789', shift: '10:00 – 19:00' },
  { id: 'st-3', name: 'Adil Chowdhury', role: 'Chef', branch: 'Illinois Flagship', status: 'Active', contact: '+1 (555) 456-7890', shift: '08:00 – 17:00' },
  { id: 'st-4', name: 'Maliha Noor', role: 'Cashier', branch: 'Texas Flagship', status: 'Inactive', contact: '+1 (555) 567-8901', shift: '12:00 – 21:00' },
];
