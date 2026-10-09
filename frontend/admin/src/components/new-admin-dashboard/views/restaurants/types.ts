export interface RestaurantFormData {
  name: string;
  manager: string;
  contactNumber: string;
  email: string;
  address: string;
  status: 'Active' | 'Setup' | 'Closed';
  description: string;
}
