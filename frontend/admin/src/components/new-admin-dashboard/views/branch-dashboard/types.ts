export type SubTab = 'Overview' | 'Tables' | 'Menu' | 'Staff';

export interface TableItem {
  id: string;
  number: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
  qrCodeUrl: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
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
  address: string;
  contactNumber: string;
  manager: string;
  status: 'Active' | 'Setup' | 'Closed';
  openingTime: string;
  closingTime: string;
}

export interface TableFormData {
  number: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
}

export interface MenuFormData {
  name: string;
  category: string;
  price: string;
  status: 'Active' | 'Disable';
}

export interface StaffInviteFormData {
  name: string;
  role: string;
  branch: string;
}

export interface StaffEditFormData {
  name: string;
  role: string;
  branch: string;
  status: 'Active' | 'Inactive';
}
