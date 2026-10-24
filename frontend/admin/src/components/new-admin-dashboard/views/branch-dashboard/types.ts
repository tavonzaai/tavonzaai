export type SubTab = 'Overview' | 'Tables' | 'Menu' | 'Staff';

export interface TableItem {
  id: string;
  number: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
  qrCodeUrl: string;
  qrCodeToken?: string | null;
  qrJoinUrl?: string | null;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string | null;
  itemCount?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  price: string;
  status: 'Active' | 'Disable';
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  branch: string;
  status: 'Active' | 'Inactive';
  contact?: string;
  shift?: string;
}

export interface BranchFormData {
  restaurantId: string;
  restaurantName: string;
  name: string;
  street?: string;
  city?: string;
  country?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  timezone?: string;
  manager: string;
  managerId?: string;
  status: 'Active' | 'Setup' | 'Closed';
  openingTime: string;
  closingTime: string;
  address?: string;
  contactNumber?: string;
}

export interface TableFormData {
  number: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
}

export interface MenuFormData {
  name: string;
  category: string;
  categoryId?: string;
  price: string;
  status: 'Active' | 'Disable';
}

export interface StaffInviteFormData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  branch: string;
}

export interface StaffEditFormData {
  name: string;
  role: string;
  branch: string;
  status: 'Active' | 'Inactive';
}
