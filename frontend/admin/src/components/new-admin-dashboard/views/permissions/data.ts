import {
  LayoutDashboard,
  UtensilsCrossed,
  Building2,
  Grid,
  BookOpen,
  Users,
  CreditCard,
  FileText,
  Settings,
} from 'lucide-react';
import { RoleDefinition, PermissionCategory } from './types';

export const INITIAL_ROLES: RoleDefinition[] = [
  { id: 'admin', name: 'Admin', staffCount: 1, isLocked: true },
  { id: 'manager', name: 'Manager', staffCount: 2 },
  { id: 'waiter', name: 'Waiter', staffCount: 4 },
  { id: 'chef', name: 'Chef', staffCount: 6 },
  { id: 'cashier', name: 'Cashier', staffCount: 8 },
];

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    permissions: [
      { id: 'dash_view', label: 'View Dashboard', category: 'dashboard' },
      { id: 'dash_analytics', label: 'View Analytics Summary', category: 'dashboard' },
    ],
  },
  {
    id: 'restaurants',
    title: 'Restaurants',
    icon: UtensilsCrossed,
    permissions: [
      { id: 'rest_view', label: 'View Restaurants', category: 'restaurants' },
      { id: 'rest_create', label: 'Create Restaurant', category: 'restaurants' },
      { id: 'rest_edit', label: 'Edit Restaurant', category: 'restaurants' },
      { id: 'rest_delete', label: 'Delete Restaurant', category: 'restaurants' },
    ],
  },
  {
    id: 'branches',
    title: 'Branches',
    icon: Building2,
    permissions: [
      { id: 'branch_view', label: 'View Branches', category: 'branches' },
      { id: 'branch_create', label: 'Create Branch', category: 'branches' },
      { id: 'branch_edit', label: 'Edit Branch', category: 'branches' },
      { id: 'branch_config', label: 'Manage Configuration', category: 'branches' },
    ],
  },
  {
    id: 'tables',
    title: 'Tables',
    icon: Grid,
    permissions: [
      { id: 'table_view', label: 'View Tables', category: 'tables' },
      { id: 'table_manage', label: 'Add, Edit & Delete Tables', category: 'tables' },
    ],
  },
  {
    id: 'menu',
    title: 'Menu',
    icon: BookOpen,
    permissions: [
      { id: 'menu_view', label: 'View Menu', category: 'menu' },
      { id: 'menu_cats', label: 'Manage Categories', category: 'menu' },
      { id: 'menu_items', label: 'Manage Menu Items', category: 'menu' },
      { id: 'menu_delete', label: 'Disable or Delete Items', category: 'menu' },
    ],
  },
  {
    id: 'staff',
    title: 'Staff',
    icon: Users,
    permissions: [
      { id: 'staff_view', label: 'View Staff', category: 'staff' },
      { id: 'staff_invite', label: 'Invite Staff', category: 'staff' },
      { id: 'staff_role', label: 'Change Staff Role', category: 'staff' },
      { id: 'staff_deactivate', label: 'Deactivate Staff', category: 'staff' },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: CreditCard,
    permissions: [
      { id: 'pay_view', label: 'View Payments', category: 'payments' },
      { id: 'pay_config', label: 'Configure Payments', category: 'payments' },
      { id: 'pay_refund', label: 'Process Refunds', category: 'payments' },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: FileText,
    permissions: [
      { id: 'rep_view', label: 'View Reports', category: 'reports' },
      { id: 'rep_export', label: 'Export Reports', category: 'reports' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    permissions: [
      { id: 'set_view', label: 'View Settings', category: 'settings' },
      { id: 'set_edit', label: 'Edit Organization', category: 'settings' },
    ],
  },
];

// All permission IDs flattened (27 total)
export const ALL_PERMISSION_IDS = PERMISSION_CATEGORIES.flatMap((c) => c.permissions.map((p) => p.id));
export const TOTAL_PERMISSIONS_COUNT = ALL_PERMISSION_IDS.length; // 27

// Initial granted permissions mapping per role (matching exact values: Admin 27/27, Manager 25/27, Waiter 5/27, Chef 4/27, Cashier 5/27)
export const INITIAL_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [...ALL_PERMISSION_IDS],
  manager: [
    'dash_view',
    'dash_analytics',
    'rest_view',
    'rest_create',
    'rest_edit',
    'branch_view',
    'branch_create',
    'branch_edit',
    'branch_config',
    'table_view',
    'table_manage',
    'menu_view',
    'menu_cats',
    'menu_items',
    'menu_delete',
    'staff_view',
    'staff_invite',
    'staff_role',
    'staff_deactivate',
    'pay_view',
    'pay_config',
    'pay_refund',
    'rep_view',
    'rep_export',
    'set_view',
  ],
  waiter: [
    'dash_view',
    'rest_view',
    'branch_view',
    'table_view',
    'menu_view',
  ],
  chef: [
    'dash_view',
    'branch_view',
    'menu_view',
    'menu_items',
  ],
  cashier: [
    'dash_view',
    'branch_view',
    'menu_view',
    'pay_view',
    'pay_refund',
  ],
};
