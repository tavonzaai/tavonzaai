export interface BranchFormData {
  restaurantId: string;
  restaurantName: string;
  name: string;
  street: string;
  city: string;
  country: string;
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
